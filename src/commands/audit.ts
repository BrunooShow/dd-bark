import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListAuditLogsSchema = z.object({
  query: z.string().default(''),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
  sort: z.string().default('-timestamp'),
})

export const auditCommands: Command[] = [
  {
    name: 'list-audit-logs',
    description: 'List audit logs with optional filtering',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Filter query string (default: "")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of audit logs to return (default: 25)' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order: "timestamp" or "-timestamp" (default: "-timestamp")' },
    ],
    run: async (args) => {
      const { query, from, to, limit, sort } = ListAuditLogsSchema.parse(args)
      const filterFrom = new Date(from * 1000).toISOString()
      const filterTo = new Date(to * 1000).toISOString()
      const response = await api.audit.listAuditLogs({
        filterQuery: query,
        filterFrom: filterFrom,
        filterTo: filterTo,
        sort: sort as any,
        pageLimit: limit,
      })
      return response.data
    },
  },
]
