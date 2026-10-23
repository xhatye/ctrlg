import {assertPatchedNode} from '../lib/runtime-security.mjs';
assertPatchedNode();
console.log('Node.js security minimum verified: '+process.version);
