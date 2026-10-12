import { catalog } from './billing.mjs';

// Read-only check: no payment session, subscription change or user mutation.
export async function readiness(deps, serverProject, clientProject) {
  if (!serverProject || serverProject !== clientProject) return { ready: false, reason: 'firebase_project_mismatch' };
  try { await deps.db.collection('meta').doc('stats').get(); }
  catch { return { ready: false, reason: 'firebase_unavailable' }; }
  try { await catalog(deps.stripe); }
  catch (error) {
    return { ready: false, reason: error.type === 'StripePermissionError' ? 'stripe_permission_missing' : error.code === 'billing_configuration' ? 'stripe_offer_configuration' : 'stripe_unavailable' };
  }
  return { ready: true };
}
