<template>
  <div class="storyboard-preview-page art-full-height" v-loading="isLoading">
    <ElAlert
      v-if="hasError"
      type="error"
      :title="errorMessage"
      show-icon
      :closable="false"
      class="mb-4"
    />
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">分镜预览</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectOptions"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElSelect v-model="currentStoryboard" placeholder="选择分镜" style="width: 220px">
              <ElOption
                v-for="sb in storyboardOptions"
                :key="sb.id"
                :label="`${sb.code} ${sb.name}`"
                :value="sb.id"
              />
            </ElSelect>
          </div>
          <ElSpace>
            <ElRadioGroup v-model="viewMode">
              <ElRadioButton value="storyboard">
                <ArtSvgIcon icon="ri:layout-grid-line" class="mr-1" />
                故事板
              </ElRadioButton>
              <ElRadioButton value="slideshow">
                <ArtSvgIcon icon="ri:slideshow-line" class="mr-1" />
                幻灯片
              </ElRadioButton>
              <ElRadioButton value="timeline">
                <ArtSvgIcon icon="ri:video-line" class="mr-1" />
                时间线
              </ElRadioButton>
            </ElRadioGroup>
            <ElDropdown @command="handleExport">
              <ElButton type="primary">
                <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                导出
                <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-1" />
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="image">
                    <ArtSvgIcon icon="ri:image-line" class="mr-1" />
                    导出为图片
                  </ElDropdownItem>
                  <ElDropdownItem command="pdf">
                    <ArtSvgIcon icon="ri:file-pdf-line" class="mr-1" />
                    导出为PDF
                  </ElDropdownItem>
                  <ElDropdownItem command="video">
                    <ArtSvgIcon icon="ri:movie-line" class="mr-1" />
                    导出为视频
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </ElSpace>
        </div>
      </template>

      <!-- 故事板模式 -->
      <div v-if="viewMode === 'storyboard'" class="storyboard-grid">
        <ElCard
          v-for="(shot, index) in filteredShotList"
          :key="shot.id"
          class="storyboard-card"
          shadow="hover"
        >
          <div class="storyboard-image">
            <ElImage v-if="shot.thumbnail" :src="shot.thumbnail" fit="cover" class="shot-image" />
            <div v-else class="shot-placeholder flex-cc">
              <ArtSvgIcon icon="ri:movie-line" class="text-4xl text-g-400" />
            </div>
            <div class="shot-overlay">
              <span class="shot-index">{{ index + 1 }}</span>
              <span class="shot-duration">{{ shot.duration }}s</span>
            </div>
          </div>
          <div class="storyboard-info">
            <div class="flex-cb mb-2">
              <span class="shot-name font-medium">{{ shot.name }}</span>
              <ElTag :type="shotTypeTagMap[shot.type]" size="small">
                {{ shotTypeLabelMap[shot.type] }}
              </ElTag>
            </div>
            <p class="shot-desc">{{ shot.description }}</p>
            <div class="shot-meta">
              <ElSpace>
                <span class="text-xs text-g-400">
                  <ArtSvgIcon icon="ri:exchange-line" class="mr-1" />
                  {{ transitionLabelMap[shot.transition] }}
                </span>
                <span class="text-xs text-g-400">
                  <ArtSvgIcon icon="ri:focus-3-line" class="mr-1" />
                  {{ shot.focalLength }}mm
                </span>
              </ElSpace>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 幻灯片模式 -->
      <div v-else-if="viewMode === 'slideshow'" class="slideshow-view">
        <div class="slideshow-container">
          <div class="slideshow-main">
            <div class="slideshow-image">
              <ElImage
                v-if="currentShot?.thumbnail"
                :src="currentShot.thumbnail"
                fit="contain"
                class="main-image"
              />
              <div v-else class="main-placeholder flex-cc">
                <ArtSvgIcon icon="ri:movie-line" class="text-6xl text-g-400" />
              </div>
            </div>
            <div class="slideshow-info">
              <div class="flex-cb mb-2">
                <div class="flex items-center gap-3">
                  <span class="text-2xl font-bold">{{ currentIndex + 1 }}</span>
                  <span class="text-lg font-medium">{{ currentShot?.name }}</span>
                </div>
                <ElTag :type="shotTypeTagMap[currentShot?.type as ShotType]" size="small">
                  {{ shotTypeLabelMap[currentShot?.type as ShotType] }}
                </ElTag>
              </div>
              <p class="text-g-500 mb-4">{{ currentShot?.description }}</p>
              <ElDescriptions :column="3" border>
                <ElDescriptionsItem label="时长">{{ currentShot?.duration }}s</ElDescriptionsItem>
                <ElDescriptionsItem label="转场">{{
                  transitionLabelMap[currentShot?.transition as TransitionType]
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="焦距"
                  >{{ currentShot?.focalLength }}mm</ElDescriptionsItem
                >
                <ElDescriptionsItem label="机位">{{
                  currentShot?.cameraPosition
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="运镜">{{
                  currentShot?.movements?.join('、') || '无'
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="备注">{{
                  currentShot?.remark || '-'
                }}</ElDescriptionsItem>
              </ElDescriptions>
            </div>
          </div>
          <div class="slideshow-controls">
            <ElButton @click="handlePrev" :disabled="currentIndex === 0">
              <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
              上一个
            </ElButton>
            <ElButton type="primary" @click="handlePlay" v-if="!isPlaying">
              <ArtSvgIcon icon="ri:play-line" class="mr-1" />
              播放
            </ElButton>
            <ElButton type="primary" @click="handlePause" v-else>
              <ArtSvgIcon icon="ri:pause-line" class="mr-1" />
              暂停
            </ElButton>
            <ElButton @click="handleNext" :disabled="currentIndex === filteredShotList.length - 1">
              下一个
              <ArtSvgIcon icon="ri:arrow-right-line" class="ml-1" />
            </ElButton>
          </div>
          <div class="slideshow-thumbnails">
            <div
              v-for="(shot, index) in filteredShotList"
              :key="shot.id"
              class="thumb-item"
              :class="{ active: currentIndex === index }"
              @click="currentIndex = index"
            >
              <div class="thumb-image">
                <ElImage v-if="shot.thumbnail" :src="shot.thumbnail" fit="cover" />
                <div v-else class="thumb-placeholder flex-cc">
                  <ArtSvgIcon icon="ri:movie-line" class="text-g-400" />
                </div>
              </div>
              <span class="thumb-index">{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间线模式 -->
      <div v-else-if="viewMode === 'timeline'" class="timeline-view">
        <div class="timeline-header">
          <div class="timeline-ruler">
            <div
              v-for="tick in timeTicks"
              :key="tick"
              class="time-tick"
              :style="{ left: `${(tick / totalDuration) * 100}%` }"
            >
              <span class="tick-label">{{ tick }}s</span>
            </div>
          </div>
        </div>
        <div class="timeline-tracks">
          <div class="timeline-track">
            <div class="track-label">分镜</div>
            <div class="track-content">
              <div
                v-for="(shot, index) in filteredShotList"
                :key="shot.id"
                class="timeline-item"
                :style="{
                  left: `${(getShotStartTime(index) / totalDuration) * 100}%`,
                  width: `${(shot.duration / totalDuration) * 100}%`
                }"
                @click="currentIndex = index"
              >
                <div class="timeline-bar" :class="shot.type">
                  <span class="bar-name">{{ shot.name }}</span>
                  <span class="bar-duration">{{ shot.duration }}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="timeline-info">
          <ElDescriptions :column="3" border>
            <ElDescriptionsItem label="总时长">{{ totalDuration }}s</ElDescriptionsItem>
            <ElDescriptionsItem label="镜头数">{{ filteredShotList.length }} 个</ElDescriptionsItem>
            <ElDescriptionsItem label="当前镜头">{{ currentShot?.name || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>
      </div>
    </ElCard>

    <!-- 导出弹窗 -->
    <ElDialog v-model="exportDialogVisible" :title="exportTitle" width="400px">
      <div class="export-options">
        <ElForm :model="exportForm" label-width="100px">
          <ElFormItem label="导出范围">
            <ElRadioGroup v-model="exportForm.range">
              <ElRadio value="all">全部</ElRadio>
              <ElRadio value="current">当前分镜</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
          <ElFormItem v-if="exportForm.type === 'image'" label="图片格式">
            <ElSelect v-model="exportForm.format" class="w-full">
              <ElOption label="PNG" value="png" />
              <ElOption label="JPG" value="jpg" />
              <ElOption label="WEBP" value="webp" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem v-if="exportForm.type === 'video'" label="视频格式">
            <ElSelect v-model="exportForm.format" class="w-full">
              <ElOption label="MP4" value="mp4" />
              <ElOption label="MOV" value="mov" />
              <ElOption label="AVI" value="avi" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="分辨率">
            <ElSelect v-model="exportForm.resolution" class="w-full">
              <ElOption label="1920x1080 (1080p)" value="1080p" />
              <ElOption label="2560x1440 (2K)" value="2k" />
              <ElOption label="3840x2160 (4K)" value="4k" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <ElButton @click="exportDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="exportLoading" @click="handleExportSubmit">
          <ArtSvgIcon icon="ri:download-line" class="mr-1" />
          开始导出
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useRoute } from 'vue-router'
  import { useStoryboardList, useStoryboardImages } from '@/api/queries/storyboard'
  import { useProjectList } from '@/api/queries/project'
  import { useStoryboardProjectStore } from '@/store/modules/storyboard-project'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'
  defineOptions({ name: 'StoryboardPreview' })

  type ShotType = 'closeup' | 'medium' | 'long' | 'full' | 'extreme_closeup' | 'over_shoulder'
  type TransitionType = 'cut' | 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'none'
  type ViewMode = 'storyboard' | 'slideshow' | 'timeline'
  type ExportType = 'image' | 'pdf' | 'video'

  interface StoryboardOption {
    id: number
    code: string
    name: string
  }

  interface ShotItem {
    id: number
    storyboardId: number
    name: string
    type: ShotType
    description: string
    duration: number
    transition: TransitionType
    cameraPosition: string
    focalLength: number
    movements: string[]
    remark: string
    thumbnail: string
  }

  const route = useRoute()
  const storyboardProjectStore = useStoryboardProjectStore()

  const projectId = computed(
    () => (route.params.projectId as string) || storyboardProjectStore.currentProjectId || ''
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
    get: () => projectId.value,
    set: (val) => {
      if (val && val !== storyboardProjectStore.currentProjectId) {
        storyboardProjectStore.setCurrentProject(val)
      }
    }
  })

  function handleProjectChange() {
    currentIndex.value = 0
    if (isPlaying.value) handlePause()
  }

  function handleProjectRefresh() {
    // vue-query 自动随 projectId 变化重新拉取
  }

  const {
    data: storyboardListData,
    isLoading: listLoading,
    error: listError
  } = useStoryboardList(projectId)

  const isLoading = computed(() => listLoading.value)
  const hasError = computed(() => !!listError.value)
  const errorMessage = computed(() => {
    if (!listError.value) return ''
    return (listError.value as Error)?.message || '加载分镜数据失败，请稍后重试'
  })

  const storyboardOptions = computed<StoryboardOption[]>(() => {
    const data = storyboardListData.value
    if (!data) return []
    const list = Array.isArray(data) ? data : (data as any).records || []
    return list.map((item: any) => ({
      id: item.id,
      code: item.code ?? '',
      name: item.name ?? ''
    })) as StoryboardOption[]
  })

  const viewMode = ref<ViewMode>('storyboard')
  const currentIndex = ref(0)
  const currentStoryboard = ref<number>(1)
  const isPlaying = ref(false)
  const exportDialogVisible = ref(false)
  const exportLoading = ref(false)
  let playTimer: ReturnType<typeof setInterval> | null = null

  watch(
    storyboardOptions,
    (opts) => {
      if (opts.length > 0 && !opts.find((o) => o.id === currentStoryboard.value)) {
        currentStoryboard.value = opts[0].id
      }
    },
    { immediate: true }
  )

  const shotTypeTagMap: Record<ShotType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    closeup: 'primary',
    medium: 'success',
    long: 'warning',
    full: 'info',
    extreme_closeup: 'danger',
    over_shoulder: 'primary'
  }

  const shotTypeLabelMap: Record<ShotType, string> = {
    closeup: '特写',
    medium: '近景',
    long: '远景',
    full: '全景',
    extreme_closeup: '大特写',
    over_shoulder: '过肩'
  }

  const transitionLabelMap: Record<TransitionType, string> = {
    cut: '直接切换',
    fade: '淡入淡出',
    dissolve: '溶解',
    wipe: '划像',
    slide: '滑动',
    zoom: '缩放',
    none: '无'
  }

  // 使用 vue-query 获取当前分镜下的镜头列表（复用 storyboardList 接口按 episodeId 过滤）
  const { data: shotListData } = useStoryboardList(
    projectId,
    computed(() => ({
      episodeId: String(currentStoryboard.value)
    }))
  )

  const shotList = computed<ShotItem[]>(() => {
    const data = shotListData.value
    if (!data) return []
    const list = Array.isArray(data) ? data : (data as any).records || []
    return list.map((item: any, idx: number) => ({
      id: item.id ?? idx + 1,
      storyboardId: item.storyboardId ?? currentStoryboard.value,
      name: item.name ?? '',
      type: item.type ?? 'full',
      description: item.description ?? '',
      duration: item.duration ?? 5,
      transition: item.transition ?? 'cut',
      cameraPosition: item.cameraPosition ?? '',
      focalLength: item.focalLength ?? 50,
      movements: item.movements ?? [],
      remark: item.remark ?? '',
      thumbnail: item.thumbnail ?? ''
    })) as ShotItem[]
  })

  const filteredShotList = computed(() => {
    return shotList.value.filter((s) => s.storyboardId === currentStoryboard.value)
  })
  const currentShot = computed(() => filteredShotList.value[currentIndex.value])
  const totalDuration = computed(() =>
    filteredShotList.value.reduce((sum, shot) => sum + shot.duration, 0)
  )

  const timeTicks = computed(() => {
    const ticks: number[] = []
    if (totalDuration.value <= 0) return [0]
    const step = Math.max(1, Math.ceil(totalDuration.value / 10))
    for (let i = 0; i <= totalDuration.value; i += step) {
      ticks.push(i)
    }
    return ticks
  })

  const exportForm = reactive({
    type: 'image' as ExportType,
    range: 'all' as 'all' | 'current',
    format: 'png',
    resolution: '1080p'
  })

  const exportTitle = computed(() => {
    const map: Record<ExportType, string> = {
      image: '导出为图片',
      pdf: '导出为PDF',
      video: '导出为视频'
    }
    return map[exportForm.type]
  })

  const getShotStartTime = (index: number) => {
    let time = 0
    for (let i = 0; i < index; i++) {
      time += filteredShotList.value[i].duration
    }
    return time
  }

  const handlePrev = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }

  const handleNext = () => {
    if (currentIndex.value < filteredShotList.value.length - 1) {
      currentIndex.value++
    }
  }

  // 切换分镜时重置播放状态
  watch(currentStoryboard, () => {
    currentIndex.value = 0
    if (isPlaying.value) {
      handlePause()
    }
  })

  const handlePlay = () => {
    isPlaying.value = true
    playTimer = setInterval(() => {
      if (currentIndex.value < filteredShotList.value.length - 1) {
        currentIndex.value++
      } else {
        handlePause()
      }
    }, 3000)
  }

  const handlePause = () => {
    isPlaying.value = false
    if (playTimer) {
      clearInterval(playTimer)
      playTimer = null
    }
  }

  const handleExport = (command: ExportType) => {
    exportForm.type = command
    exportForm.range = 'all'
    exportForm.format = command === 'image' ? 'png' : command === 'video' ? 'mp4' : 'pdf'
    exportDialogVisible.value = true
  }

  const { data: storyboardImages } = useStoryboardImages(
    computed(() => String(currentStoryboard.value))
  )

  const handleExportSubmit = async () => {
    exportLoading.value = true
    try {
      if (exportForm.type === 'image') {
        const images = storyboardImages.value
        if (images && Array.isArray(images) && images.length > 0) {
          for (const img of images) {
            window.open((img as any).url, '_blank')
          }
          ElMessage.success('图片导出成功')
        } else {
          ElMessage.warning('暂无可导出的图片')
        }
      } else if (exportForm.type === 'pdf') {
        ElMessage.info('PDF导出功能开发中，请使用图片导出')
      } else if (exportForm.type === 'video') {
        ElMessage.info('视频导出功能开发中，请使用图片导出')
      }
    } catch {
      ElMessage.error('导出失败')
    } finally {
      exportLoading.value = false
      exportDialogVisible.value = false
    }
  }

  onMounted(() => {
    // vue-query 自动加载数据
  })

  onUnmounted(() => {
    if (playTimer) {
      clearInterval(playTimer)
    }
  })
</script>

<style lang="scss" scoped>
  .storyboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding-bottom: 16px;

    .storyboard-card {
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      :deep(.el-card__body) {
        padding: 0;
      }

      .storyboard-image {
        position: relative;
        height: 160px;
        overflow: hidden;
        border-radius: calc(var(--custom-radius) / 2 + 2px) calc(var(--custom-radius) / 2 + 2px) 0 0;

        .shot-image {
          width: 100%;
          height: 100%;
        }

        .shot-placeholder {
          width: 100%;
          height: 100%;
          background: var(--el-fill-color-lighter);
        }

        .shot-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 8px;
          pointer-events: none;

          .shot-index {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            font-size: 12px;
            font-weight: 600;
            color: white;
            background: var(--el-color-primary);
            border-radius: 50%;
          }

          .shot-duration {
            padding: 2px 8px;
            font-size: 12px;
            color: white;
            background: rgb(0 0 0 / 60%);
            border-radius: 4px;
          }
        }
      }

      .storyboard-info {
        padding: 12px;

        .shot-name {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }

        .shot-desc {
          display: -webkit-box;
          margin-bottom: 8px;
          overflow: hidden;
          font-size: 12px;
          line-height: 1.5;
          color: var(--el-text-color-secondary);
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .shot-meta {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .slideshow-view {
    .slideshow-container {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .slideshow-main {
        display: flex;
        gap: 24px;

        .slideshow-image {
          flex: 1;
          min-height: 400px;
          overflow: hidden;
          background: var(--el-fill-color-lighter);
          border-radius: var(--custom-radius);

          .main-image {
            width: 100%;
            height: 100%;
          }

          .main-placeholder {
            width: 100%;
            height: 400px;
          }
        }

        .slideshow-info {
          flex-shrink: 0;
          width: 400px;
        }
      }

      .slideshow-controls {
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .slideshow-thumbnails {
        display: flex;
        gap: 8px;
        padding: 8px 0;
        overflow-x: auto;

        .thumb-item {
          position: relative;
          flex-shrink: 0;
          width: 100px;
          height: 70px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 6px;

          &:hover {
            border-color: var(--el-color-primary-light-7);
          }

          &.active {
            border-color: var(--el-color-primary);
          }

          .thumb-image {
            width: 100%;
            height: 100%;

            .el-image {
              width: 100%;
              height: 100%;
            }
          }

          .thumb-placeholder {
            width: 100%;
            height: 100%;
            background: var(--el-fill-color-lighter);
          }

          .thumb-index {
            position: absolute;
            top: 4px;
            left: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            font-size: 10px;
            font-weight: 600;
            color: white;
            background: var(--el-color-primary);
            border-radius: 50%;
          }
        }
      }
    }
  }

  .timeline-view {
    .timeline-header {
      position: relative;
      height: 30px;
      margin-bottom: 8px;

      .timeline-ruler {
        position: relative;
        height: 100%;

        .time-tick {
          position: absolute;
          top: 0;
          transform: translateX(-50%);

          &::before {
            display: block;
            width: 1px;
            height: 8px;
            margin: 0 auto 2px;
            content: '';
            background: var(--el-border-color);
          }

          .tick-label {
            font-size: 11px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }

    .timeline-tracks {
      .timeline-track {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 8px;

        .track-label {
          flex-shrink: 0;
          width: 60px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          text-align: right;
        }

        .track-content {
          position: relative;
          flex: 1;
          height: 40px;
          background: var(--el-fill-color-lighter);
          border-radius: 4px;

          .timeline-item {
            position: absolute;
            top: 4px;
            bottom: 4px;
            cursor: pointer;

            .timeline-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              height: 100%;
              padding: 0 8px;
              overflow: hidden;
              font-size: 11px;
              color: white;
              border-radius: 4px;

              &.closeup {
                background: var(--el-color-primary);
              }

              &.medium {
                background: var(--el-color-success);
              }

              &.long {
                background: var(--el-color-warning);
              }

              &.full {
                background: var(--el-color-info);
              }

              &.extreme_closeup {
                background: var(--el-color-danger);
              }

              &.over_shoulder {
                background: var(--el-color-primary-light-3);
              }

              .bar-name {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .bar-duration {
                flex-shrink: 0;
              }
            }
          }
        }
      }
    }

    .timeline-info {
      margin-top: 16px;
    }
  }
</style>
