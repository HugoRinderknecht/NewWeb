<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <ArtBarChart
      class="box-border p-2"
      barWidth="50%"
      height="13.7rem"
      :showAxisLine="false"
      :data="chartData"
      :xAxisData="xAxisLabels"
    />
    <div class="ml-1">
      <h3 class="mt-5 text-lg font-medium">用户概述</h3>
      <p class="mt-1 text-sm">比昨天 <span class="text-success font-medium">+23%</span></p>
      <p class="mt-1 text-sm">我们为您创建了多个选项，可将它们组合在一起并定制为像素完美的页面</p>
    </div>
    <div class="flex-b mt-2">
      <div class="flex-1" v-for="(item, index) in list" :key="index">
        <p class="text-2xl text-g-900">{{ item.num }}</p>
        <p class="text-xs text-g-500">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetDashboard } from '@/api/statistics'

  interface UserStatItem {
    name: string
    num: string
  }

  // 最近9个月
  const xAxisLabels = ref<string[]>([])

  // 每月活跃用户数
  const chartData = ref<number[]>([])

  /**
   * 用户统计数据列表
   * 包含总用户量、总访问量、日访问量和周同比等关键指标
   */
  const list = ref<UserStatItem[]>([])

  const loadData = async () => {
    try {
      const data = await fetchGetDashboard()
      if (data) {
        chartData.value = data.activeUsers?.values ?? []
        xAxisLabels.value = data.activeUsers?.labels ?? []
        list.value = [
          { name: '总用户量', num: data.totalUsers ?? '0' },
          { name: '总访问量', num: data.totalVisits ?? '0' },
          { name: '日访问量', num: data.dailyVisits ?? '0' },
          { name: '周同比', num: data.weeklyChange ?? '+0%' }
        ]
      }
    } catch (error) {
      console.error('获取用户统计数据失败:', error)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
