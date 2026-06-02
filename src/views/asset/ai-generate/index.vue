<template>
  <div class="ai-generate-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">AI资产生成</span>
            <ElTag type="info" size="small">AI生图 / 风格反推 / 历史记录</ElTag>
          </div>
        </div>
      </template>

      <ElTabs v-model="activeTab" type="border-card">
        <!-- AI生图 -->
        <ElTabPane label="AI生图" name="generate">
          <div class="generate-panel">
            <ElRow :gutter="24">
              <ElCol :span="10" :xs="24">
                <div class="generate-form">
                  <ElForm :model="generateForm" label-position="top">
                    <ElFormItem label="提示词">
                      <ElInput
                        v-model="generateForm.prompt"
                        type="textarea"
                        :rows="4"
                        placeholder="描述你想要生成的画面，例如：一位古风仙侠少年，手持长剑，站在云雾缭绕的山峰之上"
                      />
                    </ElFormItem>

                    <ElFormItem label="反向提示词">
                      <ElInput
                        v-model="generateForm.negativePrompt"
                        type="textarea"
                        :rows="2"
                        placeholder="描述你不希望出现的元素，例如：模糊、低质量、多余的手指"
                      />
                    </ElFormItem>

                    <ElRow :gutter="16">
                      <ElCol :span="12">
                        <ElFormItem label="风格">
                          <ElSelect
                            v-model="generateForm.style"
                            placeholder="选择风格"
                            class="w-full"
                          >
                            <ElOption label="写实" value="realistic" />
                            <ElOption label="动漫" value="anime" />
                            <ElOption label="水墨" value="ink" />
                            <ElOption label="像素" value="pixel" />
                            <ElOption label="3D渲染" value="3d" />
                          </ElSelect>
                        </ElFormItem>
                      </ElCol>
                      <ElCol :span="12">
                        <ElFormItem label="尺寸">
                          <ElSelect
                            v-model="generateForm.size"
                            placeholder="选择尺寸"
                            class="w-full"
                          >
                            <ElOption label="512 x 512" value="512x512" />
                            <ElOption label="768 x 512" value="768x512" />
                            <ElOption label="512 x 768" value="512x768" />
                            <ElOption label="1024 x 1024" value="1024x1024" />
                          </ElSelect>
                        </ElFormItem>
                      </ElCol>
                    </ElRow>

                    <ElRow :gutter="16">
                      <ElCol :span="12">
                        <ElFormItem label="生成数量">
                          <ElSlider v-model="generateForm.count" :min="1" :max="4" show-stops />
                        </ElFormItem>
                      </ElCol>
                      <ElCol :span="12">
                        <ElFormItem label="随机种子">
                          <ElInput v-model="generateForm.seed" placeholder="留空则随机" />
                        </ElFormItem>
                      </ElCol>
                    </ElRow>

                    <ElFormItem>
                      <ElButton
                        type="primary"
                        size="large"
                        :loading="isGenerating"
                        :disabled="!generateForm.prompt"
                        class="w-full"
                        @click="handleGenerate"
                      >
                        <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
                        {{ isGenerating ? '生成中...' : '开始生成' }}
                      </ElButton>
                    </ElFormItem>
                  </ElForm>
                </div>
              </ElCol>

              <ElCol :span="14" :xs="24">
                <div class="generate-result">
                  <div class="result-header flex items-center justify-between mb-4">
                    <span class="font-medium">生成结果</span>
                    <ElSpace>
                      <ElButton
                        v-if="generatedImages.length > 0"
                        type="primary"
                        link
                        @click="handleDownloadAll"
                      >
                        <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                        全部下载
                      </ElButton>
                      <ElButton
                        v-if="generatedImages.length > 0"
                        type="danger"
                        link
                        @click="handleClearResults"
                      >
                        <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                        清空
                      </ElButton>
                    </ElSpace>
                  </div>

                  <div v-if="generatedImages.length === 0" class="empty-result">
                    <ArtSvgIcon icon="ri:image-line" class="empty-icon" />
                    <div class="empty-text">输入提示词并点击生成按钮</div>
                    <div class="empty-tip">AI将根据你的描述生成对应的图片资产</div>
                  </div>

                  <ElRow v-else :gutter="16">
                    <ElCol v-for="(img, idx) in generatedImages" :key="idx" :span="12" class="mb-4">
                      <div class="image-card">
                        <div class="image-wrapper">
                          <img :src="img.url" class="generated-image" />
                          <div class="image-overlay">
                            <ElSpace>
                              <ElButton
                                type="primary"
                                circle
                                size="small"
                                @click="handleDownload(img)"
                              >
                                <ArtSvgIcon icon="ri:download-line" />
                              </ElButton>
                              <ElButton
                                type="success"
                                circle
                                size="small"
                                @click="handleSaveToAssets(img)"
                              >
                                <ArtSvgIcon icon="ri:save-line" />
                              </ElButton>
                            </ElSpace>
                          </div>
                        </div>
                        <div class="image-info p-3">
                          <div class="text-sm font-medium truncate">{{ img.prompt }}</div>
                          <div class="text-xs text-g-400 mt-1"
                            >{{ img.style }} / {{ img.size }}</div
                          >
                        </div>
                      </div>
                    </ElCol>
                  </ElRow>
                </div>
              </ElCol>
            </ElRow>
          </div>
        </ElTabPane>

        <!-- 风格反推 -->
        <ElTabPane label="风格反推" name="reverse">
          <div class="reverse-panel">
            <ElRow :gutter="24">
              <ElCol :span="10" :xs="24">
                <div class="upload-panel">
                  <ElUpload
                    drag
                    :auto-upload="false"
                    :on-change="handleReferenceUpload"
                    :show-file-list="false"
                    accept=".jpg,.jpeg,.png,.gif"
                  >
                    <div v-if="!referenceImage" class="upload-placeholder">
                      <ArtSvgIcon icon="ri:upload-cloud-2-line" class="upload-icon" />
                      <div class="el-upload__text"> 拖拽参考图到此处，或 <em>点击上传</em> </div>
                      <div class="el-upload__tip">支持 JPG、PNG、GIF 格式</div>
                    </div>
                    <div v-else class="reference-preview">
                      <img :src="referenceImage" class="preview-image" />
                      <div class="preview-overlay">
                        <ElButton
                          type="danger"
                          circle
                          size="small"
                          @click.stop="referenceImage = ''"
                        >
                          <ArtSvgIcon icon="ri:close-line" />
                        </ElButton>
                      </div>
                    </div>
                  </ElUpload>

                  <ElButton
                    type="primary"
                    size="large"
                    class="w-full mt-4"
                    :loading="isReversing"
                    :disabled="!referenceImage"
                    @click="handleReverseStyle"
                  >
                    <ArtSvgIcon icon="ri:exchange-line" class="mr-1" />
                    {{ isReversing ? '分析中...' : '开始反推' }}
                  </ElButton>
                </div>
              </ElCol>

              <ElCol :span="14" :xs="24">
                <div class="reverse-result">
                  <div class="result-header font-medium mb-4">反推结果</div>

                  <div v-if="!reverseResult && !isReversing" class="empty-result">
                    <ArtSvgIcon icon="ri:search-line" class="empty-icon" />
                    <div class="empty-text">上传参考图并点击反推按钮</div>
                    <div class="empty-tip">AI将分析图片风格并生成对应的提示词</div>
                  </div>

                  <div v-else-if="isReversing" class="analyzing">
                    <ElSkeleton :rows="6" animated />
                  </div>

                  <div v-else class="result-content">
                    <ElDescriptions :column="1" border>
                      <ElDescriptionsItem label="风格描述">
                        <div class="flex items-center gap-2">
                          <span>{{ reverseResult?.style }}</span>
                          <ElButton
                            type="primary"
                            link
                            size="small"
                            @click="copyText(reverseResult?.style || '')"
                          >
                            <ArtSvgIcon icon="ri:file-copy-line" />
                          </ElButton>
                        </div>
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="提示词">
                        <div class="flex items-start gap-2">
                          <span class="flex-1">{{ reverseResult?.prompt }}</span>
                          <ElButton
                            type="primary"
                            link
                            size="small"
                            @click="copyText(reverseResult?.prompt || '')"
                          >
                            <ArtSvgIcon icon="ri:file-copy-line" />
                          </ElButton>
                        </div>
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="色彩分析">
                        <div class="color-palette">
                          <div
                            v-for="(color, idx) in reverseResult?.colors"
                            :key="idx"
                            class="color-item"
                            :style="{ backgroundColor: color }"
                            :title="color"
                          />
                        </div>
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="构图分析">
                        {{ reverseResult?.composition }}
                      </ElDescriptionsItem>
                      <ElDescriptionsItem label="光影分析">
                        {{ reverseResult?.lighting }}
                      </ElDescriptionsItem>
                    </ElDescriptions>

                    <div class="action-btns mt-4">
                      <ElButton type="primary" @click="useReverseResult">
                        <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
                        使用此提示词生成
                      </ElButton>
                    </div>
                  </div>
                </div>
              </ElCol>
            </ElRow>
          </div>
        </ElTabPane>

        <!-- 生成历史 -->
        <ElTabPane label="生成历史" name="history">
          <div class="history-panel">
            <div class="flex-cb mb-4">
              <ElSpace>
                <ElInput
                  v-model="historySearch"
                  placeholder="搜索历史记录"
                  clearable
                  style="width: 220px"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="historyFilter"
                  placeholder="类型筛选"
                  clearable
                  style="width: 140px"
                >
                  <ElOption label="AI生图" value="generate" />
                  <ElOption label="风格反推" value="reverse" />
                </ElSelect>
              </ElSpace>
              <ElButton type="danger" link @click="handleClearHistory">
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                清空历史
              </ElButton>
            </div>

            <ArtTable
              :data="pagedHistory"
              :columns="historyColumns"
              :pagination="pagination"
              @pagination:size-change="handleSizeChange"
              @pagination:current-change="handleCurrentChange"
            >
              <template #default>
                <ElTableColumn label="预览" width="100">
                  <template #default="scope">
                    <div class="history-thumb">
                      <img
                        v-if="scope.row.thumbnail"
                        :src="scope.row.thumbnail"
                        class="thumb-img"
                      />
                      <div v-else class="thumb-placeholder">
                        <ArtSvgIcon icon="ri:image-line" />
                      </div>
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="类型" width="100">
                  <template #default="scope">
                    <ElTag
                      :type="scope.row.type === 'generate' ? 'primary' : 'warning'"
                      size="small"
                    >
                      {{ scope.row.type === 'generate' ? 'AI生图' : '风格反推' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="提示词/描述" min-width="280">
                  <template #default="scope">
                    <div class="text-sm truncate">{{ scope.row.prompt }}</div>
                    <div class="text-xs text-g-400"
                      >{{ scope.row.style }} / {{ scope.row.size }}</div
                    >
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createTime" label="生成时间" width="160" sortable />
                <ElTableColumn label="操作" width="180" fixed="right">
                  <template #default="scope">
                    <ElSpace>
                      <ElButton type="primary" link size="small" @click="handleReuse(scope.row)">
                        <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                        复用
                      </ElButton>
                      <ElButton
                        type="success"
                        link
                        size="small"
                        @click="handleDownloadHistory(scope.row)"
                      >
                        <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                        下载
                      </ElButton>
                      <ElButton
                        type="danger"
                        link
                        size="small"
                        @click="handleDeleteHistory(scope.row)"
                      >
                        <ArtSvgIcon icon="ri:delete-bin-line" />
                      </ElButton>
                    </ElSpace>
                  </template>
                </ElTableColumn>
              </template>
            </ArtTable>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import type { UploadFile } from 'element-plus'
  import { fetchGetAiProcessHistory } from '@/api/ai-process'
  import {
    fetchSubmitImageGeneration,
    fetchGetImageTaskStatus,
    fetchGetImageTaskResult
  } from '@/api/image'
  import { fetchStyleInference } from '@/api/workflow'

  defineOptions({ name: 'AiGenerate' })

  type TabType = 'generate' | 'reverse' | 'history'
  type HistoryType = 'generate' | 'reverse'

  interface GeneratedImage {
    url: string
    prompt: string
    style: string
    size: string
  }

  interface ReverseResult {
    style: string
    prompt: string
    colors: string[]
    composition: string
    lighting: string
  }

  interface HistoryItem {
    id: number
    type: HistoryType
    thumbnail: string
    prompt: string
    style: string
    size: string
    createTime: string
  }

  const activeTab = ref<TabType>('generate')
  const isGenerating = ref(false)
  const isReversing = ref(false)
  const referenceImage = ref('')
  const historySearch = ref('')
  const historyFilter = ref<HistoryType | ''>('')

  const generateForm = reactive({
    prompt: '',
    negativePrompt: '',
    style: 'realistic',
    size: '512x512',
    count: 1,
    seed: ''
  })

  const generatedImages = ref<GeneratedImage[]>([])

  const reverseResult = ref<ReverseResult | null>(null)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const historyList = ref<HistoryItem[]>([])

  const historyColumns: ColumnOption[] = [
    { prop: 'thumbnail', label: '预览', width: 100 },
    { prop: 'type', label: '类型', width: 100 },
    { prop: 'prompt', label: '提示词/描述', minWidth: 280 },
    { prop: 'createTime', label: '生成时间', width: 160, sortable: true },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
  ]

  const filteredHistory = computed(() => {
    let result = historyList.value

    if (historySearch.value) {
      const q = historySearch.value.toLowerCase()
      result = result.filter((item) => item.prompt.toLowerCase().includes(q))
    }

    if (historyFilter.value) {
      result = result.filter((item) => item.type === historyFilter.value)
    }

    return result
  })

  const pagedHistory = computed(() => {
    const list = filteredHistory.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredHistory, (list) => {
    pagination.total = list.length
  })

  const loadHistoryList = async () => {
    try {
      const res = await fetchGetAiProcessHistory()
      historyList.value = (res || []) as unknown as HistoryItem[]
    } catch {
      historyList.value = []
    }
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleGenerate = async () => {
    if (!generateForm.prompt.trim()) {
      ElMessage.warning('请输入提示词')
      return
    }

    isGenerating.value = true

    try {
      // 提交生图任务
      const task = await fetchSubmitImageGeneration({
        prompt: generateForm.prompt,
        negativePrompt: generateForm.negativePrompt,
        style: generateForm.style,
        size: generateForm.size,
        count: generateForm.count,
        seed: generateForm.seed || undefined
      })

      const taskId = task.taskId

      // 轮询任务状态（间隔2秒，最多30次）
      const maxRetries = 30
      const interval = 2000
      let completed = false

      for (let i = 0; i < maxRetries; i++) {
        await new Promise((resolve) => setTimeout(resolve, interval))
        const status = await fetchGetImageTaskStatus(taskId)

        if (status.status === 'completed') {
          completed = true
          break
        }

        if (status.status === 'failed') {
          ElMessage.error('图片生成任务失败')
          isGenerating.value = false
          return
        }
      }

      if (!completed) {
        ElMessage.error('图片生成超时，请稍后查看')
        isGenerating.value = false
        return
      }

      // 获取任务结果
      const result = await fetchGetImageTaskResult(taskId)

      // 映射结果到 generatedImages
      generatedImages.value = (result.images || []).map((img) => ({
        url: img.url,
        prompt: img.prompt || generateForm.prompt,
        style: img.style || generateForm.style,
        size: img.size || generateForm.size
      }))

      // 添加到历史
      historyList.value.unshift({
        id: Date.now(),
        type: 'generate',
        thumbnail: generatedImages.value[0]?.url || '',
        prompt: generateForm.prompt,
        style: generateForm.style,
        size: generateForm.size,
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
      })

      ElMessage.success('生成完成')
    } catch (error: any) {
      ElMessage.error(error?.message || '图片生成失败，请稍后重试')
    } finally {
      isGenerating.value = false
    }
  }

  const handleReferenceUpload = (uploadFile: UploadFile) => {
    if (uploadFile.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        referenceImage.value = e.target?.result as string
      }
      reader.readAsDataURL(uploadFile.raw)
    }
  }

  const handleReverseStyle = async () => {
    if (!referenceImage.value) {
      ElMessage.warning('请先上传参考图')
      return
    }

    isReversing.value = true
    reverseResult.value = null

    try {
      // 将 base64 转换为 File 对象
      const base64Data = referenceImage.value
      const arr = base64Data.split(',')
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const file = new File([u8arr], 'reference.png', { type: mime })

      // 调用风格反推API
      const result = await fetchStyleInference({ image: file })

      // 映射结果到 reverseResult
      reverseResult.value = {
        style: result.style,
        prompt: result.prompt,
        colors: result.colors || [],
        composition: result.composition,
        lighting: result.lighting
      }

      historyList.value.unshift({
        id: Date.now(),
        type: 'reverse',
        thumbnail: referenceImage.value,
        prompt: reverseResult.value.prompt,
        style: '反推',
        size: '-',
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' ')
      })

      ElMessage.success('风格反推完成')
    } catch (error: any) {
      ElMessage.error(error?.message || '风格反推失败，请稍后重试')
    } finally {
      isReversing.value = false
    }
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    })
  }

  const useReverseResult = () => {
    if (reverseResult.value) {
      generateForm.prompt = reverseResult.value.prompt
      activeTab.value = 'generate'
      ElMessage.success('提示词已填充到生图页面')
    }
  }

  const handleDownload = (_img: GeneratedImage) => {
    void _img
    ElMessage.success('开始下载')
  }

  const handleDownloadAll = () => {
    ElMessage.success('开始批量下载')
  }

  const handleSaveToAssets = (_img: GeneratedImage) => {
    void _img
    ElMessage.success('已保存到资产库')
  }

  const handleClearResults = () => {
    generatedImages.value = []
    ElMessage.success('已清空生成结果')
  }

  const handleReuse = (row: HistoryItem) => {
    generateForm.prompt = row.prompt
    generateForm.style = row.style === '反推' ? 'realistic' : row.style
    generateForm.size = row.size === '-' ? '512x512' : row.size
    activeTab.value = 'generate'
    ElMessage.success('参数已填充到生图页面')
  }

  const handleDownloadHistory = (row: HistoryItem) => {
    void row
    ElMessage.success('开始下载')
  }

  const handleDeleteHistory = (row: HistoryItem) => {
    ElMessageBox.confirm('确定要删除这条历史记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      historyList.value = historyList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  const handleClearHistory = () => {
    ElMessageBox.confirm('确定要清空所有历史记录吗？', '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      historyList.value = []
      ElMessage.success('已清空历史记录')
    })
  }

  onMounted(() => {
    loadHistoryList()
  })
</script>

<style lang="scss" scoped>
  .ai-generate-page {
    .generate-panel {
      padding: 16px 0;

      .generate-form {
        :deep(.el-form-item__label) {
          font-weight: 500;
        }
      }

      .generate-result {
        .result-header {
          padding-bottom: 12px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .empty-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          color: var(--el-text-color-secondary);

          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            color: var(--el-text-color-placeholder);
          }

          .empty-text {
            font-size: 16px;
            margin-bottom: 8px;
          }

          .empty-tip {
            font-size: 13px;
            color: var(--el-text-color-placeholder);
          }
        }

        .image-card {
          background: var(--el-fill-color-lighter);
          border-radius: var(--custom-radius);
          overflow: hidden;

          .image-wrapper {
            position: relative;
            aspect-ratio: 1;
            background: var(--el-fill-color-dark);
            display: flex;
            align-items: center;
            justify-content: center;

            .generated-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .image-overlay {
              position: absolute;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;
            }

            &:hover .image-overlay {
              opacity: 1;
            }
          }
        }
      }
    }

    .reverse-panel {
      padding: 16px 0;

      .upload-panel {
        :deep(.el-upload) {
          width: 100%;
        }

        :deep(.el-upload-dragger) {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-placeholder {
          text-align: center;

          .upload-icon {
            font-size: 48px;
            color: var(--el-color-primary);
            margin-bottom: 16px;
          }
        }

        .reference-preview {
          position: relative;
          width: 100%;
          height: 100%;

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .preview-overlay {
            position: absolute;
            top: 8px;
            right: 8px;
          }
        }
      }

      .reverse-result {
        .result-header {
          padding-bottom: 12px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .empty-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          color: var(--el-text-color-secondary);

          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
            color: var(--el-text-color-placeholder);
          }

          .empty-text {
            font-size: 16px;
            margin-bottom: 8px;
          }

          .empty-tip {
            font-size: 13px;
            color: var(--el-text-color-placeholder);
          }
        }

        .color-palette {
          display: flex;
          gap: 8px;

          .color-item {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            border: 1px solid var(--el-border-color);
          }
        }
      }
    }

    .history-panel {
      padding: 16px 0;

      .history-thumb {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        overflow: hidden;
        background: var(--el-fill-color-dark);

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--el-text-color-secondary);
          font-size: 20px;
        }
      }
    }
  }
</style>
