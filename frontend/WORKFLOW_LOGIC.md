# Workflow Logic (Mocked)

How inputs, outputs, and execution are wired so workflows make sense.

---

## 1. Where inputs come from

- **Manual:** User types a value in the Run panel (or in the "Entry inputs" modal when running the whole workflow).
- **Connected:** An edge connects another block’s **output handle** to this block’s **input handle**. The value is taken from the **cached output** of that upstream block (from its last run).

So: **run order matters**. Run upstream blocks first (or use "Run workflow") so their outputs are in the cache before running downstream blocks.

---

## 2. Cached outputs

- When you **Run** a block (single or as part of workflow), its result is stored in **flow run store** by node id: `outputsByNode[nodeId] = { outputKey: value }`.
- Downstream blocks that have an input **connected** to that node’s output read from this cache.
- **Clear cache** in the toolbar resets all cached outputs; connected inputs then show "Run upstream first" until those nodes are run again.

---

## 3. Run panel: connected vs manual

- For each input, we look at the **edges**: is there an edge with `target = this node` and `targetHandle = this input key`?
  - **Yes** → **Connected.** We show "From [Upstream block name].[output key]" and the cached value (or "Run upstream first" if missing). You cannot edit it here; it comes from the last run of the upstream block.
  - **No** → **Manual.** We show a text input; you type the value.
- When you click **Run**, we build the payload: connected inputs from cache, manual from the form. If any connected input is missing from cache, **Run** is disabled and we show "Run upstream block first".

---

## 4. Run workflow

- **Run workflow** runs all blocks in **topological order** (roots first, then nodes that only depend on them, etc.).
- **Cycle check:** If the graph has a cycle, we show "Workflow has a cycle" and do not run.
- **Entry inputs:** Any input that has **no incoming edge** is an "entry" input. Before running, we collect all such (node, input key) pairs. If there are any, we open the **Entry inputs** modal so you can type values for them. Submit runs the workflow with those values; unconnected inputs for later nodes are filled from the cache as upstream nodes complete.
- Execution: for each node in order, we build inputs (from cache for connected, from entry form for entry inputs), call `POST /api/run-block`, then update the cache with that node’s outputs. Downstream nodes then use the updated cache.

---

## 5. Validation (mocked)

- **Cycles:** Detected when computing topological order; running is blocked and an error is shown.
- **Missing upstream:** In the Run panel, if an input is connected but the upstream node has no cached output, Run is disabled and we explain that the user should run the upstream block first (or use Run workflow).

---

## 6. Visual feedback

- **Block node:** If this node has cached output, a small **"out"** badge (with check) appears in the header so you can see which blocks have been run.
- **Run panel:** After a run, we show "Output (cached for downstream)" so it’s clear the value is stored for connections.

---

## Summary

| Concept | Implementation |
|--------|-----------------|
| Input source | Edges + cache: connected = from upstream output, else manual. |
| Cached outputs | `flowRunStore.outputsByNode`; set after each run, read when resolving connected inputs. |
| Run single block | Build payload from connected (cache) + manual (form); call API; cache result. |
| Run workflow | Topological order → entry modal if needed → run each node in order, cache after each. |
| Cycles | Topological sort returns null → show error, don’t run. |
| Node badge | BlockNode reads store; shows "out" when `outputsByNode[id]` has keys. |

All of this is **mocked** in the sense that execution is still one block per API call and we don’t persist the cache across reloads; the **logic** of how inputs flow and how runs are ordered is in place and usable.
