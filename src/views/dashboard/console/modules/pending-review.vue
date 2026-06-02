<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>待处理审核</h4>
        <p
          >待审核<span class="text-danger">{{ pendingCount }}</span></p
        >
      </div>
      <ElSelect v-model="filterStatus" size="small" style="width: 100px">
        <ElOption label="全部" value="all" />
        <ElOption label="待审核" value="pending" />
        <ElOption label="已通过" value="approved" />
        <ElOption label="已驳回" value="rejected" />
      </ElSelect>
    </div>

    <div class="h-[calc(100%-60px)] mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0 cursor-pointer hover:bg-g-100/50 transition-colors px-1"
          v-for="(item, index) in filteredList"
          :key="index"
          @click="handleViewDetail(item)"
        >
          <div class="flex items-center gap-2">
            <ElTag :type="getStatusType(item.status)" size="small">{{
              getStatusLabel(item.status)
            }}</ElTag>
            <div>
              <p class="text-sm truncate max-w-32">{{ item.title }}</p>
              <p class="text-g-500 mt-0.5 text-xs">{{ item.submitter }} · {{ item.date }}</p>
            </div>
          </div>
          <ElButton type="primary" link size="small" @click.stop="handleApprove(item)"
            >审核</ElButton
          >
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetPendingReviewCount, fetchGetReviewList } from '@/api/review'

  interface ReviewItem {
    id: number
    title: string
    submitter: string
    date: string
    status: 'pending' | 'approved' | 'rejected'
    type: string
  }

  const filterStatus = ref('all')

  /**
   * 待处理审核列表
   * 记录各类审核事项的提交信息及状态
   */
  const list = reactive<ReviewItem[]>([])

  const pendingCount = ref(0)

  const loadData = async () => {
    try {
      const [count, listRes] = await Promise.all([
        fetchGetPendingReviewCount(),
        fetchGetReviewList({ current: 1, size: 10 })
      ])
      pendingCount.value = count ?? 0
      if (listRes?.records) {
        list.splice(
          0,
          list.length,
          ...listRes.records.map((item: any) => ({
            id: item.id,
            title: item.title ?? '',
            submitter: item.submitter ?? '',
            date: item.createdAt ?? '',
            status: item.status ?? 'pending',
            type: item.type ?? ''
          }))
        )
      }
    } catch (error) {
      console.error('获取审核数据失败:', error)
    }
  }

  const filteredList = computed(() => {
    if (filterStatus.value === 'all') return list
    return list.filter((item) => item.status === filterStatus.value)
  })

  const getStatusType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    }
    return map[status] || 'info'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回'
    }
    return map[status] || status
  }

  const handleViewDetail = (item: ReviewItem) => {
    console.log('查看审核详情:', item.title)
  }

  const handleApprove = (item: ReviewItem) => {
    console.log('审核操作:', item.title)
  }

  onMounted(() => {
    loadData()
  })
</script>
