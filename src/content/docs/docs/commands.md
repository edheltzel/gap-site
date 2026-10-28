---
title: Commands
description: gap sync, gap status, gap restore, gap pin, gap doctor, and gap init.
---

| Command | What it does |
| --- | --- |
| `gap sync` | Publish `global/AGENTS.md` and each `global/commands/*.md`, install missing skills, and check skills for drift |
| `gap sync --profile crew` | Prepare project files for cloud agents without fetching components or writing to the home directory |
| `gap sync --remove-codex-legacy` | Same as sync, then strip the old policy copy from `~/.codex/AGENTS.md` |
| `gap status` | Show each component's pin, its store copy, and skill drift. Writes nothing; exits 1 on skill drift or an unpinned, missing, changed, or unreadable source checkout |
| `gap restore [id]` | Back up and replace missing or drifted component skills at the locked commit, reusing a verified store copy |
| `gap pin <id>@<ref>` | Resolve a branch, tag, or commit and write it to `gap.lock`. The only command that moves a pin |
| `gap doctor` | Run configured component doctors and report which harness commands are on `PATH` |
| `gap init [--adopt] [dir]` | Create project configuration and a policy pointer. `--adopt` reports and preserves existing project files |
| `go test ./...` | Run the self-test against throwaway folders |

Use `gap --help` or `gap <command> --help` for usage and flags. Status and doctor reports use color and tables in terminals, and plain text when redirected.

`go test ./...` builds `gap` inside a throwaway clone and runs it against a temporary home folder. It never touches your real agent files.
