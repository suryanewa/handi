const fs = require('fs');
const path = 'README.md';
let s = fs.readFileSync(path, 'utf8');

// Remove duplicate row: second Entitlements line
s = s.replace(/\| \*\*Entitlements\*\* \| Before running a block we call[^\n]+\n/, '');

// Remove duplicate: second Usage-based billing line  
s = s.replace(/\| \*\*Usage-based billing\*\* \| Each execution of a block triggers usage recording[^\n]+\n/, '');

// Remove duplicate: second Subscriptions line (with customer's)
s = s.replace(/\| \*\*Subscriptions\*\* \| Blocks or packs sold as subscriptions[^\n]+\n/, '');

// Fix Checkout description - match with curly or straight quotes
s = s.replace(/\| \*\*Checkout\*\* \| [^\n]+/, '| **Checkout** | Users buy a block or subscription using Flowglad checkout (drop-in hosted UI).');

// Add Org billing, SDK, Hosted auth after Webhooks line
s = s.replace(
  /(\| \*\*Webhooks\*\* \| `POST \/api\/webhook` listens for events[^\n]+\n)(\n---)/,
  '$1| **Org billing (optional)** | Enables shared access / usage under a single organization account. |\n| **SDK integration** | Flowglad JavaScript SDK on both frontend (`@flowglad/nextjs`) and backend (`@flowglad/server`). |\n| **Hosted auth (optional)** | Can use Flowglad-hosted authentication instead of Supabase for JWT flows. |\n$2'
);

fs.writeFileSync(path, s);
console.log('Done');
