<!-- 积分使用量趋势模块 -->
<template>
  <div class="art-card sales-card">
    <div class="sales-header">
      <div class="sales-title">
        <h4>积分使用量</h4>
        <p>
          本月累计
          <span class="text-success font-medium">{{ monthChange }}</span>
        </p>
      </div>
      <div class="sales-extra">
        <div class="sales-extra-item">
          <span class="sales-extra-label">剩余积分</span>
          <span class="sales-extra-value">{{ remainingCredits }}</span>
        </div>
        <div class="sales-extra-item">
          <span class="sales-extra-label">总消耗</span>
          <span class="sales-extra-value text-danger">{{ totalSpent }}</span>
        </div>
      </div>
    </div>
    <ArtLineChart
      class="chart-wrap"
      height="11rem"
      :data="data"
      :xAxisData="xAxisData"
      :showAreaColor="true"
      :showAxisLine="false"
    />
  </div>
</template>

<script setup lang="ts">
  import { useStatsTrends, useStatsCredits, useStatsDashboard } from '@/api/queries'
  import { useTeamStore } from '@/store/modules/team'

  defineOptions({ name: 'SalesOverview' })

  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)

  // 统一数据层：趋势数据
  const trendParams = computed<Omit<Api.Statistics.TrendParams, 'teamId'>>(() => ({
    eventType: 'credits',
    granularity: 'day',
    metrics: ['credits']
  }))
  const { data: trendData } = useStatsTrends(teamId, trendParams)

  // 统一数据层：积分概览
  const { data: creditsData } = useStatsCredits()
  const { data: dashboardData } = useStatsDashboard()

  // X 轴：日期
  const xAxisData = computed<string[]>(() => {
    if (!trendData.value) return []
    return trendData.value.dates ?? trendData.value.data?.labels ?? []
  })

  // Y 轴：每日消耗
  const data = computed<number[]>(() => {
    if (!trendData.value) return []
    return trendData.value.metrics?.[0]?.values ?? trendData.value.data?.values ?? []
  })

  // 剩余积分
  const remainingCredits = computed(() => {
    if (creditsData.value) return creditsData.value.balance
    return dashboardData.value?.creditsBalance ?? 0
  })

  // 本月累计百分比
  const monthChange = computed(() => {
    const data = creditsData.value
    if (!data) return '+0%'
    if (data.totalEarned === 0) return '+0%'
    const ratio = ((data.totalEarned - data.totalSpent) / data.totalEarned) * 100
    return `${ratio >= 0 ? '+' : ''}${ratio.toFixed(0)}%`
  })

  // 总消耗
  const totalSpent = computed(() => creditsData.value?.totalSpent ?? 0)
</script>

<style lang="scss" scoped>
  .sales-card {
    box-sizing: border-box;
    padding: 16px 18px;
    margin-bottom: 16px;
    height: 15.5rem;
    display: flex;
    flex-direction: column;
  }

  .sales-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .sales-title h4 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .sales-title p {
    margin: 2px 0 0;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .sales-extra {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .sales-extra-item {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  .sales-extra-label {
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .sales-extra-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .chart-wrap {
    flex: 1;
    min-height: 0;
  }
</style>
