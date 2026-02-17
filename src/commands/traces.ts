import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListTracesSchema = z.object({
  query: z.string(),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(100),
  sort: z.enum(['timestamp', '-timestamp']).default('-timestamp'),
  service: z.string().optional(),
  operation: z.string().optional(),
})

export const tracesCommands: Command[] = [
  {
    name: 'list-traces',
    description: 'Get APM traces from Datadog',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Datadog APM trace query string' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max traces to return (default: 100)' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order: "timestamp" or "-timestamp" (default: "-timestamp")' },
      { name: 'service', type: 'string', required: false, description: 'Filter by service name' },
      { name: 'operation', type: 'string', required: false, description: 'Filter by operation name' },
    ],
    run: async (args) => {
      const { query, from, to, limit, sort, service, operation } = ListTracesSchema.parse(args)

      let fullQuery = query
      if (service) fullQuery += ` service:${service}`
      if (operation) fullQuery += ` operation_name:${operation}`

      const response = await api.traces.listSpans({
        body: {
          data: {
            type: 'search_request',
            attributes: {
              filter: {
                query: fullQuery,
                from: new Date(from * 1000).toISOString(),
                to: new Date(to * 1000).toISOString(),
              },
              page: { limit },
              sort: sort === 'timestamp' ? 'timestamp' : '-timestamp',
            },
          },
        },
      })
      return response.data
    },
  },
]
