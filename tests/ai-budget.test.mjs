import test from "node:test";
import assert from "node:assert/strict";
import {
  reserveTutor,
  reserveCost,
  periods,
  GLOBAL_BUDGET,
  USER_BUDGET,
} from "../lib/ai-budget.mjs";
const data = {
  messages: [{ role: "user", content: "Expliquez un bilan." }],
  max_tokens: 2048,
};
const now = new Date("2026-10-12T11:00:00Z");
function database(overrides = {}) {
  const store = new Map(
    Object.entries({ "users/u": { isPro: true }, ...overrides }),
  );
  let queue = Promise.resolve();
  return {
    store,
    collection: (name) => ({ doc: (id) => `${name}/${id}` }),
    runTransaction: (fn) => {
      const task = queue.then(async () => {
        const writes = [];
        const result = await fn({
          get: async (ref) => ({ data: () => store.get(ref) }),
          set: (ref, v) => writes.push([ref, v]),
        });
        for (const [k, v] of writes) store.set(k, v);
        return result;
      });
      queue = task.catch(() => {});
      return task;
    },
  };
}
test("usage periods follow Paris midnight and calendar month boundaries", () => {
  assert.deepEqual(periods(new Date("2026-10-31T23:30:00Z")), {
    day: "2026-11-01",
    month: "2026-11",
  });
});
test("reservation accounts conservatively for multibyte prompts and all completion tokens", () => {
  assert.ok(
    reserveCost({
      ...data,
      messages: [{ role: "user", content: "é".repeat(4000) }],
    }) >
      reserveCost({
        ...data,
        messages: [{ role: "user", content: "a".repeat(4000) }],
      }),
  );
  assert.ok(
    reserveCost({ ...data, max_tokens: 2048 }) >
      reserveCost({ ...data, max_tokens: 128 }),
  );
});
test("two concurrent requests at the last daily slot cannot both consume it", async () => {
  const db = database({ "aiUsage/u_2026-10-12": { count: 19 } });
  const results = await Promise.allSettled([
    reserveTutor(db, "u", data, now),
    reserveTutor(db, "u", data, now),
  ]);
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(db.store.get("aiUsage/u_2026-10-12").count, 20);
  assert.equal(db.store.get("aiUsage/u_month_2026-10").count, 1);
});
test("monthly request, user cost and global cost ceilings block before writes", async () => {
  for (const override of [
    { "aiUsage/u_month_2026-10": { count: 300 } },
    { "aiUsage/u_month_2026-10": { reservedMicros: USER_BUDGET } },
    { "aiUsage/global_2026-10": { reservedMicros: GLOBAL_BUDGET } },
  ]) {
    const db = database(override),
      before = JSON.stringify([...db.store]);
    await assert.rejects(reserveTutor(db, "u", data, now));
    assert.equal(JSON.stringify([...db.store]), before);
  }
});
test("free or expired profiles cannot consume paid generation or budget", async () => {
  for (const profile of [
    { isPro: false },
    { isPro: true, proExpiresAt: "2000-01-01" },
  ]) {
    const db = database({ "users/u": profile });
    await assert.rejects(reserveTutor(db, "u", data, now), { status: 403 });
    assert.equal(db.store.size, 1);
  }
});
test("rapid repeat requests are rejected without incrementing counters", async () => {
  const db = database();
  await reserveTutor(db, "u", data, now);
  await assert.rejects(
    reserveTutor(db, "u", data, new Date(now.getTime() + 100)),
    { status: 429 },
  );
  assert.equal(db.store.get("aiUsage/u_2026-10-12").count, 1);
});
