import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { archiveRoots } from '../config/defaults.js'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'

function runTar(args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn('tar', args, {
            cwd,
            stdio: 'inherit',
            shell: false,
        })

        proc.on('error', reject)
        proc.on('close', (code) => {
            if (code === 0) {
                resolve()
                return
            }
            reject(new Error(`tar failed with exit code ${code ?? 'unknown'}`))
        })
    })
}

export async function createArchive(
    manifest: ResolvedManifest,
    resourceRoot: string,
    staging: string,
): Promise<string> {
    const zipPath = join(resourceRoot, manifest.output)

    if (existsSync(zipPath)) {
        rmSync(zipPath, { force: true })
    }

    if (manifest.archive.format !== 'zip') {
        fail(`Unsupported archive format: ${manifest.archive.format}`)
    }

    const roots = archiveRoots(manifest.include, manifest.archive.roots)

    try {
        await runTar(['-acf', zipPath, ...roots], staging)
    } catch {
        fail('Failed to create zip archive.')
    }

    return zipPath
}
