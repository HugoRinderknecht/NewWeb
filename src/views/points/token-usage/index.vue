<template>
  <div class="points-token-usage-page art-full-height">
    <!-- 核心指标 -->
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
              <h4 class="text-lg font-medium m-0">Token 用量趋势</h4>
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
              <p class="text-sm text-g-500 mt-1 m-0">各项目 Token 用量排行</p>
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

    <!-- Token 用量明细 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="24">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">Token 用量明细</span>
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
                  <ElTag :type="modelTagMap[row.model]" size="small">{{ row.model }}</ElTag>
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
  import { ElMessage } from 'element-plus'
  import type { LineDataItem, BarDataItem, PieDataItem } from '@/types/component/chart'
  import type { ColumnOption } from '@/types/component'
  import { useTokenUsageRecords } from '@/api/queries'

  defineOptions({ name: 'PointsTokenUsage' })

  interface TokenItem {
    id: number
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
  const trendPeriod = ref<'day' | 'week' | 'month'>('day')

  const coreMetrics = reactive<CoreMetric[]>([
    { label: '总 Token 消耗', value: 2847500, decimals: 0, change: '+18%', icon: 'ri:coins-line' },
    { label: '总请求次数', value: 12580, decimals: 0, change: '+12%', icon: 'ri:send-plane-line' },
    {
      label: 'Input Tokens',
      value: 1850900,
      decimals: 0,
      change: '+15%',
      icon: 'ri:arrow-down-circle-line'
    },
    {
      label: 'Output Tokens',
      value: 996600,
      decimals: 0,
      change: '+22%',
      icon: 'ri:arrow-up-circle-line'
    }
  ])

  // 趋势数据 - 按日
  const dayXAxis = Array.from({ length: 15 }, (_, i) => `${i + 1}日`)
  const dayLineData: LineDataItem[] = [
    {
      name: '总 Tokens',
      data: [
        120000, 135000, 128000, 142000, 150000, 138000, 160000, 155000, 170000, 165000, 180000,
        175000, 190000, 185000, 200000
      ]
    },
    {
      name: '请求次数',
      data: [520, 580, 550, 620, 650, 600, 700, 680, 750, 720, 800, 780, 850, 820, 900]
    }
  ]

  // 趋势数据 - 按周
  const weekXAxis = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
  const weekLineData: LineDataItem[] = [
    {
      name: '总 Tokens',
      data: [850000, 920000, 880000, 950000, 1020000, 980000, 1100000, 1050000]
    },
    { name: '请求次数', data: [3500, 3800, 3600, 4000, 4200, 3900, 4500, 4300] }
  ]

  // 趋势数据 - 按月
  const monthXAxis = ['1月', '2月', '3月', '4月', '5月', '6月']
  const monthLineData: LineDataItem[] = [
    { name: '总 Tokens', data: [3200000, 3500000, 3800000, 3600000, 4200000, 4500000] },
    { name: '请求次数', data: [12000, 13500, 15000, 14000, 16500, 18000] }
  ]

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
        return dayLineData
      case 'week':
        return weekLineData
      case 'month':
        return monthLineData
      default:
        return dayLineData
    }
  })

  // 模型分布
  const modelDistributionData = ref<PieDataItem[]>([
    { value: 1250000, name: 'GPT-4o' },
    { value: 680000, name: 'GPT-4o-mini' },
    { value: 420000, name: 'Claude 3.5' },
    { value: 280000, name: 'Midjourney' },
    { value: 217500, name: '其他模型' }
  ])

  // 项目分布
  const projectXAxis = [
    '品牌宣传片',
    '产品发布',
    '企业年会',
    '培训课程',
    '社交媒体',
    '客户案例',
    '技术演示',
    '招聘宣传'
  ]
  const projectBarData: BarDataItem[] = [
    { name: 'Token 消耗(万)', data: [45, 38, 52, 68, 35, 28, 42, 18] }
  ]

  // 模型选项
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

  const { data: tokenUsageData } = useTokenUsageRecords()

  const tokenList = computed<TokenItem[]>(() => {
    const data = tokenUsageData.value
    if (!data) return []
    return (Array.isArray(data) ? data : (data as any).records || []).map((item: any) => ({
      id: item.id,
      projectName: item.projectName || '',
      model: item.model || '',
      requestType: item.requestType || '',
      inputTokens: item.inputTokens || 0,
      outputTokens: item.outputTokens || 0,
      totalTokens: item.totalTokens || 0,
      cost: item.cost || '',
      requestTime: item.requestTime || ''
    })) as TokenItem[]
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

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

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
    return num.toLocaleString()
  }

  const handleExport = () => {
    ElMessage.success('Token 用量明细导出成功')
  }
</script>

<style lang="scss" scoped>
  .points-token-usage-page {
    height: 100%;
  }
</style>
