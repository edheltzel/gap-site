---
title: Repair drifted skills
description: gap restore replaces missing or drifted component skills at the locked commit. Sync can also ask before it repairs a drift.
---

Sync checks installed managed skills against their selected source. For each drifted skill, sync shows the diff and asks:

- `k` keeps the installed copies for this run. Later runs check them again.
- `t` takes the source. Sync backs up both destinations under `~/.gap/backups/`, then reinstalls. A failed install restores the previous destinations.
- `s` skips it for now. Sync exits 1.

With no terminal to ask in, sync lists the drifted skills, changes none of them, and exits 1. Skills selected by neither `gap.toml` nor `global/skills.json` are never touched.

```bash
gap restore [id]
```

`gap restore` backs up and replaces missing or drifted component skills at the locked commit, reusing a verified store copy. `gap restore do-skills` repairs that component's selected skills without asking. Omit the id to repair all components. A failed install rolls the backup back. A verified store avoids network access.

With an effective crew profile, restore writes nothing.
