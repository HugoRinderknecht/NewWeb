import { ElMessage } from 'element-plus'
import { useDeleteProject, useArchiveProject, useRestoreProject } from '@/api/queries/project'

export function useProjectBatchActions() {
  const { mutateAsync: deleteProject } = useDeleteProject()
  const { mutateAsync: archiveProject } = useArchiveProject()
  const { mutateAsync: restoreProject } = useRestoreProject()

  const batchLoading = ref(false)

  /**
   * 批量删除项目（顺序执行）
   */
  async function batchDelete(ids: string[]): Promise<void> {
    batchLoading.value = true
    try {
      for (const id of ids) {
        await deleteProject(id)
      }
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
      throw new Error('删除失败')
    } finally {
      batchLoading.value = false
    }
  }

  /**
   * 批量归档项目（顺序执行）
   */
  async function batchArchive(ids: string[]): Promise<void> {
    batchLoading.value = true
    try {
      for (const id of ids) {
        await archiveProject(id)
      }
      ElMessage.success('归档成功')
    } catch {
      ElMessage.error('归档失败')
      throw new Error('归档失败')
    } finally {
      batchLoading.value = false
    }
  }

  /**
   * 批量恢复项目（顺序执行）
   */
  async function batchRestore(ids: string[]): Promise<void> {
    batchLoading.value = true
    try {
      for (const id of ids) {
        await restoreProject(id)
      }
      ElMessage.success('恢复成功')
    } catch {
      ElMessage.error('恢复失败')
      throw new Error('恢复失败')
    } finally {
      batchLoading.value = false
    }
  }

  return {
    batchLoading: readonly(batchLoading),
    batchDelete,
    batchArchive,
    batchRestore
  }
}
