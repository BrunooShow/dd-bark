import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListScorecardRulesSchema = z.object({
  pageSize: z.number().default(25),
  pageOffset: z.number().default(0),
})

const ListScorecardOutcomesSchema = z.object({
  pageSize: z.number().default(25),
  pageOffset: z.number().default(0),
})

export const scorecardsCommands: Command[] = [
  {
    name: 'list-scorecard-rules',
    description: 'List service scorecard rules',
    params: [
      { name: 'pageSize', type: 'number', required: false, description: 'Number of rules per page (default: 25)' },
      { name: 'pageOffset', type: 'number', required: false, description: 'Pagination offset (default: 0)' },
    ],
    run: async (args) => {
      const { pageSize, pageOffset } = ListScorecardRulesSchema.parse(args)
      const response = await api.scorecards.listScorecardRules({
        pageSize,
        pageOffset,
      })
      return response.data
    },
  },
  {
    name: 'list-scorecard-outcomes',
    description: 'List service scorecard outcomes',
    params: [
      { name: 'pageSize', type: 'number', required: false, description: 'Number of outcomes per page (default: 25)' },
      { name: 'pageOffset', type: 'number', required: false, description: 'Pagination offset (default: 0)' },
    ],
    run: async (args) => {
      const { pageSize, pageOffset } = ListScorecardOutcomesSchema.parse(args)
      const response = await api.scorecards.listScorecardOutcomes({
        pageSize,
        pageOffset,
      })
      return response.data
    },
  },
]
