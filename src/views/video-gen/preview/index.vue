<template>
  <div class="video-gen-preview-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">视频预览</span>
            <ElTag type="info" size="small">{{ videoList.length }} 个视频</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索视频名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption label="已完成" value="completed" />
              <ElOption label="渲染中" value="rendering" />
            </ElSelect>
            <ElButton
              type="primary"
              @click="handleBatchDownload"
              :disabled="selectedVideos.length === 0"
            >
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              批量下载
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 视频列表 -->
      <div class="video-list">
        <ElRow :gutter="16">
          <ElCol
            v-for="video in pagedVideos"
            :key="video.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            class="mb-4"
          >
            <ElCard
              class="video-card"
              shadow="hover"
              :class="{ selected: selectedIds.includes(video.id) }"
            >
              <div class="video-cover" @click="handleSelectVideo(video)">
                <div class="cover-placeholder flex-cc">
                  <ArtSvgIcon icon="ri:video-line" class="text-4xl" />
                </div>
                <div
                  v-if="video.status === 'completed'"
                  class="cover-overlay flex-cc"
                  @click.stop="handlePlayVideo(video)"
                >
                  <ArtSvgIcon icon="ri:play-circle-line" class="text-5xl text-white" />
                </div>
                <div v-if="video.status === 'rendering'" class="cover-overlay rendering flex-cc">
                  <ElIcon class="is-loading">
                    <ArtSvgIcon icon="ri:loader-4-line" class="text-3xl text-white" />
                  </ElIcon>
                </div>
                <div class="cover-check" v-if="selectedIds.includes(video.id)">
                  <ArtSvgIcon icon="ri:check-fill" class="text-white" />
                </div>
                <div class="cover-duration">{{ video.duration }}</div>
              </div>
              <div class="video-info">
                <div class="flex-cb mb-2">
                  <span class="video-name font-medium">{{ video.name }}</span>
                  <ElTag :type="video.status === 'completed' ? 'success' : 'warning'" size="small">
                    {{ video.status === 'completed' ? '已完成' : '渲染中' }}
                  </ElTag>
                </div>
                <div class="video-meta mb-2">
                  <ElSpace wrap>
                    <span class="text-xs text-g-400">{{ video.resolution }}</span>
                    <span class="text-xs text-g-400">{{ video.format }}</span>
                    <span class="text-xs text-g-400">{{ video.size }}</span>
                  </ElSpace>
                </div>
                <div class="video-source mb-2">
                  <span class="text-xs text-g-400">来源分镜：</span>
                  <ElTag
                    v-for="shot in video.sourceShots.slice(0, 2)"
                    :key="shot"
                    size="small"
                    class="mr-1"
                  >
                    {{ shot }}
                  </ElTag>
                  <ElTag v-if="video.sourceShots.length > 2" size="small" type="info">
                    +{{ video.sourceShots.length - 2 }}
                  </ElTag>
                </div>
                <div class="video-actions flex-cb">
                  <ElSpace>
                    <ElButton
                      v-if="video.status === 'completed'"
                      type="primary"
                      link
                      size="small"
                      @click="handlePlayVideo(video)"
                    >
                      <ArtSvgIcon icon="ri:play-line" class="mr-1" />
                      播放
                    </ElButton>
                    <ElButton
                      v-if="video.status === 'completed'"
                      type="primary"
                      link
                      size="small"
                      @click="handleDownload(video)"
                    >
                      <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                      下载
                    </ElButton>
                    <ElButton type="warning" link size="small" @click="handleRegenerate(video)">
                      <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
                      重新生成
                    </ElButton>
                  </ElSpace>
                  <ElButton type="danger" link size="small" @click="handleDelete(video)"
                    >删除</ElButton
                  >
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[8, 12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>

    <!-- 视频播放弹窗 -->
    <ElDialog
      v-model="playVisible"
      :title="currentVideo?.name"
      width="900px"
      align-center
      destroy-on-close
    >
      <div v-if="currentVideo" class="video-player">
        <div class="player-screen flex-cc">
          <ArtSvgIcon icon="ri:video-line" class="text-6xl text-g-400" />
          <p class="mt-4 text-g-400">视频播放组件占位</p>
        </div>
        <div class="player-controls flex-cb mt-4">
          <ElSpace>
            <ElButton type="primary" @click="handleDownload(currentVideo)">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              下载视频
            </ElButton>
            <ElButton @click="handleCompare(currentVideo)">
              <ArtSvgIcon icon="ri:split-cells-horizontal" class="mr-1" />
              对比原分镜
            </ElButton>
          </ElSpace>
          <ElSpace>
            <ElSelect v-model="downloadResolution" placeholder="分辨率" style="width: 140px">
              <ElOption label="1080p" value="1080p" />
              <ElOption label="2K" value="2k" />
              <ElOption label="4K" value="4k" />
            </ElSelect>
            <ElSelect v-model="downloadFormat" placeholder="格式" style="width: 100px">
              <ElOption label="MP4" value="mp4" />
              <ElOption label="MOV" value="mov" />
              <ElOption label="AVI" value="avi" />
            </ElSelect>
          </ElSpace>
        </div>
      </div>
    </ElDialog>

    <!-- 对比原分镜弹窗 -->
    <ElDialog
      v-model="compareVisible"
      title="对比原分镜"
      width="1000px"
      align-center
      destroy-on-close
    >
      <div v-if="currentVideo" class="compare-view">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <div class="compare-panel">
              <div class="compare-label">原分镜</div>
              <div class="compare-content flex-cc">
                <div class="text-center">
                  <ArtSvgIcon icon="ri:image-line" class="text-5xl text-g-400" />
                  <p class="mt-2 text-g-400">分镜预览占位</p>
                </div>
              </div>
              <div class="compare-shots">
                <div class="text-sm font-medium mb-2">包含镜头</div>
                <ElSpace wrap>
                  <ElTag v-for="shot in currentVideo.sourceShots" :key="shot" size="small">
                    {{ shot }}
                  </ElTag>
                </ElSpace>
              </div>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="compare-panel">
              <div class="compare-label">生成视频</div>
              <div class="compare-content flex-cc">
                <div class="text-center">
                  <ArtSvgIcon icon="ri:video-line" class="text-5xl text-g-400" />
                  <p class="mt-2 text-g-400">视频预览占位</p>
                </div>
              </div>
              <div class="compare-params">
                <div class="text-sm font-medium mb-2">生成参数</div>
                <ElDescriptions :column="2" border size="small">
                  <ElDescriptionsItem label="风格">{{ currentVideo.style }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="分辨率">{{
                    currentVideo.resolution
                  }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="时长">{{ currentVideo.duration }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="格式">{{ currentVideo.format }}</ElDescriptionsItem>
                </ElDescriptions>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </ElDialog>

    <!-- 重新生成弹窗 -->
    <ElDialog
      v-model="regenerateVisible"
      title="重新生成"
      width="600px"
      align-center
      destroy-on-close
    >
      <ElForm :model="regenerateForm" label-width="100px">
        <ElAlert type="info" :closable="false" class="mb-4">
          基于任务「{{ currentVideo?.name }}」的参数重新生成，您可以调整以下参数
        </ElAlert>
        <ElFormItem label="视频风格">
          <ElSelect v-model="regenerateForm.style" placeholder="请选择风格" class="w-full">
            <ElOption label="写实风格" value="写实风格" />
            <ElOption label="卡通风格" value="卡通风格" />
            <ElOption label="3D动画" value="3D动画" />
            <ElOption label="水墨风格" value="水墨风格" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="分辨率">
          <ElSelect v-model="regenerateForm.resolution" placeholder="请选择分辨率" class="w-full">
            <ElOption label="1920x1080 (1080p)" value="1080p" />
            <ElOption label="2560x1440 (2K)" value="2k" />
            <ElOption label="3840x2160 (4K)" value="4k" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="帧率">
          <ElSelect v-model="regenerateForm.fps" placeholder="请选择帧率" class="w-full">
            <ElOption label="24fps" value="24fps" />
            <ElOption label="30fps" value="30fps" />
            <ElOption label="60fps" value="60fps" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="视频格式">
          <ElSelect v-model="regenerateForm.format" placeholder="请选择格式" class="w-full">
            <ElOption label="MP4" value="MP4" />
            <ElOption label="MOV" value="MOV" />
            <ElOption label="AVI" value="AVI" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="画质等级">
          <ElSlider v-model="regenerateForm.quality" :min="1" :max="5" :step="1" show-stops />
          <div class="text-xs text-g-400 text-right">{{
            qualityLabelMap[regenerateForm.quality]
          }}</div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="regenerateVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="regenerating" @click="handleConfirmRegenerate">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
          重新生成
        </ElButton>
      </template>
    </ElDialog>

    <!-- 历史生成记录弹窗 -->
    <ElDialog
      v-model="historyVisible"
      title="历史生成记录"
      width="800px"
      align-center
      destroy-on-close
    >
      <ElTable :data="historyList" style="width: 100%">
        <ElTableColumn label="版本" width="80">
          <template #default="{ row }">
            <ElTag size="small" :type="row.isCurrent ? 'success' : 'info'">
              {{ row.version }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="生成时间" prop="time" width="160" />
        <ElTableColumn label="参数" min-width="200">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElTag size="small" type="info">{{ row.style }}</ElTag>
              <ElTag size="small" type="info">{{ row.resolution }}</ElTag>
              <ElTag size="small" type="info">{{ row.fps }}</ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="row.status === 'completed' ? 'success' : 'danger'" size="small">
              {{ row.status === 'completed' ? '成功' : '失败' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" link size="small" @click="handleUseHistoryParams(row)">
                复用参数
              </ElButton>
              <ElButton type="primary" link size="small" @click="handlePreviewHistory(row)">
                预览
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchGetVideoTaskList,
    fetchGetVideoTaskDetail,
    fetchGetVideoTaskResult,
    fetchSubmitVideoGeneration
  } from '@/api/video'

  defineOptions({ name: 'VideoGenPreview' })

  type VideoStatus = 'completed' | 'rendering'

  interface VideoItem {
    id: string
    name: string
    status: VideoStatus
    duration: string
    resolution: string
    format: string
    size: string
    style: string
    sourceShots: string[]
    fps: string
  }

  interface HistoryItem {
    version: string
    time: string
    style: string
    resolution: string
    fps: string
    status: 'completed' | 'failed'
    isCurrent?: boolean
  }

  const searchQuery = ref('')
  const statusFilter = ref<VideoStatus | ''>('')
  const selectedVideos = ref<VideoItem[]>([])
  const playVisible = ref(false)
  const compareVisible = ref(false)
  const regenerateVisible = ref(false)
  const historyVisible = ref(false)
  const regenerating = ref(false)
  const currentVideo = ref<VideoItem | null>(null)
  const downloadResolution = ref('1080p')
  const downloadFormat = ref('mp4')

  const pagination = reactive({
    current: 1,
    size: 12,
    total: 0
  })

  const qualityLabelMap: Record<number, string> = {
    1: '低画质',
    2: '较低画质',
    3: '标准画质',
    4: '高画质',
    5: '超高画质'
  }

  const regenerateForm = reactive({
    style: '写实风格',
    resolution: '1080p',
    fps: '24fps',
    format: 'MP4',
    quality: 3
  })

  const videoList = ref<VideoItem[]>([])
  const loading = ref(false)

  const loadVideoList = async () => {
    loading.value = true
    try {
      const res = await fetchGetVideoTaskList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchQuery.value || undefined,
        status: statusFilter.value || undefined
      })
      if (res) {
        videoList.value = (res.records || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          status: item.status === 'completed' ? 'completed' : 'rendering',
          duration: item.duration || '-',
          resolution: item.resolution || '-',
          format: item.format || '-',
          size: item.size || '-',
          style: item.style || '-',
          sourceShots: item.sourceShots || [],
          fps: item.fps || '-'
        })) as VideoItem[]
        pagination.total = res.total || 0
      }
    } catch {
      ElMessage.error('加载视频列表失败')
    } finally {
      loading.value = false
    }
  }

  const historyList = ref<HistoryItem[]>([
    {
      version: 'V3',
      time: '2024-06-19 14:20:00',
      style: '水墨风格',
      resolution: '2K',
      fps: '24fps',
      status: 'completed',
      isCurrent: true
    },
    {
      version: 'V2',
      time: '2024-06-18 10:15:00',
      style: '写实风格',
      resolution: '1080p',
      fps: '24fps',
      status: 'completed'
    },
    {
      version: 'V1',
      time: '2024-06-17 16:30:00',
      style: '卡通风格',
      resolution: '1080p',
      fps: '30fps',
      status: 'failed'
    }
  ])

  const selectedIds = computed(() => selectedVideos.value.map((v) => v.id))

  const filteredVideos = computed(() => {
    let result = videoList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    if (statusFilter.value) {
      result = result.filter((item) => item.status === statusFilter.value)
    }
    return result
  })

  const pagedVideos = computed(() => {
    const list = filteredVideos.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredVideos, (list) => {
    pagination.total = list.length
  })

  const handleSelectVideo = (video: VideoItem) => {
    const index = selectedVideos.value.findIndex((v) => v.id === video.id)
    if (index > -1) {
      selectedVideos.value.splice(index, 1)
    } else {
      selectedVideos.value.push(video)
    }
  }

  const handlePlayVideo = async (video: VideoItem) => {
    try {
      const detail = await fetchGetVideoTaskDetail(video.id)
      if (detail) {
        currentVideo.value = { ...video, ...detail } as VideoItem
      } else {
        currentVideo.value = video
      }
    } catch {
      currentVideo.value = video
    }
    playVisible.value = true
  }

  const handleDownload = (video: VideoItem) => {
    ElMessage.success(
      `开始下载「${video.name}」(${downloadResolution.value}.${downloadFormat.value})`
    )
  }

  const handleBatchDownload = () => {
    if (selectedVideos.value.length === 0) {
      ElMessage.warning('请先选择视频')
      return
    }
    ElMessage.success(`开始批量下载 ${selectedVideos.value.length} 个视频`)
    selectedVideos.value = []
  }

  const handleCompare = async (video: VideoItem) => {
    currentVideo.value = video
    try {
      const result = await fetchGetVideoTaskResult(video.id)
      if (result) {
        currentVideo.value = { ...video, ...(result as any) } as VideoItem
      }
    } catch {
      // 使用本地数据
    }
    compareVisible.value = true
  }

  const handleRegenerate = (video: VideoItem) => {
    currentVideo.value = video
    regenerateForm.style = video.style
    regenerateForm.resolution = video.resolution
    regenerateForm.fps = video.fps
    regenerateForm.format = video.format
    regenerateForm.quality = 3
    regenerateVisible.value = true
  }

  const handleConfirmRegenerate = async () => {
    if (!currentVideo.value) return
    regenerating.value = true
    try {
      await fetchSubmitVideoGeneration({
        name: currentVideo.value.name,
        style: regenerateForm.style,
        resolution: regenerateForm.resolution,
        fps: regenerateForm.fps,
        format: regenerateForm.format
      } as any)
      regenerateVisible.value = false
      ElMessage.success('重新生成任务已提交')
      await loadVideoList()
    } catch {
      ElMessage.error('重新生成任务提交失败')
    } finally {
      regenerating.value = false
    }
  }

  const handleDelete = (video: VideoItem) => {
    ElMessageBox.confirm(`确定要删除视频「${video.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      videoList.value = videoList.value.filter((v) => v.id !== video.id)
      selectedVideos.value = selectedVideos.value.filter((v) => v.id !== video.id)
      ElMessage.success('删除成功')
    })
  }

  onMounted(() => {
    loadVideoList()
  })

  const handleUseHistoryParams = (row: HistoryItem) => {
    regenerateForm.style = row.style
    regenerateForm.resolution = row.resolution
    regenerateForm.fps = row.fps
    ElMessage.success('已复用历史参数')
    historyVisible.value = false
  }

  const handlePreviewHistory = (row: HistoryItem) => {
    ElMessage.info(`预览历史版本 ${row.version}`)
  }
</script>

<style lang="scss" scoped>
  .video-list {
    padding-bottom: 16px;
  }

  .video-card {
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      transform: translateY(-2px);
    }

    &.selected {
      border: 2px solid var(--el-color-primary);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .video-cover {
    position: relative;
    height: 160px;
    overflow: hidden;
    border-radius: calc(var(--custom-radius) / 2 + 2px) calc(var(--custom-radius) / 2 + 2px) 0 0;

    .cover-placeholder {
      width: 100%;
      height: 100%;
      background: var(--el-fill-color-lighter);
      color: var(--el-text-color-secondary);
    }

    .cover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }

      &.rendering {
        opacity: 1;
        background: rgba(0, 0, 0, 0.3);
      }
    }

    .cover-check {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--el-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cover-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 12px;
    }
  }

  .video-info {
    padding: 12px;

    .video-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .video-meta {
      display: flex;
      align-items: center;
    }

    .video-source {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
    }

    .video-actions {
      padding-top: 8px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .video-player {
    .player-screen {
      width: 100%;
      height: 480px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      flex-direction: column;
    }

    .player-controls {
      padding-top: 12px;
    }
  }

  .compare-view {
    .compare-panel {
      .compare-label {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 12px;
        color: var(--el-text-color-primary);
      }

      .compare-content {
        width: 100%;
        height: 300px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
        margin-bottom: 16px;
        flex-direction: column;
      }

      .compare-shots,
      .compare-params {
        padding: 12px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
</style>
