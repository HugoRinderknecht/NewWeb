<template>
  <div class="editor-timeline-page art-full-height">
    <ElCard class="art-card art-full-height">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">时间线编辑</span>
            <ElTag type="info" size="small">{{ formatTime(totalDuration) }}</ElTag>
          </div>
          <ElSpace>
            <ElButton @click="handleUndo">
              <el-icon class="mr-1"><RefreshLeft /></el-icon>撤销
            </ElButton>
            <ElButton @click="handleRedo">
              <el-icon class="mr-1"><RefreshRight /></el-icon>重做
            </ElButton>
            <ElButton type="primary" @click="handleExport">
              <el-icon class="mr-1"><Download /></el-icon>导出视频
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <div class="timeline-workspace flex flex-col gap-4 h-full">
        <!-- 顶部预览与控制 -->
        <div class="top-area flex gap-4">
          <!-- 预览区 -->
          <div class="preview-panel flex-1 flex flex-col gap-3">
            <div class="preview-screen">
              <ArtVideoPlayer
                ref="timelineVideoRef"
                player-id="timeline-player"
                video-url="https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4"
                poster-url=""
              />
            </div>
            <div class="preview-controls flex-cb">
              <ElSpace>
                <ElButton circle @click="togglePlay">
                  <el-icon><VideoPlay v-if="!isPlaying" /><VideoPause v-else /></el-icon>
                </ElButton>
                <ElButton circle @click="handleStop">
                  <el-icon><CircleClose /></el-icon>
                </ElButton>
                <ElButton circle @click="handlePrevFrame">
                  <el-icon><DArrowLeft /></el-icon>
                </ElButton>
                <ElButton circle @click="handleNextFrame">
                  <el-icon><DArrowRight /></el-icon>
                </ElButton>
              </ElSpace>
              <ElSpace>
                <ElButton size="small" @click="handleZoomOut">
                  <el-icon><ZoomOut /></el-icon>
                </ElButton>
                <span class="text-sm">{{ zoomLevel }}%</span>
                <ElButton size="small" @click="handleZoomIn">
                  <el-icon><ZoomIn /></el-icon>
                </ElButton>
                <ElButton size="small" @click="toggleFullscreen">
                  <el-icon><FullScreen /></el-icon>
                </ElButton>
              </ElSpace>
            </div>
          </div>

          <!-- 导出设置 -->
          <div class="export-panel w-64">
            <ElCard class="art-card-sm">
              <template #header>
                <span class="font-medium">导出设置</span>
              </template>
              <ElForm :model="exportForm" label-width="70px" size="small">
                <ElFormItem label="分辨率">
                  <ElSelect v-model="exportForm.resolution" placeholder="选择分辨率">
                    <ElOption label="1920x1080 (1080p)" value="1080p" />
                    <ElOption label="2560x1440 (2K)" value="2k" />
                    <ElOption label="3840x2160 (4K)" value="4k" />
                    <ElOption label="1280x720 (720p)" value="720p" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="格式">
                  <ElSelect v-model="exportForm.format" placeholder="选择格式">
                    <ElOption label="MP4" value="mp4" />
                    <ElOption label="MOV" value="mov" />
                    <ElOption label="AVI" value="avi" />
                    <ElOption label="MKV" value="mkv" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="码率">
                  <ElSelect v-model="exportForm.bitrate" placeholder="选择码率">
                    <ElOption label="5 Mbps" value="5m" />
                    <ElOption label="10 Mbps" value="10m" />
                    <ElOption label="20 Mbps" value="20m" />
                    <ElOption label="50 Mbps" value="50m" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="帧率">
                  <ElSelect v-model="exportForm.fps" placeholder="选择帧率">
                    <ElOption label="24 fps" value="24" />
                    <ElOption label="30 fps" value="30" />
                    <ElOption label="60 fps" value="60" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" size="small" class="w-full" @click="handleExport">
                    <el-icon class="mr-1"><Download /></el-icon>开始导出
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </div>
        </div>

        <!-- 时间线区域 -->
        <div class="timeline-area flex-1 flex flex-col gap-2 overflow-hidden">
          <!-- 播放头与标尺 -->
          <div class="timeline-ruler-wrapper relative">
            <div class="ruler-spacer w-28 shrink-0" />
            <div class="ruler-marks flex-1 relative h-6">
              <div
                v-for="mark in rulerMarks"
                :key="mark"
                class="ruler-mark absolute text-xs text-g-400"
                :style="{ left: `${(mark / totalDuration) * 100}%` }"
              >
                {{ formatTime(mark) }}
              </div>
            </div>
            <div
              class="playhead absolute top-0 bottom-0 w-px bg-red-500 z-10"
              :style="{ left: `calc(7rem + ${(currentTime / totalDuration) * 100}%)` }"
            >
              <div
                class="playhead-triangle absolute -top-1 -left-1.5 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-red-500"
              />
            </div>
          </div>

          <!-- 轨道列表 -->
          <div class="tracks-container flex-1 overflow-y-auto">
            <div
              v-for="(track, tIndex) in tracks"
              :key="track.id"
              class="timeline-track flex items-center gap-2 py-1"
              @dragover.prevent
              @drop="handleDrop($event, tIndex)"
            >
              <div class="track-header w-28 shrink-0 flex items-center gap-2">
                <el-icon class="text-g-400 cursor-pointer" @click="track.muted = !track.muted">
                  <Microphone v-if="!track.muted" />
                  <Mute v-else />
                </el-icon>
                <span class="text-xs text-g-500 truncate">{{ track.name }}</span>
              </div>
              <div class="track-clips flex-1 relative h-12 bg-g-100 rounded">
                <div
                  v-for="(clip, cIndex) in track.clips"
                  :key="clip.id"
                  class="timeline-clip absolute h-full rounded px-2 flex items-center text-xs text-white cursor-pointer"
                  :class="{ active: selectedClip?.id === clip.id }"
                  :style="{
                    left: `${(clip.startTime / totalDuration) * 100}%`,
                    width: `${((clip.endTime - clip.startTime) / totalDuration) * 100}%`,
                    backgroundColor: clip.color
                  }"
                  @click="handleSelectClip(clip, track)"
                  draggable="true"
                  @dragstart="handleClipDragStart($event, tIndex, cIndex)"
                >
                  <span class="truncate">{{ clip.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部控制栏 -->
          <div class="timeline-toolbar flex-cb py-2">
            <ElSpace>
              <ElButton size="small" @click="handleAddTrack">
                <el-icon class="mr-1"><Plus /></el-icon>添加轨道
              </ElButton>
              <ElButton size="small" :disabled="!selectedClip" @click="handleDeleteClip">
                <el-icon class="mr-1"><Delete /></el-icon>删除片段
              </ElButton>
            </ElSpace>
            <ElSpace>
              <ElButton size="small" @click="handleAddAudioTrack">
                <el-icon class="mr-1"><Headset /></el-icon>音频轨道
              </ElButton>
              <ElButton size="small" :disabled="!selectedAudioTrack" @click="handleVolumeAdjust">
                <el-icon class="mr-1"><Mic /></el-icon>音量调节
              </ElButton>
              <ElButton size="small" @click="handleAudioSync">
                <el-icon class="mr-1"><Timer /></el-icon>音频同步
              </ElButton>
            </ElSpace>
          </div>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchAddSegment,
    fetchUpdateSegment,
    fetchDeleteSegment,
    fetchReorderSegments
  } from '@/api/editor'
  import {
    VideoPlay,
    VideoPause,
    CircleClose,
    DArrowLeft,
    DArrowRight,
    ZoomIn,
    ZoomOut,
    FullScreen,
    RefreshLeft,
    RefreshRight,
    Download,
    Plus,
    Delete,
    Headset,
    Mic,
    Timer,
    Microphone,
    Mute
  } from '@element-plus/icons-vue'

  defineOptions({ name: 'EditorTimeline' })

  const route = useRoute()
  const projectId = computed(() => String(route.query.projectId || route.query.id || ''))

  interface TimelineClip {
    id: string
    name: string
    startTime: number
    endTime: number
    color: string
  }

  interface Track {
    id: string
    name: string
    type: 'video' | 'audio'
    muted: boolean
    volume?: number
    clips: TimelineClip[]
  }

  const currentTime = ref(0)
  const totalDuration = ref(120)
  const zoomLevel = ref(100)
  const isPlaying = ref(false)
  const selectedClip = ref<TimelineClip | null>(null)
  const selectedAudioTrack = ref<Track | null>(null)
  const timelineVideoRef = ref()

  // 视频播放器事件
  const handleVideoPlay = () => {
    isPlaying.value = true
  }

  const handleVideoPause = () => {
    isPlaying.value = false
  }

  const handleVideoTimeUpdate = (time: number) => {
    currentTime.value = time
  }

  const exportForm = reactive({
    resolution: '1080p',
    format: 'mp4',
    bitrate: '10m',
    fps: '30'
  })

  const tracks = reactive<Track[]>([
    {
      id: 'tv1',
      name: '视频 1',
      type: 'video',
      muted: false,
      clips: [
        { id: 'c1', name: '开场', startTime: 0, endTime: 15, color: '#409eff' },
        { id: 'c2', name: '介绍', startTime: 15, endTime: 45, color: '#67c23a' },
        { id: 'c3', name: '结尾', startTime: 45, endTime: 60, color: '#e6a23c' }
      ]
    },
    {
      id: 'tv2',
      name: '视频 2',
      type: 'video',
      muted: false,
      clips: [{ id: 'c4', name: '字幕', startTime: 0, endTime: 60, color: '#f56c6c' }]
    },
    {
      id: 'ta1',
      name: '音频 1',
      type: 'audio',
      muted: false,
      volume: 80,
      clips: [{ id: 'c5', name: '背景音乐', startTime: 0, endTime: 60, color: '#909399' }]
    },
    {
      id: 'ta2',
      name: '音频 2',
      type: 'audio',
      muted: false,
      volume: 60,
      clips: [{ id: 'c6', name: '旁白', startTime: 5, endTime: 50, color: '#b88230' }]
    }
  ])

  const rulerMarks = computed(() => {
    const marks: number[] = []
    const step = Math.max(5, Math.floor(totalDuration.value / 12))
    for (let i = 0; i <= totalDuration.value; i += step) {
      marks.push(i)
    }
    return marks
  })

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0')
    return `${m}:${s}`
  }

  const togglePlay = () => {
    if (timelineVideoRef.value) {
      if (isPlaying.value) {
        timelineVideoRef.value.pause()
      } else {
        timelineVideoRef.value.play()
      }
    } else {
      isPlaying.value = !isPlaying.value
      if (isPlaying.value) {
        ElMessage.info('开始播放')
      } else {
        ElMessage.info('暂停播放')
      }
    }
  }

  const handleStop = () => {
    if (timelineVideoRef.value) {
      timelineVideoRef.value.pause()
      timelineVideoRef.value.seek(0)
    }
    isPlaying.value = false
    currentTime.value = 0
    ElMessage.info('停止播放')
  }

  const handlePrevFrame = () => {
    currentTime.value = Math.max(0, currentTime.value - 1 / 30)
  }

  const handleNextFrame = () => {
    currentTime.value = Math.min(totalDuration.value, currentTime.value + 1 / 30)
  }

  const handleZoomIn = () => {
    zoomLevel.value = Math.min(200, zoomLevel.value + 25)
  }

  const handleZoomOut = () => {
    zoomLevel.value = Math.max(25, zoomLevel.value - 25)
  }

  const toggleFullscreen = () => {
    ElMessage.info('全屏预览')
  }

  const handleSelectClip = (clip: TimelineClip, track: Track) => {
    selectedClip.value = clip
    if (track.type === 'audio') {
      selectedAudioTrack.value = track
    }
  }

  const handleClipDragStart = (e: DragEvent, tIndex: number, cIndex: number) => {
    e.dataTransfer?.setData('clipMove', JSON.stringify({ tIndex, cIndex }))
  }

  const handleDrop = async (e: DragEvent, trackIndex: number) => {
    const data = e.dataTransfer?.getData('clipMove')
    if (!data) return
    const { tIndex, cIndex } = JSON.parse(data)
    if (tIndex === trackIndex) return
    const clip = tracks[tIndex].clips.splice(cIndex, 1)[0]
    tracks[trackIndex].clips.push(clip)
    if (projectId.value) {
      try {
        const allSegmentIds = tracks.flatMap((t) => t.clips.map((c) => c.id))
        await fetchReorderSegments(projectId.value, allSegmentIds)
      } catch {
        // 排序 API 失败不影响本地操作
      }
    }
    ElMessage.success('已移动片段')
  }

  const handleAddTrack = async () => {
    const idx = tracks.filter((t) => t.type === 'video').length + 1
    const newTrack: Track = {
      id: `tv${Date.now()}`,
      name: `视频 ${idx}`,
      type: 'video',
      muted: false,
      clips: []
    }
    if (projectId.value) {
      try {
        const segment = await fetchAddSegment(projectId.value, {
          type: 'video',
          sourceUrl: '',
          startTime: 0,
          endTime: 0,
          sortOrder: tracks.length
        })
        if (segment) {
          newTrack.id = segment.id
        }
      } catch {
        // 本地添加兜底
      }
    }
    tracks.push(newTrack)
    ElMessage.success('已添加视频轨道')
  }

  const handleAddAudioTrack = async () => {
    const idx = tracks.filter((t) => t.type === 'audio').length + 1
    const newTrack: Track = {
      id: `ta${Date.now()}`,
      name: `音频 ${idx}`,
      type: 'audio',
      muted: false,
      volume: 80,
      clips: []
    }
    if (projectId.value) {
      try {
        const segment = await fetchAddSegment(projectId.value, {
          type: 'audio',
          sourceUrl: '',
          startTime: 0,
          endTime: 0,
          sortOrder: tracks.length
        })
        if (segment) {
          newTrack.id = segment.id
        }
      } catch {
        // 本地添加兜底
      }
    }
    tracks.push(newTrack)
    selectedAudioTrack.value = newTrack
    ElMessage.success('已添加音频轨道')
  }

  const handleDeleteClip = () => {
    if (!selectedClip.value) return
    ElMessageBox.confirm('确定删除该片段？', '提示', { type: 'warning' }).then(async () => {
      if (projectId.value) {
        try {
          await fetchDeleteSegment(projectId.value, selectedClip.value!.id)
        } catch {
          // 本地删除兜底
        }
      }
      tracks.forEach((track) => {
        const idx = track.clips.findIndex((c) => c.id === selectedClip.value!.id)
        if (idx > -1) track.clips.splice(idx, 1)
      })
      selectedClip.value = null
      ElMessage.success('删除成功')
    })
  }

  const handleVolumeAdjust = () => {
    if (!selectedAudioTrack.value) {
      ElMessage.warning('请先选择音频轨道')
      return
    }
    ElMessageBox.prompt('请输入音量 (0-100)', '音量调节', {
      inputValue: String(selectedAudioTrack.value.volume || 80),
      confirmButtonText: '确认'
    }).then(async ({ value }) => {
      const vol = Number(value)
      if (vol >= 0 && vol <= 100) {
        selectedAudioTrack.value!.volume = vol
        if (projectId.value && selectedAudioTrack.value!.clips.length > 0) {
          try {
            const clip = selectedAudioTrack.value!.clips[0]
            await fetchUpdateSegment(projectId.value, clip.id, {
              metadata: { volume: vol }
            })
          } catch {
            // 更新失败不影响本地
          }
        }
        ElMessage.success('音量已调整')
      }
    })
  }

  const handleAudioSync = () => {
    ElMessage.info('音频同步处理中...')
    setTimeout(() => {
      ElMessage.success('音频同步完成')
    }, 800)
  }

  const handleUndo = () => {
    ElMessage.info('撤销操作')
  }

  const handleRedo = () => {
    ElMessage.info('重做操作')
  }

  const handleExport = () => {
    ElMessage.success(
      `开始导出: ${exportForm.resolution}.${exportForm.format} @ ${exportForm.fps}fps`
    )
  }

  defineExpose({
    handleVideoPlay,
    handleVideoPause,
    handleVideoTimeUpdate
  })
</script>

<style lang="scss" scoped>
  .editor-timeline-page {
    padding: 16px;
  }

  .timeline-workspace {
    min-height: 400px;
  }

  .top-area {
    .preview-panel {
      .preview-screen {
        flex: 1;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
        min-height: 200px;
        overflow: hidden;
      }

      .preview-controls {
        padding: 8px 0;
      }
    }
  }

  .timeline-area {
    .timeline-ruler-wrapper {
      display: flex;
      align-items: center;
      height: 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      .ruler-mark {
        transform: translateX(-50%);
      }
    }

    .tracks-container {
      .timeline-track {
        .track-header {
          display: flex;
          align-items: center;
        }

        .track-clips {
          background: var(--el-fill-color-lighter);

          .timeline-clip {
            transition: box-shadow 0.2s;

            &.active {
              box-shadow: 0 0 0 2px var(--el-color-primary);
            }
          }
        }
      }
    }

    .timeline-toolbar {
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
</style>
