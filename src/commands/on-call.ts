import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const GetOnCallScheduleSchema = z.object({
  scheduleId: z.string(),
})

const GetOnCallUserSchema = z.object({
  scheduleId: z.string(),
})

const GetTeamOnCallSchema = z.object({
  teamId: z.string(),
})

export const onCallCommands: Command[] = [
  {
    name: 'get-on-call-schedule',
    description: 'Get an on-call schedule',
    params: [
      { name: 'scheduleId', type: 'string', required: true, description: 'The ID of the on-call schedule' },
    ],
    run: async (args) => {
      const { scheduleId } = GetOnCallScheduleSchema.parse(args)
      const response = await api.onCall.getOnCallSchedule({ scheduleId })
      return response.data
    },
  },
  {
    name: 'get-on-call-user',
    description: 'Get the current on-call user for a schedule',
    params: [
      { name: 'scheduleId', type: 'string', required: true, description: 'The ID of the on-call schedule' },
    ],
    run: async (args) => {
      const { scheduleId } = GetOnCallUserSchema.parse(args)
      const response = await api.onCall.getScheduleOnCallUser({ scheduleId })
      return response.data
    },
  },
  {
    name: 'get-team-on-call',
    description: 'Get on-call users for a team',
    params: [
      { name: 'teamId', type: 'string', required: true, description: 'The ID of the team' },
    ],
    run: async (args) => {
      const { teamId } = GetTeamOnCallSchema.parse(args)
      const response = await api.onCall.getTeamOnCallUsers({ teamId })
      return response.data
    },
  },
]
