import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const QueryMetricsSchema = z.object({
  query: z.string(),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
})

export const metricsCommands: Command[] = [
  {
    name: 'get-metrics',
    description: 'Query timeseries points of metrics from Datadog',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Datadog metrics query (e.g. "avg:system.cpu.user{*}")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
    ],
    run: async (args) => {
      const { from, to, query } = QueryMetricsSchema.parse(args)
      const response = await api.metrics.queryMetrics({ from, to, query })
      return response
    },
  },
]
