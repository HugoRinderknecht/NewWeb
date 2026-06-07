<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="560px"
    align-center
    destroy-on-close
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="选择剧本" prop="scriptId">
        <ElSelect
          v-model="form.scriptId"
          placeholder="请选择剧本"
          filterable
          class="w-full"
          :loading="scriptsLoading"
          @change="onScriptChange"
        >
          <ElOption
            v-for="s in scripts"
            :key="s.id"
            :label="s.name"
            :value="s.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="选择分集" prop="episodeId">
        <ElSelect
          v-model="form.episodeId"
          placeholder="请选择分集"
          filterable
          class="w-full"
          :loading="episodesLoading"
          :disabled="!form.scriptId"
        >
          <ElOption
            v-for="ep in filteredEpisodes"
            :key="ep.id"
            :label="`第${ep.number}集：${ep.name}`"
            :value="ep.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem v-if="type === 'rebuild'" label="修改说明" prop="reason">
        <ElInput
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请描述需要调整的方向，如：强化人物内心戏、把高潮提前到第三幕"
        />
      </ElFormItem>

      <ElFormItem label="风格配置">
        <ElSelect v-model="form.styleConfigId" placeholder="可选" clearable class="w-full">
          <ElOption label="电影感 cinematic" value="cinematic" />
          <ElOption label="动漫风 anime" value="anime" />
          <ElOption label="水墨风 ink" value="ink" />
          <ElOption label="3D 渲染 3d" value="3d" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem>
        <ElCheckbox v-model="form.force">
          强制重处理（已有分镜时也将覆盖）
        </ElCheckbox>
      </ElFormItem>

      <ElAlert type="info" :closable="false" class="ai-hint">
        AI 任务会异步执行，提交后可前往
        <ElButton link type="primary" @click="openTaskCenter">AI 任务中心</ElButton>
        查看进度。
      </ElAlert>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">
        <ArtSvgIcon icon="ri:magic-line" class="mr-1" />开始{{ type === 'decompose' ? '拆解' : '重建' }}
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
  import { useDecomposeStoryboard, useRebuildStoryboard } from '@/api/queries/storyboard'
  import { useProjectEpisodes } from '@/api/queries/project'
  import { fetchGetScriptList } from '@/api/script'

  const route = useRoute()
  const projectStore = useProjectStore()
  const storyboardStore = useStoryboardStore()
  const { aiDialogOpen, aiDialogType } = storeToRefs(storyboardStore)

  const type = computed(() => aiDialogType.value)
  const title = computed(() => (type.value === 'decompose' ? 'AI 拆解分镜' : 'AI 重建分镜'))

  const visible = computed({
    get: () => aiDialogOpen.value,
    set: (v) => {
      if (!v) storyboardStore.closeAiDialog()
    }
  })

  const projectId = computed(() => {
    const fromRoute = (route.params.projectId as string) || (route.query.projectId as string)
    return fromRoute || storyboardStore.activeProjectId || projectStore.currentProjectId || ''
  })

  const scripts = ref<Array<{ id: string; name: string }>>([])
  const scriptsLoading = ref(false)
  async function loadScripts() {
    if (!projectId.value) {
      scripts.value = []
      return
    }
    scriptsLoading.value = true
    try {
      const res: any = await fetchGetScriptList(projectId.value)
      const list = res?.records || res || []
      scripts.value = (Array.isArray(list) ? list : []).map((s: any) => ({
        id: String(s.id || s.scriptId),
        name: s.title || s.name || s.scriptName || `剧本 #${s.id}`
      }))
    } catch {
      scripts.value = []
    } finally {
      scriptsLoading.value = false
    }
  }
  watch(visible, (v) => {
    if (v) loadScripts()
  })

  const form = reactive({
    scriptId: '',
    episodeId: '',
    styleConfigId: '',
    force: false,
    reason: ''
  })
  const formRef = ref<FormInstance>()

  const rules = computed<FormRules>(() => ({
    scriptId: [{ required: true, message: '请选择剧本', trigger: 'change' }],
    episodeId: [{ required: true, message: '请选择分集', trigger: 'change' }],
    reason: type.value === 'rebuild' ? [{ required: true, message: '请填写修改说明', trigger: 'blur' }] : []
  }))

  const { data: episodesData, isLoading: episodesLoading } = useProjectEpisodes(projectId)
  const episodes = computed<any[]>(() => (episodesData.value as any) || [])
  const filteredEpisodes = computed(() =>
    episodes.value
      .filter((ep: any) => String(ep.scriptId || '') === form.scriptId)
      .map((ep: any, idx: number) => ({
        id: String(ep.id || idx + 1),
        number: ep.number || ep.episodeNumber || ep.episodeIndex || idx + 1,
        name: ep.name || ep.title || ep.episodeName || `第${idx + 1}集`
      }))
  )

  function onScriptChange() {
    form.episodeId = ''
  }

  // 提交
  const decomposeMutate = useDecomposeStoryboard()
  const rebuildMutate = useRebuildStoryboard()
  const submitting = computed(
    () => decomposeMutate.isPending.value || rebuildMutate.isPending.value
  )

  async function handleSubmit() {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    if (!projectId.value) {
      ElMessage.warning('请先选择项目')
      return
    }
    try {
      if (type.value === 'decompose') {
        await decomposeMutate.mutateAsync({
          projectId: projectId.value,
          scriptId: form.scriptId,
          episodeId: form.episodeId,
          styleConfigId: form.styleConfigId || undefined,
          force: form.force
        })
        ElMessage.success('拆解任务已提交，请前往 AI 任务中心查看进度')
      } else {
        await rebuildMutate.mutateAsync({
          projectId: projectId.value,
          scriptId: form.scriptId,
          episodeId: form.episodeId,
          params: {
            storyboardIds: [],
            reason: form.reason,
            force: form.force
          } as any
        })
        ElMessage.success('重建任务已提交，请前往 AI 任务中心查看进度')
      }
      storyboardStore.closeAiDialog()
      storyboardStore.openAiTaskCenter()
    } catch (err) {
      logger.apiError('AI Storyboard', type.value, err)
      ElMessage.error('提交失败')
    }
  }

  function openTaskCenter() {
    storyboardStore.openAiTaskCenter()
  }

  function handleClose() {
    storyboardStore.closeAiDialog()
  }
</script>

<style lang="scss" scoped>
  .ai-hint {
    margin-top: 8px;
  }
</style>
