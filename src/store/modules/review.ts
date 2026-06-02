import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchGetReviewList,
  fetchGetPendingReviewCount,
  fetchGetMySubmissions
} from '@/api/review'

export const useReviewStore = defineStore(
  'review',
  () => {
    const pendingCount = ref(0)
    const reviewList = ref<any[]>([])
    const mySubmissions = ref<any[]>([])
    const loading = ref(false)

    const hasPending = computed(() => pendingCount.value > 0)

    const loadPendingCount = async () => {
      try {
        const res = await fetchGetPendingReviewCount()
        pendingCount.value = typeof res === 'number' ? res : 0
      } catch {
        pendingCount.value = 0
      }
    }

    const loadReviewList = async (params?: any) => {
      loading.value = true
      try {
        const res = await fetchGetReviewList(params)
        reviewList.value = (res as any)?.records || res || []
      } catch {
        reviewList.value = []
      } finally {
        loading.value = false
      }
    }

    const loadMySubmissions = async (params?: any) => {
      try {
        const res = await fetchGetMySubmissions(params)
        mySubmissions.value = (res as any)?.records || res || []
      } catch {
        mySubmissions.value = []
      }
    }

    const decrementPending = () => {
      pendingCount.value = Math.max(0, pendingCount.value - 1)
    }

    const clearAll = () => {
      pendingCount.value = 0
      reviewList.value = []
      mySubmissions.value = []
    }

    return {
      pendingCount,
      reviewList,
      mySubmissions,
      loading,
      hasPending,
      loadPendingCount,
      loadReviewList,
      loadMySubmissions,
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
