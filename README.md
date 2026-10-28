# GAP: Global Agent Policies

Landing page and docs for [GAP](https://github.com/edheltzel/GAP). One rules file, copied into the file each coding agent already reads. Docs: [gap.edheltzel.codes](https://gap.edheltzel.codes).

## Install GAP

```bash
curl -fsSL https://raw.githubusercontent.com/edheltzel/GAP/master/scripts/install.sh | sh
```

## Local development

Needs Node 22.

```bash
npm ci
npm run dev
```

`npm run build` writes the static site to `dist/`.

## License

MIT. See [LICENSE](LICENSE).
