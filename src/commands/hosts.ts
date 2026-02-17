import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const MuteHostSchema = z.object({
  hostname: z.string(),
  message: z.string().optional(),
  end: z.number().optional(),
  override: z.boolean().default(false),
})

const UnmuteHostSchema = z.object({
  hostname: z.string(),
})

const ListHostsSchema = z.object({
  filter: z.string().optional(),
  sort_field: z.string().optional(),
  sort_dir: z.string().optional(),
  start: z.number().optional(),
  count: z.number().max(1000).optional(),
  from: z.number().optional(),
  include_muted_hosts_data: z.boolean().optional(),
  include_hosts_metadata: z.boolean().optional(),
})

const GetActiveHostsCountSchema = z.object({
  from: z.number().default(7200),
})

export const hostsCommands: Command[] = [
  {
    name: 'mute-host',
    description: 'Mute a host in Datadog',
    params: [
      { name: 'hostname', type: 'string', required: true, description: 'The name of the host to mute' },
      { name: 'message', type: 'string', required: false, description: 'Message to associate with the muting' },
      { name: 'end', type: 'number', required: false, description: 'POSIX timestamp for when the mute should end' },
      { name: 'override', type: 'boolean', required: false, description: 'If true and host is already muted, replaces existing end time (default: false)' },
    ],
    run: async (args) => {
      const { hostname, message, end, override } = MuteHostSchema.parse(args)
      await api.hosts.muteHost({
        hostName: hostname,
        body: { message, end, override },
      })
      return {
        status: 'success',
        message: `Host ${hostname} has been muted${message ? ` with message: ${message}` : ''}${end ? ` until ${new Date(end * 1000).toISOString()}` : ''}`,
      }
    },
  },
  {
    name: 'unmute-host',
    description: 'Unmute a host in Datadog',
    params: [
      { name: 'hostname', type: 'string', required: true, description: 'The name of the host to unmute' },
    ],
    run: async (args) => {
      const { hostname } = UnmuteHostSchema.parse(args)
      await api.hosts.unmuteHost({ hostName: hostname })
      return { status: 'success', message: `Host ${hostname} has been unmuted` }
    },
  },
  {
    name: 'list-hosts',
    description: 'Get list of hosts from Datadog',
    params: [
      { name: 'filter', type: 'string', required: false, description: 'Filter string for search results' },
      { name: 'sort_field', type: 'string', required: false, description: 'Field to sort hosts by' },
      { name: 'sort_dir', type: 'string', required: false, description: 'Sort direction (asc/desc)' },
      { name: 'start', type: 'number', required: false, description: 'Starting offset for pagination' },
      { name: 'count', type: 'number', required: false, description: 'Max number of hosts to return (max: 1000)' },
      { name: 'from', type: 'number', required: false, description: 'Search hosts from this UNIX timestamp' },
      { name: 'include_muted_hosts_data', type: 'boolean', required: false, description: 'Include muted hosts status and expiry' },
      { name: 'include_hosts_metadata', type: 'boolean', required: false, description: 'Include host metadata (version, platform, etc)' },
    ],
    run: async (args) => {
      const {
        filter, sort_field, sort_dir, start, count, from,
        include_muted_hosts_data, include_hosts_metadata,
      } = ListHostsSchema.parse(args)

      const response = await api.hosts.listHosts({
        filter,
        sortField: sort_field,
        sortDir: sort_dir,
        start,
        count,
        from,
        includeMutedHostsData: include_muted_hosts_data,
        includeHostsMetadata: include_hosts_metadata,
      })

      return (response.hostList ?? []).map((host) => ({
        name: host.name,
        id: host.id,
        aliases: host.aliases,
        apps: host.apps,
        muted: host.isMuted,
        lastReported: host.lastReportedTime,
        meta: host.meta,
        metrics: host.metrics,
        sources: host.sources,
        up: host.up,
      }))
    },
  },
  {
    name: 'get-active-hosts-count',
    description: 'Get the total number of active hosts in Datadog (defaults to last 2 hours)',
    params: [
      { name: 'from', type: 'number', required: false, description: 'Number of seconds window (default: 7200 = 2 hours)' },
    ],
    run: async (args) => {
      const { from } = GetActiveHostsCountSchema.parse(args)
      const response = await api.hosts.getHostTotals({ from })
      return {
        totalActive: response.totalActive ?? 0,
        totalUp: response.totalUp ?? 0,
      }
    },
  },
]
