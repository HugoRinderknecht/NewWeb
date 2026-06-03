import { getApiAdapter } from '../adapter'

/** 定价列表 */
export function fetchBillingConfigList() {
  return getApiAdapter().get<any[]>('/api/admin/billing')
}

/** 创建定价 */
export function fetchCreateBillingConfig(data: {
  aiProvider: string
  modelName: string
  modelType?: string
  workflowCode?: string
  inputPrice?: number
  outputPrice?: number
  description: string
  tokensPerCredit?: number
  creditRatio?: number
}) {
  return getApiAdapter().post<any>('/api/admin/billing', data)
}

/** 定价详情 */
export function fetchBillingConfigDetail(id: string) {
  return getApiAdapter().get<any>(`/api/admin/billing/${id}`)
}

/** 更新定价 */
export function fetchUpdateBillingConfig(
  id: string,
  data: {
    modelName: string
    modelType?: string
    workflowCode?: string
    inputPrice?: number
    outputPrice?: number
    creditRatio?: number
    isActive?: number
    description?: string
    changeReason?: string
  }
) {
  return getApiAdapter().put<any>(`/api/admin/billing/${id}`, data)
}

/** 启用/停用定价 */
export function fetchToggleBillingConfig(id: string) {
  return getApiAdapter().put<void>(`/api/admin/billing/${id}/toggle`)
}

/** 调价历史 */
export function fetchBillingConfigHistory(id: string) {
  return getApiAdapter().get<any[]>(`/api/admin/billing/${id}/history`)
}
