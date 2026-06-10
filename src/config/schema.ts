import { z } from 'zod'

const buildSchema = z.object({
    cwd: z.string().min(1),
    command: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
})

const ensureDirAction = z.object({
    action: z.literal('ensureDir'),
    path: z.string().min(1),
})

const copyIfMissingAction = z.object({
    action: z.literal('copyIfMissing'),
    from: z.string().min(1),
    to: z.string().min(1),
})

const prepareAction = z.discriminatedUnion('action', [ensureDirAction, copyIfMissingAction])

const archiveSchema = z.object({
    format: z.literal('zip').default('zip'),
    roots: z.union([z.literal('auto'), z.array(z.string().min(1))]).default('auto'),
})

export const manifestSchema = z.object({
    $schema: z.string().optional(),
    name: z.string().min(1).optional(),
    output: z.string().min(1).optional(),
    include: z.array(z.string().min(1)).min(1),
    build: z.union([buildSchema, z.literal(false)]).optional(),
    require: z.array(z.string().min(1)).optional(),
    prepare: z.array(prepareAction).optional(),
    archive: archiveSchema.optional(),
})

export type ManifestInput = z.input<typeof manifestSchema>
export type Manifest = z.output<typeof manifestSchema>
export type ResolvedManifest = Manifest & {
    name: string
    output: string
    archive: z.output<typeof archiveSchema>
}
