<template>
  <div class="script-library-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本管理</span>
            <ElTag v-if="currentProject" type="primary" size="small">
              <ArtSvgIcon icon="ri:folder-3-line" class="mr-1" />
              {{ currentProject.name }}
            </ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索剧本标题"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElButton @click="handleOpenUploadDialog">
              <ArtSvgIcon icon="ri:upload-cloud-line" class="mr-1" />
              上传剧本
            </ElButton>
            <ElButton type="primary" @click="handleOpenCreateDialog">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建剧本
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 项目切换栏 -->
      <div class="project-switch-bar mb-6">
        <ProjectSwitcher
          v-model="currentProjectId"
          :project-list="projectList"
          @change="handleProjectChange"
          @refresh="handleProjectRefresh"
        />
      </div>

      <!-- 统计卡片 -->
      <ElRow :gutter="16" class="mb-6">
        <ElCol :span="6">
          <div class="stat-card">
            <div
              class="stat-icon"
              style="color: var(--el-color-primary); background: var(--el-color-primary-light-9)"
            >
              <ArtSvgIcon icon="ri:file-text-line" />
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">剧本总数</div>
            </div>
          </div>
        </ElCol>
        <ElCol :span="6">
          <div class="stat-card">
            <div
              class="stat-icon"
              style="color: var(--el-color-info); background: var(--el-color-info-light-9)"
            >
              <ArtSvgIcon icon="ri:draft-line" />
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.draft }}</div>
              <div class="stat-label">草稿数</div>
            </div>
          </div>
        </ElCol>
        <ElCol :span="6">
          <div class="stat-card">
            <div
              class="stat-icon"
              style="color: var(--el-color-success); background: var(--el-color-success-light-9)"
            >
              <ArtSvgIcon icon="ri:check-double-line" />
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">已完成数</div>
            </div>
          </div>
        </ElCol>
        <ElCol :span="6">
          <div class="stat-card">
            <div
              class="stat-icon"
              style="color: var(--el-color-warning); background: var(--el-color-warning-light-9)"
            >
              <ArtSvgIcon icon="ri:time-line" />
            </div>
            <div class="stat-body">
              <div class="stat-value">{{ stats.reviewing }}</div>
              <div class="stat-label">审核中数</div>
            </div>
          </div>
        </ElCol>
      </ElRow>

      <!-- 剧本列表 -->
      <div v-loading="loading" class="scrollable-content">
        <ElTable :data="scriptList" style="width: 100%">
          <ElTableColumn label="剧本标题" min-width="200">
            <template #default="{ row }">
              <div class="font-medium">{{ row.title }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="描述" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="text-g-400">{{ row.description || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="statusTypeMap[row.status]" size="small">
                {{ statusLabelMap[row.status] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="分集数" width="90">
            <template #default="{ row }">
              <span class="text-g-400">{{ row.episodeCount ?? '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="审核状态" width="100">
            <template #default="{ row }">
              <ElTag :type="getReviewStatusType(row.reviewStatus)" size="small">
                {{ getReviewStatusLabel(row.reviewStatus) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建时间" width="160" sortable>
            <template #default="{ row }">
              <span class="text-g-400">{{ row.createTime }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" link size="small" @click="handleViewDetail(row)">
                <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                查看详情
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleEdit(row)">
                <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                编辑
              </ElButton>
              <ElButton
                v-if="row.reviewStatus === null || row.reviewStatus === 4"
                type="warning"
                link
                size="small"
                @click="handleSubmitReview(row)"
              >
                <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
                提交审核
              </ElButton>
              <ElButton
                v-if="row.reviewStatus === 1"
                type="info"
                link
                size="small"
                @click="handleWithdrawReview(row)"
              >
                <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />
                撤回审核
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(row)">
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>

    <!-- 上传剧本弹窗 -->
    <ElDialog
      v-model="uploadDialogVisible"
      title="上传剧本"
      width="520px"
      align-center
      destroy-on-close
    >
      <div class="upload-dialog-content">
        <ElAlert type="info" :closable="false" class="mb-4">
          <template #title>
            <div class="flex items-center gap-2">
              <ArtSvgIcon icon="ri:information-line" />
              <span>支持以下文件格式</span>
            </div>
          </template>
          <div class="file-type-list">
            <div class="file-type-item supported">
              <ArtSvgIcon icon="ri:file-text-line" class="file-icon" />
              <span>.txt / .md</span>
              <ElTag type="success" size="small">推荐</ElTag>
            </div>
            <div class="file-type-item unsupported">
              <ArtSvgIcon icon="ri:file-word-line" class="file-icon" />
              <span>.docx / .doc</span>
              <ElTag type="info" size="small">需另存为 .txt</ElTag>
            </div>
            <div class="file-type-item unsupported">
              <ArtSvgIcon icon="ri:file-pdf-line" class="file-icon" />
              <span>.pdf</span>
              <ElTag type="info" size="small">需复制文本</ElTag>
            </div>
          </div>
        </ElAlert>

        <ElUpload
          ref="uploadRef"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleUploadExceed"
          accept=".txt,.md"
          class="upload-area"
        >
          <ArtSvgIcon icon="ri:upload-cloud-2-line" class="upload-icon" />
          <div class="el-upload__text"> 将文件拖到此处，或 <em>点击上传</em> </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传 .txt 或 .md 格式的剧本文件，文件大小不超过 10MB
            </div>
          </template>
        </ElUpload>
      </div>
    </ElDialog>

    <!-- 新建剧本弹窗 -->
    <ElDialog
      v-model="createDialogVisible"
      title="新建剧本"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <ElFormItem label="标题" prop="title">
          <ElInput v-model="createForm.title" placeholder="请输入剧本标题" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入剧本描述"
          />
        </ElFormItem>
        <ElFormItem label="内容" prop="content">
          <ElInput
            v-model="createForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入剧本内容"
          />
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSelect v-model="createForm.status" placeholder="请选择状态" class="w-full">
            <ElOption label="草稿" :value="1" />
            <ElOption label="已完成" :value="2" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="createLoading" @click="handleCreateScript"
          >确定</ElButton
        >
      </template>
    </ElDialog>

    <!-- 剧本详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="剧本详情"
      width="700px"
      align-center
      destroy-on-close
    >
      <div v-if="scriptDetail" class="script-detail">
        <ElDescriptions :column="2" border class="mb-6">
          <ElDescriptionsItem label="剧本标题" :span="2">{{
            scriptDetail.title
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="statusTypeMap[scriptDetail.status]" size="small">
              {{ statusLabelMap[scriptDetail.status] }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="分集数">{{ scriptDetail.episodeCount }}</ElDescriptionsItem>
          <ElDescriptionsItem label="分镜数">{{ scriptDetail.storyboardCount }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建者">{{ scriptDetail.creatorName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="描述" :span="2">{{
            scriptDetail.description || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ scriptDetail.createTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ scriptDetail.updateTime }}</ElDescriptionsItem>
        </ElDescriptions>

        <!-- 审核状态区域 -->
        <div class="review-section">
          <div class="section-title flex items-center gap-2 mb-4">
            <ArtSvgIcon icon="ri:shield-check-line" />
            <span class="font-medium">审核状态</span>
          </div>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="审核状态">
              <ElTag :type="getReviewStatusType(scriptDetail.reviewStatus)" size="small">
                {{ getReviewStatusLabel(scriptDetail.reviewStatus) }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="审核人">{{
              scriptDetail.reviewerName || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="审核意见" :span="2">{{
              scriptDetail.reviewComment || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="提交时间">{{
              scriptDetail.submittedAt || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="审核时间">{{
              scriptDetail.reviewedAt || '-'
            }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <!-- 剧本内容预览 -->
        <div v-if="scriptDetail.content" class="content-section mt-6">
          <div class="section-title flex items-center gap-2 mb-4">
            <ArtSvgIcon icon="ri:file-text-line" />
            <span class="font-medium">剧本内容</span>
            <ElTag type="info" size="small">{{ scriptDetail.content.length }} 字</ElTag>
          </div>
          <div class="script-content-preview">
            <pre>{{ scriptDetail.content }}</pre>
          </div>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile, UploadRawFile } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useProjectStore } from '@/store/modules/project'
  import {
    useScriptList,
    useScriptDetail,
    useCreateScript,
    useDeleteScript,
    useSubmitScriptReview,
    useWithdrawScriptReview,
    useProjectList,
    useProjectDetail
  } from '@/api/queries'
  // fetchGetScriptDetail 用于列表批量获取审核状态，暂保留直接调用
  import { fetchGetScriptDetail } from '@/api/script'

  defineOptions({ name: 'ScriptLibrary' })

  const router = useRouter()
  const projectStore = useProjectStore()
  const { currentProjectId } = storeToRefs(projectStore)

  // ==================== 统一数据层：项目列表与当前项目 ====================
  // 下拉框与当前项目名称需走 Vue Query Hook，store 中已废弃的 projectList/currentProject 不再使用
  const projectListQuery = useProjectList({
    current: 1,
    size: 100
  } as Api.Project.ProjectSearchParams)
  const projectDetailQuery = useProjectDetail(computed(() => currentProjectId.value || undefined))
  const projectList = computed(() => {
    const records = projectListQuery.data.value?.records || []
    return records.map((p) => ({
      id: p.id,
      name: p.projectName,
      scriptCount: undefined
    }))
  })
  const currentProject = computed(() => {
    const detail = projectDetailQuery.data.value
    if (!detail) return undefined
    return {
      id: detail.id,
      name: detail.projectName,
      description: detail.description,
      episodeCount: 0
    }
  })

  // ==================== 列表状态变量（需先于 Vue Query Hooks 定义，避免 TDZ） ====================
  const searchQuery = ref('')
  const filterStatus = ref<number | ''>('')
  const loading = ref(false)
  const scriptDetailId = ref('')

  const scriptList = ref<Api.Script.ScriptDetail[]>([])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // ==================== Vue Query Hooks ====================
  const scriptListQuery = useScriptList(
    currentProjectId,
    computed(() => {
      const params: Api.Script.ScriptSearchParams = {
        current: pagination.current,
        size: pagination.size
      }
      if (searchQuery.value) {
        params.keyword = searchQuery.value
      }
      if (filterStatus.value !== '') {
        params.status = filterStatus.value
      }
      return params
    })
  )
  const scriptDetailQuery = useScriptDetail(computed(() => scriptDetailId.value || undefined))
  const createScriptMutation = useCreateScript()
  const deleteScriptMutation = useDeleteScript()
  const submitReviewMutation = useSubmitScriptReview()
  const withdrawReviewMutation = useWithdrawScriptReview()

  // ==================== 状态映射 ====================
  const statusTypeMap: Record<number, 'info' | 'success'> = {
    1: 'info',
    2: 'success'
  }
  const statusLabelMap: Record<number, string> = {
    1: '草稿',
    2: '已完成'
  }
  const reviewStatusTypeMap: Record<number, 'info' | 'warning' | 'success' | 'danger'> = {
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'info'
  }
  const reviewStatusLabelMap: Record<number, string> = {
    1: '待审核',
    2: '已通过',
    3: '已驳回',
    4: '已撤回'
  }
  const getReviewStatusType = (status: number | null) =>
    status != null ? reviewStatusTypeMap[status] : 'info'
  const getReviewStatusLabel = (status: number | null) =>
    status != null ? reviewStatusLabelMap[status] : '未提交'

  const statusOptions = [
    { label: '草稿', value: 1 },
    { label: '已完成', value: 2 }
  ]

  // ==================== 列表数据响应式更新 ====================
  // 监听 scriptListQuery.data 变化，批量获取详情（含审核状态）
  watch(
    () => scriptListQuery.data?.value,
    async (data) => {
      if (!data?.records) {
        scriptList.value = []
        pagination.total = 0
        return
      }
      const records = data.records
      pagination.total = data.total || 0
      loading.value = true
      try {
        // 为当前页的每个剧本获取详情（含审核状态），并行请求
        const detailPromises = records.map(
          async (item: Api.Script.ScriptListItem): Promise<Api.Script.ScriptDetail> => {
            try {
              const detail = await fetchGetScriptDetail(item.id)
              return (
                detail || {
                  ...item,
                  reviewStatus: null,
                  reviewStatusText: '',
                  episodeCount: 0,
                  storyboardCount: 0,
                  reviewTaskId: '',
                  reviewerName: '',
                  reviewComment: '',
                  submittedAt: '',
                  reviewedAt: '',
                  statusText: ''
                }
              )
            } catch {
              return {
                ...item,
                reviewStatus: null,
                reviewStatusText: '',
                episodeCount: 0,
                storyboardCount: 0,
                reviewTaskId: '',
                reviewerName: '',
                reviewComment: '',
                submittedAt: '',
                reviewedAt: '',
                statusText: ''
              }
            }
          }
        )
        scriptList.value = await Promise.all(detailPromises)
      } catch {
        scriptList.value = []
      } finally {
        loading.value = false
      }
    }
  )

  const stats = computed(() => {
    const list = scriptList.value
    return {
      total: pagination.total,
      draft: list.filter((i) => i.status === 1).length,
      completed: list.filter((i) => i.status === 2).length,
      reviewing: list.filter((i) => i.reviewStatus === 1).length
    }
  })

  const handleProjectChange = () => {
    pagination.current = 1
  }

  const handleProjectRefresh = () => {
    scriptListQuery.refetch()
  }

  const handleSizeChange = () => {
    pagination.current = 1
  }

  // 搜索防抖
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      pagination.current = 1
    }, 300)
  })

  watch(filterStatus, () => {
    pagination.current = 1
  })

  watch(currentProjectId, (newId) => {
    if (newId) {
      pagination.current = 1
    }
  })

  // ==================== 列表操作 ====================
  const handleEdit = (row: Api.Script.ScriptDetail) => {
    router.push({ name: 'ScriptWrite', query: { scriptId: row.id } })
  }

  const handleDelete = (row: Api.Script.ScriptDetail) => {
    ElMessageBox.confirm(`确定要删除剧本「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await deleteScriptMutation.mutateAsync({
          scriptId: row.id,
          projectId: currentProjectId.value
        })
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleSubmitReview = (row: Api.Script.ScriptDetail) => {
    ElMessageBox.confirm(`确定要提交剧本「${row.title}」进行审核吗？`, '提交审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await submitReviewMutation.mutateAsync({
          scriptId: row.id,
          projectId: currentProjectId.value
        })
        ElMessage.success('已提交审核')
      } catch {
        ElMessage.error('提交审核失败')
      }
    })
  }

  const handleWithdrawReview = (row: Api.Script.ScriptDetail) => {
    ElMessageBox.confirm(`确定要撤回剧本「${row.title}」的审核吗？`, '撤回审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        await withdrawReviewMutation.mutateAsync({
          scriptId: row.id,
          projectId: currentProjectId.value
        })
        ElMessage.success('已撤回审核')
      } catch {
        ElMessage.error('撤回审核失败')
      }
    })
  }

  // ==================== 详情弹窗 ====================
  const detailDialogVisible = ref(false)
  const scriptDetail = ref<Api.Script.ScriptDetail | null>(null)

  const handleViewDetail = async (row: Api.Script.ScriptDetail) => {
    try {
      scriptDetailId.value = row.id
      const result = await scriptDetailQuery.refetch()
      if (result.data) {
        scriptDetail.value = result.data as Api.Script.ScriptDetail
        detailDialogVisible.value = true
      }
    } catch {
      ElMessage.error('获取剧本详情失败')
    }
  }

  // ==================== 新建剧本弹窗 ====================
  const createDialogVisible = ref(false)
  const createLoading = ref(false)
  const createFormRef = ref<FormInstance>()
  const uploadRef = ref<any>(null)
  const uploadDialogVisible = ref(false)
  const isParsing = ref(false)

  const createForm = reactive<Api.Script.CreateScriptParams>({
    title: '',
    description: '',
    content: '',
    status: 1
  })

  const createRules: FormRules = {
    title: [{ required: true, message: '请输入剧本标题', trigger: 'blur' }]
  }

  const handleOpenCreateDialog = () => {
    createForm.title = ''
    createForm.description = ''
    createForm.content = ''
    createForm.status = 1
    createDialogVisible.value = true
  }

  const handleCreateScript = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (!valid) return
      createLoading.value = true
      try {
        const projectId = currentProjectId.value
        if (!projectId) {
          ElMessage.warning('请先选择项目')
          return
        }
        await createScriptMutation.mutateAsync({ projectId, params: { ...createForm } })
        createDialogVisible.value = false
        ElMessage.success('创建成功')
      } catch {
        ElMessage.error('创建失败')
      } finally {
        createLoading.value = false
      }
    })
  }

  // ==================== 上传剧本弹窗 ====================
  const handleOpenUploadDialog = () => {
    uploadDialogVisible.value = true
  }

  const handleUploadExceed = () => {
    ElMessage.warning('每次只能上传一个文件，请删除当前文件后再上传')
  }

  // ==================== 文件上传与解析 ====================
  const handleFileChange = async (uploadFile: UploadFile) => {
    const file = uploadFile.raw
    if (!file) return

    // 文件大小限制 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      ElMessage.error('文件大小超过 10MB 限制')
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
      return
    }

    const projectId = currentProjectId.value
    if (!projectId) {
      ElMessage.warning('请先选择项目')
      return
    }

    isParsing.value = true
    try {
      const content = await parseScriptFile(file)
      if (content) {
        const fileName = file.name.replace(/\.[^/.]+$/, '')
        await createScriptMutation.mutateAsync({
          projectId,
          params: {
            title: fileName,
            description: '',
            content: content,
            status: 1
          }
        })
        ElMessage.success(`已导入剧本「${file.name}」，共 ${content.replace(/\s/g, '').length} 字`)
        uploadDialogVisible.value = false
      }
    } catch (error) {
      ElMessage.error('文件解析失败：' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      isParsing.value = false
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }
  }

  const parseScriptFile = (file: UploadRawFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase()

      if (ext === '.txt' || ext === '.md') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = (e.target?.result as string) || ''
          resolve(text)
        }
        reader.onerror = () => reject(new Error('读取文件失败'))
        reader.readAsText(file, 'UTF-8')
      } else {
        reject(new Error('不支持的文件格式'))
      }
    })
  }
</script>

<style lang="scss" scoped>
  .script-library-page {
    .project-switch-bar {
      padding: 12px 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }

    .project-info-card {
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .project-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        border-radius: 12px;
      }

      .project-detail {
        h3 {
          font-size: 16px;
        }
      }
    }

    .stat-card {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      transition: all 0.3s;

      &:hover {
        box-shadow: var(--el-box-shadow-light);
        transform: translateY(-2px);
      }

      .stat-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        border-radius: 12px;
      }

      .stat-body {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          line-height: 1.2;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          margin-top: 4px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .scrollable-content {
      max-height: calc(100vh - 480px);
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

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding-top: 16px;
    }

    .script-detail {
      .review-section,
      .content-section {
        .section-title {
          padding-bottom: 12px;
          font-size: 15px;
          color: var(--el-text-color-primary);
          border-bottom: 1px solid var(--el-border-color-lighter);
        }
      }

      .script-content-preview {
        max-height: 300px;
        padding: 16px;
        overflow-y: auto;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);

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

        pre {
          margin: 0;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.8;
          color: var(--el-text-color-primary);
          word-wrap: break-word;
          white-space: pre-wrap;
        }
      }
    }

    .upload-dialog-content {
      .file-type-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;

        .file-type-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;

          &.supported {
            background: var(--el-color-success-light-9);
          }

          &.unsupported {
            background: var(--el-fill-color-lighter);
          }

          .file-icon {
            font-size: 18px;
          }
        }
      }

      .upload-area {
        :deep(.el-upload) {
          width: 100%;
        }

        :deep(.el-upload-dragger) {
          width: 100%;
          padding: 32px 0;
        }

        .upload-icon {
          font-size: 48px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
</style>
