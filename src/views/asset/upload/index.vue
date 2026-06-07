<template>
  <div class="asset-upload-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">素材上传</span>
            <ElTag type="info" size="small">支持图片、视频、音频、文档等格式</ElTag>
          </div>
          <ElSpace>
            <ElButton @click="handleClear">
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              清空列表
            </ElButton>
            <ElButton type="primary" :disabled="uploadList.length === 0" @click="handleBatchUpload">
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
              开始上传
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 上传区域 -->
      <ElUpload
        ref="uploadRef"
        v-model:file-list="uploadList"
        drag
        action="#"
        multiple
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        class="upload-area"
        accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mp3,.wav,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      >
        <div class="upload-placeholder">
          <ArtSvgIcon icon="ri:upload-cloud-2-line" class="upload-icon" />
          <div class="el-upload__text">
            <p>将文件拖到此处，或<em>点击上传</em></p>
            <p class="upload-tip">支持图片、视频、音频、文档等格式，单个文件不超过 500MB</p>
          </div>
        </div>
      </ElUpload>

      <!-- 文件列表 -->
      <div v-if="uploadList.length > 0" class="file-list-section">
        <div class="section-title flex-cb">
          <span>待上传文件 ({{ uploadList.length }})</span>
          <ElSpace>
            <ElButton link size="small" @click="handleSelectAll">
              {{ isAllSelected ? '取消全选' : '全选' }}
            </ElButton>
            <ElButton
              link
              size="small"
              type="danger"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchRemove"
            >
              删除选中
            </ElButton>
          </ElSpace>
        </div>
        <ElTable :data="uploadList" style="width: 100%" @selection-change="handleSelectionChange">
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div class="file-icon" :class="getFileTypeClass(row.name)">
                  <ArtSvgIcon :icon="getFileIcon(row.name)" />
                </div>
                <div>
                  <div class="font-medium">{{ row.name }}</div>
                  <div class="text-xs text-g-400">{{ formatSize(row.size || 0) }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="分类" width="160">
            <template #default="{ row }">
              <ElSelect
                v-model="row.category"
                placeholder="选择分类"
                size="small"
                style="width: 140px"
              >
                <ElOption
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </template>
          </ElTableColumn>
          <ElTableColumn label="标签" width="200">
            <template #default="{ row }">
              <ElSelect
                v-model="row.tags"
                multiple
                collapse-tags
                placeholder="添加标签"
                size="small"
                style="width: 180px"
              >
                <ElOption v-for="tag in tagOptions" :key="tag" :label="tag" :value="tag" />
              </ElSelect>
            </template>
          </ElTableColumn>
          <ElTableColumn label="描述" min-width="200">
            <template #default="{ row }">
              <ElInput v-model="row.description" placeholder="请输入描述" size="small" />
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="120">
            <template #default="{ row }">
              <ElTag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="进度" width="180">
            <template #default="{ row }">
              <ElProgress
                :percentage="row.progress || 0"
                :status="row.progress === 100 ? 'success' : ''"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="{ $index }">
              <ElButton type="danger" link size="small" @click="handleRemove($index)">
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import {
    fetchUploadAsset,
    fetchBatchUploadAssets,
    fetchInitChunkUpload,
    fetchUploadChunk,
    fetchCompleteChunkUpload
  } from '@/api/asset'
  import { useAssetProjectStore } from '@/store/modules/asset-project'

  defineOptions({ name: 'AssetUpload' })

  type AssetCategory = 'image' | 'video' | 'audio' | 'document' | 'ai-generated'

  interface UploadItem extends UploadFile {
    category?: AssetCategory
    tags?: string[]
    description?: string
    progress: number
  }

  const uploadRef = ref()
  const uploadList = ref<UploadItem[]>([])
  const selectedFiles = ref<UploadItem[]>([])

  const categoryOptions = [
    { label: '图片', value: 'image' },
    { label: '视频', value: 'video' },
    { label: '音频', value: 'audio' },
    { label: '文档', value: 'document' },
    { label: 'AI生成', value: 'ai-generated' }
  ]

  const tagOptions = [
    '角色',
    '场景',
    '道具',
    'UI',
    '特效',
    '背景',
    '封面',
    '片头',
    '片尾',
    '音效',
    '配乐'
  ]

  const isAllSelected = computed(() => {
    return uploadList.value.length > 0 && selectedFiles.value.length === uploadList.value.length
  })

  const getFileExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return ext
  }

  const getFileTypeClass = (filename: string): string => {
    const ext = getFileExtension(filename)
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv']
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
    if (imageExts.includes(ext)) return 'image'
    if (videoExts.includes(ext)) return 'video'
    if (audioExts.includes(ext)) return 'audio'
    if (docExts.includes(ext)) return 'document'
    return 'other'
  }

  const getFileIcon = (filename: string): string => {
    const cls = getFileTypeClass(filename)
    const map: Record<string, string> = {
      image: 'ri:image-line',
      video: 'ri:video-line',
      audio: 'ri:music-2-line',
      document: 'ri:file-text-line',
      other: 'ri:file-line'
    }
    return map[cls] || 'ri:file-line'
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  type ItemStatus = 'ready' | 'uploading' | 'success' | 'error'

  const getStatusType = (status?: ItemStatus): 'info' | 'primary' | 'success' | 'danger' => {
    const map: Record<ItemStatus, 'info' | 'primary' | 'success' | 'danger'> = {
      ready: 'info',
      uploading: 'primary',
      success: 'success',
      error: 'danger'
    }
    return map[status || 'ready']
  }

  const getStatusLabel = (status?: ItemStatus): string => {
    const map: Record<ItemStatus, string> = {
      ready: '待上传',
      uploading: '上传中',
      success: '已完成',
      error: '失败'
    }
    return map[status || 'ready']
  }

  const inferCategory = (filename: string): AssetCategory => {
    const cls = getFileTypeClass(filename)
    const map: Record<string, AssetCategory> = {
      image: 'image',
      video: 'video',
      audio: 'audio',
      document: 'document',
      other: 'document'
    }
    return map[cls] || 'document'
  }

  const handleFileChange = (uploadFile: UploadFile) => {
    const item = uploadFile as UploadItem
    if (!item.category) {
      item.category = inferCategory(item.name)
    }
    if (!item.tags) {
      item.tags = []
    }
    if (!item.description) {
      item.description = ''
    }
    item.progress = 0
  }

  const handleFileRemove = () => {
    // file-list 已双向绑定
  }

  const handleSelectionChange = (selection: UploadItem[]) => {
    selectedFiles.value = selection
  }

  const handleSelectAll = () => {
    // Element Plus table toggleAllSelection 需要通过 ref 调用
    // 这里简化处理
  }

  const handleRemove = (index: number) => {
    uploadList.value.splice(index, 1)
  }

  const handleBatchRemove = () => {
    if (selectedFiles.value.length === 0) return
    ElMessageBox.confirm(`确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const names = selectedFiles.value.map((f) => f.name)
      uploadList.value = uploadList.value.filter((item) => !names.includes(item.name))
      selectedFiles.value = []
      ElMessage.success('删除成功')
    })
  }

  const handleClear = () => {
    if (uploadList.value.length === 0) return
    ElMessageBox.confirm('确定要清空所有待上传文件吗？', '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      uploadList.value = []
      selectedFiles.value = []
      ElMessage.success('已清空')
    })
  }

  const CHUNK_SIZE = 5 * 1024 * 1024
  const projectStore = useAssetProjectStore()
  const projectId = computed(() => projectStore.currentProjectId || '')

  const uploadSingleFile = async (item: UploadItem) => {
    const file = item.raw
    if (!file) return
    if (file.size > CHUNK_SIZE) {
      try {
        const initRes = await fetchInitChunkUpload(projectId.value, {
          fileName: file.name,
          fileSize: file.size,
          assetType: item.category,
          category: item.category
        })
        const uploadId = (initRes as any)?.uploadId || ''
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE
          const end = Math.min(start + CHUNK_SIZE, file.size)
          const chunk = file.slice(start, end)
          await fetchUploadChunk(projectId.value, {
            uploadId,
            chunkNumber: i + 1,
            chunk: chunk as any
          })
          item.progress = Math.round(((i + 1) / totalChunks) * 100)
        }
        await fetchCompleteChunkUpload(projectId.value, { uploadId })
        item.status = 'success' as any
      } catch {
        item.status = 'error' as any
      }
    } else {
      try {
        await fetchUploadAsset(projectId.value, {
          file: file as any,
          assetName: item.name,
          assetType: item.category,
          category: item.category,
          tags: item.tags
        })
        item.status = 'success' as any
        item.progress = 100
      } catch {
        item.status = 'error' as any
      }
    }
  }

  const handleBatchUpload = async () => {
    const readyItems = uploadList.value.filter((item) => (item.status as string) === 'ready')
    if (readyItems.length === 0) {
      ElMessage.warning('没有待上传的文件')
      return
    }
    try {
      const files = readyItems.map((item) => ({
        file: item.raw as any,
        assetName: item.name,
        assetType: item.category,
        category: item.category,
        tags: item.tags
      }))
      await fetchBatchUploadAssets(projectId.value, { files } as any)
      readyItems.forEach((item) => {
        item.status = 'success' as any
        item.progress = 100
      })
      ElMessage.success('批量上传成功')
    } catch {
      readyItems.forEach((item) => {
        item.status = 'uploading' as any
        uploadSingleFile(item)
      })
      ElMessage.success('开始上传')
    }
  }
</script>

<style lang="scss" scoped>
  .upload-area {
    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 40px 20px;
    }
  }

  .upload-placeholder {
    text-align: center;

    .upload-icon {
      margin-bottom: 12px;
      font-size: 48px;
      color: var(--el-text-color-placeholder);
    }

    .upload-tip {
      margin-top: 8px;
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
  }

  .file-list-section {
    margin-top: 24px;

    .section-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .file-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 8px;

    &.image {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.video {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.audio {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }

    &.document {
      color: var(--el-color-info);
      background: var(--el-color-info-light-9);
    }

    &.other {
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color-lighter);
    }
  }
</style>
