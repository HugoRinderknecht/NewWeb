<template>
  <div class="storyboard-scene-page art-full-height">
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
  import { fetchGetSceneList, fetchCreateScene } from '@/api/storyboard'

  defineOptions({ name: 'StoryboardScene' })

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

  const storyboardOptions: StoryboardOption[] = [
    { id: 1, code: 'SB-001', name: '开场·山巅俯瞰' },
    { id: 2, code: 'SB-002', name: '九尾狐现身' },
    { id: 3, code: 'SB-003', name: '对话·寻药之旅' },
    { id: 4, code: 'SB-004', name: '昆仑仙境' },
    { id: 5, code: 'SB-005', name: '白泽授业' }
  ]

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

  const shotOptions = [
    '山巅全景',
    '主角面部特写',
    '山腰近景',
    '九尾狐全景',
    '对话过肩',
    '竹林远景',
    '战斗场面',
    '日出特写'
  ]

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

  const sceneListData = ref<SceneItem[]>([])

  const mockSceneData: SceneItem[] = [
    {
      id: 1,
      storyboardId: 1,
      name: '青丘山·竹林',
      type: 'exterior',
      background: '竹林环绕的仙山',
      time: '清晨',
      mood: '神秘',
      description: '青丘山竹林深处，晨雾缭绕，阳光透过竹叶洒下斑驳光影',
      shots: ['山巅全景', '主角面部特写', '竹林远景'],
      aperture: 'f/2.8',
      iso: 400,
      colorTemp: 5600
    },
    {
      id: 2,
      storyboardId: 1,
      name: '昆仑墟·仙境',
      type: 'mixed',
      background: '云雾缭绕的仙境',
      time: '上午',
      mood: '神秘',
      description: '昆仑墟仙境，仙鹤飞舞，琼楼玉宇若隐若现',
      shots: ['山巅全景', '九尾狐全景'],
      aperture: 'f/4',
      iso: 200,
      colorTemp: 6500
    },
    {
      id: 3,
      storyboardId: 2,
      name: '幽都·城门',
      type: 'exterior',
      background: '阴森恐怖的城门',
      time: '夜晚',
      mood: '恐怖',
      description: '幽都城门，鬼火闪烁，阴风阵阵，亡魂游荡',
      shots: ['战斗场面', '主角面部特写'],
      aperture: 'f/1.8',
      iso: 3200,
      colorTemp: 3200
    },
    {
      id: 4,
      storyboardId: 3,
      name: '不周山·天柱',
      type: 'exterior',
      background: '断裂的天柱',
      time: '黄昏',
      mood: '紧张',
      description: '不周山天柱断裂，天河水倾泻而下',
      shots: ['山巅全景', '战斗场面'],
      aperture: 'f/5.6',
      iso: 800,
      colorTemp: 4500
    },
    {
      id: 5,
      storyboardId: 3,
      name: '东海·日出',
      type: 'exterior',
      background: '东海海面',
      time: '清晨',
      mood: '温馨',
      description: '东海海面，太阳从海平线升起，金光万道',
      shots: ['日出特写', '山巅全景'],
      aperture: 'f/8',
      iso: 200,
      colorTemp: 6000
    },
    {
      id: 1001,
      storyboardId: 3,
      name: '竹林夜话',
      type: 'exterior',
      background: '竹林深处',
      time: '夜晚',
      mood: '静谧',
      description: '月光洒落竹林，主角与同伴商讨寻药路线',
      shots: ['竹林远景', '对话过肩'],
      aperture: 'f/2.8',
      iso: 800,
      colorTemp: 4200
    },
    {
      id: 1002,
      storyboardId: 4,
      name: '仙池倒影',
      type: 'mixed',
      background: '昆仑仙池',
      time: '黄昏',
      mood: '空灵',
      description: '仙池水面倒映出昆仑群山，云雾在水面缓缓流动',
      shots: ['山巅全景', '九尾狐全景'],
      aperture: 'f/5.6',
      iso: 200,
      colorTemp: 5000
    },
    {
      id: 1003,
      storyboardId: 5,
      name: '古卷研读',
      type: 'studio',
      background: '白泽书房',
      time: '夜晚',
      mood: '庄重',
      description: '白泽翻开上古卷轴，向主角讲解仙药的炼制之法',
      shots: ['主角面部特写', '对话过肩'],
      aperture: 'f/4',
      iso: 800,
      colorTemp: 3500
    },
    {
      id: 1004,
      storyboardId: 3,
      name: '药庐秘方',
      type: 'interior',
      background: '山中药庐',
      time: '下午',
      mood: '温馨',
      description: '药庐内主角翻阅古方，为寻药之旅做最后准备',
      shots: ['主角面部特写', '竹林远景'],
      aperture: 'f/5.6',
      iso: 400,
      colorTemp: 5200
    }
  ]

  const loadSceneList = async () => {
    try {
      const episodeId = String(currentEpisode.value)
      const res = await fetchGetSceneList(episodeId)
      if (res && Array.isArray(res) && res.length > 0) {
        sceneListData.value = res.map((s: any) => ({
          id: s.id ?? Date.now() + Math.random(),
          storyboardId: currentStoryboard.value,
          name: s.name ?? '',
          type: (s.type ?? 'exterior') as SceneType,
          background: s.background ?? '',
          time: s.time ?? '清晨',
          mood: s.mood ?? '神秘',
          description: s.description ?? '',
          shots: s.shots ?? [],
          aperture: s.aperture ?? 'f/2.8',
          iso: s.iso ?? 400,
          colorTemp: s.colorTemp ?? 5600
        })) as SceneItem[]
        return
      }
    } catch {
      // fallback to mock data
    }
    sceneListData.value = mockSceneData
  }

  const sceneList = computed({
    get: () => sceneListData.value.filter((s) => s.storyboardId === currentStoryboard.value),
    set: (val) => {
      const otherScenes = sceneListData.value.filter(
        (s) => s.storyboardId !== currentStoryboard.value
      )
      sceneListData.value = [...otherScenes, ...val]
    }
  })

  const dialogTitle = computed(() => (isEdit.value ? '编辑场景' : '新建场景'))

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
    }).then(() => {
      sceneListData.value = sceneListData.value.filter((item) => item.id !== scene.id)
      selectedScenes.value = selectedScenes.value.filter((id) => id !== scene.id)
      ElMessage.success('删除成功')
    })
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (isEdit.value && currentScene.value) {
          const index = sceneListData.value.findIndex((i) => i.id === currentScene.value!.id)
          if (index !== -1) {
            sceneListData.value[index] = {
              ...sceneListData.value[index],
              ...form
            } as SceneItem
          }
          ElMessage.success('编辑成功')
        } else {
          try {
            await fetchCreateScene({
              name: form.name!,
              type: form.type as SceneType,
              background: form.background || '',
              time: form.time || '清晨',
              mood: form.mood || '神秘',
              description: form.description || '',
              shots: form.shots || [],
              storyboardId: currentStoryboard.value
            } as any)
            await loadSceneList()
            ElMessage.success('创建成功')
          } catch {
            const newScene: SceneItem = {
              id: Date.now(),
              storyboardId: currentStoryboard.value,
              name: form.name!,
              type: form.type as SceneType,
              background: form.background || '',
              time: form.time || '清晨',
              mood: form.mood || '神秘',
              description: form.description || '',
              shots: form.shots || [],
              aperture: form.aperture || 'f/2.8',
              iso: form.iso || 400,
              colorTemp: form.colorTemp || 5600
            }
            sceneListData.value.push(newScene)
            ElMessage.success('创建成功')
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

  const handleBatchSubmit = () => {
    sceneListData.value = sceneListData.value.map((scene) => {
      if (selectedScenes.value.includes(scene.id)) {
        return {
          ...scene,
          ...(batchForm.type && { type: batchForm.type }),
          ...(batchForm.time && { time: batchForm.time }),
          ...(batchForm.mood && { mood: batchForm.mood })
        }
      }
      return scene
    })
    batchDialogVisible.value = false
    selectedScenes.value = []
    ElMessage.success('批量编辑成功')
  }

  onMounted(() => {
    loadSceneList()
  })

  const handleDragEnd = () => {
    ElMessage.success('排序已更新')
  }

  const handleSave = () => {
    ElMessage.success('场景编排保存成功')
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
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary-light-7);
      }

      &.active {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      .drag-handle {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-text-color-secondary);
        cursor: grab;
        flex-shrink: 0;

        &:active {
          cursor: grabbing;
        }
      }

      .scene-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--el-color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
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
