import request from '@/utils/http'

export function fetchGetConfigList() {
  return request.get<Api.SystemConfig.ConfigListItem[]>({
    url: '/api/admin/config'
  })
}

export function fetchCreateConfig(data: Api.SystemConfig.CreateConfigParams) {
  return request.post<Api.SystemConfig.ConfigDetail>({
    url: '/api/admin/config',
    data
  })
}

export function fetchGetConfigByKey(key: string) {
  return request.get<Api.SystemConfig.ConfigDetail>({
    url: `/api/admin/config/${key}`
  })
}

export function fetchUpdateConfig(key: string, data: Api.SystemConfig.UpdateConfigParams) {
  return request.put<Api.SystemConfig.ConfigDetail>({
    url: `/api/admin/config/${key}`,
    data
  })
}

export function fetchDeleteConfig(key: string) {
  return request.del<void>({
    url: `/api/admin/config/${key}`
  })
}

export function fetchGetConfigByGroup(groupName: string) {
  return request.get<Api.SystemConfig.ConfigListItem[]>({
    url: `/api/admin/config/group/${groupName}`
  })
}

export function fetchGetConfigAuditLog(params?: Api.SystemConfig.ConfigSearchParams) {
  return request.get<Api.SystemConfig.AuditLogItem[]>({
    url: '/api/admin/config/audit',
    params
  })
}

export function fetchRefreshConfigCache() {
  return request.post<void>({
    url: '/api/admin/config/refresh'
  })
}

export function fetchGetWebhooks(projectId: string) {
  return request.get<Api.SystemConfig.WebhookListItem[]>({
    url: `/api/projects/${projectId}/webhooks`
  })
}

export function fetchCreateWebhook(projectId: string, data: Api.SystemConfig.CreateWebhookParams) {
  return request.post<Api.SystemConfig.WebhookListItem>({
    url: `/api/projects/${projectId}/webhooks`,
    data
  })
}

export function fetchUpdateWebhook(projectId: string, id: string, data: Api.SystemConfig.UpdateWebhookParams) {
  return request.put<Api.SystemConfig.WebhookListItem>({
    url: `/api/projects/${projectId}/webhooks/${id}`,
    data
  })
}

export function fetchDeleteWebhook(projectId: string, id: string) {
  return request.del<void>({
    url: `/api/projects/${projectId}/webhooks/${id}`
  })
}

export function fetchTestWebhook(projectId: string, id: string) {
  return request.post<Api.SystemConfig.WebhookTestResult>({
    url: `/api/projects/${projectId}/webhooks/${id}/test`
  })
}
