<template>
  <div class="stats-report-page art-full-height">
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
  import { fetchExportReport } from '@/api/statistics'

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

  const generating = ref(false)

  // 报表预览数据
  const reportPreviewData = reactive<ReportPreviewItem[]>([
    {
      category: '团队产出',
      metric: '完成项目数',
      current: '128',
      previous: '110',
      change: '+16.4%',
      proportion: 85
    },
    {
      category: '团队产出',
      metric: '产出视频数',
      current: '3,456',
      previous: '2,980',
      change: '+16.0%',
      proportion: 92
    },
    {
      category: '团队产出',
      metric: '总时长(小时)',
      current: '186.5',
      previous: '162.0',
      change: '+15.1%',
      proportion: 78
    },
    {
      category: '资源使用',
      metric: '存储使用量(GB)',
      current: '2,048',
      previous: '1,890',
      change: '+8.4%',
      proportion: 65
    },
    {
      category: '资源使用',
      metric: 'AI调用次数',
      current: '52,000',
      previous: '46,000',
      change: '+13.0%',
      proportion: 72
    },
    {
      category: '资源使用',
      metric: '渲染时长(小时)',
      current: '420',
      previous: '380',
      change: '+10.5%',
      proportion: 55
    },
    {
      category: '成本分析',
      metric: '存储成本(元)',
      current: '¥4,800',
      previous: '¥4,200',
      change: '+14.3%',
      proportion: 45
    },
    {
      category: '成本分析',
      metric: 'AI服务成本(元)',
      current: '¥12,500',
      previous: '¥10,800',
      change: '+15.7%',
      proportion: 68
    },
    {
      category: '成本分析',
      metric: '渲染成本(元)',
      current: '¥8,200',
      previous: '¥7,500',
      change: '+9.3%',
      proportion: 52
    }
  ])

  // 成本分析环形图数据
  const costRingData = reactive<PieDataItem[]>([
    { value: 4800, name: '存储成本' },
    { value: 12500, name: 'AI服务' },
    { value: 8200, name: '渲染成本' },
    { value: 3500, name: '带宽成本' },
    { value: 2000, name: '其他' }
  ])

  // 生成报表
  const handleGenerate = async () => {
    if (!form.type) {
      ElMessage.warning('请选择报表类型')
      return
    }
    generating.value = true
    try {
      await fetchExportReport('default', {
        type: form.type,
        range: form.range,
        dimensions: form.dimensions,
        format: form.format
      })
      ElMessage.success('报表生成成功')
    } catch {
      ElMessage.error('报表生成失败')
    } finally {
      generating.value = false
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
  const handleExport = () => {
    const formatName = form.format === 'excel' ? 'Excel' : 'PDF'
    ElMessage.success(`正在导出${formatName}报表...`)
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
