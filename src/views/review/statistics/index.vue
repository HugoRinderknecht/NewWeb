<template>
  <div class="review-statistics-page art-full-height">
    <!-- 顶部操作栏 -->
    <div class="flex justify-end mb-4">
      <ElButton type="primary" @click="handleExport">
        <ArtSvgIcon icon="ri:download-line" class="mr-1" />
        导出审核记录
      </ElButton>
    </div>

    <!-- 顶部统计卡片 -->
    <ElRow :gutter="16" class="mb-6">
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <ElCard class="stat-card">
          <div class="flex items-center gap-4">
            <div class="stat-icon primary">
              <ArtSvgIcon icon="ri:file-list-3-line" />
            </div>
            <div>
              <div class="stat-value">{{ statData.total.toLocaleString() }}</div>
              <div class="stat-label">审核总数</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <ElCard class="stat-card">
          <div class="flex items-center gap-4">
            <div class="stat-icon success">
              <ArtSvgIcon icon="ri:check-double-line" />
            </div>
            <div>
              <div class="stat-value">{{ statData.passed.toLocaleString() }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <ElCard class="stat-card">
          <div class="flex items-center gap-4">
            <div class="stat-icon danger">
              <ArtSvgIcon icon="ri:close-circle-line" />
            </div>
            <div>
              <div class="stat-value">{{ statData.rejected.toLocaleString() }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <ElCard class="stat-card">
          <div class="flex items-center gap-4">
            <div class="stat-icon warning">
              <ArtSvgIcon icon="ri:time-line" />
            </div>
            <div>
              <div class="stat-value">{{ statData.avgTime }}h</div>
              <div class="stat-label">平均审核时间</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 图表区域 -->
    <ElRow :gutter="16" class="mb-6">
      <ElCol :span="12" :xs="24">
        <ElCard class="chart-card">
          <template #header>
            <div class="flex-cb">
              <span class="text-base font-medium">审核通过率趋势</span>
              <ElRadioGroup v-model="timeRange" size="small">
                <ElRadioButton value="week">本周</ElRadioButton>
                <ElRadioButton value="month">本月</ElRadioButton>
                <ElRadioButton value="quarter">本季</ElRadioButton>
              </ElRadioGroup>
            </div>
          </template>
          <div ref="passRateChartRef" class="chart-container" />
        </ElCard>
      </ElCol>
      <ElCol :span="12" :xs="24">
        <ElCard class="chart-card">
          <template #header>
            <div class="flex-cb">
              <span class="text-base font-medium">平均审核时间趋势</span>
              <ElRadioGroup v-model="timeRange" size="small">
                <ElRadioButton value="week">本周</ElRadioButton>
                <ElRadioButton value="month">本月</ElRadioButton>
                <ElRadioButton value="quarter">本季</ElRadioButton>
              </ElRadioGroup>
            </div>
          </template>
          <div ref="avgTimeChartRef" class="chart-container" />
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16">
      <ElCol :span="12" :xs="24">
        <ElCard class="chart-card">
          <template #header>
            <div class="flex-cb">
              <span class="text-base font-medium">按类型分布</span>
            </div>
          </template>
          <div ref="typeChartRef" class="chart-container" />
        </ElCard>
      </ElCol>
      <ElCol :span="12" :xs="24">
        <ElCard class="chart-card">
          <template #header>
            <div class="flex-cb">
              <span class="text-base font-medium">审核人员效率排行</span>
            </div>
          </template>
          <div class="reviewer-rank">
            <div
              v-for="(item, idx) in reviewerRankList"
              :key="idx"
              class="rank-item flex items-center gap-4 py-3"
              :class="{ 'border-b': idx < reviewerRankList.length - 1 }"
            >
              <div class="rank-num" :class="{ top: idx < 3 }">{{ idx + 1 }}</div>
              <ElAvatar :size="40" :src="item.avatar">
                <ArtSvgIcon icon="ri:user-line" />
              </ElAvatar>
              <div class="flex-1">
                <div class="font-medium">{{ item.name }}</div>
                <div class="text-xs text-g-400">
                  审核 {{ item.total }} 个 / 通过 {{ item.passed }} 个
                </div>
              </div>
              <div class="text-right">
                <div
                  class="font-medium"
                  :class="item.passRate >= 90 ? 'text-success' : 'text-warning'"
                >
                  {{ item.passRate }}%
                </div>
                <div class="text-xs text-g-400">通过率</div>
              </div>
              <div class="text-right" style="width: 80px">
                <div class="font-medium">{{ item.avgTime }}h</div>
                <div class="text-xs text-g-400">平均用时</div>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import { echarts } from '@/plugins/echarts'
  import { ElMessage } from 'element-plus'
  import { fetchGetReviewStatistics, fetchExportReviewRecords } from '@/api/review'

  defineOptions({ name: 'ReviewStatistics' })

  interface ReviewerRank {
    name: string
    avatar: string
    total: number
    passed: number
    passRate: number
    avgTime: number
  }

  const timeRange = ref<'week' | 'month' | 'quarter'>('week')
  const passRateChartRef = ref<HTMLDivElement>()
  const avgTimeChartRef = ref<HTMLDivElement>()
  const typeChartRef = ref<HTMLDivElement>()

  let passRateChart: echarts.ECharts | null = null
  let avgTimeChart: echarts.ECharts | null = null
  let typeChart: echarts.ECharts | null = null

  const statData = reactive({
    total: 0,
    passed: 0,
    rejected: 0,
    avgTime: 0
  })

  const loadStatistics = async () => {
    const projectId = '1'
    try {
      const res = await fetchGetReviewStatistics(projectId)
      if (res) {
        statData.total = (res as any).total || 0
        statData.passed = (res as any).passed || 0
        statData.rejected = (res as any).rejected || 0
        statData.avgTime = (res as any).avgTime || 0
        if ((res as any).reviewerRankList) {
          reviewerRankList.value = (res as any).reviewerRankList
        }
        if ((res as any).weekData) {
          Object.assign(weekData, (res as any).weekData)
        }
        if ((res as any).monthData) {
          Object.assign(monthData, (res as any).monthData)
        }
        if ((res as any).quarterData) {
          Object.assign(quarterData, (res as any).quarterData)
        }
      }
    } catch {
      // keep default state
    }
  }

  const handleExport = async () => {
    const projectId = '1'
    try {
      await fetchExportReviewRecords(projectId)
      ElMessage.success('导出成功')
    } catch {
      ElMessage.error('导出失败')
    }
  }

  const reviewerRankList = ref<ReviewerRank[]>([
    { name: '张三', avatar: '', total: 156, passed: 142, passRate: 91, avgTime: 3.2 },
    { name: '李四', avatar: '', total: 134, passed: 128, passRate: 95.5, avgTime: 2.8 },
    { name: '王五', avatar: '', total: 128, passed: 115, passRate: 89.8, avgTime: 4.1 },
    { name: '赵六', avatar: '', total: 112, passed: 98, passRate: 87.5, avgTime: 3.9 },
    { name: '孙小亮', avatar: '', total: 98, passed: 88, passRate: 89.8, avgTime: 5.2 },
    { name: '周小芳', avatar: '', total: 87, passed: 82, passRate: 94.3, avgTime: 3.5 },
    { name: '吴小杰', avatar: '', total: 76, passed: 65, passRate: 85.5, avgTime: 4.8 }
  ])

  const weekData = {
    dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    passRate: [92, 89, 94, 91, 88, 95, 93],
    avgTime: [3.5, 4.2, 3.8, 4.5, 5.1, 3.2, 3.0]
  }

  const monthData = {
    dates: ['第1周', '第2周', '第3周', '第4周'],
    passRate: [90, 92, 88, 94],
    avgTime: [4.2, 3.8, 4.5, 3.6]
  }

  const quarterData = {
    dates: ['1月', '2月', '3月'],
    passRate: [87, 91, 93],
    avgTime: [5.1, 4.3, 3.8]
  }

  const getChartData = () => {
    switch (timeRange.value) {
      case 'week':
        return weekData
      case 'month':
        return monthData
      case 'quarter':
        return quarterData
      default:
        return weekData
    }
  }

  const initPassRateChart = () => {
    if (!passRateChartRef.value) return
    passRateChart = echarts.init(passRateChartRef.value)
    updatePassRateChart()
  }

  const updatePassRateChart = () => {
    if (!passRateChart) return
    const data = getChartData()
    passRateChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.dates },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
      series: [
        {
          name: '通过率',
          type: 'line',
          data: data.passRate,
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64,158,255,0.3)' },
              { offset: 1, color: 'rgba(64,158,255,0.05)' }
            ])
          },
          itemStyle: { color: '#409EFF' },
          lineStyle: { width: 3 }
        }
      ]
    })
  }

  const initAvgTimeChart = () => {
    if (!avgTimeChartRef.value) return
    avgTimeChart = echarts.init(avgTimeChartRef.value)
    updateAvgTimeChart()
  }

  const updateAvgTimeChart = () => {
    if (!avgTimeChart) return
    const data = getChartData()
    avgTimeChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: data.dates },
      yAxis: { type: 'value', axisLabel: { formatter: '{value}h' } },
      series: [
        {
          name: '平均审核时间',
          type: 'bar',
          data: data.avgTime,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#67C23A' },
              { offset: 1, color: '#95D475' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '40%'
        }
      ]
    })
  }

  const initTypeChart = () => {
    if (!typeChartRef.value) return
    typeChart = echarts.init(typeChartRef.value)
    typeChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: '5%', top: 'center' },
      series: [
        {
          name: '审核类型',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          data: [
            { value: 356, name: '分镜审核', itemStyle: { color: '#409EFF' } },
            { value: 278, name: '首帧图审核', itemStyle: { color: '#67C23A' } },
            { value: 312, name: '视频审核', itemStyle: { color: '#E6A23C' } },
            { value: 198, name: '剧本审核', itemStyle: { color: '#909399' } },
            { value: 142, name: '资产审核', itemStyle: { color: '#F56C6C' } }
          ]
        }
      ]
    })
  }

  watch(timeRange, () => {
    updatePassRateChart()
    updateAvgTimeChart()
  })

  const handleResize = () => {
    passRateChart?.resize()
    avgTimeChart?.resize()
    typeChart?.resize()
  }

  onMounted(() => {
    loadStatistics()
    initPassRateChart()
    initAvgTimeChart()
    initTypeChart()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    passRateChart?.dispose()
    avgTimeChart?.dispose()
    typeChart?.dispose()
  })
</script>

<style lang="scss" scoped>
  .review-statistics-page {
    .stat-card {
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        flex-shrink: 0;

        &.primary {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        &.success {
          background: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        &.danger {
          background: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }

        &.warning {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .stat-label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin-top: 4px;
      }
    }

    .chart-card {
      .chart-container {
        height: 300px;
      }
    }

    .reviewer-rank {
      .rank-item {
        &.border-b {
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .rank-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: var(--el-text-color-secondary);
          background: var(--el-fill-color-lighter);
          flex-shrink: 0;

          &.top {
            background: var(--el-color-primary);
            color: white;
          }
        }
      }
    }

    .text-success {
      color: var(--el-color-success);
    }

    .text-warning {
      color: var(--el-color-warning);
    }
  }
</style>
