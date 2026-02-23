import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListSyntheticsSchema = z.object({
  pageSize: z.number().default(50),
  pageNumber: z.number().default(0),
})

const GetSyntheticResultsSchema = z.object({
  publicId: z.string(),
  type: z.enum(['api', 'browser']).default('api'),
  from: z.number().optional(),
  to: z.number().optional(),
})

const GetSyntheticTestSchema = z.object({
  publicId: z.string(),
})

export const syntheticsCommands: Command[] = [
  {
    name: 'list-synthetics',
    description: 'List all synthetic tests with optional pagination',
    params: [
      { name: 'pageSize', type: 'number', required: false, description: 'Number of tests per page (default: 50)' },
      { name: 'pageNumber', type: 'number', required: false, description: 'Page number to retrieve (default: 0)' },
    ],
    run: async (args) => {
      const { pageSize, pageNumber } = ListSyntheticsSchema.parse(args)
      const response = await api.synthetics.listTests({ pageSize, pageNumber })
      return (response.tests ?? []).map((t) => ({
        publicId: t.publicId,
        name: t.name,
        type: t.type,
        status: t.status,
        locations: t.locations,
        tags: t.tags,
        monitorId: t.monitorId,
      }))
    },
  },
  {
    name: 'get-synthetic-results',
    description: 'Get latest results for a synthetic test',
    params: [
      { name: 'publicId', type: 'string', required: true, description: 'Public ID of the synthetic test' },
      { name: 'type', type: 'string', required: false, description: 'Test type: "api" or "browser" (default: "api")' },
      { name: 'from', type: 'number', required: false, description: 'Start time in epoch seconds (converted to ms for API)' },
      { name: 'to', type: 'number', required: false, description: 'End time in epoch seconds (converted to ms for API)' },
    ],
    run: async (args) => {
      const { publicId, type, from, to } = GetSyntheticResultsSchema.parse(args)
      const params: { publicId: string; fromTs?: number; toTs?: number } = { publicId }
      if (from !== undefined) params.fromTs = from * 1000
      if (to !== undefined) params.toTs = to * 1000

      if (type === 'browser') {
        const response = await api.synthetics.getBrowserTestLatestResults(params)
        return response.results
      }
      const response = await api.synthetics.getAPITestLatestResults(params)
      return response.results
    },
  },
  {
    name: 'get-synthetic-test',
    description: 'Get a specific synthetic test configuration',
    params: [
      { name: 'publicId', type: 'string', required: true, description: 'Public ID of the synthetic test' },
    ],
    run: async (args) => {
      const { publicId } = GetSyntheticTestSchema.parse(args)
      return api.synthetics.getTest({ publicId })
    },
  },
]
