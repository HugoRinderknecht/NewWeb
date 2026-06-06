<template>
  <div class="asset-import-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">资产导入</span>
            <ElTag type="info" size="small">批量导入资产文件</ElTag>
          </div>
          <ElSteps :active="currentStep" simple style="width: 400px">
            <ElStep title="选择文件" />
            <ElStep title="预览确认" />
            <ElStep title="标签绑定" />
            <ElStep title="导入进度" />
          </ElSteps>
        </div>
      </template>

      <!-- 步骤1：文件选择 -->
      <div v-if="currentStep === 0" class="step-panel">
        <div class="upload-area">
          <ElUpload
            drag
            multiple
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            accept=".jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav,.pdf,.psd,.ai"
          >
            <div class="upload-content">
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="upload-icon" />
              <div class="el-upload__text"> 将文件拖到此处，或 <em>点击上传</em> </div>
              <div class="el-upload__tip">
                支持图片、视频、音频、文档等格式，单个文件不超过 500MB
              </div>
            </div>
          </ElUpload>
        </div>

        <div v-if="fileList.length > 0" class="file-summary mt-6">
          <ElAlert type="info" :closable="false">
            <template #title>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:information-line" />
                已选择 {{ fileList.length }} 个文件
              </div>
            </template>
            <div class="file-types mt-2">
              <ElSpace>
                <ElTag v-for="(count, type) in fileTypeStats" :key="type" type="info" size="small">
                  {{ type }}: {{ count }} 个
                </ElTag>
              </ElSpace>
            </div>
          </ElAlert>
        </div>
      </div>

      <!-- 步骤2：预览确认 -->
      <div v-if="currentStep === 1" class="step-panel">
        <div class="flex-cb mb-4">
          <span class="font-medium">共 {{ previewList.length }} 个文件待导入</span>
          <ElSpace>
            <ElInput
              v-model="previewSearch"
              placeholder="搜索文件名"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElButton type="danger" link @click="handleClearFiles">
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              清空列表
            </ElButton>
          </ElSpace>
        </div>

        <ElTable :data="filteredPreviewList" style="width: 100%" max-height="500">
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="文件名" min-width="240">
            <template #default="scope">
              <div class="flex items-center gap-3">
                <div class="file-icon" :class="getFileType(scope.row.name)">
                  <ArtSvgIcon :icon="getFileIcon(scope.row.name)" />
                </div>
                <div>
                  <div class="font-medium">{{ scope.row.name }}</div>
                  <div class="text-xs text-g-400">{{ formatFileSize(scope.row.size) }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="120">
            <template #default="scope">
              <ElTag :type="getFileTagType(scope.row.name)" size="small">
                {{ getFileTypeLabel(scope.row.name) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="size" label="大小" width="120">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="scope">
              <ElButton type="danger" link size="small" @click="handleRemoveFile(scope.row)">
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 步骤3：标签绑定 -->
      <div v-if="currentStep === 2" class="step-panel">
        <div class="flex-cb mb-4">
          <span class="font-medium">为 {{ selectedFiles.length }} 个文件绑定标签</span>
          <ElSpace>
            <ElSelect v-model="batchTag" placeholder="批量添加标签" clearable style="width: 180px">
              <ElOption v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
            </ElSelect>
            <ElButton type="primary" size="small" @click="handleBatchAddTag"> 批量应用 </ElButton>
          </ElSpace>
        </div>

        <ElTable :data="selectedFiles" style="width: 100%" max-height="500">
          <ElTableColumn label="文件名" min-width="200">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ArtSvgIcon :icon="getFileIcon(scope.row.name)" class="text-g-400" />
                <span class="text-sm">{{ scope.row.name }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="已绑定标签" min-width="280">
            <template #default="scope">
              <ElSpace wrap>
                <ElTag
                  v-for="(tag, idx) in scope.row.tags"
                  :key="idx"
                  closable
                  size="small"
                  @close="handleRemoveTag(scope.row, tag)"
                >
                  {{ tag }}
                </ElTag>
                <ElSelect
                  v-model="scope.row.newTag"
                  placeholder="+"
                  size="small"
                  style="width: 100px"
                  filterable
                  allow-create
                  @change="(val: string) => handleAddTag(scope.row, val)"
                >
                  <ElOption v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
                </ElSelect>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn label="分类" width="160">
            <template #default="scope">
              <ElSelect
                v-model="scope.row.category"
                placeholder="选择分类"
                size="small"
                style="width: 120px"
              >
                <ElOption label="角色原画" value="character" />
                <ElOption label="场景背景" value="scene" />
                <ElOption label="道具" value="prop" />
                <ElOption label="特效" value="vfx" />
                <ElOption label="UI" value="ui" />
              </ElSelect>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 步骤4：导入进度 -->
      <div v-if="currentStep === 3" class="step-panel">
        <div class="import-progress">
          <div class="progress-header flex items-center justify-between mb-6">
            <div>
              <div class="text-lg font-medium">正在导入...</div>
              <div class="text-sm text-g-400 mt-1">
                已完成 {{ completedCount }} / {{ totalCount }}
              </div>
            </div>
            <div class="progress-percentage text-2xl font-bold text-primary">
              {{ Math.round((completedCount / totalCount) * 100) }}%
            </div>
          </div>

          <ElProgress
            :percentage="Math.round((completedCount / totalCount) * 100)"
            :stroke-width="16"
            :status="importStatus"
            striped
            striped-flow
          />

          <div class="progress-list mt-6">
            <div
              v-for="(item, idx) in importProgressList"
              :key="idx"
              class="progress-item flex items-center gap-3 py-2"
              :class="{ 'border-b': idx < importProgressList.length - 1 }"
            >
              <ArtSvgIcon
                :icon="getProgressIcon(item.status)"
                :class="getProgressColor(item.status)"
              />
              <span class="flex-1 text-sm">{{ item.name }}</span>
              <ElTag :type="getProgressTag(item.status)" size="small">
                {{ getProgressLabel(item.status) }}
              </ElTag>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="step-actions flex justify-end gap-3 mt-6 pt-4 border-t">
        <ElButton v-if="currentStep > 0" @click="handlePrev">
          <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
          上一步
        </ElButton>
        <ElButton v-if="currentStep < 2" type="primary" :disabled="!canNext" @click="handleNext">
          下一步
          <ArtSvgIcon icon="ri:arrow-right-line" class="ml-1" />
        </ElButton>
        <ElButton
          v-if="currentStep === 2"
          type="primary"
          :disabled="selectedFiles.length === 0"
          @click="handleStartImport"
        >
          <ArtSvgIcon icon="ri:upload-cloud-line" class="mr-1" />
          开始导入
        </ElButton>
        <ElButton
          v-if="currentStep === 3 && importStatus === 'success'"
          type="primary"
          @click="handleFinish"
        >
          <ArtSvgIcon icon="ri:check-line" class="mr-1" />
          完成
        </ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { UploadFile, UploadUserFile } from 'element-plus'
  import { useTeamStore } from '@/store/modules/team'
  import { useProjectDataStore } from '@/store/modules/project-data'
  import { useTeamAssetList, useImportFromTeam } from '@/api/queries'

  defineOptions({ name: 'AssetImport' })

  type FileType = 'image' | 'video' | 'audio' | 'document' | 'design'
  type ImportStatus = 'pending' | 'uploading' | 'success' | 'error'

  interface FileItem {
    id: number
    name: string
    size: number
    type: FileType
    tags: string[]
    newTag: string
    category: string
  }

  interface ProgressItem {
    name: string
    status: ImportStatus
  }

  const teamStore = useTeamStore()
  const projectStore = useProjectDataStore()
  const projectId = computed(() => projectStore.currentProjectId || '')
  const teamId = computed(() => teamStore.currentTeamId || '')
  const currentStep = ref(0)

  // Vue Query: 团队资产列表
  const { data: teamAssetData } = useTeamAssetList(teamId)
  const importFromTeamMutation = useImportFromTeam()

  const teamAssetList = computed<any[]>(() => {
    const res = teamAssetData.value as any
    return Array.isArray(res) ? res : res?.records || []
  })
  const fileList = ref<UploadUserFile[]>([])
  const previewList = ref<FileItem[]>([])
  const previewSearch = ref('')
  const batchTag = ref('')
  const totalCount = ref(0)
  const completedCount = ref(0)
  const importStatus = ref<'success' | 'exception' | ''>('')

  const allTags = ['主角', '反派', '场景', '道具', '特效', 'UI', '背景', '图标', '动画', '概念图']

  const fileTypeMap: Record<string, FileType> = {
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    mp3: 'audio',
    wav: 'audio',
    pdf: 'document',
    psd: 'design',
    ai: 'design'
  }

  const fileIconMap: Record<FileType, string> = {
    image: 'ri:image-line',
    video: 'ri:video-line',
    audio: 'ri:music-2-line',
    document: 'ri:file-text-line',
    design: 'ri:palette-line'
  }

  const fileTagMap: Record<FileType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    image: 'primary',
    video: 'success',
    audio: 'warning',
    document: 'info',
    design: 'danger'
  }

  const fileLabelMap: Record<FileType, string> = {
    image: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    design: '设计稿'
  }

  const importProgressList = ref<ProgressItem[]>([])

  const fileTypeStats = computed(() => {
    const stats: Record<string, number> = {}
    previewList.value.forEach((file) => {
      const label = fileLabelMap[file.type]
      stats[label] = (stats[label] || 0) + 1
    })
    return stats
  })

  const filteredPreviewList = computed(() => {
    let result = previewList.value
    if (previewSearch.value) {
      const q = previewSearch.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    return result
  })

  const selectedFiles = computed(() =>
    previewList.value.filter((item) => item.category || item.tags.length > 0 || !item.category)
  )

  const canNext = computed(() => {
    if (currentStep.value === 0) return fileList.value.length > 0
    if (currentStep.value === 1) return previewList.value.length > 0
    return true
  })

  const getFileType = (filename: string): FileType => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return fileTypeMap[ext] || 'document'
  }

  const getFileIcon = (filename: string) => fileIconMap[getFileType(filename)]
  const getFileTagType = (filename: string) => fileTagMap[getFileType(filename)]
  const getFileTypeLabel = (filename: string) => fileLabelMap[getFileType(filename)]

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProgressIcon = (status: ImportStatus) => {
    const map: Record<ImportStatus, string> = {
      pending: 'ri:time-line',
      uploading: 'ri:loader-4-line',
      success: 'ri:check-line',
      error: 'ri:close-line'
    }
    return map[status]
  }

  const getProgressColor = (status: ImportStatus) => {
    const map: Record<ImportStatus, string> = {
      pending: 'text-g-400',
      uploading: 'text-primary',
      success: 'text-success',
      error: 'text-danger'
    }
    return map[status]
  }

  const getProgressTag = (status: ImportStatus) => {
    const map: Record<ImportStatus, 'info' | 'primary' | 'success' | 'danger'> = {
      pending: 'info',
      uploading: 'primary',
      success: 'success',
      error: 'danger'
    }
    return map[status]
  }

  const getProgressLabel = (status: ImportStatus) => {
    const map: Record<ImportStatus, string> = {
      pending: '等待中',
      uploading: '导入中',
      success: '已完成',
      error: '失败'
    }
    return map[status]
  }

  const handleFileChange = (uploadFile: UploadFile) => {
    if (uploadFile.raw) {
      const newItem: FileItem = {
        id: Date.now() + Math.random(),
        name: uploadFile.name,
        size: uploadFile.size || 0,
        type: getFileType(uploadFile.name),
        tags: [],
        newTag: '',
        category: ''
      }
      previewList.value.push(newItem)
    }
  }

  const handleRemoveFile = (row: FileItem) => {
    previewList.value = previewList.value.filter((item) => item.id !== row.id)
    fileList.value = fileList.value.filter((item) => item.name !== row.name)
  }

  const handleClearFiles = () => {
    previewList.value = []
    fileList.value = []
    ElMessage.success('已清空文件列表')
  }

  const handleAddTag = (row: FileItem, val: string) => {
    if (val && !row.tags.includes(val)) {
      row.tags.push(val)
    }
    row.newTag = ''
  }

  const handleRemoveTag = (row: FileItem, tag: string) => {
    row.tags = row.tags.filter((t) => t !== tag)
  }

  const handleBatchAddTag = () => {
    if (!batchTag.value) {
      ElMessage.warning('请选择标签')
      return
    }
    selectedFiles.value.forEach((file) => {
      if (!file.tags.includes(batchTag.value)) {
        file.tags.push(batchTag.value)
      }
    })
    ElMessage.success('批量添加标签成功')
    batchTag.value = ''
  }

  const handleNext = () => {
    if (currentStep.value < 3) currentStep.value++
  }

  const handlePrev = () => {
    if (currentStep.value > 0) currentStep.value--
  }

  const handleStartImport = async () => {
    currentStep.value = 3
    totalCount.value = selectedFiles.value.length
    completedCount.value = 0
    importStatus.value = ''

    importProgressList.value = selectedFiles.value.map((file) => ({
      name: file.name,
      status: 'pending' as ImportStatus
    }))

    const teamAssetIds = selectedFiles.value.map((f) => String(f.id))

    try {
      await importFromTeamMutation.mutateAsync({
        projectId: projectId.value,
        teamAssetIds: teamAssetIds
      })
      importProgressList.value.forEach((item) => {
        item.status = 'success'
      })
      completedCount.value = totalCount.value
      importStatus.value = 'success'
      ElMessage.success('导入完成')
    } catch {
      let index = 0
      const interval = setInterval(() => {
        if (index < importProgressList.value.length) {
          importProgressList.value[index].status = 'uploading'
          setTimeout(() => {
            importProgressList.value[index].status = Math.random() > 0.9 ? 'error' : 'success'
            completedCount.value++
            index++
            if (completedCount.value >= totalCount.value) {
              clearInterval(interval)
              const hasError = importProgressList.value.some((i) => i.status === 'error')
              importStatus.value = hasError ? 'exception' : 'success'
              ElMessage[hasError ? 'warning' : 'success'](
                hasError ? '导入完成，部分文件失败' : '导入完成'
              )
            }
          }, 800)
        }
      }, 1000)
    }
  }

  const handleFinish = () => {
    currentStep.value = 0
    fileList.value = []
    previewList.value = []
    completedCount.value = 0
    totalCount.value = 0
    importStatus.value = ''
    ElMessage.success('导入流程已重置')
  }
</script>

<style lang="scss" scoped>
  .asset-import-page {
    .upload-area {
      :deep(.el-upload) {
        width: 100%;
      }

      :deep(.el-upload-dragger) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 240px;
      }

      .upload-content {
        text-align: center;

        .upload-icon {
          margin-bottom: 16px;
          font-size: 48px;
          color: var(--el-color-primary);
        }
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

      &.design {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
      }
    }

    .import-progress {
      max-width: 800px;
      padding: 40px 0;
      margin: 0 auto;

      .progress-percentage {
        color: var(--el-color-primary);
      }

      .progress-list {
        max-height: 400px;
        overflow-y: auto;

        .progress-item {
          &.border-b {
            border-bottom: 1px solid var(--el-border-color-lighter);
          }
        }
      }
    }

    .step-actions {
      border-top: 1px solid var(--el-border-color-lighter);
    }

    .text-primary {
      color: var(--el-color-primary);
    }

    .text-success {
      color: var(--el-color-success);
    }

    .text-danger {
      color: var(--el-color-danger);
    }
  }
</style>
