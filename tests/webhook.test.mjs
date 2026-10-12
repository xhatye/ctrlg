import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { createWebhook } from "../lib/webhook.mjs";
const stripe = new Stripe("sk_test_local_fixture");
const secret = "whsec_local_fixture";
process.env.STRIPE_WEBHOOK_SECRET = secret;
function signed(event, tampered) {
  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret,
  });
  return new Request("https://simdcg.example/api/stripe-webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: tampered || payload,
  });
}
test("original UTF-8 body validates with the real Stripe signature library", async () => {
  const event = {
    id: "evt_utf8",
    created: 1,
    type: "unhandled.event",
    data: { object: { text: "Comptabilité – élève 📚" } },
  };
  const response = await createWebhook(() => ({ stripe }))(signed(event));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ignored, true);
});
test("tampering and unsigned calls are rejected before any fulfillment", async () => {
  const event = {
    type: "checkout.session.completed",
    data: { object: { id: "cs_1" } },
  };
  assert.equal(
    (await createWebhook(() => ({ stripe }))(signed(event, "{}"))).status,
    400,
  );
  assert.equal(
    (
      await createWebhook(() => ({ stripe }))(
        new Request("https://example.test", { method: "POST", body: "{}" }),
      )
    ).status,
    400,
  );
});
test("an actual processing error returns 500 so Stripe can retry", async () => {
  const broken = {
    webhooks: stripe.webhooks,
    checkout: {
      sessions: {
        retrieve: async () => {
          throw Object.assign(new Error("Firestore account missing"), {
            code: "user_unresolved",
          });
        },
      },
    },
  };
  const response = await createWebhook(() => ({ stripe: broken }))(
    signed({
      id: "evt_missing",
      created: 1,
      type: "checkout.session.completed",
      data: { object: { id: "cs_1" } },
    }),
  );
  assert.equal(response.status, 500);
});
test("webhook rejects a non-POST method", async () =>
  assert.equal(
    (
      await createWebhook(() => ({ stripe }))(
        new Request("https://example.test"),
      )
    ).status,
    405,
  ));
