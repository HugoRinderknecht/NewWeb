<template>
  <div class="storyboard-ai-page art-full-height" v-loading="loading">
    <ElCard>
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-3">
            <ArtSvgIcon icon="ri:magic-line" class="text-2xl text-primary" />
            <span class="text-lg font-medium">AI 分镜工作台</span>
            <ElTag type="info" size="small">统一调度拆解 / 重建 / 配图 / 视频化</ElTag>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectOptions"
              @change="refetchActive"
              @refresh="refetchActive"
            />
          </div>
          <ElSpace>
            <ElButton @click="storyboardStore.openAiDialog('decompose')">
              <ArtSvgIcon icon="ri:git-branch-line" class="mr-1" />新建拆解
            </ElButton>
            <ElButton type="primary" @click="storyboardStore.openAiDialog('rebuild')">
              <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />新建重建
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="16">
        <ElCol :span="14">
          <ElCard shadow="never" class="task-card">
            <template #header>
              <div class="flex-cb">
                <span class="font-medium">运行中任务</span>
                <ElButton link type="primary" @click="refetchActive">
                  <ArtSvgIcon icon="ri:refresh-line" />
                </ElButton>
              </div>
            </template>
            <ElEmpty v-if="!activeTasks.length" description="暂无运行中任务" :image-size="80" />
            <div v-else class="active-list">
              <div v-for="t in activeTasks" :key="t.id" class="active-item">
                <div class="active-info">
                  <ElTag :type="typeTagType(t.type || t.taskType)" size="small">
                    {{ typeLabel(t.type || t.taskType) }}
                  </ElTag>
                  <span class="active-title">{{ taskTitle(t) }}</span>
                </div>
                <ElProgress
                  :percentage="Number(t.progress || 0)"
                  :status="
                    t.status === 'failed'
                      ? 'exception'
                      : t.status === 'completed'
                        ? 'success'
                        : undefined
                  "
                  :stroke-width="8"
                />
                <div class="active-time text-xs text-g-500">
                  开始：{{ formatTime(t.startTime || t.createTime) }}
                </div>
              </div>
            </div>
          </ElCard>
        </ElCol>

        <ElCol :span="10">
          <ElCard shadow="never" class="task-card">
            <template #header>
              <div class="flex-cb">
                <span class="font-medium">最近完成</span>
              </div>
            </template>
            <ElEmpty v-if="!completedTasks.length" description="暂无完成任务" :image-size="80" />
            <ElTimeline v-else>
              <ElTimelineItem
                v-for="t in completedTasks"
                :key="t.id"
                :type="t.status === 'failed' ? 'danger' : 'success'"
                :timestamp="formatTime(t.endTime || t.updateTime)"
              >
                <div class="completed-item">
                  <ElTag :type="typeTagType(t.type || t.taskType)" size="small">
                    {{ typeLabel(t.type || t.taskType) }}
                  </ElTag>
                  <span>{{ taskTitle(t) }}</span>
                </div>
              </ElTimelineItem>
            </ElTimeline>
          </ElCard>
        </ElCol>
      </ElRow>

      <ElDivider />

      <ElCard shadow="never" class="task-card">
        <template #header>
          <span class="font-medium">历史任务</span>
        </template>
        <ElEmpty v-if="!historyList.length" description="暂无历史任务" :image-size="60" />
        <ElTable v-else :data="historyList" size="small" border>
          <ElTableColumn label="任务" min-width="200">
            <template #default="scope">
              <div class="task-cell">
                <div class="task-title">{{ taskTitle(scope.row) }}</div>
                <div class="task-id text-g-400">#{{ scope.row.id }}</div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="120">
            <template #default="scope">
              <ElTag size="small" :type="typeTagType(scope.row.type || scope.row.taskType)">
                {{ typeLabel(scope.row.type || scope.row.taskType) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag size="small" :type="statusTagType(scope.row.status)">{{
                statusLabel(scope.row.status)
              }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="积分" width="100" align="center">
            <template #default="scope">
              <span v-if="scope.row.cost">{{ scope.row.cost }}</span>
              <span v-else class="text-g-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="时间" width="160">
            <template #default="scope">
              <div class="text-xs">{{ formatTime(scope.row.createTime) }}</div>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </ElCard>

    <ShotAiDialog />
    <AiTaskCenterDialog />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAiProcessHistory, useAiProcessStatus } from '@/api/queries/ai-process'
  import { useProjectList } from '@/api/queries/project'
  import { useStoryboardProjectStore } from '@/store/modules/storyboard-project'
  import { useStoryboardStore } from '@/store/modules/storyboard'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'
  import ShotAiDialog from '../design/components/ShotAiDialog.vue'
  import AiTaskCenterDialog from '../design/components/AiTaskCenterDialog.vue'

  defineOptions({ name: 'StoryboardAiWorkbench' })

  const storyboardStore = useStoryboardStore()
  const storyboardProjectStore = useStoryboardProjectStore()
  const { activeProjectId } = storeToRefs(storyboardStore)

  // 同步分镜域 projectId -> storyboardStore.activeProjectId（供本页其它逻辑共用）
  watch(
    () => storyboardProjectStore.currentProjectId,
    (id) => {
      storyboardStore.setActiveProjectId(id || '')
    },
    { immediate: true }
  )

  // 项目下拉：列表 + 当前项目
  const { data: projectListResult } = useProjectList(() => undefined)
  const projectOptions = computed<{ id: string; name: string }[]>(() => {
    const data = projectListResult.value as any
    if (!data) return []
    const list = Array.isArray(data) ? data : data.records || []
    return list.map((p: any) => ({ id: String(p.id), name: p.name || p.projectName || '' }))
  })
  const currentProjectId = computed<string>({
    get: () => storyboardProjectStore.currentProjectId,
    set: (val) => {
      if (val && val !== storyboardProjectStore.currentProjectId) {
        storyboardProjectStore.setCurrentProject(val)
      }
    }
  })

  // 任务历史：按当前项目聚合；项目级查询时 businessId = projectId，type=all 表示全部类型
  const historyParams = computed(() => {
    const pid = activeProjectId.value
    if (!pid) return undefined
    return { projectId: pid, type: 'all', businessId: pid }
  })
  const {
    data: historyData,
    refetch: refetchHistory,
    isLoading: historyLoading
  } = useAiProcessHistory(historyParams)
  const {
    data: statusData,
    refetch: refetchStatus,
    isLoading: statusLoading
  } = useAiProcessStatus(() => ({}))
  const loading = computed(() => historyLoading.value || statusLoading.value)

  const historyList = computed<any[]>(() => {
    const raw = historyData.value as any
    if (!raw) return []
    return Array.isArray(raw) ? raw : raw.records || []
  })

  const activeTasks = computed<any[]>(() => {
    const raw = statusData.value as any
    if (!raw) return []
    if (Array.isArray(raw)) return raw.filter((t) => ['submitted', 'processing'].includes(t.status))
    return (raw.records || []).filter((t: any) => ['submitted', 'processing'].includes(t.status))
  })

  const completedTasks = computed<any[]>(() =>
    historyList.value.filter((t) => t.status === 'completed' || t.status === 'failed').slice(0, 10)
  )

  function refetchActive() {
    refetchHistory()
    refetchStatus()
  }

  const TYPE_LABEL: Record<string, { label: string; type: string }> = {
    storyboard_decompose: { label: '分镜拆解', type: 'primary' },
    storyboard_rebuild: { label: '分镜重建', type: 'warning' },
    image_generation: { label: '图片生成', type: 'success' },
    video_generation: { label: '视频生成', type: 'danger' }
  }
  const STATUS_META: Record<string, { label: string; type: string }> = {
    submitted: { label: '排队中', type: 'info' },
    processing: { label: '处理中', type: 'warning' },
    completed: { label: '已完成', type: 'success' },
    failed: { label: '失败', type: 'danger' }
  }
  function taskTitle(row: any) {
    return (
      row.businessTitle ||
      row.name ||
      row.description ||
      row.taskName ||
      TYPE_LABEL[row.type]?.label ||
      'AI 任务'
    )
  }
  function typeLabel(t: string) {
    return TYPE_LABEL[t]?.label || t || '未知'
  }
  function typeTagType(t: string): any {
    return TYPE_LABEL[t]?.type || 'info'
  }
  function statusLabel(s: string) {
    return STATUS_META[s]?.label || s || '未知'
  }
  function statusTagType(s: string): any {
    return STATUS_META[s]?.type || 'info'
  }

  function formatTime(t: any) {
    if (!t) return '-'
    if (typeof t === 'number') return new Date(t).toLocaleString('zh-CN')
    return String(t)
  }
</script>

<style lang="scss" scoped>
  .storyboard-ai-page {
    .task-card {
      margin-bottom: 12px;
    }
    .active-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .active-item {
      padding: 12px;
      background: var(--el-fill-color-lighter);
      border-radius: 6px;
      .active-info {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;
        .active-title {
          font-size: 13px;
          font-weight: 500;
        }
      }
      .active-time {
        margin-top: 4px;
      }
    }
    .completed-item {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .task-cell {
      .task-title {
        font-weight: 500;
      }
      .task-id {
        font-size: 11px;
      }
    }
  }
</style>
