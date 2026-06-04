<template>
  <div class="stats-usage-page art-full-height" v-loading="isLoading">
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
  import { useProjectUsage, useProjectUsageDetail, useStatsTrends } from '@/api/queries/statistics'
  import { useProjectStore } from '@/store/modules/project'
  import { useTeamStore } from '@/store/modules/team'

  defineOptions({ name: 'StatsUsage' })

  type PeriodType = 'day' | 'week' | 'month'

  interface CoreMetric {
    label: string
    value: number
    decimals: number
    change: string
    icon: string
  }

  const projectStore = useProjectStore()
  const teamStore = useTeamStore()
  const projectId = computed(() => projectStore.currentProjectId || '')
  const teamId = computed(() => teamStore.currentTeamId || undefined)

  /* ========== 数据查询 ========== */

  const { data: usageData, isLoading: usageLoading, error: usageError } = useProjectUsage(projectId)

  const trendPeriod = ref<PeriodType>('day')

  const trendParams = computed(() => ({
    eventType: 'usage',
    granularity: trendPeriod.value
  }))

  const { data: trendData, isLoading: trendLoading } = useStatsTrends(teamId, trendParams)

  const { data: usageDetailData, isLoading: detailLoading } = useProjectUsageDetail(projectId)

  /* ========== 加载与错误状态 ========== */

  const isLoading = computed(() => usageLoading.value || trendLoading.value || detailLoading.value)

  const hasError = computed(() => !!usageError.value)

  const errorMessage = computed(() => {
    if (!usageError.value) return ''
    return (usageError.value as Error)?.message || '加载使用统计数据失败，请稍后重试'
  })

  /* ========== 核心指标 ========== */

  const coreMetrics = computed<CoreMetric[]>(() => {
    const data = usageData.value as Record<string, any> | null
    return [
      {
        label: '存储使用量(GB)',
        value: data?.storageUsed ?? 0,
        decimals: 1,
        change: data?.storageUsedChange ?? '+0%',
        icon: 'ri:database-2-line'
      },
      {
        label: 'AI积分已用',
        value: data?.aiCreditsUsed ?? 0,
        decimals: 0,
        change: data?.aiCreditsChange ?? '+0%',
        icon: 'ri:coins-line'
      },
      {
        label: '带宽使用量(GB)',
        value: data?.bandwidthUsed ?? 0,
        decimals: 1,
        change: data?.bandwidthChange ?? '+0%',
        icon: 'ri:wifi-line'
      },
      {
        label: '存储总量(GB)',
        value: data?.storageTotal ?? 0,
        decimals: 0,
        change: data?.storageTotalChange ?? '+0%',
        icon: 'ri:hard-drive-2-line'
      }
    ]
  })

  /* ========== 趋势图表 ========== */

  const trendXAxis = computed<string[]>(() => {
    const d = trendData.value as Api.Statistics.TrendData | null
    return d?.dates ?? []
  })

  const trendLineData = computed<LineDataItem[]>(() => {
    const d = trendData.value as Api.Statistics.TrendData | null
    if (!d?.metrics?.length) return []
    return d.metrics.map((m) => ({
      name: m.name,
      data: m.values ?? []
    }))
  })

  /* ========== 同比环比分析 ========== */

  function aggregateByCategory(
    records: { category: string; credits: number }[]
  ): Record<string, number> {
    const map: Record<string, number> = {}
    records.forEach((r) => {
      const cat = r.category || '其他'
      map[cat] = (map[cat] || 0) + (r.credits || 0)
    })
    return map
  }

  const yoyXAxis = computed<string[]>(() => {
    const records =
      (usageDetailData.value as Api.Statistics.ProjectUsageDetail | null)?.records ?? []
    const categories = [...new Set(records.map((r) => r.category))]
    return categories.length > 0 ? categories : ['项目数', '视频数', '时长', '存储', 'AI使用']
  })

  const yoyBarData = computed<BarDataItem[]>(() => {
    const records =
      (usageDetailData.value as Api.Statistics.ProjectUsageDetail | null)?.records ?? []
    if (!records.length) return []
    const byCategory = aggregateByCategory(records)
    const categories = Object.keys(byCategory)
    return [
      { name: '本期', data: categories.map((c) => byCategory[c]) },
      { name: '去年同期', data: categories.map(() => 0) }
    ]
  })

  const momXAxis = computed<string[]>(() => yoyXAxis.value)

  const momBarData = computed<BarDataItem[]>(() => {
    const records =
      (usageDetailData.value as Api.Statistics.ProjectUsageDetail | null)?.records ?? []
    if (!records.length) return []
    const byCategory = aggregateByCategory(records)
    const categories = Object.keys(byCategory)
    return [
      { name: '本期', data: categories.map((c) => byCategory[c]) },
      { name: '上期', data: categories.map(() => 0) }
    ]
  })
</script>
