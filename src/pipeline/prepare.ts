import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'

export function runPrepare(manifest: ResolvedManifest, resourceRoot: string): void {
    for (const action of manifest.prepare ?? []) {
        switch (action.action) {
            case 'ensureDir': {
                const dir = join(resourceRoot, action.path)
                if (existsSync(dir)) {
                    break
                }
                mkdirSync(dir, { recursive: true })
                break
            }
            case 'copyIfMissing': {
                const target = join(resourceRoot, action.to)
                if (existsSync(target)) {
                    break
                }
                const source = join(resourceRoot, action.from)
                if (!existsSync(source)) {
                    break
                }
                mkdirSync(dirname(target), { recursive: true })
                cpSync(source, target)
                break
            }
            default:
                fail(`Unknown prepare action: ${(action as { action: string }).action}`)
        }
    }
}
