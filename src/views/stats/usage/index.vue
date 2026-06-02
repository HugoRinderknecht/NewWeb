<template>
  <div class="stats-usage-page art-full-height">
    <!-- 核心指标卡片 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol v-for="(item, index) in coreMetrics" :key="index" :sm="12" :md="6" :lg="6">
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

    <!-- 趋势图表 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">数据趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">按日/周/月查看核心指标变化趋势</p>
            </div>
            <ElRadioGroup v-model="trendPeriod" size="small">
              <ElRadioButton label="day">按日</ElRadioButton>
              <ElRadioButton label="week">按周</ElRadioButton>
              <ElRadioButton label="month">按月</ElRadioButton>
            </ElRadioGroup>
          </div>
          <ArtLineChart
            height="22rem"
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

    <!-- 同比环比分析 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">同比分析</h4>
              <p class="text-sm text-g-500 mt-1 m-0">本期数据与去年同期对比</p>
            </div>
          </div>
          <ArtBarChart
            height="18rem"
            :data="yoyBarData"
            :xAxisData="yoyXAxis"
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
              <h4 class="m-0">环比分析</h4>
              <p class="text-sm text-g-500 mt-1 m-0">本期数据与上一周期对比</p>
            </div>
          </div>
          <ArtBarChart
            height="18rem"
            :data="momBarData"
            :xAxisData="momXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import type { LineDataItem, BarDataItem } from '@/types/component/chart'
  import { fetchGetProjectUsage, fetchGetProjectUsageDetail } from '@/api/statistics'

  defineOptions({ name: 'StatsUsage' })

  type PeriodType = 'day' | 'week' | 'month'

  interface CoreMetric {
    label: string
    value: number
    decimals: number
    change: string
    icon: string
  }

  const coreMetrics = reactive<CoreMetric[]>([
    { label: '存储使用量(GB)', value: 0, decimals: 1, change: '+5%', icon: 'ri:database-2-line' },
    { label: 'AI积分已用', value: 0, decimals: 0, change: '+12%', icon: 'ri:coins-line' },
    { label: '带宽使用量(GB)', value: 0, decimals: 1, change: '+8%', icon: 'ri:wifi-line' },
    { label: '存储总量(GB)', value: 0, decimals: 0, change: '+3%', icon: 'ri:hard-drive-2-line' }
  ])

  const trendPeriod = ref<PeriodType>('day')

  const dayXAxis = [
    '1日',
    '2日',
    '3日',
    '4日',
    '5日',
    '6日',
    '7日',
    '8日',
    '9日',
    '10日',
    '11日',
    '12日',
    '13日',
    '14日',
    '15日'
  ]
  const dayLineData = ref<LineDataItem[]>([
    { name: '项目数', data: [12, 15, 18, 14, 20, 22, 25, 18, 24, 28, 30, 26, 32, 35, 38] },
    { name: '视频数', data: [35, 42, 38, 45, 50, 48, 55, 52, 60, 58, 65, 70, 68, 75, 80] },
    { name: '时长(小时)', data: [8, 10, 9, 12, 14, 13, 16, 15, 18, 17, 20, 22, 21, 24, 26] }
  ])

  const weekXAxis = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
  const weekLineData = ref<LineDataItem[]>([
    { name: '项目数', data: [45, 52, 48, 60, 55, 62, 58, 70] },
    { name: '视频数', data: [120, 135, 128, 150, 140, 160, 155, 175] },
    { name: '时长(小时)', data: [35, 40, 38, 48, 42, 50, 46, 55] }
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
  const monthLineData = ref<LineDataItem[]>([
    { name: '项目数', data: [180, 165, 190, 210, 195, 220, 240, 230, 250, 265, 280, 300] },
    { name: '视频数', data: [450, 420, 480, 520, 490, 550, 580, 560, 600, 640, 680, 720] },
    { name: '时长(小时)', data: [120, 110, 135, 150, 140, 160, 175, 165, 185, 200, 210, 230] }
  ])

  const trendXAxis = computed(() => {
    switch (trendPeriod.value) {
      case 'day':
        return dayXAxis
      case 'week':
        return weekXAxis
      case 'month':
        return monthXAxis
      default:
        return dayXAxis
    }
  })

  const trendLineData = computed<LineDataItem[]>(() => {
    switch (trendPeriod.value) {
      case 'day':
        return dayLineData.value
      case 'week':
        return weekLineData.value
      case 'month':
        return monthLineData.value
      default:
        return dayLineData.value
    }
  })

  const yoyXAxis = ['项目数', '视频数', '时长', '存储', 'AI使用']
  const yoyBarData = ref<BarDataItem[]>([
    { name: '本期', data: [1286, 3456, 186, 2048, 5200] },
    { name: '去年同期', data: [980, 2800, 145, 1680, 3800] }
  ])

  const momXAxis = ['项目数', '视频数', '时长', '存储', 'AI使用']
  const momBarData = ref<BarDataItem[]>([
    { name: '本期', data: [1286, 3456, 186, 2048, 5200] },
    { name: '上期', data: [1150, 3100, 162, 1890, 4600] }
  ])

  const loadUsageData = async () => {
    try {
      const data = (await fetchGetProjectUsage('1')) as any
      if (data) {
        coreMetrics[0].value = data.storageUsed ?? 0
        coreMetrics[1].value = data.aiCreditsUsed ?? 0
        coreMetrics[2].value = data.bandwidthUsed ?? 0
        coreMetrics[3].value = data.storageTotal ?? 0
        yoyBarData.value[0].data[3] = data.storageUsed ?? 2048
        yoyBarData.value[0].data[4] = data.aiCreditsUsed ?? 5200
        momBarData.value[0].data[3] = data.storageUsed ?? 2048
        momBarData.value[0].data[4] = data.aiCreditsUsed ?? 5200
      }
    } catch (error) {
      console.error('加载使用统计失败:', error)
    }
  }

  const loadUsageDetail = async () => {
    try {
      const data = (await fetchGetProjectUsageDetail('1')) as any
      if (data?.records) {
        const records = data.records
        const creditsByDate: Record<string, number> = {}
        const countByDate: Record<string, number> = {}
        records.forEach((r: any) => {
          creditsByDate[r.date] = (creditsByDate[r.date] || 0) + (r.credits || 0)
          countByDate[r.date] = (countByDate[r.date] || 0) + (r.count || 0)
        })
        const dates = Object.keys(creditsByDate).sort()
        if (dates.length > 0) {
          dayXAxis.length = 0
          dates.forEach((d) => dayXAxis.push(d.slice(5)))
          dayLineData.value = [
            { name: '积分消耗', data: dates.map((d) => creditsByDate[d]) },
            { name: '调用次数', data: dates.map((d) => countByDate[d]) }
          ]
        }
      }
    } catch (error) {
      console.error('加载使用详情失败:', error)
    }
  }

  onMounted(() => {
    loadUsageData()
    loadUsageDetail()
  })
</script>
