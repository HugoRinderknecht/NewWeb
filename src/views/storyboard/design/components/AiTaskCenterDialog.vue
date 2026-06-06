<template>
  <ElDialog
    v-model="visible"
    title="AI 任务中心"
    width="880px"
    align-center
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="ai-task-toolbar">
      <ElTabs v-model="activeTab" class="ai-tabs">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="分镜拆解" name="storyboard_decompose" />
        <ElTabPane label="分镜重建" name="storyboard_rebuild" />
        <ElTabPane label="图片生成" name="image_generation" />
        <ElTabPane label="视频生成" name="video_generation" />
      </ElTabs>
      <ElSpace>
        <ElSelect v-model="statusFilter" placeholder="状态" clearable style="width: 120px">
          <ElOption label="排队中" value="submitted" />
          <ElOption label="处理中" value="processing" />
          <ElOption label="已完成" value="completed" />
          <ElOption label="失败" value="failed" />
        </ElSelect>
        <ElButton @click="onRefresh">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />刷新
        </ElButton>
      </ElSpace>
    </div>

    <div v-if="loading" class="py-6">
      <ElSkeleton :rows="5" animated />
    </div>
    <ElEmpty v-else-if="!filteredTasks.length" description="暂无任务" />
    <ElTable v-else :data="filteredTasks" size="small" border>
      <ElTableColumn label="任务" min-width="160">
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
          <ElTag size="small" :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn label="进度" width="200">
        <template #default="scope">
          <ElProgress
            :percentage="Number(scope.row.progress || 0)"
            :status="scope.row.status === 'failed' ? 'exception' : (scope.row.status === 'completed' ? 'success' : undefined)"
            :stroke-width="10"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn label="消耗" width="100" align="center">
        <template #default="scope">
          <span v-if="scope.row.cost">{{ scope.row.cost }} 积分</span>
          <span v-else class="text-g-400">-</span>
        </template>
      </ElTableColumn>
      <ElTableColumn label="时间" width="160">
        <template #default="scope">
          <div class="text-xs">
            <div>开始：{{ formatTime(scope.row.startTime || scope.row.createTime) }}</div>
            <div v-if="scope.row.endTime">结束：{{ formatTime(scope.row.endTime) }}</div>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="100" fixed="right">
        <template #default="scope">
          <ElButton
            v-if="scope.row.status === 'completed' && scope.row.businessId"
            link
            type="primary"
            size="small"
            @click="goBusiness(scope.row)"
          >
            跳转
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <template #footer>
      <ElButton @click="handleClose">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useStoryboardStore } from '@/store/modules/storyboard'
  import { useAiProcessHistory } from '@/api/queries/ai-process'

  const storyboardStore = useStoryboardStore()
  const router = useRouter()
  const { aiTaskCenterOpen } = storeToRefs(storyboardStore)

  const visible = computed({
    get: () => aiTaskCenterOpen.value,
    set: (v) => {
      if (!v) storyboardStore.closeAiTaskCenter()
    }
  })

  const activeTab = ref('all')
  const statusFilter = ref<string>('')

  // 取当前项目作为业务上下文（与后端约定：项目级聚合时 businessId = projectId）
  const { activeProjectId } = storeToRefs(storyboardStore)

  const params = computed(() => {
    const projectId = activeProjectId.value
    if (!projectId) return undefined
    return {
      projectId,
      type: activeTab.value === 'all' ? 'all' : activeTab.value,
      businessId: projectId,
      status: statusFilter.value || undefined
    }
  })

  const { data: historyData, isLoading: loading, refetch } = useAiProcessHistory(params)

  const tasks = computed<any[]>(() => {
    const raw = historyData.value as any
    if (!raw) return []
    return Array.isArray(raw) ? raw : raw.records || []
  })

  const filteredTasks = computed(() => tasks.value)

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
    return row.businessTitle || row.name || row.description || row.taskName || TYPE_LABEL[row.type]?.label || 'AI 任务'
  }
  function typeLabel(t: string) { return TYPE_LABEL[t]?.label || t || '未知' }
  function typeTagType(t: string) { return (TYPE_LABEL[t]?.type || 'info') as any }
  function statusLabel(s: string) { return STATUS_META[s]?.label || s || '未知' }
  function statusTagType(s: string) { return (STATUS_META[s]?.type || 'info') as any }

  function formatTime(t: any) {
    if (!t) return '-'
    if (typeof t === 'number') return new Date(t).toLocaleString('zh-CN')
    return String(t)
  }

  function goBusiness(row: any) {
    const type = row.type || row.taskType
    if (type?.startsWith('storyboard_')) {
      storyboardStore.closeAiTaskCenter()
      router.push({ name: 'StoryboardDesign' })
    } else if (type === 'image_generation') {
      storyboardStore.closeAiTaskCenter()
      router.push({ name: 'GptImageTasks' }).catch(() => router.push({ name: 'GptImageGenerate' }))
    } else if (type === 'video_generation') {
      storyboardStore.closeAiTaskCenter()
      router.push({ name: 'VideoTask' }).catch(() => router.push({ name: 'VideoGen' }))
    }
  }

  function handleClose() {
    storyboardStore.closeAiTaskCenter()
  }

  function onRefresh() {
    refetch()
  }

  watch(visible, (v) => {
    if (v) refetch()
  })
</script>

<style lang="scss" scoped>
  .ai-task-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .ai-tabs {
    flex: 1;
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }
  .task-cell {
    .task-title {
      font-weight: 500;
    }
    .task-id {
      font-size: 11px;
    }
  }
</style>
