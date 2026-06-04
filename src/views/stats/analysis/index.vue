<template>
  <div class="stats-analysis-page art-full-height" v-loading="isLoading">
    <ElAlert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
      class="mb-4"
    />

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
  import {
    useProjectAnalysis,
    useUserActivityRank,
    useUserContribution,
    useTeamWorkload
  } from '@/api/queries/statistics'
  import { useTeamStore } from '@/store/modules/team'

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

  const teamStore = useTeamStore()
  const teamId = computed(() => teamStore.currentTeamId || undefined)

  // Vue-query: 项目分析列表
  const {
    data: projectAnalysisData,
    isLoading: projectAnalysisLoading,
    error: projectAnalysisError
  } = useProjectAnalysis()

  // Vue-query: 用户活跃度排行
  const {
    data: activityRankData,
    isLoading: activityRankLoading,
    error: activityRankError
  } = useUserActivityRank()

  // Vue-query: 用户贡献度（用于产出效率柱状图）
  const {
    data: userContributionData,
    isLoading: userContributionLoading,
    error: userContributionError
  } = useUserContribution(teamId)

  // Vue-query: 团队工作量（用于成员工作量水平柱状图）
  const {
    data: teamWorkloadData,
    isLoading: teamWorkloadLoading,
    error: teamWorkloadError
  } = useTeamWorkload(teamId)

  // 加载与错误状态聚合
  const isLoading = computed(
    () =>
      projectAnalysisLoading.value ||
      activityRankLoading.value ||
      userContributionLoading.value ||
      teamWorkloadLoading.value
  )
  const tableLoading = computed(() => projectAnalysisLoading.value)

  const errorMessage = computed(() => {
    const err =
      projectAnalysisError.value ||
      activityRankError.value ||
      userContributionError.value ||
      teamWorkloadError.value
    if (!err) return ''
    return (err as Error)?.message || '加载分析数据失败，请稍后重试'
  })

  // 项目分析列表（基于 API 数据派生）
  const projectAnalysisList = computed<ProjectAnalysisItem[]>(() => {
    const list = (projectAnalysisData.value as Api.Statistics.ProjectAnalysisItem[] | null) || []
    return list.map((item: any) => ({
      name: item.projectName || item.name || '',
      videoCount: item.totalVideos ?? item.videoCount ?? 0,
      duration: item.duration ?? 0,
      completionRate: item.completionRate ?? 0,
      aiUsage: item.aiUsage ?? 0,
      trend: item.trend || ''
    }))
  })

  // 进度条颜色
  const getProgressColor = (rate: number): string => {
    if (rate >= 90) return '#67C23A'
    if (rate >= 70) return '#E6A23C'
    return '#F56C6C'
  }

  // 用户贡献度列表（提供给产出效率与成员名称等派生数据）
  const userContributionList = computed(
    () => (userContributionData.value as Api.Statistics.UserContributionItem[] | null) || []
  )

  // 成员名称（成员工作量横向柱状图 X 轴，由团队工作量或贡献度列表派生）
  const memberNames = computed<string[]>(() => {
    const workload = teamWorkloadData.value as any
    const workloadMembers = workload?.members || workload?.memberList || workload?.list
    if (Array.isArray(workloadMembers) && workloadMembers.length) {
      return workloadMembers.map((m: any) => m.userName || m.name || '')
    }
    return userContributionList.value.map((m: any) => m.userName || m.name || '')
  })

  // 成员工作量数据（水平柱状图）
  const memberWorkData = computed<number[]>(() => {
    const workload = teamWorkloadData.value as any
    const workloadMembers = workload?.members || workload?.memberList || workload?.list
    if (Array.isArray(workloadMembers) && workloadMembers.length) {
      return workloadMembers.map((m: any) => m.taskCount ?? m.workload ?? m.completedTasks ?? 0)
    }
    return userContributionList.value.map((m: any) => m.taskCount ?? 0)
  })

  // 产出效率 X 轴（基于用户贡献度派生）
  const efficiencyXAxis = computed<string[]>(() =>
    userContributionList.value.map((m: any) => m.userName || m.name || '')
  )

  // 产出效率数据（基于用户贡献度派生）
  const efficiencyBarData = computed<BarDataItem[]>(() => {
    const list = userContributionList.value
    return [
      { name: '视频数', data: list.map((m: any) => m.taskCount ?? 0) },
      { name: '贡献分', data: list.map((m: any) => m.contributionScore ?? 0) }
    ]
  })

  // 活跃度排名数据（基于 API 数据派生）
  const activityRankList = computed<ActivityRankItem[]>(() => {
    const list = (activityRankData.value as Api.Statistics.UserActivityRankItem[] | null) || []
    return list.map((item: any) => ({
      name: item.userName || item.name || '',
      avatar: item.avatar || '',
      department: item.department || '',
      loginCount: item.loginCount ?? item.activeDays ?? 0,
      operationCount: item.operationCount ?? 0,
      outputVideos: item.outputVideos ?? 0,
      outputDuration: item.outputDuration ?? 0,
      activityScore: item.activityScore ?? item.contributionScore ?? 0
    }))
  })

  // 排名样式
  const rankClass = (index: number): string => {
    const classes = ['bg-warning', 'bg-g-400', 'bg-theme']
    return classes[index] || ''
  }
</script>
