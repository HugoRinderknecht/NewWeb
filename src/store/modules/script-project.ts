import { defineStore } from 'pinia'
import { useProjectStore } from './project'

/**
 * 剧本项目 Store（轻量版）
 *
 * 本 store 仅负责追踪当前剧本 ID 等 UI 相关状态。
 * 项目列表数据统一通过 `useProjectList` Vue Query Hook 获取。
 *
 * 当前项目 ID 的唯一真实来源为 useProjectStore（带 sessionStorage 持久化），
 * 本 store 通过引用 project store 同步，不再依赖 project-data store。
 *
 * 为兼容旧组件使用，保留 `projectList` / `currentProject` 派生 getter，
 * 推荐迁移到 `useProjectList()` Vue Query Hook。
 */
export interface ProjectItem {
  id: string
  name: string
  description: string
  episodeCount: number
}

export const useScriptProjectStore = defineStore('script-project', {
  state: () => ({
    currentScriptId: ''
  }),

  getters: {
    /** 从 project store 获取当前项目 ID */
    currentProjectId(): string {
      return useProjectStore().currentProjectId
    },
    /**
     * @deprecated 推荐使用 useProjectList() Vue Query Hook 获取项目列表。
     * 此 getter 已无数据源，返回空数组。
     */
    projectList(): ProjectItem[] {
      return []
    },
    /**
     * @deprecated 推荐使用 useProjectDetail() Vue Query Hook 获取项目详情。
     */
    currentProject(): ProjectItem | undefined {
      return undefined
    }
  },

  actions: {
    setCurrentProject(projectId: string) {
      const projectStore = useProjectStore()
      if (projectStore.currentProjectId !== projectId) {
        projectStore.setCurrentProject(projectId)
      }
    },

    setCurrentScript(scriptId: string) {
      this.currentScriptId = scriptId
    },

    /**
     * @deprecated 项目剧集数变化应通过 Vue Query mutation 自动维护，
     * 此方法仅保留以兼容旧代码。
     */
    updateEpisodeCount(_projectId: string, _delta: number) {
      // noop: 项目数据已迁出 store，由 Vue Query 缓存管理
    }
  },

  persist: false
})
