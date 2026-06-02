<template>
  <div class="stats-analysis-page art-full-height">
    <!-- 项目分析 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">项目数据分析</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各项目视频数量、时长、完成率、AI使用量统计</p>
            </div>
          </div>
          <ElTable :data="projectAnalysisList" style="width: 100%" v-loading="tableLoading">
            <ElTableColumn type="index" label="序号" width="70" align="center" />
            <ElTableColumn prop="name" label="项目名称" min-width="160" show-overflow-tooltip />
            <ElTableColumn prop="videoCount" label="视频数量" width="110" align="center" />
            <ElTableColumn prop="duration" label="总时长" width="110" align="center">
              <template #default="{ row }">
                <span>{{ row.duration }}小时</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="completionRate" label="完成率" width="140" align="center">
              <template #default="{ row }">
                <ElProgress
                  :percentage="row.completionRate"
                  :color="getProgressColor(row.completionRate)"
                  :stroke-width="8"
                  :show-text="true"
                />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="aiUsage" label="AI使用量" width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.aiUsage }}次</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="trend" label="趋势" width="100" align="center">
              <template #default="{ row }">
                <span :class="row.trend.startsWith('+') ? 'text-success' : 'text-danger'">
                  {{ row.trend }}
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElCol>
    </ElRow>

    <!-- 成员工作量与产出效率 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">成员工作量</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各成员任务完成情况统计</p>
            </div>
          </div>
          <ArtHBarChart
            height="20rem"
            :data="memberWorkData"
            :xAxisData="memberNames"
            :showAxisLine="true"
            :showSplitLine="true"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">产出效率</h4>
              <p class="text-sm text-g-500 mt-1 m-0">人均产出视频数与时长对比</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="efficiencyBarData"
            :xAxisData="efficiencyXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 活跃度排名 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">成员活跃度排名</h4>
              <p class="text-sm text-g-500 mt-1 m-0">综合登录频次、操作次数、产出量进行排名</p>
            </div>
          </div>
          <ElTable :data="activityRankList" style="width: 100%">
            <ElTableColumn label="排名" width="80" align="center">
              <template #default="{ $index }">
                <div class="flex-cc">
                  <span
                    v-if="$index < 3"
                    class="size-6 rounded-full flex-cc text-white text-xs font-bold"
                    :class="rankClass($index)"
                  >
                    {{ $index + 1 }}
                  </span>
                  <span v-else class="text-g-500 text-sm">{{ $index + 1 }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="name" label="成员名称" min-width="140">
              <template #default="{ row }">
                <div class="flex-c">
                  <ElAvatar :size="32" :src="row.avatar" class="mr-2">
                    {{ row.name.charAt(0) }}
                  </ElAvatar>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="department" label="部门" width="140" />
            <ElTableColumn prop="loginCount" label="登录次数" width="110" align="center" />
            <ElTableColumn prop="operationCount" label="操作次数" width="110" align="center" />
            <ElTableColumn prop="outputVideos" label="产出视频" width="110" align="center" />
            <ElTableColumn prop="outputDuration" label="产出时长" width="110" align="center">
              <template #default="{ row }">
                <span>{{ row.outputDuration }}小时</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="activityScore" label="活跃得分" width="110" align="center">
              <template #default="{ row }">
                <span class="font-bold text-primary">{{ row.activityScore }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import type { BarDataItem } from '@/types/component/chart'
  import { fetchGetProjectAnalysis, fetchGetUserActivityRank } from '@/api/statistics'

  defineOptions({ name: 'StatsAnalysis' })

  // 项目分析数据类型
  interface ProjectAnalysisItem {
    name: string
    videoCount: number
    duration: number
    completionRate: number
    aiUsage: number
    trend: string
  }

  // 成员活跃度类型
  interface ActivityRankItem {
    name: string
    avatar: string
    department: string
    loginCount: number
    operationCount: number
    outputVideos: number
    outputDuration: number
    activityScore: number
  }

  const tableLoading = ref(false)

  // 项目分析数据
  const projectAnalysisList = ref<ProjectAnalysisItem[]>([])

  const loadProjectAnalysisList = async () => {
    try {
      tableLoading.value = true
      const data = await fetchGetProjectAnalysis()
      if (data) {
        const records = Array.isArray(data) ? data : []
        projectAnalysisList.value = records.map((item: any) => ({
          name: item.name || '',
          videoCount: item.videoCount || 0,
          duration: item.duration || 0,
          completionRate: item.completionRate || 0,
          aiUsage: item.aiUsage || 0,
          trend: item.trend || ''
        })) as ProjectAnalysisItem[]
      }
    } catch {
      ElMessage.error('加载项目统计数据失败')
    } finally {
      tableLoading.value = false
    }
  }

  // 进度条颜色
  const getProgressColor = (rate: number): string => {
    if (rate >= 90) return '#67C23A'
    if (rate >= 70) return '#E6A23C'
    return '#F56C6C'
  }

  // 成员名称
  const memberNames = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']

  // 成员工作量数据（水平柱状图）
  const memberWorkData = ref<number[]>([45, 38, 52, 30, 42, 35, 48, 28])

  // 产出效率X轴
  const efficiencyXAxis = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']

  // 产出效率数据
  const efficiencyBarData: BarDataItem[] = [
    { name: '视频数', data: [12, 10, 15, 8, 11, 9, 14, 7] },
    { name: '时长(小时)', data: [28, 22, 35, 18, 25, 20, 32, 15] }
  ]

  // 活跃度排名数据
  const activityRankList = ref<ActivityRankItem[]>([])

  const loadActivityRankList = async () => {
    try {
      const data = await fetchGetUserActivityRank()
      if (data) {
        const records = Array.isArray(data) ? data : []
        activityRankList.value = records.map((item: any) => ({
          name: item.name || '',
          avatar: item.avatar || '',
          department: item.department || '',
          loginCount: item.loginCount || 0,
          operationCount: item.operationCount || 0,
          outputVideos: item.outputVideos || 0,
          outputDuration: item.outputDuration || 0,
          activityScore: item.activityScore || 0
        })) as ActivityRankItem[]
      }
    } catch {
      ElMessage.error('加载活跃度排名数据失败')
    }
  }

  // 排名样式
  const rankClass = (index: number): string => {
    const classes = ['bg-warning', 'bg-g-400', 'bg-theme']
    return classes[index] || ''
  }

  onMounted(() => {
    loadProjectAnalysisList()
    loadActivityRankList()
  })
</script>
