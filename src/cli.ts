import { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleBundleError, runBundle } from './commands/bundle.js'
import { runInit } from './commands/init.js'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
    version: string
}

const program = new Command()

program
    .name('nxbundle')
    .description('Bundle FiveM resources for Cfx.re Asset Escrow')
    .version(packageJson.version)
    .option('--cwd <dir>', 'resource root directory', process.cwd())
    .option('--config <path>', 'path to nxmanifest.jsonc')
    .option('--skip-build', 'skip the build step')
    .option('--skip-scripts', 'skip the scripts step')
    .action(async (options: { cwd: string; config?: string; skipBuild?: boolean; skipScripts?: boolean }) => {
        try {
            await runBundle({
                cwd: options.cwd,
                config: options.config,
                skipBuild: options.skipBuild,
                skipScripts: options.skipScripts,
            })
        } catch (error) {
            handleBundleError(error)
        }
    })

program
    .command('init')
    .description('create a base nxmanifest.jsonc in the current resource')
    .option('--force', 'overwrite an existing nxmanifest.jsonc')
    .action((options: { force?: boolean }, command) => {
        const parent = command.parent as Command | null
        const cwd = (parent?.opts() as { cwd?: string }).cwd ?? process.cwd()
        runInit({ cwd, force: options.force })
    })

program.parse()
