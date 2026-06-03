<template>
  <div class="project-statistics-page art-full-height">
    <!-- 统计卡片 -->
    <ElRow :gutter="16" class="mb-6">
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon primary">
            <ArtSvgIcon icon="ri:film-line" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalEpisodes }}</div>
            <div class="stat-label">总集数</div>
          </div>
        </div>
      </ElCol>
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon success">
            <ArtSvgIcon icon="ri:movie-line" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalShots }}</div>
            <div class="stat-label">总镜头数</div>
          </div>
        </div>
      </ElCol>
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon warning">
            <ArtSvgIcon icon="ri:team-line" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalMembers }}</div>
            <div class="stat-label">项目成员</div>
          </div>
        </div>
      </ElCol>
      <ElCol :span="6" :xs="12" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon danger">
            <ArtSvgIcon icon="ri:time-line" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalDuration }}s</div>
            <div class="stat-label">总时长</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 进度统计 -->
    <ElRow :gutter="16" class="mb-6">
      <ElCol :span="12" :xs="24" :sm="24" :md="12">
        <ElCard class="h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <ArtSvgIcon icon="ri:bar-chart-box-line" />
              <span class="font-medium">整体进度</span>
            </div>
          </template>
          <div class="progress-section">
            <div class="progress-item">
              <div class="flex-cb mb-2">
                <span>分镜完成率</span>
                <span class="text-primary font-medium">{{ storyboardProgress }}%</span>
              </div>
              <ElProgress
                :percentage="storyboardProgress"
                :color="progressColors.primary"
                :stroke-width="12"
                striped
                striped-flow
              />
            </div>
            <div class="progress-item">
              <div class="flex-cb mb-2">
                <span>首帧图完成率（派生指标）</span>
                <span class="text-success font-medium">{{ firstFrameProgress }}%</span>
              </div>
              <ElProgress
                :percentage="firstFrameProgress"
                :color="progressColors.success"
                :stroke-width="12"
                striped
                striped-flow
              />
            </div>
            <div class="progress-item">
              <div class="flex-cb mb-2">
                <span>视频完成率</span>
                <span class="text-warning font-medium">{{ videoProgress }}%</span>
              </div>
              <ElProgress
                :percentage="videoProgress"
                :color="progressColors.warning"
                :stroke-width="12"
                striped
                striped-flow
              />
            </div>
            <div class="progress-item">
              <div class="flex-cb mb-2">
                <span>整体完成率</span>
                <span class="text-danger font-medium">{{ overallProgress }}%</span>
              </div>
              <ElProgress
                :percentage="overallProgress"
                :color="progressColors.danger"
                :stroke-width="12"
                striped
                striped-flow
              />
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12" :xs="24" :sm="24" :md="12">
        <ElCard class="h-full">
          <template #header>
            <div class="flex items-center gap-2">
              <ArtSvgIcon icon="ri:pie-chart-line" />
              <span class="font-medium">资源消耗</span>
            </div>
          </template>
          <div class="resource-section">
            <div class="resource-item flex-cb py-3">
              <div class="flex-c">
                <div class="resource-icon primary">
                  <ArtSvgIcon icon="ri:cpu-line" />
                </div>
                <div>
                  <div class="font-medium">AI算力消耗</div>
                  <div class="text-xs text-g-400">累计消耗</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">{{ aiComputeCost.toLocaleString() }}</div>
                <div class="text-xs text-g-400">积分</div>
              </div>
            </div>
            <ElDivider />
            <div class="resource-item flex-cb py-3">
              <div class="flex-c">
                <div class="resource-icon success">
                  <ArtSvgIcon icon="ri:hard-drive-2-line" />
                </div>
                <div>
                  <div class="font-medium">
                    存储空间
                    <ElTooltip content="此值来自团队配额，暂为占位值" placement="top">
                      <ArtSvgIcon icon="ri:information-line" class="text-g-400 cursor-help" />
                    </ElTooltip>
                  </div>
                  <div class="text-xs text-g-400">已使用 / 总计</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">{{ storageUsedGB }} / {{ storageTotalGB }} GB</div>
                <ElProgress
                  :percentage="storagePercentage"
                  :color="progressColors.success"
                  :stroke-width="6"
                />
              </div>
            </div>
            <ElDivider />
            <div class="resource-item flex-cb py-3">
              <div class="flex-c">
                <div class="resource-icon warning">
                  <ArtSvgIcon icon="ri:token-line" />
                </div>
                <div>
                  <div class="font-medium">Token 消耗</div>
                  <div class="text-xs text-g-400">累计消耗</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">{{ formatTokenCount(tokenConsumption) }}</div>
                <div class="text-xs text-g-400">tokens</div>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 分镜统计 -->
    <ElCard class="mb-6">
      <template #header>
        <div class="flex items-center gap-2">
          <ArtSvgIcon icon="ri:stack-line" />
          <span class="font-medium">分镜统计</span>
        </div>
      </template>
      <ElTable :data="storyboardTableData" style="width: 100%">
        <ElTableColumn prop="label" label="状态" min-width="160" />
        <ElTableColumn label="数量" width="200">
          <template #default="scope">
            <span :style="{ color: scope.row.color, fontWeight: 600, fontSize: '16px' }">
              {{ scope.row.count }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="占比" min-width="200">
          <template #default="scope">
            <ElProgress
              :percentage="
                totalEpisodes > 0 ? Math.round((scope.row.count / totalEpisodes) * 100) : 0
              "
              :color="scope.row.color"
              :stroke-width="8"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 视频统计 -->
    <ElCard>
      <template #header>
        <div class="flex items-center gap-2">
          <ArtSvgIcon icon="ri:video-line" />
          <span class="font-medium">视频生成统计</span>
        </div>
      </template>
      <ElTable :data="videoTableData" style="width: 100%">
        <ElTableColumn prop="label" label="状态" min-width="160" />
        <ElTableColumn label="数量" width="200">
          <template #default="scope">
            <span :style="{ color: scope.row.color, fontWeight: 600, fontSize: '16px' }">
              {{ scope.row.count }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="占比" min-width="200">
          <template #default="scope">
            <ElProgress
              :percentage="
                videoTableData.length > 0 && videoTableData[0].count > 0
                  ? Math.round((scope.row.count / videoTableData[0].count) * 100)
                  : 0
              "
              :color="scope.row.color"
              :stroke-width="8"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useProjectStatistics } from '@/api/queries/project'
  import {
    fetchGetProjectStoryboardStats,
    fetchGetProjectVideoStats,
    fetchGetProjectResources,
    fetchGetProjectAiUsage
  } from '@/api/statistics'
  import { logger } from '@/utils/logger'

  defineOptions({ name: 'ProjectStatistics' })

  const route = useRoute()

  const projectId = ref((route.query.id as string) || (route.params.id as string) || '')

  // 项目统计 via vue-query
  const { data: statisticsData } = useProjectStatistics(
    computed(() => projectId.value || undefined)
  )
  const statistics = computed(() => statisticsData.value ?? {})

  // 顶部卡片数值派生自项目统计
  const totalEpisodes = computed(() => statistics.value.storyboardCount ?? 0)
  const totalShots = computed(() => statistics.value.completedStoryboardCount ?? 0)
  const totalMembers = computed(() => statistics.value.memberCount ?? 0)
  const totalDuration = computed(() => statistics.value.totalVideoDuration ?? 0)

  const storyboardProgress = ref(0)
  const firstFrameProgress = ref(0)
  const videoProgress = ref(0)
  const overallProgress = ref(0)

  const progressColors = {
    primary: 'var(--el-color-primary)',
    success: 'var(--el-color-success)',
    warning: 'var(--el-color-warning)',
    danger: 'var(--el-color-danger)'
  }

  // Resource consumption state
  const aiComputeCost = ref(0)
  const storageUsedGB = ref(0)
  // 此值来自团队配额，暂为占位值
  const storageTotalGB = ref(500)
  const tokenConsumption = ref(0)
  const storagePercentage = ref(0)

  // Storyboard stats table data
  const storyboardTableData = ref<
    {
      label: string
      count: number
      color: string
    }[]
  >([])

  // Video stats table data
  const videoTableData = ref<
    {
      label: string
      count: number
      color: string
    }[]
  >([])

  const loadOtherStatistics = async () => {
    if (!projectId.value) {
      logger.warn('ProjectStatistics', 'loadOtherStatistics', '缺少项目ID，无法加载统计数据')
      return
    }

    try {
      // 并行加载非项目模块的统计数据
      const [storyboardStatsRes, videoStatsRes, resourcesRes, aiUsageRes] =
        await Promise.allSettled([
          fetchGetProjectStoryboardStats(projectId.value),
          fetchGetProjectVideoStats(projectId.value),
          fetchGetProjectResources(projectId.value),
          fetchGetProjectAiUsage(projectId.value)
        ])

      // 分镜统计（进度 + 表格）
      if (storyboardStatsRes.status === 'fulfilled' && storyboardStatsRes.value) {
        const data = storyboardStatsRes.value
        const total = data.totalStoryboards
        const completed = data.completedStoryboards
        const inProgress = data.inProgressStoryboards

        storyboardProgress.value = total > 0 ? Math.round((completed / total) * 100) : 0

        storyboardTableData.value = [
          { label: '总分镜数', count: total, color: 'var(--el-color-primary)' },
          { label: '已完成', count: completed, color: 'var(--el-color-success)' },
          { label: '进行中', count: inProgress, color: 'var(--el-color-warning)' }
        ]
      }

      // 视频统计（进度 + 表格）
      if (videoStatsRes.status === 'fulfilled' && videoStatsRes.value) {
        const data = videoStatsRes.value
        const total = data.totalVideos
        const completed = data.completedVideos
        const failed = data.failedVideos

        videoProgress.value = total > 0 ? Math.round((completed / total) * 100) : 0

        videoTableData.value = [
          { label: '总视频数', count: total, color: 'var(--el-color-primary)' },
          { label: '已完成', count: completed, color: 'var(--el-color-success)' },
          { label: '失败', count: failed, color: 'var(--el-color-danger)' }
        ]
      }

      // 首帧图完成率为分镜和视频完成率的平均值（派生指标）
      firstFrameProgress.value = Math.round((storyboardProgress.value + videoProgress.value) / 2)

      // 整体完成率为三项平均值
      overallProgress.value = Math.round(
        (storyboardProgress.value + firstFrameProgress.value + videoProgress.value) / 3
      )

      // 资源消耗
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value) {
        const data = resourcesRes.value
        const storageBytes = data.storageUsed
        storageUsedGB.value = Math.round((storageBytes / (1024 * 1024 * 1024)) * 10) / 10
        storageTotalGB.value = 500
        storagePercentage.value =
          storageTotalGB.value > 0
            ? Math.round((storageUsedGB.value / storageTotalGB.value) * 100 * 10) / 10
            : 0
        aiComputeCost.value = data.computeUsed
      }

      // AI 使用量（Token 消耗）
      if (aiUsageRes.status === 'fulfilled' && aiUsageRes.value) {
        const data = aiUsageRes.value
        tokenConsumption.value = data.totalTokens
        if (data.totalCost) {
          aiComputeCost.value = data.totalCost
        }
      }
    } catch (error) {
      logger.error('ProjectStatistics', 'loadOtherStatistics', '加载统计数据失败', error)
    }
  }

  const formatTokenCount = (count: number): string => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1)}M`
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1)}K`
    }
    return String(count)
  }

  onMounted(() => {
    loadOtherStatistics()
  })
</script>

<style lang="scss" scoped>
  .project-statistics-page {
    .stat-card {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .stat-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        border-radius: 12px;

        &.primary {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.success {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
        }

        &.warning {
          color: var(--el-color-warning);
          background: var(--el-color-warning-light-9);
        }

        &.danger {
          color: var(--el-color-danger);
          background: var(--el-color-danger-light-9);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          margin-top: 2px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .progress-section {
      .progress-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .resource-section {
      .resource-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin-right: 12px;
        font-size: 20px;
        border-radius: 10px;

        &.primary {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.success {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
        }

        &.warning {
          color: var(--el-color-warning);
          background: var(--el-color-warning-light-9);
        }
      }
    }
  }
</style>
