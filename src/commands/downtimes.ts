import { z } from 'zod'
import { v1 } from '@datadog/datadog-api-client'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListDowntimesSchema = z.object({
  currentOnly: z.boolean().optional(),
  monitorId: z.number().optional(),
})

const ScheduleDowntimeSchema = z.object({
  scope: z.string(),
  start: z.number().optional(),
  end: z.number().optional(),
  message: z.string().optional(),
  timezone: z.string().optional(),
  monitorId: z.number().optional(),
  monitorTags: z.array(z.string()).optional(),
  recurrence: z
    .object({
      type: z.enum(['days', 'weeks', 'months', 'years']),
      period: z.number().min(1),
      weekDays: z
        .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']))
        .optional(),
      until: z.number().optional(),
    })
    .optional(),
})

const CancelDowntimeSchema = z.object({
  downtimeId: z.number(),
})

export const downtimesCommands: Command[] = [
  {
    name: 'list-downtimes',
    description: 'List scheduled downtimes from Datadog',
    params: [
      { name: 'currentOnly', type: 'boolean', required: false, description: 'Only return active downtimes' },
      { name: 'monitorId', type: 'number', required: false, description: 'Filter by monitor ID' },
    ],
    run: async (args) => {
      const { currentOnly } = ListDowntimesSchema.parse(args)
      const response = await api.downtimes.listDowntimes({ currentOnly })
      return response
    },
  },
  {
    name: 'schedule-downtime',
    description: 'Schedule a downtime in Datadog',
    params: [
      { name: 'scope', type: 'string', required: true, description: 'Downtime scope (e.g. "host:my-host")' },
      { name: 'start', type: 'number', required: false, description: 'UNIX timestamp start' },
      { name: 'end', type: 'number', required: false, description: 'UNIX timestamp end' },
      { name: 'message', type: 'string', required: false, description: 'Downtime message' },
      { name: 'timezone', type: 'string', required: false, description: 'Timezone (e.g. "UTC", "America/New_York")' },
      { name: 'monitorId', type: 'number', required: false, description: 'Monitor ID to mute' },
      { name: 'monitorTags', type: 'array', required: false, description: 'Monitor tags to filter' },
      { name: 'recurrence', type: 'object', required: false, description: 'Recurrence config JSON: {"type":"days","period":1,...}' },
    ],
    run: async (args) => {
      const params = ScheduleDowntimeSchema.parse(args)
      const body: v1.Downtime = {
        scope: [params.scope],
        start: params.start,
        end: params.end,
        message: params.message,
        timezone: params.timezone,
        monitorId: params.monitorId,
        monitorTags: params.monitorTags,
      }
      if (params.recurrence) {
        body.recurrence = {
          type: params.recurrence.type,
          period: params.recurrence.period,
          weekDays: params.recurrence.weekDays,
        }
      }
      const response = await api.downtimes.createDowntime({ body })
      return response
    },
  },
  {
    name: 'cancel-downtime',
    description: 'Cancel a scheduled downtime in Datadog',
    params: [
      { name: 'downtimeId', type: 'number', required: true, description: 'ID of the downtime to cancel' },
    ],
    run: async (args) => {
      const { downtimeId } = CancelDowntimeSchema.parse(args)
      await api.downtimes.cancelDowntime({ downtimeId })
      return { status: 'success', message: `Cancelled downtime ${downtimeId}` }
    },
  },
]
