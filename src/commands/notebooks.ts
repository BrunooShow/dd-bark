import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListNotebooksSchema = z.object({
  query: z.string().optional(),
  start: z.number().default(0),
  count: z.number().default(25),
})

const GetNotebookSchema = z.object({
  notebookId: z.number(),
})

export const notebooksCommands: Command[] = [
  {
    name: 'list-notebooks',
    description: 'List notebooks with optional filtering',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Filter notebooks by query string' },
      { name: 'start', type: 'number', required: false, description: 'Pagination start offset (default: 0)' },
      { name: 'count', type: 'number', required: false, description: 'Max number of notebooks to return (default: 25)' },
    ],
    run: async (args) => {
      const { query, start, count } = ListNotebooksSchema.parse(args)
      const response = await api.notebooks.listNotebooks({ query, start, count })
      return (response.data ?? []).map((nb) => ({ id: nb.id, type: nb.type, attributes: nb.attributes }))
    },
  },
  {
    name: 'get-notebook',
    description: 'Get a specific notebook',
    params: [
      { name: 'notebookId', type: 'number', required: true, description: 'Notebook ID to fetch' },
    ],
    run: async (args) => {
      const { notebookId } = GetNotebookSchema.parse(args)
      const response = await api.notebooks.getNotebook({ notebookId })
      return response.data
    },
  },
]
