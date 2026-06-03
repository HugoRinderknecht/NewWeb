import { getApiAdapter } from '../adapter'

/** 团队列表（管理后台） */
export function fetchAdminTeamList(params?: {
  page?: number
  pageSize?: number
  keyword?: string
}) {
  return getApiAdapter().get<any>('/api/admin/manage/teams', params)
}

/** 团队详情（管理后台） */
export function fetchAdminTeamDetail(id: string) {
  return getApiAdapter().get<Record<string, any>>(`/api/admin/manage/teams/${id}`)
}
