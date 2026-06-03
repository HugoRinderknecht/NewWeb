<template>
  <div class="video-gen-ai-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">AI视频生成</span>
            <ElTag v-if="projectId" type="info" size="small">项目ID：{{ projectId }}</ElTag>
          </div>
          <ElButton type="primary" @click="handleOpenGenerate">
            <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
            生成视频
          </ElButton>
        </div>
      </template>

      <!-- 分镜/镜头选择区 -->
      <div class="shot-selection mb-6">
        <div class="section-label flex-cb mb-3">
          <span class="font-medium">选择分镜/镜头</span>
          <ElSpace>
            <ElInput
              v-model="shotSearchQuery"
              placeholder="搜索分镜名称"
              clearable
              style="width: 200px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect
              v-model="shotFilterType"
              placeholder="镜头类型"
              clearable
              style="width: 140px"
            >
              <ElOption
                v-for="item in shotTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ElSpace>
        </div>

        <ElCheckboxGroup v-model="selectedShotIds" class="shot-checkbox-group">
          <div class="shot-grid">
            <div
              v-for="shot in filteredShots"
              :key="shot.id"
              class="shot-card"
              :class="{ selected: selectedShotIds.includes(shot.id) }"
              @click="handleToggleShot(shot.id)"
            >
              <div class="shot-card-header flex-cb">
                <ElCheckbox :label="shot.id" @click.stop>
                  <span class="font-medium">{{ shot.title || shot.name }}</span>
                </ElCheckbox>
                <ElTag v-if="shot.shotType" :type="shotTypeTagMap[shot.shotType]" size="small">
                  {{ shotTypeLabelMap[shot.shotType] || shot.shotType }}
                </ElTag>
              </div>
              <div class="shot-card-body">
                <p class="shot-desc">{{ shot.description || shot.prompt }}</p>
                <div class="shot-meta flex-cb mt-2">
                  <span class="text-xs text-g-400">时长 {{ shot.durationSeconds || 0 }}s</span>
                </div>
              </div>
            </div>
          </div>
        </ElCheckboxGroup>

        <div v-if="selectedShotIds.length > 0" class="selected-summary mt-3">
          <ElAlert type="info" :closable="false">
            <template #title>
              已选择 <strong>{{ selectedShotIds.length }}</strong> 个镜头，预计总时长
              <strong>{{ totalSelectedDuration }}s</strong>
            </template>
          </ElAlert>
        </div>
      </div>

      <!-- 参数设置区 -->
      <div class="param-config">
        <div class="section-label font-medium mb-3">生成参数设置</div>
        <ElRow :gutter="24">
          <ElCol :span="8">
            <ElForm :model="paramForm" label-position="top">
              <ElFormItem label="模型">
                <ElSelect v-model="paramForm.model" placeholder="请选择模型" class="w-full">
                  <ElOption label="Seedance 2.0 (标准)" value="doubao-seedance-2-0-260128" />
                  <ElOption
                    label="Seedance 2.0 Fast (快速)"
                    value="doubao-seedance-2-0-fast-260128"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="分辨率">
                <ElSelect v-model="paramForm.resolution" placeholder="请选择分辨率" class="w-full">
                  <ElOption label="480p" value="480p" />
                  <ElOption label="720p" value="720p" />
                  <ElOption
                    label="1080p"
                    value="1080p"
                    :disabled="paramForm.model === 'doubao-seedance-2-0-fast-260128'"
                  />
                </ElSelect>
              </ElFormItem>
            </ElForm>
          </ElCol>
          <ElCol :span="8">
            <ElForm :model="paramForm" label-position="top">
              <ElFormItem label="宽高比">
                <ElSelect v-model="paramForm.ratio" placeholder="请选择宽高比" class="w-full">
                  <ElOption label="自适应" value="adaptive" />
                  <ElOption label="16:9" value="16:9" />
                  <ElOption label="4:3" value="4:3" />
                  <ElOption label="1:1" value="1:1" />
                  <ElOption label="3:4" value="3:4" />
                  <ElOption label="9:16" value="9:16" />
                  <ElOption label="21:9" value="21:9" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="视频时长(秒)">
                <ElInputNumber
                  v-model="paramForm.duration"
                  :min="4"
                  :max="15"
                  :step="1"
                  class="w-full"
                />
                <div class="text-xs text-g-400 mt-1">4-15秒，或设为-1由模型自动选择</div>
              </ElFormItem>
            </ElForm>
          </ElCol>
          <ElCol :span="8">
            <ElForm :model="paramForm" label-position="top">
              <ElFormItem label="队列优先级">
                <ElSlider v-model="paramForm.priority" :min="0" :max="9" :step="1" show-stops />
                <div class="text-xs text-g-400 text-right"
                  >{{ paramForm.priority }} (越大越优先)</div
                >
              </ElFormItem>
              <ElFormItem label="附加选项">
                <ElSpace direction="vertical" alignment="start">
                  <ElCheckbox v-model="paramForm.generateAudio">生成同步音频</ElCheckbox>
                  <ElCheckbox v-model="paramForm.watermark">添加水印</ElCheckbox>
                  <ElCheckbox v-model="paramForm.cameraFixed">固定摄像头</ElCheckbox>
                  <ElCheckbox v-model="paramForm.returnLastFrame">返回尾帧图像</ElCheckbox>
                </ElSpace>
              </ElFormItem>
            </ElForm>
          </ElCol>
        </ElRow>
      </div>
    </ElCard>

    <!-- 提交生成任务弹窗 -->
    <ElDialog
      v-model="generateVisible"
      title="提交生成任务"
      width="600px"
      align-center
      destroy-on-close
    >
      <ElForm
        :model="generateForm"
        label-width="100px"
        :rules="generateRules"
        ref="generateFormRef"
      >
        <ElFormItem label="生成内容">
          <ElInput v-model="generateForm.content" type="textarea" :rows="3" readonly />
        </ElFormItem>
        <ElFormItem label="参数摘要">
          <ElDescriptions :column="2" border size="small">
            <ElDescriptionsItem label="模型">{{
              modelLabelMap[paramForm.model] || paramForm.model
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="分辨率">{{ paramForm.resolution }}</ElDescriptionsItem>
            <ElDescriptionsItem label="宽高比">{{ paramForm.ratio }}</ElDescriptionsItem>
            <ElDescriptionsItem label="时长">{{ paramForm.duration }}s</ElDescriptionsItem>
            <ElDescriptionsItem label="优先级">{{ paramForm.priority }}</ElDescriptionsItem>
            <ElDescriptionsItem label="音频">{{
              paramForm.generateAudio ? '是' : '否'
            }}</ElDescriptionsItem>
          </ElDescriptions>
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="generateForm.remark"
            type="textarea"
            :rows="2"
            placeholder="可选：添加任务备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="generateVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmitGenerate">
          <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
          提交任务
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchSubmitVideoGeneration, fetchPreviewVideoGeneration } from '@/api/video'
  import { fetchGetStoryboardList } from '@/api/storyboard'

  defineOptions({ name: 'VideoGenAi' })

  const route = useRoute()
  const projectId = computed(
    () => (route.params.projectId as string) || (route.query.projectId as string) || ''
  )
  const scriptId = computed(
    () => (route.params.scriptId as string) || (route.query.scriptId as string) || ''
  )
  const episodeId = computed(
    () => (route.params.episodeId as string) || (route.query.episodeId as string) || ''
  )

  interface ShotItem {
    id: string
    name: string
    title: string
    shotType: string
    description: string
    prompt: string
    durationSeconds: number
  }

  const shotSearchQuery = ref('')
  const shotFilterType = ref<string>('')
  const selectedShotIds = ref<string[]>([])
  const generateVisible = ref(false)
  const submitting = ref(false)
  const generateFormRef = ref<FormInstance>()

  const paramForm = reactive({
    model: 'doubao-seedance-2-0-260128',
    resolution: '720p',
    ratio: 'adaptive',
    duration: 5,
    priority: 0,
    generateAudio: true,
    watermark: false,
    cameraFixed: false,
    returnLastFrame: false,
    seed: -1
  })

  const generateForm = reactive({
    content: '',
    remark: ''
  })

  const generateRules: FormRules = {}

  const shotTypeOptions = [
    { label: '特写', value: 'closeup' },
    { label: '近景', value: 'medium' },
    { label: '远景', value: 'long' },
    { label: '全景', value: 'full' },
    { label: '大特写', value: 'extreme_closeup' },
    { label: '过肩', value: 'over_shoulder' }
  ]

  const shotTypeTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    closeup: 'primary',
    medium: 'success',
    long: 'warning',
    full: 'info',
    extreme_closeup: 'danger',
    over_shoulder: 'primary'
  }

  const shotTypeLabelMap: Record<string, string> = {
    closeup: '特写',
    medium: '近景',
    long: '远景',
    full: '全景',
    extreme_closeup: '大特写',
    over_shoulder: '过肩'
  }

  const modelLabelMap: Record<string, string> = {
    'doubao-seedance-2-0-260128': 'Seedance 2.0 (标准)',
    'doubao-seedance-2-0-fast-260128': 'Seedance 2.0 Fast (快速)'
  }

  const shotList = ref<ShotItem[]>([])

  const filteredShots = computed(() => {
    let result = shotList.value
    if (shotSearchQuery.value) {
      const q = shotSearchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          (item.title || item.name).toLowerCase().includes(q) ||
          (item.description || item.prompt || '').toLowerCase().includes(q)
      )
    }
    if (shotFilterType.value) {
      result = result.filter((item) => item.shotType === shotFilterType.value)
    }
    return result
  })

  const totalSelectedDuration = computed(() => {
    return shotList.value
      .filter((shot) => selectedShotIds.value.includes(shot.id))
      .reduce((sum, shot) => sum + (shot.durationSeconds || 0), 0)
  })

  const handleToggleShot = (id: string) => {
    const index = selectedShotIds.value.indexOf(id)
    if (index > -1) {
      selectedShotIds.value.splice(index, 1)
    } else {
      selectedShotIds.value.push(id)
    }
  }

  const handleOpenGenerate = () => {
    if (selectedShotIds.value.length === 0) {
      ElMessage.warning('请至少选择一个镜头')
      return
    }
    generateForm.content = `已选择 ${selectedShotIds.value.length} 个镜头，预计时长 ${totalSelectedDuration.value}s`
    generateForm.remark = ''
    generateVisible.value = true
  }

  const loadShotList = async () => {
    if (!projectId.value) return
    try {
      const res = await fetchGetStoryboardList(projectId.value)
      shotList.value = (res.records || []).map((item: any) => ({
        id: item.id,
        name: item.title || item.name || '',
        title: item.title || item.name || '',
        shotType: item.shotType || item.type || '',
        description: item.description || '',
        prompt: item.prompt || '',
        durationSeconds: item.durationSeconds || item.duration || 0
      }))
    } catch {
      shotList.value = []
    }
  }

  const handleSubmitGenerate = async () => {
    if (selectedShotIds.value.length === 0) {
      ElMessage.warning('请至少选择一个镜头')
      return
    }
    submitting.value = true
    try {
      // 1. 先调用预览接口获取 previewToken
      const previewParams: Api.Video.VideoPreviewParams = {
        model: paramForm.model,
        resolution: paramForm.resolution,
        ratio: paramForm.ratio,
        duration: paramForm.duration,
        seed: paramForm.seed,
        cameraFixed: paramForm.cameraFixed,
        watermark: paramForm.watermark,
        generateAudio: paramForm.generateAudio,
        priority: paramForm.priority,
        returnLastFrame: paramForm.returnLastFrame,
        projectId: projectId.value,
        scriptId: scriptId.value || undefined,
        episodeId: episodeId.value || undefined
      }
      const previewResult = await fetchPreviewVideoGeneration(previewParams)
      const previewToken = previewResult?.previewToken
      if (!previewToken) {
        ElMessage.error('预览确认失败，未获取到 previewToken')
        return
      }

      // 2. 对每个选中的分镜提交生成任务
      for (const storyboardId of selectedShotIds.value) {
        const generateParams: Api.Video.VideoGenerateParams = {
          ...previewParams,
          storyboardId,
          previewToken
        }
        await fetchSubmitVideoGeneration(generateParams)
      }

      ElMessage.success('生成任务已提交，请前往任务列表查看进度')
      generateVisible.value = false
      selectedShotIds.value = []
    } catch {
      ElMessage.error('提交生成任务失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    loadShotList()
  })
</script>

<style lang="scss" scoped>
  .section-label {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .shot-checkbox-group {
    display: block;
  }

  .shot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .shot-card {
    padding: 12px;
    cursor: pointer;
    background: var(--el-fill-color-lighter);
    border: 2px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary-light-7);
    }

    &.selected {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }

    .shot-card-header {
      margin-bottom: 8px;
    }

    .shot-desc {
      display: -webkit-box;
      overflow: hidden;
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .selected-summary {
    :deep(.el-alert__title) {
      font-size: 13px;
    }
  }

  .param-config {
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
