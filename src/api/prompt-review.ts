import { getApiAdapter } from './adapter'

/** 提交提示词审核 */
export function fetchSubmitPromptReview(promptId: string, note?: string) {
  return getApiAdapter().post<void>(`/api/prompts/${promptId}/submit-review`, undefined, {
    params: { note }
  })
}

/** 撤回提示词审核 */
export function fetchWithdrawPromptReview(promptId: string, reason?: string) {
  return getApiAdapter().post<void>(`/api/prompts/${promptId}/withdraw-review`, undefined, {
    params: { reason }
  })
}

/** 获取提示词审核状态 */
export function fetchGetPromptReviewStatus(promptId: string) {
  return getApiAdapter().get<any>(`/api/prompts/${promptId}/review-status`)
}
