import type { Request } from 'express';

const DEMO_USER_ID = 'demo-user-1';

/**
 * Extract customer external ID from request (your app's user/organization ID).
 * For hackathon: use header or cookie. For production: use Supabase/Flowglad JWT.
 */
export async function getCustomerExternalId(req: Request): Promise<string> {
  const fromHeader = req.headers['x-user-id'] as string | undefined;
  if (fromHeader) return fromHeader;
  // Cookie/session would go here (e.g. Supabase getSession)
  return DEMO_USER_ID;
}
