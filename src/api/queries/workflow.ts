import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchExecuteWorkflow,
  fetchStopWorkflow,
  fetchGetWorkflowRunStatus,
  fetchMultimodalExecute,
  fetchExecuteWorkflowChain,
  fetchStyleInference,
  fetchGetWorkflowCatalog
} from '@/api/workflow'

import { workflowKeys } from './keys'

/** 工作流目录 */
export function useWorkflowCatalog() {
  return useQuery({
    queryKey: workflowKeys.catalog(),
    queryFn: async () => {
      const res = await fetchGetWorkflowCatalog()
      return res ?? []
    },
    staleTime: 5 * 60 * 1000
  })
}

/** 工作流运行状态 */
export function useWorkflowRunStatus(
  workflowCode: MaybeRefOrGetter<string | undefined>,
  runId: MaybeRefOrGetter<string | undefined>
) {
  return useQuery({
    queryKey: workflowKeys.runStatus(workflowCode, runId),
    queryFn: async () => {
      const code = toValue(workflowCode)
      const rid = toValue(runId)
      if (!code || !rid) return null
      return await fetchGetWorkflowRunStatus(code, rid)
    },
    enabled: () => !!toValue(workflowCode) && !!toValue(runId),
    staleTime: 10 * 1000,
    refetchInterval: 5000
  })
}

// SSE 相关的 mutation 由调用方自行处理 SSE 连接

/** 执行工作流 */
export function useExecuteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { workflowCode: string; params: Record<string, any> }) =>
      fetchExecuteWorkflow(payload.workflowCode, payload.params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.runStatuses() })
    }
  })
}

/** 停止工作流 */
export function useStopWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { workflowCode: string; taskId: string }) =>
      fetchStopWorkflow(payload.workflowCode, payload.taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.runStatuses() })
    }
  })
}

/** 多模态执行 */
export function useMultimodalExecute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Workflow.MultimodalParams) => fetchMultimodalExecute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.runStatuses() })
    }
  })
}

/** 执行工作流链 */
export function useExecuteWorkflowChain() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Workflow.ChainParams) => fetchExecuteWorkflowChain(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowKeys.runStatuses() })
    }
  })
}

/** 风格推理 */
export function useStyleInference() {
  return useMutation({
    mutationFn: (params: Api.Workflow.StyleInferenceParams) => fetchStyleInference(params)
  })
}
