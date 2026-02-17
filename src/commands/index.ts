import type { Command } from '../utils.js'
import { incidentCommands } from './incidents.js'
import { metricsCommands } from './metrics.js'
import { logsCommands } from './logs.js'
import { monitorsCommands } from './monitors.js'
import { dashboardsCommands } from './dashboards.js'
import { tracesCommands } from './traces.js'
import { hostsCommands } from './hosts.js'
import { downtimesCommands } from './downtimes.js'
import { rumCommands } from './rum.js'

const allCommands: Command[] = [
  ...incidentCommands,
  ...metricsCommands,
  ...logsCommands,
  ...monitorsCommands,
  ...dashboardsCommands,
  ...tracesCommands,
  ...hostsCommands,
  ...downtimesCommands,
  ...rumCommands,
]

export const commandMap = new Map<string, Command>(
  allCommands.map((cmd) => [cmd.name, cmd]),
)

export const commandList = allCommands
