import { client, v1, v2 } from '@datadog/datadog-api-client'

function createConfig(): client.Configuration {
  const apiKey = process.env.DATADOG_API_KEY
  const appKey = process.env.DATADOG_APP_KEY

  if (!apiKey || !appKey) {
    console.error(
      'Error: DATADOG_API_KEY and DATADOG_APP_KEY environment variables are required.',
    )
    process.exit(1)
  }

  const config = client.createConfiguration({
    authMethods: {
      apiKeyAuth: apiKey,
      appKeyAuth: appKey,
    },
  })

  const site = process.env.DATADOG_SITE
  if (site) {
    config.setServerVariables({ site })
  }

  const subdomain = process.env.DATADOG_SUBDOMAIN
  if (subdomain) {
    config.setServerVariables({ subdomain })
  }

  config.unstableOperations = {
    'v2.listIncidents': true,
    'v2.getIncident': true,
  }

  return config
}

let _config: client.Configuration | undefined

function getConfig(): client.Configuration {
  if (!_config) {
    _config = createConfig()
  }
  return _config
}

export const api = {
  get incidents() {
    return new v2.IncidentsApi(getConfig())
  },
  get metrics() {
    return new v1.MetricsApi(getConfig())
  },
  get logs() {
    return new v2.LogsApi(getConfig())
  },
  get monitors() {
    return new v1.MonitorsApi(getConfig())
  },
  get dashboards() {
    return new v1.DashboardsApi(getConfig())
  },
  get traces() {
    return new v2.SpansApi(getConfig())
  },
  get hosts() {
    return new v1.HostsApi(getConfig())
  },
  get downtimes() {
    return new v1.DowntimesApi(getConfig())
  },
  get rum() {
    return new v2.RUMApi(getConfig())
  },
  get events() {
    return new v2.EventsApi(getConfig())
  },
  get slos() {
    return new v1.ServiceLevelObjectivesApi(getConfig())
  },
  get synthetics() {
    return new v1.SyntheticsApi(getConfig())
  },
  get errorTracking() {
    return new v2.ErrorTrackingApi(getConfig())
  },
  get onCall() {
    return new v2.OnCallApi(getConfig())
  },
  get serviceCatalog() {
    return new v2.ServiceDefinitionApi(getConfig())
  },
  get containers() {
    return new v2.ContainersApi(getConfig())
  },
  get processes() {
    return new v2.ProcessesApi(getConfig())
  },
  get tags() {
    return new v1.TagsApi(getConfig())
  },
  get ciPipelines() {
    return new v2.CIVisibilityPipelinesApi(getConfig())
  },
  get doraMetrics() {
    return new v2.DORAMetricsApi(getConfig())
  },
  get audit() {
    return new v2.AuditApi(getConfig())
  },
  get securityMonitoring() {
    return new v2.SecurityMonitoringApi(getConfig())
  },
  get scorecards() {
    return new v2.ServiceScorecardsApi(getConfig())
  },
  get notebooks() {
    return new v1.NotebooksApi(getConfig())
  },
}
