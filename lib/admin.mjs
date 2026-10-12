import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";
export function firebaseServices() {
  for (const key of [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ])
    if (!process.env[key]) throw new Error(`Missing configuration: ${key}`);
  if (!getApps().length)
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  return {
    db: getFirestore(),
    auth: getAuth(),
  };
}
export function services() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing configuration: STRIPE_SECRET_KEY');
  return {...firebaseServices(), stripe:new Stripe(process.env.STRIPE_SECRET_KEY)};
}
export async function authenticated(req, auth) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token)
    throw Object.assign(new Error("Connexion requise."), { status: 401 });
  try {
    return await auth.verifyIdToken(token, true);
  } catch {
    throw Object.assign(new Error("Session expirée. Reconnectez-vous."), {
      status: 401,
    });
  }
}
export function fail(res, error) {
  console.error(
    "SIMDCG request failed",
    error.code || error.status || "server_error",
  );
  return res
    .status(error.status || 503)
    .json({
      error: error.status
        ? error.message
        : "Service temporairement indisponible. Réessayez.",
    });
}
