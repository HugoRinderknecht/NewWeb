<!-- 动态信息流模块 -->
<template>
  <div class="art-card dynamic-stats-card">
    <div class="dynamic-stats-header">
      <div class="dynamic-stats-title">
        <h4>动态</h4>
        <p v-if="list.length"
          >共 <span class="text-theme font-medium">{{ list.length }}</span> 条</p
        >
      </div>
    </div>

    <ElScrollbar v-if="list.length" class="dynamic-stats-list">
      <div v-for="(item, index) in list" :key="index" class="dynamic-item">
        <div class="dynamic-avatar" :style="{ background: getColor(index) }">
          {{ (item.username || '?').charAt(0) }}
        </div>
        <div class="dynamic-content">
          <p class="dynamic-text">
            <span class="dynamic-user">{{ item.username || '匿名' }}</span>
            <span class="dynamic-type">{{ item.type }}</span>
            <span class="dynamic-target">{{ item.target }}</span>
          </p>
        </div>
      </div>
    </ElScrollbar>
    <div v-else class="dynamic-stats-empty">
      <ArtSvgIcon icon="ri:time-line" class="empty-icon" />
      <p>暂无动态</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useStatsRealtime } from '@/api/queries'

  defineOptions({ name: 'DynamicStats' })

  interface DynamicItem {
    username: string
    type: string
    target: string
  }

  // 统一数据层：实时数据（活动流）
  const { data: realtimeData } = useStatsRealtime()

  /**
   * 动态列表
   * 记录团队成员的项目/分镜/视频等操作活动
   */
  const list = computed<DynamicItem[]>(() => {
    const res: any = realtimeData.value
    if (!res) return []
    const activities = res.activities ?? res.data?.activities ?? []
    if (!Array.isArray(activities)) return []
    return activities.map((item: any) => ({
      username: item.username ?? item.userName ?? '',
      type: item.action ?? item.type ?? '',
      target: item.target ?? ''
    }))
  })

  // 头像渐变色
  const COLORS = [
    'linear-gradient(135deg, var(--art-primary), var(--art-secondary))',
    'linear-gradient(135deg, #fbbf24, #f59e0b)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #06b6d4, #0891b2)'
  ]

  function getColor(index: number): string {
    return COLORS[index % COLORS.length]
  }
</script>

<style lang="scss" scoped>
  .dynamic-stats-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 18rem;
    display: flex;
    flex-direction: column;
  }

  .dynamic-stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .dynamic-stats-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .dynamic-stats-title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .dynamic-stats-list {
    flex: 1;
    min-height: 0;
  }

  .dynamic-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--art-gray-200);

    &:last-child {
      border-bottom: none;
    }
  }

  .dynamic-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .dynamic-content {
    flex: 1;
    min-width: 0;
  }

  .dynamic-text {
    margin: 0;
    font-size: 13px;
    color: var(--art-gray-700);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dynamic-user {
    font-weight: 500;
    color: var(--art-gray-900);
  }

  .dynamic-type {
    margin: 0 4px;
    color: var(--art-gray-600);
  }

  .dynamic-target {
    color: var(--art-primary);
  }

  .dynamic-stats-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--art-gray-400);

    p {
      margin: 0;
      font-size: 12px;
    }
  }

  .empty-icon {
    font-size: 28px;
  }
</style>
