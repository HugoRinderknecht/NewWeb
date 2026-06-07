import { defineStore } from 'pinia'
import { useProjectStore } from './project'

/**
 * 剧本业务域：项目选择器 Store
 *
 * 【状态类别：客户端 UI 状态 · Pinia（业务域 scoped）】
 *
 * 按业务域解耦：本 store 独立维护「剧本域」的 currentProjectId，
 * 不再写入全局 useProjectStore，从而避免与「分镜域」「资产域」联动。
 *
 * - 读：优先返回本域已设值；若本域未设值，回退到全局 useProjectStore 作为默认值（仅作首次进入兜底）。
 * - 写：只写本域，不污染全局。
 * - 持久化：独立 sessionStorage key (project:script)。
 *
 * 推荐通过 useCurrentProjectId(useScriptProjectStore) 或 useCurrentContext('script') 获取，
 * 以自动遵循 Route > Store 的优先级策略。
 *
 * 历史保留：`projectList` / `currentProject` getter 已废弃，请改用 useProjectList / useProjectDetail Vue Query Hook。
 *
 * @see src/config/state-policy.ts 状态管理策略
 */
export interface ProjectItem {
  id: string
  name: string
  description: string
  episodeCount: number
}

export const useScriptProjectStore = defineStore('script-project', {
  state: () => ({
    /** 剧本域独立持有的当前项目 ID */
    scopedProjectId: '',
    currentScriptId: ''
  }),

  getters: {
    /** 剧本域当前项目 ID（本域未设值则回退到全局兜底） */
    currentProjectId(state): string {
      return state.scopedProjectId || useProjectStore().currentProjectId || ''
    },
    /** @deprecated 请改用 useProjectList() Vue Query Hook */
    projectList(): ProjectItem[] {
      return []
    },
    /** @deprecated 请改用 useProjectDetail() Vue Query Hook */
    currentProject(): ProjectItem | undefined {
      return undefined
    }
  },

  actions: {
    /** 仅设置剧本域，不污染全局，避免跨业务域联动 */
    setCurrentProject(projectId: string) {
      this.scopedProjectId = projectId
    },

    clearCurrentProject() {
      this.scopedProjectId = ''
    },

    setCurrentScript(scriptId: string) {
      this.currentScriptId = scriptId
    },

    /** @deprecated 项目剧集数变化应通过 Vue Query mutation 自动维护 */
    updateEpisodeCount(_projectId: string, _delta: number) {
      // noop
      void _projectId
      void _delta
    }
  },

  persist: {
    key: 'project:script',
    storage: sessionStorage,
    pick: ['scopedProjectId']
  }
})
