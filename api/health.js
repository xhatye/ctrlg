import { services } from '../lib/admin.mjs';
import { readiness } from '../lib/readiness.mjs';

let cached;
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30');
  if (req.method !== 'GET') return res.status(405).json({ ready: false });
  if (cached && cached.expires > Date.now()) return res.status(cached.result.ready ? 200 : 503).json(cached.result);
  let result;
  try { result = await readiness(services(), process.env.FIREBASE_PROJECT_ID, process.env.VITE_FIREBASE_PROJECT_ID); }
  catch { result = { ready: false, reason: 'server_configuration' }; }
  cached = { result, expires: Date.now() + 30000 };
  return res.status(result.ready ? 200 : 503).json(result);
}
