import { ElMessage } from 'element-plus'
import { useBatchReviewDecision } from '@/api/queries/review'

export interface BatchReviewResult {
  successCount: number
  failCount: number
  failures: Array<{ reason: string }>
}

export function useReviewBatchActions() {
  const { mutateAsync: batchDecision } = useBatchReviewDecision()

  const batchLoading = ref(false)

  /**
   * 批量通过审核
   */
  async function batchApprove(taskIds: string[]): Promise<BatchReviewResult | null> {
    batchLoading.value = true
    try {
      const result = await batchDecision({
        taskIds,
        decision: 'approved',
        comment: '批量审批'
      })
      if (result && typeof result === 'object') {
        const {
          successCount = taskIds.length,
          failCount = 0,
          failures = []
        } = result as BatchReviewResult
        if (failCount === 0) {
          ElMessage.success(`已批量通过 ${successCount} 项`)
        } else if (successCount === 0) {
          ElMessage.error(`批量通过失败：${failures[0]?.reason || '所有任务均未通过'}`)
        } else {
          ElMessage.warning(
            `部分通过：成功 ${successCount} 项，失败 ${failCount} 项${failures[0]?.reason ? `（${failures[0].reason}）` : ''}`
          )
        }
        return { successCount, failCount, failures }
      }
      ElMessage.success('批量通过成功')
      return null
    } catch {
      ElMessage.error('批量通过失败')
      throw new Error('批量通过失败')
    } finally {
      batchLoading.value = false
    }
  }

  /**
   * 批量驳回审核
   */
  async function batchReject(
    taskIds: string[],
    comment?: string
  ): Promise<BatchReviewResult | null> {
    batchLoading.value = true
    try {
      const result = await batchDecision({
        taskIds,
        decision: 'rejected',
        comment: comment || '批量驳回'
      })
      if (result && typeof result === 'object') {
        const {
          successCount = taskIds.length,
          failCount = 0,
          failures = []
        } = result as BatchReviewResult
        if (failCount === 0) {
          ElMessage.success(`已批量驳回 ${successCount} 项`)
        } else if (successCount === 0) {
          ElMessage.error(`批量驳回失败：${failures[0]?.reason || '所有任务均未驳回'}`)
        } else {
          ElMessage.warning(
            `部分驳回：成功 ${successCount} 项，失败 ${failCount} 项${failures[0]?.reason ? `（${failures[0].reason}）` : ''}`
          )
        }
        return { successCount, failCount, failures }
      }
      ElMessage.success('批量驳回成功')
      return null
    } catch {
      ElMessage.error('批量驳回失败')
      throw new Error('批量驳回失败')
    } finally {
      batchLoading.value = false
    }
  }

  return {
    batchLoading: readonly(batchLoading),
    batchApprove,
    batchReject
  }
}
