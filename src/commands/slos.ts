import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListSLOsSchema = z.object({
  query: z.string().optional(),
  tags: z.string().optional(),
  limit: z.number().default(25),
  offset: z.number().default(0),
})

const GetSLOSchema = z.object({
  sloId: z.string(),
})

const GetSLOHistorySchema = z.object({
  sloId: z.string(),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
})

export const slosCommands: Command[] = [
  {
    name: 'list-slos',
    description: 'List SLOs, optionally filtered by query or tags',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Filter SLOs by query' },
      { name: 'tags', type: 'string', required: false, description: 'Comma-separated tags to filter by' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of SLOs to return (default: 25)' },
      { name: 'offset', type: 'number', required: false, description: 'Pagination offset (default: 0)' },
    ],
    run: async (args) => {
      const { query, tags, limit, offset } = ListSLOsSchema.parse(args)
      const response = await api.slos.listSLOs({
        query,
        tagsQuery: tags,
        limit,
        offset,
      })
      return (response.data ?? []).map((slo: any) => ({
        id: slo.id,
        name: slo.name,
        description: slo.description,
        type: slo.type,
        tags: slo.tags,
        thresholds: slo.thresholds,
        overallStatus: slo.overallStatus,
      }))
    },
  },
  {
    name: 'get-slo',
    description: 'Get SLO details by ID',
    params: [
      { name: 'sloId', type: 'string', required: true, description: 'SLO ID to fetch' },
    ],
    run: async (args) => {
      const { sloId } = GetSLOSchema.parse(args)
      const response = await api.slos.getSLO({ sloId })
      return response.data
    },
  },
  {
    name: 'get-slo-history',
    description: 'Get SLO history with error budget info',
    params: [
      { name: 'sloId', type: 'string', required: true, description: 'SLO ID to fetch history for' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
    ],
    run: async (args) => {
      const { sloId, from, to } = GetSLOHistorySchema.parse(args)
      const response = await api.slos.getSLOHistory({ sloId, fromTs: from, toTs: to })
      return response.data
    },
  },
]
