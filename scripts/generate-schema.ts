import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { manifestSchema } from '../src/config/schema.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'schema')
const outPath = join(outDir, 'nxmanifest.schema.json')

mkdirSync(outDir, { recursive: true })

const schema = zodToJsonSchema(manifestSchema, {
    target: 'jsonSchema7',
    $refStrategy: 'none',
})

writeFileSync(outPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8')
console.log(`Wrote ${outPath}`)
