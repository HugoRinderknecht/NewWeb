import { getApiAdapter } from './adapter'

/** 提交提示词审核 */
export function fetchSubmitPromptReview(promptId: string, projectId: string, note?: string) {
  return getApiAdapter().post<void>(`/api/prompts/${promptId}/submit-review`, undefined, {
    params: { projectId, note }
  })
}

/** 撤回提示词审核 */
export function fetchWithdrawPromptReview(promptId: string, projectId: string, reason?: string) {
  return getApiAdapter().post<void>(`/api/prompts/${promptId}/withdraw-review`, undefined, {
    params: { projectId, reason }
  })
}

/** 获取提示词审核状态 */
export function fetchGetPromptReviewStatus(promptId: string, projectId: string) {
  return getApiAdapter().get<any>(`/api/prompts/${promptId}/review-status`, { projectId })
}
