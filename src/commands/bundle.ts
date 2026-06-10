import { randomUUID } from 'node:crypto'
import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadManifest } from '../config/load.js'
import { createArchive } from '../pipeline/archive.js'
import { runBuild } from '../pipeline/build.js'
import { runPrepare } from '../pipeline/prepare.js'
import { runRequire } from '../pipeline/require.js'
import { copyIntoStaging } from '../pipeline/stage.js'
import { fail } from '../utils/fail.js'
import { requireManifest, resolveManifestPath, resolveResourceRoot } from '../utils/paths.js'

export interface BundleOptions {
    cwd?: string
    config?: string
    skipBuild?: boolean
}

export async function runBundle(options: BundleOptions): Promise<void> {
    const resourceRoot = resolveResourceRoot(options.cwd)
    const manifestPath = resolveManifestPath(resourceRoot, options.config)

    requireManifest(manifestPath)

    const manifest = loadManifest(manifestPath, resourceRoot)

    await runBuild(manifest, resourceRoot, options.skipBuild ?? false)
    runRequire(manifest, resourceRoot)
    runPrepare(manifest, resourceRoot)

    const staging = join(tmpdir(), `nxbundle-${manifest.name}-${randomUUID()}`)
    mkdirSync(staging, { recursive: true })

    try {
        copyIntoStaging(manifest, resourceRoot, staging)
        const zipPath = await createArchive(manifest, resourceRoot, staging)
        console.log(`Created ${zipPath}`)
    } finally {
        rmSync(staging, { recursive: true, force: true })
    }
}

export function handleBundleError(error: unknown): never {
    if (error instanceof Error) {
        fail(error.message)
    }
    fail(String(error))
}
