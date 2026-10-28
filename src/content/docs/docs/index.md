---
title: What GAP does
description: GAP is one set of rules that every coding agent on your machine follows. gap sync copies global/AGENTS.md into the file each agent already reads.
---

GAP is one set of rules that every coding agent on your machine follows. You, or an agent, write the rules once in `global/AGENTS.md`. The `gap sync` command copies them into the file each agent already reads.

| Agent | File it reads |
| --- | --- |
| Claude | `~/.claude/rules/global-agent-policy.md` |
| Pi | `~/.pi/agent/APPEND_SYSTEM.md` |
| OMP | `~/.omp/agent/APPEND_SYSTEM.md` |
| Codex | `~/.codex/gap/global-agent-policy.md`, printed by the SessionStart and SubagentStart hooks |
| Cursor | `~/.cursor/rules/global-agent-policy.mdc` |
| Empryo | `~/.empryo/EMPRYO.md`, beside the SoulStack block. The first sync asks once, so run it from a terminal. |
| Grok | No file of its own. It reads the Claude copy. |

Keep one policy for every agent. Don't add a policy file for a single agent. Longer notes linked from the policy live in `global/docs/agents/`.
