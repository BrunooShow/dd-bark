import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListDORADeploymentsSchema = z.object({
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
})

const ListDORAFailuresSchema = z.object({
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
})

export const doraMetricsCommands: Command[] = [
  {
    name: 'list-dora-deployments',
    description: 'List DORA deployment events',
    params: [
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of deployments to return (default: 25)' },
    ],
    run: async (args) => {
      const { from, to, limit } = ListDORADeploymentsSchema.parse(args)
      const isoFrom = new Date(from * 1000).toISOString()
      const isoTo = new Date(to * 1000).toISOString()
      const response = await api.doraMetrics.listDORADeployments({
        body: {
          data: {
            attributes: {
              from: isoFrom,
              to: isoTo,
            },
            type: 'dora_deployments_request',
          },
        },
      } as any)
      return response.data
    },
  },
  {
    name: 'list-dora-failures',
    description: 'List DORA failure events',
    params: [
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of failures to return (default: 25)' },
    ],
    run: async (args) => {
      const { from, to, limit } = ListDORAFailuresSchema.parse(args)
      const isoFrom = new Date(from * 1000).toISOString()
      const isoTo = new Date(to * 1000).toISOString()
      const response = await api.doraMetrics.listDORAFailures({
        body: {
          data: {
            attributes: {
              from: isoFrom,
              to: isoTo,
            },
            type: 'dora_failures_request',
          },
        },
      } as any)
      return response.data
    },
  },
]
