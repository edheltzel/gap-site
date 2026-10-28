---
title: Install gap
description: Install the gap command with Go 1.25 or newer. Node is required only for skills listed in global/skills.json.
---

You need Go 1.25 or newer (`go version`) and Go's bin folder on your `PATH`: `$(go env GOPATH)/bin`, or `GOBIN` if you set it.

```bash
curl -fsSL https://raw.githubusercontent.com/edheltzel/GAP/master/scripts/install.sh | sh
```

That line does four things:

1. `curl` downloads `scripts/install.sh` from the `master` branch of `github.com/edheltzel/GAP`.
2. The script clones that repo into a new checkout under `~/.gap/checkouts/` and keeps it there.
3. It builds `gap` with `go install ./cmd/gap` and puts the binary in Go's bin folder.
4. It checks whether your shell can find that folder. If not, it prints the `export PATH=...` line to add. Open a new terminal after adding it.

It needs Go 1.25 or newer and git. Installation writes the source checkout and the Go binary. `gap sync` publishes the policy and installs the selected components and skills.

Already have the repo checked out? From its root, `sh scripts/install.sh` builds that copy instead of cloning. `go install ./cmd/gap` from the repo root does the build step on its own. `gap` publishes the checkout it was built from, so it runs from any folder. To skip installing, run `go run ./cmd/gap sync` from a checkout.

Then publish:

```bash
gap sync
```

## Node

Component skill installation, drift repair, and restore do not use Node or `npx`.

Additional skills in `global/skills.json` install through skills.sh (`npx`). They require Node. If that installation is needed but `npx` is unavailable, sync still publishes the policy, skips that installation, and exits 1.
