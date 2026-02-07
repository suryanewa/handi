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
    if (!priceSlug || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: 'priceSlug, successUrl, cancelUrl required' });
    }
    await flowglad(userId).findOrCreateCustomer();
    const { checkoutSession } = await flowglad(userId).createCheckoutSession({
      priceSlug,
      successUrl,
      cancelUrl,
    });
    res.json({ checkoutSession });
  } catch (e) {
    console.error('checkout error', e);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});
