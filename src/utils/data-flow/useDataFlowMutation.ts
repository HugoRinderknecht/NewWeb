/**
 * Vue Query Mutation 与 DataFlowBus 集成 Composable
 *
 * 为 Vue Query mutation 提供自动广播能力。
 * mutation 成功后，通过 DataFlowBus 广播变更通知，
 * 驱动所有订阅该数据类型的视图自动刷新。
 *
 * @module utils/data-flow
 */

import { useMutation } from '@tanstack/vue-query'
import { dataFlowBus } from './bus'

export interface DataFlowMutationConfig<TData, TVariables> {
  /** DataFlowBus 通道 ID（如 'flow:project-update'） */
  channelId?: string
  /** mutation 函数 */
  mutationFn: (variables: TVariables) => Promise<TData>
  /** mutation 成功后是否广播 */
  broadcastOnSuccess?: boolean
  /** 自定义广播数据 */
  broadcastData?: (data: TData, variables: TVariables) => unknown
  /** 传递给 useMutation 的其他选项 */
  vueQueryOptions?: Record<string, any>
}

/**
 * 封装 Vue Query mutation，自动与 DataFlowBus 集成。
 *
 * @example
 * ```typescript
 * // 项目删除后自动通知相关视图
 * const { mutateAsync } = useDataFlowMutation({
 *   channelId: 'flow:project-update',
 *   mutationFn: (id) => fetchDeleteProject(id),
 *   broadcastOnSuccess: true,
 *   broadcastData: (_, id) => ({ action: 'delete', id })
 * })
 *
 * // 视图端订阅变更
 * const { subscribe } = useDataFlow('flow:project-update')
 * subscribe((data) => {
 *   if (data.action === 'delete') {
 *     queryClient.invalidateQueries({ queryKey: ['projects'] })
 *   }
 * })
 * ```
 */
export function useDataFlowMutation<TData, TVariables>(
  config: DataFlowMutationConfig<TData, TVariables>
) {
  const { channelId, mutationFn, broadcastOnSuccess = true, broadcastData, vueQueryOptions = {} } = config

  const mutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      const result = await mutationFn(variables)

      if (broadcastOnSuccess && channelId) {
        const payload = broadcastData ? broadcastData(result, variables) : result
        try {
          await dataFlowBus.send(channelId, payload)
        } catch {
          // 静默失败，不影响 mutation 结果
        }
      }

      return result
    },
    ...vueQueryOptions
  })

  return mutation
}

/**
 * 订阅数据变更并在 Vue Query cache 上执行 invalidation
 *
 * @param channelId DataFlowBus 通道 ID
 * @param queryClient TanStack QueryClient 实例
 * @param invalidateMap key: queryKey 前缀，value: 是否精确匹配
 *
 * @example
 * ```typescript
 * import { queryClient } from '@/plugins/vue-query'
 * import { useDataFlowInvalidation } from '@/utils/data-flow'
 *
 * useDataFlowInvalidation(queryClient, 'flow:project-update', [
 *   { queryKey: ['projects'], exact: false },
 *   { queryKey: ['projects', 'detail'], exact: true }
 * ])
 * ```
 */
export function useDataFlowInvalidation(
  channelId: string,
  invalidateMap: Array<{ queryKey: any[]; exact?: boolean }>
) {
  dataFlowBus.subscribe(channelId, () => {
    const queryClient = (window as any).__QUERY_CLIENT__
    if (!queryClient) return

    for (const { queryKey, exact } of invalidateMap) {
      queryClient.invalidateQueries({
        queryKey: exact ? queryKey : [queryKey[0]],
        exact: !!exact
      })
    }
  })
}
