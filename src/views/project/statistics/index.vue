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
                <span>首帧图完成率</span>
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
                  <div class="text-xs text-g-400">本月累计</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">2,450</div>
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
                  <div class="font-medium">存储空间</div>
                  <div class="text-xs text-g-400">已使用 / 总计</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">128 / 500 GB</div>
                <ElProgress :percentage="25.6" :color="progressColors.success" :stroke-width="6" />
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
                  <div class="text-xs text-g-400">本月累计</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-medium">1.2M</div>
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
      <ElTable :data="episodeStats" style="width: 100%">
        <ElTableColumn label="集数" width="120">
          <template #default="scope">
            <ElTag size="small" type="primary">第{{ scope.row.episode }}集</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="name" label="名称" min-width="160" />
        <ElTableColumn prop="totalShots" label="总镜头" width="100" />
        <ElTableColumn prop="completedShots" label="已完成" width="100">
          <template #default="scope">
            <span class="text-success">{{ scope.row.completedShots }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="pendingShots" label="待完成" width="100">
          <template #default="scope">
            <span class="text-warning">{{ scope.row.pendingShots }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="进度" width="200">
          <template #default="scope">
            <ElProgress
              :percentage="scope.row.progress"
              :color="getProgressColor(scope.row.progress)"
              :stroke-width="8"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="duration" label="时长" width="100">
          <template #default="scope">
            <span class="text-g-400">{{ scope.row.duration }}s</span>
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
      <ElTable :data="videoStats" style="width: 100%">
        <ElTableColumn label="任务类型" min-width="160">
          <template #default="scope">
            <div class="flex-c">
              <div class="task-icon" :class="scope.row.type">
                <ArtSvgIcon :icon="taskIconMap[scope.row.type as TaskType]" />
              </div>
              <span class="font-medium">{{ scope.row.name }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="total" label="总任务" width="100" />
        <ElTableColumn prop="success" label="成功" width="100">
          <template #default="scope">
            <span class="text-success">{{ scope.row.success }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="failed" label="失败" width="100">
          <template #default="scope">
            <span class="text-danger">{{ scope.row.failed }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="pending" label="进行中" width="100">
          <template #default="scope">
            <span class="text-primary">{{ scope.row.pending }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="成功率" width="120">
          <template #default="scope">
            <ElTag :type="getSuccessRateType(scope.row.successRate)" size="small">
              {{ scope.row.successRate }}%
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="avgTime" label="平均耗时" width="120">
          <template #default="scope">
            <span class="text-g-400">{{ scope.row.avgTime }}min</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetProjectStatistics } from '@/api/project'

  defineOptions({ name: 'ProjectStatistics' })

  type TaskType = 'storyboard' | 'firstframe' | 'video' | 'dubbing'

  interface EpisodeStat {
    episode: number
    name: string
    totalShots: number
    completedShots: number
    pendingShots: number
    progress: number
    duration: number
  }

  interface VideoStat {
    type: TaskType
    name: string
    total: number
    success: number
    failed: number
    pending: number
    successRate: number
    avgTime: number
  }

  const route = useRoute()

  const totalEpisodes = ref(0)
  const totalShots = ref(0)
  const totalMembers = ref(0)
  const totalDuration = ref(0)

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

  const episodeStats = ref<EpisodeStat[]>([])

  const taskIconMap: Record<TaskType, string> = {
    storyboard: 'ri:layout-line',
    firstframe: 'ri:image-line',
    video: 'ri:video-line',
    dubbing: 'ri:mic-line'
  }

  const videoStats = ref<VideoStat[]>([])

  const loadStatistics = async () => {
    const projectId = (route.query.id as string) || (route.params.id as string) || '1'
    try {
      const res = await fetchGetProjectStatistics(projectId)
      if (res) {
        const data = res as any
        totalEpisodes.value = data.totalEpisodes || data.totalStoryboards || 0
        totalShots.value = data.totalShots || data.totalStoryboards || 0
        totalMembers.value = data.totalMembers || 0
        totalDuration.value = data.totalDuration || 0

        storyboardProgress.value =
          data.storyboardProgress ||
          Math.round(((data.completedStoryboards || 0) / (data.totalStoryboards || 1)) * 100)
        firstFrameProgress.value =
          data.firstFrameProgress ||
          Math.round(((data.completedEpisodes || 0) / (data.totalEpisodes || 1)) * 100)
        videoProgress.value =
          data.videoProgress ||
          Math.round(((data.completedScripts || 0) / (data.totalScripts || 1)) * 100)
        overallProgress.value =
          data.overallProgress ||
          Math.round(
            (storyboardProgress.value + firstFrameProgress.value + videoProgress.value) / 3
          )

        if (data.episodeStats && Array.isArray(data.episodeStats)) {
          episodeStats.value = data.episodeStats
        } else {
          episodeStats.value = generateEpisodeStats(data)
        }

        if (data.videoStats && Array.isArray(data.videoStats)) {
          videoStats.value = data.videoStats
        } else {
          videoStats.value = generateVideoStats()
        }
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
      episodeStats.value = generateEpisodeStats({})
      videoStats.value = generateVideoStats()
    }
  }

  const generateEpisodeStats = (data: any): EpisodeStat[] => {
    const totalEp = data.totalEpisodes || 6
    const completedEp = data.completedEpisodes || 2
    const stats: EpisodeStat[] = []
    const names = ['初遇九尾', '昆仑求药', '白泽指引', '幽都危机', '神兽之战', '归途']
    for (let i = 0; i < Math.min(totalEp, 6); i++) {
      const isCompleted = i < completedEp
      const totalShot = isCompleted
        ? 20 + Math.floor(Math.random() * 10)
        : 15 + Math.floor(Math.random() * 10)
      const completedShot = isCompleted ? totalShot : Math.floor(totalShot * 0.4)
      stats.push({
        episode: i + 1,
        name: names[i] || `第${i + 1}集`,
        totalShots: totalShot,
        completedShots: completedShot,
        pendingShots: totalShot - completedShot,
        progress: Math.round((completedShot / totalShot) * 100),
        duration: 80 + Math.floor(Math.random() * 50)
      })
    }
    return stats
  }

  const generateVideoStats = (): VideoStat[] => {
    return [
      {
        type: 'storyboard',
        name: '分镜生成',
        total: 186,
        success: 158,
        failed: 12,
        pending: 16,
        successRate: 92,
        avgTime: 3
      },
      {
        type: 'firstframe',
        name: '首帧图生成',
        total: 158,
        success: 98,
        failed: 8,
        pending: 52,
        successRate: 92,
        avgTime: 8
      },
      {
        type: 'video',
        name: '视频生成',
        total: 98,
        success: 38,
        failed: 5,
        pending: 55,
        successRate: 88,
        avgTime: 25
      },
      {
        type: 'dubbing',
        name: '配音生成',
        total: 45,
        success: 30,
        failed: 2,
        pending: 13,
        successRate: 94,
        avgTime: 5
      }
    ]
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return progressColors.success
    if (progress >= 50) return progressColors.primary
    if (progress >= 20) return progressColors.warning
    return progressColors.danger
  }

  const getSuccessRateType = (rate: number): 'success' | 'primary' | 'warning' | 'danger' => {
    if (rate >= 90) return 'success'
    if (rate >= 70) return 'primary'
    if (rate >= 50) return 'warning'
    return 'danger'
  }

  onMounted(() => {
    loadStatistics()
  })
</script>

<style lang="scss" scoped>
  .project-statistics-page {
    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

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

        &.warning {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }

        &.danger {
          background: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
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
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        flex-shrink: 0;
        margin-right: 12px;

        &.primary {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        &.success {
          background: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        &.warning {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }
      }
    }

    .task-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      margin-right: 10px;
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }
</style>
