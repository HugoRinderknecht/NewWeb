import { ElMessage } from 'element-plus'
import {
  useBatchDeleteStoryboards,
  useBatchSubmitStoryboardReview,
  useUpdateStoryboard
} from '@/api/queries/storyboard'

export interface BatchApplyParams {
  ids: string[]
  projectId: string
  sceneType?: string
  timeOfDay?: string
  cameraType?: string
  addTags?: string[]
  removeTags?: string[]
  status?: string
  remark?: string
  /** 选中分镜的当前标签信息，用于标签合并计算 */
  items: Array<{ id: string | number; tags: string[]; name: string }>
}

export function useStoryboardBatchActions() {
  const { mutateAsync: batchDeleteStoryboards } = useBatchDeleteStoryboards()
  const { mutateAsync: batchSubmitReview } = useBatchSubmitStoryboardReview()
  const { mutateAsync: updateStoryboard } = useUpdateStoryboard()

  const batchLoading = ref(false)

  /**
   * 批量删除分镜
   */
  async function batchDelete(ids: string[], projectId: string): Promise<void> {
    try {
      await batchDeleteStoryboards({ storyboardIds: ids, projectId })
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.error('批量删除失败')
      throw new Error('批量删除失败')
    }
  }

  /**
   * 批量提交审核
   */
  async function batchSubmitReviewAction(ids: string[], projectId: string): Promise<void> {
    try {
      await batchSubmitReview({ storyboardIds: ids, projectId })
      ElMessage.success('批量提交审核成功')
    } catch {
      ElMessage.error('批量提交审核失败')
      throw new Error('批量提交审核失败')
    }
  }

  /**
   * 批量应用修改
   */
  async function batchApplyChanges(params: BatchApplyParams): Promise<void> {
    batchLoading.value = true
    try {
      const { ids, projectId, status, remark, addTags, removeTags, items } = params

      // 如果修改了审核状态为已通过，先提交审核
      if (status === 'approved') {
        await batchSubmitReview({ storyboardIds: ids, projectId })
      }

      // 逐个更新分镜属性
      const updatePromises = ids.map((id) => {
        const item = items.find((s) => String(s.id) === id)
        if (!item) return Promise.resolve()

        const updateParams: Record<string, unknown> = {}
        if (remark) updateParams.description = remark

        // 合并标签变化
        let newTags = [...item.tags]
        if (addTags && addTags.length > 0) {
          newTags = [...new Set([...newTags, ...addTags])]
        }
        if (removeTags && removeTags.length > 0) {
          newTags = newTags.filter((t) => !removeTags.includes(t))
        }
        if (JSON.stringify(newTags) !== JSON.stringify(item.tags)) {
          updateParams.tags = newTags
        }

        if (Object.keys(updateParams).length > 0) {
          return updateStoryboard({
            storyboardId: id,
            params: updateParams,
            projectId
          })
        }
        return Promise.resolve()
      })

      await Promise.all(updatePromises)
      ElMessage.success('批量修改已应用')
    } catch {
      ElMessage.error('批量操作失败')
      throw new Error('批量操作失败')
    } finally {
      batchLoading.value = false
    }
  }

  return {
    batchLoading: readonly(batchLoading),
    batchDelete,
    batchSubmitReview: batchSubmitReviewAction,
    batchApplyChanges
  }
}
