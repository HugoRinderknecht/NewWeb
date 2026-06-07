import { defineStore } from 'pinia'
import { useProjectStore } from './project'

/**
 * 资产业务域：项目选择器 Store
 *
 * 【状态类别：客户端 UI 状态 · Pinia（业务域 scoped）】
 *
 * 按业务域解耦：本 store 独立维护「资产域」的 currentProjectId，
 * 不写入全局 useProjectStore，从而避免与「剧本域」「分镜域」联动。
 *
 * 注意：资产域当前没有项目选择器 UI，本 store 提供 setter 供未来扩展。
 * 读取时若本域未设值，回退到全局 useProjectStore 作为默认值（兜底）。
 *
 * 推荐通过 useWritableProjectId(useAssetProjectStore) 或 useCurrentContext('asset') 获取，
 * 以自动遵循 Route > Store 的优先级策略。
 *
 * @see src/config/state-policy.ts 状态管理策略
 */
export const useAssetProjectStore = defineStore('asset-project', {
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
    key: 'project:asset',
    storage: sessionStorage,
    pick: ['scopedProjectId']
  }
})
