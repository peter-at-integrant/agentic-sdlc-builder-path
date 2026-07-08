import type { GlossaryTerm } from './types'

export const glossary: GlossaryTerm[] = [
  // Core
  { term: 'Agentic SDLC', group: 'Core', def: 'Software delivery where humans, agents, and tool-native execution share explicit contracts: rules, skills, commands, hooks, MCP, and orchestration.' },
  { term: 'ADLC', group: 'Core', def: 'Informal shorthand for the Agentic (Software) Development Life Cycle; used interchangeably with Agentic SDLC.' },
  { term: 'Builder', group: 'Core', def: 'Someone who maintains the platform: authors artifacts, wires tools, sets policy. This path targets the builder track.' },
  { term: 'User', group: 'Core', def: 'Someone who consumes the platform: invokes procedures, configs, and agents safely.' },
  { term: 'Primitive', group: 'Core', def: 'One of the composable building blocks: skill, hook, command, rule, MCP, sub-agent, routine, plugin, AGENTS.md.' },
  { term: 'Composition', group: 'Core', def: 'Designing one coherent path through multiple layers. The trace intent → command/skill → rules → MCP → sub-agent → hook → tier. Gaps become incidents.', moduleId: 'composition' },
  { term: 'Create & use', group: 'Core', def: 'The two competency levels: not just using a primitive (awareness) but authoring/maintaining it (depth).' },

  // Primitives
  { term: 'Skill', group: 'Primitives', def: 'A reusable, on-demand procedure that loads only when relevant. Mnemonic: procedure.', moduleId: 'skills' },
  { term: 'Command', group: 'Primitives', def: 'The fast manual trigger for a well-defined task. In modern Claude Code, a skill with disable-model-invocation. Mnemonic: shortcut.', moduleId: 'commands' },
  { term: 'Rule', group: 'Primitives', def: 'An always-on constraint or fact loaded every session. Mnemonic: constraint.', moduleId: 'rules' },
  { term: 'Hook', group: 'Primitives', def: 'A deterministic action that always runs at a lifecycle event. Exit 0 allow, 2 block. Mnemonic: enforcement.', moduleId: 'hooks' },
  { term: 'MCP', group: 'Primitives', def: 'Model Context Protocol — open standard giving an agent ground-truth access to external systems. Mnemonic: systems of record.', moduleId: 'mcp' },
  { term: 'MCP server', group: 'Primitives', def: 'A process implementing MCP that exposes tools (with schemas/auth) over stdio, http, sse, or ws.', moduleId: 'mcp' },
  { term: 'Sub-agent', group: 'Primitives', def: 'A specialized worker with isolated context, tool restrictions, and stop conditions. Mnemonic: scoped worker.', moduleId: 'subagents' },
  { term: 'Persona model', group: 'Primitives', def: 'Giving each sub-agent a narrow role (explore / execute / verify) instead of one monolithic prompt.', moduleId: 'subagents' },
  { term: 'Stop condition', group: 'Primitives', def: 'An explicit "done" definition plus a turn cap and escalation, preventing unbounded loops.', moduleId: 'subagents' },
  { term: 'AGENTS.md', group: 'Primitives', def: 'The single "start here" entry point that routes to rules and skills. Mnemonic: routing.', moduleId: 'agents-md' },
  { term: 'Rules file', group: 'Primitives', def: 'A memory file (e.g. CLAUDE.md) loaded every session; holds rules and facts, with a precedence order.', moduleId: 'rules' },

  // Distribution
  { term: 'Plugin', group: 'Distribution', def: 'A portable, versioned bundle of rules + skills + commands + hooks + MCP stubs teams install. Mnemonic: shippable stack.', moduleId: 'plugins' },
  { term: 'Manifest', group: 'Distribution', def: 'Plugin metadata: name, semver version, description, author, repository, license, keywords.', moduleId: 'plugins' },
  { term: 'Semver', group: 'Distribution', def: 'Semantic versioning MAJOR.MINOR.PATCH used to pin and upgrade plugins.' },
  { term: 'Marketplace', group: 'Distribution', def: 'A publishing channel that lists installable plugins. May be official, community, or an internal org channel.', moduleId: 'plugins' },
  { term: 'Clean-profile test', group: 'Distribution', def: 'Installing a plugin into a fresh workspace to verify it loads and does not break unrelated projects.', moduleId: 'plugins' },

  // Execution tiers
  { term: 'Routine', group: 'Execution tiers', def: 'A saved config (prompt + repos + connectors) that runs on managed cloud, triggered by schedule, API, or repo event.', moduleId: 'routines' },
  { term: 'Trigger', group: 'Execution tiers', def: 'What fires a routine: a schedule (cron), an API call, or a repo event.', moduleId: 'routines' },
  { term: 'Headless mode', group: 'Execution tiers', def: 'Running the agent non-interactively via a CLI flag on your machine or a runner.', moduleId: 'routines' },
  { term: 'Agent SDK', group: 'Execution tiers', def: 'A library that runs the agent loop inside your own process; for building custom agent apps.', moduleId: 'routines' },
  { term: 'CI pipeline', group: 'Execution tiers', def: 'The agent invoked as a step in your build system, triggered by repo events; for build/test/PR gating.', moduleId: 'routines' },
  { term: 'Tier matrix', group: 'Execution tiers', def: 'A one-page mapping of each real task to its correct execution tier and why, without conflating products.', moduleId: 'routines' },

  // Process
  { term: 'SMART', group: 'Process', def: 'Goal framing: Specific, Measurable, Achievable, Relevant, Time-bound.' },
  { term: 'Depth review', group: 'Process', def: 'A gate that marks a competency complete only when you can defend it on four dimensions: why, when/not, quality, composition.' },
  { term: 'Baseline', group: 'Process', def: 'Your current-state rating for a competency: Have / Partial / Gap.' },
  { term: 'PoC', group: 'Process', def: 'Proof of concept — a working demonstration. The capstone is a composed agentic PoC using ≥3 layers, solving a real problem.', moduleId: 'composition' },
  { term: 'Manual baseline', group: 'Process', def: 'Doing the task by hand once (time/errors/consistency) to quantify how the agentic solution improves on it.', moduleId: 'composition' },
  { term: 'Golden-path', group: 'Process', def: 'The primary, intended success flow used to exemplify a skill or test a plugin.' },
]

export const glossaryGroups = ['Core', 'Primitives', 'Distribution', 'Execution tiers', 'Process']

const termMap = new Map(glossary.map((g) => [g.term.toLowerCase(), g]))
export const findTerm = (t: string): GlossaryTerm | undefined => termMap.get(t.toLowerCase())
