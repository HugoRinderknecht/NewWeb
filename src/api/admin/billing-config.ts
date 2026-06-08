import { getApiAdapter } from '../adapter'

/** 定价列表 */
export function fetchBillingConfigList() {
  return getApiAdapter().get<Api.Billing.BillingItem[]>('/api/admin/billing')
}

/** 创建定价 */
export function fetchCreateBillingConfig(data: Api.Billing.CreateBillingParams) {
  return getApiAdapter().post<Api.Billing.BillingItem>('/api/admin/billing', data)
}

/** 定价详情 */
export function fetchBillingConfigDetail(id: string) {
  return getApiAdapter().get<Api.Billing.BillingDetail>(`/api/admin/billing/${id}`)
}

/** 更新定价 */
export function fetchUpdateBillingConfig(
  id: string,
  data: Api.Billing.UpdateBillingParams
) {
  return getApiAdapter().put<Api.Billing.BillingItem>(`/api/admin/billing/${id}`, data)
}

/** 启用/停用定价 */
export function fetchToggleBillingConfig(id: string) {
  return getApiAdapter().put<void>(`/api/admin/billing/${id}/toggle`)
}

/** 调价历史 */
export function fetchBillingConfigHistory(id: string) {
  return getApiAdapter().get<Api.Billing.BillingHistoryItem[]>(`/api/admin/billing/${id}/history`)
}
