import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeEmail,
  invoiceSubscription,
  planForItems,
  mergeEntitlement,
  resolveUser,
  applyChange,
  syncSession,
  syncSubscription,
} from "../lib/billing.mjs";
const prices = { subscription: "price_simdcg", pack_examen: "price_pack" };
const now = Date.parse("2026-10-12T12:00:00Z");
const sub = (active, stamp = 1) => ({
  kind: "subscription",
  id: "sub_one",
  active,
  eventCreated: stamp,
});
function dbMock(seed = {}) {
  const documents = new Map(Object.entries(seed));
  const ref = (path) => ({ path });
  const snap = (path) => ({
    exists: documents.has(path),
    data: () => documents.get(path),
  });
  const db = {
    collection: (name) => ({ doc: (id) => ref(`${name}/${id}`) }),
    runTransaction: async (fn) => {
      const writes = [];
      const result = await fn({
        get: async (r) => snap(r.path),
        set: (r, value, opts) =>
          writes.push([
            r.path,
            opts?.merge ? { ...documents.get(r.path), ...value } : value,
          ]),
      });
      writes.forEach(([key, value]) => documents.set(key, value));
      return result;
    },
  };
  return { db, documents };
}
test("legacy uppercase payment email is normalized before Firebase Auth lookup", async () => {
  let email;
  const user = await resolveUser(
    {
      auth: {
        getUserByEmail: async (value) => {
          email = value;
          return { uid: "student", email: value };
        },
      },
    },
    null,
    " ELEVE@EXAMPLE.FR ",
  );
  assert.equal(email, "ele ve@example.fr".replace(" ", ""));
  assert.equal(user.uid, "student");
});
test("email normalization is stable", () =>
  assert.equal(normalizeEmail(" USER@GMAIL.COM "), "user@gmail.com"));
test("both Stripe invoice API shapes resolve subscription", () => {
  assert.equal(invoiceSubscription({ subscription: "sub_old" }), "sub_old");
  assert.equal(
    invoiceSubscription({
      parent: { subscription_details: { subscription: { id: "sub_new" } } },
    }),
    "sub_new",
  );
});
test("Evidstack prices cannot activate SIMDCG", () =>
  assert.equal(planForItems([{ price: "price_evidstack" }], prices), null));
test("bundles and incorrect quantity are rejected", () => {
  assert.equal(
    planForItems([{ price: "price_simdcg", quantity: 2 }], prices),
    null,
  );
  assert.equal(
    planForItems([{ price: "price_simdcg" }, { price: "price_pack" }], prices),
    null,
  );
});
test("paid subscription activates access", () =>
  assert.equal(mergeEntitlement({}, sub(true), now).isPro, true));
test("older activation cannot overwrite cancellation", () => {
  const current = mergeEntitlement({}, sub(false, 20), now);
  assert.equal(mergeEntitlement(current, sub(true, 10), now).isPro, false);
});
test("cancellation preserves a separately valid exam pack", () => {
  const current = mergeEntitlement(
    {},
    {
      kind: "pack",
      id: "cs_pack",
      expiresAt: "2026-12-01T00:00:00Z",
      eventCreated: 1,
    },
    now,
  );
  assert.equal(
    mergeEntitlement(current, sub(false), now).proType,
    "pack_examen",
  );
});
test("recovering June exam pack in October does not restart 90 days", () =>
  assert.equal(
    mergeEntitlement(
      {},
      {
        kind: "pack",
        id: "cs_june",
        expiresAt: "2026-09-23T00:00:00Z",
        eventCreated: 1,
      },
      now,
    ).isPro,
    false,
  ));
test("refunded pack is revoked", () =>
  assert.equal(
    mergeEntitlement(
      {},
      {
        kind: "pack",
        id: "cs_pack",
        expiresAt: "2026-12-01T00:00:00Z",
        revoked: true,
        eventCreated: 1,
      },
      now,
    ).isPro,
    false,
  ));
test("duplicate webhook is applied once and unrelated profile fields survive", async () => {
  const deps = dbMock({ "users/u": { name: "Étudiant", history: [1] } });
  await applyChange(
    deps,
    { uid: "u", email: "u@example.fr" },
    sub(true),
    "evt_1",
  );
  assert.deepEqual(
    await applyChange(deps, { uid: "u" }, sub(false, 2), "evt_1"),
    { duplicate: true },
  );
  assert.equal(deps.documents.get("users/u").isPro, true);
  assert.deepEqual(deps.documents.get("users/u").history, [1]);
});
test("unpaid checkout cannot activate any account", async () => {
  assert.deepEqual(
    await syncSession(
      {
        stripe: {
          checkout: {
            sessions: {
              retrieve: async () => ({
                status: "complete",
                payment_status: "unpaid",
              }),
            },
          },
        },
      },
      "cs_1",
      "evt_1",
      1,
    ),
    { pending: true },
  );
});
test("late subscription checkout reads current canceled status", async () => {
  const deps = dbMock();
  deps.auth = { getUser: async (uid) => ({ uid, email: "u@example.fr" }) };
  deps.stripe = {
    subscriptions: {
      retrieve: async () => ({
        id: "sub_one",
        status: "canceled",
        customer: "cus_1",
        metadata: { app: "simdcg", firebaseUid: "u" },
        items: { data: [{ price: "price_simdcg" }] },
      }),
    },
  };
  await syncSubscription(deps, "sub_one", "evt_late", 1, {}, prices);
  assert.equal(deps.documents.get("users/u").isPro, false);
});
test("recovery cannot claim another user purchase", async () => {
  const deps = {
    auth: { getUser: async (uid) => ({ uid }) },
    stripe: {
      subscriptions: {
        retrieve: async () => ({
          id: "sub_1",
          metadata: { app: "simdcg", firebaseUid: "owner" },
          items: { data: [{ price: "price_simdcg" }] },
        }),
      },
    },
  };
  await assert.rejects(
    syncSubscription(
      deps,
      "sub_1",
      "evt_1",
      1,
      { expectedUid: "attacker" },
      prices,
    ),
    (e) => e.status === 403,
  );
});
