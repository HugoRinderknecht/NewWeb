<template>
  <div class="storyboard-scene-page art-full-height" v-loading="isLoading">
    <ElAlert
      v-if="hasError"
      type="error"
      :title="errorMessage"
      show-icon
      :closable="false"
      class="mb-4"
    />
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">场景编排</span>
            <ElSelect v-model="currentStoryboard" placeholder="选择分镜" style="width: 220px">
              <ElOption
                v-for="sb in storyboardOptions"
                :key="sb.id"
                :label="`${sb.code} ${sb.name}`"
                :value="sb.id"
              />
            </ElSelect>
          </div>
          <ElSpace>
            <ElButton :disabled="selectedScenes.length === 0" @click="handleBatchEdit">
              <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
              批量编辑
            </ElButton>
            <ElButton type="primary" @click="handleSave">
              <ArtSvgIcon icon="ri:save-line" class="mr-1" />
              保存编排
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 场景列表 -->
      <div class="scene-list">
        <VueDraggable
          v-model="sceneList"
          handle=".drag-handle"
          class="scene-draggable"
          @end="handleDragEnd"
        >
          <div
            v-for="(element, index) in sceneList"
            :key="element.id"
            class="scene-item"
            :class="{ active: selectedScenes.includes(element.id) }"
            @click="handleSelectScene(element, $event)"
          >
            <div class="drag-handle">
              <ArtSvgIcon icon="ri:drag-move-2-line" />
            </div>
            <div class="scene-number">{{ index + 1 }}</div>
            <div class="scene-content">
              <div class="scene-header flex-cb">
                <div class="flex items-center gap-3">
                  <ElCheckbox
                    :model-value="selectedScenes.includes(element.id)"
                    @click.stop
                    @change="(val: any) => handleCheckboxChange(element.id, Boolean(val))"
                  />
                  <span class="scene-name font-medium">{{ element.name }}</span>
                  <ElTag :type="getSceneTypeTag(element.type)" size="small">
                    {{ getSceneTypeLabel(element.type) }}
                  </ElTag>
                </div>
                <ElSpace>
                  <ElButton type="primary" link size="small" @click.stop="handleEditScene(element)">
                    <ArtSvgIcon icon="ri:edit-line" />
                  </ElButton>
                  <ElButton
                    type="danger"
                    link
                    size="small"
                    @click.stop="handleDeleteScene(element)"
                  >
                    <ArtSvgIcon icon="ri:delete-bin-line" />
                  </ElButton>
                </ElSpace>
              </div>
              <div class="scene-body">
                <ElRow :gutter="16">
                  <ElCol :span="8">
                    <div class="scene-param">
                      <span class="param-label">背景：</span>
                      <span class="param-value">{{ element.background }}</span>
                    </div>
                  </ElCol>
                  <ElCol :span="8">
                    <div class="scene-param">
                      <span class="param-label">时间：</span>
                      <span class="param-value">{{ element.time }}</span>
                    </div>
                  </ElCol>
                  <ElCol :span="8">
                    <div class="scene-param">
                      <span class="param-label">氛围：</span>
                      <span class="param-value">{{ element.mood }}</span>
                    </div>
                  </ElCol>
                </ElRow>
                <div class="scene-shots mt-2">
                  <ElSpace>
                    <span class="text-xs text-g-400">包含镜头：</span>
                    <ElTag v-for="shot in element.shots" :key="shot" type="info" size="small">
                      {{ shot }}
                    </ElTag>
                  </ElSpace>
                </div>
              </div>
            </div>
          </div>
        </VueDraggable>
      </div>
    </ElCard>

    <!-- 编辑场景弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <ElForm :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="场景名称" prop="name" required>
              <ElInput v-model="form.name" placeholder="请输入场景名称" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="场景类型" prop="type" required>
              <ElSelect v-model="form.type" placeholder="请选择场景类型" class="w-full">
                <ElOption
                  v-for="item in sceneTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="8">
            <ElFormItem label="背景设定">
              <ElInput v-model="form.background" placeholder="例如：竹林、宫殿" />
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="时间设定">
              <ElSelect v-model="form.time" placeholder="请选择时间" class="w-full">
                <ElOption label="清晨" value="清晨" />
                <ElOption label="上午" value="上午" />
                <ElOption label="中午" value="中午" />
                <ElOption label="下午" value="下午" />
                <ElOption label="黄昏" value="黄昏" />
                <ElOption label="夜晚" value="夜晚" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="氛围">
              <ElSelect v-model="form.mood" placeholder="请选择氛围" class="w-full">
                <ElOption label="神秘" value="神秘" />
                <ElOption label="紧张" value="紧张" />
                <ElOption label="温馨" value="温馨" />
                <ElOption label="悲伤" value="悲伤" />
                <ElOption label="欢快" value="欢快" />
                <ElOption label="恐怖" value="恐怖" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="场景描述">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入场景描述"
          />
        </ElFormItem>
        <ElFormItem label="包含镜头">
          <ElSelect v-model="form.shots" multiple placeholder="请选择包含的镜头" class="w-full">
            <ElOption v-for="shot in shotOptions" :key="shot" :label="shot" :value="shot" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="镜头参数">
          <ElRow :gutter="16">
            <ElCol :span="8">
              <ElFormItem label="光圈" label-width="50px">
                <ElInput v-model="form.aperture" placeholder="f/2.8" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="ISO" label-width="50px">
                <ElInputNumber v-model="form.iso" :min="100" :max="12800" class="w-full" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="8">
              <ElFormItem label="色温" label-width="50px">
                <ElInputNumber v-model="form.colorTemp" :min="2000" :max="10000" class="w-full" />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 批量编辑弹窗 -->
    <ElDialog v-model="batchDialogVisible" title="批量编辑场景" width="600px">
      <ElForm :model="batchForm" label-width="100px">
        <ElFormItem label="场景类型">
          <ElSelect v-model="batchForm.type" placeholder="不修改" clearable class="w-full">
            <ElOption
              v-for="item in sceneTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="时间设定">
          <ElSelect v-model="batchForm.time" placeholder="不修改" clearable class="w-full">
            <ElOption label="清晨" value="清晨" />
            <ElOption label="上午" value="上午" />
            <ElOption label="中午" value="中午" />
            <ElOption label="下午" value="下午" />
            <ElOption label="黄昏" value="黄昏" />
            <ElOption label="夜晚" value="夜晚" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="氛围">
          <ElSelect v-model="batchForm.mood" placeholder="不修改" clearable class="w-full">
            <ElOption label="神秘" value="神秘" />
            <ElOption label="紧张" value="紧张" />
            <ElOption label="温馨" value="温馨" />
            <ElOption label="悲伤" value="悲伤" />
            <ElOption label="欢快" value="欢快" />
            <ElOption label="恐怖" value="恐怖" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="batchDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleBatchSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { VueDraggable } from 'vue-draggable-plus'
  import { useRoute } from 'vue-router'
  import {
    useStoryboardList,
    useSceneList,
    useCreateScene,
    useDeleteScene,
    useUpdateScene,
    useReorderStoryboards
  } from '@/api/queries/storyboard'
  import { useProjectStore } from '@/store/modules/project'

  defineOptions({ name: 'StoryboardScene' })

  const route = useRoute()
  const projectStore = useProjectStore()

  type SceneType = 'interior' | 'exterior' | 'mixed' | 'studio'

  interface StoryboardOption {
    id: number
    code: string
    name: string
  }

  interface SceneItem {
    id: number
    storyboardId: number
    name: string
    type: SceneType
    background: string
    time: string
    mood: string
    description: string
    shots: string[]
    aperture: string
    iso: number
    colorTemp: number
  }

  const dialogVisible = ref(false)
  const batchDialogVisible = ref(false)
  const isEdit = ref(false)
  const currentScene = ref<SceneItem | null>(null)
  const selectedScenes = ref<number[]>([])
  const currentStoryboard = ref<number>(1)
  const currentEpisode = ref<number>(1)
  const formRef = ref<FormInstance>()

  const projectId = computed(
    () => (route.params.projectId as string) || projectStore.currentProjectId || ''
  )

  const {
    data: storyboardListData,
    isLoading: listLoading,
    error: listError
  } = useStoryboardList(projectId)

  const isLoading = computed(() => listLoading.value)
  const hasError = computed(() => !!listError.value)
  const errorMessage = computed(() => {
    if (!listError.value) return ''
    return (listError.value as Error)?.message || '加载数据失败，请稍后重试'
  })

  const storyboardOptions = computed<StoryboardOption[]>(() => {
    const data = storyboardListData.value
    if (!data) return []
    const list = Array.isArray(data) ? data : (data as any).records || []
    return list.map((item: any) => ({
      id: item.id,
      code: item.code ?? '',
      name: item.name ?? ''
    })) as StoryboardOption[]
  })

  watch(
    storyboardOptions,
    (opts) => {
      if (opts.length > 0 && !opts.find((o) => o.id === currentStoryboard.value)) {
        currentStoryboard.value = opts[0].id
      }
    },
    { immediate: true }
  )

  const sceneTypeOptions = [
    { label: '内景', value: 'interior' },
    { label: '外景', value: 'exterior' },
    { label: '虚实结合', value: 'mixed' },
    { label: '摄影棚', value: 'studio' }
  ]

  const getSceneTypeTag = (type: SceneType) => {
    const map: Record<SceneType, 'primary' | 'success' | 'warning' | 'info'> = {
      interior: 'primary',
      exterior: 'success',
      mixed: 'warning',
      studio: 'info'
    }
    return map[type]
  }

  const getSceneTypeLabel = (type: SceneType) => {
    const map: Record<SceneType, string> = {
      interior: '内景',
      exterior: '外景',
      mixed: '虚实结合',
      studio: '摄影棚'
    }
    return map[type]
  }

  const episodeIdForScene = computed(() => String(currentEpisode.value))

  const { data: sceneListDataRaw, refetch: refetchSceneList } = useSceneList(episodeIdForScene)

  const shotOptions = computed<string[]>(() => {
    const data = sceneListDataRaw.value
    if (!data || !Array.isArray(data)) return []
    const allShots = new Set<string>()
    data.forEach((s: any) => {
      if (Array.isArray(s.shots)) {
        s.shots.forEach((shot: string) => allShots.add(shot))
      }
    })
    return Array.from(allShots)
  })

  const form = reactive<Partial<SceneItem>>({
    name: '',
    type: 'exterior',
    background: '',
    time: '清晨',
    mood: '神秘',
    description: '',
    shots: [],
    aperture: 'f/2.8',
    iso: 400,
    colorTemp: 5600
  })

  const batchForm = reactive<Partial<SceneItem>>({
    type: undefined,
    time: '',
    mood: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入场景名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择场景类型', trigger: 'change' }]
  }

  const sceneListData = computed<SceneItem[]>(() => {
    const data = sceneListDataRaw.value
    if (!data || !Array.isArray(data)) return []
    return data.map((s: any) => ({
      id: s.id ?? Date.now() + Math.random(),
      storyboardId: currentStoryboard.value,
      name: s.name ?? s.description ?? '',
      type: (s.angle ?? s.type ?? 'exterior') as SceneType,
      background: s.background ?? '',
      time: s.time ?? '清晨',
      mood: s.mood ?? '神秘',
      description: s.description ?? '',
      shots: s.shots ?? [],
      aperture: s.aperture ?? 'f/2.8',
      iso: s.iso ?? 400,
      colorTemp: s.colorTemp ?? 5600
    })) as SceneItem[]
  })

  const sceneList = computed(() =>
    sceneListData.value.filter((s) => s.storyboardId === currentStoryboard.value)
  )

  const dialogTitle = computed(() => (isEdit.value ? '编辑场景' : '新建场景'))

  const { mutateAsync: createScene } = useCreateScene()
  const { mutateAsync: deleteScene } = useDeleteScene()
  const { mutateAsync: updateScene } = useUpdateScene()
  const { mutateAsync: reorderStoryboards } = useReorderStoryboards()

  const handleSelectScene = (scene: SceneItem, event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('.el-checkbox')) return
    const index = selectedScenes.value.indexOf(scene.id)
    if (index > -1) {
      selectedScenes.value.splice(index, 1)
    } else {
      selectedScenes.value.push(scene.id)
    }
  }

  const handleCheckboxChange = (id: number, checked: boolean) => {
    const index = selectedScenes.value.indexOf(id)
    if (checked && index === -1) {
      selectedScenes.value.push(id)
    } else if (!checked && index > -1) {
      selectedScenes.value.splice(index, 1)
    }
  }

  const handleEditScene = (scene: SceneItem) => {
    isEdit.value = true
    currentScene.value = scene
    Object.assign(form, scene)
    dialogVisible.value = true
  }

  const handleDeleteScene = (scene: SceneItem) => {
    ElMessageBox.confirm(`确定要删除场景「${scene.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await deleteScene({ sceneId: String(scene.id), episodeId: String(currentEpisode.value) })
        await refetchSceneList()
        selectedScenes.value = selectedScenes.value.filter((id) => id !== scene.id)
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除场景失败')
      }
    })
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (isEdit.value && currentScene.value) {
          try {
            await updateScene({
              sceneId: String(currentScene.value.id),
              params: {
                name: form.name,
                description: form.description || '',
                angle: form.type as string,
                episodeId: String(currentEpisode.value)
              }
            })
            await refetchSceneList()
            ElMessage.success('编辑成功')
          } catch {
            ElMessage.error('编辑场景失败')
          }
        } else {
          try {
            await createScene({
              episodeId: String(currentEpisode.value),
              name: form.name!,
              description: form.description || '',
              angle: form.type as string
            } as any)
            await refetchSceneList()
            ElMessage.success('创建成功')
          } catch {
            ElMessage.error('创建场景失败')
          }
        }
        dialogVisible.value = false
      }
    })
  }

  const handleBatchEdit = () => {
    batchForm.type = undefined
    batchForm.time = ''
    batchForm.mood = ''
    batchDialogVisible.value = true
  }

  const handleBatchSubmit = async () => {
    try {
      const updatePromises = selectedScenes.value.map(async (sceneId) => {
        const scene = sceneListData.value.find((s) => s.id === sceneId)
        if (scene) {
          const params: any = { episodeId: String(currentEpisode.value) }
          if (batchForm.type) params.angle = batchForm.type
          if (batchForm.time || batchForm.mood) {
            params.description = [batchForm.time, batchForm.mood, scene.description]
              .filter(Boolean)
              .join(' | ')
          }
          return updateScene({ sceneId: String(sceneId), params })
        }
        return Promise.resolve()
      })
      await Promise.all(updatePromises)
      await refetchSceneList()
      batchDialogVisible.value = false
      selectedScenes.value = []
      ElMessage.success('批量编辑成功')
    } catch {
      ElMessage.error('批量编辑失败')
    }
  }

  onMounted(() => {
    const routeEpisodeId = route.query.episodeId as string
    if (routeEpisodeId) {
      currentEpisode.value = Number(routeEpisodeId) || 1
    }
    if (projectId.value && !projectStore.currentProjectId) {
      projectStore.setCurrentProject(projectId.value)
    }
  })

  const handleDragEnd = async () => {
    try {
      const firstScene = sceneList.value[0]
      if (firstScene) {
        const items = sceneList.value.map((scene, index) => ({
          storyboardId: String(scene.id),
          newOrder: index + 1
        }))
        await reorderStoryboards({
          sceneId: String(firstScene.id),
          items,
          projectId: projectId.value
        })
      }
      ElMessage.success('排序已更新')
    } catch {
      ElMessage.error('更新排序失败')
    }
  }

  const handleSave = async () => {
    try {
      const sceneId = sceneList.value[0]?.id
      if (sceneId) {
        const items = sceneList.value.map((scene, index) => ({
          storyboardId: String(scene.id),
          newOrder: index + 1
        }))
        await reorderStoryboards({ sceneId: String(sceneId), items, projectId: projectId.value })
      }
      ElMessage.success('场景编排保存成功')
    } catch {
      ElMessage.error('保存编排失败')
    }
  }
</script>

<style lang="scss" scoped>
  .scene-list {
    .scene-draggable {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .scene-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 16px;
      cursor: pointer;
      background: var(--el-fill-color-lighter);
      border: 2px solid transparent;
      border-radius: var(--custom-radius);
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary-light-7);
      }

      &.active {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }

      .drag-handle {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        color: var(--el-text-color-secondary);
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }

      .scene-number {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        background: var(--el-color-primary);
        border-radius: 50%;
      }

      .scene-content {
        flex: 1;
        min-width: 0;

        .scene-header {
          margin-bottom: 8px;

          .scene-name {
            color: var(--el-text-color-primary);
          }
        }

        .scene-body {
          .scene-param {
            font-size: 13px;

            .param-label {
              color: var(--el-text-color-secondary);
            }

            .param-value {
              color: var(--el-text-color-primary);
            }
          }
        }
      }
    }
  }
</style>
