import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListDashboardsSchema = z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const GetDashboardSchema = z.object({
  dashboardId: z.string(),
})

export const dashboardsCommands: Command[] = [
  {
    name: 'list-dashboards',
    description: 'Get list of dashboards from Datadog',
    params: [
      { name: 'name', type: 'string', required: false, description: 'Filter dashboards by name' },
      { name: 'tags', type: 'array', required: false, description: 'Filter dashboards by tags' },
    ],
    run: async (args) => {
      const { name, tags } = ListDashboardsSchema.parse(args)
      const response = await api.dashboards.listDashboards({
        filterShared: false,
      })

      let dashboards = response.dashboards ?? []

      if (name) {
        const lower = name.toLowerCase()
        dashboards = dashboards.filter(
          (d) => d.title?.toLowerCase().includes(lower),
        )
      }
      if (tags && tags.length > 0) {
        dashboards = dashboards.filter((d) =>
          tags.some((tag) => d.description?.includes(tag)),
        )
      }

      return dashboards.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        url: `https://app.datadoghq.com/dashboard/${d.id}`,
      }))
    },
  },
  {
    name: 'get-dashboard',
    description: 'Get a dashboard from Datadog',
    params: [
      { name: 'dashboardId', type: 'string', required: true, description: 'Dashboard ID' },
    ],
    run: async (args) => {
      const { dashboardId } = GetDashboardSchema.parse(args)
      const response = await api.dashboards.getDashboard({ dashboardId })
      return response
    },
  },
]
