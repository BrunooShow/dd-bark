import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListCiPipelinesSchema = z.object({
  query: z.string().default(''),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
})

const SearchCiPipelinesSchema = z.object({
  query: z.string().default('*'),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
})

export const ciPipelinesCommands: Command[] = [
  {
    name: 'list-ci-pipelines',
    description: 'List CI pipeline events',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Filter query string (default: "")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of events to return (default: 25)' },
    ],
    run: async (args) => {
      const { query, from, to, limit } = ListCiPipelinesSchema.parse(args)
      const filterFrom = new Date(from * 1000).toISOString()
      const filterTo = new Date(to * 1000).toISOString()
      const response = await api.ciPipelines.listCIAppPipelineEvents({
        filterQuery: query,
        filterFrom: filterFrom,
        filterTo: filterTo,
        pageLimit: limit,
      })
      return response.data
    },
  },
  {
    name: 'search-ci-pipelines',
    description: 'Search CI pipeline events with complex query',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Search query (default: "*")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of events to return (default: 25)' },
    ],
    run: async (args) => {
      const { query, from, to, limit } = SearchCiPipelinesSchema.parse(args)
      const isoFrom = new Date(from * 1000).toISOString()
      const isoTo = new Date(to * 1000).toISOString()
      const response = await api.ciPipelines.searchCIAppPipelineEvents({
        body: {
          filter: { query, from: isoFrom, to: isoTo },
          page: { limit },
          sort: { field: '@timestamp', order: 'desc' as any },
        },
      })
      return response.data
    },
  },
]
