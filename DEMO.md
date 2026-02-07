# Demo mode: workflow without Flowglad or keys

Use this to run the full workflow (canvas, Run workflow, Block Library) for a short demo. No database, no Flowglad, no API keys required.

---

## What you need from your end (for demo)

**Nothing.** For demo mode you do **not** need:

- Flowglad account or `FLOWGLAD_SECRET_KEY`
- Anthropic API key (AI blocks will use mock responses)
- Database or auth

---

## Setup (demo only)

1. **Backend** — create `backend/.env`:

   ```
   DEMO_MODE=true
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```

2. **Frontend** — create `frontend/.env.local`:

   ```
   NEXT_PUBLIC_DEMO_MODE=true
   ```

   Optionally set `NEXT_PUBLIC_API_URL=http://localhost:4000` if the backend is not on that host.

3. **Run:**

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 → Dashboard. Add blocks (e.g. Constant, Summarize Text), connect them, click **Run workflow**. Enter any text when the entry-inputs modal appears. All blocks run; Execution log shows results.

---

## When you want real billing / AI (not demo)

Turn off demo mode (remove or set `DEMO_MODE=` and `NEXT_PUBLIC_DEMO_MODE=` to false). Then you need:

| Key / config | Where | Purpose |
|--------------|--------|---------|
| **FLOWGLAD_SECRET_KEY** | `backend/.env` | From [Flowglad Dashboard](https://app.flowglad.com). Required for entitlements, checkout, usage. |
| **ANTHROPIC_API_KEY** | `backend/.env` | From Anthropic. Optional; without it, AI blocks return mock text. |
| Flowglad products/features | Flowglad dashboard | Create products and features whose slugs match `shared/src/blocks.ts` so checkout and access checks work. |

No keys are required for the demo.
