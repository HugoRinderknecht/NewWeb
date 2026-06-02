import request from '@/utils/http'

export function fetchGetWorkflowList() {
  return request.get<Api.WorkflowManage.WorkflowManageListItem[]>({
    url: '/api/admin/dify-workflows'
  })
}

export function fetchCreateWorkflow(data: Api.WorkflowManage.CreateWorkflowManageParams) {
  return request.post<Api.WorkflowManage.WorkflowManageDetail>({
    url: '/api/admin/dify-workflows',
    data
  })
}

export function fetchGetWorkflowDetail(id: string) {
  return request.get<Api.WorkflowManage.WorkflowManageDetail>({
    url: `/api/admin/dify-workflows/${id}`
  })
}

export function fetchUpdateWorkflow(id: string, data: Api.WorkflowManage.UpdateWorkflowManageParams) {
  return request.put<Api.WorkflowManage.WorkflowManageDetail>({
    url: `/api/admin/dify-workflows/${id}`,
    data
  })
}

export function fetchDeleteWorkflow(id: string) {
  return request.del<void>({
    url: `/api/admin/dify-workflows/${id}`
  })
}

export function fetchToggleWorkflowStatus(id: string, data: Api.WorkflowManage.ToggleWorkflowStatusParams) {
  return request.request<void>({
    method: 'PATCH',
    url: `/api/admin/dify-workflows/${id}/status`,
    data
  })
}

export function fetchTestWorkflowConnection(data: Api.WorkflowManage.TestConnectionParams) {
  return request.post<Api.WorkflowManage.TestConnectionResult>({
    url: '/api/admin/dify-workflows/test-connection',
    data
  })
}

export function fetchTestAllWorkflowConnections() {
  return request.post<Api.WorkflowManage.TestConnectionResult[]>({
    url: '/api/admin/dify-workflows/test-all-connections'
  })
}
