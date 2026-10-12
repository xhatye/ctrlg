export const PAYMENT_LINKS = {
  subscription: "https://buy.stripe.com/3cI4gz9FpbrWfYJ4JH6wE02",
  pack_examen: "https://buy.stripe.com/28E6oH9Fp2Vq27Tfol6wE03",
};
export const normalizeEmail = (value) => (value || "").trim().toLowerCase();
export const objectId = (value) =>
  typeof value === "string" ? value : value?.id;
export const invoiceSubscription = (obj) =>
  objectId(obj.subscription || obj.parent?.subscription_details?.subscription);
export const subscriptionActive = (sub) =>
  ["active", "trialing"].includes(sub.status);
export async function catalog(stripe) {
  const plans = {};
  const ids = {
    subscription: process.env.STRIPE_SIMDCG_MONTHLY_PRICE_ID,
    pack_examen: process.env.STRIPE_SIMDCG_PACK_PRICE_ID,
  };
  let links;
  for (const plan of Object.keys(PAYMENT_LINKS)) {
    let price;
    if (ids[plan]) price = await stripe.prices.retrieve(ids[plan]);
    else {
      links ||= await stripe.paymentLinks
        .list({ limit: 100 })
        .autoPagingToArray({ limit: 1000 });
      const link = links.find((item) => item.url === PAYMENT_LINKS[plan]);
      if (!link)
        throw Object.assign(new Error("SIMDCG offer configuration missing"), {
          code: "billing_configuration",
        });
      const items = await stripe.paymentLinks.listLineItems(link.id, {
        limit: 2,
      });
      if (items.data.length !== 1 || items.data[0].quantity !== 1)
        throw new Error("Unexpected SIMDCG offer");
      price = items.data[0].price;
    }
    if (
      price.currency !== "eur" ||
      price.unit_amount !== (plan === "subscription" ? 1500 : 2900) ||
      (plan === "subscription"
        ? price.recurring?.interval !== "month" ||
          price.recurring?.interval_count !== 1
        : !!price.recurring)
    )
      throw Object.assign(new Error("Unexpected SIMDCG price"), {
        code: "billing_configuration",
      });
    plans[plan] = price.id;
  }
  return plans;
}
export function planForItems(items, prices) {
  if (items.length !== 1 || (items[0].quantity ?? 1) !== 1) return null;
  return (
    Object.keys(prices).find(
      (plan) => prices[plan] === objectId(items[0].price),
    ) || null
  );
}
export async function resolveUser({ db, auth }, uid, email) {
  if (uid) {
    const user = await auth.getUser(uid);
    return { uid: user.uid, email: normalizeEmail(user.email) };
  }
  const normalized = normalizeEmail(email);
  if (!normalized)
    throw Object.assign(new Error("Payment identity missing"), {
      code: "user_unresolved",
    });
  try {
    const user = await auth.getUserByEmail(normalized);
    return { uid: user.uid, email: normalizeEmail(user.email) };
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
  }
  const matches = new Map();
  for (const value of new Set([email, normalized, normalized.toUpperCase()])) {
    const result = await db
      .collection("users")
      .where("email", "==", value)
      .limit(2)
      .get();
    result.docs.forEach((doc) => matches.set(doc.id, doc));
  }
  if (matches.size !== 1)
    throw Object.assign(new Error("Payment account unresolved"), {
      code: "user_unresolved",
    });
  return { uid: [...matches.keys()][0], email: normalized };
}
export function mergeEntitlement(current, change, now = Date.now()) {
  const billing = current.simdcgBilling || {};
  const subscriptions = { ...billing.subscriptions },
    packs = { ...billing.packs };
  if (
    !current.simdcgBilling &&
    current.proType === "pack_examen" &&
    current.proExpiresAt
  )
    packs.legacy = { expiresAt: current.proExpiresAt };
  const bucket = change.kind === "subscription" ? subscriptions : packs;
  if (
    !bucket[change.id] ||
    (bucket[change.id].eventCreated || 0) <= change.eventCreated
  )
    bucket[change.id] = change;
  const activeSub = Object.values(subscriptions).some((sub) => sub.active);
  const expiry = Math.max(
    0,
    ...Object.values(packs)
      .filter((pack) => !pack.revoked)
      .map((pack) => Date.parse(pack.expiresAt) || 0),
  );
  const activePack = expiry > now;
  return {
    simdcgBilling: { subscriptions, packs },
    isPro: activeSub || activePack,
    proType: activeSub ? "subscription" : activePack ? "pack_examen" : null,
    proExpiresAt: activeSub
      ? null
      : activePack
        ? new Date(expiry).toISOString()
        : null,
    proActivatedAt: current.proActivatedAt || new Date(now).toISOString(),
  };
}
export async function applyChange(deps, user, change, eventId) {
  const ref = deps.db.collection("users").doc(user.uid),
    receipt = deps.db.collection("stripeEvents").doc(eventId);
  return deps.db.runTransaction(async (tx) => {
    const [saved, seen] = await Promise.all([tx.get(ref), tx.get(receipt)]);
    if (seen.exists) return { duplicate: true };
    const patch = mergeEntitlement(saved.data() || {}, change);
    tx.set(ref, { email: user.email, ...patch }, { merge: true });
    tx.set(receipt, {
      uid: user.uid,
      processedAt: new Date().toISOString(),
      source: "simdcg",
    });
    return { isPro: patch.isPro };
  });
}
export async function syncSubscription(
  deps,
  subId,
  eventId,
  eventCreated,
  hint = {},
  prices,
) {
  // Read current Stripe state instead of blindly trusting a possibly old event.
  const sub = await deps.stripe.subscriptions.retrieve(subId);
  if (sub.metadata?.app && sub.metadata.app !== "simdcg")
    return { ignored: true };
  prices ||= await catalog(deps.stripe);
  if (planForItems(sub.items.data, prices) !== "subscription")
    return { ignored: true };
  const uid = sub.metadata?.app === "simdcg" ? sub.metadata.firebaseUid : null;
  const customer = uid
    ? null
    : await deps.stripe.customers.retrieve(objectId(sub.customer));
  const user = await resolveUser(
    deps,
    uid || hint.uid,
    customer?.email || hint.email,
  );
  if (hint.expectedUid && user.uid !== hint.expectedUid)
    throw Object.assign(new Error("Cet achat appartient à un autre compte."), {
      status: 403,
    });
  return applyChange(
    deps,
    user,
    {
      kind: "subscription",
      id: sub.id,
      active: subscriptionActive(sub),
      status: sub.status,
      customerId: objectId(sub.customer),
      eventCreated,
    },
    eventId,
  );
}
export async function syncSession(
  deps,
  sessionId,
  eventId,
  eventCreated,
  expectedUid,
) {
  const session = await deps.stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.app && session.metadata.app !== "simdcg")
    return { ignored: true };
  if (
    session.status !== "complete" ||
    !["paid", "no_payment_required"].includes(session.payment_status)
  )
    return { pending: true };
  const prices = await catalog(deps.stripe);
  const items = await deps.stripe.checkout.sessions.listLineItems(session.id, {
    limit: 2,
  });
  const plan = planForItems(items.data, prices);
  if (!plan) return { ignored: true };
  // Payment Link client_reference_id can be edited in the URL: do not trust it.
  const uid =
    session.metadata?.app === "simdcg" ? session.metadata.firebaseUid : null;
  const email = session.customer_details?.email || session.customer_email;
  if (plan === "subscription") {
    if (session.mode !== "subscription" || !session.subscription)
      return { ignored: true };
    return syncSubscription(
      deps,
      objectId(session.subscription),
      eventId,
      eventCreated,
      { uid, email, expectedUid },
      prices,
    );
  }
  if (session.mode !== "payment" || session.payment_status !== "paid")
    return { ignored: true };
  const user = await resolveUser(deps, uid, email);
  if (expectedUid && user.uid !== expectedUid)
    throw Object.assign(new Error("Cet achat appartient à un autre compte."), {
      status: 403,
    });
  const payment = await deps.stripe.paymentIntents.retrieve(
    objectId(session.payment_intent),
    { expand: ["latest_charge"] },
  );
  const charge = payment.latest_charge;
  if (!charge || typeof charge === "string")
    throw new Error("Payment charge unavailable");
  let disputed = !!charge.disputed;
  if (disputed) {
    const disputes = await deps.stripe.disputes.list({
      charge: charge.id,
      limit: 10,
    });
    disputed = disputes.data.some(
      (dispute) => !["won", "warning_closed"].includes(dispute.status),
    );
  }
  const revoked = disputed || charge.amount_refunded > 0;
  const expiresAt = new Date(
    (session.created + 90 * 86400) * 1000,
  ).toISOString();
  return applyChange(
    deps,
    user,
    { kind: "pack", id: session.id, expiresAt, revoked, eventCreated },
    eventId,
  );
}
export async function processEvent(deps, event) {
  const obj = event.data.object;
  if (
    [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event.type)
  )
    return syncSession(deps, obj.id, event.id, event.created);
  if (
    [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "customer.subscription.paused",
      "customer.subscription.resumed",
    ].includes(event.type)
  )
    return syncSubscription(deps, obj.id, event.id, event.created);
  if (["invoice.paid", "invoice.payment_succeeded", "invoice.payment_failed"].includes(event.type)) {
    const id = invoiceSubscription(obj);
    return id
      ? syncSubscription(deps, id, event.id, event.created)
      : { ignored: true };
  }
  if (
    [
      "charge.refunded",
      "charge.dispute.created",
      "charge.dispute.closed",
    ].includes(event.type)
  ) {
    const charge =
      event.type === "charge.refunded"
        ? obj
        : await deps.stripe.charges.retrieve(objectId(obj.charge));
    const sessions = await deps.stripe.checkout.sessions.list({
      payment_intent: objectId(charge.payment_intent),
      limit: 10,
    });
    for (const session of sessions.data)
      await syncSession(
        deps,
        session.id,
        `${event.id}_${session.id}`,
        event.created,
      );
    return { received: true };
  }
  return { ignored: true };
}
