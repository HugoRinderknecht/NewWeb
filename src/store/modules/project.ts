import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 项目 Store（轻量版）
 *
 * 【状态类别：客户端 UI 状态 · Pinia】
 *
 * 本 store 仅负责追踪当前项目 ID 和 UI 相关状态。
 * 所有服务端数据（项目列表、详情、成员等）统一通过
 * `useProjectList`、`useProjectDetail` 等 Vue Query Hook 获取。
 *
 * currentProjectId 的唯一真实来源在本 store（带 sessionStorage 持久化），
 * project-data store 通过 computed 引用本 store，不再维护独立副本。
 *
 * @see src/config/state-policy.ts 状态管理策略
 */
export const useProjectStore = defineStore(
  'project',
  () => {
    /** 当前选中的项目 ID（由 route / 用户交互驱动） */
    const currentProjectId = ref<string>('')

    const currentProjectName = computed(() => '')

    /** 设置当前项目 */
    const setCurrentProject = (projectId: string) => {
      currentProjectId.value = projectId
    }

    const clearCurrentProject = () => {
      currentProjectId.value = ''
    }

    return {
      currentProjectId,
      currentProjectName,
      setCurrentProject,
      clearCurrentProject
    }
  },
  {
    persist: {
      key: 'project',
      storage: sessionStorage,
      pick: ['currentProjectId']
    }
  }
)
