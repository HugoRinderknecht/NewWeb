import request from '@/utils/http'
import { createSSEConnection } from '@/utils/http/sse'

/**
 * 上传文件到 Dify
 * @param workflowCode 工作流编码
 * @param file 文件
 */
export function fetchUploadWorkflowFile(workflowCode: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<Api.Workflow.UploadResult>({
    url: `/api/dify-workflows/${workflowCode}/upload-file`,
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * 阻塞模式执行工作流
 * @param workflowCode 工作流编码
 * @param params 执行参数
 */
export function fetchExecuteWorkflow(workflowCode: string, params: Record<string, any>) {
  return request.post<Api.Workflow.ExecuteResult>({
    url: `/api/dify-workflows/${workflowCode}/execute`,
    params
  })
}

/**
 * SSE 流式模式执行工作流
 * @param workflowCode 工作流编码
 * @param params 执行参数
 */
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

/**
 * 停止工作流执行
 * @param workflowCode 工作流编码
 * @param taskId 任务ID
 */
export function fetchStopWorkflow(workflowCode: string, taskId: string) {
  return request.post<void>({
    url: `/api/dify-workflows/runs/${workflowCode}/${taskId}/stop`
  })
}

/**
 * 查询工作流运行状态
 * @param workflowCode 工作流编码
 * @param runId 运行ID
 */
export function fetchGetWorkflowRunStatus(workflowCode: string, runId: string) {
  return request.get<Api.Workflow.RunStatus>({
    url: `/api/dify-workflows/runs/${workflowCode}/${runId}`
  })
}

/**
 * 自适应执行单一工作流（阻塞模式）
 * @param params 执行参数
 */
export function fetchMultimodalExecute(params: Api.Workflow.MultimodalParams) {
  return request.post<Api.Workflow.ExecuteResult>({
    url: '/api/dify-workflows/multimodal/execute',
    params
  })
}

/**
 * 自适应执行工作流（SSE 流式模式）
 * @param params 执行参数
 */
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

/**
 * 链式执行工作流（阻塞模式）
 * @param params 链式参数
 */
export function fetchExecuteWorkflowChain(params: Api.Workflow.ChainParams) {
  return request.post<Api.Workflow.ExecuteResult>({
    url: '/api/dify-workflows/multimodal/execute-chain',
    params
  })
}

/**
 * 风格反推
 * @param params 反推参数
 */
export function fetchStyleInference(params: Api.Workflow.StyleInferenceParams) {
  return request.post<Api.Workflow.StyleInferenceResult>({
    url: '/api/ai/style-inference',
    params
  })
}

/**
 * 获取工作流目录
 */
export function fetchGetWorkflowCatalog() {
  return request.get<Api.Workflow.WorkflowCatalogItem[]>({
    url: '/api/dify-workflows/catalog'
  })
}
