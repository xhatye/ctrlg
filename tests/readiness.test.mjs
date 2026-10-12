import test from 'node:test';
import assert from 'node:assert/strict';
import { readiness } from '../lib/readiness.mjs';
test('readiness refuses different client and server Firebase projects', async () => {
  assert.deepEqual(await readiness({},'server','other'),{ready:false,reason:'firebase_project_mismatch'});
});
test('readiness catches Firebase access failures without leaking details', async () => {
  const deps={db:{collection:()=>({doc:()=>({get:async()=>{throw new Error('private provider response');}})})}};
  assert.deepEqual(await readiness(deps,'same','same'),{ready:false,reason:'firebase_unavailable'});
});
test('readiness identifies insufficient Stripe permissions with no mutations', async () => {
  const deps={db:{collection:()=>({doc:()=>({get:async()=>({exists:true})})})},stripe:{paymentLinks:{list:()=>({autoPagingToArray:async()=>{throw Object.assign(new Error('private provider response'),{type:'StripePermissionError'});}})}}};
  assert.deepEqual(await readiness(deps,'same','same'),{ready:false,reason:'stripe_permission_missing'});
});
