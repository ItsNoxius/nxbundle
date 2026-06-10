import { existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fail } from './fail.js'

export const DEFAULT_MANIFEST = 'nxmanifest.jsonc'

export function resolveResourceRoot(cwd?: string): string {
    return resolve(cwd ?? process.cwd())
}

export function resolveManifestPath(resourceRoot: string, configPath?: string): string {
    if (configPath) {
        return resolve(resourceRoot, configPath)
    }

    return join(resourceRoot, DEFAULT_MANIFEST)
}

export function requireManifest(manifestPath: string): void {
    if (!existsSync(manifestPath)) {
        fail(`Missing config: ${manifestPath}\nRun 'npx nxbundle init' to create one.`)
    }
}

export function resourceNameFromRoot(resourceRoot: string): string {
    return basename(resourceRoot)
}
