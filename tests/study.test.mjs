import test from "node:test";
import assert from "node:assert/strict";
import { MODULES, studyModule } from "../lib/study-content.mjs";
import { readStudy } from "../lib/study-access.mjs";
test("all advertised modules have unambiguous quizzes and matching cards", () => {
  assert.equal(Object.keys(MODULES).length, 20);
  let total = 0;
  for (const [id, m] of Object.entries(MODULES)) {
    for (const concept of m.notions)
      assert.equal(
        new Set([concept.correct, ...concept.wrong]).size,
        4,
        `${id} has duplicate answer choices`,
      );
    for (let seed = 0; seed < 8; seed++) {
      const q = studyModule(id, "qcm", () => seed / 8);
      assert.equal(q.items.length, Math.min(8,m.notions.length));
      for (const item of q.items) {
        assert.ok(item.answer >= 0 && item.answer < 4);
        const i = Number(item.id.split("-")[1]);
        assert.equal(item.options[item.answer], m.notions[i].correct);
      }
    }
    assert.equal(studyModule(id, "cards").items.length, m.notions.length);
    assert.equal(studyModule(id, "case").questions.length, 3);
    total += m.notions.length;
  }
  assert.equal(total, 296);
});
test("numeric starter corrections agree with independent calculations", () => {
  assert.equal(
    MODULES.UE9.notions[1].correct,
    `${12000 / 4} €.`.replace("3000", "3 000"),
  );
  assert.equal(40000 + 60000 - 35000, 65000);
  assert.equal(90000 - 65000, 25000);
  assert.ok(MODULES.UE6.cas.questions[1].answer.includes("25 000"));
  assert.equal(30000 / ((100000 - 60000) / 100000), 75000);
  assert.ok(MODULES.DSCG3.cas.questions[1].answer.includes("75 000"));
  assert.equal(100000 - Math.max(90000, 85000), 10000);
  assert.ok(MODULES.DSCG4.cas.questions[1].answer.includes("10 000"));
  assert.ok(Math.abs(110000 / 1.05 - 100000 - 4761.9) < 0.01);
  assert.ok(MODULES.DSCG2.cas.questions[2].answer.includes("4 761,90"));
});
const deps = (profile) => ({
  auth: {},
  authenticate: async () => ({ uid: "owner" }),
  db: {
    collection: () => ({
      doc: () => ({ get: async () => ({ data: () => profile }) }),
    }),
  },
});
test("free accounting demo does not depend on Firebase, Stripe or Groq", async () => {
  const data = await readStudy("UE9", "qcm", undefined, {});
  assert.equal(data.items.length, 8);
});
test("premium contents require authentication and active server-side entitlement", async () => {
  await assert.rejects(
    readStudy("UE2", "case", undefined, {
      authenticate: async () => {
        throw Object.assign(new Error("auth"), { status: 401 });
      },
    }),
    { status: 401 },
  );
  await assert.rejects(
    readStudy("UE2", "case", "token", deps({ isPro: false })),
    { status: 403 },
  );
  await assert.rejects(
    readStudy(
      "DSCG4",
      "case",
      "token",
      deps({ isPro: true, proExpiresAt: "2000-01-01" }),
    ),
    { status: 403 },
  );
  assert.equal(
    (await readStudy("UE2", "case", "token", deps({ isPro: true }))).questions
      .length,
    3,
  );
});
test("unknown modules, prototype properties and tools cannot return data", async () => {
  for (const id of ["__proto__", "constructor", "UE99"])
    await assert.rejects(readStudy(id, "qcm", undefined, {}), { status: 404 });
  await assert.rejects(readStudy("UE9", "all", undefined, {}), { status: 404 });
});
