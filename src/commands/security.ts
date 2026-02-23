import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListSecuritySignalsSchema = z.object({
  query: z.string().default(''),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
  sort: z.string().default('-timestamp'),
})

const ListSecurityRulesSchema = z.object({
  pageSize: z.number().default(25),
  pageNumber: z.number().default(0),
  query: z.string().optional(),
})

export const securityCommands: Command[] = [
  {
    name: 'list-security-signals',
    description: 'List security monitoring signals',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Filter query string (default: "")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of signals to return (default: 25)' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order (default: "-timestamp")' },
    ],
    run: async (args) => {
      const { query, from, to, limit, sort } = ListSecuritySignalsSchema.parse(args)
      const filterFrom = new Date(from * 1000).toISOString()
      const filterTo = new Date(to * 1000).toISOString()
      const response = await api.securityMonitoring.listSecurityMonitoringSignals({
        filterQuery: query,
        filterFrom: filterFrom,
        filterTo: filterTo,
        sort: sort as any,
        pageLimit: limit,
      })
      return response.data
    },
  },
  {
    name: 'list-security-rules',
    description: 'List security monitoring rules',
    params: [
      { name: 'pageSize', type: 'number', required: false, description: 'Number of rules per page (default: 25)' },
      { name: 'pageNumber', type: 'number', required: false, description: 'Page number (default: 0)' },
      { name: 'query', type: 'string', required: false, description: 'Optional filter query' },
    ],
    run: async (args) => {
      const { pageSize, pageNumber, query } = ListSecurityRulesSchema.parse(args)
      const response = await api.securityMonitoring.listSecurityMonitoringRules({
        pageSize,
        pageNumber,
        ...(query ? { query } : {}),
      })
      return response.data
    },
  },
]
