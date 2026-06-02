<template>
  <div class="video-gen-ai-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">AI视频生成</span>
            <ElTag type="info" size="small">剧本：《山海经·异兽录》</ElTag>
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
                  <span class="font-medium">{{ shot.name }}</span>
                </ElCheckbox>
                <ElTag :type="shotTypeTagMap[shot.type]" size="small">
                  {{ shotTypeLabelMap[shot.type] }}
                </ElTag>
              </div>
              <div class="shot-card-body">
                <p class="shot-desc">{{ shot.description }}</p>
                <div class="shot-meta flex-cb mt-2">
                  <span class="text-xs text-g-400">时长 {{ shot.duration }}s</span>
                  <span class="text-xs text-g-400">焦距 {{ shot.focalLength }}mm</span>
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
              <ElFormItem label="视频风格">
                <ElSelect v-model="paramForm.style" placeholder="请选择风格" class="w-full">
                  <ElOption label="写实风格" value="realistic" />
                  <ElOption label="卡通风格" value="cartoon" />
                  <ElOption label="3D动画" value="3d" />
                  <ElOption label="水墨风格" value="ink" />
                  <ElOption label="像素风格" value="pixel" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="分辨率">
                <ElSelect v-model="paramForm.resolution" placeholder="请选择分辨率" class="w-full">
                  <ElOption label="1920x1080 (1080p)" value="1080p" />
                  <ElOption label="2560x1440 (2K)" value="2k" />
                  <ElOption label="3840x2160 (4K)" value="4k" />
                </ElSelect>
              </ElFormItem>
            </ElForm>
          </ElCol>
          <ElCol :span="8">
            <ElForm :model="paramForm" label-position="top">
              <ElFormItem label="帧率">
                <ElSelect v-model="paramForm.fps" placeholder="请选择帧率" class="w-full">
                  <ElOption label="24fps (电影)" value="24" />
                  <ElOption label="30fps (标准)" value="30" />
                  <ElOption label="60fps (流畅)" value="60" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="视频格式">
                <ElSelect v-model="paramForm.format" placeholder="请选择格式" class="w-full">
                  <ElOption label="MP4" value="mp4" />
                  <ElOption label="MOV" value="mov" />
                  <ElOption label="AVI" value="avi" />
                </ElSelect>
              </ElFormItem>
            </ElForm>
          </ElCol>
          <ElCol :span="8">
            <ElForm :model="paramForm" label-position="top">
              <ElFormItem label="画质等级">
                <ElSlider v-model="paramForm.quality" :min="1" :max="5" :step="1" show-stops />
                <div class="text-xs text-g-400 text-right">{{
                  qualityLabelMap[paramForm.quality]
                }}</div>
              </ElFormItem>
              <ElFormItem label="生成模式">
                <ElRadioGroup v-model="paramForm.mode" class="w-full">
                  <ElRadio value="fast">快速生成</ElRadio>
                  <ElRadio value="standard">标准生成</ElRadio>
                  <ElRadio value="quality">高质量生成</ElRadio>
                </ElRadioGroup>
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
        <ElFormItem label="任务名称" prop="name" required>
          <ElInput v-model="generateForm.name" placeholder="请输入任务名称" />
        </ElFormItem>
        <ElFormItem label="生成内容">
          <ElInput
            v-model="generateForm.content"
            type="textarea"
            :rows="3"
            readonly
            :value="`已选择 ${selectedShotIds.length} 个镜头，预计时长 ${totalSelectedDuration}s`"
          />
        </ElFormItem>
        <ElFormItem label="参数摘要">
          <ElDescriptions :column="2" border size="small">
            <ElDescriptionsItem label="风格">{{
              styleLabelMap[paramForm.style]
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="分辨率">{{ paramForm.resolution }}</ElDescriptionsItem>
            <ElDescriptionsItem label="帧率">{{ paramForm.fps }}fps</ElDescriptionsItem>
            <ElDescriptionsItem label="格式">{{
              paramForm.format.toUpperCase()
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="画质">{{
              qualityLabelMap[paramForm.quality]
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="模式">{{ modeLabelMap[paramForm.mode] }}</ElDescriptionsItem>
          </ElDescriptions>
        </ElFormItem>
        <ElFormItem label="优先级">
          <ElRadioGroup v-model="generateForm.priority">
            <ElRadio value="high">高</ElRadio>
            <ElRadio value="normal">普通</ElRadio>
            <ElRadio value="low">低</ElRadio>
          </ElRadioGroup>
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

  type ShotType = 'closeup' | 'medium' | 'long' | 'full' | 'extreme_closeup' | 'over_shoulder'

  interface ShotItem {
    id: string
    name: string
    type: ShotType
    description: string
    duration: number
    focalLength: number
  }

  interface ParamForm {
    style: string
    resolution: string
    fps: string
    format: string
    quality: number
    mode: string
  }

  const shotSearchQuery = ref('')
  const shotFilterType = ref<ShotType | ''>('')
  const selectedShotIds = ref<string[]>([])
  const generateVisible = ref(false)
  const submitting = ref(false)
  const generateFormRef = ref<FormInstance>()

  const paramForm = reactive<ParamForm>({
    style: 'realistic',
    resolution: '1080p',
    fps: '24',
    format: 'mp4',
    quality: 3,
    mode: 'standard'
  })

  const generateForm = reactive({
    name: '',
    content: '',
    priority: 'normal' as 'high' | 'normal' | 'low',
    remark: ''
  })

  const generateRules: FormRules = {
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
  }

  const shotTypeOptions = [
    { label: '特写', value: 'closeup' },
    { label: '近景', value: 'medium' },
    { label: '远景', value: 'long' },
    { label: '全景', value: 'full' },
    { label: '大特写', value: 'extreme_closeup' },
    { label: '过肩', value: 'over_shoulder' }
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

  const qualityLabelMap: Record<number, string> = {
    1: '低画质',
    2: '较低画质',
    3: '标准画质',
    4: '高画质',
    5: '超高画质'
  }

  const styleLabelMap: Record<string, string> = {
    realistic: '写实风格',
    cartoon: '卡通风格',
    '3d': '3D动画',
    ink: '水墨风格',
    pixel: '像素风格'
  }

  const modeLabelMap: Record<string, string> = {
    fast: '快速生成',
    standard: '标准生成',
    quality: '高质量生成'
  }

  const shotList = ref<ShotItem[]>([])

  const filteredShots = computed(() => {
    let result = shotList.value
    if (shotSearchQuery.value) {
      const q = shotSearchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      )
    }
    if (shotFilterType.value) {
      result = result.filter((item) => item.type === shotFilterType.value)
    }
    return result
  })

  const totalSelectedDuration = computed(() => {
    return shotList.value
      .filter((shot) => selectedShotIds.value.includes(shot.id))
      .reduce((sum, shot) => sum + shot.duration, 0)
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
    generateForm.name = ''
    generateForm.remark = ''
    generateForm.priority = 'normal'
    generateVisible.value = true
  }

  const loadShotList = async () => {
    if (!projectId.value) return
    try {
      const res = await fetchGetStoryboardList(projectId.value)
      shotList.value = (res.records || []).map((item) => ({
        id: item.id,
        name: item.name || '',
        type: item.type as ShotType,
        description: item.description,
        duration: item.duration || 0,
        focalLength: Number(item.focalLength) || 0
      }))
    } catch {
      shotList.value = []
    }
  }

  const handleSubmitGenerate = async () => {
    if (!generateFormRef.value) return
    await generateFormRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          await fetchPreviewVideoGeneration({
            style: paramForm.style,
            resolution: paramForm.resolution,
            fps: paramForm.fps,
            format: paramForm.format
          })
          await fetchSubmitVideoGeneration({
            name: generateForm.name,
            shots: selectedShotIds.value.map(Number),
            style: paramForm.style,
            resolution: paramForm.resolution,
            fps: paramForm.fps,
            format: paramForm.format,
            priority: generateForm.priority,
            remark: generateForm.remark
          })
          ElMessage.success('生成任务已提交，请前往任务列表查看进度')
          generateVisible.value = false
          selectedShotIds.value = []
        } catch {
          ElMessage.error('提交生成任务失败，请稍后重试')
        } finally {
          submitting.value = false
        }
      }
    })
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
    border: 2px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    cursor: pointer;
    transition: all 0.2s;
    background: var(--el-fill-color-lighter);

    &:hover {
      border-color: var(--el-color-primary-light-7);
    }

    &.selected {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .shot-card-header {
      margin-bottom: 8px;
    }

    .shot-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
