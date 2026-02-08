import { Router } from 'express';
import { flowglad } from '../lib/flowglad.js';
import { getCustomerExternalId } from '../lib/auth.js';

export const checkoutRouter = Router();

checkoutRouter.post('/', async (req, res) => {
  try {
    const userId = await getCustomerExternalId(req);
    const { priceSlug, successUrl, cancelUrl } = req.body as {
      priceSlug: string;
      successUrl: string;
      cancelUrl: string;
    };

    console.log(`[Checkout] Request for customer: ${userId}, price: ${priceSlug}`);

    if (!priceSlug || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'priceSlug, successUrl, cancelUrl required' });
    }

    const fgClient = flowglad(userId);

    // Step 1: Ensure customer exists
    console.log('[Checkout] Creating/finding customer...');
    await fgClient.findOrCreateCustomer();
    console.log('[Checkout] Customer ready');

    // Step 2: Create checkout session
    console.log('[Checkout] Creating checkout session...');
    const result = await fgClient.createCheckoutSession({
      priceSlug,
      successUrl,
      cancelUrl,
    });

    console.log('[Checkout] Success:', JSON.stringify(result, null, 2));
    const topLevelUrl =
      typeof result === 'object' && result && 'url' in result
        ? (result as { url?: unknown }).url
        : undefined;
    const rawSession =
      typeof result === 'object' && result && 'checkoutSession' in result
        ? (result as { checkoutSession?: unknown }).checkoutSession
        : result;
    const sessionUrlFromNested =
      typeof rawSession === 'object' && rawSession && 'url' in rawSession
        ? (rawSession as { url?: unknown }).url
        : undefined;
    const finalUrl = typeof sessionUrlFromNested === 'string' && sessionUrlFromNested
      ? sessionUrlFromNested
      : typeof topLevelUrl === 'string' && topLevelUrl
        ? topLevelUrl
        : undefined;

    if (!finalUrl) {
      return res.status(502).json({
        error: 'Checkout session missing URL from Flowglad. Verify DEMO_MODE=false, FLOWGLAD_SECRET_KEY, and valid priceSlug.',
      });
    }

    const checkoutSession =
      rawSession && typeof rawSession === 'object'
        ? ({ ...(rawSession as Record<string, unknown>), url: finalUrl })
        : { url: finalUrl };

    res.json({ checkoutSession });
  } catch (e: unknown) {
    // Extract detailed error info
    const err = e as { message?: string; error?: { error?: string }; status?: number };
    const message = err?.error?.error || err?.message || 'Unknown error';
    const status = err?.status || 500;

    console.error('[Checkout] Error:', message);
    console.error('[Checkout] Full error:', JSON.stringify(e, null, 2));

    res.status(status).json({ error: message });
  }
});
