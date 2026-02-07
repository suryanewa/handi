import { Router } from 'express';
import { BLOCK_DEFINITIONS } from 'shared';

export const productsRouter = Router();

productsRouter.get('/', (_req, res) => {
  res.json({
    products: BLOCK_DEFINITIONS.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      featureSlug: b.featureSlug,
      priceSlug: b.priceSlug,
      usageMeterSlug: b.usageMeterSlug,
      usesAI: b.usesAI,
      inputs: b.inputs,
      outputs: b.outputs,
    })),
  });
});
