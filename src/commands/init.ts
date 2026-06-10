import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ManifestInput } from '../config/schema.js'
import { fail } from '../utils/fail.js'
import { DEFAULT_MANIFEST, resolveResourceRoot, resourceNameFromRoot } from '../utils/paths.js'

const CANDIDATE_DIRS = ['shared', 'data', 'server', 'client', 'locales', 'config'] as const

const SCHEMA_PATH = './node_modules/nxbundle/schema/nxmanifest.schema.json'

export interface InitOptions {
    cwd?: string
    force?: boolean
}

function detectManifest(resourceRoot: string): ManifestInput {
    const fxmanifest = join(resourceRoot, 'fxmanifest.lua')
    if (!existsSync(fxmanifest)) {
        fail(
            `Missing fxmanifest.lua in ${resourceRoot}.\n` +
                'nxbundle init must be run from a FiveM resource root.',
        )
    }

    const name = resourceNameFromRoot(resourceRoot)
    const include: string[] = ['fxmanifest.lua']

    for (const dir of CANDIDATE_DIRS) {
        if (existsSync(join(resourceRoot, dir))) {
            include.push(dir)
        }
    }

    const manifest: ManifestInput = {
        $schema: SCHEMA_PATH,
        name,
        output: `${name}.zip`,
        include,
    }

    const webPackage = join(resourceRoot, 'web', 'package.json')
    if (existsSync(webPackage)) {
        include.push('web/dist')
        manifest.build = {
            cwd: 'web',
            command: 'npm run build',
        }
        manifest.require = ['web/dist/index.html']

        const publicScreenshots = join(resourceRoot, 'web', 'public', 'screenshots')
        if (existsSync(publicScreenshots)) {
            manifest.prepare = [
                { action: 'ensureDir', path: 'web/dist/screenshots' },
                {
                    action: 'copyIfMissing',
                    from: 'web/public/screenshots/README.md',
                    to: 'web/dist/screenshots/README.md',
                },
            ]
        }
    }

    manifest.archive = {
        format: 'zip',
        roots: 'auto',
    }

    return manifest
}

function formatJsonc(manifest: ManifestInput): string {
    const lines: string[] = [
        '{',
        `  "$schema": "${manifest.$schema}",`,
        '  // Optional; defaults to parent folder name',
        `  "name": "${manifest.name}",`,
        '  // Optional; defaults to "{name}.zip"',
        `  "output": "${manifest.output}",`,
        '  "include": [',
    ]

    const includeItems = manifest.include ?? []
    for (let i = 0; i < includeItems.length; i++) {
        const comma = i < includeItems.length - 1 ? ',' : ''
        lines.push(`    "${includeItems[i]}"${comma}`)
    }
    lines.push('  ],')

    if (manifest.build && manifest.build !== false) {
        lines.push('  // Omit or set false to skip; overridable with --skip-build')
        lines.push('  "build": {')
        lines.push(`    "cwd": "${manifest.build.cwd}",`)
        const command =
            typeof manifest.build.command === 'string'
                ? manifest.build.command
                : manifest.build.command.join(' ')
        lines.push(`    "command": "${command}"`)
        lines.push('  },')
    }

    if (manifest.require?.length) {
        lines.push('  // Fatal if missing after build')
        lines.push('  "require": [')
        for (let i = 0; i < manifest.require.length; i++) {
            const comma = i < manifest.require.length - 1 ? ',' : ''
            lines.push(`    "${manifest.require[i]}"${comma}`)
        }
        lines.push('  ],')
    }

    if (manifest.prepare?.length) {
        lines.push('  // Declarative prep before staging')
        lines.push('  "prepare": [')
        for (let i = 0; i < manifest.prepare.length; i++) {
            const action = manifest.prepare[i]
            const comma = i < manifest.prepare.length - 1 ? ',' : ''
            if (action.action === 'ensureDir') {
                lines.push(`    { "action": "ensureDir", "path": "${action.path}" }${comma}`)
            } else {
                lines.push(
                    `    { "action": "copyIfMissing", "from": "${action.from}", "to": "${action.to}" }${comma}`,
                )
            }
        }
        lines.push('  ],')
    }

    lines.push('  "archive": {')
    lines.push('    // "zip" only in v1')
    lines.push('    "format": "zip",')
    lines.push('    // "auto" = unique top-level segments from include')
    lines.push('    "roots": "auto"')
    lines.push('  }')
    lines.push('}')
    lines.push('')

    return lines.join('\n')
}

export function runInit(options: InitOptions): void {
    const resourceRoot = resolveResourceRoot(options.cwd)
    const manifestPath = join(resourceRoot, DEFAULT_MANIFEST)

    if (existsSync(manifestPath) && !options.force) {
        fail(`${DEFAULT_MANIFEST} already exists. Use --force to overwrite.`)
    }

    const manifest = detectManifest(resourceRoot)
    writeFileSync(manifestPath, formatJsonc(manifest), 'utf8')
    console.log(`Created ${manifestPath}`)
}
