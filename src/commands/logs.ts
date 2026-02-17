import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const SUPPORTED_STORAGE_TIERS = ['indexes', 'online-archives', 'flex'] as const

function getStorageTier(): string | undefined {
  const value = process.env.DATADOG_STORAGE_TIER
  if (!value) return undefined
  const normalized = value.toLowerCase()
  if (!SUPPORTED_STORAGE_TIERS.includes(normalized as typeof SUPPORTED_STORAGE_TIERS[number])) {
    console.error(`Warning: Invalid DATADOG_STORAGE_TIER="${value}". Supported: ${SUPPORTED_STORAGE_TIERS.join(', ')}`)
    return undefined
  }
  return normalized
}

const GetLogsSchema = z.object({
  query: z.string().default(''),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(100),
})

const GetAllServicesSchema = z.object({
  query: z.string().default('*'),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(1000),
})

export const logsCommands: Command[] = [
  {
    name: 'get-logs',
    description: 'Search and retrieve logs from Datadog',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Datadog logs query string (default: "")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of logs to return (default: 100)' },
    ],
    run: async (args) => {
      const { query, from, to, limit } = GetLogsSchema.parse(args)
      const storageTier = getStorageTier()
      const filter: Record<string, string> = {
        query,
        from: `${from * 1000}`,
        to: `${to * 1000}`,
      }
      if (storageTier) filter.storageTier = storageTier

      const response = await api.logs.listLogs({
        body: { filter, page: { limit }, sort: '-timestamp' },
      })
      return response.data
    },
  },
  {
    name: 'get-all-services',
    description: 'Extract all unique service names from logs',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Optional query filter (default: "*")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max logs to search through (default: 1000)' },
    ],
    run: async (args) => {
      const { query, from, to, limit } = GetAllServicesSchema.parse(args)
      const storageTier = getStorageTier()
      const filter: Record<string, string> = {
        query,
        from: `${from * 1000}`,
        to: `${to * 1000}`,
      }
      if (storageTier) filter.storageTier = storageTier

      const response = await api.logs.listLogs({
        body: { filter, page: { limit }, sort: '-timestamp' },
      })

      const services = new Set<string>()
      for (const log of response.data ?? []) {
        if (log.attributes && (log.attributes as Record<string, unknown>).service) {
          services.add((log.attributes as Record<string, unknown>).service as string)
        }
      }
      return Array.from(services).sort()
    },
  },
]
