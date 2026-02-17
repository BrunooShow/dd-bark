import { ZodError } from 'zod'
import { commandMap, commandList } from './commands/index.js'
import { parseArgs } from './utils.js'

function printHelp() {
  console.log('dd-bark — Datadog CLI for AI agents\n')
  console.log('Usage: dd-bark <command> [--param=value ...]\n')
  console.log('Environment variables:')
  console.log('  DATADOG_API_KEY      (required) Datadog API key')
  console.log('  DATADOG_APP_KEY      (required) Datadog application key')
  console.log('  DATADOG_SITE         (optional) Datadog site (e.g. datadoghq.eu)')
  console.log('  DATADOG_SUBDOMAIN    (optional) Subdomain for enterprise accounts')
  console.log('  DATADOG_STORAGE_TIER (optional) Logs storage tier: indexes, online-archives, flex\n')
  console.log('Commands:')

  const maxLen = Math.max(...commandList.map((c) => c.name.length))
  for (const cmd of commandList) {
    console.log(`  ${cmd.name.padEnd(maxLen + 2)} ${cmd.description}`)
  }

  console.log(`\nRun "dd-bark <command> --help" for command-specific parameters.`)
}

function printCommandHelp(name: string) {
  const cmd = commandMap.get(name)
  if (!cmd) {
    console.error(`Unknown command: ${name}`)
    process.exit(1)
  }

  console.log(`dd-bark ${cmd.name}\n`)
  console.log(`  ${cmd.description}\n`)

  if (cmd.params.length === 0) {
    console.log('  No parameters.\n')
    return
  }

  console.log('Parameters:')
  const maxLen = Math.max(...cmd.params.map((p) => p.name.length))
  for (const p of cmd.params) {
    const req = p.required ? '(required)' : '(optional)'
    console.log(`  --${p.name.padEnd(maxLen + 2)} ${req} [${p.type}] ${p.description}`)
  }
  console.log()
}

function formatError(err: unknown, commandName: string): string {
  if (err instanceof ZodError) {
    const lines = err.issues.map((issue) => {
      const path = issue.path.join('.')
      return `  --${path}: ${issue.message}`
    })
    return `Invalid parameters for "${commandName}":\n${lines.join('\n')}\n\nRun "dd-bark ${commandName} --help" for usage.`
  }
  if (err instanceof Error) return err.message
  return String(err)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp()
    process.exit(0)
  }

  const { command, flags } = parseArgs(args)

  if (!command || command.startsWith('-')) {
    printHelp()
    process.exit(0)
  }

  if (flags.help || flags.h) {
    printCommandHelp(command)
    process.exit(0)
  }

  const cmd = commandMap.get(command)
  if (!cmd) {
    console.error(`Error: Unknown command "${command}"\n`)
    console.error('Run "dd-bark --help" to see available commands.')
    process.exit(1)
  }

  try {
    const result = await cmd.run(flags)
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    console.error(`Error: ${formatError(err, command)}`)
    process.exit(1)
  }
}

main()
