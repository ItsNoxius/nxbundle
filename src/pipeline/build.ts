import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'
import { parseCommand, runCommand } from '../utils/run-command.js'

export async function runBuild(
    manifest: ResolvedManifest,
    resourceRoot: string,
    skipBuild: boolean,
): Promise<void> {
    if (skipBuild || manifest.build === false || manifest.build === undefined) {
        return
    }

    const buildRoot = join(resourceRoot, manifest.build.cwd)
    if (!existsSync(buildRoot)) {
        fail(`Missing build directory: ${manifest.build.cwd}`)
    }

    const { file, args } = parseCommand(manifest.build.command)
    console.log(`Building (${manifest.build.command})...`)

    try {
        await runCommand(file, args, buildRoot)
    } catch {
        fail('Build failed.')
    }
}
