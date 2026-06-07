import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 分镜模块共享 Store（SB1-SB8）
 * 维护视图模式、筛选、当前打开的详情、AI 任务等跨子模块共享状态。
 * 数据获取走 vue-query（src/api/queries），本 Store 只放 UI 状态。
 */
export type StoryboardViewMode = 'board' | 'list' | 'episode' | 'timeline'

export interface StoryboardFilters {
  keyword: string
  status: number | '' // 1 草稿 / 2 待审核 / 3 已通过 / 4 已驳回
  episodeId: string
  sceneId: string
  shotType: string // narrative/breath/climax/transition
  cameraAngle: string
  cameraMovement: string
}

const VIEW_MODE_KEY = 'sb_view_mode'
const FILTERS_KEY = 'sb_filters'

const defaultFilters = (): StoryboardFilters => ({
  keyword: '',
  status: '',
  episodeId: '',
  sceneId: '',
  shotType: '',
  cameraAngle: '',
  cameraMovement: ''
})

export const useStoryboardStore = defineStore('storyboard', () => {
  // ---------- UI 状态 ----------
  const viewMode = ref<StoryboardViewMode>(((localStorage.getItem(VIEW_MODE_KEY) as StoryboardViewMode) || 'board'))
  const filters = ref<StoryboardFilters>(loadFilters())
  const selectedIds = ref<string[]>([])
  const detailOpen = ref(false)
  const detailStoryboardId = ref<string | null>(null)
  const detailTab = ref<string>('info')
  const editorOpen = ref(false)
  const editorStoryboardId = ref<string | null>(null) // null 表示新建
  const aiDialogOpen = ref(false)
  const aiDialogType = ref<'decompose' | 'rebuild'>('decompose')
  const aiTaskCenterOpen = ref(false)
  const videoPanelOpen = ref(false)
  const videoStoryboardId = ref<string | null>(null)
  /**
   * 当前激活项目 ID
   *
   * ⚠️ 此字段由 design 页面在 mount 时同步过来，供 AI 弹窗等共用。
   * 推荐改用 useCurrentProjectId(useStoryboardProjectStore) 或 useCurrentContext() 获取，
   * 以遵循 Route > Vue Query > Pinia 的优先级策略。
   *
   * @deprecated 推荐使用 useCurrentContext().projectId 替代，避免手动同步
   */
  const activeProjectId = ref<string>('')

  // ---------- Getters ----------
  const hasSelection = computed(() => selectedIds.value.length > 0)
  const selectionCount = computed(() => selectedIds.value.length)
  const isEditing = computed(() => editorStoryboardId.value !== null)
  const isViewingDetail = computed(() => detailOpen.value && !!detailStoryboardId.value)

  // ---------- Actions ----------
  function setViewMode(mode: StoryboardViewMode) {
    viewMode.value = mode
    localStorage.setItem(VIEW_MODE_KEY, mode)
  }

  function setFilter<K extends keyof StoryboardFilters>(key: K, value: StoryboardFilters[K]) {
    filters.value[key] = value
    persistFilters()
  }

  function resetFilters() {
    filters.value = defaultFilters()
    persistFilters()
  }

  function setSelected(ids: string[]) {
    selectedIds.value = ids
  }

  function clearSelection() {
    selectedIds.value = []
  }

  function openDetail(storyboardId: string, tab: string = 'info') {
    detailStoryboardId.value = storyboardId
    detailTab.value = tab
    detailOpen.value = true
  }

  function closeDetail() {
    detailOpen.value = false
    detailStoryboardId.value = null
  }

  function setDetailTab(tab: string) {
    detailTab.value = tab
  }

  function openEditor(storyboardId: string | null = null) {
    editorStoryboardId.value = storyboardId
    editorOpen.value = true
  }

  function closeEditor() {
    editorOpen.value = false
    editorStoryboardId.value = null
  }

  function openAiDialog(type: 'decompose' | 'rebuild') {
    aiDialogType.value = type
    aiDialogOpen.value = true
  }

  function closeAiDialog() {
    aiDialogOpen.value = false
  }

  function openAiTaskCenter() {
    aiTaskCenterOpen.value = true
  }

  function closeAiTaskCenter() {
    aiTaskCenterOpen.value = false
  }

  function openVideoPanel(storyboardId: string) {
    videoStoryboardId.value = storyboardId
    videoPanelOpen.value = true
  }

  function closeVideoPanel() {
    videoPanelOpen.value = false
    videoStoryboardId.value = null
  }

  function setActiveProjectId(id: string) {
    activeProjectId.value = id || ''
  }

  function persistFilters() {
    localStorage.setItem(FILTERS_KEY, JSON.stringify(filters.value))
  }

  function loadFilters(): StoryboardFilters {
    try {
      const raw = localStorage.getItem(FILTERS_KEY)
      if (raw) return { ...defaultFilters(), ...JSON.parse(raw) }
    } catch {
      /* ignore */
    }
    return defaultFilters()
  }

  return {
    // state
    viewMode,
    filters,
    selectedIds,
    detailOpen,
    detailStoryboardId,
    detailTab,
    editorOpen,
    editorStoryboardId,
    aiDialogOpen,
    aiDialogType,
    aiTaskCenterOpen,
    videoPanelOpen,
    videoStoryboardId,
    activeProjectId,
    // getters
    hasSelection,
    selectionCount,
    isEditing,
    isViewingDetail,
    // actions
    setViewMode,
    setFilter,
    resetFilters,
    setSelected,
    clearSelection,
    openDetail,
    closeDetail,
    setDetailTab,
    openEditor,
    closeEditor,
    openAiDialog,
    closeAiDialog,
    openAiTaskCenter,
    closeAiTaskCenter,
    openVideoPanel,
    closeVideoPanel,
    setActiveProjectId
  }
})
