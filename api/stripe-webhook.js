import Stripe from "stripe";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { credential } from "firebase-admin";

if (!getApps().length) {
  initializeApp({
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

export const config = { runtime: "nodejs" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = await stripe.webhooks.constructEventAsync(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.payment_succeeded") {
    const email = event.data.object.customer_email || event.data.object.customer_details?.email;
    if (email) {
      const snap = await db.collection("users").where("email", "==", email).limit(1).get();
      if (!snap.empty) {
        await snap.docs[0].ref.update({ isPro: true });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}