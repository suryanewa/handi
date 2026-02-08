import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { FlowgladServer } from '@flowglad/server';
import { expressRouter } from '@flowglad/server/express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Simple customer ID getter (hardcoded for demo)
const getCustomerExternalId = async (req) => {
    return req.headers['x-user-id'] || 'demo-customer-1';
};

// Flowglad factory function
const flowglad = (customerExternalId) => {
    return new FlowgladServer({
        customerExternalId,
        getCustomerDetails: async () => ({
            email: 'demo@example.com',
            name: 'Demo Customer',
        }),
    });
};

// Custom checkout endpoint that handles customer creation
app.post('/api/checkout', async (req, res) => {
    try {
        const customerId = req.headers['x-user-id'] || 'demo-customer-1';
        const { priceSlug, successUrl, cancelUrl } = req.body;

        console.log(`[Checkout] Creating for customer: ${customerId}, price: ${priceSlug}`);

        const fgClient = flowglad(customerId);

        // Step 1: Ensure customer exists
        console.log('[Checkout] Creating/finding customer...');
        await fgClient.findOrCreateCustomer();

        // Step 2: Create checkout session
        console.log('[Checkout] Creating checkout session...');
        const result = await fgClient.createCheckoutSession({
            priceSlug,
            successUrl,
            cancelUrl,
        });

        console.log('[Checkout] Success:', result);
        res.json(result);
    } catch (error) {
        console.error('[Checkout] Error:', error);
        const message = error?.error?.error || error.message;
        const status = error?.status || 500;
        if (!res.headersSent) {
            res.status(status).json({ error: message });
        }
    }
});

// Mount Flowglad routes (for other API calls)
app.use('/api/flowglad', expressRouter({ flowglad, getCustomerExternalId }));

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!', flowgladKey: !!process.env.FLOWGLAD_SECRET_KEY });
});

app.listen(PORT, () => {
    console.log(`🚀 Flowglad demo server running on http://localhost:${PORT}`);
    console.log(`📝 Secret key set: ${!!process.env.FLOWGLAD_SECRET_KEY}`);
});
