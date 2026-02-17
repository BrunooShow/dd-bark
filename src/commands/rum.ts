import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const GetRumEventsSchema = z.object({
  query: z.string().default(''),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(100),
})

const GetRumGroupedEventCountSchema = z.object({
  query: z.string().default('*'),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  groupBy: z.string().default('application.name'),
})

const GetRumPagePerformanceSchema = z.object({
  query: z.string().default('*'),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  metricNames: z
    .array(z.string())
    .default([
      'view.load_time',
      'view.first_contentful_paint',
      'view.largest_contentful_paint',
    ]),
})

const GetRumPageWaterfallSchema = z.object({
  applicationName: z.string(),
  sessionId: z.string(),
})

export const rumCommands: Command[] = [
  {
    name: 'get-rum-applications',
    description: 'Get all RUM applications in the organization',
    params: [],
    run: async () => {
      const response = await api.rum.getRUMApplications()
      return response.data
    },
  },
  {
    name: 'get-rum-events',
    description: 'Search and retrieve RUM events from Datadog',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Datadog RUM query string (default: "")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max events to return (default: 100)' },
    ],
    run: async (args) => {
      const { query, from, to, limit } = GetRumEventsSchema.parse(args)
      const response = await api.rum.listRUMEvents({
        filterQuery: query,
        filterFrom: new Date(from * 1000),
        filterTo: new Date(to * 1000),
        pageLimit: limit,
      })
      return response.data
    },
  },
  {
    name: 'get-rum-grouped-event-count',
    description: 'Search, group and count RUM events by dimension',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Query filter (default: "*")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'groupBy', type: 'string', required: false, description: 'Dimension to group by (default: "application.name")' },
    ],
    run: async (args) => {
      const { query, from, to, groupBy } = GetRumGroupedEventCountSchema.parse(args)
      const response = await api.rum.listRUMEvents({
        filterQuery: query,
        filterFrom: new Date(from * 1000),
        filterTo: new Date(to * 1000),
        pageLimit: 1000,
      })

      const counts: Record<string, number> = {}
      for (const event of response.data ?? []) {
        const attrs = event.attributes as Record<string, unknown> | undefined
        const key = String(getNestedValue(attrs, groupBy) ?? 'unknown')
        counts[key] = (counts[key] ?? 0) + 1
      }
      return counts
    },
  },
  {
    name: 'get-rum-page-performance',
    description: 'Get page (view) performance metrics from RUM data',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Query filter (default: "*")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'metricNames', type: 'array', required: false, description: 'Metrics to collect (default: ["view.load_time","view.first_contentful_paint","view.largest_contentful_paint"])' },
    ],
    run: async (args) => {
      const { query, from, to, metricNames } = GetRumPagePerformanceSchema.parse(args)
      const response = await api.rum.listRUMEvents({
        filterQuery: `@type:view ${query}`,
        filterFrom: new Date(from * 1000),
        filterTo: new Date(to * 1000),
        pageLimit: 1000,
      })

      const metrics: Record<string, { avg: number; min: number; max: number; count: number }> = {}
      for (const name of metricNames) {
        const values: number[] = []
        for (const event of response.data ?? []) {
          const attrs = event.attributes as Record<string, unknown> | undefined
          const val = getNestedValue(attrs, name)
          if (typeof val === 'number') values.push(val)
        }
        if (values.length > 0) {
          metrics[name] = {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
          }
        }
      }
      return metrics
    },
  },
  {
    name: 'get-rum-page-waterfall',
    description: 'Retrieve RUM page waterfall data by application and session',
    params: [
      { name: 'applicationName', type: 'string', required: true, description: 'Application name to filter' },
      { name: 'sessionId', type: 'string', required: true, description: 'Session ID to filter' },
    ],
    run: async (args) => {
      const { applicationName, sessionId } = GetRumPageWaterfallSchema.parse(args)
      const response = await api.rum.listRUMEvents({
        filterQuery: `@application.name:${applicationName} @session.id:${sessionId}`,
        pageLimit: 1000,
      })
      return response.data
    },
  },
]

function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
