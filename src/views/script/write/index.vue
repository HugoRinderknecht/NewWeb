<template>
  <div class="script-write-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本编写</span>
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
            <ElButton @click="handleGoBack()">
              <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
              返回列表
            </ElButton>
            <ElButton type="primary" @click="handleSave">
              <ArtSvgIcon icon="ri:save-line" class="mr-1" />
              保存剧本
            </ElButton>
            <ElButton type="warning" @click="handleSubmitReview">
              <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
              提交审核
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
            <ElFormItem label="剧本描述">
              <ElInput
                v-model="form.description"
                type="textarea"
                :rows="4"
                placeholder="请输入剧本描述"
              />
            </ElFormItem>
            <ElFormItem label="剧本状态">
              <ElSelect v-model="form.status" placeholder="请选择剧本状态" class="w-full">
                <ElOption label="草稿" :value="1" />
                <ElOption label="已完成" :value="2" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="创建者">
              <ElInput v-model="form.creatorName" disabled />
            </ElFormItem>
            <ElFormItem label="创建时间">
              <ElInput v-model="form.createTime" disabled />
            </ElFormItem>
            <ElFormItem label="最后修改">
              <ElInput v-model="form.updateTime" disabled />
            </ElFormItem>
          </ElForm>
        </div>

        <!-- 右侧编辑器 -->
        <div class="script-editor-main">
          <div class="editor-wrapper">
            <ElInput
              v-model="form.content"
              type="textarea"
              placeholder="在此输入剧本内容...&#10;支持标准剧本格式：&#10;场景标题&#10;角色名&#10;（动作描述）&#10;对白内容"
              class="script-textarea"
              resize="none"
            />
          </div>
          <div class="editor-status-bar">
            <span>字数: {{ wordCount }}</span>
            <span>行数: {{ lineCount }}</span>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 引导弹窗：未选择剧本时显示 -->
    <ElDialog
      v-model="showGuideDialog"
      :title="hasScripts ? '请先选择剧本' : '暂无剧本'"
      width="480px"
      align-center
      :close-on-click-modal="false"
      :show-close="false"
      :close-on-press-escape="false"
    >
      <div class="guide-dialog-content">
        <div class="guide-icon">
          <ArtSvgIcon
            :icon="hasScripts ? 'ri:file-list-3-line' : 'ri:folder-open-line'"
            class="text-6xl"
          />
        </div>

        <div v-if="hasScripts" class="guide-text">
          <p class="guide-title">您尚未选择要编辑的剧本</p>
          <p class="guide-desc">
            请返回<span class="highlight">「剧本管理」</span
            >页面，从列表中选择具体剧本后进行编辑操作。
          </p>
        </div>
        <div v-else class="guide-text">
          <p class="guide-title">当前项目下暂无剧本</p>
          <p class="guide-desc">
            您需要先创建或上传剧本才能进行编辑。请返回<span class="highlight">「剧本管理」</span
            >页面：
          </p>
          <ul class="guide-steps">
            <li>
              <ArtSvgIcon icon="ri:add-circle-line" class="step-icon" />
              <span>点击「新建剧本」手动创建</span>
            </li>
            <li>
              <ArtSvgIcon icon="ri:upload-cloud-line" class="step-icon" />
              <span>点击「上传剧本」导入已有文件</span>
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <ElButton type="primary" @click="handleGoBack(true)">
          <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
          返回剧本管理
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter, useRoute } from 'vue-router'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import {
    useScriptDetail,
    useCreateScript,
    useUpdateScript,
    useSubmitScriptReview,
    useProjectList
  } from '@/api/queries'
  // fetchGetScriptList 用于一次性检查，暂保留直接调用
  import { fetchGetScriptList } from '@/api/script'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'

  defineOptions({ name: 'ScriptWrite' })

  const router = useRouter()
  const route = useRoute()
  const scriptProjectStore = useScriptProjectStore()

  // ==================== 状态变量（需先于 Vue Query Hooks 定义，避免 TDZ） ====================
  const scriptId = ref<string>('')
  const isEditMode = ref(false)
  const saveStatus = ref<SaveStatus>('saved')
  const showGuideDialog = ref(false)
  const hasScripts = ref(false)

  // ==================== Vue Query Hooks ====================
  const scriptDetailQuery = useScriptDetail(scriptId)
  const createScriptMutation = useCreateScript()
  const updateScriptMutation = useUpdateScript()
  const submitReviewMutation = useSubmitScriptReview()

  type SaveStatus = 'unsaved' | 'saving' | 'saved'

  interface ScriptForm {
    title: string
    description: string
    content: string
    status: number
    creatorName: string
    createTime: string
    updateTime: string
  }

  const form = reactive<ScriptForm>({
    title: '',
    description: '',
    content: '',
    status: 1,
    creatorName: '',
    createTime: '',
    updateTime: ''
  })

  const currentProjectId = computed({
    get: () => scriptProjectStore.currentProjectId || '',
    set: (val: string) => scriptProjectStore.setCurrentProject(val)
  })

  // ==================== 统一数据层：项目列表 ====================
  // store 中已废弃的 projectList 不再使用，改走 useProjectList Vue Query Hook
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

  const wordCount = computed(() => {
    return form.content.replace(/\s/g, '').length
  })

  const lineCount = computed(() => {
    return form.content ? form.content.split('\n').length : 0
  })

  // 加载剧本详情
  const populateFormFromDetail = (data: Api.Script.ScriptDetail) => {
    form.title = data.title ?? ''
    form.description = data.description ?? ''
    form.content = data.content ?? ''
    form.status = data.status ?? 1
    form.creatorName = data.creatorName ?? ''
    form.createTime = data.createTime ?? ''
    form.updateTime = data.updateTime ?? ''
    saveStatus.value = 'saved'
  }

  const loadScriptDetail = async (id: string) => {
    try {
      const result = await scriptDetailQuery.refetch()
      if (result.data) {
        populateFormFromDetail(result.data)
      }
    } catch {
      ElMessage.error('加载剧本详情失败')
    }
  }

  // 项目切换
  const handleProjectChange = (projectId: string) => {
    scriptProjectStore.setCurrentProject(projectId)
  }

  // 项目刷新
  const handleProjectRefresh = () => {
    if (scriptId.value) {
      loadScriptDetail(scriptId.value)
    }
  }

  // 返回列表
  const handleGoBack = (skipConfirm = false) => {
    if (saveStatus.value === 'unsaved' && !skipConfirm) {
      ElMessageBox.confirm('当前有未保存的更改，确定要离开吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        router.push({ name: 'ScriptLibrary' })
      })
    } else {
      router.push({ name: 'ScriptLibrary' })
    }
  }

  // 保存剧本
  const handleSave = async () => {
    if (!form.title) {
      ElMessage.warning('请输入剧本标题')
      return
    }
    saveStatus.value = 'saving'
    try {
      if (isEditMode.value && scriptId.value) {
        // 编辑模式：更新剧本
        const res = await updateScriptMutation.mutateAsync({
          scriptId: scriptId.value,
          params: {
            title: form.title,
            description: form.description,
            content: form.content,
            status: form.status
          },
          projectId: currentProjectId.value
        })
        if (res) {
          form.updateTime = res.updateTime ?? form.updateTime
        }
      } else {
        // 新建模式：创建剧本
        const projectId = currentProjectId.value
        if (!projectId) {
          ElMessage.warning('请先选择项目')
          saveStatus.value = 'unsaved'
          return
        }
        const res = await createScriptMutation.mutateAsync({
          projectId,
          params: {
            title: form.title,
            description: form.description,
            content: form.content,
            status: form.status
          }
        })
        if (res) {
          scriptId.value = res.id
          isEditMode.value = true
          scriptProjectStore.setCurrentScript(res.id)
          form.creatorName = res.creatorName ?? ''
          form.createTime = res.createTime ?? ''
          form.updateTime = res.updateTime ?? ''
        }
      }
      saveStatus.value = 'saved'
      ElMessage.success('保存成功')
    } catch {
      saveStatus.value = 'unsaved'
      ElMessage.error('保存失败')
    }
  }

  // 提交审核
  const handleSubmitReview = async () => {
    if (!scriptId.value) {
      ElMessage.warning('请先保存剧本后再提交审核')
      return
    }
    if (saveStatus.value === 'unsaved') {
      ElMessage.warning('请先保存剧本后再提交审核')
      return
    }
    try {
      await ElMessageBox.confirm('确定要提交该剧本进行审核吗？', '提交审核', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await submitReviewMutation.mutateAsync({
        scriptId: scriptId.value,
        projectId: currentProjectId.value
      })
      ElMessage.success('已提交审核')
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error('提交审核失败')
      }
    }
  }

  // 自动保存
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  // 组件卸载标志：避免异步回调在卸载后继续修改状态
  let isUnmounted = false

  const handleAutoSave = async () => {
    // 卸载后或缺少上下文时不执行
    if (isUnmounted) return
    if (!isEditMode.value || !scriptId.value) return
    if (!form.title) return
    saveStatus.value = 'saving'
    try {
      const res = await updateScriptMutation.mutateAsync({
        scriptId: scriptId.value,
        params: {
          title: form.title,
          description: form.description,
          content: form.content,
          status: form.status
        },
        projectId: currentProjectId.value
      })
      if (isUnmounted) return
      if (res) {
        form.updateTime = res.updateTime ?? form.updateTime
      }
      saveStatus.value = 'saved'
    } catch {
      if (!isUnmounted) {
        saveStatus.value = 'unsaved'
      }
    }
  }

  watch(
    () => [form.title, form.description, form.content, form.status],
    () => {
      if (isUnmounted) return
      if (isEditMode.value) {
        saveStatus.value = 'unsaved'
        if (autoSaveTimer) clearTimeout(autoSaveTimer)
        autoSaveTimer = setTimeout(() => {
          handleAutoSave()
        }, 30000)
      } else {
        saveStatus.value = 'unsaved'
      }
    }
  )

  // 检查是否有可编辑的剧本
  const checkHasScripts = async () => {
    const projectId = currentProjectId.value
    if (!projectId) {
      hasScripts.value = false
      return
    }
    try {
      const res = await fetchGetScriptList(projectId, { current: 1, size: 1 })
      hasScripts.value = (res?.total || 0) > 0
    } catch {
      hasScripts.value = false
    }
  }

  // 初始化
  onMounted(async () => {
    const id = (route.query.scriptId as string) || ''
    if (id) {
      scriptId.value = id
      isEditMode.value = true
      scriptProjectStore.setCurrentScript(id)
      loadScriptDetail(id)
    } else {
      isEditMode.value = false
      saveStatus.value = 'unsaved'
      // 无 scriptId 时检查是否有剧本，弹出引导弹窗
      await checkHasScripts()
      showGuideDialog.value = true
    }
  })

  onBeforeUnmount(() => {
    isUnmounted = true
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  })
</script>

<style lang="scss" scoped>
  .script-write-page {
    .script-editor-container {
      display: flex;
      gap: 16px;
      height: calc(100% - 60px);

      .script-sidebar {
        width: 320px;
        padding-right: 16px;
        overflow-y: auto;
        border-right: 1px solid var(--el-border-color-lighter);

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
        display: flex;
        flex: 1;
        flex-direction: column;

        .editor-wrapper {
          flex: 1;
          overflow: hidden;

          .script-textarea {
            height: 100%;

            :deep(.el-textarea__inner) {
              height: 100% !important;
              padding: 16px;
              font-family: 'Courier New', monospace;
              line-height: 1.8;
              border: 1px solid var(--el-border-color-lighter);
              border-radius: var(--custom-radius);
            }
          }
        }

        .editor-status-bar {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
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

  .guide-dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    text-align: center;

    .guide-icon {
      margin-bottom: 20px;
      color: var(--el-color-primary);
    }

    .guide-text {
      .guide-title {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .guide-desc {
        margin-bottom: 16px;
        font-size: 14px;
        line-height: 1.6;
        color: var(--el-text-color-regular);

        .highlight {
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }

      .guide-steps {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0;
        margin: 0;
        list-style: none;

        li {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          color: var(--el-text-color-regular);

          .step-icon {
            font-size: 18px;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }
</style>
