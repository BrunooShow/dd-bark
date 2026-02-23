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
import { eventsCommands } from './events.js'
import { slosCommands } from './slos.js'
import { syntheticsCommands } from './synthetics.js'
import { errorTrackingCommands } from './error-tracking.js'
import { containersCommands } from './containers.js'
import { processesCommands } from './processes.js'
import { onCallCommands } from './on-call.js'
import { serviceCatalogCommands } from './service-catalog.js'
import { tagsCommands } from './tags.js'
import { ciPipelinesCommands } from './ci-pipelines.js'
import { auditCommands } from './audit.js'
import { notebooksCommands } from './notebooks.js'
import { securityCommands } from './security.js'
import { scorecardsCommands } from './scorecards.js'
import { doraMetricsCommands } from './dora-metrics.js'

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
  ...eventsCommands,
  ...slosCommands,
  ...syntheticsCommands,
  ...errorTrackingCommands,
  ...containersCommands,
  ...processesCommands,
  ...onCallCommands,
  ...serviceCatalogCommands,
  ...tagsCommands,
  ...ciPipelinesCommands,
  ...auditCommands,
  ...notebooksCommands,
  ...securityCommands,
  ...scorecardsCommands,
  ...doraMetricsCommands,
]

export const commandMap = new Map<string, Command>(
  allCommands.map((cmd) => [cmd.name, cmd]),
)

export const commandList = allCommands
