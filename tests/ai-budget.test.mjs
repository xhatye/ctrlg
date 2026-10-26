import test from "node:test";
import assert from "node:assert/strict";
import {
  reserveTutor,
  reserveCost,
  periods,
  GLOBAL_BUDGET,
  USER_BUDGET,
  AI_MODEL,
  tutorUsage,
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

test('GPT-OSS 120B reserves at current input/output prices and hard-caps each account at 36 US cents',()=>{
  assert.equal(AI_MODEL,'openai/gpt-oss-120b');
  assert.equal(USER_BUDGET,360000);
  const prompt={messages:[{role:'system',content:'é'},{role:'user',content:'abc'}],max_tokens:1000};
  assert.equal(reserveCost(prompt),Math.ceil(((5+4096)*15+1000*60)/100));
});

test('concurrent requests cannot cross either last monetary slot',async()=>{
  const cost=reserveCost(data);
  for(const override of [
    {'aiUsage/u_month_2026-10':{reservedMicros:USER_BUDGET-cost}},
    {'aiUsage/global_2026-10':{reservedMicros:GLOBAL_BUDGET-cost}},
  ]){
    const db=database(override);
    const results=await Promise.allSettled([reserveTutor(db,'u',data,now),reserveTutor(db,'u',data,new Date(now.getTime()+5000))]);
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    assert.ok(db.store.get('aiUsage/u_month_2026-10').reservedMicros<=USER_BUDGET);
    assert.ok(db.store.get('aiUsage/global_2026-10').reservedMicros<=GLOBAL_BUDGET);
  }
});

test('a demand costing one micro-dollar too much is blocked without writes',async()=>{
  const db=database({'aiUsage/u_month_2026-10':{reservedMicros:USER_BUDGET-reserveCost(data)+1}});
  const before=JSON.stringify([...db.store]);
  await assert.rejects(reserveTutor(db,'u',data,now),{status:429});
  assert.equal(JSON.stringify([...db.store]),before);
});

test('long mixed tutor/case requests, including failed generations, stop below the monetary ceiling',async()=>{
  const db=database();let accepted=0,lastTotal=0;
  const long={messages:[{role:'system',content:'é'.repeat(5000)},{role:'user',content:'Un exemple concret ?'}],max_tokens:2048};
  for(let i=0;i<300;i++){
    // Provider outcomes deliberately do not refund: even ambiguous timeouts consume reservation.
    try{await reserveTutor(db,'u',{...long,...(i%5===0?{purpose:'case-review'}:{})},new Date(now.getTime()+i*86400000/15));accepted++;}
    catch(e){assert.equal(e.status,429);break;}
    lastTotal=db.store.get('aiUsage/u_month_2026-10')?.reservedMicros||0;
    assert.ok(lastTotal<=USER_BUDGET);
  }
  assert.ok(accepted>0&&accepted<300);
  assert.ok(lastTotal<=USER_BUDGET);
});

test('invalid budgets and completion limits fail closed',async()=>{
  for(const reservedMicros of [-1,NaN,Infinity,'0',.5]){
    const db=database({'aiUsage/u_month_2026-10':{reservedMicros}});
    await assert.rejects(reserveTutor(db,'u',data,now),{status:503});
    assert.equal(db.store.size,2);
  }
  for(const max_tokens of [-1,Infinity,NaN,2049,1600.5])assert.throws(()=>reserveCost({...data,max_tokens}),{status:400});
  assert.throws(()=>reserveCost({...data,messages:[{role:'user',content:'a'.repeat(80001)}]}),{status:400});
});

test('usage reads preserve existing monthly spending, historical metadata and learner profile',async()=>{
  const profile={isPro:true,history:[{score:8}],mastery:{UE1:42}};
  const db=database({'users/u':profile,'aiUsage/u_month_2026-10':{count:12,reservedMicros:180000,note:'historical'}});
  const before=JSON.stringify([...db.store]);const usage=await tutorUsage(db,'u',now);
  assert.equal(usage.budgetPercentRemaining,50);assert.equal(usage.monthlyRemaining,288);
  assert.equal(usage.budgetCurrency,'USD');assert.equal(JSON.stringify([...db.store]),before);
  await reserveTutor(db,'u',data,now);
  assert.equal(db.store.get('aiUsage/u_month_2026-10').note,'historical');
  assert.deepEqual(db.store.get('users/u'),profile);
  const exhausted=database({'aiUsage/u_month_2026-10':{reservedMicros:1500000}});
  assert.equal((await tutorUsage(exhausted,'u',now)).canRequest,false);
  await assert.rejects(reserveTutor(exhausted,'u',data,now),{status:429});
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

test('case feedback has its own atomic daily and monthly ceilings within the shared AI budget',async()=>{
 const caseData={...data,purpose:'case-review'};
 for(const override of [{'aiUsage/u_case_2026-10-12':{count:5}},{'aiUsage/u_case_month_2026-10':{count:60}}]){
  const db=database(override),before=JSON.stringify([...db.store]);await assert.rejects(reserveTutor(db,'u',caseData,now),{status:429});assert.equal(JSON.stringify([...db.store]),before);
 }
 const db=database({'aiUsage/u_case_2026-10-12':{count:4}});
 const results=await Promise.allSettled([reserveTutor(db,'u',caseData,now),reserveTutor(db,'u',caseData,now)]);
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
 assert.equal(db.store.get('aiUsage/u_case_2026-10-12').count,5);
 assert.equal(db.store.get('aiUsage/u_case_month_2026-10').count,1);
 assert.equal(db.store.get('aiUsage/u_2026-10-12').count,1);
 assert.equal(db.store.get('aiUsage/u_month_2026-10').count,1);
 assert.ok(db.store.get('aiUsage/global_2026-10').reservedMicros>0);
 const shared=database({'aiUsage/u_month_2026-10':{count:300}}),before=JSON.stringify([...shared.store]);
 await assert.rejects(reserveTutor(shared,'u',caseData,now),{status:429});assert.equal(JSON.stringify([...shared.store]),before);
});
