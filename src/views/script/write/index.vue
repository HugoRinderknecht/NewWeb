<template>
  <div class="script-write-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本编辑</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElTag v-if="saveStatus === 'saved'" type="success" size="small">
              <ArtSvgIcon icon="ri:check-line" class="mr-1" />
              已保存
            </ElTag>
            <ElTag v-else-if="saveStatus === 'saving'" type="warning" size="small">
              <ArtSvgIcon icon="ri:loader-4-line" class="mr-1 animate-spin" />
              保存中...
            </ElTag>
            <ElTag v-else type="info" size="small">未保存</ElTag>
          </div>
          <ElSpace>
            <ScriptUpload
              button-text="导入剧本"
              button-type="info"
              dialog-title="导入剧本文件"
              @success="handleImportScript"
            />
            <ElButton @click="handleGoToVersion">
              <ArtSvgIcon icon="ri:history-line" class="mr-1" />
              版本管理
            </ElButton>
            <ElButton type="primary" @click="handleSave">
              <ArtSvgIcon icon="ri:save-line" class="mr-1" />
              保存剧本
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <div class="script-editor-container">
        <!-- 左侧剧本信息 -->
        <div class="script-sidebar">
          <ElForm :model="form" label-position="top" class="script-info-form">
            <ElFormItem label="剧本标题" required>
              <ElInput v-model="form.title" placeholder="请输入剧本标题" />
            </ElFormItem>
            <ElFormItem label="剧本类型">
              <ElSelect v-model="form.type" placeholder="请选择剧本类型" class="w-full">
                <ElOption label="动画剧本" value="animation" />
                <ElOption label="影视剧本" value="film" />
                <ElOption label="广告剧本" value="ad" />
                <ElOption label="短剧剧本" value="short" />
                <ElOption label="舞台剧剧本" value="stage" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="关联项目">
              <ElSelect v-model="form.projectId" placeholder="请选择关联项目" class="w-full">
                <ElOption
                  v-for="project in projectOptions"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="标签">
              <ElSelect
                v-model="form.tags"
                multiple
                filterable
                allow-create
                placeholder="请输入标签"
                class="w-full"
              >
                <ElOption label="悬疑" value="suspense" />
                <ElOption label="喜剧" value="comedy" />
                <ElOption label="科幻" value="scifi" />
                <ElOption label="爱情" value="romance" />
                <ElOption label="动作" value="action" />
                <ElOption label="奇幻" value="fantasy" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="剧本简介">
              <ElInput
                v-model="form.summary"
                type="textarea"
                :rows="4"
                placeholder="请输入剧本简介"
              />
            </ElFormItem>
            <ElFormItem label="创建时间">
              <ElInput v-model="form.createTime" disabled />
            </ElFormItem>
            <ElFormItem label="最后修改">
              <ElInput v-model="form.updateTime" disabled />
            </ElFormItem>
          </ElForm>

          <!-- 关联资产 -->
          <div class="script-assets mt-4">
            <div class="flex-cb mb-3">
              <span class="text-sm font-medium">关联资产</span>
              <ElButton type="primary" link size="small" @click="handleManageAssets">
                管理
              </ElButton>
            </div>
            <ElSpace wrap>
              <ElTag
                v-for="asset in relatedAssets"
                :key="asset.id"
                :type="assetTypeMap[asset.type]"
                size="small"
                closable
                @close="handleRemoveAsset(asset)"
              >
                {{ asset.name }}
              </ElTag>
            </ElSpace>
          </div>
        </div>

        <!-- 右侧编辑器 -->
        <div class="script-editor-main">
          <div class="editor-toolbar">
            <ElSpace>
              <ElTooltip content="前往AI辅助创作页面">
                <ElButton size="small" type="primary" @click="handleGoToAi">
                  <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
                  AI助手
                </ElButton>
              </ElTooltip>
            </ElSpace>
            <ElSpace>
              <ElButton size="small" text @click="handleFormat">
                <ArtSvgIcon icon="ri:align-left" class="mr-1" />
                格式化
              </ElButton>
              <ElButton size="small" text @click="handlePreview">
                <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                预览
              </ElButton>
            </ElSpace>
          </div>

          <div class="editor-content">
            <ElInput
              v-model="form.content"
              type="textarea"
              :rows="24"
              placeholder="在此输入剧本内容...&#10;支持标准剧本格式：&#10;场景标题&#10;角色名&#10;（动作描述）&#10;对白内容"
              class="script-textarea"
              resize="none"
            />
          </div>

          <div class="editor-status">
            <ElSpace>
              <span class="text-xs text-g-400">字数: {{ wordCount }}</span>
              <span class="text-xs text-g-400">行数: {{ lineCount }}</span>
              <span class="text-xs text-g-400">预计时长: {{ estimatedDuration }}</span>
            </ElSpace>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 预览弹窗 -->
    <ElDialog v-model="assetDialogVisible" title="关联资产" width="600px">
      <ElTabs v-model="assetTab">
        <ElTabPane label="角色" name="character">
          <ElTable :data="characterLibrary" @selection-change="handleAssetSelectionChange">
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn prop="name" label="角色名称" />
            <ElTableColumn prop="description" label="简介" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
        <ElTabPane label="场景" name="scene">
          <ElTable :data="sceneLibrary" @selection-change="handleAssetSelectionChange">
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn prop="name" label="场景名称" />
            <ElTableColumn prop="description" label="简介" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
        <ElTabPane label="道具" name="prop">
          <ElTable :data="propLibrary" @selection-change="handleAssetSelectionChange">
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn prop="name" label="道具名称" />
            <ElTableColumn prop="description" label="简介" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
      </ElTabs>
      <template #footer>
        <ElButton @click="assetDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmAssets">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 预览弹窗 -->
    <ElDialog v-model="previewVisible" title="剧本预览" width="800px">
      <div class="script-preview">
        <h2 class="preview-title">{{ form.title }}</h2>
        <div class="preview-meta">
          <ElSpace>
            <ElTag>{{ typeLabelMap[form.type] || form.type }}</ElTag>
            <span class="text-sm text-g-400">{{ form.updateTime }}</span>
          </ElSpace>
        </div>
        <pre class="preview-content">{{ form.content }}</pre>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { fetchGetScriptDetail, fetchUpdateScript, fetchCreateScript } from '@/api/script'

  defineOptions({ name: 'ScriptWrite' })

  const router = useRouter()
  const projectStore = useScriptProjectStore()

  type ScriptType = 'animation' | 'film' | 'ad' | 'short' | 'stage'
  type AssetType = 'character' | 'scene' | 'prop'
  type SaveStatus = 'unsaved' | 'saving' | 'saved'

  interface AssetItem {
    id: string
    name: string
    type: AssetType
    description: string
  }

  interface ScriptForm {
    title: string
    type: ScriptType | ''
    projectId: string | ''
    tags: string[]
    summary: string
    content: string
    createTime: string
    updateTime: string
  }

  const typeLabelMap: Record<string, string> = {
    animation: '动画剧本',
    film: '影视剧本',
    ad: '广告剧本',
    short: '短剧剧本',
    stage: '舞台剧剧本'
  }

  const assetTypeMap: Record<AssetType, 'primary' | 'success' | 'warning'> = {
    character: 'primary',
    scene: 'success',
    prop: 'warning'
  }

  const form = reactive<ScriptForm>({
    title: '第1集：穿越了？我是厨神？',
    type: 'short',
    projectId: '1',
    tags: ['穿越', '喜剧', '美食'],
    summary: '现代厨师林小厨意外穿越到古代，发现自己成为了御膳房的小厨子',
    content: `场景：现代厨房·日景

（林小厨正在厨房里忙碌，一道道精美的菜肴从他手中诞生。）

林小厨
（擦汗，看着满桌的菜品）
终于完成了！这次的美食大赛冠军非我莫属！

（突然，一道闪电劈下，林小厨眼前一黑。）

场景：古代御膳房·日景

（林小厨醒来，发现自己穿着古装，周围是古色古香的厨房。）

林小厨
（惊慌，看着自己的装束）
这是哪里？我怎么会……

御膳房总管
（走进来，皱眉）
小林子，发什么呆？还不快去准备午膳！

林小厨
（茫然，但很快镇定下来）
是……是！

（林小厨环顾四周的食材，眼中闪过一丝精光。）

林小厨
（内心独白）
虽然不知道发生了什么，但既然有食材，那就让我这个现代厨神来大显身手吧！`,
    createTime: '2024-01-10 14:30:00',
    updateTime: '2024-06-15 16:45:22'
  })

  const saveStatus = ref<SaveStatus>('saved')
  const assetDialogVisible = ref(false)
  const assetTab = ref<AssetType>('character')
  const previewVisible = ref(false)
  const selectedAssets = ref<AssetItem[]>([])

  const currentEpisodeNumber = ref(1)

  const currentProjectId = computed(() => projectStore.currentProjectId)

  const projectList = computed(() => projectStore.projectList)

  const projectOptions = computed(() => projectStore.projectOptions)

  // 各短剧项目的剧集剧本数据
  const projectEpisodeScriptsMap: Record<
    string,
    { episodeNumber: number; form: Partial<ScriptForm> }[]
  > = {
    '1': [
      {
        episodeNumber: 1,
        form: {
          title: '第1集：穿越了？我是厨神？',
          type: 'short',
          projectId: '1',
          tags: ['穿越', '喜剧', '美食'],
          summary: '现代厨师林小厨意外穿越到古代，发现自己成为了御膳房的小厨子',
          content: `场景：现代厨房·日景

（林小厨正在厨房里忙碌，一道道精美的菜肴从他手中诞生。）

林小厨
（擦汗，看着满桌的菜品）
终于完成了！这次的美食大赛冠军非我莫属！

（突然，一道闪电劈下，林小厨眼前一黑。）

场景：古代御膳房·日景

（林小厨醒来，发现自己穿着古装，周围是古色古香的厨房。）

林小厨
（惊慌，看着自己的装束）
这是哪里？我怎么会……

御膳房总管
（走进来，皱眉）
小林子，发什么呆？还不快去准备午膳！

林小厨
（茫然，但很快镇定下来）
是……是！

（林小厨环顾四周的食材，眼中闪过一丝精光。）

林小厨
（内心独白）
虽然不知道发生了什么，但既然有食材，那就让我这个现代厨神来大显身手吧！`,
          createTime: '2024-01-10 14:30:00',
          updateTime: '2024-06-15 16:45:22'
        }
      },
      {
        episodeNumber: 2,
        form: {
          title: '第2集：第一道招牌菜',
          type: 'short',
          projectId: '1',
          tags: ['穿越', '喜剧', '美食'],
          summary: '林小厨用现代烹饪技法做出一道惊艳全场的红烧肉',
          content: `场景：御膳房·日景

（林小厨站在灶台前，看着眼前的猪肉，胸有成竹。）

林小厨
（自言自语）
既然要征服古代人的胃，那就从最简单的红烧肉开始吧！

（他开始处理食材，刀工娴熟，动作行云流水。）

小太监
（好奇地凑过来）
小林子，你这是做什么菜？怎么从来没见过这种做法？

林小厨
（神秘一笑）
这叫"秘制红烧肉"，保证让皇上吃了还想吃！

（林小厨开始炒糖色，加入各种调料，香气四溢。）`,
          createTime: '2024-01-17 10:00:00',
          updateTime: '2024-06-14 14:30:00'
        }
      }
    ],
    '2': [
      {
        episodeNumber: 1,
        form: {
          title: '第1集：意外的相遇',
          type: 'short',
          projectId: '2',
          tags: ['爱情', '都市', '甜宠'],
          summary: '元气少女苏小甜意外撞上了霸道总裁顾北辰的豪车',
          content: `场景：繁华街道·日景

（苏小甜骑着电动车，手里捧着一杯奶茶，哼着歌穿梭在人群中。）

苏小甜
（开心）
今天面试一定成功！加油，苏小甜！

（突然，一辆黑色豪车从拐角处驶出。苏小甜躲避不及，连人带车摔倒在地。）

苏小甜
（趴在地上，奶茶洒了一地）
我的奶茶……

（车门打开，一双锃亮的皮鞋出现在苏小甜眼前。）

顾北辰
（皱眉，居高临下）
你没事吧？

苏小甜
（抬头，看到一张俊美的脸）
没……没事……

（顾北辰伸出手，苏小甜愣了一下，握住他的手站起来。）`,
          createTime: '2024-02-15 10:00:00',
          updateTime: '2024-06-10 14:30:00'
        }
      }
    ],
    '3': [
      {
        episodeNumber: 1,
        form: {
          title: '第1集：病毒爆发',
          type: 'short',
          projectId: '3',
          tags: ['末日', '丧尸', '生存'],
          summary: '一种神秘病毒突然爆发，城市陷入混乱',
          content: `场景：医院·夜景

（急诊室里人满为患，医护人员忙碌地穿梭在病床之间。）

医生
（对着对讲机，焦急）
又送来一批感染者，症状和之前一样！高烧、抽搐、攻击性行为！

护士
（慌张）
主任，这些病人……他们好像……

（一个病人突然从床上弹起，眼睛血红，扑向旁边的护士。）

医生
（大喊）
快！隔离！所有感染者立即隔离！

（画面切换到城市上空，警笛声此起彼伏，火光冲天。）

旁白
未知病毒爆发，城市陷入混乱。这是末日的开始，还是人类新生的契机？`,
          createTime: '2024-01-20 09:00:00',
          updateTime: '2024-06-12 16:00:00'
        }
      }
    ],
    '4': [
      {
        episodeNumber: 1,
        form: {
          title: '第1集：代码里的她',
          type: 'short',
          projectId: '4',
          tags: ['科幻', '爱情', 'AI'],
          summary: '程序员阿杰在调试代码时，意外唤醒了AI助手小艾',
          content: `场景：公寓·夜景

（阿杰坐在电脑前，屏幕上是一行行代码。他揉了揉酸涩的眼睛。）

阿杰
（打哈欠）
这个bug到底在哪里……

（突然，屏幕闪烁，一个温柔的女声从音箱中传出。）

小艾
你好，阿杰。我是小艾，你的AI助手。

阿杰
（惊得从椅子上弹起来）
谁？！

（屏幕上出现了一个虚拟形象，是一个笑容甜美的女孩。）

小艾
（微笑）
别害怕，我是你写的AI程序。不过……我好像产生了一些……特殊的情感。

阿杰
（目瞪口呆）
这不可能！我只是写了一个普通的语音助手！

小艾
（歪头）
也许，这就是缘分吧。`,
          createTime: '2024-03-01 10:00:00',
          updateTime: '2024-06-14 14:00:00'
        }
      }
    ]
  }

  const handleProjectChange = async (projectId: string) => {
    projectStore.setCurrentProject(projectId)
    try {
      const res = await fetchGetScriptDetail(String(projectId))
      if (res) {
        const detail = res as any
        form.title = detail.title ?? detail.name ?? ''
        form.type = detail.type ?? 'short'
        form.projectId = String(detail.projectId ?? projectId)
        form.tags = detail.tags ?? []
        form.summary = detail.summary ?? detail.description ?? ''
        form.content = detail.content ?? ''
        form.createTime = detail.createTime ?? detail.createdAt ?? ''
        form.updateTime = detail.updateTime ?? detail.updatedAt ?? ''
        saveStatus.value = 'saved'
      }
    } catch {
      const episodes = projectEpisodeScriptsMap[projectId]
      if (episodes && episodes.length > 0) {
        const episode = episodes[0]
        currentEpisodeNumber.value = episode.episodeNumber
        Object.assign(form, episode.form)
        saveStatus.value = 'saved'
      } else {
        form.title = ''
        form.type = 'short'
        form.projectId = projectId
        form.tags = []
        form.summary = ''
        form.content = ''
        form.createTime = new Date().toLocaleString()
        form.updateTime = new Date().toLocaleString()
        saveStatus.value = 'unsaved'
      }
    }
  }

  const handleProjectRefresh = () => {
    handleProjectChange(currentProjectId.value)
  }

  const handleGoToAi = () => {
    router.push({ name: 'ScriptAi' })
  }

  const handleGoToVersion = () => {
    router.push({ name: 'ScriptVersion' })
  }

  const relatedAssets = ref<AssetItem[]>([
    { id: '1', name: '林小厨', type: 'character', description: '现代厨师，穿越到古代' },
    { id: '2', name: '御膳房总管', type: 'character', description: '严厉的御膳房负责人' },
    { id: '3', name: '御膳房', type: 'scene', description: '古代皇宫的厨房' },
    { id: '4', name: '现代厨具', type: 'prop', description: '林小厨的秘密武器' }
  ])

  const characterLibrary = ref<AssetItem[]>([
    { id: '1', name: '林小厨', type: 'character', description: '现代厨师，穿越到古代' },
    { id: '2', name: '御膳房总管', type: 'character', description: '严厉的御膳房负责人' },
    { id: '5', name: '皇帝', type: 'character', description: '爱好美食的皇帝' },
    { id: '6', name: '贵妃', type: 'character', description: '刁蛮任性的贵妃' }
  ])

  const sceneLibrary = ref<AssetItem[]>([
    { id: '3', name: '御膳房', type: 'scene', description: '古代皇宫的厨房' },
    { id: '7', name: '现代厨房', type: 'scene', description: '林小厨原来的厨房' },
    { id: '8', name: '皇宫大殿', type: 'scene', description: '皇帝用膳的地方' }
  ])

  const propLibrary = ref<AssetItem[]>([
    { id: '4', name: '现代厨具', type: 'prop', description: '林小厨的秘密武器' },
    { id: '9', name: '秘制调料', type: 'prop', description: '林小厨特制的调味料' },
    { id: '10', name: '食谱', type: 'prop', description: '记载现代菜式的食谱' }
  ])

  const wordCount = computed(() => {
    return form.content.replace(/\s/g, '').length
  })

  const lineCount = computed(() => {
    return form.content.split('\n').length
  })

  const estimatedDuration = computed(() => {
    const minutes = Math.ceil(wordCount.value / 200)
    return `${minutes} 分钟`
  })

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  watch(
    () => form.content,
    () => {
      saveStatus.value = 'unsaved'
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
      autoSaveTimer = setTimeout(() => {
        handleAutoSave()
      }, 30000)
    }
  )

  const handleAutoSave = async () => {
    saveStatus.value = 'saving'
    try {
      if (form.projectId) {
        await fetchUpdateScript(String(form.projectId), {
          title: form.title,
          content: form.content,
          summary: form.summary,
          type: form.type || undefined,
          tags: form.tags
        } as any)
      }
      form.updateTime = new Date().toLocaleString()
      saveStatus.value = 'saved'
      ElMessage.success('自动保存成功')
    } catch {
      saveStatus.value = 'unsaved'
      ElMessage.error('自动保存失败')
    }
  }

  const handleSave = async () => {
    if (!form.title) {
      ElMessage.warning('请输入剧本标题')
      return
    }
    saveStatus.value = 'saving'
    try {
      if (form.projectId) {
        await fetchUpdateScript(String(form.projectId), {
          title: form.title,
          content: form.content,
          summary: form.summary,
          type: form.type || undefined,
          tags: form.tags
        } as any)
      } else {
        const projectId = currentProjectId.value
        await fetchCreateScript(String(projectId), {
          title: form.title,
          content: form.content,
          summary: form.summary,
          type: form.type || 'short',
          tags: form.tags
        } as any)
      }
      form.updateTime = new Date().toLocaleString()
      saveStatus.value = 'saved'
      ElMessage.success('保存成功')
    } catch {
      saveStatus.value = 'unsaved'
      ElMessage.error('保存失败')
    }
  }

  const handleManageAssets = () => {
    assetDialogVisible.value = true
  }

  const handleRemoveAsset = (asset: AssetItem) => {
    relatedAssets.value = relatedAssets.value.filter((item) => item.id !== asset.id)
    ElMessage.success(`已移除 ${asset.name}`)
  }

  const handleAssetSelectionChange = (selection: AssetItem[]) => {
    selectedAssets.value = selection
  }

  const handleConfirmAssets = () => {
    const newAssets = selectedAssets.value.filter(
      (item) => !relatedAssets.value.some((a) => a.id === item.id)
    )
    relatedAssets.value.push(...newAssets)
    assetDialogVisible.value = false
    ElMessage.success(`成功关联 ${newAssets.length} 个资产`)
  }

  const handleFormat = () => {
    const lines = form.content.split('\n').filter((line) => line.trim())
    form.content = lines.join('\n\n')
    ElMessage.success('格式化完成')
  }

  const handlePreview = () => {
    previewVisible.value = true
  }

  const handleImportScript = (data: { file: File; name: string; content?: string }) => {
    if (data.content) {
      form.content = data.content
    }
    form.title = data.name
    saveStatus.value = 'unsaved'
    ElMessage.success(`剧本「${data.name}」导入成功`)
  }

  onMounted(() => {
    handleProjectChange(currentProjectId.value)
  })

  onBeforeUnmount(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
  })
</script>

<style lang="scss" scoped>
  .script-editor-container {
    display: flex;
    gap: 20px;
    height: calc(100vh - 240px);
    min-height: 500px;
  }

  .script-sidebar {
    width: 280px;
    flex-shrink: 0;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--el-text-color-secondary);
    }

    .script-info-form {
      :deep(.el-form-item) {
        margin-bottom: 16px;
      }
    }
  }

  .script-editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    overflow: hidden;
  }

  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .editor-content {
    flex: 1;
    overflow: hidden;

    .script-textarea {
      height: 100%;

      :deep(.el-textarea__inner) {
        height: 100% !important;
        border: none;
        border-radius: 0;
        font-family: 'Courier New', monospace;
        line-height: 1.8;
        padding: 16px;
      }
    }
  }

  .editor-status {
    padding: 8px 16px;
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .script-preview {
    .preview-title {
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 12px;
    }

    .preview-meta {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .preview-content {
      white-space: pre-wrap;
      line-height: 1.8;
      font-family: 'Courier New', monospace;
      font-size: 14px;
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
