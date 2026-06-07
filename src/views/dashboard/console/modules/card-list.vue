<!-- 工作台核心指标卡片 -->
<template>
  <!-- 2x2 网格布局：父容器提供分隔线背景 -->
  <div v-if="layout === 'grid-2x2'" class="kpi-grid" :class="{ 'is-embedded': embedded }">
    <div
      v-for="(item, index) in displayList"
      :key="start + index"
      class="kpi-card kpi-card-grid"
      :class="[`kpi-card-${item.tone}`, { 'is-embedded': embedded }]"
    >
      <div class="kpi-card-body">
        <div class="kpi-icon-wrap">
          <ArtSvgIcon :icon="item.icon" class="kpi-icon" />
        </div>
        <div class="kpi-meta">
          <span class="kpi-label">{{ item.des }}</span>
          <ArtCountTo class="kpi-value" :target="item.num" :duration="1300" />
          <div class="kpi-trend">
            <span class="trend-label">较上周</span>
            <span class="trend-value" :class="[item.change.startsWith('+') ? 'is-up' : 'is-down']">
              <ArtSvgIcon
                :icon="item.change.startsWith('+') ? 'ri:arrow-up-line' : 'ri:arrow-down-line'"
                class="trend-icon"
              />
              {{ item.change }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 默认行式布局（ElRow + ElCol） -->
  <ElRow v-else :gutter="embedded ? 0 : 20" class="kpi-row" :class="rowClass">
    <ElCol v-for="(item, index) in displayList" :key="start + index" v-bind="columnSpan">
      <div
        class="kpi-card art-card"
        :class="[
          `kpi-card-${item.tone}`,
          { 'is-embedded': embedded, 'is-divider': embedded && index > 0 }
        ]"
      >
        <div class="kpi-card-body">
          <div class="kpi-icon-wrap">
            <ArtSvgIcon :icon="item.icon" class="kpi-icon" />
          </div>
          <div class="kpi-meta">
            <span class="kpi-label">{{ item.des }}</span>
            <ArtCountTo class="kpi-value" :target="item.num" :duration="1300" />
            <div class="kpi-trend">
              <span class="trend-label">较上周</span>
              <span
                class="trend-value"
                :class="[item.change.startsWith('+') ? 'is-up' : 'is-down']"
              >
                <ArtSvgIcon
                  :icon="item.change.startsWith('+') ? 'ri:arrow-up-line' : 'ri:arrow-down-line'"
                  class="trend-icon"
                />
                {{ item.change }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="!embedded" class="kpi-bg-icon">
          <ArtSvgIcon :icon="item.icon" />
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import { useStatsDashboard, useProjectList, useStatsRealtime } from '@/api/queries'

  defineOptions({ name: 'CardList' })

  interface CardDataItem {
    des: string
    icon: string
    num: number
    change: string
    tone: 'primary' | 'success' | 'warning' | 'info'
  }

  // props：布局模式、每行卡片数、起始索引、嵌入模式
  const props = withDefaults(
    defineProps<{
      /** 布局模式：row 横向 / grid-2x2 网格 */
      layout?: 'row' | 'grid-2x2'
      /** 每行卡片数量（仅 row 模式生效） */
      columns?: 2 | 3 | 4
      /** 起始索引 */
      start?: number
      /** 数量 */
      count?: number
      /** 嵌入模式：去除外边距与背景 */
      embedded?: boolean
    }>(),
    {
      layout: 'row',
      columns: 4,
      start: 0,
      count: 4,
      embedded: false
    }
  )

  // 统一数据层：仪表盘数据
  const { data: dashboardData } = useStatsDashboard()

  // 统一数据层：项目列表（取总数，避免 dashboard 字段为空时无数据）
  const { data: projectData } = useProjectList({ current: 1, size: 1 })

  // 统一数据层：实时数据（用于活跃用户）
  const { data: realtimeData } = useStatsRealtime()

  /**
   * 完整核心指标列表
   * 展示项目总数、活跃用户、视频资源、积分余额四个关键指标
   */
  const fullList = computed<CardDataItem[]>(() => {
    // 项目总数优先使用项目列表接口的 total（最权威的来源）
    const totalProjects =
      (projectData.value as any)?.total ?? dashboardData.value?.totalProjects ?? 0

    // 活跃用户优先使用实时接口，回退至仪表盘统计
    const activeUserSum =
      realtimeData.value?.activeUsers ??
      dashboardData.value?.activeUsers?.values?.reduce((a, b) => a + (b || 0), 0) ??
      0

    return [
      {
        des: '项目总数',
        icon: 'ri:folder-3-line',
        num: totalProjects,
        change: dashboardData.value?.ownedProjectsChange ?? '+0%',
        tone: 'primary'
      },
      {
        des: '活跃用户',
        icon: 'ri:team-line',
        num: activeUserSum,
        change: dashboardData.value?.weeklyChange ?? '+0%',
        tone: 'info'
      },
      {
        des: '视频资源',
        icon: 'ri:movie-line',
        num: dashboardData.value?.totalVideos ?? 0,
        change: '+0%',
        tone: 'success'
      },
      {
        des: '积分余额',
        icon: 'ri:coins-line',
        num: dashboardData.value?.creditsBalance ?? 0,
        change: dashboardData.value?.creditsBalanceChange ?? '+0%',
        tone: 'warning'
      }
    ]
  })

  // 当前展示的卡片切片
  const displayList = computed<CardDataItem[]>(() =>
    fullList.value.slice(props.start, props.start + props.count)
  )

  // 根据 columns 决定每张卡片占据的栅格数
  const columnSpan = computed(() => {
    const col = props.columns
    if (col === 2) return { xs: 24, sm: 12, md: 12, lg: 12 }
    if (col === 3) return { xs: 24, sm: 12, md: 8, lg: 8 }
    return { xs: 24, sm: 12, md: 12, lg: 6 }
  })

  const rowClass = computed(() => `kpi-cols-${props.columns}`)
</script>

<style lang="scss" scoped>
  // ========== Row 布局 ==========
  .kpi-row {
    margin-bottom: 0;
  }

  .kpi-card {
    position: relative;
    overflow: hidden;
    margin-bottom: 16px;
    padding: 16px 18px;
    border-radius: 8px;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -10px rgba(0, 0, 0, 0.15);
    }

    &.is-embedded {
      margin-bottom: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      transition: none;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    &.is-divider {
      border-left: 1px solid var(--art-gray-200);
    }
  }

  // ========== Grid 2x2 布局 ==========
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1px;
    background: var(--art-gray-200);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--art-gray-200);
  }

  .kpi-card-grid {
    position: relative;
    overflow: hidden;
    margin-bottom: 0;
    padding: 18px 20px;
    background: var(--default-box-color);
    border-radius: 0;
    border: none;
    box-shadow: none;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--art-gray-100);
    }

    &.is-embedded {
      background: var(--default-box-color);
    }
  }

  .kpi-card-body {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .kpi-icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .kpi-card-primary .kpi-icon-wrap {
    background: color-mix(in srgb, var(--art-primary) 12%, transparent);
    color: var(--art-primary);
  }

  .kpi-card-info .kpi-icon-wrap {
    background: color-mix(in srgb, var(--art-info) 12%, transparent);
    color: var(--art-info);
  }

  .kpi-card-success .kpi-icon-wrap {
    background: color-mix(in srgb, var(--art-success) 12%, transparent);
    color: var(--art-success);
  }

  .kpi-card-warning .kpi-icon-wrap {
    background: color-mix(in srgb, var(--art-warning) 14%, transparent);
    color: var(--art-warning);
  }

  .kpi-icon {
    font-size: 20px;
  }

  .kpi-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .kpi-label {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .kpi-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--art-gray-900);
    line-height: 1.1;
  }

  .kpi-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
  }

  .trend-label {
    color: var(--art-gray-500);
  }

  .trend-value {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;

    &.is-up {
      color: var(--art-success);
    }

    &.is-down {
      color: var(--art-danger);
    }
  }

  .trend-icon {
    font-size: 11px;
  }

  .kpi-bg-icon {
    position: absolute;
    right: -16px;
    bottom: -16px;
    font-size: 90px;
    opacity: 0.06;
    color: var(--art-gray-900);
    line-height: 1;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    .kpi-card,
    .kpi-card-grid {
      padding: 14px;
    }

    .kpi-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 6px;
    }

    .kpi-value {
      font-size: 20px;
    }

    .kpi-card.is-divider {
      border-left: none;
      border-top: 1px solid var(--art-gray-200);
    }

    .kpi-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 1fr);
    }
  }
</style>
