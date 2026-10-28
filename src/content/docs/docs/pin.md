---
title: Pin a skill version
description: gap pin is the only command that moves a pin in gap.lock. gap sync never moves a pin.
---

```bash
gap pin <id>@<ref>
```

`gap pin` resolves a branch, tag, or commit and writes the requested ref, resolved commit, and tree to `gap.lock`. It is the only command that moves a pin. `gap sync` never moves a pin.

If a branch and a tag share a name, use `refs/heads/<name>` or `refs/tags/<name>`.

A component missing from `gap.lock` stops the sync and names the `gap pin` command to run. `gap.toml` and `gap.lock` pass the same merge gate as `global/`.

Machine sync fetches the locked commit into `~/.gap/store/<id>/<commit>/` and checks its tree against the lock. To add a skill from an existing component, add its name to that component's `names` array in `gap.toml`, merge, and pull. Sync still will not move the pin.

Overrides never write `gap.lock`. If an overridden `ref` differs from the locked ref, the command stops and names the `gap pin <id>@<ref>` command needed to change the pin.
