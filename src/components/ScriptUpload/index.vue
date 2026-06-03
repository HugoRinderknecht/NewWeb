<template>
  <div class="script-upload-component">
    <!-- 上传按钮触发器 -->
    <ElButton
      v-if="triggerType === 'button'"
      :type="buttonType"
      :size="buttonSize"
      @click="handleOpenDialog"
    >
      <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
      {{ buttonText }}
    </ElButton>

    <ElButton
      v-else-if="triggerType === 'icon'"
      :type="buttonType"
      link
      :size="buttonSize"
      @click="handleOpenDialog"
    >
      <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
      {{ buttonText }}
    </ElButton>

    <!-- 上传弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <div class="upload-dialog-content">
        <!-- 文件上传区域 -->
        <ElUpload
          ref="uploadRef"
          v-model:file-list="fileList"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :accept="acceptTypes"
          :limit="1"
          class="script-upload-area"
        >
          <div v-if="fileList.length === 0" class="upload-placeholder">
            <ArtSvgIcon icon="ri:upload-cloud-2-line" class="upload-icon" />
            <div class="upload-text">
              <p>将剧本文件拖到此处，或<em>点击上传</em></p>
              <p class="upload-tip">
                支持 {{ acceptTypesLabel }} 格式，单个文件不超过 {{ formatMaxSize }}
              </p>
            </div>
          </div>
          <div v-else class="upload-file-info">
            <div class="file-icon" :class="getFileTypeClass(fileList[0].name)">
              <ArtSvgIcon :icon="getFileIcon(fileList[0].name)" />
            </div>
            <div class="file-details">
              <div class="file-name">{{ fileList[0].name }}</div>
              <div class="file-size">{{ formatSize(fileList[0].size || 0) }}</div>
            </div>
            <ElButton type="danger" link size="small" @click.stop="handleClearFile">
              <ArtSvgIcon icon="ri:delete-bin-line" />
            </ElButton>
          </div>
        </ElUpload>

        <!-- 上传进度 -->
        <div v-if="uploadStatus === 'uploading'" class="upload-progress-section">
          <div class="progress-header flex-cb">
            <span class="progress-title">上传进度</span>
            <span class="progress-percentage">{{ uploadProgress }}%</span>
          </div>
          <ElProgress
            :percentage="uploadProgress"
            :status="uploadProgress === 100 ? 'success' : ''"
            :stroke-width="8"
            class="upload-progress-bar"
          />
          <div class="progress-status">
            <ArtSvgIcon icon="ri:loader-4-line" class="animate-spin mr-1" />
            正在上传，请稍候...
          </div>
        </div>

        <!-- 成功状态 -->
        <div v-if="uploadStatus === 'success'" class="upload-result success">
          <div class="result-icon">
            <ArtSvgIcon icon="ri:check-circle-line" />
          </div>
          <div class="result-title">上传成功</div>
          <div class="result-desc">文件「{{ uploadedFileName }}」已成功上传</div>
          <div v-if="parsedContent" class="parsed-content-preview">
            <div class="preview-title">内容预览</div>
            <div class="preview-text">{{ parsedContent.substring(0, 200) }}...</div>
          </div>
        </div>

        <!-- 失败状态 -->
        <div v-if="uploadStatus === 'error'" class="upload-result error">
          <div class="result-icon">
            <ArtSvgIcon icon="ri:error-warning-line" />
          </div>
          <div class="result-title">上传失败</div>
          <div class="result-desc">{{ errorMessage }}</div>
        </div>

        <!-- 文件信息表单 -->
        <ElForm
          v-if="uploadStatus !== 'uploading'"
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
          class="upload-form"
        >
          <ElFormItem label="剧本名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入剧本名称" />
          </ElFormItem>
          <ElFormItem label="剧本类型">
            <ElSelect v-model="formData.type" placeholder="请选择剧本类型" class="w-full">
              <ElOption label="动画剧本" value="animation" />
              <ElOption label="影视剧本" value="film" />
              <ElOption label="广告剧本" value="ad" />
              <ElOption label="短剧剧本" value="short" />
              <ElOption label="舞台剧剧本" value="stage" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="剧本简介">
            <ElInput
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入剧本简介"
            />
          </ElFormItem>
        </ElForm>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleClose">取消</ElButton>
          <ElButton v-if="uploadStatus === 'success'" type="primary" @click="handleConfirm">
            确认导入
          </ElButton>
          <ElButton
            v-else-if="uploadStatus !== 'uploading'"
            type="primary"
            :disabled="fileList.length === 0 || uploadStatus === 'error'"
            @click="handleUpload"
          >
            开始上传
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'

  defineOptions({ name: 'ScriptUpload' })

  interface Props {
    triggerType?: 'button' | 'icon'
    buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    buttonSize?: 'large' | 'default' | 'small'
    buttonText?: string
    dialogTitle?: string
    acceptTypes?: string
    maxSize?: number // MB
    autoParse?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    triggerType: 'button',
    buttonType: 'primary',
    buttonSize: 'default',
    buttonText: '上传剧本',
    dialogTitle: '上传剧本文件',
    acceptTypes: '.doc,.docx,.pdf,.txt,.fountain,.fdx',
    maxSize: 50,
    autoParse: true
  })

  const emit = defineEmits<{
    (e: 'success', data: { file: File; name: string; content?: string }): void
    (e: 'error', message: string): void
    (e: 'cancel'): void
  }>()

  type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

  const dialogVisible = ref(false)
  const uploadRef = ref()
  const formRef = ref<FormInstance>()
  const fileList = ref<UploadFile[]>([])
  const uploadStatus = ref<UploadStatus>('ready')
  const uploadProgress = ref(0)
  const uploadedFileName = ref('')
  const parsedContent = ref('')
  const errorMessage = ref('')

  const formData = reactive({
    name: '',
    type: 'animation',
    description: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入剧本名称', trigger: 'blur' }]
  }

  const acceptTypesLabel = computed(() => {
    return props.acceptTypes.replace(/\./g, '').replace(/,/g, '、').toUpperCase()
  })

  const formatMaxSize = computed(() => {
    return props.maxSize >= 1024 ? `${(props.maxSize / 1024).toFixed(1)} GB` : `${props.maxSize} MB`
  })

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const getFileTypeClass = (filename: string): string => {
    const ext = getFileExtension(filename)
    const docExts = ['doc', 'docx', 'pdf', 'txt', 'fountain', 'fdx']
    return docExts.includes(ext) ? 'document' : 'other'
  }

  const getFileIcon = (filename: string): string => {
    const ext = getFileExtension(filename)
    const iconMap: Record<string, string> = {
      doc: 'ri:file-word-line',
      docx: 'ri:file-word-line',
      pdf: 'ri:file-pdf-line',
      txt: 'ri:file-text-line',
      fountain: 'ri:file-text-line',
      fdx: 'ri:file-text-line'
    }
    return iconMap[ext] || 'ri:file-line'
  }

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): boolean => {
    // 格式验证
    const ext = getFileExtension(file.name)
    const allowedExts = props.acceptTypes.split(',').map((t) => t.replace('.', ''))
    if (!allowedExts.includes(ext)) {
      errorMessage.value = `不支持的文件格式，请上传 ${acceptTypesLabel.value} 格式的文件`
      return false
    }

    // 大小验证
    const maxBytes = props.maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      errorMessage.value = `文件大小超过限制，最大允许 ${formatMaxSize.value}`
      return false
    }

    return true
  }

  const parseFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve((e.target?.result as string) || '')
      }
      reader.onerror = () => {
        resolve('')
      }
      if (file.type.includes('pdf')) {
        reader.readAsArrayBuffer(file)
        resolve('')
      } else {
        reader.readAsText(file)
      }
    })
  }

  const handleOpenDialog = () => {
    resetState()
    dialogVisible.value = true
  }

  const resetState = () => {
    fileList.value = []
    uploadStatus.value = 'ready'
    uploadProgress.value = 0
    uploadedFileName.value = ''
    parsedContent.value = ''
    errorMessage.value = ''
    formData.name = ''
    formData.type = 'animation'
    formData.description = ''
  }

  const handleFileChange = (uploadFile: UploadFile) => {
    const file = uploadFile.raw
    if (!file) return

    if (!validateFile(file)) {
      uploadStatus.value = 'error'
      fileList.value = []
      emit('error', errorMessage.value)
      return
    }

    uploadStatus.value = 'ready'
    errorMessage.value = ''

    // 自动填充文件名（去掉扩展名）
    if (!formData.name) {
      const nameWithoutExt = uploadFile.name.replace(/\.[^/.]+$/, '')
      formData.name = nameWithoutExt
    }

    // 限制只能有一个文件
    if (fileList.value.length > 1) {
      fileList.value = [uploadFile]
    }
  }

  const handleFileRemove = () => {
    uploadStatus.value = 'ready'
    errorMessage.value = ''
  }

  const handleClearFile = () => {
    fileList.value = []
    uploadStatus.value = 'ready'
    errorMessage.value = ''
    formData.name = ''
  }

  const handleUpload = async () => {
    if (fileList.value.length === 0) {
      ElMessage.warning('请先选择文件')
      return
    }

    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return

    const file = fileList.value[0].raw
    if (!file) return

    uploadStatus.value = 'uploading'
    uploadProgress.value = 0

    try {
      if (props.autoParse) {
        parsedContent.value = await parseFileContent(file)
      }

      uploadProgress.value = 100
      uploadStatus.value = 'success'
      uploadedFileName.value = file.name
      ElMessage.success('文件处理成功')
    } catch {
      uploadStatus.value = 'error'
      errorMessage.value = '文件处理失败'
      ElMessage.error('文件处理失败')
    }
  }

  const handleConfirm = () => {
    const file = fileList.value[0]?.raw
    if (!file) return

    emit('success', {
      file,
      name: formData.name,
      content: parsedContent.value
    })

    dialogVisible.value = false
    resetState()
  }

  const handleClose = () => {
    if (uploadStatus.value === 'uploading') {
      ElMessage.warning('正在上传中，请稍候')
      return
    }
    dialogVisible.value = false
    emit('cancel')
    resetState()
  }
</script>

<style lang="scss" scoped>
  .script-upload-component {
    display: inline-block;
  }

  .upload-dialog-content {
    .script-upload-area {
      :deep(.el-upload) {
        width: 100%;
      }

      :deep(.el-upload-dragger) {
        width: 100%;
        padding: 32px 20px;
        border-style: dashed;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
        }
      }
    }

    .upload-placeholder {
      text-align: center;

      .upload-icon {
        margin-bottom: 12px;
        font-size: 48px;
        color: var(--el-text-color-placeholder);
      }

      .upload-text {
        p {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-regular);

          em {
            font-style: normal;
            font-weight: 500;
            color: var(--el-color-primary);
          }
        }

        .upload-tip {
          margin-top: 8px;
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }
    }

    .upload-file-info {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .file-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        border-radius: 8px;

        &.document {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }

      .file-details {
        flex: 1;
        min-width: 0;
        text-align: left;

        .file-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          word-break: break-all;
        }

        .file-size {
          margin-top: 4px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .upload-progress-section {
      padding: 16px;
      margin-top: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .progress-header {
        margin-bottom: 12px;

        .progress-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .progress-percentage {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      .upload-progress-bar {
        margin-bottom: 12px;
      }

      .progress-status {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .upload-result {
      padding: 24px;
      margin-top: 20px;
      text-align: center;
      border-radius: var(--custom-radius);

      &.success {
        background: var(--el-color-success-light-9);
        border: 1px solid var(--el-color-success-light-5);
      }

      &.error {
        background: var(--el-color-danger-light-9);
        border: 1px solid var(--el-color-danger-light-5);
      }

      .result-icon {
        margin-bottom: 12px;
        font-size: 48px;

        .success & {
          color: var(--el-color-success);
        }

        .error & {
          color: var(--el-color-danger);
        }
      }

      .result-title {
        margin-bottom: 8px;
        font-size: 16px;
        font-weight: 600;

        .success & {
          color: var(--el-color-success);
        }

        .error & {
          color: var(--el-color-danger);
        }
      }

      .result-desc {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        word-break: break-all;
      }

      .parsed-content-preview {
        padding: 12px;
        margin-top: 16px;
        text-align: left;
        background: var(--el-bg-color);
        border-radius: var(--custom-radius);

        .preview-title {
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .preview-text {
          max-height: 120px;
          overflow-y: auto;
          font-size: 12px;
          line-height: 1.6;
          color: var(--el-text-color-secondary);
          white-space: pre-wrap;
        }
      }
    }

    .upload-form {
      margin-top: 20px;
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
