<!-- 用户活跃趋势模块 -->
<template>
  <div class="art-card user-active-card">
    <div class="user-active-header">
      <div class="user-active-title">
        <h4>用户活跃趋势</h4>
        <p>
          本月活跃
          <span class="text-success font-medium"
            >{{ activeUserSum }}<span class="ml-1 text-xs">人</span></span
          >
        </p>
      </div>
      <div class="user-active-stat">
        <div class="user-active-stat-item">
          <span class="user-active-stat-label">日访问</span>
          <span class="user-active-stat-value">{{ dailyVisits }}</span>
        </div>
        <div class="user-active-stat-item">
          <span class="user-active-stat-label">周同比</span>
          <span
            class="user-active-stat-value"
            :class="[weeklyChange.startsWith('+') ? 'text-success' : 'text-danger']"
          >
            {{ weeklyChange }}
          </span>
        </div>
      </div>
    </div>

    <ArtLineChart
      class="chart-wrap"
      height="11rem"
      :data="chartData"
      :xAxisData="xAxisLabels"
      :showAreaColor="true"
      :showAxisLine="false"
      :showSplitLine="true"
    />
  </div>
</template>

<script setup lang="ts">
  import { useStatsDashboard } from '@/api/queries'

  defineOptions({ name: 'ActiveUser' })

  // 统一数据层：仪表盘数据
  const { data: dashboardData } = useStatsDashboard()

  // X 轴：最近 N 个月份标签
  const xAxisLabels = computed<string[]>(() => dashboardData.value?.activeUsers?.labels ?? [])

  // 每月活跃用户数
  const chartData = computed<number[]>(() => dashboardData.value?.activeUsers?.values ?? [])

  // 本月活跃用户合计
  const activeUserSum = computed(() => chartData.value.reduce((acc, cur) => acc + (cur || 0), 0))

  // 日访问量
  const dailyVisits = computed(() => dashboardData.value?.dailyVisits ?? '0')

  // 周同比
  const weeklyChange = computed(() => dashboardData.value?.weeklyChange ?? '+0%')
</script>

<style lang="scss" scoped>
  .user-active-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 15.5rem;
    display: flex;
    flex-direction: column;
  }

  .user-active-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .user-active-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .user-active-title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .user-active-stat {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .user-active-stat-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  .user-active-stat-label {
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .user-active-stat-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .chart-wrap {
    flex: 1;
    min-height: 0;
  }
</style>
