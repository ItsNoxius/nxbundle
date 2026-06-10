import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import type { ResolvedManifest } from '../config/schema.js'
import { fail } from '../utils/fail.js'

function parseCommand(command: string | string[]): { file: string; args: string[] } {
    if (Array.isArray(command)) {
        return { file: command[0], args: command.slice(1) }
    }

    const parts = command.trim().split(/\s+/)
    return { file: parts[0], args: parts.slice(1) }
}

function runCommand(file: string, args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const proc = spawn(file, args, {
            cwd,
            stdio: 'inherit',
            shell: process.platform === 'win32',
        })

        proc.on('error', reject)
        proc.on('close', (code) => {
            if (code === 0) {
                resolve()
                return
            }
            reject(new Error(`Command failed with exit code ${code ?? 'unknown'}`))
        })
    })
}

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
