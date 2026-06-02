import request from '@/utils/http'

export function fetchGetBillingList() {
  return request.get<Api.Billing.BillingItem[]>({
    url: '/api/admin/billing'
  })
}

export function fetchCreateBilling(data: Api.Billing.CreateBillingParams) {
  return request.post<Api.Billing.BillingItem>({
    url: '/api/admin/billing',
    data
  })
}

export function fetchGetBillingDetail(id: string) {
  return request.get<Api.Billing.BillingDetail>({
    url: `/api/admin/billing/${id}`
  })
}

export function fetchUpdateBilling(id: string, data: Api.Billing.UpdateBillingParams) {
  return request.put<Api.Billing.BillingItem>({
    url: `/api/admin/billing/${id}`,
    data
  })
}

export function fetchToggleBilling(id: string) {
  return request.put<Api.Billing.BillingItem>({
    url: `/api/admin/billing/${id}/toggle`
  })
}

export function fetchGetBillingHistory(id: string) {
  return request.get<Api.Billing.BillingHistoryItem[]>({
    url: `/api/admin/billing/${id}/history`
  })
}
