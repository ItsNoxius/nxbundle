import { readFileSync } from 'node:fs'
import { parse } from 'jsonc-parser'
import { applyDefaults } from './defaults.js'
import { manifestSchema, type ResolvedManifest } from './schema.js'
import { fail } from '../utils/fail.js'
import { resourceNameFromRoot } from '../utils/paths.js'

export function loadManifest(manifestPath: string, resourceRoot: string): ResolvedManifest {
    let raw: unknown

    try {
        const content = readFileSync(manifestPath, 'utf8')
        raw = parse(content)
    } catch (error) {
        if (error instanceof Error) {
            fail(`Failed to read ${manifestPath}: ${error.message}`)
        }
        fail(`Failed to read ${manifestPath}`)
    }

    const parsed = manifestSchema.safeParse(raw)
    if (!parsed.success) {
        const issues = parsed.error.issues
            .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
            .join('\n')
        fail(`Invalid nxmanifest.jsonc:\n${issues}`)
    }

    return applyDefaults(parsed.data, resourceNameFromRoot(resourceRoot))
}
