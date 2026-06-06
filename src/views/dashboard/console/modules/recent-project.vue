<!-- 最近项目模块 -->
<template>
  <div class="art-card recent-project-card">
    <div class="recent-project-header">
      <div class="recent-project-title">
        <h4>最近的项目</h4>
        <p
          >共 <span class="text-theme font-medium">{{ totalCount }}</span> 个</p
        >
      </div>
      <div class="recent-project-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-button"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="recent-project-list">
      <div
        v-for="(item, index) in projectList"
        :key="item.id"
        class="project-item"
        @click="handleView(item)"
      >
        <div class="project-avatar" :style="{ background: getColor(index) }">
          {{ (item.projectName || '?').charAt(0) }}
        </div>
        <div class="project-content">
          <div class="project-name">{{ item.projectName || '未命名项目' }}</div>
          <div class="project-meta">
            <span class="project-owner">
              <ArtSvgIcon icon="ri:user-line" class="meta-icon" />
              {{ item.creatorName || '未知' }}
            </span>
            <span class="meta-divider">·</span>
            <span class="project-time">{{ formatDate(item.createTime) }}</span>
          </div>
        </div>
        <ElTag :type="getStatusType(item.status)" size="small" class="project-status">
          {{ getStatusText(item.status) }}
        </ElTag>
      </div>
      <div v-if="!projectList.length" class="recent-project-empty">
        <ArtSvgIcon icon="ri:folder-open-line" class="empty-icon" />
        <p>暂无项目</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useProjectList } from '@/api/queries'

  defineOptions({ name: 'RecentProject' })

  type TabValue = 'all' | 'month' | 'last' | 'year'

  interface TabItem {
    label: string
    value: TabValue
  }

  const tabs: TabItem[] = [
    { label: '全部', value: 'all' },
    { label: '本月', value: 'month' },
    { label: '上月', value: 'last' },
    { label: '今年', value: 'year' }
  ]

  const activeTab = ref<TabValue>('all')

  // 项目颜色
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

  // 统一数据层：项目列表
  const { data: projectData } = useProjectList({ current: 1, size: 5 })

  // 项目总数
  const totalCount = computed(() => projectData.value?.total ?? 0)

  // 项目列表（标准化）
  const projectList = computed(() => {
    const records = projectData.value?.records
    if (!Array.isArray(records)) return []
    return records.map((item: any) => ({
      id: item.id ?? '',
      projectName: item.projectName ?? item.name ?? '',
      status: typeof item.status === 'number' ? item.status : 0,
      creatorName: item.creatorName ?? item.createdBy ?? '',
      createTime: item.createTime ?? ''
    }))
  })

  // 状态文字映射
  function getStatusText(status: number): string {
    if (status === 1) return '进行中'
    if (status === 2) return '已完成'
    if (status === 3) return '已归档'
    return '待启动'
  }

  // 状态类型映射
  function getStatusType(status: number): 'primary' | 'success' | 'warning' | 'info' {
    if (status === 1) return 'primary'
    if (status === 2) return 'success'
    if (status === 3) return 'info'
    return 'warning'
  }

  function formatDate(date: string): string {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return date
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${month}-${day}`
  }

  function handleView(item: any) {
    console.log('查看项目:', item.projectName)
  }
</script>

<style lang="scss" scoped>
  .recent-project-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 22rem;
    display: flex;
    flex-direction: column;
  }

  .recent-project-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .recent-project-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .recent-project-title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .recent-project-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    background: var(--art-gray-100);
    border-radius: 8px;
  }

  .tab-button {
    padding: 3px 10px;
    font-size: 11px;
    color: var(--art-gray-600);
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: var(--art-gray-900);
    }

    &.active {
      background: var(--default-box-color);
      color: var(--art-primary);
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }
  }

  .recent-project-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .project-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background: var(--art-gray-100);
    }
  }

  .project-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .project-content {
    flex: 1;
    min-width: 0;
  }

  .project-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--art-gray-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project-meta {
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .project-owner {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .meta-icon {
    font-size: 11px;
  }

  .meta-divider {
    color: var(--art-gray-400);
  }

  .project-status {
    flex-shrink: 0;
  }

  .recent-project-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 0;
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
