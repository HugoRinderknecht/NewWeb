<template>
  <div class="storyboard-main art-full-height" v-loading="isLoading">
    <ElAlert
      v-if="hasError"
      type="error"
      :title="errorMessage"
      show-icon
      :closable="false"
      class="mb-4"
    />

    <ElCard class="storyboard-card">
      <!-- 顶部工具栏 -->
      <template #header>
        <div class="storyboard-header">
          <div class="flex items-center gap-3">
            <span class="text-lg font-medium">分镜设计</span>
            <ElTag v-if="projectName" type="info" size="small">{{ projectName }}</ElTag>
            <ElTag size="small" type="success">共 {{ total }} 个分镜</ElTag>
            <ElTag v-if="totalDuration" size="small" type="info">总时长 {{ totalDuration }}s</ElTag>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectOptions"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
          </div>
          <ElSpace>
            <ElButton @click="storyboardStore.openAiTaskCenter()">
              <ArtSvgIcon icon="ri:magic-line" class="mr-1" />AI 任务中心
            </ElButton>
            <ElButton @click="storyboardStore.openAiDialog('decompose')">
              <ArtSvgIcon icon="ri:git-branch-line" class="mr-1" />AI 拆解
            </ElButton>
            <ElButton @click="storyboardStore.openAiDialog('rebuild')">
              <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />AI 重建
            </ElButton>
            <ElButton type="primary" @click="storyboardStore.openEditor()">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />新建分镜
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 视图切换 + 筛选 -->
      <div class="storyboard-toolbar">
        <ElRadioGroup
          :model-value="storyboardStore.viewMode"
          @update:model-value="(v) => storyboardStore.setViewMode(v as any)"
        >
          <ElRadioButton value="board">
            <ArtSvgIcon icon="ri:layout-grid-line" class="mr-1" />故事板
          </ElRadioButton>
          <ElRadioButton value="episode">
            <ArtSvgIcon icon="ri:film-line" class="mr-1" />分集视图
          </ElRadioButton>
          <ElRadioButton value="list">
            <ArtSvgIcon icon="ri:list-unordered" class="mr-1" />列表
          </ElRadioButton>
          <ElRadioButton value="timeline">
            <ArtSvgIcon icon="ri:time-line" class="mr-1" />时间线
          </ElRadioButton>
        </ElRadioGroup>

        <StoryboardFilters
          :filters="storyboardStore.filters"
          @update:filters="(v) => Object.assign(storyboardStore.filters, v)"
          @change="onFilterChange"
          @reset="storyboardStore.resetFilters()"
        />

        <ElSpace v-if="storyboardStore.hasSelection">
          <ElTag type="primary">已选 {{ storyboardStore.selectionCount }} 个</ElTag>
          <ElButton size="small" @click="storyboardStore.clearSelection()">清空</ElButton>
          <ElButton size="small" type="warning" @click="handleBatchSubmit">批量提交审核</ElButton>
          <ElButton size="small" type="danger" @click="handleBatchDelete">批量删除</ElButton>
        </ElSpace>
      </div>

      <!-- 视图内容 -->
      <div class="storyboard-viewport">
        <StoryboardBoard
          v-if="storyboardStore.viewMode === 'board'"
          :items="list"
          :selected-ids="storyboardStore.selectedIds"
          :active-id="storyboardStore.detailStoryboardId"
          :loading="isLoading"
          group-by="episode"
          :selectable="true"
          @select="(it) => onCardClick(it)"
          @open="(it) => onCardDblClick(it)"
          @toggle="onToggle"
        />

        <StoryboardBoard
          v-else-if="storyboardStore.viewMode === 'episode'"
          :items="list"
          :selected-ids="storyboardStore.selectedIds"
          :active-id="storyboardStore.detailStoryboardId"
          :loading="isLoading"
          group-by="status"
          :selectable="true"
          @select="(it) => onCardClick(it)"
          @open="(it) => onCardDblClick(it)"
          @toggle="onToggle"
        />

        <StoryboardListView
          v-else-if="storyboardStore.viewMode === 'list'"
          :items="list"
          :total="total"
          :loading="isLoading"
          :pagination="{ current: pagination.current, size: pagination.size }"
          selectable
          @open="(it) => storyboardStore.openDetail(it.id)"
          @edit="(it) => storyboardStore.openEditor(it.id)"
          @delete="handleDelete"
          @selection="(rows) => storyboardStore.setSelected(rows.map((r) => r.id))"
          @page-change="onPageChange"
        />

        <StoryboardTimeline
          v-else-if="storyboardStore.viewMode === 'timeline'"
          :items="list"
          @open="(it) => storyboardStore.openDetail(it.id)"
        />
      </div>

      <!-- 状态栏 -->
      <div class="storyboard-statusbar">
        <ElSpace>
          <ElTag size="small" type="info">草稿 {{ statusCount.draft }}</ElTag>
          <ElTag size="small" type="warning">待审核 {{ statusCount.pending }}</ElTag>
          <ElTag size="small" type="success">已通过 {{ statusCount.approved }}</ElTag>
          <ElTag size="small" type="danger">已驳回 {{ statusCount.rejected }}</ElTag>
        </ElSpace>
        <div class="text-g-400 text-xs">
          双击卡片查看详情 · 拖拽故事板可重排序（v1 暂以列表操作重排） · 数据每 30s 刷新
        </div>
      </div>
    </ElCard>

    <!-- 详情抽屉 -->
    <ShotDetailDrawer />

    <!-- 编辑弹窗 -->
    <ShotEditorDialog />

    <!-- AI 拆解/重建弹窗 -->
    <ShotAiDialog />

    <!-- AI 任务中心 -->
    <AiTaskCenterDialog />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { useRoute, useRouter } from 'vue-router'
  import { logger } from '@/utils/logger'
  import { useProjectStore } from '@/store/modules/project'
  import { useStoryboardStore } from '@/store/modules/storyboard'
  import {
    useStoryboardList,
    useBatchSubmitStoryboardReview,
    useBatchDeleteStoryboards
  } from '@/api/queries/storyboard'
  import { useProjectDetail, useProjectList } from '@/api/queries/project'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'
  import StoryboardFilters from './components/StoryboardFilters.vue'
  import StoryboardBoard from './components/StoryboardBoard.vue'
  import StoryboardListView from './components/StoryboardListView.vue'
  import StoryboardTimeline from './components/StoryboardTimeline.vue'
  import ShotDetailDrawer from './components/ShotDetailDrawer.vue'
  import ShotEditorDialog from './components/ShotEditorDialog.vue'
  import ShotAiDialog from './components/ShotAiDialog.vue'
  import AiTaskCenterDialog from './components/AiTaskCenterDialog.vue'

  defineOptions({ name: 'StoryboardDesign' })

  const route = useRoute()
  const router = useRouter()
  const projectStore = useProjectStore()
  const storyboardStore = useStoryboardStore()

  const projectId = computed(() => {
    const fromRoute = (route.params.projectId as string) || (route.query.projectId as string)
    return fromRoute || projectStore.currentProjectId || ''
  })

  // 同步当前项目到分镜 store，供 AI 弹窗等共用
  watch(
    projectId,
    (id) => {
      storyboardStore.setActiveProjectId(id || '')
    },
    { immediate: true }
  )

  const { data: projectDetail } = useProjectDetail(projectId)
  const projectName = computed(() => projectDetail.value?.projectName || '')

  // 项目下拉：列表 + 当前项目
  const { data: projectListResult } = useProjectList(() => undefined)
  const projectOptions = computed<{ id: string; name: string }[]>(() => {
    const data = projectListResult.value as any
    if (!data) return []
    const list = Array.isArray(data) ? data : data.records || []
    return list.map((p: any) => ({ id: String(p.id), name: p.name || p.projectName || '' }))
  })
  const currentProjectId = computed<string>({
    get: () => projectId.value,
    set: (val) => {
      if (val && val !== projectStore.currentProjectId) {
        projectStore.setCurrentProject(val)
      }
    }
  })

  function handleProjectChange() {
    pagination.current = 1
    storyboardStore.clearSelection()
    refetch()
  }

  function handleProjectRefresh() {
    refetch()
  }

  const pagination = reactive({ current: 1, size: 50, total: 0 })

  const searchParams = computed<Api.Storyboard.StoryboardSearchParams>(() => {
    const f = storyboardStore.filters
    return {
      page: pagination.current,
      pageSize: pagination.size,
      keyword: f.keyword || undefined,
      status: typeof f.status === 'number' ? f.status : undefined,
      episodeId: f.episodeId || undefined,
      sceneId: f.sceneId || undefined
    }
  })

  const { data: listResult, isLoading, error, refetch } = useStoryboardList(projectId, searchParams)

  // 后端返回 3001「项目不存在」时，清空 store 中 stale 的 currentProjectId，
  // 避免每次跳转都重发 3001 请求（sessionStorage 持久化的过期 ID 场景）
  watch(error, (err) => {
    const code = (err as any)?.code
    if (code === 3001 && projectStore.currentProjectId) {
      projectStore.clearCurrentProject()
    }
  })

  const list = computed<any[]>(() => {
    const data = listResult.value as any
    if (!data) return []
    if (Array.isArray(data)) return data
    return data.records || []
  })

  const total = computed(() => {
    const data = listResult.value as any
    if (!data) return 0
    if (typeof data.total === 'number') return data.total
    return list.value.length
  })

  watch(listResult, (val) => {
    if (val && typeof (val as any).total === 'number') {
      pagination.total = (val as any).total
    }
  })

  const totalDuration = computed(() => list.value.reduce((s, i) => s + (i.durationSeconds || 0), 0))

  const statusCount = computed(() => {
    const res = { draft: 0, pending: 0, approved: 0, rejected: 0 }
    list.value.forEach((i: any) => {
      const s = Number(i.status || 1)
      if (s === 1) res.draft++
      else if (s === 2) res.pending++
      else if (s === 3) res.approved++
      else if (s === 4) res.rejected++
    })
    return res
  })

  const hasError = computed(() => !!error.value)
  const errorMessage = computed(() => {
    if (!error.value) return ''
    return (error.value as Error)?.message || '加载分镜列表失败，请稍后重试'
  })

  function onFilterChange() {
    pagination.current = 1
  }

  function onPageChange({ current, size }: { current: number; size: number }) {
    pagination.current = current
    pagination.size = size
  }

  function onCardClick(item: any) {
    storyboardStore.openDetail(item.id)
  }
  function onCardDblClick(item: any) {
    storyboardStore.openDetail(item.id)
  }
  function onToggle({ id, selected }: { id: string; selected: boolean }) {
    const set = new Set(storyboardStore.selectedIds)
    if (selected) set.add(id)
    else set.delete(id)
    storyboardStore.setSelected(Array.from(set))
  }

  const batchSubmitMutate = useBatchSubmitStoryboardReview()
  const batchDeleteMutate = useBatchDeleteStoryboards()

  async function handleBatchSubmit() {
    const ids = storyboardStore.selectedIds
    if (!ids.length) return
    try {
      await ElMessageBox.confirm(`确定将选中的 ${ids.length} 个分镜提交审核吗？`, '批量提交', {
        type: 'warning'
      })
    } catch {
      return
    }
    try {
      await batchSubmitMutate.mutateAsync({ storyboardIds: ids, projectId: projectId.value })
      ElMessage.success('已提交审核')
      storyboardStore.clearSelection()
      refetch()
    } catch {
      ElMessage.error('提交失败')
    }
  }

  async function handleBatchDelete() {
    const ids = storyboardStore.selectedIds
    if (!ids.length) return
    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${ids.length} 个分镜吗？此操作不可恢复`,
        '批量删除',
        { type: 'error' }
      )
    } catch {
      return
    }
    try {
      await batchDeleteMutate.mutateAsync({ storyboardIds: ids, projectId: projectId.value })
      ElMessage.success('已删除')
      storyboardStore.clearSelection()
      refetch()
    } catch {
      ElMessage.error('删除失败')
    }
  }

  async function handleDelete(item: any) {
    try {
      await ElMessageBox.confirm(`确定删除分镜「${item.title}」吗？`, '删除确认', {
        type: 'warning'
      })
    } catch {
      return
    }
    try {
      const { useDeleteStoryboard } = await import('@/api/queries/storyboard')
      const mutate = useDeleteStoryboard()
      await mutate.mutateAsync({ storyboardId: item.id, projectId: projectId.value })
      ElMessage.success('已删除')
      refetch()
    } catch (err) {
      logger.apiError('Storyboard', 'delete', err)
      ElMessage.error('删除失败')
    }
  }
</script>

<style lang="scss" scoped>
  .storyboard-main {
    .storyboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .storyboard-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }
    .storyboard-viewport {
      min-height: 400px;
    }
    .storyboard-statusbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
</style>
