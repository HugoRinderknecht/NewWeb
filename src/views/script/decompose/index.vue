<template>
  <div class="script-decompose-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本拆解</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElSelect
              v-model="currentScriptId"
              placeholder="选择剧本"
              clearable
              style="width: 220px"
              @change="handleScriptChange"
            >
              <ElOption
                v-for="script in scriptOptions"
                :key="script.id"
                :label="script.title"
                :value="script.id"
              />
            </ElSelect>
          </div>
          <ElSpace>
            <ElButton type="primary" @click="handleDecompose">
              <ArtSvgIcon icon="ri:ai-generate" class="mr-1" />
              AI拆解
            </ElButton>
            <ElButton @click="handleCreateEpisode">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建分集
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="16" class="h-full">
        <!-- 左栏：分集列表 -->
        <ElCol :span="8">
          <div class="episode-panel">
            <div class="panel-header flex-cb mb-4">
              <span class="font-medium">分集列表</span>
              <span class="text-xs text-g-400">共 {{ episodeList.length }} 集</span>
            </div>
            <div v-if="episodeList.length > 0" class="episode-items">
              <div
                v-for="item in episodeList"
                :key="item.id"
                class="episode-item"
                :class="{ active: selectedEpisodeId === item.id }"
                @click="handleEpisodeClick(item)"
              >
                <div class="flex-cb">
                  <div class="flex-c">
                    <div class="episode-number">{{ item.episodeIndex }}</div>
                    <div class="episode-info">
                      <div class="font-medium">{{ item.episodeName }}</div>
                      <div class="text-xs text-g-400 mt-1 truncate" style="max-width: 180px">
                        {{ truncateContent(item.content, 50) }}
                      </div>
                    </div>
                  </div>
                  <ElSpace :size="4" @click.stop>
                    <ElButton type="primary" link size="small" @click="handleEditEpisode(item)">
                      <ArtSvgIcon icon="ri:edit-line" />
                    </ElButton>
                    <ElButton type="danger" link size="small" @click="handleDeleteEpisode(item)">
                      <ArtSvgIcon icon="ri:delete-bin-line" />
                    </ElButton>
                  </ElSpace>
                </div>
              </div>
            </div>
            <ElEmpty v-else description="暂无分集数据" />
          </div>
        </ElCol>

        <!-- 右栏：分集详情/编辑 -->
        <ElCol :span="16">
          <div v-if="currentEpisode" class="episode-detail-panel">
            <div class="panel-header flex-cb mb-4">
              <span class="font-medium">分集详情</span>
              <ElButton type="primary" size="small" :loading="saving" @click="handleSaveEpisode">
                <ArtSvgIcon icon="ri:save-line" class="mr-1" />
                保存
              </ElButton>
            </div>
            <ElForm
              ref="episodeFormRef"
              :model="episodeForm"
              :rules="episodeRules"
              label-width="90px"
              label-position="top"
            >
              <ElRow :gutter="16">
                <ElCol :span="12">
                  <ElFormItem label="分集名称" prop="episodeName">
                    <ElInput v-model="episodeForm.episodeName" placeholder="请输入分集名称" />
                  </ElFormItem>
                </ElCol>
                <ElCol :span="6">
                  <ElFormItem label="排序号" prop="episodeIndex">
                    <ElInputNumber
                      v-model="episodeForm.episodeIndex"
                      :min="0"
                      :max="9999"
                      style="width: 100%"
                    />
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElFormItem label="分集内容" prop="content">
                <ElInput
                  v-model="episodeForm.content"
                  type="textarea"
                  :rows="20"
                  placeholder="请输入分集内容"
                  resize="vertical"
                />
              </ElFormItem>
            </ElForm>
          </div>
          <ElEmpty v-else description="请选择左侧分集查看详情" />
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 新建分集弹窗 -->
    <ElDialog
      v-model="createDialogVisible"
      title="新建分集"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <ElFormItem label="分集名称" prop="episodeName">
          <ElInput v-model="createForm.episodeName" placeholder="请输入分集名称" />
        </ElFormItem>
        <ElFormItem label="排序号" prop="episodeIndex">
          <ElInputNumber
            v-model="createForm.episodeIndex"
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="分集内容" prop="content">
          <ElInput
            v-model="createForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入分集内容"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="creating" @click="handleCreateSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { useWritableProjectId } from '@/hooks/core/useCurrentProjectId'
  import {
    useScriptList,
    useEpisodeDetail,
    useCreateEpisode,
    useUpdateEpisode,
    useDeleteEpisode,
    useProjectList,
    useScriptEpisodes,
    useDecomposeScript
  } from '@/api/queries'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'

  defineOptions({ name: 'ScriptDecompose' })

  interface Episode {
    id: string
    projectId: string
    scriptId: string
    episodeName: string
    content: string
    episodeIndex: number
    createTime: string
    updateTime: string
  }

  interface EpisodeFormParams {
    scriptId?: string
    episodeName?: string
    episodeIndex?: number
    content?: string
  }

  interface ScriptOption {
    id: string
    title: string
  }

  // Store
  const { currentProjectId, domainStore: scriptProjectStore } =
    useWritableProjectId(useScriptProjectStore)

  // ==================== 状态变量（需先于 Vue Query Hooks 定义，避免 TDZ） ====================
  // 剧本相关
  const currentScriptId = ref('')

  // 分集列表
  const selectedEpisodeId = ref('')
  const currentEpisode = ref<Episode | null>(null)

  // ==================== Vue Query Hooks ====================
  const scriptListQuery = useScriptList(currentProjectId)

  // ==================== 统一数据层：项目列表 ====================
  const projectListQuery = useProjectList({
    current: 1,
    size: 100
  } as Api.Project.ProjectSearchParams)
  const projectList = computed(() => {
    const records = projectListQuery.data.value?.records || []
    return records.map((p) => ({
      id: p.id,
      name: p.projectName,
      scriptCount: undefined
    }))
  })

  // ==================== 统一数据层：剧本分集列表 ====================
  const scriptEpisodesQuery = useScriptEpisodes(
    currentProjectId,
    computed(() => currentScriptId.value || undefined)
  )
  const episodeList = computed<Episode[]>(() => {
    const arr = scriptEpisodesQuery.data.value ?? []
    return arr.map((ep: Api.Script.Episode) => ({
      id: String(ep.id),
      projectId: String(ep.projectId ?? currentProjectId.value),
      scriptId: String(ep.scriptId ?? currentScriptId.value),
      episodeName: ep.episodeName ?? '',
      content: ep.content ?? '',
      episodeIndex: ep.episodeIndex ?? 0,
      createTime: ep.createTime ?? '',
      updateTime: ep.updateTime ?? ''
    }))
  })

  const episodeDetailQuery = useEpisodeDetail(
    currentProjectId,
    computed(() => currentScriptId.value || undefined),
    computed(() => selectedEpisodeId.value || undefined)
  )

  const createEpisodeMutation = useCreateEpisode()
  const updateEpisodeMutation = useUpdateEpisode()
  const deleteEpisodeMutation = useDeleteEpisode()
  const decomposeMutation = useDecomposeScript()

  // 剧本选项从 query 数据派生
  const scriptOptions = computed(() => {
    const data = scriptListQuery.data?.value
    if (!data?.records) return []
    return data.records.map((s: Api.Script.ScriptListItem) => ({
      id: String(s.id),
      title: s.title ?? '未命名剧本'
    }))
  })

  // 编辑表单
  const episodeFormRef = ref<FormInstance>()
  const saving = ref(false)
  const episodeForm = reactive<EpisodeFormParams>({
    episodeName: '',
    content: '',
    episodeIndex: 0
  })

  const episodeRules: FormRules = {
    episodeName: [{ required: true, message: '请输入分集标识', trigger: 'blur' }]
  }

  // 新建分集弹窗
  const createDialogVisible = ref(false)
  const createFormRef = ref<FormInstance>()
  const creating = ref(false)
  const createForm = reactive<EpisodeFormParams>({
    episodeName: '',
    content: '',
    episodeIndex: 0
  })

  const createRules: FormRules = {
    episodeName: [{ required: true, message: '请输入分集标识', trigger: 'blur' }]
  }

  // 工具方法
  const truncateContent = (content: string, maxLen: number) => {
    if (!content) return ''
    return content.length > maxLen ? content.slice(0, maxLen) + '...' : content
  }

  // 自动选中剧本
  watch(
    () => scriptListQuery.data?.value,
    (data) => {
      if (!data?.records || currentScriptId.value) return
      const arr = data.records
      let sid = scriptProjectStore.currentScriptId
      if (!sid && arr.length > 0) {
        sid = String(arr[0].id)
      }
      if (sid) {
        currentScriptId.value = sid
        scriptProjectStore.setCurrentScript(sid)
      }
    }
  )

  // 分集列表变化时自动选中第一个
  watch(episodeList, (list) => {
    if (list.length > 0 && !selectedEpisodeId.value) {
      handleEpisodeClick(list[0])
    } else if (list.length === 0) {
      selectedEpisodeId.value = ''
      currentEpisode.value = null
    }
  })

  // 监听分集详情，更新编辑表单
  watch(
    () => episodeDetailQuery.data?.value,
    (detail) => {
      if (!selectedEpisodeId.value) return
      const listFallback = episodeList.value.find((item) => item.id === selectedEpisodeId.value) ?? null
      const source = (detail as Api.Script.EpisodeDetail | null) ?? listFallback
      if (!source) return

      currentEpisode.value = {
        id: String(source.id),
        projectId: String(source.projectId ?? currentProjectId.value),
        scriptId: String(source.scriptId ?? currentScriptId.value),
        episodeName: source.episodeName ?? '',
        content: source.content ?? '',
        episodeIndex: source.episodeIndex ?? 0,
        createTime: source.createTime ?? '',
        updateTime: source.updateTime ?? ''
      }
      episodeForm.episodeName = currentEpisode.value.episodeName
      episodeForm.content = currentEpisode.value.content
      episodeForm.episodeIndex = currentEpisode.value.episodeIndex
    }
  )

  // 项目切换
  const handleProjectChange = (projectId: string) => {
    scriptProjectStore.setCurrentProject(projectId)
    currentScriptId.value = ''
    selectedEpisodeId.value = ''
    currentEpisode.value = null
  }

  const handleProjectRefresh = () => {
    scriptListQuery.refetch()
    scriptEpisodesQuery.refetch()
    ElMessage.success('数据已刷新')
  }

  // 剧本切换
  const handleScriptChange = (scriptId: string) => {
    scriptProjectStore.setCurrentScript(scriptId)
    selectedEpisodeId.value = ''
    currentEpisode.value = null
  }

  // 点击分集
  const handleEpisodeClick = async (item: Episode) => {
    selectedEpisodeId.value = item.id
    // 立即使用列表数据填充表单（详情查询会自动更新）
    currentEpisode.value = { ...item }
    episodeForm.episodeName = item.episodeName
    episodeForm.content = item.content
    episodeForm.episodeIndex = item.episodeIndex
  }

  // 编辑分集（点击编辑图标，等同于选中）
  const handleEditEpisode = (item: Episode) => {
    handleEpisodeClick(item)
  }

  // 保存分集
  const handleSaveEpisode = async () => {
    if (!episodeFormRef.value || !currentEpisode.value) return
    if (!currentProjectId.value || !currentScriptId.value || !currentEpisode.value.id) {
      ElMessage.error('当前分集上下文不完整，无法保存')
      return
    }
    if (String(currentEpisode.value.scriptId) !== String(currentScriptId.value)) {
      ElMessage.error('当前分集与所选剧本不一致，请重新选择分集后再保存')
      return
    }
    await episodeFormRef.value.validate(async (valid) => {
      if (!valid) return
      saving.value = true
      try {
        const params: EpisodeFormParams = {
          episodeName: episodeForm.episodeName,
          content: episodeForm.content,
          episodeIndex: episodeForm.episodeIndex
        }
        const savedEpisode = (await updateEpisodeMutation.mutateAsync({
          projectId: currentProjectId.value,
          scriptId: currentScriptId.value,
          episodeId: currentEpisode.value.id,
          params
        })) as Api.Script.EpisodeDetail
        ElMessage.success('分集保存成功')
        // 同步更新 currentEpisode 与表单，避免被旧列表数据回填
        currentEpisode.value = {
          ...currentEpisode.value!,
          ...params,
          projectId: String(savedEpisode?.projectId ?? currentProjectId.value),
          scriptId: String(savedEpisode?.scriptId ?? currentScriptId.value),
          createTime: savedEpisode?.createTime ?? currentEpisode.value.createTime,
          updateTime: savedEpisode?.updateTime ?? currentEpisode.value.updateTime
        }
        episodeForm.episodeName = currentEpisode.value.episodeName
        episodeForm.content = currentEpisode.value.content
        episodeForm.episodeIndex = currentEpisode.value.episodeIndex
        await Promise.all([scriptEpisodesQuery.refetch(), episodeDetailQuery.refetch()])
      } catch {
        ElMessage.error('分集保存失败')
      } finally {
        saving.value = false
      }
    })
  }

  // 删除分集
  const handleDeleteEpisode = (item: Episode) => {
    ElMessageBox.confirm(`确定要删除分集「${item.episodeName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await deleteEpisodeMutation.mutateAsync({
          scriptId: currentScriptId.value,
          episodeId: item.id,
          projectId: currentProjectId.value
        })
        ElMessage.success('分集删除成功')
        // 如果删除的是当前选中的，重置
        if (selectedEpisodeId.value === item.id) {
          const remaining = episodeList.value.filter((e) => e.id !== item.id)
          if (remaining.length > 0) {
            await handleEpisodeClick(remaining[0])
          } else {
            selectedEpisodeId.value = ''
            currentEpisode.value = null
          }
        }
        // 更新项目分集数
        scriptProjectStore.updateEpisodeCount(currentProjectId.value, -1)
      } catch {
        ElMessage.error('分集删除失败')
      }
    })
  }

  // 新建分集
  const handleCreateEpisode = () => {
    createForm.episodeName = ''
    createForm.content = ''
    createForm.episodeIndex = episodeList.value.length + 1
    createDialogVisible.value = true
  }

  const handleCreateSubmit = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (!valid) return
      creating.value = true
      try {
        const params: EpisodeFormParams = {
          scriptId: currentScriptId.value,
          episodeName: createForm.episodeName,
          content: createForm.content,
          episodeIndex: createForm.episodeIndex
        }
        const res = await createEpisodeMutation.mutateAsync({
          projectId: currentProjectId.value,
          scriptId: currentScriptId.value,
          params
        })
        ElMessage.success('分集创建成功')
        createDialogVisible.value = false
        // 刷新列表后选中新创建的分集
        await scriptEpisodesQuery.refetch()
        if (res?.id) {
          const found = episodeList.value.find((e) => e.id === String(res.id))
          if (found) {
            await handleEpisodeClick(found)
          }
        }
        // 更新项目分集数
        scriptProjectStore.updateEpisodeCount(currentProjectId.value, 1)
      } catch {
        ElMessage.error('分集创建失败')
      } finally {
        creating.value = false
      }
    })
  }

  // AI拆解
  const handleDecompose = async () => {
    if (!currentScriptId.value) {
      ElMessage.warning('请先选择剧本')
      return
    }
    try {
      await ElMessageBox.confirm(
        'AI将自动拆解剧本为分集，已有分集数据可能被覆盖，是否继续？',
        'AI拆解确认',
        {
          confirmButtonText: '确定拆解',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true
        }
      )
    } catch {
      return
    }
    try {
      ElMessage.info('AI拆解进行中，请稍候...')
      const res = await decomposeMutation.mutateAsync({
        projectId: currentProjectId.value,
        scriptId: currentScriptId.value,
        force: true
      })
      if (res?.status === 'PROCESSING') {
        ElMessage.success('AI拆解任务已提交，请稍后刷新查看结果')
      } else {
        ElMessage.success('AI拆解完成')
      }
    } catch {
      ElMessage.error('AI拆解失败')
    }
  }

  // 初始化 - Vue Query 自动管理数据获取
  // 当 currentProjectId 变化时 scriptListQuery 会自动 refetch
  // 当 currentScriptId 变化时 scriptEpisodesQuery 会自动 refetch
</script>

<style lang="scss" scoped>
  .script-decompose-page {
    .episode-panel {
      height: calc(100vh - 240px);
      padding-right: 8px;
      overflow-y: auto;

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
    }

    .panel-header {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .episode-items {
      .episode-item {
        padding: 12px;
        margin-bottom: 8px;
        cursor: pointer;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: var(--custom-radius);
        transition: all 0.2s;

        &.active {
          background: var(--el-color-primary-light-9);
          border-left: 3px solid var(--el-color-primary);
        }

        &:hover {
          border-color: var(--el-color-primary-light-5);
        }

        .episode-number {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          margin-right: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
          border-radius: 50%;
        }

        .episode-info {
          flex: 1;
          min-width: 0;
        }
      }
    }

    .episode-detail-panel {
      height: calc(100vh - 240px);
      padding: 0 16px;
      overflow-y: auto;

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
    }
  }
</style>
