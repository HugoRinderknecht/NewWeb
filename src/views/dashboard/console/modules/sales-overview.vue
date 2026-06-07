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
  import { useSalesOverviewModel } from '@/domain/statistics/composables'

  defineOptions({ name: 'SalesOverview' })

  const { xAxisData, data, remainingCredits, monthChange, totalSpent } = useSalesOverviewModel()
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
