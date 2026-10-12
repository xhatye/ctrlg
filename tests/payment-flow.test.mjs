import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { createWebhook } from "../lib/webhook.mjs";
import { PAYMENT_LINKS } from "../lib/billing.mjs";
const signing = new Stripe("sk_test_fixture"),
  secret = "whsec_integration_fixture";
process.env.STRIPE_WEBHOOK_SECRET = secret;
function fixture({
  foreign = false,
  missingUser = false,
  writeFailure = false,
  eventType = 'checkout.session.completed',
} = {}) {
  const saved = new Map([
    [
      "users/student",
      {
        name: "Élève",
        email: "ele ve@example.fr".replace(" ", ""),
        isPro: false,
        history: [{ type: "qcm" }],
      },
    ],
  ]);
  let fail = writeFailure;
  const price = {
    id: "price_simdcg",
    currency: "eur",
    unit_amount: 1500,
    recurring: { interval: "month", interval_count: 1 },
  };
  const pack = { id: "price_pack", currency: "eur", unit_amount: 2900 };
  const db = {
    collection: (name) => ({ doc: (id) => ({ path: `${name}/${id}` }) }),
    runTransaction: async (fn) => {
      const writes = [];
      const result = await fn({
        get: async (ref) => ({
          exists: saved.has(ref.path),
          data: () => saved.get(ref.path),
        }),
        set: (ref, value, opt) =>
          writes.push([
            ref.path,
            opt?.merge ? { ...saved.get(ref.path), ...value } : value,
          ]),
      });
      if (fail) {
        fail = false;
        throw new Error("Temporary database failure");
      }
      writes.forEach(([key, value]) => saved.set(key, value));
      return result;
    },
  };
  const deps = {
    db,
    auth: {
      getUserByEmail: async (email) => {
        assert.equal(email, "ele ve@example.fr".replace(" ", ""));
        if (missingUser)
          throw Object.assign(new Error("No user"), {
            code: "auth/internal-error",
          });
        return { uid: "student", email };
      },
    },
    stripe: {
      webhooks: signing.webhooks,
      paymentLinks: {
        list: () => ({
          autoPagingToArray: async () => [
            { id: "plink_month", url: PAYMENT_LINKS.subscription },
            { id: "plink_pack", url: PAYMENT_LINKS.pack_examen },
          ],
        }),
        listLineItems: async (id) => ({
          data: [{ quantity: 1, price: id === "plink_month" ? price : pack }],
        }),
      },
      checkout: {
        sessions: {
          retrieve: async () => ({
            id: "cs_paid",
            status: "complete",
            payment_status: "paid",
            mode: "subscription",
            subscription: "sub_one",
            customer_details: { email: "ELEVE@EXAMPLE.FR" },
          }),
          listLineItems: async () => ({
            data: [
              {
                price: foreign ? "price_evidstack" : "price_simdcg",
                quantity: 1,
              },
            ],
          }),
        },
      },
      subscriptions: {
        retrieve: async () => ({
          id: "sub_one",
          status: "active",
          metadata: {},
          customer: "cus_one",
          items: { data: [{ price: "price_simdcg", quantity: 1 }] },
        }),
      },
      customers: { retrieve: async () => ({ email: "ELEVE@EXAMPLE.FR" }) },
    },
  };
  const event = {
    id: "evt_payment",
    created: 1,
    type: eventType,
    data: { object: { id: "cs_paid", subscription: 'sub_one' } },
  };
  const request = () => {
    const payload = JSON.stringify(event);
    return new Request("https://test.example/api/stripe-webhook", {
      method: "POST",
      headers: {
        "stripe-signature": signing.webhooks.generateTestHeaderString({
          payload,
          secret,
        }),
      },
      body: payload,
    });
  };
  return { handler: createWebhook(() => deps), request, saved };
}
test("signed uppercase legacy payment activates the matching account and preserves its learning history", async () => {
  const f = fixture();
  assert.equal((await f.handler(f.request())).status, 200);
  assert.equal(f.saved.get("users/student").isPro, true);
  assert.equal(f.saved.get("users/student").history.length, 1);
  const second = await f.handler(f.request());
  assert.equal((await second.json()).duplicate, true);
});
test('legacy invoice.payment_succeeded and invoice.paid both renew from the canonical subscription', async()=>{
  for(const eventType of ['invoice.payment_succeeded','invoice.paid']){
    const f=fixture({eventType});
    const response=await f.handler(f.request());
    assert.equal(response.status,200);
    assert.equal(f.saved.get('users/student').isPro,true);
    assert.equal(f.saved.get('users/student').history.length,1);
  }
});
test("foreign purchase returns ignored without changing SIMDCG access", async () => {
  const f = fixture({ foreign: true });
  assert.equal((await f.handler(f.request())).status, 200);
  assert.equal(f.saved.get("users/student").isPro, false);
  assert.equal(f.saved.has("stripeEvents/evt_payment"), false);
});
test("database failure commits neither access nor receipt, and retry succeeds", async () => {
  const f = fixture({ writeFailure: true });
  assert.equal((await f.handler(f.request())).status, 500);
  assert.equal(f.saved.get("users/student").isPro, false);
  assert.equal(f.saved.has("stripeEvents/evt_payment"), false);
  assert.equal((await f.handler(f.request())).status, 200);
  assert.equal(f.saved.get("users/student").isPro, true);
});
test("unresolvable account is never acknowledged as fulfilled", async () => {
  const f = fixture({ missingUser: true });
  assert.equal((await f.handler(f.request())).status, 500);
  assert.equal(f.saved.get("users/student").isPro, false);
});
