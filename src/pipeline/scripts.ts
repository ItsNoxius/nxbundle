import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'
import { parseCommand, runCommand } from '../utils/run-command.js'

export async function runScripts(
    manifest: ResolvedManifest,
    resourceRoot: string,
    skipScripts: boolean,
): Promise<void> {
    if (skipScripts || !manifest.scripts?.length) {
        return
    }

    for (const [index, script] of manifest.scripts.entries()) {
        const cwd = join(resourceRoot, script.cwd ?? '.')
        if (!existsSync(cwd)) {
            fail(`Missing script directory: ${script.cwd ?? '.'}`)
        }

        const { file, args } = parseCommand(script.command)
        const label = typeof script.command === 'string' ? script.command : script.command.join(' ')
        console.log(`Running script ${index + 1}/${manifest.scripts.length} (${label})...`)

        try {
            await runCommand(file, args, cwd)
        } catch {
            fail(`Script ${index + 1} failed.`)
        }
    }
}
