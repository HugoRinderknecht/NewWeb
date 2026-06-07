import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchGetWorkflowList,
  fetchCreateWorkflow,
  fetchGetWorkflowDetail,
  fetchUpdateWorkflow,
  fetchDeleteWorkflow,
  fetchToggleWorkflowStatus,
  fetchTestWorkflowConnection,
  fetchTestAllWorkflowConnections
} from '@/api/workflow-manage'

/** 工作流管理列表 */
export function useWorkflowList() {
  return useQuery({
    queryKey: ['workflow-manage', 'list'] as const,
    queryFn: () => fetchGetWorkflowList(),
    staleTime: 5 * 60 * 1000
  })
}

/** 工作流管理详情 */
export function useWorkflowDetail(id: string) {
  return useQuery({
    queryKey: ['workflow-manage', 'detail', id] as const,
    queryFn: () => fetchGetWorkflowDetail(id)
  })
}

/** 创建工作流 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchCreateWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-manage', 'list'] })
    }
  })
}

/** 更新工作流 */
export function useUpdateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: Parameters<typeof fetchUpdateWorkflow>[1]
    }) => fetchUpdateWorkflow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-manage', 'list'] })
    }
  })
}

/** 删除工作流 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchDeleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-manage', 'list'] })
    }
  })
}

/** 切换工作流状态 */
export function useToggleWorkflowStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fetchToggleWorkflowStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-manage', 'list'] })
    }
  })
}

/** 测试工作流连接 */
export function useTestWorkflowConnection() {
  return useMutation({
    mutationFn: fetchTestWorkflowConnection
  })
}

/** 测试所有工作流连接 */
export function useTestAllWorkflowConnections() {
  return useMutation({
    mutationFn: fetchTestAllWorkflowConnections
  })
}
