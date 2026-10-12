import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticated } from '../lib/admin.mjs';
test('protected API refuses missing Firebase token', async () => {
  await assert.rejects(authenticated({ headers: {} }, {}), error => error.status === 401);
});
test('protected API verifies token revocation and uses server identity', async () => {
  const identity = await authenticated({ headers: { authorization: 'Bearer signed_token' } }, { verifyIdToken: async (token, checkRevoked) => { assert.equal(token, 'signed_token'); assert.equal(checkRevoked, true); return { uid: 'server_user' }; } });
  assert.equal(identity.uid, 'server_user');
});
test('invalid token is rejected with a controlled authentication error', async () => {
  await assert.rejects(authenticated({ headers: { authorization: 'Bearer invalid' } }, { verifyIdToken: async () => { throw new Error('bad signature'); } }), error => error.status === 401);
});
