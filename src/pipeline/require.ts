import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'

export function runRequire(manifest: ResolvedManifest, resourceRoot: string): void {
    for (const item of manifest.require ?? []) {
        const path = join(resourceRoot, item)
        if (!existsSync(path)) {
            fail(`Missing required path: ${item}`)
        }
    }
}
