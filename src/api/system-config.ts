import { getApiAdapter } from './adapter'

export function fetchGetConfigList() {
  return getApiAdapter().get<Api.SystemConfig.ConfigListItem[]>('/api/admin/config')
}

export function fetchCreateConfig(data: Api.SystemConfig.CreateConfigParams) {
  return getApiAdapter().post<Api.SystemConfig.ConfigDetail>('/api/admin/config', data)
}

export function fetchGetConfigByKey(key: string) {
  return getApiAdapter().get<Api.SystemConfig.ConfigDetail>(`/api/admin/config/${key}`)
}

export function fetchUpdateConfig(key: string, data: Api.SystemConfig.UpdateConfigParams) {
  return getApiAdapter().put<Api.SystemConfig.ConfigDetail>(`/api/admin/config/${key}`, data)
}

export function fetchDeleteConfig(key: string) {
  return getApiAdapter().del<void>(`/api/admin/config/${key}`)
}

export function fetchGetConfigByGroup(groupName: string) {
  return getApiAdapter().get<Api.SystemConfig.ConfigListItem[]>(
    `/api/admin/config/group/${groupName}`
  )
}

export function fetchGetConfigAuditLog(params?: Api.SystemConfig.ConfigSearchParams) {
  return getApiAdapter().get<Api.SystemConfig.AuditLogItem[]>('/api/admin/config/audit', params)
}

export function fetchRefreshConfigCache() {
  return getApiAdapter().post<void>('/api/admin/config/refresh')
}

export function fetchGetWebhooks(projectId: string) {
  return getApiAdapter().get<Api.SystemConfig.WebhookListItem[]>(
    `/api/projects/${projectId}/webhooks`
  )
}

export function fetchCreateWebhook(projectId: string, data: Api.SystemConfig.CreateWebhookParams) {
  return getApiAdapter().post<Api.SystemConfig.WebhookListItem>(
    `/api/projects/${projectId}/webhooks`,
    data
  )
}

export function fetchUpdateWebhook(
  projectId: string,
  id: string,
  data: Api.SystemConfig.UpdateWebhookParams
) {
  return getApiAdapter().put<Api.SystemConfig.WebhookListItem>(
    `/api/projects/${projectId}/webhooks/${id}`,
    data
  )
}

export function fetchDeleteWebhook(projectId: string, id: string) {
  return getApiAdapter().del<void>(`/api/projects/${projectId}/webhooks/${id}`)
}

export function fetchTestWebhook(projectId: string, id: string) {
  return getApiAdapter().post<Api.SystemConfig.WebhookTestResult>(
    `/api/projects/${projectId}/webhooks/${id}/test`
  )
}
