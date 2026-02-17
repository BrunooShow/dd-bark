/** Current time in epoch seconds */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/** 15 minutes ago in epoch seconds */
export function fifteenMinAgo(): number {
  return nowSeconds() - 15 * 60
}

export interface ParamDef {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  default?: unknown
}

export interface Command {
  name: string
  description: string
  params: ParamDef[]
  run: (args: Record<string, unknown>) => Promise<unknown>
}

export function parseArgs(argv: string[]): {
  command: string | undefined
  flags: Record<string, unknown>
} {
  const [command, ...rest] = argv
  const flags: Record<string, unknown> = {}

  for (const arg of rest) {
    if (!arg.startsWith('--')) continue

    const eqIdx = arg.indexOf('=')
    if (eqIdx === -1) {
      // --flag with no value → boolean true (e.g. --help, --currentOnly)
      flags[arg.slice(2)] = true
      continue
    }

    const key = arg.slice(2, eqIdx)
    const raw = arg.slice(eqIdx + 1)
    flags[key] = coerce(raw)
  }

  return { command, flags }
}

function coerce(value: string): unknown {
  // Try JSON parse first (handles arrays, objects, numbers, booleans, null)
  try {
    return JSON.parse(value)
  } catch {
    // Fall back to string
    return value
  }
}
