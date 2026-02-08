# Flowglad Demo

A minimal example to test Flowglad integration.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify `.env` file:**
   - Set `FLOWGLAD_SECRET_KEY` to your test key (from [app.flowglad.com](https://app.flowglad.com), same pricing model as your products).
   - Optional: `PORT=5000`

3. **Pricing model:** The demo uses price slug **`dummy5`** ($5 single payment) from the **[TEST] Pricing Model**. If you use a new Flowglad account, create a product with a price slug (e.g. `dummy5`) in that test pricing model, or edit `priceSlug` in `public/index.html` to match your price slug. Price amount must be ≥ Stripe minimum (e.g. $0.50 USD).

4. **Run the server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Go to `http://localhost:5000`
   - Click "Create Checkout Session"
   - Should redirect to Flowglad checkout page

## Test / sandbox mode

- **You’re in test by default:** New Flowglad accounts use a **test pricing model**. API keys you create there are for test/sandbox only.
- **No real money:** Until you complete Stripe Connect for live mode, only test transactions are possible.
- **Test card for checkout:** When the Flowglad checkout page asks for payment, use Stripe’s test card:
  - **Number:** `4242 4242 4242 4242`
  - **Expiry:** any future date (e.g. `12/34`)
  - **CVC:** any 3 digits (e.g. `123`)

This runs a successful test payment without charging a real card.

## What This Tests

- ✅ Backend Flowglad SDK initialization
- ✅ Express route handler (`/api/flowglad/*`)
- ✅ Checkout session creation
- ✅ Product/Price/Feature slug matching

## Troubleshooting

**"The amount must be greater than or equal to the minimum charge amount"** (Stripe):
1. Go to [Flowglad Dashboard](https://app.flowglad.com) → your product → the **Price** with slug `summarize_text`.
2. Edit the price so the **amount is at least** the minimum for your currency (e.g. **$0.50** for USD). Stripe rejects $0.00 or very small amounts. [Stripe minimums by currency](https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts).
3. Save and try "Create Checkout Session" again. No code changes needed.

**Still getting the error after setting the price to $1?**
- **Create a new price** instead of editing: sometimes the previous (too-low) amount is cached. Add a new Price with slug `summarize_text`, amount **$1**, currency **USD**, and ensure it’s attached to your **test pricing model**. If the slug must be unique, use e.g. `summarize_text_1` and change the demo’s `priceSlug` in `public/index.html` to match.
- **Check currency**: If the price is in another currency (e.g. EUR), its minimum is different; use at least €0.50 or the correct minimum.
- **Confirm the right price is used**: In the dashboard, confirm the price that has slug `summarize_text` is the one with the $1 amount and is on the same pricing model as your API key.
- If it still fails, ask in Flowglad support (e.g. Discord) whether price amount updates apply immediately or a new price is required.

**"Price with slug ... not found"** or **"... not found for customer's pricing model"**:
1. **Pricing model must match:** API keys are scoped to a specific **pricing model** (e.g. your test pricing model). The price must exist **on that same pricing model**. In [Flowglad Dashboard](https://app.flowglad.com), open the pricing model that your API key uses, then add or create the **Price** there with the slug your demo sends (e.g. `summarize_text_5`).
2. **Slug must match exactly:** Create a Price whose slug exactly matches the demo (case-sensitive, no extra spaces).
3. Attach the price to your product within that pricing model. Test with: `curl http://localhost:5000/api/test`

**"kill EPERM"** after an error: Windows sometimes blocks Node's watch mode from restarting. Stop the server (Ctrl+C), then run `npm run dev` again.
