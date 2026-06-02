<template>
  <div class="stats-dashboard-page art-full-height">
    <!-- 核心指标卡片 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol v-for="(item, index) in dashboardCards" :key="index" :sm="12" :md="6" :lg="6">
        <div class="art-card relative flex flex-col justify-center h-35 px-5">
          <span class="text-g-700 text-sm">{{ item.label }}</span>
          <ArtCountTo
            class="text-[26px] font-medium mt-2"
            :target="item.value"
            :duration="1300"
            :decimals="item.decimals"
            :separator="','"
          />
          <div class="flex-c mt-1">
            <span class="text-xs text-g-600">较上周</span>
            <span
              class="ml-1 text-xs font-semibold"
              :class="[item.change.startsWith('+') ? 'text-success' : 'text-danger']"
            >
              {{ item.change }}
            </span>
          </div>
          <div
            class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
          >
            <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 柱状图 + 折线图 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">项目产出统计</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各月项目数与视频数对比（柱状图）</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="outputBarData"
            :xAxisData="monthXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">数据趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">存储与AI使用量变化趋势（折线图）</p>
            </div>
          </div>
          <ArtLineChart
            height="20rem"
            :data="trendLineData"
            :xAxisData="monthXAxis"
            :showAreaColor="true"
            :showLegend="true"
            legendPosition="bottom"
            :showAxisLine="true"
            :showSplitLine="true"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 饼图 + 雷达图 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">资源使用占比</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各类资源消耗分布（饼图）</p>
            </div>
          </div>
          <ArtRingChart
            height="20rem"
            :data="resourcePieData"
            :showLegend="true"
            legendPosition="bottom"
            :radius="['40%', '70%']"
            centerText="资源"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">团队能力雷达</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各维度能力评估（雷达图）</p>
            </div>
          </div>
          <ArtRadarChart
            height="20rem"
            :indicator="radarIndicators"
            :data="radarData"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 热力图 + 散点图 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">活跃度热力图</h4>
              <p class="text-sm text-g-500 mt-1 m-0">每日各时段操作活跃度分布</p>
            </div>
          </div>
          <div ref="heatmapRef" class="w-full" style="height: 20rem"></div>
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">产出效率散点</h4>
              <p class="text-sm text-g-500 mt-1 m-0">视频数与时长关系分布（散点图）</p>
            </div>
          </div>
          <ArtScatterChart
            height="20rem"
            :data="scatterData"
            :showAxisLine="true"
            :showSplitLine="true"
          />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { type EChartsOption } from '@/plugins/echarts'
  import { useChartOps, useChart } from '@/hooks/core/useChart'
  import type {
    BarDataItem,
    LineDataItem,
    PieDataItem,
    RadarDataItem,
    ScatterDataItem
  } from '@/types/component/chart'
  import { fetchGetDashboard, fetchGetRealtimeData } from '@/api/statistics'

  defineOptions({ name: 'StatsDashboard' })

  interface DashboardCard {
    label: string
    value: number
    decimals: number
    change: string
    icon: string
  }

  const dashboardCards = reactive<DashboardCard[]>([
    { label: '项目总数', value: 0, decimals: 0, change: '+0%', icon: 'ri:folder-3-line' },
    { label: '视频总数', value: 0, decimals: 0, change: '+0%', icon: 'ri:movie-line' },
    { label: '活跃用户', value: 0, decimals: 0, change: '+0%', icon: 'ri:team-line' },
    { label: '积分余额', value: 0, decimals: 0, change: '+0%', icon: 'ri:coins-line' }
  ])

  const monthXAxis = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月'
  ]

  const outputBarData = ref<BarDataItem[]>([
    { name: '项目数', data: [80, 72, 90, 105, 98, 115, 125, 118, 130, 138, 145, 160] },
    { name: '视频数', data: [210, 195, 240, 280, 265, 310, 335, 320, 350, 375, 400, 430] }
  ])

  const trendLineData = ref<LineDataItem[]>([
    {
      name: '存储(GB)',
      data: [1200, 1350, 1480, 1620, 1580, 1750, 1820, 1900, 1950, 2000, 2100, 2200]
    },
    { name: 'AI调用(千次)', data: [25, 28, 32, 35, 38, 42, 40, 45, 48, 50, 52, 55] }
  ])

  const resourcePieData = reactive<PieDataItem[]>([
    { value: 2048, name: '视频存储' },
    { value: 520, name: '素材库' },
    { value: 320, name: '音频资源' },
    { value: 180, name: '图片资源' },
    { value: 120, name: '其他' }
  ])

  const radarIndicators = [
    { name: '创意能力', max: 100 },
    { name: '制作效率', max: 100 },
    { name: '协作能力', max: 100 },
    { name: '技术能力', max: 100 },
    { name: '交付质量', max: 100 },
    { name: '学习能力', max: 100 }
  ]

  const radarData: RadarDataItem[] = [
    { name: '团队平均', value: [78, 82, 75, 70, 85, 80] },
    { name: '优秀成员', value: [92, 90, 88, 85, 95, 90] }
  ]

  const scatterData: ScatterDataItem[] = [
    { value: [12, 28] },
    { value: [15, 35] },
    { value: [8, 18] },
    { value: [22, 55] },
    { value: [18, 42] },
    { value: [10, 22] },
    { value: [25, 62] },
    { value: [14, 32] },
    { value: [20, 48] },
    { value: [16, 38] },
    { value: [30, 75] },
    { value: [11, 26] },
    { value: [19, 45] },
    { value: [24, 58] },
    { value: [9, 20] }
  ]

  const heatmapRef = ref<HTMLElement>()
  const { initChart, destroyChart } = useChart()

  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  const heatmapData: [number, number, number][] = []
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      let value = Math.floor(Math.random() * 80) + 10
      if (j >= 2 && j <= 4 && i < 5) {
        value += Math.floor(Math.random() * 50) + 30
      }
      heatmapData.push([j, i, value])
    }
  }

  const generateHeatmapOptions = (): EChartsOption => {
    const themeColor = useChartOps().themeColor
    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          return `${days[params.value[1]]} ${hours[params.value[0]]}<br/>活跃度: ${params.value[2]}`
        }
      },
      grid: {
        top: 10,
        right: 20,
        bottom: 30,
        left: 60
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true },
        axisLabel: { fontSize: 12 }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true },
        axisLabel: { fontSize: 12 }
      },
      visualMap: {
        min: 0,
        max: 150,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: ['#e0f2fe', '#7dd3fc', '#0ea5e9', themeColor]
        },
        itemWidth: 12,
        itemHeight: 80
      },
      series: [
        {
          type: 'heatmap',
          data: heatmapData,
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  const loadDashboardData = async () => {
    try {
      const data = await fetchGetDashboard()
      if (data) {
        dashboardCards[0].value = data.totalProjects ?? 0
        dashboardCards[0].change = data.ownedProjectsChange ?? '+0%'
        dashboardCards[1].value = data.totalVideos ?? 0
        dashboardCards[2].value =
          data.activeUsers?.values?.reduce((a: number, b: number) => a + b, 0) ?? 0
        dashboardCards[2].change = data.weeklyChange ?? '+0%'
        dashboardCards[3].value = data.creditsBalance ?? 0
        dashboardCards[3].change = data.creditsBalanceChange ?? '+0%'

        if (data.activeUsers?.labels && data.activeUsers?.values) {
          monthXAxis.length = 0
          data.activeUsers.labels.forEach((l: string) => monthXAxis.push(l))
          trendLineData.value = [{ name: '活跃用户', data: data.activeUsers.values }]
        }

        resourcePieData[0].value = data.totalVideos ?? 2048
        resourcePieData[1].value = data.totalStoryboards ?? 520
        resourcePieData[2].value = data.totalAssets ?? 320
      }
    } catch (error) {
      console.error('加载看板数据失败:', error)
    }
  }

  const loadRealtimeData = async () => {
    try {
      const data = await fetchGetRealtimeData()
      if (data) {
        dashboardCards[2].value = data.activeUsers ?? dashboardCards[2].value
      }
    } catch (error) {
      console.error('加载实时数据失败:', error)
    }
  }

  onMounted(() => {
    loadDashboardData()
    loadRealtimeData()
    nextTick(() => {
      if (heatmapRef.value) {
        initChart(generateHeatmapOptions())
      }
    })
  })

  onBeforeUnmount(() => {
    destroyChart()
  })
</script>
