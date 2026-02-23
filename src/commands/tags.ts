import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const GetHostTagsSchema = z.object({
  hostName: z.string(),
})

const ListHostTagsSchema = z.object({
  source: z.string().optional(),
})

export const tagsCommands: Command[] = [
  {
    name: 'get-host-tags',
    description: 'Get tags for a specific host',
    params: [
      { name: 'hostName', type: 'string', required: true, description: 'The name of the host' },
    ],
    run: async (args) => {
      const { hostName } = GetHostTagsSchema.parse(args)
      const response = await api.tags.getHostTags({ hostName })
      return response.tags
    },
  },
  {
    name: 'list-host-tags',
    description: 'Get mapping of all tags to hosts',
    params: [
      { name: 'source', type: 'string', required: false, description: 'Source of the tags (e.g. chef, datadog)' },
    ],
    run: async (args) => {
      const { source } = ListHostTagsSchema.parse(args)
      const response = await api.tags.listHostTags({ ...(source ? { source } : {}) })
      return response.tags
    },
  },
]
