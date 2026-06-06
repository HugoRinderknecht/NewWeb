<template>
  <ElDialog
    v-model="visible"
    :title="isEdit ? '编辑分镜' : '新建分镜'"
    width="720px"
    align-center
    destroy-on-close
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="分镜标题" prop="title">
        <ElInput v-model="form.title" placeholder="请输入分镜标题" maxlength="200" show-word-limit />
      </ElFormItem>

      <ElFormItem label="所属剧集" prop="episodeId">
        <ElSelect
          v-model="form.episodeId"
          placeholder="请选择剧集"
          filterable
          class="w-full"
          :loading="episodesLoading"
        >
          <ElOption
            v-for="ep in episodeOptions"
            :key="ep.id"
            :label="`第${ep.number}集：${ep.name}`"
            :value="ep.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElDivider content-position="left">
        <span class="text-sm">镜头语言</span>
      </ElDivider>

      <ElRow :gutter="16">
        <ElCol :span="8">
          <ElFormItem label="景别">
            <ElSelect v-model="form.cameraAngle" placeholder="景别" clearable class="w-full">
              <ElOption label="广角 wide" value="wide" />
              <ElOption label="中景 medium" value="medium" />
              <ElOption label="近景 close" value="close" />
              <ElOption label="特写 extreme_close" value="extreme_close" />
              <ElOption label="过肩 over_shoulder" value="over_shoulder" />
              <ElOption label="主观 pov" value="pov" />
              <ElOption label="俯视 birds_eye" value="birds_eye" />
              <ElOption label="荷兰角 dutch" value="dutch" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="运镜">
            <ElSelect v-model="form.cameraMovement" placeholder="运镜" clearable class="w-full">
              <ElOption label="固定 fixed" value="fixed" />
              <ElOption label="摇 pan" value="pan" />
              <ElOption label="俯仰 tilt" value="tilt" />
              <ElOption label="推拉 dolly" value="dolly" />
              <ElOption label="升降 crane" value="crane" />
              <ElOption label="跟踪 tracking" value="tracking" />
              <ElOption label="斯坦尼康 steadicam" value="steadicam" />
              <ElOption label="变焦 zoom" value="zoom" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem label="镜头类型">
            <ElSelect v-model="form.shotType" placeholder="类型" clearable class="w-full">
              <ElOption label="叙述 narrative" value="narrative" />
              <ElOption label="呼吸 breath" value="breath" />
              <ElOption label="高潮 climax" value="climax" />
              <ElOption label="转场 transition" value="transition" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="时长(秒)">
            <ElInputNumber
              v-model="form.durationSeconds"
              :min="0"
              :max="600"
              :step="1"
              class="w-full"
              placeholder="秒"
            />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="排序号">
            <ElInputNumber
              v-model="form.storyboardNo"
              :min="0"
              class="w-full"
              placeholder="不填则自动"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElDivider content-position="left">
        <span class="text-sm">视听内容</span>
      </ElDivider>

      <ElFormItem label="分镜描述">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分镜描述"
        />
      </ElFormItem>

      <ElFormItem label="AI 提示词">
        <ElInput
          v-model="form.prompt"
          type="textarea"
          :rows="3"
          placeholder="用于配图/视频生成的英文或中文提示词"
        />
      </ElFormItem>

      <ElFormItem label="台词/旁白">
        <ElInput
          v-model="form.scriptText"
          type="textarea"
          :rows="2"
          placeholder="角色台词或旁白文本"
        />
      </ElFormItem>

      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="音效">
            <ElInput v-model="form.soundEffect" placeholder="如：风雪声、脚步声" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="背景音乐">
            <ElInput v-model="form.backgroundMusic" placeholder="如：轻快钢琴、史诗弦乐" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { useRoute } from 'vue-router'
  import { logger } from '@/utils/logger'
  import { useProjectStore } from '@/store/modules/project'
  import { useStoryboardStore } from '@/store/modules/storyboard'
  import {
    useCreateStoryboard,
    useUpdateStoryboard,
    useStoryboardDetail
  } from '@/api/queries/storyboard'
  import { useProjectEpisodes } from '@/api/queries/project'

  const route = useRoute()
  const projectStore = useProjectStore()
  const storyboardStore = useStoryboardStore()
  const { editorOpen, editorStoryboardId } = storeToRefs(storyboardStore)

  const isEdit = computed(() => !!editorStoryboardId.value)

  const visible = computed({
    get: () => editorOpen.value,
    set: (v) => {
      if (!v) storyboardStore.closeEditor()
    }
  })

  const projectId = computed(() => {
    const fromRoute = (route.params.projectId as string) || (route.query.projectId as string)
    return fromRoute || projectStore.currentProjectId || ''
  })

  const { data: detail } = useStoryboardDetail(editorStoryboardId as any)
  const { data: episodesData, isLoading: episodesLoading } = useProjectEpisodes(projectId)
  const episodes = computed<any[]>(() => (episodesData.value as any) || [])

  const episodeOptions = computed(() =>
    episodes.value.map((ep: any, idx: number) => ({
      id: String(ep.id || idx + 1),
      number: ep.number || ep.episodeNumber || idx + 1,
      name: ep.name || ep.title || ep.episodeName || `第${idx + 1}集`
    }))
  )

  const form = reactive<Api.Storyboard.CreateStoryboardParams>({
    episodeId: '',
    title: '',
    description: '',
    prompt: '',
    cameraAngle: '',
    cameraMovement: '',
    durationSeconds: undefined,
    scriptText: '',
    soundEffect: '',
    backgroundMusic: '',
    storyboardNo: undefined
  })
  const formRef = ref<FormInstance>()

  const rules: FormRules = {
    title: [{ required: true, message: '请输入分镜标题', trigger: 'blur' }]
  }

  // 加载详情到表单
  watch(
    [() => editorStoryboardId.value, () => detail.value],
    ([id, d]) => {
      if (id && d) {
        Object.assign(form, {
          episodeId: d.episodeId || '',
          title: d.title || '',
          description: d.description || '',
          prompt: d.prompt || '',
          cameraAngle: d.cameraAngle || '',
          cameraMovement: d.cameraMovement || '',
          durationSeconds: d.durationSeconds || undefined,
          scriptText: d.scriptText || '',
          soundEffect: d.soundEffect || '',
          backgroundMusic: d.backgroundMusic || '',
          storyboardNo: d.storyboardNo
        })
      } else if (!id) {
        Object.assign(form, {
          episodeId: '',
          title: '',
          description: '',
          prompt: '',
          cameraAngle: '',
          cameraMovement: '',
          durationSeconds: undefined,
          scriptText: '',
          soundEffect: '',
          backgroundMusic: '',
          storyboardNo: undefined
        })
      }
    },
    { immediate: true }
  )

  const createMutate = useCreateStoryboard()
  const updateMutate = useUpdateStoryboard()
  const submitting = computed(() => createMutate.isPending.value || updateMutate.isPending.value)

  async function handleSubmit() {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    try {
      if (isEdit.value && editorStoryboardId.value) {
        await updateMutate.mutateAsync({
          storyboardId: editorStoryboardId.value,
          params: { ...form },
          projectId: projectId.value
        })
        ElMessage.success('已保存')
      } else {
        await createMutate.mutateAsync({
          projectId: projectId.value,
          params: { ...form, source: 'manual' } as any
        })
        ElMessage.success('已创建')
      }
      storyboardStore.closeEditor()
    } catch (err) {
      logger.apiError('Storyboard', isEdit.value ? 'update' : 'create', err)
      ElMessage.error(isEdit.value ? '保存失败' : '创建失败')
    }
  }

  function handleClose() {
    storyboardStore.closeEditor()
  }
</script>

<style lang="scss" scoped>
  .text-sm {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
