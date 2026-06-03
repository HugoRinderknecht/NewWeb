import { getApiAdapter } from './adapter'

interface WorkflowExecuteData {
  inputs: Record<string, any>
  traceId?: string
  userContext?: Record<string, string>
}

interface MultimodalExecuteData {
  workflowCode?: string
  inputs?: Record<string, any>
  chain?: Array<{ workflowCode: string; inputs: Record<string, any> }>
  traceId?: string
  userContext?: Record<string, string>
}

interface StyleInferenceData {
  imageUrl: string
  tagCount?: number
}

/**
 * Execute a Dify workflow by workflow code
 */
export function executeWorkflow(workflowCode: string, data: WorkflowExecuteData) {
  return getApiAdapter().post<any>(`/api/dify-workflows/${workflowCode}/execute`, data)
}

/**
 * Execute a Dify workflow with SSE streaming response
 */
export function executeWorkflowStream(workflowCode: string, data: WorkflowExecuteData) {
  return getApiAdapter().request<Response>({
    url: `/api/dify-workflows/${workflowCode}/execute-stream`,
    method: 'POST',
    data,
    responseType: 'stream'
  })
}

/**
 * Stop a running Dify workflow
 */
export function stopWorkflowRun(workflowCode: string, taskId: string) {
  return getApiAdapter().post<void>(`/api/dify-workflows/runs/${workflowCode}/${taskId}/stop`)
}

/**
 * Upload a file for Dify workflow input
 */
export function uploadDifyFile(workflowCode: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return getApiAdapter().post<any>(`/api/dify-workflows/${workflowCode}/upload-file`, formData)
}

/**
 * Get the status of a Dify workflow run
 */
export function getWorkflowRunStatus(workflowCode: string, runId: string) {
  return getApiAdapter().get<any>(`/api/dify-workflows/runs/${workflowCode}/${runId}`)
}

/**
 * Get the catalog of available Dify workflows
 */
export function getWorkflowCatalog() {
  return getApiAdapter().get<any>('/api/dify-workflows/catalog')
}

/**
 * Execute a multimodal Dify workflow
 */
export function executeMultimodalWorkflow(data: MultimodalExecuteData) {
  return getApiAdapter().post<any>('/api/dify-workflows/multimodal/execute', data)
}

/**
 * Execute a multimodal Dify workflow with SSE streaming response
 */
export function executeMultimodalStream(data: MultimodalExecuteData) {
  return getApiAdapter().request<Response>({
    url: '/api/dify-workflows/multimodal/execute-stream',
    method: 'POST',
    data,
    responseType: 'stream'
  })
}

/**
 * Execute a chain of Dify workflows
 */
export function executeChain(data: MultimodalExecuteData) {
  return getApiAdapter().post<any>('/api/dify-workflows/multimodal/execute-chain', data)
}

/**
 * Run style inference on an image
 */
export function styleInference(data: StyleInferenceData) {
  return getApiAdapter().post<any>('/api/ai/style-inference', data)
}
