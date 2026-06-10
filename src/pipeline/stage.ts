import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'

export function copyIntoStaging(
    manifest: ResolvedManifest,
    resourceRoot: string,
    staging: string,
): void {
    for (const item of manifest.include) {
        const source = join(resourceRoot, item)
        if (!existsSync(source)) {
            fail(`Missing required path: ${item}`)
        }

        const target = join(staging, item)
        mkdirSync(dirname(target), { recursive: true })
        cpSync(source, target, { recursive: true })
    }
}
