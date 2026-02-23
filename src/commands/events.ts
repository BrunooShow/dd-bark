import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'
import { nowSeconds, fifteenMinAgo } from '../utils.js'

const ListEventsSchema = z.object({
  query: z.string().default(''),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
  sort: z.string().default('timestamp'),
})

const GetEventSchema = z.object({
  eventId: z.string(),
})

const SearchEventsSchema = z.object({
  query: z.string().default('*'),
  from: z.number().default(fifteenMinAgo),
  to: z.number().default(nowSeconds),
  limit: z.number().default(25),
  sort: z.string().default('timestamp'),
})

export const eventsCommands: Command[] = [
  {
    name: 'list-events',
    description: 'List events from Datadog with query, time range, and pagination',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Filter query string (default: "")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of events to return (default: 25)' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order: "timestamp" or "-timestamp" (default: "timestamp")' },
    ],
    run: async (args) => {
      const { query, from, to, limit, sort } = ListEventsSchema.parse(args)
      const filterFrom = new Date(from * 1000).toISOString()
      const filterTo = new Date(to * 1000).toISOString()
      const response = await api.events.listEvents({
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
    name: 'get-event',
    description: 'Get a specific event by ID',
    params: [
      { name: 'eventId', type: 'string', required: true, description: 'Event ID to fetch' },
    ],
    run: async (args) => {
      const { eventId } = GetEventSchema.parse(args)
      const response = await api.events.getEvent({ eventId })
      return response.data
    },
  },
  {
    name: 'search-events',
    description: 'Search events with complex query',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Search query (default: "*")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (default: 15 min ago)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (default: now)' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of events to return (default: 25)' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order: "timestamp" (asc) or "-timestamp" (desc) (default: "timestamp")' },
    ],
    run: async (args) => {
      const { query, from, to, limit, sort } = SearchEventsSchema.parse(args)
      const isoFrom = new Date(from * 1000).toISOString()
      const isoTo = new Date(to * 1000).toISOString()
      const order = sort === '-timestamp' ? 'desc' : 'asc'
      const response = await api.events.searchEvents({
        body: {
          filter: { query, from: isoFrom, to: isoTo },
          page: { limit },
          sort: { field: 'timestamp', order: order as any },
        },
      })
      return response.data
    },
  },
]
