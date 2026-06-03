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
  import { storeToRefs } from 'pinia'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import {
    fetchGetScriptList,
    fetchDecomposeScript,
    fetchGetScriptEpisodes,
    fetchGetEpisodeDetail,
    fetchUpdateEpisode,
    fetchDeleteEpisode,
    fetchCreateEpisode
  } from '@/api/script'
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
  const scriptProjectStore = useScriptProjectStore()
  const { currentProjectId, projectList } = storeToRefs(scriptProjectStore)

  // 剧本相关
  const currentScriptId = ref('')
  const scriptOptions = ref<ScriptOption[]>([])

  // 分集列表
  const episodeList = ref<Episode[]>([])
  const selectedEpisodeId = ref('')
  const currentEpisode = ref<Episode | null>(null)

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

  // 加载剧本列表
  const loadScriptList = async (projectId: string) => {
    if (!projectId) {
      scriptOptions.value = []
      return
    }
    try {
      const res = await fetchGetScriptList(projectId)
      const arr = res?.records || []
      scriptOptions.value = arr.map((s: Api.Script.ScriptListItem) => ({
        id: String(s.id),
        title: s.title ?? '未命名剧本'
      }))
      // 自动选中当前store中的scriptId或第一个
      let sid = scriptProjectStore.currentScriptId
      if (!sid && scriptOptions.value.length > 0) {
        sid = scriptOptions.value[0].id
      }
      if (sid) {
        currentScriptId.value = sid
        scriptProjectStore.setCurrentScript(sid)
        await loadEpisodes(projectId, sid)
      }
    } catch {
      scriptOptions.value = []
    }
  }

  // 加载分集列表
  const loadEpisodes = async (projectId: string, scriptId: string) => {
    if (!projectId || !scriptId) {
      episodeList.value = []
      selectedEpisodeId.value = ''
      currentEpisode.value = null
      return
    }
    try {
      const res = await fetchGetScriptEpisodes(projectId, scriptId)
      const arr = res ?? []
      episodeList.value = arr.map((ep: Api.Script.Episode) => ({
        id: String(ep.id),
        projectId: String(ep.projectId ?? projectId),
        scriptId: String(ep.scriptId ?? scriptId),
        episodeName: ep.episodeName ?? '',
        content: ep.content ?? '',
        episodeIndex: ep.episodeIndex ?? 0,
        createTime: ep.createTime ?? '',
        updateTime: ep.updateTime ?? ''
      }))
      // 默认选中第一个
      if (episodeList.value.length > 0) {
        await handleEpisodeClick(episodeList.value[0])
      } else {
        selectedEpisodeId.value = ''
        currentEpisode.value = null
      }
    } catch {
      episodeList.value = []
      selectedEpisodeId.value = ''
      currentEpisode.value = null
    }
  }

  // 项目切换
  const handleProjectChange = (projectId: string) => {
    scriptProjectStore.setCurrentProject(projectId)
    currentScriptId.value = ''
    episodeList.value = []
    selectedEpisodeId.value = ''
    currentEpisode.value = null
    loadScriptList(projectId)
  }

  const handleProjectRefresh = () => {
    loadScriptList(currentProjectId.value)
    ElMessage.success('数据已刷新')
  }

  // 剧本切换
  const handleScriptChange = (scriptId: string) => {
    scriptProjectStore.setCurrentScript(scriptId)
    loadEpisodes(currentProjectId.value, scriptId)
  }

  // 点击分集
  const handleEpisodeClick = async (item: Episode) => {
    selectedEpisodeId.value = item.id
    try {
      const detail = await fetchGetEpisodeDetail(currentScriptId.value, item.id)
      const ep = detail as Api.Script.EpisodeDetail
      currentEpisode.value = {
        id: String(ep.id),
        projectId: String(ep.projectId ?? currentProjectId.value),
        scriptId: String(ep.scriptId ?? currentScriptId.value),
        episodeName: ep.episodeName ?? '',
        content: ep.content ?? '',
        episodeIndex: ep.episodeIndex ?? 0,
        createTime: ep.createTime ?? '',
        updateTime: ep.updateTime ?? ''
      }
      // 填充编辑表单
      episodeForm.episodeName = currentEpisode.value.episodeName
      episodeForm.content = currentEpisode.value.content
      episodeForm.episodeIndex = currentEpisode.value.episodeIndex
    } catch {
      // 使用列表数据回退
      currentEpisode.value = { ...item }
      episodeForm.episodeName = item.episodeName
      episodeForm.content = item.content
      episodeForm.episodeIndex = item.episodeIndex
    }
  }

  // 编辑分集（点击编辑图标，等同于选中）
  const handleEditEpisode = (item: Episode) => {
    handleEpisodeClick(item)
  }

  // 保存分集
  const handleSaveEpisode = async () => {
    if (!episodeFormRef.value || !currentEpisode.value) return
    await episodeFormRef.value.validate(async (valid) => {
      if (!valid) return
      saving.value = true
      try {
        const params: EpisodeFormParams = {
          episodeName: episodeForm.episodeName,
          content: episodeForm.content,
          episodeIndex: episodeForm.episodeIndex
        }
        await fetchUpdateEpisode(currentScriptId.value, currentEpisode.value!.id, params)
        ElMessage.success('分集保存成功')
        // 更新列表中的数据
        const idx = episodeList.value.findIndex((e) => e.id === currentEpisode.value!.id)
        if (idx !== -1) {
          episodeList.value[idx] = {
            ...episodeList.value[idx],
            episodeName: params.episodeName ?? episodeList.value[idx].episodeName,
            content: params.content ?? episodeList.value[idx].content,
            episodeIndex: params.episodeIndex ?? episodeList.value[idx].episodeIndex
          }
        }
        // 同步更新currentEpisode
        currentEpisode.value = {
          ...currentEpisode.value!,
          ...params
        }
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
        await fetchDeleteEpisode(currentScriptId.value, item.id)
        ElMessage.success('分集删除成功')
        // 从列表中移除
        episodeList.value = episodeList.value.filter((e) => e.id !== item.id)
        // 如果删除的是当前选中的，重置
        if (selectedEpisodeId.value === item.id) {
          if (episodeList.value.length > 0) {
            await handleEpisodeClick(episodeList.value[0])
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
        const res = await fetchCreateEpisode(currentProjectId.value, params)
        ElMessage.success('分集创建成功')
        createDialogVisible.value = false
        // 刷新列表
        await loadEpisodes(currentProjectId.value, currentScriptId.value)
        // 选中新创建的分集
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
      const res = await fetchDecomposeScript(currentProjectId.value, currentScriptId.value, true)
      if (res?.status === 'PROCESSING') {
        ElMessage.success('AI拆解任务已提交，请稍后刷新查看结果')
      } else {
        ElMessage.success('AI拆解完成')
        await loadEpisodes(currentProjectId.value, currentScriptId.value)
      }
    } catch {
      ElMessage.error('AI拆解失败')
    }
  }

  // 初始化
  onMounted(() => {
    loadScriptList(currentProjectId.value)
  })
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
