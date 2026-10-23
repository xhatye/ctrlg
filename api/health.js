import { services } from '../lib/admin.mjs';
import { readiness } from '../lib/readiness.mjs';
import { nodeRuntimePatched } from '../lib/runtime-security.mjs';

let cached;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
  if (req.method !== 'GET') return res.status(405).json({ ready: false });
  const runtimePatched = nodeRuntimePatched(process.versions.node);
  if (!runtimePatched) {
    res.setHeader('Cache-Control','no-store');
    console.error('SIMDCG runtime security check', {node:process.version,patched:false});
    return res.status(503).json({ready:false,runtimePatched:false,reason:'runtime_update_required'});
  }
  if (cached && cached.expires > Date.now()) return res.status(cached.result.ready ? 200 : 503).json(cached.result);
  let result;
  try { result = await readiness(services(), process.env.FIREBASE_PROJECT_ID, process.env.VITE_FIREBASE_PROJECT_ID); }
  catch { result = { ready: false, reason: 'server_configuration' }; }
  console.info('SIMDCG runtime security check', {node:process.version,patched:true});
  result = {...result,runtimePatched:true};
  cached = { result, expires: Date.now() + 30000 };
  return res.status(result.ready ? 200 : 503).json(result);
}
