<template>
  <div class="storyboard-design-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">分镜设计</span>
            <ElSelect v-model="filterEpisode" placeholder="选择剧集" clearable style="width: 180px">
              <ElOption
                v-for="ep in episodeOptions"
                :key="ep.id"
                :label="`第${ep.number}集：${ep.name}`"
                :value="ep.id"
              />
            </ElSelect>
            <ElTag v-if="currentEpisode" type="info" size="small">
              剧集：{{ currentEpisode.name }}
            </ElTag>
            <ElTag v-else type="info" size="small">请选择剧集</ElTag>
          </div>
          <ElSpace>
            <ElInput v-model="searchQuery" placeholder="搜索分镜" clearable style="width: 220px">
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterSource" placeholder="来源筛选" clearable style="width: 140px">
              <ElOption label="剧本生成" value="script" />
              <ElOption label="手动创建" value="manual" />
              <ElOption label="AI辅助" value="ai" />
            </ElSelect>
            <ElButton type="primary" @click="handleCreate">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建分镜
            </ElButton>
            <ElButton @click="handleAutoGenerate">
              <ArtSvgIcon icon="ri:magic-line" class="mr-1" />
              剧本生成
            </ElButton>
            <ElButton type="success" @click="handleAIGenerate">
              <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
              AI辅助
            </ElButton>
            <ElButton type="warning" @click="handleSubmitReview">
              <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
              提交审核
            </ElButton>
            <ElButton @click="handleWithdrawReview">
              <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />
              撤回审核
            </ElButton>
            <ElButton type="info" @click="handleViewVersions">
              <ArtSvgIcon icon="ri:history-line" class="mr-1" />
              版本历史
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="storyboard-stats mb-6">
        <ElRow :gutter="16">
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon primary">
                <ArtSvgIcon icon="ri:movie-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ storyboardList.length }}</div>
                <div class="stat-label">总分镜数</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon success">
                <ArtSvgIcon icon="ri:file-list-3-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ scriptGeneratedCount }}</div>
                <div class="stat-label">剧本生成</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon warning">
                <ArtSvgIcon icon="ri:user-add-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ manualCount }}</div>
                <div class="stat-label">手动创建</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon info">
                <ArtSvgIcon icon="ri:robot-2-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ aiGeneratedCount }}</div>
                <div class="stat-label">AI辅助</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <!-- 可视化分镜板 -->
      <ArtStoryboardPanel
        v-model="filteredList"
        @select="handleStoryboardSelect"
        @add="handleStoryboardAdd"
        @delete="handleStoryboardDelete"
        @batch-delete="handleStoryboardBatchDelete"
        @reorder="handleStoryboardReorder"
      />

      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>

    <!-- 新建/编辑分镜弹窗 -->
    <ElDialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <ElForm :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <ElFormItem label="分镜名称" prop="name" required>
          <ElInput v-model="form.name" placeholder="请输入分镜名称" />
        </ElFormItem>
        <ElFormItem label="关联场景">
          <ElSelect v-model="form.sceneId" placeholder="请选择关联场景" class="w-full">
            <ElOption
              v-for="scene in sceneOptions"
              :key="scene.id"
              :label="scene.name"
              :value="scene.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="分镜描述">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入分镜描述"
          />
        </ElFormItem>
        <ElFormItem label="缩略图">
          <ElUpload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleThumbChange"
          >
            <img v-if="form.thumbnail" :src="form.thumbnail" class="avatar" />
            <div v-else class="avatar-uploader-icon">
              <ArtSvgIcon icon="ri:add-line" />
              <div class="upload-text">点击上传</div>
            </div>
          </ElUpload>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 查看分镜详情弹窗 -->
    <ElDialog v-model="viewDialogVisible" title="分镜详情" width="700px">
      <div v-if="currentItem" class="storyboard-detail">
        <div class="detail-header">
          <div class="detail-thumb">
            <ElImage v-if="currentItem.thumbnail" :src="currentItem.thumbnail" fit="cover" />
            <div v-else class="thumb-placeholder flex-cc">
              <ArtSvgIcon icon="ri:image-line" class="text-g-400" />
            </div>
          </div>
          <div class="detail-info">
            <h3 class="text-lg font-medium">{{ currentItem.name }}</h3>
            <ElSpace>
              <ElTag :type="getSourceTag(currentItem.source)" size="small">
                {{ getSourceLabel(currentItem.source) }}
              </ElTag>
              <ElTag :type="getStatusTag(currentItem.status)" size="small">
                {{ getStatusLabel(currentItem.status) }}
              </ElTag>
              <span class="text-sm text-g-400">{{ currentItem.code }}</span>
            </ElSpace>
          </div>
        </div>
        <ElDivider />
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="关联场景">{{ currentItem.sceneName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="镜头数量">{{ currentItem.shotCount }} 个</ElDescriptionsItem>
          <ElDescriptionsItem label="总时长">{{ currentItem.duration }} 秒</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">{{
            getStatusLabel(currentItem.status)
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ currentItem.createTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ currentItem.updateTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="描述" :span="2">{{
            currentItem.description || '-'
          }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElDialog>

    <!-- 版本历史弹窗 -->
    <ElDialog v-model="versionDialogVisible" title="分镜版本历史" width="700px" destroy-on-close>
      <ElTimeline>
        <ElTimelineItem
          v-for="(version, index) in versionList"
          :key="version.id"
          :type="index === 0 ? 'primary' : undefined"
          :timestamp="version.createTime"
          placement="top"
        >
          <ElCard shadow="hover">
            <div class="flex-cb">
              <div>
                <div class="font-medium">版本 V{{ version.version }}</div>
                <div class="text-g-400 text-sm mt-1">操作人: {{ version.operator }}</div>
              </div>
              <ElButton type="warning" size="small" @click="handleRollback(version)">
                回退到此版本
              </ElButton>
            </div>
          </ElCard>
        </ElTimelineItem>
      </ElTimeline>
    </ElDialog>

    <!-- AI辅助生成弹窗 -->
    <ElDialog v-model="aiDialogVisible" title="AI辅助生成分镜" width="600px">
      <ElForm :model="aiForm" label-width="100px">
        <ElFormItem label="生成方式">
          <ElRadioGroup v-model="aiForm.mode">
            <ElRadioButton value="script">基于剧本</ElRadioButton>
            <ElRadioButton value="prompt">基于描述</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem v-if="aiForm.mode === 'script'" label="选择剧本">
          <ElSelect v-model="aiForm.scriptId" placeholder="请选择剧本" class="w-full">
            <ElOption
              v-for="script in scriptOptions"
              :key="script.id"
              :label="script.name"
              :value="script.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="生成数量">
          <ElSlider v-model="aiForm.count" :min="1" :max="20" show-stops />
        </ElFormItem>
        <ElFormItem label="描述提示">
          <ElInput
            v-model="aiForm.prompt"
            type="textarea"
            :rows="4"
            placeholder="请输入分镜描述提示词，AI将根据此生成对应的分镜..."
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="aiDialogVisible = false">取消</ElButton>
        <ElButton type="success" :loading="aiLoading" @click="handleAISubmit">
          <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
          开始生成
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import { useRoute } from 'vue-router'
  import {
    fetchGetStoryboardList,
    fetchCreateStoryboard,
    fetchDeleteStoryboard,
    fetchUpdateStoryboard,
    fetchBatchDeleteStoryboards,
    fetchSubmitStoryboardReview,
    fetchWithdrawStoryboardReview,
    fetchGetStoryboardVersions,
    fetchRollbackStoryboardVersion,
    fetchGetSceneList,
    fetchReorderStoryboards,
    fetchDecomposeStoryboard
  } from '@/api/storyboard'
  import { fetchGetProjectEpisodes, fetchGetScriptList } from '@/api/script'

  defineOptions({ name: 'StoryboardDesign' })

  const route = useRoute()

  type StoryboardSource = 'script' | 'manual' | 'ai'
  type StoryboardStatus = 'draft' | 'designing' | 'completed' | 'archived'

  interface StoryboardItem {
    id: string
    code: string
    name: string
    source: StoryboardSource
    sceneId: string
    sceneName: string
    episodeId: string
    description: string
    thumbnail: string
    shotCount: number
    duration: number
    status: StoryboardStatus
    order: number
    projectId: string
    createTime: string
    updateTime: string
  }

  interface SceneOption {
    id: string
    name: string
  }

  interface EpisodeOption {
    id: string
    number: number
    name: string
  }

  const searchQuery = ref('')
  const filterSource = ref<StoryboardSource | ''>('')
  const filterEpisode = ref<string | ''>('')
  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const versionDialogVisible = ref(false)
  const aiDialogVisible = ref(false)
  const aiLoading = ref(false)
  const isEdit = ref(false)
  const currentItem = ref<StoryboardItem | null>(null)
  const formRef = ref<FormInstance>()

  const versionList = ref<Api.Storyboard.StoryboardVersion[]>([])

  const loadVersionList = async (storyboardId: string) => {
    try {
      const res = await fetchGetStoryboardVersions(storyboardId)
      if (res && Array.isArray(res)) {
        versionList.value = res
      }
    } catch {
      console.error('加载版本历史失败')
    }
  }

  const currentEpisode = computed(() =>
    episodeOptions.value.find((ep) => ep.id === filterEpisode.value)
  )

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const getSourceTag = (source: StoryboardSource) => {
    const map: Record<StoryboardSource, 'primary' | 'success' | 'info'> = {
      script: 'success',
      manual: 'primary',
      ai: 'info'
    }
    return map[source]
  }

  const getSourceLabel = (source: StoryboardSource) => {
    const map: Record<StoryboardSource, string> = {
      script: '剧本生成',
      manual: '手动创建',
      ai: 'AI辅助'
    }
    return map[source]
  }

  const getStatusTag = (status: StoryboardStatus) => {
    const map: Record<StoryboardStatus, 'info' | 'primary' | 'success' | 'warning'> = {
      draft: 'info',
      designing: 'primary',
      completed: 'success',
      archived: 'warning'
    }
    return map[status]
  }

  const getStatusLabel = (status: StoryboardStatus) => {
    const map: Record<StoryboardStatus, string> = {
      draft: '草稿',
      designing: '设计中',
      completed: '已完成',
      archived: '已归档'
    }
    return map[status]
  }

  const sceneOptions = ref<SceneOption[]>([])

  const loadSceneOptions = async () => {
    try {
      if (!filterEpisode.value) return
      const res = await fetchGetSceneList(String(filterEpisode.value))
      if (res && Array.isArray(res)) {
        sceneOptions.value = res.map((s: any) => ({
          id: s.id,
          name: s.name ?? s.description ?? ''
        })) as SceneOption[]
      }
    } catch {
      console.error('加载场景选项失败')
    }
  }

  const episodeOptions = ref<EpisodeOption[]>([])

  const loadEpisodeOptions = async () => {
    try {
      const projectId = (route.params.projectId as string) || '1'
      const res = await fetchGetProjectEpisodes(projectId)
      if (res && Array.isArray(res)) {
        episodeOptions.value = res.map((ep: any) => ({
          id: ep.id,
          number: ep.episodeIndex ?? ep.number ?? 1,
          name: ep.title ?? ep.name ?? ''
        })) as EpisodeOption[]
      }
    } catch {
      console.error('加载剧集选项失败')
    }
  }

  const form = reactive<Partial<StoryboardItem>>({
    name: '',
    sceneId: undefined,
    sceneName: '',
    description: '',
    thumbnail: ''
  })

  const aiForm = reactive({
    mode: 'script' as 'script' | 'prompt',
    scriptId: '',
    count: 5,
    prompt: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入分镜名称', trigger: 'blur' }]
  }

  const storyboardList = ref<StoryboardItem[]>([])

  const mapStatus = (status: number | string): StoryboardStatus => {
    const map: Record<number, StoryboardStatus> = {
      1: 'draft',
      2: 'designing',
      3: 'completed',
      4: 'archived'
    }
    if (typeof status === 'number') return map[status] || 'draft'
    return (status as StoryboardStatus) || 'draft'
  }

  const scriptOptions = ref<Array<{ id: string; name: string }>>([])

  const loadScriptOptions = async () => {
    try {
      const projectId = (route.params.projectId as string) || '1'
      const res = await fetchGetScriptList(projectId)
      if (res) {
        const list = (res as any).records || res || []
        scriptOptions.value = list.map((s: any) => ({
          id: s.id,
          name: s.title ?? s.name ?? ''
        }))
      }
    } catch {
      console.error('加载剧本选项失败')
    }
  }

  watch(filterEpisode, () => {
    loadSceneOptions()
    loadStoryboardList()
  })

  const loadStoryboardList = async () => {
    try {
      const projectId = (route.params.projectId as string) || '1'
      const params: Api.Storyboard.StoryboardSearchParams = {
        page: pagination.current,
        pageSize: pagination.size
      }
      if (filterEpisode.value) {
        params.episodeId = String(filterEpisode.value)
      }
      if (filterSource.value) {
        params.keyword = filterSource.value
      }
      if (searchQuery.value) {
        params.keyword = searchQuery.value
      }
      const res = await fetchGetStoryboardList(projectId, params)
      if (res) {
        const list = res.records || []
        storyboardList.value = list.map((item: any) => ({
          id: item.id,
          code: item.title ? `SB-${String(item.storyboardNo ?? item.id).padStart(3, '0')}` : '',
          name: item.title ?? item.name ?? '',
          source: (item.source ?? 'manual') as StoryboardSource,
          sceneId: String(item.sceneId ?? ''),
          sceneName: item.sceneName ?? '',
          episodeId: String(item.episodeId ?? ''),
          description: item.description ?? '',
          thumbnail: item.thumbnail ?? '',
          shotCount: item.shotCount ?? 0,
          duration: item.durationSeconds ?? item.duration ?? 0,
          status: mapStatus(item.status),
          order: item.storyboardNo ?? item.order ?? 0,
          projectId: String(item.projectId ?? ''),
          createTime: item.createTime ?? '',
          updateTime: item.updateTime ?? ''
        })) as StoryboardItem[]
        pagination.total = res.total ?? 0
      }
    } catch {
      ElMessage.error('加载分镜列表失败')
    }
  }

  const filteredList = computed(() => {
    let result = storyboardList.value

    if (filterEpisode.value !== '') {
      result = result.filter((item) => item.episodeId === filterEpisode.value)
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      )
    }

    if (filterSource.value) {
      result = result.filter((item) => item.source === filterSource.value)
    }

    return result
  })

  const scriptGeneratedCount = computed(
    () => storyboardList.value.filter((i) => i.source === 'script').length
  )
  const manualCount = computed(
    () => storyboardList.value.filter((i) => i.source === 'manual').length
  )
  const aiGeneratedCount = computed(
    () => storyboardList.value.filter((i) => i.source === 'ai').length
  )

  watch(filteredList, (list) => {
    pagination.total = list.length
  })

  const dialogTitle = computed(() => (isEdit.value ? '编辑分镜' : '新建分镜'))

  const handleCreate = () => {
    isEdit.value = false
    form.name = ''
    form.sceneId = undefined
    form.sceneName = ''
    form.description = ''
    form.thumbnail = ''
    dialogVisible.value = true
  }

  const handleAutoGenerate = () => {
    if (!filterEpisode.value) {
      ElMessage.warning('请先选择剧集')
      return
    }
    ElMessageBox.confirm('将根据剧本内容自动生成分镜，是否继续？', '剧本生成', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        const projectId = (route.params.projectId as string) || '1'
        await fetchCreateStoryboard(projectId, {
          episodeId: String(filterEpisode.value),
          source: 'script',
          status: 1
        })
        await loadStoryboardList()
        ElMessage.success('剧本生成分镜成功')
      } catch {
        ElMessage.error('剧本生成分镜失败')
      }
    })
  }

  const handleAIGenerate = () => {
    aiForm.mode = 'script'
    aiForm.scriptId = ''
    aiForm.count = 5
    aiForm.prompt = ''
    aiDialogVisible.value = true
  }

  const handleAISubmit = async () => {
    if (aiForm.mode === 'script' && !aiForm.scriptId) {
      ElMessage.warning('请选择剧本')
      return
    }
    if (!filterEpisode.value) {
      ElMessage.warning('请先选择剧集')
      return
    }
    aiLoading.value = true
    try {
      const projectId = (route.params.projectId as string) || '1'
      if (aiForm.mode === 'script' && aiForm.scriptId) {
        await fetchDecomposeStoryboard(projectId, aiForm.scriptId, String(filterEpisode.value))
        await loadStoryboardList()
      } else {
        await fetchCreateStoryboard(projectId, {
          episodeId: String(filterEpisode.value),
          source: 'ai',
          description: aiForm.prompt || 'AI根据描述智能生成的分镜',
          status: 1
        })
        await loadStoryboardList()
      }
      aiDialogVisible.value = false
      ElMessage.success('AI生成分镜成功')
    } catch {
      ElMessage.error('AI生成分镜失败')
    } finally {
      aiLoading.value = false
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (isEdit.value && currentItem.value) {
            await fetchUpdateStoryboard(String(currentItem.value.id), {
              name: form.name,
              sceneId: form.sceneId,
              description: form.description,
              thumbnail: form.thumbnail
            })
            ElMessage.success('编辑成功')
          } else {
            const projectId = (route.params.projectId as string) || '1'
            await fetchCreateStoryboard(projectId, {
              name: form.name!,
              source: 'manual',
              sceneId: form.sceneId || '',
              description: form.description || '',
              thumbnail: form.thumbnail || '',
              status: 'draft'
            })
            ElMessage.success('创建成功')
          }
          await loadStoryboardList()
          dialogVisible.value = false
        } catch {
          ElMessage.error(isEdit.value ? '编辑失败' : '创建失败')
        }
      }
    })
  }

  // 可视化分镜板事件
  const handleStoryboardSelect = (item: any) => {
    currentItem.value = item as StoryboardItem
  }

  const handleStoryboardAdd = async (item: any) => {
    try {
      const projectId = (route.params.projectId as string) || '1'
      await fetchCreateStoryboard(projectId, item)
      await loadStoryboardList()
      ElMessage.success('分镜添加成功')
    } catch {
      ElMessage.error('分镜添加失败')
    }
  }

  const handleStoryboardDelete = async (id: string) => {
    try {
      await fetchDeleteStoryboard(String(id))
      await loadStoryboardList()
    } catch {
      ElMessage.error('删除分镜失败')
    }
  }

  const handleStoryboardBatchDelete = async (ids: string[]) => {
    try {
      await fetchBatchDeleteStoryboards(ids.map(String))
      await loadStoryboardList()
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.error('批量删除失败')
    }
  }

  const handleStoryboardReorder = async (list: any[]) => {
    try {
      const updatedIds = new Set(list.map((i) => i.id))
      const unchanged = storyboardList.value.filter((i) => !updatedIds.has(i.id))
      storyboardList.value = [...(list as StoryboardItem[]), ...unchanged].sort(
        (a, b) => a.order - b.order
      )
      // 调用后端排序 API
      const sceneId = list[0]?.sceneId
      if (sceneId) {
        const items = list.map((item, index) => ({
          storyboardId: String(item.id),
          newOrder: index + 1
        }))
        await fetchReorderStoryboards(String(sceneId), items)
      }
      ElMessage.success('分镜顺序已更新')
    } catch {
      ElMessage.error('更新分镜顺序失败')
    }
  }

  const handleThumbChange = (file: UploadFile) => {
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.thumbnail = e.target?.result as string
      }
      reader.readAsDataURL(file.raw)
    }
  }

  const handleSubmitReview = () => {
    ElMessageBox.confirm('确定提交当前分镜进行审核吗？', '提交审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        if (currentItem.value) {
          await fetchSubmitStoryboardReview(String(currentItem.value.id))
        } else if (filteredList.value.length > 0) {
          await fetchSubmitStoryboardReview(String(filteredList.value[0].id))
        }
        ElMessage.success('分镜已提交审核')
      } catch {
        ElMessage.error('提交审核失败')
      }
    })
  }

  const handleWithdrawReview = () => {
    ElMessageBox.confirm('确定撤回审核中的分镜吗？', '撤回审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        if (currentItem.value) {
          await fetchWithdrawStoryboardReview(String(currentItem.value.id))
        } else if (filteredList.value.length > 0) {
          await fetchWithdrawStoryboardReview(String(filteredList.value[0].id))
        }
        ElMessage.success('分镜审核已撤回')
      } catch {
        ElMessage.error('撤回审核失败')
      }
    })
  }

  const handleViewVersions = () => {
    if (currentItem.value) {
      loadVersionList(String(currentItem.value.id))
    }
    versionDialogVisible.value = true
  }

  const handleRollback = (version: Api.Storyboard.StoryboardVersion) => {
    if (!currentItem.value) return
    ElMessageBox.confirm(`确定回退到版本 V${version.version} 吗？`, '版本回退', {
      confirmButtonText: '确定回退',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchRollbackStoryboardVersion(String(currentItem.value!.id), String(version.id))
        await loadStoryboardList()
        ElMessage.success('版本回退成功')
        versionDialogVisible.value = false
      } catch {
        ElMessage.error('版本回退失败')
      }
    })
  }

  // 从路由 query 初始化剧集筛选
  onMounted(() => {
    const episodeId = route.query.episodeId
    if (episodeId) {
      const id = String(episodeId)
      filterEpisode.value = id
    }
    loadEpisodeOptions()
    loadScriptOptions()
    loadStoryboardList()
  })
</script>

<style lang="scss" scoped>
  .storyboard-stats {
    .stat-card {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .stat-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        border-radius: 12px;

        &.primary {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.success {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
        }

        &.warning {
          color: var(--el-color-warning);
          background: var(--el-color-warning-light-9);
        }

        &.info {
          color: var(--el-color-info);
          background: var(--el-color-info-light-9);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          margin-top: 2px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .storyboard-thumb {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    overflow: hidden;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;

    .thumb-image {
      width: 100%;
      height: 100%;
    }

    .thumb-placeholder {
      width: 100%;
      height: 100%;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }

  .storyboard-detail {
    .detail-header {
      display: flex;
      gap: 16px;
      align-items: center;

      .detail-thumb {
        flex-shrink: 0;
        width: 120px;
        height: 80px;
        overflow: hidden;
        background: var(--el-fill-color-lighter);
        border-radius: 8px;

        .thumb-placeholder {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .avatar-uploader {
    :deep(.el-upload) {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 200px;
      height: 120px;
      overflow: hidden;
      cursor: pointer;
      border: 1px dashed var(--el-border-color);
      border-radius: 8px;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    .avatar {
      width: 200px;
      height: 120px;
      object-fit: cover;
    }

    .avatar-uploader-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 24px;
      color: var(--el-text-color-secondary);

      .upload-text {
        margin-top: 4px;
        font-size: 12px;
      }
    }
  }
</style>
