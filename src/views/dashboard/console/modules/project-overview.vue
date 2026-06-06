<!-- 项目产出分布模块 -->
<template>
  <div class="art-card p-5 mb-5 project-overview-card">
    <div class="project-overview-header">
      <div class="project-overview-title">
        <h4>项目产出分布</h4>
        <p>各类资源在团队项目中的占比</p>
      </div>
    </div>
    <div class="project-overview-content">
      <div class="project-overview-chart">
        <ArtRingChart
          v-if="!isEmpty"
          height="13rem"
          :data="pieData"
          :radius="['55%', '78%']"
          centerText="资源"
          :showLegend="false"
        />
        <div v-else class="project-overview-empty">
          <ArtSvgIcon icon="ri:pie-chart-2-line" class="empty-icon" />
          <p>暂无项目数据</p>
        </div>
      </div>
      <div class="project-overview-legend">
        <div class="legend-item" v-for="(item, index) in pieData" :key="index">
          <div class="legend-dot" :style="{ background: item.color }"></div>
          <div class="legend-text">
            <span class="legend-name">{{ item.name }}</span>
            <span class="legend-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useStatsDashboard } from '@/api/queries'
  import type { PieDataItem } from '@/types/component/chart'

  defineOptions({ name: 'ProjectOverview' })

  interface LegendItem extends PieDataItem {
    color: string
  }

  // 统一数据层：仪表盘数据
  const { data: dashboardData } = useStatsDashboard()

  // 资源颜色
  const COLORS = [
    'var(--art-primary)',
    'var(--art-secondary)',
    'var(--art-success)',
    'var(--art-warning)'
  ]

  // 项目资源分布数据
  const pieData = computed<LegendItem[]>(() => {
    const data = dashboardData.value
    if (!data) return []
    return [
      { name: '项目数', value: data.totalProjects ?? 0, color: COLORS[0] },
      { name: '分镜数', value: data.totalStoryboards ?? 0, color: COLORS[1] },
      { name: '视频数', value: data.totalVideos ?? 0, color: COLORS[2] },
      { name: '素材数', value: data.totalAssets ?? 0, color: COLORS[3] }
    ].filter((item) => item.value > 0)
  })

  const isEmpty = computed(() => pieData.value.length === 0)
</script>

<style lang="scss" scoped>
  .project-overview-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 18rem;
    display: flex;
    flex-direction: column;
  }

  .project-overview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .project-overview-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .project-overview-title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .project-overview-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-height: 0;
  }

  .project-overview-chart {
    flex: 0 0 50%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .project-overview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--art-gray-400);

    p {
      margin: 0;
      font-size: 13px;
    }
  }

  .empty-icon {
    font-size: 40px;
  }

  .project-overview-legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    min-width: 0;
    font-size: 13px;
  }

  .legend-name {
    color: var(--art-gray-700);
  }

  .legend-value {
    color: var(--art-gray-900);
    font-weight: 600;
  }
</style>
