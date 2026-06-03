import { getApiAdapter } from './adapter'
import { createSSEConnection } from '@/utils/http/sse'

export function fetchUploadWorkflowFile(workflowCode: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return getApiAdapter().post<Api.Workflow.UploadResult>(
    `/api/dify-workflows/${workflowCode}/upload-file`,
    formData
  )
}

export function fetchExecuteWorkflow(workflowCode: string, params: Record<string, any>) {
  return getApiAdapter().post<Api.Workflow.ExecuteResult>(
    `/api/dify-workflows/${workflowCode}/execute`,
    params
  )
}

export function fetchExecuteWorkflowStream(
  workflowCode: string,
  params: Record<string, any>,
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
) {
  return createSSEConnection({
    url: `/api/dify-workflows/${workflowCode}/execute-stream`,
    body: params,
    onMessage,
    onError,
    onComplete
  })
}

export function fetchStopWorkflow(workflowCode: string, taskId: string) {
  return getApiAdapter().post<void>(`/api/dify-workflows/runs/${workflowCode}/${taskId}/stop`)
}

export function fetchGetWorkflowRunStatus(workflowCode: string, runId: string) {
  return getApiAdapter().get<Api.Workflow.RunStatus>(
    `/api/dify-workflows/runs/${workflowCode}/${runId}`
  )
}

export function fetchMultimodalExecute(params: Api.Workflow.MultimodalParams) {
  return getApiAdapter().post<Api.Workflow.ExecuteResult>(
    '/api/dify-workflows/multimodal/execute',
    params
  )
}

export function fetchMultimodalExecuteStream(
  params: Api.Workflow.MultimodalParams,
  onMessage: (data: any) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
) {
  return createSSEConnection({
    url: '/api/dify-workflows/multimodal/execute-stream',
    body: params,
    onMessage,
    onError,
    onComplete
  })
}

export function fetchExecuteWorkflowChain(params: Api.Workflow.ChainParams) {
  return getApiAdapter().post<Api.Workflow.ExecuteResult>(
    '/api/dify-workflows/multimodal/execute-chain',
    params
  )
}

export function fetchStyleInference(params: Api.Workflow.StyleInferenceParams) {
  return getApiAdapter().post<Api.Workflow.StyleInferenceResult>('/api/ai/style-inference', params)
}

export function fetchGetWorkflowCatalog() {
  return getApiAdapter().get<Api.Workflow.WorkflowCatalogItem[]>('/api/dify-workflows/catalog')
}
