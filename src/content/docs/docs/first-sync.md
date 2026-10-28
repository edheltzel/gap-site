---
title: Your first sync
description: After gap is installed, gap sync publishes global/AGENTS.md into the file each agent already reads.
---

From any folder, after `gap` is installed:

```bash
gap sync
```

`gap sync` publishes only merged rules. It refuses when:

- you're on a branch other than `master` or GitButler's `gitbutler/workspace`
- you're in a git worktree
- `global/`, `skills/`, `gap.toml`, or `gap.lock` differs from `origin/HEAD`, including untracked files in those paths

Ignored `node_modules` and `.DS_Store` do not block. An ignored file blocks only when skills.sh would install it, or when gap reads it (`global/AGENTS.md`, `global/skills.json`, top-level `global/commands/*.md`, `gap.toml`, `gap.lock`).

It prints each file it wrote:

```text
~/.claude/rules/global-agent-policy.md
~/.pi/agent/APPEND_SYSTEM.md
~/.omp/agent/APPEND_SYSTEM.md
~/.codex/gap/global-agent-policy.md
~/.cursor/rules/global-agent-policy.mdc
~/.empryo/EMPRYO.md
~/.omp/agent/commands/state-docs.md
~/.claude/commands/state-docs.md
```

Each is a regular file, not a symlink. Policy files are the shared rules. Each top-level `global/commands/*.md` is also copied, unchanged, to OMP and Claude Code. Start a new session in any agent to load the new rules.

If sync asks before it changes a file it did not write, answer in a terminal. With no terminal, it prints `Refusing to replace foreign file`, skips that file, publishes the rest, and exits 1.
