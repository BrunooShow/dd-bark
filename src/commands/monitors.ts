import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const GetMonitorsSchema = z.object({
  groupStates: z
    .array(z.enum(['alert', 'warn', 'no data', 'ok']))
    .optional(),
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const monitorsCommands: Command[] = [
  {
    name: 'get-monitors',
    description: 'Get monitors status from Datadog',
    params: [
      { name: 'groupStates', type: 'array', required: false, description: 'Filter by states: ["alert","warn","no data","ok"]' },
      { name: 'name', type: 'string', required: false, description: 'Filter monitors by name' },
      { name: 'tags', type: 'array', required: false, description: 'Filter monitors by tags' },
    ],
    run: async (args) => {
      const { groupStates, name, tags } = GetMonitorsSchema.parse(args)
      const response = await api.monitors.listMonitors({
        groupStates: groupStates?.join(','),
        name,
        monitorTags: tags?.join(','),
      })

      const summary = { total: response.length, alert: 0, warn: 0, ok: 0, noData: 0 }
      for (const m of response) {
        const state = m.overallState
        if (state === 'Alert') summary.alert++
        else if (state === 'Warn') summary.warn++
        else if (state === 'OK' || state === 'Ok') summary.ok++
        else if (state === 'No Data') summary.noData++
      }

      return {
        summary,
        monitors: response.map((m) => ({
          id: m.id,
          name: m.name,
          type: m.type,
          state: m.overallState,
          message: m.message,
          tags: m.tags,
        })),
      }
    },
  },
]
