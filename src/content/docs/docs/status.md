---
title: Check status
description: gap status shows each component's pin and any skill drift. It writes nothing and exits 1 on drift.
---

```bash
gap status
```

`gap status` shows each component's pin, its store copy, and skill drift. It writes nothing. It exits 1 on skill drift or an unpinned, missing, changed, or unreadable source checkout.

`store=missing` means the checkout is absent. `store=changed` means its source files differ from the pin. `store=unpinned` means `gap.lock` has no entry. For these states, status prints the matching repair command.

It does not check Recall's memory database or additional manifest skills. Skill drift is checked only when the source checkout matches the lock. Ignored, untracked build output does not change the result. Tracked edits, deletions, and mode changes do.

With an effective crew profile, status reports `crew: project files only`.

Color and tables are used in a terminal. Output is plain text when redirected.
