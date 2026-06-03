<template>
  <div class="art-card h-105 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>积分使用量</h4>
        <p>本月累计<span class="text-success">+12%</span></p>
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 56px)"
      :data="data"
      :xAxisData="xAxisData"
      :showAreaColor="true"
      :showAxisLine="false"
    />
  </div>
</template>

<script setup lang="ts">
  import { fetchGetTrends } from '@/api/statistics'

  /**
   * AI Token 使用量数据
   * 记录每日的 Token 消耗统计（单位：万）
   */
  const data = ref<number[]>([])

  /**
   * X 轴日期标签
   */
  const xAxisData = ref<string[]>([])

  const loadData = async () => {
    try {
      const { data: resData } = await fetchGetTrends({
        eventType: 'credits',
        granularity: 'day',
        metrics: ['credits']
      })
      if (resData) {
        data.value = resData.values ?? []
        xAxisData.value = resData.labels ?? []
      }
    } catch (error) {
      console.error('获取趋势图表数据失败:', error)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
