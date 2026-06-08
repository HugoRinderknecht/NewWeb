import { getApiAdapter } from './adapter'

/**
 * Seedance 接口文档要求 projectId 走 query 参数，而不是请求体字段。
 * 保留 params 入参中的 projectId 以兼容现有调用方，在请求前拆分 body/query。
 */
type SeedanceRequestWithProject<T extends Record<string, unknown>> = T & { projectId: string }

type SeedanceTaskQuery = Api.Video.VideoTaskSearchParams & {
  projectId?: string
  page?: number
  pageSize?: number
  current?: number
  size?: number
}

type SeedanceResultQuery = {
  projectId?: string
  resolution?: string
}

let lastSeedanceProjectId: string | undefined

function rememberProjectId(projectId?: string) {
  if (projectId) lastSeedanceProjectId = projectId
}

function normalizePagination<T extends Record<string, unknown> | undefined>(params: T) {
  if (!params) return undefined

  const { current, size, page, pageSize, ...rest } = params as Record<string, unknown>
  return {
    ...rest,
    page: page ?? current,
    pageSize: pageSize ?? size
  }
}

function splitProjectQuery<T extends Record<string, unknown>>(params: SeedanceRequestWithProject<T>) {
  const { projectId, ...data } = params
  rememberProjectId(projectId)
  return {
    data,
    query: { projectId }
  }
}

function resolveProjectQuery(projectId?: string) {
  const resolvedProjectId = projectId || lastSeedanceProjectId
  return resolvedProjectId ? { projectId: resolvedProjectId } : undefined
}

export function fetchPreviewVideoGeneration(params: SeedanceRequestWithProject<Api.Video.VideoPreviewParams>) {
  const { data, query } = splitProjectQuery(params)
  return getApiAdapter().post<Api.Video.VideoPreviewResult>(
    '/api/seedance/generations/preview',
    data,
    { params: query }
  )
}

export function fetchSubmitVideoGeneration(params: SeedanceRequestWithProject<Api.Video.VideoGenerateParams>) {
  const { data, query } = splitProjectQuery(params)
  return getApiAdapter().post<Api.Video.VideoSubmitResult>('/api/seedance/generations', data, {
    params: query
  })
}

export function fetchGetVideoTaskList(params?: SeedanceTaskQuery) {
  rememberProjectId(params?.projectId)
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.Video.VideoTask>>(
    '/api/seedance/tasks',
    normalizePagination(params)
  )
}

export function fetchGetVideoTaskDetail(taskId: string, params?: { projectId?: string }) {
  rememberProjectId(params?.projectId)
  return getApiAdapter().get<Api.Video.VideoTask>(
    `/api/seedance/tasks/${taskId}`,
    resolveProjectQuery(params?.projectId)
  )
}

export function fetchGetVideoTaskResult(taskId: string, params?: SeedanceResultQuery) {
  rememberProjectId(params?.projectId)
  return getApiAdapter().get<Api.Video.VideoTaskResult>(`/api/seedance/tasks/${taskId}/result`, {
    ...resolveProjectQuery(params?.projectId),
    resolution: params?.resolution
  })
}

export function fetchCancelVideoTask(taskId: string, projectId?: string) {
  rememberProjectId(projectId)
  return getApiAdapter().post<void>(`/api/seedance/tasks/${taskId}/cancel`, undefined, {
    params: resolveProjectQuery(projectId)
  })
}
