import type { Manifest, ResolvedManifest } from './schema.js'

export function applyDefaults(manifest: Manifest, resourceRootName: string): ResolvedManifest {
    const name = manifest.name ?? resourceRootName
    const output = manifest.output ?? `${name}.zip`
    const archive = manifest.archive ?? { format: 'zip' as const, roots: 'auto' as const }

    return {
        ...manifest,
        name,
        output,
        archive: {
            format: archive.format ?? 'zip',
            roots: archive.roots ?? 'auto',
        },
    }
}

export function archiveRoots(include: string[], roots: ResolvedManifest['archive']['roots']): string[] {
    if (roots !== 'auto') {
        return [...new Set(roots)]
    }

    return [...new Set(include.map((item) => item.replace(/\\/g, '/').split('/')[0]))]
}
