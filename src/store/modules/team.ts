import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 团队 Store（轻量版）
 *
 * 【状态类别：客户端 UI 状态 · Pinia】
 *
 * 本 store 仅负责追踪当前团队 ID 等 UI 相关状态。
 * 所有服务端数据（团队列表、详情、成员、角色等）统一通过
 * `useMyTeams`、`useTeamDetail`、`useTeamMembers` 等 Vue Query Hook 获取。
 *
 * @see src/config/state-policy.ts 状态管理策略
 */
export const useTeamStore = defineStore(
  'team',
  () => {
    /** 当前选中的团队 ID（由 route / 用户交互驱动） */
    const currentTeamId = ref<string>('')

    /** 设置当前团队 ID */
    const setCurrentTeamId = (teamId: string) => {
      currentTeamId.value = teamId
    }

    const clearAll = () => {
      currentTeamId.value = ''
    }

    return {
      currentTeamId,
      setCurrentTeamId,
      clearAll
    }
  },
  {
    persist: false
  }
)
