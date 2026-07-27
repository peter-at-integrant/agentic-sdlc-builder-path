import type { ModelId } from '../lib/keyStore'

// Published per-1M-token prices (USD). Estimates only — Anthropic billing is
// authoritative. Cache reads bill at 0.1x input; cache writes at 1.25x input.
export const PRICES: Record<ModelId, { in: number; out: number }> = {
  'claude-opus-4-8': { in: 5, out: 25 },
  'claude-haiku-4-5': { in: 1, out: 5 },
}

export interface TokenTotals {
  uncached_input: number
  cache_read: number
  cache_creation: number
  output: number
}

export function costOf(t: TokenTotals, model: ModelId): number {
  const p = PRICES[model] ?? PRICES['claude-opus-4-8']
  return (
    (t.uncached_input * p.in +
      t.cache_read * p.in * 0.1 +
      t.cache_creation * p.in * 1.25 +
      t.output * p.out) /
    1_000_000
  )
}

export function fmtCost(n: number): string {
  if (n === 0) return '$0'
  if (n < 0.01) return `$${n.toFixed(5)}`
  return `$${n.toFixed(4)}`
}
