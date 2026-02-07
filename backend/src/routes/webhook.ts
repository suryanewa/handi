import { Router } from 'express';

export const webhookRouter = Router();

/**
 * Flowglad uses a "zero webhooks" approach: billing state is queried live via SDK.
 * This endpoint is a placeholder for future webhook support (e.g. subscription.updated, invoice.paid).
 * Verify signature and persist events if Flowglad adds webhooks later.
 */
webhookRouter.post('/', (req, res) => {
  const event = req.body;
  if (event?.type) {
    console.log('[webhook]', event.type, event.id ?? '');
  }
  res.status(200).send();
});
