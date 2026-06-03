import { getApiAdapter } from './adapter'

export function fetchGetBillingList() {
  return getApiAdapter().get<Api.Billing.BillingItem[]>('/api/admin/billing')
}

export function fetchCreateBilling(data: Api.Billing.CreateBillingParams) {
  return getApiAdapter().post<Api.Billing.BillingItem>('/api/admin/billing', data)
}

export function fetchGetBillingDetail(id: string) {
  return getApiAdapter().get<Api.Billing.BillingDetail>(`/api/admin/billing/${id}`)
}

export function fetchUpdateBilling(id: string, data: Api.Billing.UpdateBillingParams) {
  return getApiAdapter().put<Api.Billing.BillingItem>(`/api/admin/billing/${id}`, data)
}

export function fetchToggleBilling(id: string) {
  return getApiAdapter().put<Api.Billing.BillingItem>(`/api/admin/billing/${id}/toggle`)
}

export function fetchGetBillingHistory(id: string) {
  return getApiAdapter().get<Api.Billing.BillingHistoryItem[]>(`/api/admin/billing/${id}/history`)
}
