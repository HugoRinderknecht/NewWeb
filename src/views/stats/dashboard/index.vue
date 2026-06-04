<template>
  <div class="stats-dashboard-page art-full-height" v-loading="isLoading">
    <!-- 错误提示 -->
    <ElAlert
      v-if="hasError"
      type="error"
      :title="errorMessage"
      show-icon
      :closable="false"
      class="mb-5"
    />

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
            :xAxisData="trendXAxis"
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
  import {
    useStatsDashboard,
    useStatsRealtime,
    useProjectAnalysis,
    useUserActivityRank
  } from '@/api/queries/statistics'

  defineOptions({ name: 'StatsDashboard' })

  interface DashboardCard {
    label: string
    value: number
    decimals: number
    change: string
    icon: string
  }

  // 数据加载（vue-query 自带缓存与请求去重）
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useStatsDashboard()
  const { data: realtimeData } = useStatsRealtime({ refetchInterval: 60 * 1000 })
  const { data: projectAnalysis } = useProjectAnalysis()
  const { data: activityRank } = useUserActivityRank()

  const isLoading = computed(() => dashboardLoading.value)
  const hasError = computed(() => !!dashboardError.value)
  const errorMessage = computed(() => {
    if (!dashboardError.value) return ''
    return (dashboardError.value as Error)?.message || '加载看板数据失败，请稍后重试'
  })

  // 核心指标卡片（基于 API 数据派生）
  const dashboardCards = computed<DashboardCard[]>(() => {
    const data = dashboardData.value as Api.Statistics.DashboardData | null
    const realtime = realtimeData.value as Api.Statistics.RealtimeData | null
    const activeUserSum = data?.activeUsers?.values?.reduce((a, b) => a + (b || 0), 0) ?? 0
    return [
      {
        label: '项目总数',
        value: data?.totalProjects ?? 0,
        decimals: 0,
        change: data?.ownedProjectsChange ?? '+0%',
        icon: 'ri:folder-3-line'
      },
      {
        label: '视频总数',
        value: data?.totalVideos ?? 0,
        decimals: 0,
        change: '+0%',
        icon: 'ri:movie-line'
      },
      {
        label: '活跃用户',
        value: realtime?.activeUsers ?? activeUserSum,
        decimals: 0,
        change: data?.weeklyChange ?? '+0%',
        icon: 'ri:team-line'
      },
      {
        label: '积分余额',
        value: data?.creditsBalance ?? 0,
        decimals: 0,
        change: data?.creditsBalanceChange ?? '+0%',
        icon: 'ri:coins-line'
      }
    ]
  })

  // 月份 X 轴（基于 API 数据动态生成，否则使用默认）
  const monthXAxis = computed(() => {
    const labels = (dashboardData.value as Api.Statistics.DashboardData | null)?.activeUsers?.labels
    if (labels?.length) return labels
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  })

  const trendXAxis = computed(() => monthXAxis.value)

  // 项目产出柱状图：基于项目分析数据派生
  const outputBarData = computed<BarDataItem[]>(() => {
    const list = (projectAnalysis.value as Api.Statistics.ProjectAnalysisItem[] | null) || []
    if (!list.length) {
      return [
        { name: '项目数', data: [] },
        { name: '视频数', data: [] }
      ]
    }
    return [
      { name: '项目数', data: list.map(() => 1) },
      { name: '视频数', data: list.map((i) => i.totalVideos || 0) }
    ]
  })

  // 趋势折线：基于活跃用户和总积分
  const trendLineData = computed<LineDataItem[]>(() => {
    const data = dashboardData.value as Api.Statistics.DashboardData | null
    if (data?.activeUsers?.values?.length) {
      return [{ name: '活跃用户', data: data.activeUsers.values }]
    }
    return [{ name: '活跃用户', data: [] }]
  })

  // 资源占比环形图：基于看板数据派生
  const resourcePieData = computed<PieDataItem[]>(() => {
    const data = dashboardData.value as Api.Statistics.DashboardData | null
    if (!data) return []
    return [
      { value: data.totalVideos ?? 0, name: '视频资源' },
      { value: data.totalStoryboards ?? 0, name: '分镜资源' },
      { value: data.totalAssets ?? 0, name: '素材资源' }
    ]
  })

  // 雷达图指标（前端固定维度，数据来自活跃度排行均值）
  const radarIndicators = [
    { name: '活跃度', max: 100 },
    { name: '贡献度', max: 100 },
    { name: '产出量', max: 100 },
    { name: '响应速度', max: 100 },
    { name: '协作效率', max: 100 },
    { name: '稳定性', max: 100 }
  ]

  const radarData = computed<RadarDataItem[]>(() => {
    const ranks = (activityRank.value as Api.Statistics.UserActivityRankItem[] | null) || []
    if (!ranks.length) return []
    const avg = ranks.reduce(
      (acc, r) => {
        acc.active += r.activeDays || 0
        acc.score += r.contributionScore || 0
        return acc
      },
      { active: 0, score: 0 }
    )
    const total = ranks.length
    const avgActive = Math.min(100, Math.round(avg.active / total || 0))
    const avgScore = Math.min(100, Math.round(avg.score / total || 0))
    return [
      {
        name: '团队平均',
        value: [avgActive, avgScore, avgScore, avgActive, avgScore, avgActive]
      }
    ]
  })

  // 散点图：基于项目分析视频数和时长
  const scatterData = computed<ScatterDataItem[]>(() => {
    const list = (projectAnalysis.value as Api.Statistics.ProjectAnalysisItem[] | null) || []
    return list.map((i) => ({
      value: [i.totalVideos || 0, i.totalStoryboards || 0] as [number, number]
    }))
  })

  // 活跃度热力图（基于实时活动派生，无数据时显示空）
  const heatmapRef = ref<HTMLElement>()
  const { initChart, destroyChart } = useChart()

  const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

  const heatmapData = computed<[number, number, number][]>(() => {
    const realtime = realtimeData.value as Api.Statistics.RealtimeData | null
    const activities = realtime?.data?.activities || []
    // 无后端时段分布数据时返回空，避免硬编码
    if (!activities.length) return []
    // 简单聚合：按 activities 数量分布到各天数
    const matrix: number[][] = Array.from({ length: 7 }, () => Array(6).fill(0))
    activities.forEach((_, idx) => {
      const day = idx % 7
      const hour = idx % 6
      matrix[day][hour] += 1
    })
    const result: [number, number, number][] = []
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 6; j++) {
        result.push([j, i, matrix[i][j]])
      }
    }
    return result
  })

  const generateHeatmapOptions = (): EChartsOption => {
    const themeColor = useChartOps().themeColor
    const max = heatmapData.value.length ? Math.max(...heatmapData.value.map((d) => d[2]), 1) : 1
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
        max,
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
          data: heatmapData.value,
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

  // 热力图响应数据变化
  watch(heatmapData, () => {
    if (heatmapRef.value) {
      initChart(generateHeatmapOptions())
    }
  })

  onMounted(() => {
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
