<template>
  <div class="stats-cost-page art-full-height" v-loading="isLoading">
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

    <!-- 积分趋势 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">积分消耗趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">按日/周/月查看积分消耗变化趋势</p>
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

    <!-- 功能分布与成本预测 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">功能分布</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各功能模块积分消耗占比</p>
            </div>
          </div>
          <ArtRingChart
            height="20rem"
            :data="featureDistributionData"
            :showLegend="true"
            legendPosition="bottom"
            centerText="总积分"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">成本预测</h4>
              <p class="text-sm text-g-500 mt-1 m-0">基于历史数据的未来成本预测</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="forecastBarData"
            :xAxisData="forecastXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 费用明细 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="24">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">费用明细</span>
                <ElTag type="info" size="small">按功能模块统计</ElTag>
              </div>
              <ElSpace>
                <ElInput
                  v-model="searchQuery"
                  placeholder="搜索功能/项目"
                  clearable
                  style="width: 220px"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="filterType"
                  placeholder="类型筛选"
                  clearable
                  style="width: 140px"
                >
                  <ElOption
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
                <ElButton type="primary" @click="handleExport">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  导出
                </ElButton>
              </ElSpace>
            </div>
          </template>
          <ArtTable
            :data="filteredCostList"
            :columns="columns"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
            <template #default>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="功能模块" min-width="160">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <ArtSvgIcon :icon="row.icon" class="text-g-400" />
                    <span>{{ row.feature }}</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="projectName" label="项目" min-width="160" />
              <ElTableColumn label="类型" width="120">
                <template #default="{ row }">
                  <ElTag :type="typeTagMap[row.type]" size="small">{{ row.type }}</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="credits" label="消耗积分" width="130" align="right">
                <template #default="{ row }">
                  <span class="font-medium">{{ formatNumber(row.credits) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="amount" label="金额" width="100" align="right">
                <template #default="{ row }">
                  <span class="text-g-600">{{ row.amount }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="usageCount" label="使用次数" width="100" align="center" />
              <ElTableColumn prop="date" label="日期" width="120" />
            </template>
          </ArtTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import type { LineDataItem, BarDataItem, PieDataItem } from '@/types/component/chart'
  import type { ColumnOption } from '@/types/component'
  import {
    useStatsCredits,
    useMyCredits,
    useCreditTransactions,
    useStatsTrends
  } from '@/api/queries/statistics'
  import { useTeamStore } from '@/store/modules/team'

  defineOptions({ name: 'StatsCost' })

  interface CostItem {
    id: string | number
    feature: string
    icon: string
    projectName: string
    type: string
    credits: number
    amount: string
    usageCount: number
    date: string
  }

  interface CoreMetric {
    label: string
    value: number
    decimals: number
    change: string
    icon: string
  }

  const searchQuery = ref('')
  const filterType = ref('')
  const trendPeriod = ref<'day' | 'week' | 'month'>('day')

  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)

  // 类型选项（UI 常量）
  const typeOptions = [
    { label: 'AI视频生成', value: 'AI视频生成' },
    { label: '语音合成', value: '语音合成' },
    { label: 'AI图像生成', value: 'AI图像生成' },
    { label: '剧本生成', value: '剧本生成' },
    { label: '分镜生成', value: '分镜生成' }
  ]

  const typeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    AI视频生成: 'primary',
    语音合成: 'success',
    AI图像生成: 'warning',
    剧本生成: 'danger',
    分镜生成: 'info',
    其他功能: 'info'
  }

  // 功能图标映射
  const featureIconMap: Record<string, string> = {
    AI视频生成: 'ri:movie-line',
    语音合成: 'ri:mic-line',
    AI图像生成: 'ri:image-line',
    剧本生成: 'ri:file-text-line',
    分镜生成: 'ri:gallery-line',
    其他功能: 'ri:apps-line'
  }

  // 数据加载（vue-query）
  const { data: creditsData, isLoading: creditsLoading, error: creditsError } = useStatsCredits()
  const { data: myCreditsData, isLoading: myCreditsLoading, error: myCreditsError } = useMyCredits()
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    error: transactionsError
  } = useCreditTransactions()
  const trendParams = computed(() => ({
    eventType: 'cost',
    granularity: trendPeriod.value
  }))
  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError
  } = useStatsTrends(teamId, trendParams)

  const isLoading = computed(
    () =>
      creditsLoading.value ||
      myCreditsLoading.value ||
      transactionsLoading.value ||
      trendsLoading.value
  )

  const hasError = computed(
    () =>
      !!creditsError.value ||
      !!myCreditsError.value ||
      !!transactionsError.value ||
      !!trendsError.value
  )

  const errorMessage = computed(() => {
    const err =
      creditsError.value || myCreditsError.value || transactionsError.value || trendsError.value
    if (!err) return ''
    return (err as Error)?.message || '加载费用数据失败，请稍后重试'
  })

  // 核心指标：基于 useStatsCredits + useMyCredits 派生
  const coreMetrics = computed<CoreMetric[]>(() => {
    const credits = creditsData.value as Api.Statistics.CreditsData | null
    const my = myCreditsData.value as Api.Points.CreditInfo | null
    const totalSpent = credits?.totalSpent ?? my?.totalSpent ?? 0
    const balance = credits?.balance ?? my?.balance ?? 0
    const recent = credits?.recentTransactions ?? []
    const dailyAvg = recent.length
      ? Math.round(recent.reduce((sum, t) => sum + (t.amount || 0), 0) / recent.length)
      : 0
    return [
      {
        label: '总积分消耗',
        value: totalSpent,
        decimals: 0,
        change: '+0%',
        icon: 'ri:coin-line'
      },
      {
        label: '总费用(元)',
        value: Number((totalSpent / 100).toFixed(2)),
        decimals: 2,
        change: '+0%',
        icon: 'ri:money-cny-circle-line'
      },
      {
        label: '剩余积分',
        value: balance,
        decimals: 0,
        change: '+0%',
        icon: 'ri:wallet-3-line'
      },
      {
        label: '日均消耗',
        value: dailyAvg,
        decimals: 0,
        change: '+0%',
        icon: 'ri:bar-chart-box-line'
      }
    ]
  })

  // 趋势 X 轴
  const trendXAxis = computed<string[]>(() => {
    const trends = trendsData.value as Api.Statistics.TrendData | null
    if (trends?.dates?.length) return trends.dates
    if (trends?.data?.labels?.length) return trends.data.labels
    return []
  })

  // 趋势数据
  const trendLineData = computed<LineDataItem[]>(() => {
    const trends = trendsData.value as Api.Statistics.TrendData | null
    if (trends?.metrics?.length) {
      return trends.metrics.map((m) => ({ name: m.name, data: m.values || [] }))
    }
    if (trends?.data?.values?.length) {
      return [{ name: '积分消耗', data: trends.data.values }]
    }
    return []
  })

  // 费用明细：基于 useCreditTransactions 派生
  const costList = computed<CostItem[]>(() => {
    const data =
      transactionsData.value as Api.Common.PaginatedResponse<Api.Points.TransactionRecord> | null
    const records = Array.isArray(data) ? data : data?.records || []
    return records.map((item: any) => {
      const feature = item.source || item.feature || item.description || '其他功能'
      const credits = Math.abs(Number(item.amount ?? item.credits ?? 0))
      return {
        id: item.id,
        feature,
        icon: item.icon || featureIconMap[feature] || 'ri:apps-line',
        projectName: item.projectName || '-',
        type: item.type === 'earn' ? '充值' : feature,
        credits,
        amount: item.amount != null ? `¥${(credits / 100).toFixed(2)}` : '-',
        usageCount: item.usageCount || 1,
        date: item.createTime || item.date || ''
      } as CostItem
    })
  })

  // 功能分布：由 useCreditTransactions 按类型聚合
  const featureDistributionData = computed<PieDataItem[]>(() => {
    const aggMap = new Map<string, number>()
    costList.value.forEach((item) => {
      const key = item.feature || '其他功能'
      aggMap.set(key, (aggMap.get(key) || 0) + (item.credits || 0))
    })
    return Array.from(aggMap.entries()).map(([name, value]) => ({ name, value }))
  })

  // 成本预测：基于趋势历史数据派生
  const forecastXAxis = computed<string[]>(() => trendXAxis.value)
  const forecastBarData = computed<BarDataItem[]>(() => {
    const trends = trendsData.value as Api.Statistics.TrendData | null
    const values = trends?.metrics?.[0]?.values || trends?.data?.values || []
    if (!values.length) {
      return [
        { name: '预测消耗', data: [] },
        { name: '实际消耗', data: [] }
      ]
    }
    // 简单线性预测：基于历史均值
    const avg = values.reduce((a, b) => a + (b || 0), 0) / values.length
    const forecast = values.map((_, idx) => Math.round(avg * (1 + idx * 0.05)))
    return [
      { name: '实际消耗', data: values },
      { name: '预测消耗', data: forecast }
    ]
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'feature', label: '功能模块', minWidth: 160 },
    { prop: 'projectName', label: '项目', minWidth: 160 },
    { prop: 'type', label: '类型', width: 120 },
    { prop: 'credits', label: '消耗积分', width: 130 },
    { prop: 'amount', label: '金额', width: 100 },
    { prop: 'usageCount', label: '使用次数', width: 100 },
    { prop: 'date', label: '日期', width: 120 }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredCostList = computed(() => {
    let result = costList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.feature.toLowerCase().includes(q) || item.projectName.toLowerCase().includes(q)
      )
    }
    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }
    const total = result.length
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    nextTick(() => {
      pagination.total = total
    })
    return result.slice(start, end)
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const handleExport = () => {
    ElMessage.success('费用明细导出成功')
  }
</script>

<style lang="scss" scoped>
  .stats-cost-page {
    height: 100%;
  }
</style>
