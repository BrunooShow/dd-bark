import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListIncidentsSchema = z.object({
  pageSize: z.number().min(1).max(100).default(10),
  pageOffset: z.number().min(0).default(0),
})

const GetIncidentSchema = z.object({
  incidentId: z.string(),
})

export const incidentCommands: Command[] = [
  {
    name: 'list-incidents',
    description: 'Get incidents from Datadog',
    params: [
      { name: 'pageSize', type: 'number', required: false, description: 'Number of incidents per page (1-100, default: 10)' },
      { name: 'pageOffset', type: 'number', required: false, description: 'Pagination offset (default: 0)' },
    ],
    run: async (args) => {
      const { pageSize, pageOffset } = ListIncidentsSchema.parse(args)
      const response = await api.incidents.listIncidents({ pageSize, pageOffset })
      return response.data
    },
  },
  {
    name: 'get-incident',
    description: 'Get an incident from Datadog',
    params: [
      { name: 'incidentId', type: 'string', required: true, description: 'Incident ID to fetch' },
    ],
    run: async (args) => {
      const { incidentId } = GetIncidentSchema.parse(args)
      const response = await api.incidents.getIncident({ incidentId })
      return response.data
    },
  },
]
