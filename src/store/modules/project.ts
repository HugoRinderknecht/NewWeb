import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 项目 Store（轻量版）
 *
 * 本 store 仅负责追踪当前项目 ID 和 UI 相关状态。
 * 所有服务端数据（项目列表、详情、成员等）统一通过
 * `useProjectList`、`useProjectDetail` 等 Vue Query Hook 获取。
 *
 * 保留对 project-data store 的引用，用于跨模块同步当前选中项目。
 */
export const useProjectStore = defineStore(
  'project',
  () => {
    /** 当前选中的项目 ID（由 route / 用户交互驱动） */
    const currentProjectId = ref<string>('')

    const currentProjectName = computed(() => '')

    /** 设置当前项目（同时通知 project-data store 同步） */
    const setCurrentProject = (projectId: string) => {
      currentProjectId.value = projectId
      import('./project-data').then(({ useProjectDataStore }) => {
        const dataStore = useProjectDataStore()
        if (dataStore.currentProjectId !== projectId) {
          dataStore.$patch({ currentProjectId: projectId })
        }
      })
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
