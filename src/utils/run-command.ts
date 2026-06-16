import { spawn } from 'node:child_process'

export function parseCommand(command: string | string[]): { file: string; args: string[] } {
    if (Array.isArray(command)) {
        return { file: command[0], args: command.slice(1) }
    }

    const parts = command.trim().split(/\s+/)
    return { file: parts[0], args: parts.slice(1) }
}

export function runCommand(file: string, args: string[], cwd: string): Promise<void> {
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
