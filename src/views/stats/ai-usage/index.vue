<template>
  <div class="stats-ai-usage-page art-full-height" v-loading="isLoading">
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
              <h4 class="text-lg font-medium m-0">AI 用量趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">按日/周/月查看 Token 消耗与请求次数变化趋势</p>
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

    <!-- 模型分布与项目分布 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">模型分布</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各 AI 模型 Token 消耗占比</p>
            </div>
          </div>
          <ArtRingChart
            height="20rem"
            :data="modelDistributionData"
            :showLegend="true"
            legendPosition="bottom"
            centerText="总Token"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">项目分布</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各项目 AI 用量排行</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="projectBarData"
            :xAxisData="projectXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="false"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- Token 明细 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="24">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">Token 消耗明细</span>
                <ElTag type="info" size="small">按请求记录统计</ElTag>
              </div>
              <ElSpace>
                <ElInput
                  v-model="searchQuery"
                  placeholder="搜索项目/模型"
                  clearable
                  style="width: 220px"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="filterModel"
                  placeholder="模型筛选"
                  clearable
                  style="width: 140px"
                >
                  <ElOption
                    v-for="item in modelOptions"
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
            :data="filteredTokenList"
            :columns="columns"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
            <template #default>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="项目" min-width="180">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <ArtSvgIcon icon="ri:folder-3-line" class="text-g-400" />
                    <span>{{ row.projectName }}</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="模型" width="160">
                <template #default="{ row }">
                  <ElTag :type="modelTagMap[row.model] || 'info'" size="small">
                    {{ row.model }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="requestType" label="请求类型" width="140" />
              <ElTableColumn prop="inputTokens" label="Input Tokens" width="130" align="right">
                <template #default="{ row }">
                  <span>{{ formatNumber(row.inputTokens) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="outputTokens" label="Output Tokens" width="140" align="right">
                <template #default="{ row }">
                  <span>{{ formatNumber(row.outputTokens) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="totalTokens" label="总 Tokens" width="130" align="right">
                <template #default="{ row }">
                  <span class="font-medium">{{ formatNumber(row.totalTokens) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="cost" label="费用" width="100" align="right">
                <template #default="{ row }">
                  <span class="text-g-600">{{ row.cost }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="requestTime" label="请求时间" width="160" />
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
  import { useTokenUsageRecords, useStatsTrends, useStatsDashboard } from '@/api/queries/statistics'
  import { useTeamStore } from '@/store/modules/team'

  defineOptions({ name: 'StatsAiUsage' })

  interface TokenItem {
    id: string | number
    projectName: string
    model: string
    requestType: string
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: string
    requestTime: string
  }

  interface CoreMetric {
    label: string
    value: number
    decimals: number
    change: string
    icon: string
  }

  const searchQuery = ref('')
  const filterModel = ref('')

  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)
  const trendPeriod = ref<'day' | 'week' | 'month'>('day')

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // 模型选项（UI 配置，保持静态）
  const modelOptions = [
    { label: 'GPT-4o', value: 'GPT-4o' },
    { label: 'GPT-4o-mini', value: 'GPT-4o-mini' },
    { label: 'Claude 3.5', value: 'Claude 3.5' },
    { label: 'Midjourney', value: 'Midjourney' }
  ]

  const modelTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'GPT-4o': 'primary',
    'GPT-4o-mini': 'success',
    'Claude 3.5': 'warning',
    Midjourney: 'danger',
    其他模型: 'info'
  }

  // API 数据加载
  const tokenQueryParams = computed<Api.Common.CommonSearchParams>(() => ({
    current: pagination.current,
    size: pagination.size
  }))

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useStatsDashboard()

  const trendParams = computed(() => ({
    eventType: 'ai_usage',
    granularity: trendPeriod.value
  }))

  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError
  } = useStatsTrends(teamId, trendParams)

  const {
    data: tokenRecordsData,
    isLoading: tokenLoading,
    error: tokenError
  } = useTokenUsageRecords(tokenQueryParams)

  const isLoading = computed(
    () => dashboardLoading.value || trendsLoading.value || tokenLoading.value
  )

  const hasError = computed(
    () => !!dashboardError.value || !!trendsError.value || !!tokenError.value
  )

  const errorMessage = computed(() => {
    const err = dashboardError.value || trendsError.value || tokenError.value
    if (!err) return ''
    return (err as Error)?.message || '加载 AI 用量数据失败，请稍后重试'
  })

  // Token 明细列表（基于 API 数据派生）
  const tokenList = computed<TokenItem[]>(() => {
    const raw: any = tokenRecordsData.value
    const records: any[] = Array.isArray(raw) ? raw : raw?.records || []
    return records.map((item) => ({
      id: item.id,
      projectName: item.projectName || item.source || '',
      model: item.model || '',
      requestType: item.requestType || '',
      inputTokens: item.inputTokens || 0,
      outputTokens: item.outputTokens || 0,
      totalTokens: item.totalTokens || 0,
      cost: typeof item.cost === 'number' ? String(item.cost) : item.cost || '',
      requestTime: item.requestTime || item.createTime || ''
    }))
  })

  // 核心指标（从 dashboard + token 记录汇总派生）
  const coreMetrics = computed<CoreMetric[]>(() => {
    const dashboard = dashboardData.value as Api.Statistics.DashboardData | null
    const list = tokenList.value
    const totalInput = list.reduce((sum, it) => sum + (it.inputTokens || 0), 0)
    const totalOutput = list.reduce((sum, it) => sum + (it.outputTokens || 0), 0)
    const totalTokens = list.reduce((sum, it) => sum + (it.totalTokens || 0), 0)
    const totalRequests = list.length
    const change = dashboard?.weeklyChange ?? '+0%'
    return [
      {
        label: '总 Token 消耗',
        value: totalTokens,
        decimals: 0,
        change,
        icon: 'ri:coins-line'
      },
      {
        label: '总请求次数',
        value: totalRequests,
        decimals: 0,
        change,
        icon: 'ri:send-plane-line'
      },
      {
        label: 'Input Tokens',
        value: totalInput,
        decimals: 0,
        change,
        icon: 'ri:arrow-down-circle-line'
      },
      {
        label: 'Output Tokens',
        value: totalOutput,
        decimals: 0,
        change,
        icon: 'ri:arrow-up-circle-line'
      }
    ]
  })

  // 趋势图：X 轴
  const trendXAxis = computed<string[]>(() => {
    const data = trendsData.value as Api.Statistics.TrendData | null
    return data?.dates || []
  })

  // 趋势图：折线数据
  const trendLineData = computed<LineDataItem[]>(() => {
    const data = trendsData.value as Api.Statistics.TrendData | null
    const metrics = data?.metrics || []
    return metrics.map((m) => ({
      name: m.name,
      data: m.values || []
    }))
  })

  // 模型分布（基于 token 明细按模型聚合）
  const modelDistributionData = computed<PieDataItem[]>(() => {
    const map = new Map<string, number>()
    tokenList.value.forEach((item) => {
      if (!item.model) return
      map.set(item.model, (map.get(item.model) || 0) + (item.totalTokens || 0))
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  })

  // 项目分布（基于 token 明细按项目聚合）
  const projectXAxis = computed<string[]>(() => {
    const map = new Map<string, number>()
    tokenList.value.forEach((item) => {
      if (!item.projectName) return
      map.set(item.projectName, (map.get(item.projectName) || 0) + (item.totalTokens || 0))
    })
    return Array.from(map.keys())
  })

  const projectBarData = computed<BarDataItem[]>(() => {
    const map = new Map<string, number>()
    tokenList.value.forEach((item) => {
      if (!item.projectName) return
      map.set(item.projectName, (map.get(item.projectName) || 0) + (item.totalTokens || 0))
    })
    return [
      {
        name: 'Token 消耗',
        data: Array.from(map.values())
      }
    ]
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'projectName', label: '项目', minWidth: 180 },
    { prop: 'model', label: '模型', width: 160 },
    { prop: 'requestType', label: '请求类型', width: 140 },
    { prop: 'inputTokens', label: 'Input Tokens', width: 130 },
    { prop: 'outputTokens', label: 'Output Tokens', width: 140 },
    { prop: 'totalTokens', label: '总 Tokens', width: 130 },
    { prop: 'cost', label: '费用', width: 100 },
    { prop: 'requestTime', label: '请求时间', width: 160 }
  ]

  const filteredTokenList = computed(() => {
    let result = tokenList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.projectName.toLowerCase().includes(q) || item.model.toLowerCase().includes(q)
      )
    }
    if (filterModel.value) {
      result = result.filter((item) => item.model === filterModel.value)
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
    return (num || 0).toLocaleString()
  }

  const handleExport = () => {
    ElMessage.success('Token 明细导出成功')
  }
</script>

<style lang="scss" scoped>
  .stats-ai-usage-page {
    height: 100%;
  }
</style>
