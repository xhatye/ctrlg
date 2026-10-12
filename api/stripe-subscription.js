import { services, authenticated, fail } from "../lib/admin.mjs";
import { catalog, planForItems } from "../lib/billing.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const deps = services(),
      user = await authenticated(req, deps.auth);
    const profile = await deps.db.collection("users").doc(user.uid).get();
    const own = Object.values(
      profile.data()?.simdcgBilling?.subscriptions || {},
    ).filter((sub) => sub.active);
    if (!own.length)
      throw Object.assign(
        new Error("Vérifiez d’abord votre accès avec « J’ai déjà payé »."),
        { status: 409 },
      );
    const prices = await catalog(deps.stripe);
    for (const saved of own) {
      const sub = await deps.stripe.subscriptions.retrieve(saved.id);
      if (planForItems(sub.items.data, prices) !== "subscription")
        throw new Error("Subscription scope mismatch");
      await deps.stripe.subscriptions.update(sub.id, {
        cancel_at_period_end: true,
      });
    }
    return res
      .status(200)
      .json({
        message:
          "Renouvellement arrêté. Votre accès reste actif jusqu’à la fin de la période payée.",
      });
  } catch (error) {
    return fail(res, error);
  }
}
