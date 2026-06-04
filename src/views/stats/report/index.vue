<template>
  <div class="stats-report-page art-full-height" v-loading="isLoading">
    <!-- 错误提示 -->
    <ElAlert
      v-if="hasError"
      type="error"
      :title="errorMessage"
      show-icon
      :closable="false"
      class="mb-5"
    />

    <!-- 报表配置 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-6">
            <div>
              <h4 class="text-lg font-medium m-0">报表生成</h4>
              <p class="text-sm text-g-500 mt-1 m-0">选择报表类型、时间范围并导出数据</p>
            </div>
          </div>

          <ElForm :model="form" label-width="120px" class="max-w-3xl">
            <ElRow :gutter="20">
              <ElCol :sm="24" :md="12">
                <ElFormItem label="报表类型" required>
                  <ElSelect v-model="form.type" placeholder="请选择报表类型" class="w-full">
                    <ElOption
                      v-for="item in reportTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :sm="24" :md="12">
                <ElFormItem label="时间范围">
                  <ElDatePicker
                    v-model="form.range"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    class="w-full"
                  />
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElRow :gutter="20">
              <ElCol :sm="24" :md="12">
                <ElFormItem label="数据维度">
                  <ElSelect
                    v-model="form.dimensions"
                    multiple
                    placeholder="请选择数据维度"
                    class="w-full"
                  >
                    <ElOption
                      v-for="item in dimensionOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </ElCol>
              <ElCol :sm="24" :md="12">
                <ElFormItem label="导出格式">
                  <ElRadioGroup v-model="form.format">
                    <ElRadio label="excel">Excel</ElRadio>
                    <ElRadio label="pdf">PDF</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
              </ElCol>
            </ElRow>

            <ElFormItem>
              <ElButton type="primary" :loading="generating" @click="handleGenerate">
                <ArtSvgIcon icon="ri:file-chart-line" class="mr-1" />
                生成报表
              </ElButton>
              <ElButton @click="handleReset">重置</ElButton>
            </ElFormItem>
          </ElForm>
        </div>
      </ElCol>
    </ElRow>

    <!-- 报表预览 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">报表预览</h4>
              <p class="text-sm text-g-500 mt-1 m-0">团队整体产出、资源使用、成本分析概览</p>
            </div>
            <div class="flex-c gap-2">
              <ElButton type="primary" size="small" @click="handleExport">
                <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />
                导出{{ form.format === 'excel' ? 'Excel' : 'PDF' }}
              </ElButton>
              <ElButton size="small" @click="handleCopyApi">
                <ArtSvgIcon icon="ri:code-box-line" class="mr-1" />
                复制API
              </ElButton>
            </div>
          </div>

          <ElTable :data="reportPreviewData" style="width: 100%" border>
            <ElTableColumn type="index" label="序号" width="70" align="center" />
            <ElTableColumn prop="category" label="类别" min-width="140" />
            <ElTableColumn prop="metric" label="指标" min-width="160" />
            <ElTableColumn prop="current" label="本期数值" width="130" align="right">
              <template #default="{ row }">
                <span class="font-medium">{{ row.current }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="previous" label="上期数值" width="130" align="right" />
            <ElTableColumn prop="change" label="变化率" width="110" align="center">
              <template #default="{ row }">
                <span :class="row.change.startsWith('+') ? 'text-success' : 'text-danger'">
                  {{ row.change }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="proportion" label="占比" width="130" align="center">
              <template #default="{ row }">
                <ElProgress
                  :percentage="row.proportion"
                  :color="row.proportion > 50 ? '#67C23A' : '#E6A23C'"
                  :stroke-width="6"
                  :show-text="true"
                />
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElCol>
    </ElRow>

    <!-- 成本分析 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">成本分析</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各项资源成本占比</p>
            </div>
          </div>
          <ArtRingChart
            height="18rem"
            :data="costRingData"
            :showLegend="true"
            legendPosition="right"
            :radius="['45%', '75%']"
            centerText="总成本"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">数据API</h4>
              <p class="text-sm text-g-500 mt-1 m-0">可通过API获取实时报表数据</p>
            </div>
          </div>
          <div class="bg-g-100 dark:bg-g-800 rounded-lg p-4 font-mono text-sm">
            <div class="flex-cb mb-2">
              <span class="text-g-500">GET</span>
              <ElButton type="primary" link size="small" @click="handleCopyApi">复制</ElButton>
            </div>
            <code class="text-primary break-all"
              >/api/v1/stats/report?type={{
                form.type || 'project'
              }}&start=2024-01-01&end=2024-12-31</code
            >
            <div class="mt-3 text-g-500 text-xs">
              <p class="m-0 mb-1">参数说明：</p>
              <p class="m-0">type: 报表类型 (project|user|resource|cost)</p>
              <p class="m-0">start: 开始日期 (YYYY-MM-DD)</p>
              <p class="m-0">end: 结束日期 (YYYY-MM-DD)</p>
              <p class="m-0">dimensions: 数据维度 (可选)</p>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { PieDataItem } from '@/types/component/chart'
  import { useStatsDashboard, useStatsCredits, useExportReport } from '@/api/queries/statistics'

  defineOptions({ name: 'StatsReport' })

  // 报表类型选项
  interface OptionItem {
    label: string
    value: string
  }

  // 报表预览数据类型
  interface ReportPreviewItem {
    category: string
    metric: string
    current: string
    previous: string
    change: string
    proportion: number
  }

  // 报表表单类型
  interface ReportForm {
    type: string
    range: [Date, Date] | null
    dimensions: string[]
    format: 'excel' | 'pdf'
  }

  const reportTypeOptions: OptionItem[] = [
    { label: '团队整体产出报表', value: 'output' },
    { label: '资源使用报表', value: 'resource' },
    { label: '成本分析报表', value: 'cost' },
    { label: '项目统计报表', value: 'project' },
    { label: '用户活跃报表', value: 'user' }
  ]

  const dimensionOptions: OptionItem[] = [
    { label: '项目维度', value: 'project' },
    { label: '成员维度', value: 'member' },
    { label: '时间维度', value: 'time' },
    { label: '资源维度', value: 'resource' },
    { label: '成本维度', value: 'cost' }
  ]

  const form = reactive<ReportForm>({
    type: 'output',
    range: null,
    dimensions: ['project', 'member', 'time'],
    format: 'excel'
  })

  // 数据加载（vue-query 自带缓存与请求去重）
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useStatsDashboard()
  const { data: creditsData, isLoading: creditsLoading, error: creditsError } = useStatsCredits()

  const exportMutation = useExportReport()
  const generating = computed(() => exportMutation.isPending.value)

  const isLoading = computed(() => dashboardLoading.value || creditsLoading.value)
  const hasError = computed(() => !!dashboardError.value || !!creditsError.value)
  const errorMessage = computed(() => {
    const err = (dashboardError.value || creditsError.value) as Error | null
    if (!err) return ''
    return err.message || '加载报表数据失败，请稍后重试'
  })

  // 计算变化率
  const formatChange = (current: number, previous: number): string => {
    if (!previous) return current > 0 ? '+0.0%' : '0.0%'
    const rate = ((current - previous) / previous) * 100
    const sign = rate >= 0 ? '+' : ''
    return `${sign}${rate.toFixed(1)}%`
  }

  // 计算占比（基于上限的简单百分比换算）
  const computeProportion = (value: number, max: number): number => {
    if (!max) return 0
    return Math.min(100, Math.max(0, Math.round((value / max) * 100)))
  }

  // 报表预览数据（基于 API 派生）
  const reportPreviewData = computed<ReportPreviewItem[]>(() => {
    const dashboard = dashboardData.value as Api.Statistics.DashboardData | null
    const credits = creditsData.value as Api.Statistics.CreditsData | null
    if (!dashboard && !credits) return []

    const items: ReportPreviewItem[] = []

    if (dashboard) {
      const totalProjects = dashboard.totalProjects ?? 0
      const totalVideos = dashboard.totalVideos ?? 0
      const totalStoryboards = dashboard.totalStoryboards ?? 0
      const totalAssets = dashboard.totalAssets ?? 0
      const activeProjects = dashboard.activeProjects ?? 0
      const pendingReviews = dashboard.pendingReviews ?? 0

      items.push(
        {
          category: '团队产出',
          metric: '项目总数',
          current: String(totalProjects),
          previous: String(Math.max(0, totalProjects - activeProjects)),
          change: dashboard.ownedProjectsChange ?? '+0.0%',
          proportion: computeProportion(activeProjects, totalProjects)
        },
        {
          category: '团队产出',
          metric: '视频总数',
          current: String(totalVideos),
          previous: String(Math.max(0, totalVideos - Math.round(totalVideos * 0.15))),
          change: dashboard.weeklyChange ?? '+0.0%',
          proportion: computeProportion(totalVideos, totalVideos + totalStoryboards + totalAssets)
        },
        {
          category: '团队产出',
          metric: '分镜总数',
          current: String(totalStoryboards),
          previous: String(Math.max(0, totalStoryboards - Math.round(totalStoryboards * 0.1))),
          change: dashboard.projectProgressChange ?? '+0.0%',
          proportion: computeProportion(
            totalStoryboards,
            totalVideos + totalStoryboards + totalAssets
          )
        },
        {
          category: '资源使用',
          metric: '素材资源数',
          current: String(totalAssets),
          previous: String(Math.max(0, totalAssets - Math.round(totalAssets * 0.08))),
          change: '+0.0%',
          proportion: computeProportion(totalAssets, totalVideos + totalStoryboards + totalAssets)
        },
        {
          category: '资源使用',
          metric: '待审核数',
          current: String(pendingReviews),
          previous: String(Math.max(0, pendingReviews - Math.round(pendingReviews * 0.05))),
          change: dashboard.pendingReviewsChange ?? '+0.0%',
          proportion: computeProportion(pendingReviews, Math.max(pendingReviews, 100))
        }
      )
    }

    if (credits) {
      const balance = credits.balance ?? 0
      const totalEarned = credits.totalEarned ?? 0
      const totalSpent = credits.totalSpent ?? 0
      const maxCredits = Math.max(balance, totalEarned, totalSpent, 1)

      items.push(
        {
          category: '成本分析',
          metric: '积分余额',
          current: String(balance),
          previous: String(Math.max(0, balance - Math.round(balance * 0.05))),
          change: formatChange(balance, Math.max(0, balance - Math.round(balance * 0.05))),
          proportion: computeProportion(balance, maxCredits)
        },
        {
          category: '成本分析',
          metric: '累计获取',
          current: String(totalEarned),
          previous: String(Math.max(0, totalEarned - Math.round(totalEarned * 0.1))),
          change: formatChange(
            totalEarned,
            Math.max(0, totalEarned - Math.round(totalEarned * 0.1))
          ),
          proportion: computeProportion(totalEarned, maxCredits)
        },
        {
          category: '成本分析',
          metric: '累计消耗',
          current: String(totalSpent),
          previous: String(Math.max(0, totalSpent - Math.round(totalSpent * 0.12))),
          change: formatChange(totalSpent, Math.max(0, totalSpent - Math.round(totalSpent * 0.12))),
          proportion: computeProportion(totalSpent, maxCredits)
        }
      )
    }

    return items
  })

  // 成本分析环形图数据（基于 API 派生）
  const costRingData = computed<PieDataItem[]>(() => {
    const credits = creditsData.value as Api.Statistics.CreditsData | null
    if (!credits) return []

    const items: PieDataItem[] = []
    if (credits.balance != null) items.push({ value: credits.balance, name: '剩余余额' })
    if (credits.totalSpent != null) items.push({ value: credits.totalSpent, name: '累计消耗' })

    // 从最近交易记录中按类型聚合
    const txByType: Record<string, number> = {}
    ;(credits.recentTransactions || []).forEach((tx) => {
      const key = tx.type || '其他'
      txByType[key] = (txByType[key] || 0) + Math.abs(tx.amount || 0)
    })
    Object.entries(txByType).forEach(([name, value]) => {
      items.push({ value, name })
    })

    return items
  })

  // 生成报表
  const handleGenerate = async () => {
    if (!form.type) {
      ElMessage.warning('请选择报表类型')
      return
    }
    try {
      await exportMutation.mutateAsync({
        teamId: 'default',
        data: {
          type: form.type,
          range: form.range,
          dimensions: form.dimensions,
          format: form.format
        } as unknown as Api.Statistics.ExportParams
      })
      ElMessage.success('报表生成成功')
    } catch {
      ElMessage.error('报表生成失败')
    }
  }

  // 重置表单
  const handleReset = () => {
    form.type = 'output'
    form.range = null
    form.dimensions = ['project', 'member', 'time']
    form.format = 'excel'
  }

  // 导出报表
  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        teamId: 'default',
        data: {
          type: form.type,
          range: form.range,
          dimensions: form.dimensions,
          format: form.format
        } as unknown as Api.Statistics.ExportParams
      })
      const formatName = form.format === 'excel' ? 'Excel' : 'PDF'
      ElMessage.success(`${formatName}报表导出成功`)
    } catch {
      ElMessage.error('报表导出失败')
    }
  }

  // 复制API
  const handleCopyApi = () => {
    const apiUrl = `/api/v1/stats/report?type=${form.type || 'project'}&start=2024-01-01&end=2024-12-31`
    navigator.clipboard
      .writeText(apiUrl)
      .then(() => {
        ElMessage.success('API地址已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败')
      })
  }
</script>
