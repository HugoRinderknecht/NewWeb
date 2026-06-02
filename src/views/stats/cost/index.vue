<template>
  <div class="stats-cost-page art-full-height">
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
  import { fetchGetCreditTransactions } from '@/api/points'

  defineOptions({ name: 'StatsCost' })

  interface CostItem {
    id: number
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

  const coreMetrics = reactive<CoreMetric[]>([
    { label: '总积分消耗', value: 456800, decimals: 0, change: '+15%', icon: 'ri:coin-line' },
    {
      label: '总费用(元)',
      value: 4568.5,
      decimals: 2,
      change: '+15%',
      icon: 'ri:money-cny-circle-line'
    },
    { label: '剩余积分', value: 125200, decimals: 0, change: '-8%', icon: 'ri:wallet-3-line' },
    { label: '日均消耗', value: 15220, decimals: 0, change: '+10%', icon: 'ri:bar-chart-box-line' }
  ])

  // 趋势数据 - 按日
  const dayXAxis = Array.from({ length: 15 }, (_, i) => `${i + 1}日`)
  const dayLineData: LineDataItem[] = [
    {
      name: '积分消耗',
      data: [
        12000, 13500, 12800, 14200, 15000, 13800, 16000, 15500, 17000, 16500, 18000, 17500, 19000,
        18500, 20000
      ]
    },
    {
      name: '费用(元)',
      data: [120, 135, 128, 142, 150, 138, 160, 155, 170, 165, 180, 175, 190, 185, 200]
    }
  ]

  // 趋势数据 - 按周
  const weekXAxis = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
  const weekLineData: LineDataItem[] = [
    { name: '积分消耗', data: [85000, 92000, 88000, 95000, 102000, 98000, 110000, 105000] },
    { name: '费用(元)', data: [850, 920, 880, 950, 1020, 980, 1100, 1050] }
  ]

  // 趋势数据 - 按月
  const monthXAxis = ['1月', '2月', '3月', '4月', '5月', '6月']
  const monthLineData: LineDataItem[] = [
    { name: '积分消耗', data: [320000, 350000, 380000, 360000, 420000, 450000] },
    { name: '费用(元)', data: [3200, 3500, 3800, 3600, 4200, 4500] }
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

  // 功能分布
  const featureDistributionData = ref<PieDataItem[]>([
    { value: 156000, name: 'AI视频生成' },
    { value: 98000, name: '语音合成' },
    { value: 72000, name: 'AI图像生成' },
    { value: 58000, name: '剧本生成' },
    { value: 45000, name: '分镜生成' },
    { value: 27800, name: '其他功能' }
  ])

  // 成本预测
  const forecastXAxis = ['7月', '8月', '9月', '10月', '11月', '12月']
  const forecastBarData: BarDataItem[] = [
    { name: '预测消耗(万积分)', data: [48, 52, 55, 58, 62, 68] },
    { name: '实际消耗(万积分)', data: [45, 0, 0, 0, 0, 0] }
  ]

  // 类型选项
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

  // 费用明细
  const costList = ref<CostItem[]>([])

  const loadCostList = async () => {
    try {
      const data = await fetchGetCreditTransactions()
      if (data) {
        costList.value = (Array.isArray(data) ? data : (data as any).records || []).map(
          (item: any) => ({
            id: item.id,
            feature: item.feature || '',
            icon: item.icon || '',
            projectName: item.projectName || '',
            type: item.type || '',
            credits: item.credits || 0,
            amount: item.amount || '',
            usageCount: item.usageCount || 0,
            date: item.date || ''
          })
        ) as CostItem[]
      }
    } catch {
      ElMessage.error('加载费用明细失败')
    }
  }

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

  onMounted(() => {
    loadCostList()
  })
</script>

<style lang="scss" scoped>
  .stats-cost-page {
    height: 100%;
  }
</style>
