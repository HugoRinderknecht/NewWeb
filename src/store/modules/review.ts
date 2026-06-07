import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 审核 Store（轻量版）
 *
 * 【状态类别：客户端 UI 状态 · Pinia】
 *
 * 本 store 仅负责追踪待审核数量等 UI 相关状态。
 * 所有服务端数据（审核列表、我的提交等）统一通过
 * `useReviewList`、`usePendingReviewCount` 等 Vue Query Hook 获取。
 *
 * @see src/config/state-policy.ts 状态管理策略
 */
export const useReviewStore = defineStore(
  'review',
  () => {
    /** 待审核数量（持久化用于即时展示，实际数据由 usePendingReviewCount 提供） */
    const pendingCount = ref(0)

    const hasPending = computed(() => pendingCount.value > 0)

    /** 更新待审核数量（由 Vue Query 数据同步调用） */
    const setPendingCount = (count: number) => {
      pendingCount.value = count
    }

    /** 乐观减少待审核数量（用户完成审核后立即反馈） */
    const decrementPending = () => {
      pendingCount.value = Math.max(0, pendingCount.value - 1)
    }

    const clearAll = () => {
      pendingCount.value = 0
    }

    return {
      pendingCount,
      hasPending,
      setPendingCount,
      decrementPending,
      clearAll
    }
  },
  {
    persist: {
      key: 'review',
      storage: sessionStorage,
      pick: ['pendingCount']
    }
  }
)
