# nxbundle

Bundle FiveM resources for [Cfx.re Asset Escrow](https://docs.fivem.net/docs/server-manual/asset-escrow/) from a declarative `nxmanifest.jsonc` config.

## Install

```bash
npx nxbundle
```

Or add as a dev dependency:

```bash
npm install -D nxbundle
```

## Quick start

From a FiveM resource root (folder containing `fxmanifest.lua`):

```bash
npx nxbundle init
npx nxbundle
```

This creates `nxmanifest.jsonc`, optionally runs your NUI build, validates required paths, and writes `{name}.zip`.

## Commands

| Command | Description |
|---------|-------------|
| `npx nxbundle` | Run the bundle pipeline from `nxmanifest.jsonc` |
| `npx nxbundle init` | Scaffold a base `nxmanifest.jsonc` |
| `npx nxbundle --skip-build` | Skip the `build` step |
| `npx nxbundle --cwd <dir>` | Use a different resource root |
| `npx nxbundle --config <path>` | Use a custom manifest path |
| `npx nxbundle init --force` | Overwrite an existing manifest |

## Config

Example `nxmanifest.jsonc`:

```jsonc
{
  "$schema": "./node_modules/nxbundle/schema/nxmanifest.schema.json",
  "name": "my_resource",
  "output": "my_resource.zip",
  "include": [
    "fxmanifest.lua",
    "shared",
    "server",
    "client",
    "web/dist"
  ],
  "build": {
    "cwd": "web",
    "command": "npm run build"
  },
  "require": [
    "web/dist/index.html"
  ],
  "prepare": [
    { "action": "ensureDir", "path": "web/dist/screenshots" },
    {
      "action": "copyIfMissing",
      "from": "web/public/screenshots/README.md",
      "to": "web/dist/screenshots/README.md"
    }
  ],
  "archive": {
    "format": "zip",
    "roots": "auto"
  }
}
```

### Fields

- **`include`** — paths copied into the archive (required)
- **`build`** — optional `{ cwd, command }` or `false` to disable
- **`require`** — paths that must exist before staging (fatal if missing)
- **`prepare`** — pre-stage actions: `ensureDir`, `copyIfMissing`
- **`archive.roots`** — `"auto"` uses top-level segments from `include`, or pass an explicit list

## Requirements

- Node.js 20+
- `tar` (built into Windows 10+ and common on Linux/macOS)
- `npm` (or compatible package manager) when using a `build` step

## Publish to npm

```bash
cd nxbundle
npm run build
npm publish --access public
```

If the `nxbundle` name is taken, publish under a scope (e.g. `@noxius/nxbundle`) and update the `bin` / package name accordingly.

## Development

```bash
npm install
npm run build
node dist/cli.js --cwd ../nx_apartments --skip-build
```
