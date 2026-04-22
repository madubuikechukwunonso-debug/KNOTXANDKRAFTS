import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

function getStripe() {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }

    stripeInstance = new Stripe(secretKey);
  }

  return stripeInstance;
}

export async function upsertStripeCatalogItem(input: {
  existingStripeProductId?: string | null;
  existingStripePriceId?: string | null;
  name: string;
  description?: string | null;
  image?: string | null;
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();
  const currency = (input.currency || "cad").toLowerCase();

  let productId = input.existingStripeProductId || "";

  if (productId) {
    await stripe.products.update(productId, {
      name: input.name,
      description: input.description || undefined,
      images: input.image ? [input.image] : undefined,
      metadata: input.metadata,
      active: true,
    });
  } else {
    const product = await stripe.products.create({
      name: input.name,
      description: input.description || undefined,
      images: input.image ? [input.image] : undefined,
      metadata: input.metadata,
      active: true,
    });

    productId = product.id;
  }

  let priceId = input.existingStripePriceId || "";
  let shouldCreateNewPrice = true;

  if (priceId) {
    try {
      const existingPrice = await stripe.prices.retrieve(priceId);
      shouldCreateNewPrice =
        existingPrice.unit_amount !== input.amount ||
        existingPrice.currency !== currency;
    } catch {
      shouldCreateNewPrice = true;
    }
  }

  if (shouldCreateNewPrice) {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: input.amount,
      currency,
      active: true,
      metadata: input.metadata,
    });

    priceId = price.id;
  }

  return {
    stripeProductId: productId,
    stripePriceId: priceId,
  };
}
