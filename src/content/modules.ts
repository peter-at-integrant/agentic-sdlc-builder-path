import type { Module } from './types'

// All content is generic and vendor-neutral where possible.
// Claude Code specifics (file paths, config) are accurate as of 2026-07 and
// clearly attributed. Domain examples (DevOps, support, personal) are optional
// illustrations, never the only path.

export const modules: Module[] = [
  {
    id: 'skills',
    num: 1,
    sg: 'SG1',
    title: 'Skills',
    tagline: 'Reusable, on-demand procedures.',
    mnemonic: 'procedure',
    baseline: 'Most builders can create a basic skill; the gap is naming discipline and discoverability.',
    why: `A **skill** is a reusable, on-demand procedure — triggers, steps, constraints, and optional supporting files. It loads only when relevant, keeping context lean while giving the agent a repeatable workflow.

It cures two smells: *"I keep pasting the same checklist into chat"* and *"my always-on rules file has quietly grown into a procedure."*`,
    whenNot: `| Use a skill | Don't use a skill |
|---|---|
| A multi-step procedure you repeat | A single always-true fact → **rule** |
| Something the agent should apply when relevant | A guardrail that must *always* fire → **hook** |
| Work that benefits from templates/scripts | A one-off you'll never repeat → just ask |
| A named, discoverable team capability | Repo routing / "start here" → **AGENTS.md** |

**Decision line:** *skills = procedure; rules = always-on constraint; AGENTS.md = routing; hooks = enforcement.*`,
    quality: `- **Naming discipline** — purpose-based suffixes (\`-workflow\`, \`-standards\`, \`-maintenance\`); the set should read consistently.
- **Description first** — put trigger words / when-to-use up front (descriptions truncate ~1,536 chars).
- **Size** — keep the main file under ~500 lines; push big reference into separate files loaded on demand.
- **Tool pre-approval** — \`allowed-tools\` to skip prompts for trusted ops; \`disable-model-invocation: true\` for user-only commands.
- **Discoverable** — every skill findable from an index (AGENTS.md or a skills index).`,
    composition: `**Rules** hold the constraints a skill obeys instead of repeating them. **AGENTS.md** routes people to the skill. **Hooks** can validate the skill's tool calls. **Plugins** package skills for distribution. **MCP** tools are callable from inside a skill with no extra config.`,
    reference: `**Locations (Claude Code):** personal \`~/.claude/skills/<name>/SKILL.md\`, project \`.claude/skills/<name>/SKILL.md\`, or a plugin (namespaced \`plugin:skill\`).

\`\`\`markdown
---
name: dep-map
description: Map which services use which base image. Use for "who uses", "dep map", "what breaks if this changes".
allowed-tools: Bash Read Grep
---

# Dependency map
1. Search the repos for files referencing the shared base image.
2. Group consumers by image + version.
3. Emit/update the dependency map table.
\`\`\`

Placeholders: \`$ARGUMENTS\`, \`$N\`, \`$name\` (declared args), \`\${CLAUDE_PROJECT_DIR}\`. Dynamic context: \`` + "`!`git diff HEAD`" + `\` injects command output at load time.`,
    lab: `1. **Audit** your existing skills; write each one's true purpose in a table.
2. **Normalize names** to the suffix convention; note each rename in its description.
3. **Pick one golden-path skill** and bring it fully to the quality bar (description with trigger words, \`allowed-tools\`, supporting file if long, under 500 lines).
4. **Register discovery** — add a skills index to your AGENTS.md linking each skill + one-line trigger.
5. **Prove use** — have someone invoke the golden-path skill from the index alone, no coaching.`,
    selfCheck: [
      'Why: In one sentence, why does a procedure belong in a skill and not in the always-on rules file?',
      'When/not: Give one task that is a skill and one that should be a rule or a hook instead.',
      'Quality: What three things make a skill discoverable and safe?',
      'Composition: Show how your golden-path skill relies on a rule and is reached via AGENTS.md.',
    ],
    quiz: [
      {
        q: 'What is the primary advantage of a skill over putting the same steps in an always-on rules file?',
        options: [
          'Skills run faster',
          'Skills load on demand, keeping context lean until relevant',
          'Skills can store secrets safely',
          'Skills cannot be invoked by mistake',
        ],
        answer: 1,
        explain: 'Skills are lazy-loaded — they only consume context when relevant, unlike rules which load every session.',
      },
      {
        q: 'A guardrail that must fire on every single edit is best implemented as:',
        options: ['A skill', 'A rule', 'A hook', 'A glossary entry'],
        answer: 2,
        explain: 'Must-always-happen enforcement is a hook. Skills are optional/invoked; rules are guidance.',
      },
      {
        q: 'Which most improves a skill’s discoverability?',
        options: [
          'A long preamble',
          'A description that leads with trigger words / when-to-use',
          'More allowed-tools',
          'A higher version number',
        ],
        answer: 1,
        explain: 'Discovery keys off the description, which truncates — lead with trigger words and the use case.',
      },
    ],
  },
  {
    id: 'commands',
    num: 2,
    sg: 'SG2',
    title: 'Commands',
    tagline: 'The fast, unambiguous manual trigger.',
    mnemonic: 'shortcut',
    baseline: 'The common gap is a fuzzy line between a "command" and a "skill".',
    why: `A **command** is the fast, unambiguous manual trigger for a well-defined task — \`/open-pr\`, \`/deploy-staging\`. It removes prompt variation: everyone runs the same thing the same way.

In Claude Code (v2.1.199+), custom commands *are* skills under the hood. So "command vs skill" is a question of invocation intent and structure, not two separate systems.`,
    whenNot: `| Reach for a "command" (\`disable-model-invocation: true\`) | Reach for a "skill" (model-invocable) |
|---|---|
| Well-defined task with side effects you trigger | Longer procedure the agent should apply when relevant |
| Should **not** auto-fire | Benefits from auto-discovery |
| Short arg list, predictable | Larger, multi-file workflow |

**One-liner:** *A command is a shortcut for a known task I invoke; a skill is a procedure the agent may invoke when it fits.*`,
    quality: `- **Explicit args** — declare \`arguments: [ ... ]\`; reference \`$name\` / \`$ARGUMENTS[N]\`.
- **Defaults + safety notes** — say what happens with no args; call out destructive steps.
- **Team vocabulary** — name it what the team already says.
- **Pre-approved tools** — \`allowed-tools\` so the fast path stays fast.`,
    composition: `Command → loads a skill's steps → **rules** constrain them → may call **MCP** → a **hook** can verify before a side effect (e.g. a branch check before push). A command is often the *entry point* of a composed flow.`,
    reference: `\`\`\`markdown
---
name: open-pr
description: Open a pull request for the current branch into main.
arguments: [title]
disable-model-invocation: true
allowed-tools: Bash
---

# Open PR
1. Confirm the current branch is NOT main.
2. Push the branch.
3. Open a PR titled "$ARGUMENTS[0]" targeting main.
4. Report the PR URL.
\`\`\`

Invoke: \`/open-pr "fix: bump base image"\`. Stack up to 6: \`/review /open-pr do it\`.`,
    lab: `1. **Write the decision note** — one short paragraph "command vs skill". Park it in your AGENTS.md.
2. **Ship one new parameterized command** with documented args, defaults, and a safety note.
3. **Dry-run with someone** — they run it from the description alone; if they hesitate on an arg, tighten the hint/description.`,
    selfCheck: [
      'Why: Why does a command reduce divergent interpretations of the same task?',
      'When/not: Give a task that should be a command and one that should stay a model-invocable skill.',
      'Quality: What makes a command unambiguous for a first-time user?',
      'Composition: Trace one command through rules → (optional MCP) → hook.',
    ],
    quiz: [
      {
        q: 'In modern Claude Code, a custom slash command is technically:',
        options: ['A separate config system', 'A skill with disable-model-invocation set', 'A hook', 'An MCP tool'],
        answer: 1,
        explain: 'Commands merged into skills; a "command" is a skill you invoke manually (disable-model-invocation: true).',
      },
      {
        q: 'The clearest reason to make something a command rather than a model-invocable skill:',
        options: [
          'It should auto-fire when relevant',
          'It has side effects and should only run when you explicitly trigger it',
          'It is very long',
          'It needs an MCP server',
        ],
        answer: 1,
        explain: 'Manual, side-effecting, well-defined tasks are commands; auto-applied procedures are skills.',
      },
      {
        q: 'Which is essential for an unambiguous command?',
        options: [
          'A high version number',
          'Declared arguments with defaults and safety notes',
          'A dark-mode icon',
          'A dedicated database',
        ],
        answer: 1,
        explain: 'Explicit args, defaults, and safety notes let a first-timer run it correctly without coaching.',
      },
    ],
  },
  {
    id: 'hooks',
    num: 3,
    sg: 'SG3',
    title: 'Hooks',
    tagline: 'Deterministic enforcement at lifecycle events.',
    mnemonic: 'enforcement',
    baseline: 'A common gap — most people have never authored one.',
    why: `A **hook** is a deterministic action that **always runs** at a lifecycle event (before/after a tool, on stop, on prompt submit). Unlike a rule (guidance the agent *chooses* to follow) or a skill (an *optional* procedure), a hook is mechanical: if the event fires and the matcher matches, it runs.

Use it for the guardrails everyone forgets in chat — "never push from main", "no secrets in a commit", "format after every edit".`,
    whenNot: `| Use a hook | Don't use a hook |
|---|---|
| Must-happen-every-time enforcement | Judgment calls → skill / prompt |
| Block a dangerous action before it runs | Optional workflows → skill |
| Auto-format / notify after an action | Heavy logic or secrets in the hook body |
| Mechanically enforce a policy | Something that should be easy to override |`,
    quality: `- **Deterministic & fast** — small command; set a sane \`timeout\`.
- **Correct exit codes** — \`0\` allow, \`2\` block (stderr becomes the agent's feedback), other = non-blocking error.
- **No secrets in the hook** — use env; for HTTP hooks whitelist with \`allowedEnvVars\`.
- **Testable** — you can run it by piping JSON to it manually.
- **Documented** — what it does, which event, when it blocks.`,
    composition: `A hook is the **verification step** in a composed flow: command/skill proposes an action → \`PreToolUse\` hook checks it against a **rule** → allowed action proceeds → CI/routine picks up.`,
    reference: `**Config (Claude Code):** \`.claude/settings.json\` (project, checked in), \`.claude/settings.local.json\` (gitignored), or \`~/.claude/settings.json\`.

**Block a push from main:**
\`\`\`json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "if": "Bash(git push*)",
        "hooks": [
          {
            "type": "command",
            "command": "b=$(git branch --show-current); if [ \\"$b\\" = \\"main\\" ]; then echo 'Blocked: never push from main.' >&2; exit 2; fi"
          }
        ]
      }
    ]
  }
}
\`\`\`
Test: pipe a JSON event to the hook and check the exit code. Key events: \`PreToolUse\` (can block), \`PostToolUse\`, \`UserPromptSubmit\`, \`Stop\`, \`Notification\`.`,
    lab: `1. **Pick a guardrail** — e.g. block \`git push\` from main, or a secrets pre-commit scan.
2. **Implement** it in \`.claude/settings.json\` (or \`settings.local.json\` while testing).
3. **Test both paths** — bad input blocks with your message (exit 2); good input passes.
4. **Document** trigger/behavior/error-handling in your AGENTS.md.`,
    selfCheck: [
      'Why: Why enforce a rule as a hook instead of trusting the rules file?',
      'When/not: Name something that must NOT be a hook, and why.',
      'Quality: What do exit codes 0 / 2 / other mean, and how did you test the block path?',
      'Composition: Where does your hook sit in an end-to-end flow?',
    ],
    quiz: [
      {
        q: 'The defining property of a hook (vs a rule) is that it:',
        options: [
          'Is written in JSON',
          'Always runs when its event + matcher match',
          'Can be invoked with a slash',
          'Requires an MCP server',
        ],
        answer: 1,
        explain: 'Hooks are deterministic — they always fire on their event; rules are guidance the agent may follow.',
      },
      {
        q: 'A PreToolUse hook exits with code 2. What happens?',
        options: [
          'The action proceeds',
          'The action is blocked and stderr becomes feedback',
          'The session ends',
          'Nothing; 2 is a success code',
        ],
        answer: 1,
        explain: 'Exit 2 blocks the action; stderr is surfaced to the agent as the reason.',
      },
      {
        q: 'Which is a poor use of a hook?',
        options: [
          'Blocking rm -rf',
          'Auto-formatting after an edit',
          'Making a nuanced judgment call requiring reasoning',
          'Sending a notification when input is needed',
        ],
        answer: 2,
        explain: 'Judgment calls need reasoning — use a skill/prompt. Hooks are for deterministic enforcement.',
      },
    ],
  },
  {
    id: 'rules',
    num: 4,
    sg: 'SG4',
    title: 'Rules',
    tagline: 'Always-on constraints and facts.',
    mnemonic: 'constraint',
    baseline: 'Often present but implicit — no written precedence policy.',
    why: `**Rules** are always-on constraints and facts loaded every session — build commands, coding standards, non-negotiables. They make agent behavior stable across sessions and people: the "how we always work here" layer.`,
    whenNot: `| Use a rule | Don't use a rule |
|---|---|
| A fact/constraint true every session | A multi-step procedure → **skill** |
| A style/convention that applies broadly | Something that must mechanically block → **hook** |
| A path-scoped constraint | Routing / "start here" → **AGENTS.md** |

**Key discipline:** express a non-negotiable **once**; for lengthy steps, *link to a skill* instead of duplicating the procedure inside the rule.`,
    quality: `- **Scoped** — global vs path-specific; don't make everything global.
- **No conflicts** — review project + user + local for contradictions; resolve with explicit precedence.
- **Specific** — "use 2-space indent" beats "format nicely".
- **Lean** — target ~200 lines; longer files dilute adherence.
- **Reviewed on stack change** — new tool/repo → revisit rules.`,
    composition: `Rules are the constraints **every other layer obeys**: skills follow them, hooks enforce them mechanically, AGENTS.md points to them, sub-agents inherit them.`,
    reference: `**Load order (Claude Code, later overrides earlier):** Managed → User (\`~/.claude/CLAUDE.md\`) → Project (\`./CLAUDE.md\`) → Local (\`./CLAUDE.local.md\`). Path rules live in \`.claude/rules/*.md\` and load on demand.

\`\`\`markdown
---
paths:
  - "**/Dockerfile"
---
# Docker rules
- Base images from the approved registry only.
- Build for the target platform. Follow the tag convention.
\`\`\``,
    lab: `1. **Write a precedence policy** — scope order, when a rule wins vs a skill, and the "link to skill, don't duplicate steps" exception.
2. **Find ≥3 real overlaps** in your current rules file.
3. **Resolve them** — move procedures to skills, file-specific constraints to path rules, keep only always-on facts in the rules file. Record each resolution.`,
    selfCheck: [
      'Why: Why do rules produce stable behavior across sessions and people?',
      'When/not: Give a line in your rules file that should actually be a skill or a hook.',
      'Quality: What is your precedence order, and how do you resolve a user-vs-project conflict?',
      'Composition: Show a rule that a skill obeys and a hook enforces.',
    ],
    quiz: [
      {
        q: 'The right home for a lengthy multi-step procedure is:',
        options: ['Inline in the rules file', 'A skill the rule links to', 'A hook', 'The glossary'],
        answer: 1,
        explain: 'Express constraints once; link to a skill for the steps rather than duplicating them in rules.',
      },
      {
        q: 'When two rule sources conflict, you need:',
        options: [
          'To delete both',
          'An explicit precedence order',
          'A larger rules file',
          'A hook to pick randomly',
        ],
        answer: 1,
        explain: 'Conflicts are resolved by a documented precedence (e.g. managed > user > project > local).',
      },
      {
        q: 'A constraint that only applies to files in one folder is best expressed as:',
        options: ['A global rule', 'A path-scoped rule', 'A command', 'A sub-agent'],
        answer: 1,
        explain: 'Path-scoped rules keep global rules lean and apply only where relevant.',
      },
    ],
  },
  {
    id: 'mcp',
    num: 5,
    sg: 'SG5',
    title: 'MCP Servers',
    tagline: 'Ground-truth access to external systems.',
    mnemonic: 'systems of record',
    baseline: 'Many consume MCP servers but have never authored or extended one.',
    why: `**MCP (Model Context Protocol)** gives agents ground-truth access to external systems — an issue tracker, a registry, a database — instead of copy-pasting data into chat. As a builder you must be able to *design* a tool boundary: schemas, auth, errors, rate limits, and which operations are safe vs. restricted.`,
    whenNot: `| Use MCP | Don't use MCP |
|---|---|
| Live data from a system of record | A one-off request → just run a command |
| Repeated, multi-user tool access | Static instructions → skill |
| An official/maintained server exists | Trivial read you can ask for directly |`,
    quality: `- **Clear tool boundaries** — each tool does one thing; typed input/output **schemas**.
- **Auth** — env-based credentials, never hardcoded; document the flow.
- **Errors & rate limits** — actionable errors; respect upstream limits.
- **Safe vs restricted** — mark reads safe; gate writes/destructive ops.
- **Scoping** — bind a server to the sub-agent that needs it rather than global exposure.`,
    composition: `MCP is the **ground-truth call** inside a flow: a skill invokes it; a **hook** can validate/audit the call; a **sub-agent** scopes it; **rules** document when to use it.`,
    reference: `**Config (Claude Code):** \`.mcp.json\` (project), \`~/.claude/.mcp.json\`, a plugin, or a sub-agent's \`mcpServers\` field. Types: \`stdio\`, \`http\`, \`sse\`, \`ws\`. Tool names: \`mcp__<server>__<tool>\`.

\`\`\`json
{
  "mcpServers": {
    "registry-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/registry-mcp-server.js"],
      "env": { "REGISTRY": "example", "TOKEN": "$REGISTRY_TOKEN" }
    }
  }
}
\`\`\`
Restrict a dangerous tool via a deny permission or a \`PreToolUse\` hook matching \`mcp__registry-tools__.*\`.`,
    lab: `1. **Author or extend one MCP tool** — e.g. a read-only \`list_versions(repo)\` over a registry, \`stdio\`, token via env.
2. Define the **input/output schema**; wire **auth** via env.
3. Run it in a **clean client config** and call it.
4. **Gate one restricted op** (deny by default) and write docs next to your AGENTS.md.`,
    selfCheck: [
      'Why: Why an MCP tool instead of a local script for repeated lookups?',
      'When/not: When would you NOT build an MCP server?',
      'Quality: Show your schema, auth flow, and which op is restricted + how.',
      'Composition: How do you scope this server to just one sub-agent?',
    ],
    quiz: [
      {
        q: 'The main reason to expose a system via MCP rather than ad-hoc commands:',
        options: [
          'It looks more professional',
          'Persistent, schema-typed, multi-user tool access to a system of record',
          'It avoids writing any auth',
          'It removes rate limits',
        ],
        answer: 1,
        explain: 'MCP gives durable, typed, reusable access to external systems — not a one-off call.',
      },
      {
        q: 'Best practice for MCP credentials:',
        options: [
          'Hardcode them in .mcp.json',
          'Store them via environment variables, never hardcoded',
          'Paste them into chat',
          'Disable auth for convenience',
        ],
        answer: 1,
        explain: 'Credentials go through env; never hardcode or paste secrets.',
      },
      {
        q: 'To limit blast radius, a destructive MCP operation should be:',
        options: [
          'Available to everyone',
          'Gated (denied by default or checked by a hook)',
          'Removed from documentation only',
          'Renamed',
        ],
        answer: 1,
        explain: 'Mark reads safe and gate writes/destructive ops via permissions or a PreToolUse hook.',
      },
    ],
  },
  {
    id: 'subagents',
    num: 6,
    sg: 'SG6',
    title: 'Sub-agents',
    tagline: 'Isolated, tool-restricted workers with stop conditions.',
    mnemonic: 'scoped worker',
    baseline: 'Gap: no documented persona model or stop conditions.',
    why: `A **sub-agent** is a specialized worker with its own isolated context, tool restrictions, and model. It lets the parent stay thin: verbose or risky work (log analysis, triage, research) runs in isolation and returns only a summary. The "persona model" = giving each sub-agent a narrow role (explore / execute / verify) rather than one monolithic prompt.`,
    whenNot: `| Use a sub-agent | Don't use one |
|---|---|
| Task floods context with output | Frequent back-and-forth needed |
| Needs specific tool restrictions | Phases share lots of context |
| Can run on a cheaper model | Quick, targeted change |
| Self-contained, returns a summary | — |

**Danger to name:** unbounded loops / circular delegation → always set **stop conditions** and a turn cap.`,
    quality: `- **Narrow goal** + explicit **inputs/outputs**.
- **Stop conditions** — a turn cap, a clear "done" definition, an escalation path when stuck.
- **Minimal tools** — grant only what's needed.
- **Right model** — cheap for read-only research, stronger for reasoning.
- **No circular delegation** — bounded nesting.`,
    composition: `Parent orchestrator → delegates to sub-agent (scoped **MCP**, preloaded **skills**) → sub-agent's **hook** validates its tool use → returns summary → parent continues. Sub-agents inherit **rules**.`,
    reference: `**Location (Claude Code):** \`.claude/agents/<name>.md\`. Key frontmatter: \`name\`, \`description\`, \`tools\`/\`disallowedTools\`, \`model\`, \`maxTurns\`, \`skills\`, \`mcpServers\`.

\`\`\`markdown
---
name: triage
description: Score findings from a scan report and propose a minimal fix. Read-only.
tools: Read, Grep, Bash
disallowedTools: Write, Edit
model: sonnet
maxTurns: 12
---
Inputs: a scan report + a target file path.
1. Rank findings by severity + exploitability + fix availability.
2. Propose the minimal change. DO NOT edit files.
Stop when: a ranked list + proposed change exist, or no fix is available (escalate with reason).
\`\`\`
Note it is **read-only** — it *proposes*, a human/parent applies. That is the escalation boundary.`,
    lab: `1. **Write a sub-agent spec** with a narrow goal, explicit I/O, and stop conditions.
2. **Define the persona split** on paper: explore → triage/propose → human apply → verify.
3. **Dry-run** on a real input; confirm it stops at "proposal" and escalates when stuck.`,
    selfCheck: [
      'Why: Why delegate a task instead of doing it in the main thread?',
      'When/not: When does a sub-agent add risk, and how do your stop conditions prevent it?',
      'Quality: Show the inputs, outputs, stop condition, and escalation path.',
      'Composition: How does this sub-agent use MCP and feed a hook/verify step?',
    ],
    quiz: [
      {
        q: 'The main benefit of running work in a sub-agent:',
        options: [
          'It is always faster',
          'Isolated context + tool restrictions; returns a summary, keeping the parent thin',
          'It removes the need for rules',
          'It can push to main',
        ],
        answer: 1,
        explain: 'Sub-agents isolate verbose/risky work and return summaries, preserving the parent context.',
      },
      {
        q: 'The single most important safeguard for a sub-agent is:',
        options: ['A color label', 'Explicit stop conditions (and a turn cap)', 'A long prompt', 'Write access'],
        answer: 1,
        explain: 'Without stop conditions, sub-agents can loop unbounded or delegate circularly.',
      },
      {
        q: 'A read-only triage sub-agent that proposes but does not apply changes demonstrates:',
        options: [
          'A missing feature',
          'A deliberate escalation boundary (human/parent applies)',
          'A bug',
          'Excessive tool access',
        ],
        answer: 1,
        explain: 'Restricting writes makes the human/parent the applier — a clean escalation boundary.',
      },
    ],
  },
  {
    id: 'routines',
    num: 7,
    sg: 'SG7',
    title: 'Routines & Non-interactive Tiers',
    tagline: 'Scheduled / triggered execution with no one at the keyboard.',
    mnemonic: 'no-keyboard run',
    baseline: 'Often 0% — the tiers get conflated with CI.',
    why: `Some agent work should run with **no one at the keyboard** — a weekly scan, triage on every PR, a scheduled report. The builder skill is picking the *right* non-interactive tier and governing it (triggers, scope, secrets, review, rollback) — not treating "automation" as one vague box.

**Claude Routines** is a real feature (research preview, 2026): a saved config (prompt + repos + connectors) that runs on managed cloud infra, triggered by **schedule**, **API call**, or **repo event**.`,
    whenNot: `| Use a routine | Use something else |
|---|---|
| Recurring/triggered agent task, zero infra | Build/test gating → **CI pipeline** |
| Trigger = schedule / API / repo event | Programmatic agent in your code → **Agent SDK** |
| Runs in managed cloud | One-off local non-interactive run → **headless CLI** |

**Don't conflate:** a routine is not your CI pipeline, not a CLI flag, not a library.`,
    quality: `- **Self-contained prompt** — state the task and what success looks like; no interactive prompts at run time.
- **Scoped connectors** — include only what a run needs (they can execute without prompting).
- **Secrets** via cloud env; restrict where the agent can write.
- **Monitoring** — a green run means it executed, **not** that the task succeeded; read the transcript.
- **Limits** — know your plan's run caps.`,
    composition: `A routine is a **wrapper that invokes the other layers non-interactively**: it runs a prompt that loads a **skill**, obeys **rules**, calls **MCP**, delegates to a **sub-agent**, and is checked by **hooks** — then CI takes over for build/scan.`,
    reference: `**Tiers to keep distinct:**

| Tier | What it is | Pick when |
|---|---|---|
| **Routine** | Saved prompt+repos+connectors on managed cloud | recurring, zero infra |
| **Headless CLI** | Non-interactive flag on your machine/runner | one-off, local, CI step |
| **Agent SDK** | Library; agent loop in your process | custom agent app |
| **CI pipeline** | Agent as a workflow step | build/test/PR gating |
| **Managed/cloud agents** | Hosted long-running agents (REST) | always-on production |

Routine triggers: **schedule** (cron), **API** (\`POST .../fire\`), **repo event** (PR/release, where the platform integration supports it). Verify current vendor docs — do not infer behavior.`,
    lab: `1. **Stand up one routine** on a practice repo — exercise a **schedule** trigger (and a repo-event trigger if your platform supports it).
2. **Confirm it runs**, then read the transcript (green ≠ success).
3. **Write a one-page tier matrix** mapping your real tasks to the correct tier and why.
4. **Confirm account access early** — it's a common blocker.`,
    selfCheck: [
      'Why: Why a routine vs. adding a stage to your CI pipeline?',
      'When/not: Which triggers fit your platform, and what do you fall back to?',
      'Quality: How are secrets handled, and why does "green" not mean "succeeded"?',
      'Composition: Show a routine invoking a skill → MCP → sub-agent → hook.',
    ],
    quiz: [
      {
        q: 'A "green" routine run means:',
        options: [
          'The task definitely succeeded',
          'The session executed without an infrastructure error — open the transcript to verify success',
          'The repo was deleted',
          'The schedule is paused',
        ],
        answer: 1,
        explain: 'Green = it ran; it does not guarantee the task achieved its goal. Read the transcript.',
      },
      {
        q: 'Which is NOT the same as a routine?',
        options: [
          'A CI pipeline step',
          'A scheduled cloud run of a saved prompt',
          'An API-triggered cloud run',
          'A repo-event-triggered cloud run',
        ],
        answer: 0,
        explain: 'CI pipelines are your build system; routines are managed scheduled/triggered cloud runs. Do not conflate them.',
      },
      {
        q: 'Before relying on a routine’s behavior, you should:',
        options: [
          'Assume it matches your CI',
          'Verify against current vendor docs (do not infer)',
          'Give it full write access',
          'Disable monitoring',
        ],
        answer: 1,
        explain: 'Non-interactive tiers differ; verify capabilities in the current docs rather than inferring.',
      },
    ],
  },
  {
    id: 'plugins',
    num: 8,
    sg: 'SG8',
    title: 'Plugins & Marketplace',
    tagline: 'A versioned bundle, distributed for reuse.',
    mnemonic: 'shippable stack',
    baseline: 'Gap: artifacts exist but were never bundled/versioned or published.',
    why: `A **plugin** is a portable, versioned bundle — rules, skills, commands, hooks, MCP stubs — teams install so agent behavior stays consistent without copy-pasting across repos. It turns loose artifacts into a *product* with an owner, a version, and a support channel.`,
    whenNot: `| Use a plugin | Don't bundle yet |
|---|---|
| Share a vetted stack | Personal experiment → standalone files |
| Version & release independently | Still iterating fast |
| Namespace skills to avoid conflicts | Single project, no sharing need |`,
    quality: `- **Manifest** — name, semver \`version\`, description, author, repository, license, keywords.
- **Correct layout** — manifest in \`.claude-plugin/\`, but components (\`skills/\`, \`agents/\`, \`hooks/\`, \`.mcp.json\`) at **plugin root** (common gotcha).
- **No secrets** in the package; approved third-party components only.
- **Clean-profile test** — install into a fresh workspace; run a golden-path task; confirm it doesn't break unrelated projects.
- **Docs** — install/uninstall/rollback, what users configure locally, what builders maintain.`,
    composition: `A plugin **is** composition made shippable — it packages rules + skills + commands + hooks + MCP as one unit. Installing it wires several layers at once.`,
    reference: `\`\`\`
my-plugin/
├─ .claude-plugin/
│  └─ plugin.json        # manifest
├─ skills/<name>/SKILL.md
├─ agents/<name>.md
├─ hooks/hooks.json
├─ .mcp.json
└─ README.md
\`\`\`
\`\`\`json
{ "name": "team-devops", "version": "0.1.0",
  "description": "Base-image + triage + PR guardrails",
  "author": { "name": "You" }, "license": "MIT",
  "keywords": ["devops","ci"] }
\`\`\`
Test / validate / distribute: run with a local plugin dir → validate → publish via a marketplace listing → install by name. Your org may run an internal marketplace with its own review/changelog/deprecation standards.`,
    lab: `1. **Bundle** a coherent stack: a rule + ≥2 skills + 1 command + 1 hook + an MCP stub.
2. **Write the manifest** (semver 0.1.0) + a README with install/uninstall/data-handling.
3. **Clean-profile test** in a fresh workspace; confirm nothing leaks into unrelated projects; run validation.
4. **Complete the marketplace checklist** (no secrets) and publish v0.1.0 with a changelog + owner + deprecation note.`,
    selfCheck: [
      'Why: Why a plugin instead of copy-pasting rules/skills into each repo?',
      'When/not: When is bundling premature?',
      'Quality: Show the manifest, the layout gotcha you avoided, and clean-install evidence.',
      'Composition: Explain how the plugin wires ≥3 layers on install.',
    ],
    quiz: [
      {
        q: 'The core value of a plugin is:',
        options: [
          'It runs faster',
          'Consistent, versioned reuse across repos/teams without copy-paste',
          'It hides secrets',
          'It replaces rules',
        ],
        answer: 1,
        explain: 'Plugins distribute a vetted stack as a versioned unit, avoiding drift from copy-paste.',
      },
      {
        q: 'A common plugin-layout mistake is:',
        options: [
          'Putting the manifest in .claude-plugin/',
          'Putting components (skills/, hooks/) inside .claude-plugin/ instead of the plugin root',
          'Using semver',
          'Adding a README',
        ],
        answer: 1,
        explain: 'The manifest lives in .claude-plugin/, but components belong at the plugin root.',
      },
      {
        q: 'Before publishing, the essential test is:',
        options: [
          'Bumping the major version',
          'A clean-profile install that runs a golden-path task without breaking other projects',
          'Removing the README',
          'Adding more keywords',
        ],
        answer: 1,
        explain: 'Clean-profile testing proves the bundle installs and works in isolation.',
      },
    ],
  },
  {
    id: 'agents-md',
    num: 9,
    sg: 'SG9',
    title: 'AGENTS.md & Multi-repo',
    tagline: 'The "start here" that routes to everything.',
    mnemonic: 'routing',
    baseline: 'Gap: per-repo rules exist, but no routing doc or multi-repo policy.',
    why: `**AGENTS.md** is the single "start here" entry point for a workspace: structure, mandatory data-access patterns, skill routing, MCP usage, naming. It's what a new teammate (or agent opening the repo) reads first. It **routes** to rules and skills rather than duplicating them.`,
    whenNot: `| Put in AGENTS.md | Put elsewhere |
|---|---|
| Routing: the skills, when to use each MCP | Lengthy procedure → **skill** (link it) |
| Structure, naming, data-access patterns | Always-on constraint → **rule** (link it) |
| Multi-repo "which root wins" guidance | Mechanical enforcement → **hook** |`,
    quality: `- **Routing not dumping** — short sections that *link out*.
- **Skill index** — every skill with a one-line trigger.
- **MCP usage** — when to use which server vs a local script.
- **Multi-repo clarity** — which AGENTS.md wins when an agent opens a subfolder; where shared skills live; the source of truth for cross-repo changes.`,
    composition: `AGENTS.md is the **hub** that ties the layers together: it points to **rules**, indexes **skills/commands**, documents **MCP** and **hooks**, and names the **plugin** that installs them.`,
    reference: `\`\`\`markdown
# workspace — AGENTS.md (start here)
## Structure
Repos / folders and what they own.
## Skills index
- dep-map — "who uses / what breaks if this changes"
- scan — "scan a repo/dependency for issues"
## Commands
- /open-pr <title> — open a PR into main
## MCP usage
- registry-tools — version lookups; issue-tracker — tickets
## Rules & precedence
See .claude/rules/ ; precedence: managed > user > project > local.
## Multi-repo
Root AGENTS.md wins for cross-cutting; per-repo files own their specifics.
\`\`\``,
    lab: `1. **Write AGENTS.md v1** using the skeleton — pull the skill index (Module 1), the command (Module 2), MCP usage (Module 5), and the precedence link (Module 4).
2. **Add a multi-repo note** — which root wins, where shared skills live, the source of truth for cross-repo changes.
3. **Validate discovery** — someone opens the repo, reads only AGENTS.md, and can find + run the golden-path skill.`,
    selfCheck: [
      'Why: Why is AGENTS.md "routing, not a policy dump"?',
      'When/not: What belongs in AGENTS.md vs a rule vs a skill?',
      'Quality: Show your skill index and MCP-usage section.',
      'Composition: How does AGENTS.md tie rules, skills, MCP, hooks, and the plugin together?',
    ],
    quiz: [
      {
        q: 'AGENTS.md is best described as:',
        options: [
          'A dump of every policy',
          'A routing/"start here" hub that links to rules and skills',
          'A replacement for rules',
          'A hook config',
        ],
        answer: 1,
        explain: 'AGENTS.md routes and links out; it is not where lengthy policies or procedures live.',
      },
      {
        q: 'In a multi-repo setup, the key thing AGENTS.md must clarify is:',
        options: [
          'The font',
          'Which root wins and the source of truth for cross-repo changes',
          'The CI vendor',
          'The license',
        ],
        answer: 1,
        explain: 'With several repos, precedence and source-of-truth prevent conflicting instructions.',
      },
      {
        q: 'A lengthy procedure referenced from AGENTS.md should be:',
        options: ['Pasted inline', 'Linked as a skill', 'Turned into a hook', 'Deleted'],
        answer: 1,
        explain: 'AGENTS.md links to skills for procedures rather than duplicating steps.',
      },
    ],
  },
  {
    id: 'composition',
    num: 10,
    sg: 'SG10',
    title: 'Composition (Capstone PoC)',
    tagline: 'One coherent path through ≥3 layers, traced end-to-end.',
    mnemonic: 'the whole path',
    baseline: 'The capstone: prove you can compose, not just name primitives.',
    why: `Individual primitives are table stakes. The real builder skill is **composition** — designing one coherent path from user intent through every layer so nothing falls through.

**Composition discipline:** for each workflow, trace *intent → command/skill → rules → MCP → sub-agent → hook → non-interactive tier*. **Gaps in that path become incidents or silent quality loss.**`,
    whenNot: `Compose when a real workflow genuinely spans layers (it almost always does). Don't over-compose a trivial one-off. The capstone must solve a **real** problem, not a toy exercise.`,
    quality: `- **≥3 layers**, each pulling its weight (not decoration).
- **Solves a real problem** — real enough that the manual baseline is annoying.
- **Written trace** — every hop named, with the artifact that provides it.
- **Gap analysis** — for each hop, "what breaks if this layer is missing?"
- **Demo + baseline comparison** — show the agentic solution and how it beats doing it by hand (time, errors, consistency).`,
    composition: `This module *is* composition. Use the PoC Builder in this app to pick a domain, select your layers, and generate a trace + gap checklist you can export and present.`,
    reference: `**Example — recurring CVE patch flow:**
\`\`\`
User intent ("patch this quarter's base-image CVEs")
  → command / skill : scan + dep-map                [M1/M2]
  → rules applied   : platform, registry, tag, secrets [M4]
  → MCP calls       : scanner + registry lookups      [M5]
  → sub-agent       : triage (score → propose patch)   [M6]
  → hook verify     : branch-name block; secrets scan  [M3]
  → non-interactive : routine pre-scan; CI build/scan  [M7]
  → distribution    : shipped as a plugin, routed by AGENTS.md [M8/M9]
\`\`\`
That's 7 layers — well past the ≥3 minimum. A support-triage or personal-automation PoC works just as well; pick what you'll actually run.`,
    lab: `1. **Pick a real problem** (personal or work) and open the **PoC Builder**.
2. **Assemble** ≥3 layers into one working flow.
3. **Run it end-to-end** once; **run the manual baseline** once and record time/errors/consistency.
4. **Write the trace + gap analysis**; demo it with the baseline comparison.`,
    selfCheck: [
      'Why: Why does composition discipline matter more than any single primitive?',
      'When/not: Where would over-composition add cost without value?',
      'Quality: Which ≥3 layers do the real work, and how do you know each earns its place?',
      'Composition: Walk the full path and name the incident each layer prevents.',
    ],
    quiz: [
      {
        q: 'The essence of "composition discipline" is:',
        options: [
          'Using as many primitives as possible',
          'Tracing one coherent path through the layers so no gap becomes an incident',
          'Writing more rules',
          'Avoiding sub-agents',
        ],
        answer: 1,
        explain: 'Composition is about a traced, gap-free path from intent through the layers.',
      },
      {
        q: 'A valid capstone PoC must:',
        options: [
          'Use exactly one layer',
          'Mix ≥3 layers and solve a real problem, not a toy exercise',
          'Be built only in DevOps',
          'Avoid any manual baseline',
        ],
        answer: 1,
        explain: 'The bar is ≥3 layers, a real problem, and a comparison against the manual baseline.',
      },
      {
        q: 'Why compare against a manual baseline?',
        options: [
          'To pad the demo',
          'To quantify the agentic solution’s value (time, errors, consistency)',
          'It is required by the license',
          'To slow things down',
        ],
        answer: 1,
        explain: 'The baseline comparison shows the real quality/efficiency gain over doing it by hand.',
      },
    ],
  },
]

export const moduleById = (id: string): Module | undefined => modules.find((m) => m.id === id)
