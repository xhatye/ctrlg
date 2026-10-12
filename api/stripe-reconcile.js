import { randomUUID } from "node:crypto";
import { services, authenticated, fail } from "../lib/admin.mjs";
import { normalizeEmail, syncSession } from "../lib/billing.mjs";
import { hasPro } from "../lib/ai-access.mjs";
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const deps = services(),
      user = await authenticated(req, deps.auth);
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const current = deps.db.collection("users").doc(user.uid);
    await deps.db.runTransaction(async (tx) => {
      const doc = await tx.get(current);
      if (Date.now() - (doc.data()?.billingRecoveryAt || 0) < 15000)
        throw Object.assign(
          new Error("Patientez quelques secondes avant de réessayer."),
          { status: 429 },
        );
      tx.set(current, { billingRecoveryAt: Date.now() }, { merge: true });
    });
    const now = Math.floor(Date.now() / 1000);
    if (body.sessionId) {
      if (!/^cs_[A-Za-z0-9_]+$/.test(body.sessionId))
        throw Object.assign(new Error("Référence invalide."), { status: 400 });
      await syncSession(
        deps,
        body.sessionId,
        `recovery_${randomUUID()}`,
        now,
        user.uid,
      );
    } else {
      if (!user.email_verified)
        throw Object.assign(
          new Error(
            "Vérifiez votre adresse email pour rechercher un ancien achat.",
          ),
          { status: 403 },
        );
      const email = normalizeEmail(user.email)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
      const customers = await deps.stripe.customers
        .search({ query: `email:'${email}'`, limit: 100 })
        .autoPagingToArray({ limit: 100 });
      for (const customer of customers) {
        if (normalizeEmail(customer.email) !== normalizeEmail(user.email))
          continue;
        const sessions = await deps.stripe.checkout.sessions
          .list({ customer: customer.id, limit: 100 })
          .autoPagingToArray({ limit: 500 });
        for (const session of sessions)
          await syncSession(
            deps,
            session.id,
            `recovery_${randomUUID()}`,
            now,
            user.uid,
          );
      }
    }
    const saved = await current.get();
    const active = hasPro(saved.data());
    return res
      .status(200)
      .json({
        isPro: active,
        message: active
          ? "Votre accès Pro est actif."
          : "Aucun accès Pro actif retrouvé. Contactez le support si vous avez payé.",
      });
  } catch (error) {
    return fail(res, error);
  }
}
