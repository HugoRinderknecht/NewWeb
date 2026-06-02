<template>
  <div class="script-version-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">版本管理</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElTag type="info" size="small">剧本：《{{ currentScriptName }}》</ElTag>
          </div>
          <ElSpace>
            <ElInput v-model="searchQuery" placeholder="搜索版本" clearable style="width: 220px">
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterType" placeholder="版本类型" clearable style="width: 140px">
              <ElOption label="自动保存" value="auto" />
              <ElOption label="手动保存" value="manual" />
              <ElOption label="里程碑" value="milestone" />
            </ElSelect>
            <ScriptUpload
              button-text="导入版本"
              button-type="info"
              dialog-title="导入剧本版本"
              accept-types=".doc,.docx,.pdf,.txt,.fountain"
              @success="handleImportVersion"
            />
            <ElButton type="primary" @click="handleCreateMilestone">
              <ArtSvgIcon icon="ri:bookmark-line" class="mr-1" />
              标记里程碑
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <div class="scrollable-content">
        <ElTable
          :data="filteredList"
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="版本号" width="120">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <ElTag v-if="row.isMilestone" type="warning" size="small">
                  <ArtSvgIcon icon="ri:bookmark-3-fill" />
                </ElTag>
                <span class="font-medium">{{ row.version }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="title" label="版本标题" min-width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <span>{{ row.title }}</span>
                <ElTag v-if="row.isCurrent" type="success" size="small">当前</ElTag>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="author" label="作者" width="120" />
          <ElTableColumn prop="wordCount" label="字数" width="100">
            <template #default="{ row }">
              <span class="text-g-400">{{ row.wordCount.toLocaleString() }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="变更内容" min-width="200">
            <template #default="{ row }">
              <ElTooltip :content="row.changes" placement="top">
                <span class="truncate block max-w-xs">{{ row.changes }}</span>
              </ElTooltip>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="100">
            <template #default="{ row }">
              <ElTag :type="versionTypeMap[row.type as VersionType]" size="small">
                {{ versionLabelMap[row.type as VersionType] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="time" label="更新时间" width="160" sortable />
          <ElTableColumn label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleView(row)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  查看
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleCompare(row)">
                  <ArtSvgIcon icon="ri:git-pull-request-line" class="mr-1" />
                  对比
                </ElButton>
                <ElButton
                  v-if="!row.isCurrent"
                  type="warning"
                  link
                  size="small"
                  @click="handleRollback(row)"
                >
                  <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                  回滚
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleDelete(row)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

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

    <!-- 查看版本弹窗 -->
    <ElDialog v-model="viewDialogVisible" title="版本详情" width="800px">
      <div v-if="currentVersion" class="version-detail">
        <div class="flex-cb mb-4">
          <div>
            <h3 class="text-lg font-medium">{{ currentVersion.title }}</h3>
            <p class="text-sm text-g-400 mt-1">
              {{ currentVersion.version }} · {{ currentVersion.author }} · {{ currentVersion.time }}
            </p>
          </div>
          <ElTag :type="versionTypeMap[currentVersion.type]" size="small">
            {{ versionLabelMap[currentVersion.type] }}
          </ElTag>
        </div>
        <ElDivider />
        <pre class="version-content">{{ currentVersion.content }}</pre>
      </div>
    </ElDialog>

    <!-- 对比弹窗 -->
    <ElDialog v-model="compareDialogVisible" title="版本对比" width="900px">
      <div v-if="compareVersions" class="version-compare">
        <div class="compare-header flex-cb mb-4">
          <div class="compare-left">
            <span class="font-medium">{{ compareVersions.old.version }}</span>
            <span class="text-sm text-g-400 ml-2">{{ compareVersions.old.time }}</span>
          </div>
          <ArtSvgIcon icon="ri:arrow-right-line" class="text-g-400" />
          <div class="compare-right">
            <span class="font-medium">{{ compareVersions.new.version }}</span>
            <span class="text-sm text-g-400 ml-2">{{ compareVersions.new.time }}</span>
          </div>
        </div>
        <div class="compare-body">
          <div class="compare-panel">
            <div class="panel-header">旧版本</div>
            <pre class="panel-content">{{ compareVersions.old.content }}</pre>
          </div>
          <div class="compare-panel">
            <div class="panel-header">新版本</div>
            <pre class="panel-content">{{ compareVersions.new.content }}</pre>
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- 标记里程碑弹窗 -->
    <ElDialog v-model="milestoneDialogVisible" title="标记里程碑" width="500px">
      <ElForm :model="milestoneForm" label-width="100px">
        <ElFormItem label="版本标题" required>
          <ElInput v-model="milestoneForm.title" placeholder="请输入里程碑标题" />
        </ElFormItem>
        <ElFormItem label="版本描述">
          <ElInput
            v-model="milestoneForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入版本描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="milestoneDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmMilestone">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { fetchGetScriptDetail, fetchUpdateScript, fetchDeleteScript } from '@/api/script'
  import { fetchRollbackDataHistory } from '@/api/data-history'

  defineOptions({ name: 'ScriptVersion' })

  type VersionType = 'auto' | 'manual' | 'milestone'

  interface VersionItem {
    id: string
    version: string
    title: string
    author: string
    wordCount: number
    changes: string
    type: VersionType
    time: string
    isCurrent: boolean
    isMilestone: boolean
    content: string
  }

  interface ComparePair {
    old: VersionItem
    new: VersionItem
  }

  const searchQuery = ref('')
  const filterType = ref<VersionType | ''>('')
  const loading = ref(false)
  const viewDialogVisible = ref(false)
  const compareDialogVisible = ref(false)
  const milestoneDialogVisible = ref(false)
  const currentVersion = ref<VersionItem | null>(null)
  const compareVersions = ref<ComparePair | null>(null)
  const selectedVersions = ref<VersionItem[]>([])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const versionTypeMap: Record<VersionType, 'info' | 'success' | 'warning'> = {
    auto: 'info',
    manual: 'success',
    milestone: 'warning'
  }

  const versionLabelMap: Record<VersionType, string> = {
    auto: '自动保存',
    manual: '手动保存',
    milestone: '里程碑'
  }

  const milestoneForm = reactive({
    title: '',
    description: ''
  })

  const projectStore = useScriptProjectStore()

  const currentProjectId = computed(() => projectStore.currentProjectId)
  const currentScriptName = ref('第1集：穿越了？我是厨神？')

  const projectList = computed(() => projectStore.projectList)

  const versionList = ref<VersionItem[]>([])

  const loadProjectVersions = async (projectId: string) => {
    loading.value = true
    try {
      // TODO: 替换为实际的剧本ID，当前projectId与scriptId可能不一致
      const res = await fetchGetScriptDetail(String(projectId))
      const detail = res as any
      if (detail?.versions && Array.isArray(detail.versions)) {
        versionList.value = detail.versions as VersionItem[]
        currentScriptName.value = detail.scriptName || detail.title || '未知剧本'
      } else {
        versionList.value = []
        currentScriptName.value = detail?.scriptName || detail?.title || '无剧本'
      }
    } catch {
      versionList.value = []
      currentScriptName.value = '无剧本'
    } finally {
      pagination.current = 1
      loading.value = false
    }
  }

  const handleProjectChange = (projectId: string) => {
    projectStore.setCurrentProject(projectId)
    loadProjectVersions(projectId)
  }

  const handleProjectRefresh = () => {
    loadProjectVersions(currentProjectId.value)
  }

  onMounted(() => {
    loadProjectVersions(currentProjectId.value)
  })

  const filteredList = computed(() => {
    let result = versionList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.version.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      )
    }

    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }

    return result
  })

  watch(filteredList, (list) => {
    pagination.total = list.length
  })

  const handleSelectionChange = (selection: VersionItem[]) => {
    selectedVersions.value = selection
  }

  const handleView = (row: VersionItem) => {
    currentVersion.value = row
    viewDialogVisible.value = true
  }

  const handleCompare = (row: VersionItem) => {
    const currentIndex = versionList.value.findIndex((item) => item.id === row.id)
    const oldVersion = versionList.value[currentIndex + 1]
    if (oldVersion) {
      compareVersions.value = {
        old: oldVersion,
        new: row
      }
      compareDialogVisible.value = true
    } else {
      ElMessage.warning('没有更早的版本可以对比')
    }
  }

  const handleRollback = (row: VersionItem) => {
    ElMessageBox.confirm(`确定要回滚到 ${row.version} 吗？当前未保存的内容将丢失。`, '回滚确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchRollbackDataHistory({
          targetType: 'script',
          targetId: String(row.id),
          versionId: String(row.id)
        } as any)
        versionList.value.forEach((item) => {
          item.isCurrent = item.id === row.id
        })
        ElMessage.success(`已回滚到 ${row.version}`)
      } catch {
        ElMessage.error('回滚失败')
      }
    })
  }

  const handleDelete = (row: VersionItem) => {
    if (row.isCurrent) {
      ElMessage.warning('不能删除当前版本')
      return
    }
    ElMessageBox.confirm(`确定要删除 ${row.version} 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await fetchDeleteScript(String(row.id))
        versionList.value = versionList.value.filter((item) => item.id !== row.id)
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleImportVersion = (data: { file: File; name: string; content?: string }) => {
    ElMessage.success(`版本文件「${data.name}」导入成功`)
    const newVersion: VersionItem = {
      id: String(Date.now()),
      version: `v1.${versionList.value.length}`,
      title: `导入：${data.name.replace(/\.[^/.]+$/, '')}`,
      author: '当前用户',
      wordCount: data.content?.length || 0,
      changes: '从文件导入的版本',
      type: 'manual',
      time: new Date().toLocaleString(),
      isCurrent: false,
      isMilestone: false,
      content: data.content || ''
    }
    versionList.value.unshift(newVersion)
    ElMessage.success('版本导入完成')
  }

  const handleCreateMilestone = () => {
    milestoneForm.title = ''
    milestoneForm.description = ''
    milestoneDialogVisible.value = true
  }

  const handleConfirmMilestone = async () => {
    if (!milestoneForm.title) {
      ElMessage.warning('请输入里程碑标题')
      return
    }
    try {
      await fetchUpdateScript(String(currentProjectId.value), {
        title: milestoneForm.title,
        description: milestoneForm.description,
        type: 'milestone'
      } as any)
      const newVersion: VersionItem = {
        id: String(Date.now()),
        version: `v1.${versionList.value.length + 1}`,
        title: milestoneForm.title,
        author: '当前用户',
        wordCount: 0,
        changes: milestoneForm.description || '标记为里程碑版本',
        type: 'milestone',
        time: new Date().toLocaleString(),
        isCurrent: false,
        isMilestone: true,
        content: ''
      }
      versionList.value.unshift(newVersion)
      milestoneDialogVisible.value = false
      ElMessage.success('里程碑标记成功')
    } catch {
      ElMessage.error('里程碑标记失败')
    }
  }
</script>

<style lang="scss" scoped>
  .scrollable-content {
    max-height: calc(100vh - 320px);
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
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }

  .version-detail {
    .version-content {
      white-space: pre-wrap;
      line-height: 1.8;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      background: var(--el-fill-color-lighter);
      padding: 16px;
      border-radius: var(--custom-radius);
      max-height: 500px;
      overflow-y: auto;
    }
  }

  .version-compare {
    .compare-header {
      padding: 12px 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }

    .compare-body {
      display: flex;
      gap: 16px;
      height: 500px;
    }

    .compare-panel {
      flex: 1;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--custom-radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .panel-header {
        padding: 10px 16px;
        background: var(--el-fill-color-lighter);
        font-weight: 500;
        font-size: 14px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .panel-content {
        flex: 1;
        padding: 16px;
        white-space: pre-wrap;
        line-height: 1.8;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        overflow-y: auto;
        margin: 0;
      }
    }
  }

  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
