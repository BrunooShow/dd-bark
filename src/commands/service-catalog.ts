import { z } from 'zod'
import { api } from '../config.js'
import type { Command } from '../utils.js'

const ListServiceDefinitionsSchema = z.object({
  pageSize: z.number().default(25),
  pageNumber: z.number().default(0),
})

const GetServiceDefinitionSchema = z.object({
  serviceName: z.string(),
})

export const serviceCatalogCommands: Command[] = [
  {
    name: 'list-service-definitions',
    description: 'List all service definitions from the catalog',
    params: [
      { name: 'pageSize', type: 'number', required: false, description: 'Number of results per page (default: 25)' },
      { name: 'pageNumber', type: 'number', required: false, description: 'Page number to retrieve (default: 0)' },
    ],
    run: async (args) => {
      const { pageSize, pageNumber } = ListServiceDefinitionsSchema.parse(args)
      const response = await api.serviceCatalog.listServiceDefinitions({ pageSize, pageNumber })
      return response.data
    },
  },
  {
    name: 'get-service-definition',
    description: 'Get a specific service definition',
    params: [
      { name: 'serviceName', type: 'string', required: true, description: 'The name of the service' },
    ],
    run: async (args) => {
      const { serviceName } = GetServiceDefinitionSchema.parse(args)
      const response = await api.serviceCatalog.getServiceDefinition({ serviceName })
      return response.data
    },
  },
]
