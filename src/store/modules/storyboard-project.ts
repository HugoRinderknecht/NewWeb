import { defineStore } from 'pinia'
import { useProjectStore } from './project'

/**
 * 分镜业务域：项目选择器 Store
 *
 * 按业务域解耦：本 store 独立维护「分镜域」的 currentProjectId，
 * 不写入全局 useProjectStore，从而避免与「剧本域」「资产域」联动。
 *
 * - 读：优先返回本域已设值；若本域未设值，回退到全局 useProjectStore 作为默认值（仅作首次进入兜底）。
 * - 写：只写本域。
 * - 持久化：独立 sessionStorage key (project:storyboard)。
 */
export const useStoryboardProjectStore = defineStore('storyboard-project', {
  state: () => ({
    scopedProjectId: ''
  }),

  getters: {
    currentProjectId(state): string {
      return state.scopedProjectId || useProjectStore().currentProjectId || ''
    }
  },

  actions: {
    setCurrentProject(projectId: string) {
      this.scopedProjectId = projectId
    },
    clearCurrentProject() {
      this.scopedProjectId = ''
    }
  },

  persist: {
    key: 'project:storyboard',
    storage: sessionStorage,
    pick: ['scopedProjectId']
  }
})
