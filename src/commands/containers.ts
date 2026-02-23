import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListContainersSchema = z.object({
  filterTags: z.string().optional(),
  groupBy: z.string().optional(),
  sort: z.string().optional(),
  pageSize: z.number().default(25),
  cursor: z.string().optional(),
})

export const containersCommands: Command[] = [
  {
    name: 'list-containers',
    description: 'List containers with optional filtering',
    params: [
      { name: 'filterTags', type: 'string', required: false, description: 'Comma-separated tag filter e.g. "env:prod,service:web"' },
      { name: 'groupBy', type: 'string', required: false, description: 'Group by field' },
      { name: 'sort', type: 'string', required: false, description: 'Sort field' },
      { name: 'pageSize', type: 'number', required: false, description: 'Number of results per page (default: 25)' },
      { name: 'cursor', type: 'string', required: false, description: 'Pagination cursor' },
    ],
    run: async (args) => {
      const { filterTags, groupBy, sort, pageSize, cursor } = ListContainersSchema.parse(args)
      const response = await api.containers.listContainers({
        filterTags,
        groupBy,
        sort,
        pageSize,
        pageCursor: cursor,
      })
      return response.data
    },
  },
]
