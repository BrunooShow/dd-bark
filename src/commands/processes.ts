import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListProcessesSchema = z.object({
  search: z.string().optional(),
  tags: z.string().optional(),
  from: z.number().optional(),
  to: z.number().optional(),
  limit: z.number().default(25),
  cursor: z.string().optional(),
})

export const processesCommands: Command[] = [
  {
    name: 'list-processes',
    description: 'List processes with optional search/filtering',
    params: [
      { name: 'search', type: 'string', required: false, description: 'Search query' },
      { name: 'tags', type: 'string', required: false, description: 'Comma-separated tag filter' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds' },
      { name: 'limit', type: 'number', required: false, description: 'Number of results per page (default: 25)' },
      { name: 'cursor', type: 'string', required: false, description: 'Pagination cursor' },
    ],
    run: async (args) => {
      const { search, tags, from, to, limit, cursor } = ListProcessesSchema.parse(args)
      const response = await api.processes.listProcesses({
        search,
        tags,
        from,
        to,
        pageLimit: limit,
        pageCursor: cursor,
      })
      return response.data
    },
  },
]
