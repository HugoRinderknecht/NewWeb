<template>
  <div class="storyboard-preview-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">分镜预览</span>
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
  import { fetchGetStoryboardList } from '@/api/storyboard'
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

  const viewMode = ref<ViewMode>('storyboard')
  const currentIndex = ref(0)
  const currentStoryboard = ref<number>(1)
  const isPlaying = ref(false)
  const exportDialogVisible = ref(false)
  const exportLoading = ref(false)
  let playTimer: ReturnType<typeof setInterval> | null = null

  const storyboardOptions: StoryboardOption[] = [
    { id: 1, code: 'SB-001', name: '开场·山巅俯瞰' },
    { id: 2, code: 'SB-002', name: '九尾狐现身' },
    { id: 3, code: 'SB-003', name: '对话·寻药之旅' },
    { id: 4, code: 'SB-004', name: '昆仑仙境' },
    { id: 5, code: 'SB-005', name: '白泽授业' }
  ]

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

  const shotList = ref<ShotItem[]>([])

  const mockShotData: ShotItem[] = [
    {
      id: 1001,
      storyboardId: 1,
      name: '山巅全景',
      type: 'full',
      description: '从高空俯瞰山巅全貌，云海翻涌，气势磅礴',
      duration: 8,
      transition: 'fade',
      cameraPosition: '正上方俯拍',
      focalLength: 24,
      movements: ['上升', '横移'],
      remark: '开场第一镜，奠定基调',
      thumbnail: ''
    },
    {
      id: 1002,
      storyboardId: 1,
      name: '主角面部特写',
      type: 'closeup',
      description: '主角站在山巅，衣袂飘飘，目光坚定望向远方',
      duration: 3,
      transition: 'cut',
      cameraPosition: '正前方平视',
      focalLength: 85,
      movements: ['固定'],
      remark: '展示主角神态',
      thumbnail: ''
    },
    {
      id: 1003,
      storyboardId: 1,
      name: '远山远景',
      type: 'long',
      description: '层峦叠嶂的远山，薄雾笼罩，若隐若现',
      duration: 6,
      transition: 'dissolve',
      cameraPosition: '侧面远景',
      focalLength: 14,
      movements: [],
      remark: '空镜过渡，营造氛围',
      thumbnail: ''
    },
    {
      id: 1004,
      storyboardId: 2,
      name: '九尾狐全景',
      type: 'full',
      description: '九尾狐从迷雾中现身，九条尾巴缓缓展开，散发金色光芒',
      duration: 7,
      transition: 'wipe',
      cameraPosition: '斜前方低角度',
      focalLength: 35,
      movements: ['环绕', '推进'],
      remark: '核心角色登场',
      thumbnail: ''
    },
    {
      id: 1005,
      storyboardId: 2,
      name: '九尾狐大特写',
      type: 'extreme_closeup',
      description: '九尾狐的眼眸特写，瞳孔中映射出星辰流转',
      duration: 2,
      transition: 'zoom',
      cameraPosition: '正前方极近距离',
      focalLength: 200,
      movements: ['固定'],
      remark: '强调神秘感',
      thumbnail: ''
    },
    {
      id: 1006,
      storyboardId: 2,
      name: '幻境近景',
      type: 'medium',
      description: '九尾狐周围浮现幻境光效，空间扭曲波动',
      duration: 4,
      transition: 'slide',
      cameraPosition: '侧面中景',
      focalLength: 50,
      movements: ['横移'],
      remark: '配合特效转场',
      thumbnail: ''
    },
    {
      id: 1007,
      storyboardId: 3,
      name: '对话过肩',
      type: 'over_shoulder',
      description: '主角与药师面对面交谈，过肩镜头展现两人互动',
      duration: 5,
      transition: 'cut',
      cameraPosition: '主角肩后',
      focalLength: 70,
      movements: ['固定'],
      remark: '经典对话镜头',
      thumbnail: ''
    },
    {
      id: 1008,
      storyboardId: 3,
      name: '主角特写',
      type: 'closeup',
      description: '主角认真聆听药师讲述寻药线索，神情专注',
      duration: 3,
      transition: 'fade',
      cameraPosition: '正前方略低',
      focalLength: 100,
      movements: ['推拉'],
      remark: '捕捉情感变化',
      thumbnail: ''
    },
    {
      id: 1009,
      storyboardId: 3,
      name: '路途远景',
      type: 'long',
      description: '主角行走在蜿蜒山路上，两侧古木参天',
      duration: 8,
      transition: 'none',
      cameraPosition: '高处俯拍',
      focalLength: 28,
      movements: ['跟拍', '横移'],
      remark: '展示旅途艰辛',
      thumbnail: ''
    },
    {
      id: 1010,
      storyboardId: 4,
      name: '昆仑全景',
      type: 'full',
      description: '昆仑仙境全貌，琼楼玉宇悬浮于云端之上',
      duration: 10,
      transition: 'dissolve',
      cameraPosition: '正前方远景',
      focalLength: 16,
      movements: ['上升', '环绕'],
      remark: '仙境大场景展示',
      thumbnail: ''
    },
    {
      id: 1011,
      storyboardId: 4,
      name: '仙境近景',
      type: 'medium',
      description: '仙鹤在灵池旁栖息，灵雾缭绕其间',
      duration: 4,
      transition: 'fade',
      cameraPosition: '侧面中景',
      focalLength: 45,
      movements: ['推进'],
      remark: '展示仙境细节',
      thumbnail: ''
    },
    {
      id: 1012,
      storyboardId: 4,
      name: '仙草大特写',
      type: 'extreme_closeup',
      description: '灵药仙草特写，叶片上凝结着晶莹露珠，散发微光',
      duration: 2,
      transition: 'cut',
      cameraPosition: '正前方微距',
      focalLength: 150,
      movements: ['固定'],
      remark: '关键道具展示',
      thumbnail: ''
    },
    {
      id: 1013,
      storyboardId: 5,
      name: '白泽全景',
      type: 'full',
      description: '白泽端坐于古树下，周身环绕古籍竹简',
      duration: 6,
      transition: 'wipe',
      cameraPosition: '正面中远景',
      focalLength: 35,
      movements: ['横移', '推拉'],
      remark: '导师角色登场',
      thumbnail: ''
    },
    {
      id: 1014,
      storyboardId: 5,
      name: '讲课过肩',
      type: 'over_shoulder',
      description: '从学生背后拍摄白泽讲学，白泽手指点化空中符文',
      duration: 5,
      transition: 'slide',
      cameraPosition: '学生肩后',
      focalLength: 85,
      movements: ['固定'],
      remark: '教学互动场景',
      thumbnail: ''
    },
    {
      id: 1015,
      storyboardId: 5,
      name: '听课近景',
      type: 'medium',
      description: '学生聚精会神聆听，手中笔录不停',
      duration: 3,
      transition: 'cut',
      cameraPosition: '侧面近景',
      focalLength: 50,
      movements: ['跟拍'],
      remark: '学生反应镜头',
      thumbnail: ''
    },
    {
      id: 1016,
      storyboardId: 5,
      name: '书卷特写',
      type: 'closeup',
      description: '古籍书卷缓缓展开，文字发出金色光芒',
      duration: 4,
      transition: 'zoom',
      cameraPosition: '正上方俯拍',
      focalLength: 105,
      movements: ['推进', '环绕'],
      remark: '关键道具特写，衔接下集',
      thumbnail: ''
    }
  ]

  const loadShotList = async () => {
    try {
      const projectId = '1'
      const res = await fetchGetStoryboardList(projectId)
      if (res) {
        const list = Array.isArray(res) ? res : (res as any).records || []
        if (list.length > 0) {
          shotList.value = list.map((item: any, idx: number) => ({
            id: item.id ?? idx + 1,
            storyboardId: item.storyboardId ?? 1,
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
          return
        }
      }
    } catch {
      // fallback to mock data
    }
    shotList.value = mockShotData
  }

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

  const handleExportSubmit = () => {
    exportLoading.value = true
    // TODO: 暂无分镜导出API，后续对接 fetchExportStoryboard 后替换此 setTimeout
    setTimeout(() => {
      exportLoading.value = false
      exportDialogVisible.value = false
      ElMessage.success(`${exportTitle.value}成功`)
    }, 1500)
  }

  onMounted(() => {
    loadShotList()
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
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px;
          pointer-events: none;

          .shot-index {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--el-color-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
          }

          .shot-duration {
            padding: 2px 8px;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            font-size: 12px;
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
          font-size: 12px;
          color: var(--el-text-color-secondary);
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
          background: var(--el-fill-color-lighter);
          border-radius: var(--custom-radius);
          overflow: hidden;

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
          width: 400px;
          flex-shrink: 0;
        }
      }

      .slideshow-controls {
        display: flex;
        justify-content: center;
        gap: 12px;
      }

      .slideshow-thumbnails {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 8px 0;

        .thumb-item {
          position: relative;
          width: 100px;
          height: 70px;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          flex-shrink: 0;

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
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--el-color-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 600;
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
            content: '';
            display: block;
            width: 1px;
            height: 8px;
            background: var(--el-border-color);
            margin: 0 auto 2px;
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
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .track-label {
          width: 60px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          text-align: right;
          flex-shrink: 0;
        }

        .track-content {
          flex: 1;
          position: relative;
          height: 40px;
          background: var(--el-fill-color-lighter);
          border-radius: 4px;

          .timeline-item {
            position: absolute;
            top: 4px;
            bottom: 4px;
            cursor: pointer;

            .timeline-bar {
              height: 100%;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 8px;
              color: white;
              font-size: 11px;
              overflow: hidden;

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
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
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
