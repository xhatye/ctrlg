import Stripe from "stripe";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const config = { runtime: "nodejs" };

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db     = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Returns a Buffer — required by Stripe signature verification
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function findUserByEmail(email) {
  const snap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const { type, data } = event;

  if (type === "checkout.session.completed") {
    const session = data.object;
    const email   = session.customer_details?.email || session.customer_email;
    const mode    = session.mode;

    if (!email) return res.status(200).json({ received: true });

    const user = await findUserByEmail(email);
    if (!user) {
      console.error(`No Firestore user for email: ${email}`);
      return res.status(200).json({ received: true });
    }

    const ref = db.collection("users").doc(user.id);

    if (mode === "payment") {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);
      await ref.update({
        isPro:          true,
        proType:        "pack_examen",
        proExpiresAt:   expiresAt.toISOString(),
        proActivatedAt: new Date().toISOString(),
      });
      console.log(`Pack Examen activated for ${email}`);
    } else if (mode === "subscription") {
      await ref.update({
        isPro:          true,
        proType:        "subscription",
        proExpiresAt:   null,
        proActivatedAt: new Date().toISOString(),
      });
      console.log(`Pro subscription activated for ${email}`);
    }
  }

  if (type === "invoice.paid") {
    const invoice = data.object;
    if (invoice.subscription) {
      const email = invoice.customer_email;
      if (email) {
        const user = await findUserByEmail(email);
        if (user) {
          await db.collection("users").doc(user.id).update({ isPro: true, proExpiresAt: null });
          console.log(`Subscription renewed for ${email}`);
        }
      }
    }
  }

  if (
    type === "customer.subscription.deleted" ||
    type === "customer.subscription.paused"  ||
    type === "invoice.payment_failed"
  ) {
    const obj        = data.object;
    const customerId = obj.customer;
    try {
      const customer = await stripe.customers.retrieve(customerId);
      const email    = customer.email;
      if (email) {
        const user = await findUserByEmail(email);
        if (user) {
          await db.collection("users").doc(user.id).update({
            isPro:        false,
            proType:      null,
            proExpiresAt: null,
          });
          console.log(`Pro cancelled for ${email}`);
        }
      }
    } catch (err) {
      console.error("Error handling cancellation:", err.message);
    }
  }

  return res.status(200).json({ received: true });
}
