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
              <ElOption label="已完成" value="succeeded" />
              <ElOption label="生成中" value="running" />
              <ElOption label="排队中" value="queued" />
              <ElOption label="失败" value="failed" />
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
                  v-if="video.status === 'succeeded'"
                  class="cover-overlay flex-cc"
                  @click.stop="handlePlayVideo(video)"
                >
                  <ArtSvgIcon icon="ri:play-circle-line" class="text-5xl text-white" />
                </div>
                <div
                  v-if="video.status === 'running' || video.status === 'queued'"
                  class="cover-overlay rendering flex-cc"
                >
                  <ElIcon class="is-loading">
                    <ArtSvgIcon icon="ri:loader-4-line" class="text-3xl text-white" />
                  </ElIcon>
                </div>
                <div class="cover-check" v-if="selectedIds.includes(video.id)">
                  <ArtSvgIcon icon="ri:check-fill" class="text-white" />
                </div>
                <div class="cover-duration">{{ video.duration }}s</div>
              </div>
              <div class="video-info">
                <div class="flex-cb mb-2">
                  <span class="video-name font-medium">{{ video.name || video.id }}</span>
                  <ElTag
                    :type="
                      video.status === 'succeeded'
                        ? 'success'
                        : video.status === 'failed'
                          ? 'danger'
                          : 'warning'
                    "
                    size="small"
                  >
                    {{ statusLabelMap[video.status] || video.status }}
                  </ElTag>
                </div>
                <div class="video-meta mb-2">
                  <ElSpace wrap>
                    <span class="text-xs text-g-400">{{ video.resolution }}</span>
                    <span class="text-xs text-g-400">{{ video.ratio }}</span>
                    <span class="text-xs text-g-400" v-if="video.fileSize">{{
                      video.fileSize
                    }}</span>
                  </ElSpace>
                </div>
                <div class="video-source mb-2" v-if="video.storyboardId">
                  <span class="text-xs text-g-400">来源分镜：</span>
                  <ElTag size="small">{{ video.storyboardId }}</ElTag>
                </div>
                <div class="video-actions flex-cb">
                  <ElSpace>
                    <ElButton
                      v-if="video.status === 'succeeded'"
                      type="primary"
                      link
                      size="small"
                      @click="handlePlayVideo(video)"
                    >
                      <ArtSvgIcon icon="ri:play-line" class="mr-1" />
                      播放
                    </ElButton>
                    <ElButton
                      v-if="video.status === 'succeeded'"
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
      :title="currentVideo?.name || currentVideo?.id"
      width="900px"
      align-center
      destroy-on-close
    >
      <div v-if="currentVideo" class="video-player">
        <div v-if="currentVideo.videoUrl" class="player-screen">
          <video :src="currentVideo.videoUrl" controls class="w-full" style="max-height: 480px" />
        </div>
        <div v-else class="player-screen flex-cc">
          <ArtSvgIcon icon="ri:video-line" class="text-6xl text-g-400" />
          <p class="mt-4 text-g-400">视频加载中...</p>
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
              <ElOption label="480p" value="480p" />
              <ElOption label="720p" value="720p" />
              <ElOption label="1080p" value="1080p" />
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
              <div class="compare-shots" v-if="currentVideo.storyboardId">
                <div class="text-sm font-medium mb-2">分镜ID</div>
                <ElTag size="small">{{ currentVideo.storyboardId }}</ElTag>
              </div>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="compare-panel">
              <div class="compare-label">生成视频</div>
              <div class="compare-content flex-cc">
                <div v-if="currentVideo.videoUrl" class="text-center w-full">
                  <video
                    :src="currentVideo.videoUrl"
                    controls
                    class="w-full"
                    style="max-height: 280px"
                  />
                </div>
                <div v-else class="text-center">
                  <ArtSvgIcon icon="ri:video-line" class="text-5xl text-g-400" />
                  <p class="mt-2 text-g-400">视频预览占位</p>
                </div>
              </div>
              <div class="compare-params">
                <div class="text-sm font-medium mb-2">生成参数</div>
                <ElDescriptions :column="2" border size="small">
                  <ElDescriptionsItem label="模型">{{ currentVideo.model }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="分辨率">{{
                    currentVideo.resolution
                  }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="时长">{{ currentVideo.duration }}s</ElDescriptionsItem>
                  <ElDescriptionsItem label="宽高比">{{ currentVideo.ratio }}</ElDescriptionsItem>
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
          基于任务「{{ currentVideo?.name || currentVideo?.id }}」的参数重新生成，您可以调整以下参数
        </ElAlert>
        <ElFormItem label="模型">
          <ElSelect v-model="regenerateForm.model" placeholder="请选择模型" class="w-full">
            <ElOption label="Seedance 2.0 (标准)" value="doubao-seedance-2-0-260128" />
            <ElOption label="Seedance 2.0 Fast (快速)" value="doubao-seedance-2-0-fast-260128" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="分辨率">
          <ElSelect v-model="regenerateForm.resolution" placeholder="请选择分辨率" class="w-full">
            <ElOption label="480p" value="480p" />
            <ElOption label="720p" value="720p" />
            <ElOption label="1080p" value="1080p" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="宽高比">
          <ElSelect v-model="regenerateForm.ratio" placeholder="请选择宽高比" class="w-full">
            <ElOption label="自适应" value="adaptive" />
            <ElOption label="16:9" value="16:9" />
            <ElOption label="4:3" value="4:3" />
            <ElOption label="1:1" value="1:1" />
            <ElOption label="3:4" value="3:4" />
            <ElOption label="9:16" value="9:16" />
            <ElOption label="21:9" value="21:9" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时长(秒)">
          <ElInputNumber v-model="regenerateForm.duration" :min="4" :max="15" class="w-full" />
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
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchGetVideoTaskList,
    fetchGetVideoTaskDetail,
    fetchGetVideoTaskResult,
    fetchCancelVideoTask,
    fetchSubmitVideoGeneration,
    fetchPreviewVideoGeneration
  } from '@/api/video'

  defineOptions({ name: 'VideoGenPreview' })

  type VideoStatus = Api.Video.VideoTaskStatus

  type VideoItem = Api.Video.VideoTask

  const route = useRoute()
  const projectId = computed(
    () => (route.params.projectId as string) || (route.query.projectId as string) || ''
  )

  const searchQuery = ref('')
  const statusFilter = ref<VideoStatus | ''>('')
  const selectedVideos = ref<VideoItem[]>([])
  const playVisible = ref(false)
  const compareVisible = ref(false)
  const regenerateVisible = ref(false)
  const regenerating = ref(false)
  const currentVideo = ref<VideoItem | null>(null)
  const downloadResolution = ref('720p')

  const pagination = reactive({
    current: 1,
    size: 12,
    total: 0
  })

  const statusLabelMap: Record<string, string> = {
    queued: '排队中',
    running: '生成中',
    succeeded: '已完成',
    failed: '失败',
    cancelled: '已取消',
    expired: '已过期'
  }

  const regenerateForm = reactive({
    model: 'doubao-seedance-2-0-260128',
    resolution: '720p',
    ratio: 'adaptive',
    duration: 5
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
        status: statusFilter.value || undefined,
        projectId: projectId.value || undefined
      })
      if (res) {
        videoList.value = (res.records || []) as VideoItem[]
        pagination.total = res.total || 0
      }
    } catch {
      ElMessage.error('加载视频列表失败')
    } finally {
      loading.value = false
    }
  }

  const selectedIds = computed(() => selectedVideos.value.map((v) => v.id))

  const filteredVideos = computed(() => {
    let result = videoList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => (item.name || '').toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      )
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
        currentVideo.value = { ...video, ...detail }
      } else {
        currentVideo.value = video
      }
      // 获取视频URL
      if (video.status === 'succeeded') {
        const result = await fetchGetVideoTaskResult(video.id, {
          resolution: downloadResolution.value
        })
        if (result?.videoUrl && currentVideo.value) {
          currentVideo.value = { ...currentVideo.value, videoUrl: result.videoUrl }
        }
      }
    } catch {
      currentVideo.value = video
    }
    playVisible.value = true
  }

  const handleDownload = async (video: VideoItem | null) => {
    if (!video) return
    try {
      const result = await fetchGetVideoTaskResult(video.id, {
        resolution: downloadResolution.value
      })
      if (result?.videoUrl) {
        window.open(result.videoUrl, '_blank')
        ElMessage.success(`开始下载「${video.name || video.id}」`)
      } else {
        ElMessage.warning('暂无可下载的视频文件')
      }
    } catch {
      ElMessage.error('获取下载链接失败')
    }
  }

  const handleBatchDownload = async () => {
    if (selectedVideos.value.length === 0) {
      ElMessage.warning('请先选择视频')
      return
    }
    for (const video of selectedVideos.value) {
      try {
        const result = await fetchGetVideoTaskResult(video.id)
        if (result?.videoUrl) {
          window.open(result.videoUrl, '_blank')
        }
      } catch {
        // 跳过失败的
      }
    }
    ElMessage.success(`开始批量下载 ${selectedVideos.value.length} 个视频`)
    selectedVideos.value = []
  }

  const handleCompare = async (video: VideoItem) => {
    currentVideo.value = video
    try {
      const result = await fetchGetVideoTaskResult(video.id)
      if (result?.videoUrl && currentVideo.value) {
        currentVideo.value = { ...currentVideo.value, videoUrl: result.videoUrl }
      }
    } catch {
      // 使用本地数据
    }
    compareVisible.value = true
  }

  const handleRegenerate = (video: VideoItem) => {
    currentVideo.value = video
    regenerateForm.model = video.model || 'doubao-seedance-2-0-260128'
    regenerateForm.resolution = video.resolution || '720p'
    regenerateForm.ratio = video.ratio || 'adaptive'
    regenerateForm.duration = video.duration || 5
    regenerateVisible.value = true
  }

  const handleConfirmRegenerate = async () => {
    if (!currentVideo.value) return
    regenerating.value = true
    try {
      // 1. 先调用预览接口获取 previewToken
      const previewParams: Api.Video.VideoPreviewParams = {
        model: regenerateForm.model,
        resolution: regenerateForm.resolution,
        ratio: regenerateForm.ratio,
        duration: regenerateForm.duration,
        projectId: currentVideo.value.projectId,
        storyboardId: currentVideo.value.storyboardId
      }
      const previewResult = await fetchPreviewVideoGeneration(previewParams)
      const previewToken = previewResult?.previewToken
      if (!previewToken) {
        ElMessage.error('预览确认失败，未获取到 previewToken')
        return
      }

      // 2. 提交生成任务
      await fetchSubmitVideoGeneration({
        ...previewParams,
        previewToken
      })
      regenerateVisible.value = false
      ElMessage.success('重新生成任务已提交')
      await loadVideoList()
    } catch {
      ElMessage.error('重新生成任务提交失败')
    } finally {
      regenerating.value = false
    }
  }

  const handleDelete = async (video: VideoItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除视频「${video.name || video.id}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchCancelVideoTask(video.id)
      videoList.value = videoList.value.filter((v) => v.id !== video.id)
      selectedVideos.value = selectedVideos.value.filter((v) => v.id !== video.id)
      ElMessage.success('删除成功')
    } catch {
      // 用户取消
    }
  }

  onMounted(() => {
    loadVideoList()
  })
</script>

<style lang="scss" scoped>
  .video-list {
    padding-bottom: 16px;
  }

  .video-card {
    position: relative;
    cursor: pointer;
    transition: all 0.2s;

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
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-lighter);
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      cursor: pointer;
      background: rgb(0 0 0 / 40%);
      opacity: 0;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }

      &.rendering {
        background: rgb(0 0 0 / 30%);
        opacity: 1;
      }
    }

    .cover-check {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--el-color-primary);
      border-radius: 50%;
    }

    .cover-duration {
      position: absolute;
      right: 8px;
      bottom: 8px;
      padding: 2px 8px;
      font-size: 12px;
      color: white;
      background: rgb(0 0 0 / 60%);
      border-radius: 4px;
    }
  }

  .video-info {
    padding: 12px;

    .video-name {
      overflow: hidden;
      font-size: 14px;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .video-meta {
      display: flex;
      align-items: center;
    }

    .video-source {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }

    .video-actions {
      padding-top: 8px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .video-player {
    .player-screen {
      width: 100%;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }

    .player-controls {
      padding-top: 12px;
    }
  }

  .compare-view {
    .compare-panel {
      .compare-label {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .compare-content {
        flex-direction: column;
        width: 100%;
        height: 300px;
        margin-bottom: 16px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
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
