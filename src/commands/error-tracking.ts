import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListErrorIssuesSchema = z.object({
  query: z.string().default(''),
  limit: z.number().default(25),
})

const GetErrorIssueSchema = z.object({
  issueId: z.string(),
})

export const errorTrackingCommands: Command[] = [
  {
    name: 'list-error-issues',
    description: 'Search error tracking issues',
    params: [
      { name: 'query', type: 'string', required: false, description: 'Search query string (default: "")' },
      { name: 'limit', type: 'number', required: false, description: 'Max number of issues to return (default: 25)' },
    ],
    run: async (args) => {
      const { query, limit } = ListErrorIssuesSchema.parse(args)
      const response = await api.errorTracking.searchIssues({
        body: { query: query || '' },
      })
      const data = response.data ?? []
      return data.slice(0, limit)
    },
  },
  {
    name: 'get-error-issue',
    description: 'Get a specific error tracking issue',
    params: [
      { name: 'issueId', type: 'string', required: true, description: 'The error tracking issue ID' },
    ],
    run: async (args) => {
      const { issueId } = GetErrorIssueSchema.parse(args)
      const response = await api.errorTracking.getIssue({ issueId })
      return response.data
    },
  },
]
