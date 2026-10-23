import test from 'node:test';
import assert from 'node:assert/strict';
import {nodeRuntimePatched,assertPatchedNode} from '../lib/runtime-security.mjs';

test('Node security gate rejects releases preceding each October security fix',()=>{
  for(const version of ['22.23.3','22.22.99','24.22.0','24.21.99','26.12.0','26.11.99','20.99.99','25.99.99','27.0.0']) {
    assert.equal(nodeRuntimePatched(version),false,version);
    assert.throws(()=>assertPatchedNode(version),/security update required/);
  }
});

test('Node security gate accepts patched versions and later updates within supported lines',()=>{
  for(const version of ['22.23.4','22.23.5','22.24.0','24.22.1','v24.22.1','24.22.2','24.23.0','26.12.1','26.13.0']) {
    assert.equal(nodeRuntimePatched(version),true,version);
    assert.doesNotThrow(()=>assertPatchedNode(version));
  }
});

test('unknown and prerelease version strings do not silently pass the security gate',()=>{
  for(const version of [null,undefined,'24.x','24.22.1-rc.1','24.22.1-unverified','24.22','not-a-version',24])assert.equal(nodeRuntimePatched(version),false);
});
