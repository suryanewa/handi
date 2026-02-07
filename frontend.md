# Frontend Interface Guide

How the UI should look and behave, combining the **AI Block Marketplace** (Flowglad, blocks) with patterns from **Protosynthesis** (auth, dashboard, layout).

---

## 1. Overall Shell and Navigation

**One consistent app shell** across all pages:

- **Top bar (global)**
  - Left: Logo / "AI Block Marketplace" (links to home or dashboard).
  - Center or right: Primary nav — **Dashboard** | **Block Library** | **Checkout** | **Profile**.
  - Far right: **User** (avatar/email) and **Log out** when auth exists (Protosynthesis-style).

- **No "back to home" only** — Use the top bar for navigation instead of an ArrowLeft on every page. Keep ArrowLeft only on secondary flows (e.g. from Block Library into a single-block run view) if you add one.

- **Auth gate**
  - If you add Supabase (or Flowglad) auth: unauthenticated users see **Login** / **Sign up** in the top bar and get redirected to `/login` when hitting Dashboard, Block Library, Checkout, or Profile (Protosynthesis pattern).
  - Home/landing can stay public with a clear "Get started" → signup or dashboard.

**Visual language (keep current):**

- Dark theme: `bg-zinc-950`, `bg-zinc-900`, `border-zinc-700`, `text-zinc-100` / `text-zinc-400`.
- Accent: emerald for primary actions and "unlocked" state (`emerald-500`, `emerald-600`).
- One shared header: `border-b border-zinc-800 bg-zinc-900/50`, same height and padding on every page.

---

## 2. Home / Landing

**Purpose:** Explain the product and send users to Dashboard or Block Library (or Login).

- Short hero: "AI Block Marketplace" + one line (e.g. "Modular AI-powered blocks with usage-based billing").
- Primary CTA: **Go to Dashboard** or **Browse blocks** (Block Library).
- Secondary: **Profile** / **Checkout** (or **Login** / **Sign up** when auth exists).
- Optional: 2–3 feature bullets (blocks, Flowglad billing, run or unlock).

Keep it minimal; the main experience is Dashboard + Block Library.

---

## 3. Auth (When You Add It)

**Pages:** `/login`, `/signup` (and optional "forgot password").

- **Layout:** Centered card or Protosynthesis-style "node" layout (two cards with a visual connector) for a distinctive look.
- **Fields:** Email, password; signup: optional full name.
- **Actions:** Submit, "Sign up" / "Log in" link to switch, and optional "Continue with Google" if you use Supabase social.
- **After login:** Redirect to `/` or `/dashboard`; after signup optionally redirect to Block Library or a short onboarding step.

Reuse Protosynthesis `AuthContext` + `AuthProvider` and wrap the app so `user` is available in the shell for "User" + "Log out".

---

## 4. Dashboard

**Two possible roles** (pick one or combine):

**Option A – Hub (Protosynthesis-style)**
- Dashboard = **home after login**: list of "projects" or "saved runs" (if you add persistence).
- Sidebar: search, sort (newest / oldest / name), list of items, "New project" or "New run".
- Main area: cards (e.g. "Summarize run – 2 mins ago", "Extract Emails – yesterday") with "Open" / "Run again".
- Top bar: same global nav; "Log out" in sidebar or top right.

**Option B – Canvas (current)**
- Dashboard = **ReactFlow canvas** where users place blocks and (later) run a chain.
- Top bar: "← Dashboard" (if you have a separate hub), "Add blocks" (→ Block Library), "Run", "Save" (when you have persistence).
- Canvas: drag blocks from a sidebar or from Block Library; connect nodes; run triggers backend run-block (or multi-block) and shows results in a panel or modal.

**Recommendation:**
- **Short term:** Keep Dashboard as the **canvas** (Option B); add a **shared top bar** with links to Block Library, Checkout, Profile (and later Login/Log out).
- **Later:** Add a "Hub" (Option A) as the default post-login page that lists recent runs or saved canvases; "Open" goes to Dashboard (canvas) or a run-detail view.

---

## 5. Block Library

**Purpose:** Browse all blocks, run unlocked ones, unlock locked ones via Flowglad.

- **Layout:** Same global top bar; below it a title "Block Library" and short subtitle (e.g. "Browse and run AI blocks. Unlock locked blocks via checkout.").
- **Content:** Grid of **block cards** (e.g. 2 columns on desktop).
- **Each card:**
  - Icon + name + short description.
  - **Unlocked:** Input (e.g. textarea for "text" inputs), **Run** button, then output area (e.g. JSON or formatted text).
  - **Locked:** **Unlock** (or "Purchase") button that calls `createCheckoutSession` and redirects to Flowglad.
  - Optional: usage balance (e.g. "12 runs left") for usage-based blocks via `checkUsageBalance`.
- **Empty/loading:** "Loading…" or skeleton cards; if no products, "No blocks available."

Keep the current Block Library as the main "run one block" experience; Dashboard (canvas) is for multi-block flows once you support them.

---

## 6. Checkout

**Purpose:** One place to see "what's locked" and start Flowglad checkout.

- **Layout:** Same top bar; title "Checkout" and one line of copy (e.g. "Unlock blocks below. You'll be redirected to Flowglad to complete payment.").
- **Content:** List of blocks (from `BLOCK_DEFINITIONS` or API): block name, status (**Unlocked** in green or **Purchase** button).
- **Purchase:** Calls `createCheckoutSession` with `priceSlug`, `successUrl` (e.g. back to Block Library or Checkout), `cancelUrl`, `autoRedirect: true`.
- Optional: link "Manage billing" → Profile or Flowglad billing portal.

---

## 7. Profile

**Purpose:** Account + billing (Flowglad): subscriptions, invoices, billing portal.

- **Layout:** Same top bar; title "Profile".
- **Sections (in order):**
  1. **Account:** Email, name (from Flowglad customer or your auth).
  2. **Subscriptions:** Active (and optionally past) subscriptions; status, current period end.
  3. **Invoices:** List of recent invoices (status, amount).
  4. **Actions:** "Open Billing Portal" (Flowglad) if `billingPortalUrl` is set.
- **Errors:** If billing fails to load, show message + "Retry" (call `reload()` from `useBilling`).

When you add auth, you can add "Change password" or "Account settings" here.

---

## 8. Visual and UX Consistency

| Element     | Recommendation |
|------------|-----------------|
| **Theme**  | Dark (zinc-950/900/800), emerald accents, Lucide icons. |
| **Header** | Same on every page: logo/title, nav (Dashboard, Block Library, Checkout, Profile), user + logout when logged in. |
| **Cards**  | `rounded-xl border border-zinc-700 bg-zinc-900/80`, padding, hover state for clickable cards. |
| **Buttons**| Primary: `bg-emerald-600 hover:bg-emerald-500`. Secondary: `bg-zinc-700 hover:bg-zinc-600`. Unlock/pay: amber or emerald. |
| **Loading**| "Loading…" or spinner (e.g. Loader2) for billing and run-block. |
| **Errors** | `text-red-400`, short message, optional "Retry". |
| **Empty**  | "No blocks", "No subscriptions", "No invoices" with subdued text. |

---

## 9. Flow Summary

1. **Unauthenticated (when auth added):** Landing → Login/Sign up → Dashboard or Block Library.
2. **Authenticated:** Top bar to Dashboard (canvas), Block Library (browse/run/unlock), Checkout (unlock list), Profile (billing).
3. **Run block:** Block Library → choose block → input → Run → output (and usage recorded).
4. **Unlock block:** Block Library or Checkout → Unlock/Purchase → Flowglad checkout → return → block becomes runnable.
5. **Billing:** Profile shows subscriptions and invoices; "Open Billing Portal" for Flowglad self-serve.

This keeps the current devfest behavior (Flowglad, run-block, block library, checkout, profile) and aligns layout and auth with Protosynthesis so the frontend feels like one product.
