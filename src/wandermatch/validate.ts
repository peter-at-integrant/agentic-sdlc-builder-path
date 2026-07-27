import type { Pick } from './matcher'

// The deterministic "hook" — the code-level backstop that runs on the matcher's
// output before it's shown, independent of what the LLM reasoned. Mirrors the
// PoC's PreToolUse hook: excluded advisory is dropped everywhere; a Recommended
// pick that is unknown-advisory or over-budget is demoted. unknown != excluded.

export interface Enforced {
  picks: Pick[]
  actions: string[] // human-readable enforcement notes for the UI
}

export function enforce(picks: Pick[]): Enforced {
  const actions: string[] = []
  const out: Pick[] = []

  for (const p of picks) {
    const name = p.destination || '(unnamed)'
    // Rule 1 — excluded advisory: drop entirely, any tier.
    if (typeof p.advisory_level === 'number' && p.advisory_level >= 3) {
      actions.push(`Removed ${name}: advisory level ${p.advisory_level} (>=3) is excluded, even as an alternative.`)
      continue
    }
    const fixed: Pick = { ...p }
    if (p.tier === 'recommended') {
      // Rule 2 — unknown advisory can't be Recommended.
      if (p.advisory_level === null || p.advisory_level === undefined) {
        fixed.tier = 'alternative'
        fixed.gap = [fixed.gap, 'advisory unverified — cannot be Recommended'].filter(Boolean).join(' · ')
        actions.push(`Demoted ${name} to alternative: advisory is unknown.`)
      }
      // Rule 3 — Recommended must be within budget.
      if (typeof p.total_usd === 'number' && typeof p.budget_usd === 'number' && p.total_usd > p.budget_usd) {
        fixed.tier = 'alternative'
        fixed.gap = [fixed.gap, `$${p.total_usd - p.budget_usd} over budget`].filter(Boolean).join(' · ')
        actions.push(`Demoted ${name} to alternative: total $${p.total_usd} exceeds budget $${p.budget_usd}.`)
      }
    }
    out.push(fixed)
  }
  return { picks: out, actions }
}
