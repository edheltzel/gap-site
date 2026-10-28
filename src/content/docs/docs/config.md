---
title: gap.toml and gap.lock
description: gap.toml selects pinned components and their skills. gap.lock records the exact commits. Sync never moves a pin.
---

`gap.toml` selects the pinned components and their skills. `gap.lock` records the exact commits and trees. Sync never moves a pin. Only `gap pin <id>@<ref>` writes a pin.

```toml
schema = "2"
[components.do-skills]
repo  = "github.com/edheltzel/Do-Skills"
ref   = "master"
names = ["do-commit", "do-todo"]
```

A component is a repo pinned to one commit. It supplies skills, or its own installer and doctor. The distro includes Do-Skills, Forge, Echo, and Recall. Echo and Recall have empty skill lists: machine sync runs their configured `install` commands, and those installers own their skills. Gap copies no skills from them and never installs a harness.

Each component's `names` array is its skill list. An optional `load` value changes where a listed skill installs:

| `load` | Installation |
| --- | --- |
| `listed` (default), `always` | Install in the home-directory skill destinations |
| `project` | Install under the invoking project only when any `when.files` glob matches |
| `command`, `off` | Not selected for installation by sync or restore |

Sync, status, restore, and doctor read the installed distro's `gap.toml`, then `~/.config/gap/gap.toml`, then the invoking project's `.gap/gap.toml`. Later values win. `gap sync --profile <name>` applies the distro's `profiles/<name>.toml` last.

Overrides can replace an existing component's `enabled` and `ref`, or a listed skill's `load` and `when.files`. They never write `gap.lock`. If an overridden `ref` differs from the locked ref, the command stops and names the `gap pin` command to run.
