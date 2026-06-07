<!-- 待处理审核模块 -->
<template>
  <div class="art-card p-5 mb-5 pending-review-card">
    <div class="pending-review-header">
      <div class="pending-review-title">
        <h4>待处理审核</h4>
        <p>
          待审核
          <span class="text-danger font-semibold">{{ pendingCount }}</span>
        </p>
      </div>
      <ElSelect v-model="filterStatus" size="small" style="width: 96px">
        <ElOption label="全部" value="all" />
        <ElOption label="待审核" value="pending" />
        <ElOption label="已通过" value="approved" />
        <ElOption label="已驳回" value="rejected" />
      </ElSelect>
    </div>

    <div class="pending-review-list">
      <ElScrollbar v-if="filteredList.length">
        <div
          class="review-item"
          v-for="(item, index) in filteredList"
          :key="item.reviewTaskId || index"
          @click="handleViewDetail(item)"
        >
          <ElTag :type="getStatusType(item.statusText)" size="small" class="review-tag">
            {{ item.statusText || getDefaultStatusText(item.status) }}
          </ElTag>
          <div class="review-content">
            <p class="review-title">{{ item.targetTitle || '审核任务' }}</p>
            <p class="review-meta">
              <span>{{ item.creatorName || '匿名' }}</span>
              <span class="review-dot">·</span>
              <span>{{ formatDate(item.createTime) }}</span>
              <span v-if="item.reviewTypeName" class="review-dot">·</span>
              <span v-if="item.reviewTypeName">{{ item.reviewTypeName }}</span>
            </p>
          </div>
          <ElButton
            type="primary"
            link
            size="small"
            class="review-action"
            @click.stop="handleReview(item)"
          >
            审核
          </ElButton>
        </div>
      </ElScrollbar>
      <div v-else class="pending-review-empty">
        <ArtSvgIcon icon="ri:checkbox-circle-line" class="empty-icon" />
        <p>暂无待处理审核</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useReviewItems, usePendingReviewCount } from '@/api/queries'

  defineOptions({ name: 'PendingReview' })

  interface ReviewItem {
    reviewTaskId: string
    reviewType: string
    reviewTypeName: string
    status: number
    statusText: string
    projectId: string
    reviewerId: string
    reviewerName: string
    comment: string
    createdBy: string
    creatorName: string
    reviewedAt: string
    createTime: string
    targetId: string
    targetTitle: string
    targetDescription: string
    targetCoverUrl: string
  }

  // 统一数据层：审核项列表
  const { data: reviewData } = useReviewItems({ current: 1, size: 5 })

  // 统一数据层：待审核数
  const { data: pendingCountData } = usePendingReviewCount()

  const filterStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('all')

  // 待审核数
  const pendingCount = computed(() => {
    if (typeof pendingCountData.value === 'number') return pendingCountData.value
    return 0
  })

  // 审核项列表（标准化）
  const list = computed<ReviewItem[]>(() => {
    const records = reviewData.value?.records
    if (!Array.isArray(records)) return []
    return records.map((item: any) => ({
      reviewTaskId: item.reviewTaskId ?? item.id ?? '',
      reviewType: item.reviewType ?? '',
      reviewTypeName: item.reviewTypeName ?? '',
      status: item.status ?? 0,
      statusText: item.statusText ?? '',
      projectId: item.projectId ?? '',
      reviewerId: item.reviewerId ?? '',
      reviewerName: item.reviewerName ?? '',
      comment: item.comment ?? '',
      createdBy: item.createdBy ?? '',
      creatorName: item.creatorName ?? '',
      reviewedAt: item.reviewedAt ?? '',
      createTime: item.createTime ?? '',
      targetId: item.targetId ?? '',
      targetTitle: item.targetTitle ?? '',
      targetDescription: item.targetDescription ?? '',
      targetCoverUrl: item.targetCoverUrl ?? ''
    }))
  })

  // 根据状态筛选
  const filteredList = computed(() => {
    if (filterStatus.value === 'all') return list.value
    const target = filterStatus.value
    return list.value.filter((item) => matchStatus(item.status, target))
  })

  // 状态映射：根据后端 status 数字映射到不同状态类别
  function matchStatus(status: number, target: 'pending' | 'approved' | 'rejected'): boolean {
    // 0=待审核 1=已通过 2=已驳回（具体值以后端定义为准）
    if (target === 'pending') return status === 0
    if (target === 'approved') return status === 1
    if (target === 'rejected') return status === 2
    return true
  }

  function getDefaultStatusText(status: number): string {
    if (status === 0) return '待审核'
    if (status === 1) return '已通过'
    if (status === 2) return '已驳回'
    return '未知'
  }

  function getStatusType(
    statusText: string
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
    if (statusText === '已通过' || statusText === 'approved') return 'success'
    if (statusText === '已驳回' || statusText === 'rejected') return 'danger'
    if (statusText === '待审核' || statusText === 'pending') return 'warning'
    return 'info'
  }

  function formatDate(date: string): string {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${month}-${day} ${hour}:${minute}`
  }

  function handleViewDetail(item: ReviewItem) {
    console.log('查看审核详情:', item.targetTitle)
  }

  function handleReview(item: ReviewItem) {
    console.log('审核操作:', item.targetTitle)
  }
</script>

<style lang="scss" scoped>
  .pending-review-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 22rem;
    display: flex;
    flex-direction: column;
  }

  .pending-review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pending-review-title h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .pending-review-title p {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .pending-review-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .review-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 6px;
    border-bottom: 1px solid var(--art-gray-200);
    cursor: pointer;
    transition: background-color 0.2s;
    border-radius: 4px;

    &:hover {
      background: var(--art-gray-100);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .review-tag {
    flex-shrink: 0;
  }

  .review-content {
    flex: 1;
    min-width: 0;
  }

  .review-title {
    margin: 0;
    font-size: 14px;
    color: var(--art-gray-900);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .review-meta {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--art-gray-500);
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .review-dot {
    color: var(--art-gray-400);
  }

  .review-action {
    flex-shrink: 0;
  }

  .pending-review-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 0;
    color: var(--art-gray-400);

    p {
      margin: 0;
      font-size: 13px;
    }
  }

  .empty-icon {
    font-size: 32px;
  }
</style>
