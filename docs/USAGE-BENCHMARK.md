# WanderMatch — Usage Benchmark & Token Optimization

**Purpose:** a benchmark to *measure* and then *reduce* the token/cost of a find-a-destination run
(a multi-round tool-use loop). **Scope:** WanderMatch matcher runs only. **Cost figures are estimates**
(token counts × published prices), not Anthropic billing.

## Metrics captured
**Per message (round-trip):** uncached input · `cache_read` · `cache_creation` · output · ≈ cost.
**Per request (the run):**
- round-trips · tool calls
- totals: uncached input / cache_read / cache_creation / output / total tokens
- **cache-hit rate** = `cache_read ÷ total input`
- ≈ total cost · wall-clock · model

## Cost model (labeled "≈")
`tokens × published price`, with cache pricing: `cache_read` ×0.1, `cache_creation` ×1.25 of the input
price. Opus 4.8 $5/$25, Haiku 4.5 $1/$5 per 1M in/out. Estimate only — Anthropic billing is authoritative.

## UI
- **Usage benchmark** — a **collapsible** section on the `/wandermatch` result (collapsed by default,
  so it never interferes with the main flow): this run's summary + cache-hit rate + a per-message table.
- **`/usage` dashboard** (nav link): cumulative totals · editable **budget (default $5)** with progress ·
  a **history ledger of labelled runs** · **delta vs a chosen baseline** · reset.

## Honest caveats
Estimate, not billing · per-browser only (not your real account total) · WanderMatch only.

## Optimization backlog (targets the benchmark measures against)
| # | Lever | Expected signal | Status |
|---|---|---|---|
| 1 | **Prompt caching** — `cache_control` on system + tool defs (stable prefix) | `cache_read` ↑↑, cost ↓↓ (biggest win in a 5–8 round loop) | **✅ applied** (`matcher.ts`, ephemeral breakpoint on the system block; caches tools+system prefix) |
| 2 | **Fewer round-trips** — parallel tool calls / fewer candidates (8→4–5) | round-trips ↓ | **✅ applied** (batching directive in the system prompt: enrich many candidates per turn, run tools in parallel. Candidate-count reduction 8→5 *deferred* — it trades breadth, so kept as a separate opt-in) |
| 3 | **Leaner tool-result payloads** | cumulative input ↓ | **✅ applied (minor)** — dropped schema-duplicated / derivable fields (`resolved_country`, `currency`, `scope`). **Low headroom**: payloads were already compact, so the benchmark says this lever isn't the bottleneck (the re-sent prefix was — see #1). Kept `source`/notes for transparency. |
| 4 | **Context editing** — clear consumed `tool_result` blocks | later-round input ↓ | **✅ applied (safety valve)** — Anthropic's `clear_tool_uses_20250919` (beta `context-management-2025-06-27`), configured conservatively: trigger 30k input tokens, keep 6 recent tool uses. **When-not:** WanderMatch gathers all candidates then composes one shortlist, so aggressive clearing would starve the final step — this only engages on a runaway loop and never degrades a normal run. Cleared tokens surface in the debug trace. |
| 5 | **Model / max_tokens / effort tuning** | cost ↓ (quality trade-off) | planned |

**Method:** record a **baseline** run → apply one lever → compare the **delta** in the dashboard.

> **Note — this is extra-mile.** Neither the usage benchmark nor prompt caching is part of the required
> AI Phase 1 scope (the ten builder primitives + capstone PoC). They demonstrate *applying* a learned
> concept — measure the agentic loop, then optimize it — on the real PoC, and measuring the result.

## Applied optimizations — what changed & why

Four of the five levers are applied. Each entry: **the change · where · expected signal · honest finding.**

### #1 · Prompt caching — the real win
- **Change:** the system prompt is sent as a cached text block (`cache_control: { type: 'ephemeral' }`), so the tools + system prefix is re-read at ~0.1× on rounds 2+ instead of reprocessed at full input price. A UI toggle turns it off to capture a pre-caching baseline.
- **Where:** `src/wandermatch/matcher.ts` (system block); `src/pages/WanderMatch.tsx` (toggle).
- **Signal:** cache-hit rate climbs after round 1; input cost drops. Scales with round count.
- **Finding:** the one lever that materially moves cost in this multi-round loop.

### #2 · Fewer round-trips (batching)
- **Change:** system prompt directs the model to enrich many candidates per turn with parallel tool calls, rather than one city per turn. The loop already accepted multiple `tool_use` blocks per response — the model just wasn't told to use it.
- **Where:** `src/wandermatch/matcher.ts` (system prompt). No-quality-loss (same data, fewer turns).
- **Signal:** `rounds` drops on `/usage`; compounds with #1 (fewer prefix re-reads).
- **Finding:** the `rounds` count is the proof it worked. Candidate-count cut (8→5) deferred — trades breadth.

### #3 · Leaner tool-result payloads (minor)
- **Change:** dropped fields that duplicate the tool schema or are derivable — `resolved_country` (already in `location`), `currency`, `scope`. Kept `source`/notes (transparency).
- **Where:** `src/wandermatch/tools.ts`.
- **Signal:** cumulative input ↓ slightly.
- **Finding:** **low headroom** — payloads were already compact, so this isn't the bottleneck. The benchmark said so; documenting that we *didn't* over-invest here is the point.

### #4 · Context editing (safety valve — deliberate restraint)
- **Change:** Anthropic's `clear_tool_uses_20250919` (beta `context-management-2025-06-27`), configured conservatively — trigger 30k input tokens, keep 6 recent tool uses. Cleared tokens surface in the debug trace.
- **Where:** `src/wandermatch/matcher.ts` (`client.beta.messages.create`). Shape verified against `@anthropic-ai/sdk` 0.110.0.
- **Signal:** later-round input ↓ **only if it fires**; on a normal run it never fires.
- **Finding (when-not):** WanderMatch gathers all candidates then composes one shortlist, so aggressive clearing would starve the final step. Applied as a runaway safety valve, not an always-on optimizer — a conscious restraint decision.

### The meta-point
Measuring first showed **#1 was the bottleneck** and **#3/#4 were low-ROI for this workload**. Optimizing the one that matters and consciously skipping the rest — with evidence — is the intended lesson, not five equal wins.

## Implementation
- `matcher.ts` accumulates `usage` (incl. cache fields) per round-trip + timing → returns a usage summary.
- `wandermatch/pricing.ts` — per-model prices + `costOf(usage, model)`.
- `wandermatch/usageStore.ts` — localStorage run log + editable budget + baseline.
- Collapsible **Usage panel** on `/wandermatch`; **`/usage`** dashboard + nav link.
