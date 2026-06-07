import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetConfigList,
  fetchCreateConfig,
  fetchGetConfigByKey,
  fetchUpdateConfig,
  fetchDeleteConfig,
  fetchGetConfigByGroup,
  fetchGetConfigAuditLog,
  fetchRefreshConfigCache,
  fetchGetWebhooks,
  fetchCreateWebhook,
  fetchUpdateWebhook,
  fetchDeleteWebhook,
  fetchTestWebhook
} from '@/api/system-config'

/** 系统配置列表 */
export function useConfigList() {
  return useQuery({
    queryKey: ['system-config', 'list'] as const,
    queryFn: () => fetchGetConfigList(),
    staleTime: 5 * 60 * 1000
  })
}

/** 按 key 获取配置详情 */
export function useConfigByKey(key: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['system-config', 'detail', key] as const,
    queryFn: async () => {
      const v = toValue(key)
      if (!v) return null
      return await fetchGetConfigByKey(v)
    },
    enabled: () => !!toValue(key)
  })
}

/** 按分组获取配置 */
export function useConfigByGroup(groupName: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['system-config', 'group', groupName] as const,
    queryFn: async () => {
      const v = toValue(groupName)
      if (!v) return []
      return await fetchGetConfigByGroup(v)
    },
    enabled: () => !!toValue(groupName)
  })
}

/** 创建系统配置 */
export function useCreateConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config', 'list'] })
    }
  })
}

/** 更新系统配置 */
export function useUpdateConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      key,
      data
    }: {
      key: string
      data: Parameters<typeof fetchUpdateConfig>[1]
    }) => fetchUpdateConfig(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config', 'list'] })
    }
  })
}

/** 删除系统配置 */
export function useDeleteConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDeleteConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config', 'list'] })
    }
  })
}

/** 配置变更审计日志 */
export function useConfigAuditLog(params?: MaybeRefOrGetter<Record<string, unknown> | undefined>) {
  return useQuery({
    queryKey: ['system-config', 'audit-log', params] as const,
    queryFn: async () => {
      const p = toValue(params)
      return await fetchGetConfigAuditLog(p as any)
    }
  })
}

/** 刷新配置缓存 */
export function useRefreshConfigCache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchRefreshConfigCache,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] })
    }
  })
}

/** Webhook 列表 */
export function useWebhookList(projectId: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['system-config', 'webhook-list', projectId] as const,
    queryFn: async () => {
      const v = toValue(projectId)
      if (!v) return []
      return await fetchGetWebhooks(v)
    },
    enabled: () => !!toValue(projectId)
  })
}

/** 创建 Webhook */
export function useCreateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      data
    }: {
      projectId: string
      data: Parameters<typeof fetchCreateWebhook>[1]
    }) => fetchCreateWebhook(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['system-config', 'webhook-list', projectId] })
    }
  })
}

/** 更新 Webhook */
export function useUpdateWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      id,
      data
    }: {
      projectId: string
      id: string
      data: Parameters<typeof fetchUpdateWebhook>[2]
    }) => fetchUpdateWebhook(projectId, id, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['system-config', 'webhook-list', projectId] })
    }
  })
}

/** 删除 Webhook */
export function useDeleteWebhook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      fetchDeleteWebhook(projectId, id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['system-config', 'webhook-list', projectId] })
    }
  })
}

/** 测试 Webhook */
export function useTestWebhook() {
  return useMutation({
    mutationFn: ({ projectId, id }: { projectId: string; id: string }) =>
      fetchTestWebhook(projectId, id)
  })
}
