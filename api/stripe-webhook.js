// api/stripe-webhook.js
// runtime: nodejs (required for firebase-admin)

import Stripe from "stripe";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const config = { runtime: "nodejs" };

// ── Firebase Admin init ────────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── Helper: find Firestore user by email ───────────────────────────────────────
async function findUserByEmail(email) {
  const snap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ── Main handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  // Verify Stripe signature
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── Handle checkout.session.completed ─────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;
    const mode = session.mode; // "payment" (one-time) or "subscription"

    if (!email) {
      console.error("No email found in session");
      return res.status(200).json({ received: true });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      console.error(`No user found for email: ${email}`);
      return res.status(200).json({ received: true });
    }

    const ref = db.collection("users").doc(user.id);

    if (mode === "payment") {
      // ── Pack Examen: one-time payment → 90 days access ──────────────────────
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // exactly 90 days

      await ref.update({
        isPro: true,
        proType: "pack_examen",
        proExpiresAt: expiresAt.toISOString(),
        proActivatedAt: new Date().toISOString(),
      });
      console.log(`Pack Examen activated for ${email} until ${expiresAt.toISOString()}`);

    } else if (mode === "subscription") {
      // ── Pro mensuel: subscription → no expiry (managed by subscription events)
      await ref.update({
        isPro: true,
        proType: "subscription",
        proExpiresAt: null,
        proActivatedAt: new Date().toISOString(),
      });
      console.log(`Pro subscription activated for ${email}`);
    }
  }

  // ── Handle subscription cancellation / end ────────────────────────────────────
  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.paused"
  ) {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    // Retrieve customer email from Stripe
    try {
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;
      if (email) {
        const user = await findUserByEmail(email);
        if (user) {
          await db.collection("users").doc(user.id).update({
            isPro: false,
            proType: null,
            proExpiresAt: null,
          });
          console.log(`Pro subscription cancelled for ${email}`);
        }
      }
    } catch (err) {
      console.error("Error handling subscription cancellation:", err.message);
    }
  }

  return res.status(200).json({ received: true });
}

// ── Raw body reader (needed for Stripe signature verification) ─────────────────
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}
