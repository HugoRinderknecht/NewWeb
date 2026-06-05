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
  import { useTeamStore } from '@/store/modules/team'

  /**
   * AI Token 使用量数据
   * 记录每日的 Token 消耗统计（单位：万）
   */
  const data = ref<number[]>([])

  /**
   * X 轴日期标签
   */
  const xAxisData = ref<string[]>([])

  const teamStore = useTeamStore()

  const loadData = async () => {
    const teamId = teamStore.currentTeamId
    if (!teamId) return
    try {
      const { data: resData } = await fetchGetTrends(teamId, {
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

  /**
   * 监听 currentTeamId 变化
   * 路由守卫异步加载团队列表后 currentTeamId 才就绪，
   * onMounted 时可能尚未初始化，通过 watch 确保就绪后触发加载
   */
  watch(
    () => teamStore.currentTeamId,
    (newId) => {
      if (newId) loadData()
    },
    { immediate: true }
  )

  onMounted(() => {
    loadData()
  })
</script>
