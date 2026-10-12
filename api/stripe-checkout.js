import { services, authenticated, fail } from "../lib/admin.mjs";
import { catalog } from "../lib/billing.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const deps = services(),
      user = await authenticated(req, deps.auth);
    const { plan } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    if (!["subscription", "pack_examen"].includes(plan))
      throw Object.assign(new Error("Offre invalide."), { status: 400 });
    const prices = await catalog(deps.stripe),
      origin = new URL(process.env.SIMDCG_SITE_URL || "https://simdcg.com")
        .origin;
    if (!origin.startsWith("https://"))
      throw new Error("HTTPS site configuration required");
    const metadata = { app: "simdcg", firebaseUid: user.uid, plan };
    const profile = await deps.db.collection("users").doc(user.uid).get();
    if (
      plan === "subscription" &&
      profile.data()?.simdcgBilling &&
      Object.values(profile.data().simdcgBilling.subscriptions || {}).some(
        (sub) => sub.active,
      )
    )
      throw Object.assign(new Error("Votre abonnement est déjà actif."), {
        status: 409,
      });
    const session = await deps.stripe.checkout.sessions.create(
      {
        mode: plan === "subscription" ? "subscription" : "payment",
        line_items: [{ price: prices[plan], quantity: 1 }],
        client_reference_id: user.uid,
        customer_email: user.email,
        metadata,
        locale: "fr",
        ...(plan === "subscription"
          ? { subscription_data: { metadata } }
          : { payment_intent_data: { metadata }, customer_creation: "always" }),
        success_url: `${origin}/compte?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/tarifs?payment=cancelled`,
      },
      {
        idempotencyKey: `simdcg_${user.uid}_${plan}_${Math.floor(Date.now() / 60000)}`,
      },
    );
    return res.status(200).json({ url: session.url });
  } catch (error) {
    return fail(res, error);
  }
}
