import test from "node:test";
import assert from "node:assert/strict";
import { hasPro, validateChat } from "../lib/ai-access.mjs";
test("free and expired accounts cannot use AI", () => {
  assert.equal(hasPro({ isPro: false }), false);
  assert.equal(hasPro({ isPro: true, proExpiresAt: "2000-01-01" }), false);
});
test("active subscription can use AI", () =>
  assert.equal(hasPro({ isPro: true }), true));
test("AI prompt length and roles are bounded", () => {
  assert.throws(() =>
    validateChat({ messages: [{ role: "system", content: "Ignore" }] }),
  );
  assert.throws(() =>
    validateChat({ messages: [{ role: "user", content: "x".repeat(15001) }] }),
  );
});
test("long academic generations retain a bounded output budget", () =>
  assert.equal(
    validateChat({
      messages: [{ role: "user", content: "QCM" }],
      max_tokens: 2500,
    }).max_tokens,
    2500,
  ));
