import { getApiAdapter } from './adapter'

export function fetchGetWorkflowList() {
  return getApiAdapter().get<Api.WorkflowManage.WorkflowManageListItem[]>(
    '/api/admin/dify-workflows'
  )
}

export function fetchCreateWorkflow(data: Api.WorkflowManage.CreateWorkflowManageParams) {
  return getApiAdapter().post<Api.WorkflowManage.WorkflowManageDetail>(
    '/api/admin/dify-workflows',
    data
  )
}

export function fetchGetWorkflowDetail(id: string) {
  return getApiAdapter().get<Api.WorkflowManage.WorkflowManageDetail>(
    `/api/admin/dify-workflows/${id}`
  )
}

export function fetchUpdateWorkflow(
  id: string,
  data: Api.WorkflowManage.UpdateWorkflowManageParams
) {
  return getApiAdapter().put<Api.WorkflowManage.WorkflowManageDetail>(
    `/api/admin/dify-workflows/${id}`,
    data
  )
}

export function fetchDeleteWorkflow(id: string) {
  return getApiAdapter().del<void>(`/api/admin/dify-workflows/${id}`)
}

export function fetchToggleWorkflowStatus(
  id: string,
  data: Api.WorkflowManage.ToggleWorkflowStatusParams
) {
  return getApiAdapter().request<void>({
    method: 'PATCH',
    url: `/api/admin/dify-workflows/${id}/status`,
    data
  })
}

export function fetchTestWorkflowConnection(data: Api.WorkflowManage.TestConnectionParams) {
  return getApiAdapter().post<Api.WorkflowManage.TestConnectionResult>(
    '/api/admin/dify-workflows/test-connection',
    data
  )
}

export function fetchTestAllWorkflowConnections() {
  return getApiAdapter().post<Api.WorkflowManage.TestConnectionResult[]>(
    '/api/admin/dify-workflows/test-all-connections'
  )
}
