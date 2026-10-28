---
title: Agents and where GAP writes
description: Where Claude, Pi, OMP, Codex, Cursor, Empryo, and Grok read the policy gap sync publishes.
---

| Agent | File it reads |
| --- | --- |
| Claude | `~/.claude/rules/global-agent-policy.md` |
| Pi | `~/.pi/agent/APPEND_SYSTEM.md` |
| OMP | `~/.omp/agent/APPEND_SYSTEM.md` |
| Codex | `~/.codex/gap/global-agent-policy.md`, printed by the SessionStart and SubagentStart hooks |
| Cursor | `~/.cursor/rules/global-agent-policy.mdc` |
| Empryo | `~/.empryo/EMPRYO.md`, beside the SoulStack block. The first sync asks once, so run it from a terminal. |
| Grok | No file of its own. It reads the Claude copy. |

## Codex

Codex has no rules folder. The first `gap sync` adds SessionStart and SubagentStart hooks to `~/.codex/hooks.json`. They print `~/.codex/gap/global-agent-policy.md` into every Codex session and subagent. Open Codex, run `/hooks`, and trust both GAP hooks.

If `~/.codex/AGENTS.md` still holds an old copy, `gap sync --remove-codex-legacy` strips it. The flag refuses unless both hooks were already in `hooks.json`. GAP uses `~/.codex` unless you set `CODEX_HOME`. An empty `CODEX_HOME` counts as unset. A relative path is refused.

## Grok

Grok reads the Claude copy when Claude compatibility is on, which is the default.

```bash
grok inspect
```

Look for `~/.claude/rules/global-agent-policy.md` in the global rules list. If it's missing, turn Claude compatibility back on. Don't add a Grok file. A second copy would load the policy twice.

## Empryo

Empryo reads `~/.empryo/EMPRYO.md`. The first `gap sync` asks once to append the GAP block, so run it from a terminal and type `y`. gap never writes Empryo's config. Until your pins match, `gap sync` prints the exact `settings` call. Ask an agent inside Empryo to run it.

## Don't create ~/CLAUDE.md

Claude searches parent folders for `CLAUDE.md`. A file at `~/CLAUDE.md` sits above every project and stops Claude from reading that project's `AGENTS.md`. The Claude rules file above already covers every project.
