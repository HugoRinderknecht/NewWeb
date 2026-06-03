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
            <ElButton @click="handleGoBack">
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
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter, useRoute } from 'vue-router'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import {
    fetchGetScriptDetail,
    fetchCreateScript,
    fetchUpdateScript,
    fetchSubmitScriptReview
  } from '@/api/script'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'

  defineOptions({ name: 'ScriptWrite' })

  const router = useRouter()
  const route = useRoute()
  const scriptProjectStore = useScriptProjectStore()

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

  const scriptId = ref<string>('')
  const isEditMode = ref(false)
  const saveStatus = ref<SaveStatus>('saved')

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

  const projectList = computed(() => scriptProjectStore.projectList || [])

  const wordCount = computed(() => {
    return form.content.replace(/\s/g, '').length
  })

  const lineCount = computed(() => {
    return form.content ? form.content.split('\n').length : 0
  })

  // 加载剧本详情
  const loadScriptDetail = async (id: string) => {
    try {
      const res = await fetchGetScriptDetail(id)
      if (res) {
        form.title = res.title ?? ''
        form.description = res.description ?? ''
        form.content = res.content ?? ''
        form.status = res.status ?? 1
        form.creatorName = res.creatorName ?? ''
        form.createTime = res.createTime ?? ''
        form.updateTime = res.updateTime ?? ''
        saveStatus.value = 'saved'
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
  const handleGoBack = () => {
    if (saveStatus.value === 'unsaved') {
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
        const res = await fetchUpdateScript(scriptId.value, {
          title: form.title,
          description: form.description,
          content: form.content,
          status: form.status
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
        const res = await fetchCreateScript(projectId, {
          title: form.title,
          description: form.description,
          content: form.content,
          status: form.status
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
      await fetchSubmitScriptReview(scriptId.value)
      ElMessage.success('已提交审核')
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error('提交审核失败')
      }
    }
  }

  // 自动保存
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  const handleAutoSave = async () => {
    if (!isEditMode.value || !scriptId.value) return
    if (!form.title) return
    saveStatus.value = 'saving'
    try {
      const res = await fetchUpdateScript(scriptId.value, {
        title: form.title,
        description: form.description,
        content: form.content,
        status: form.status
      })
      if (res) {
        form.updateTime = res.updateTime ?? form.updateTime
      }
      saveStatus.value = 'saved'
    } catch {
      saveStatus.value = 'unsaved'
    }
  }

  watch(
    () => [form.title, form.description, form.content, form.status],
    () => {
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

  // 初始化
  onMounted(() => {
    const id = (route.query.scriptId as string) || ''
    if (id) {
      scriptId.value = id
      isEditMode.value = true
      scriptProjectStore.setCurrentScript(id)
      loadScriptDetail(id)
    } else {
      isEditMode.value = false
      saveStatus.value = 'unsaved'
    }
  })

  onBeforeUnmount(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
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
</style>
