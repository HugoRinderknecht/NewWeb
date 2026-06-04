<template>
  <div class="storyboard-design-page art-full-height" v-loading="isLoading">
    <!-- 无项目时显示引导 -->
    <div v-if="!projectId" class="flex-col-cc py-16">
      <ArtSvgIcon icon="ri:folder-3-line" class="text-6xl text-g-300 mb-4" />
      <p class="text-lg text-g-400 mb-6">请先选择一个项目</p>
      <ElButton type="primary" @click="router.push({ name: 'ProjectList' })">
        前往项目列表
      </ElButton>
    </div>
    <template v-else>
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
            <span class="text-lg font-medium">分镜设计</span>
            <ElTag v-if="projectName" type="info" size="small">{{ projectName }}</ElTag>
          </div>
          <ElSpace>
            <ElInput v-model="searchQuery" placeholder="搜索分镜标题" clearable style="width: 220px">
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </ElSelect>
            <ElSelect v-model="filterSource" placeholder="来源筛选" clearable style="width: 140px">
              <ElOption label="剧本生成" value="script" />
              <ElOption label="手动创建" value="manual" />
              <ElOption label="AI辅助" value="ai" />
            </ElSelect>
            <ElButton type="primary" @click="handleCreate">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建分镜
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 统计概览 -->
      <div class="storyboard-stats mb-6">
        <ElRow :gutter="16">
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon primary">
                <ArtSvgIcon icon="ri:movie-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pagination.total }}</div>
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

      <!-- 分镜表格 -->
      <ArtTable
        v-if="displayList !== undefined"
        :data="displayList"
        :pagination="pagination"
        :loading="isLoading"
        empty-text="暂无分镜，点击「新建分镜」创建一个"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="分镜标题" min-width="200">
            <template #default="scope">
              <div class="flex-c cursor-pointer" @click="handleView(scope.row)">
                <div class="storyboard-thumb">
                  <ElImage v-if="scope.row.thumbnail" :src="scope.row.thumbnail" fit="cover" class="thumb-image" />
                  <div v-else class="thumb-placeholder flex-cc">
                    <ArtSvgIcon icon="ri:image-line" class="text-g-400" />
                  </div>
                </div>
                <div class="ml-3">
                  <div class="font-medium text-sm">{{ scope.row.name }}</div>
                  <div class="text-xs text-g-400 mt-1">{{ scope.row.code }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="来源" width="110">
            <template #default="scope">
              <ElTag :type="sourceTypeMap[scope.row.source as SourceType] || 'info'" size="small">
                {{ sourceLabelMap[scope.row.source as SourceType] || scope.row.source }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="statusTypeMap[scope.row.status as StatusType] || 'info'" size="small">
                {{ statusLabelMap[scope.row.status as StatusType] || scope.row.status }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="镜头数" width="90" align="center">
            <template #default="scope">
              <span>{{ scope.row.shotCount ?? 0 }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="时长" width="90" align="center">
            <template #default="scope">
              <span>{{ scope.row.duration || 0 }}s</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="描述" min-width="160" show-overflow-tooltip>
            <template #default="scope">
              <span class="text-g-400">{{ scope.row.description || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="更新时间" width="160" sortable prop="updateTime" />
          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="scope">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  查看
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新建/编辑分镜弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分镜' : '新建分镜'"
      width="640px"
      align-center
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <ElFormItem label="分镜标题" prop="name" required>
          <ElInput v-model="form.name" placeholder="请输入分镜标题" maxlength="200" show-word-limit />
        </ElFormItem>
        <ElFormItem label="所属剧集">
          <ElSelect v-model="form.episodeId" placeholder="请选择剧集" class="w-full" clearable>
            <ElOption
              v-for="ep in episodeOptions"
              :key="ep.id"
              :label="`第${ep.number}集：${ep.name}`"
              :value="ep.id"
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
        <ElButton type="primary" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</ElButton>
      </template>
    </ElDialog>

    <!-- 查看分镜详情弹窗 -->
    <ElDialog v-model="viewDialogVisible" title="分镜详情" width="700px" align-center destroy-on-close>
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
            <ElSpace class="mt-2">
              <ElTag :type="sourceTypeMap[currentItem.source as SourceType] || 'info'" size="small">
                {{ sourceLabelMap[currentItem.source as SourceType] || currentItem.source }}
              </ElTag>
              <ElTag :type="statusTypeMap[currentItem.status as StatusType] || 'info'" size="small">
                {{ statusLabelMap[currentItem.status as StatusType] || currentItem.status }}
              </ElTag>
              <span class="text-sm text-g-400">{{ currentItem.code }}</span>
            </ElSpace>
          </div>
        </div>
        <ElDivider />
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="分镜编号">{{ currentItem.code }}</ElDescriptionsItem>
          <ElDescriptionsItem label="镜头数量">{{ currentItem.shotCount ?? 0 }} 个</ElDescriptionsItem>
          <ElDescriptionsItem label="总时长">{{ currentItem.duration || 0 }} 秒</ElDescriptionsItem>
          <ElDescriptionsItem label="更新状态">
            <ElTag :type="statusTypeMap[currentItem.status as StatusType] || 'info'" size="small">
              {{ statusLabelMap[currentItem.status as StatusType] || currentItem.status }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ currentItem.createTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ currentItem.updateTime || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="描述" :span="2">{{ currentItem.description || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElDialog>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { useRoute, useRouter } from 'vue-router'
  import { useStoryboardList, useCreateStoryboard, useUpdateStoryboard, useDeleteStoryboard } from '@/api/queries'
  import { useProjectEpisodes } from '@/api/queries/project'
  import { useProjectDetail } from '@/api/queries/project'
  import { useProjectDataStore } from '@/store/modules/project-data'
  import { logger } from '@/utils/logger'

  defineOptions({ name: 'StoryboardDesign' })

  const route = useRoute()
  const router = useRouter()
  const projectDataStore = useProjectDataStore()

  type SourceType = 'script' | 'manual' | 'ai'
  type StatusType = 'draft' | 'designing' | 'completed' | 'archived'

  interface StoryboardRow {
    id: string
    code: string
    name: string
    source: string
    sceneId: string
    description: string
    thumbnail: string
    shotCount: number
    duration: number
    status: string
    order: number
    episodeId: string
    projectId: string
    createTime: string
    updateTime: string
  }

  interface EpisodeOption {
    id: string
    number: number
    name: string
  }

  const searchQuery = ref('')
  const filterStatus = ref<number | ''>('')
  const filterSource = ref<SourceType | ''>('')
  const selectedRows = ref<StoryboardRow[]>([])

  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const isEdit = ref(false)
  const currentItem = ref<StoryboardRow | null>(null)
  const formRef = ref<FormInstance>()

  // projectId 优先从 URL 路由参数获取，其次从 store 获取
  const projectId = computed(() => {
    const fromRoute = (route.params.projectId as string) || (route.query.projectId as string)
    if (fromRoute) return fromRoute
    return projectDataStore.currentProjectId || ''
  })

  const { data: projectDetail } = useProjectDetail(projectId)
  const projectName = computed(() => projectDetail.value?.projectName || '')

  const searchParams = computed<Api.Storyboard.StoryboardSearchParams>(() => ({
    page: pagination.current,
    pageSize: pagination.size,
    keyword: searchQuery.value || undefined,
    status: filterStatus.value !== '' ? (filterStatus.value as number) : undefined
  }))

  const {
    data: listResult,
    isLoading,
    error: listError,
    refetch: refetchList
  } = useStoryboardList(projectId, searchParams)

  const isLoadingComputed = computed(() => isLoading.value)
  const hasError = computed(() => !!listError.value)
  const errorMessage = computed(() => {
    if (!listError.value) return ''
    return (listError.value as Error)?.message || '加载分镜列表失败，请稍后重试'
  })

  const rawList = computed<StoryboardRow[]>(() => {
    const data = listResult.value
    if (!data) return []
    const records = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.records)
        ? (data as any).records
        : []
    return records.map((item: any) => {
      const statusMap: Record<number, StatusType> = { 1: 'draft', 2: 'designing', 3: 'completed', 4: 'archived' }
      const rawStatus = typeof item.status === 'number' ? item.status : 1
      return {
        id: String(item.id ?? ''),
        code: item.storyboardNo ? `SB-${String(item.storyboardNo).padStart(3, '0')}` : item.code || `SB-${String(item.id ?? '').padStart(3, '0')}`,
        name: item.title || item.name || '未命名分镜',
        source: item.source || 'manual',
        sceneId: String(item.sceneId ?? ''),
        description: item.description || '',
        thumbnail: item.thumbnail || '',
        shotCount: item.shotCount ?? 0,
        duration: item.durationSeconds ?? item.duration ?? 0,
        status: statusMap[rawStatus] || 'draft',
        order: item.storyboardNo ?? item.order ?? 0,
        episodeId: String(item.episodeId ?? ''),
        projectId: String(item.projectId ?? ''),
        createTime: item.createTime || '',
        updateTime: item.updateTime || ''
      } as StoryboardRow
    })
  })

  const displayList = computed<StoryboardRow[]>(() => {
    let result = rawList.value
    if (filterSource.value) {
      result = result.filter((item) => item.source === filterSource.value)
    }
    return result
  })

  // 统计
  const scriptGeneratedCount = computed(() => rawList.value.filter((i) => i.source === 'script').length)
  const manualCount = computed(() => rawList.value.filter((i) => i.source === 'manual').length)
  const aiGeneratedCount = computed(() => rawList.value.filter((i) => i.source === 'ai').length)

  // 剧集选项
  const { data: episodesData } = useProjectEpisodes(projectId)
  const episodeOptions = computed<EpisodeOption[]>(() => {
    const eps = episodesData.value || []
    return eps.map((ep: any, idx: number) => ({
      id: String(ep.id || idx + 1),
      number: ep.number || ep.episodeNumber || idx + 1,
      name: ep.name || ep.title || ep.episodeName || `第${idx + 1}集`
    }))
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  watch(
    () => listResult.value,
    (val) => {
      if (val) {
        pagination.total = (val as any).total ?? 0
      }
    },
    { immediate: true }
  )

  watch([searchQuery, filterStatus, filterSource], () => {
    pagination.current = 1
  })

  const sourceTypeMap: Record<string, 'success' | 'primary' | 'info'> = {
    script: 'success',
    manual: 'primary',
    ai: 'info'
  }
  const sourceLabelMap: Record<string, string> = {
    script: '剧本生成',
    manual: '手动创建',
    ai: 'AI辅助'
  }
  const statusTypeMap: Record<string, 'info' | 'primary' | 'success' | 'warning'> = {
    draft: 'info',
    designing: 'primary',
    completed: 'success',
    archived: 'warning'
  }
  const statusLabelMap: Record<string, string> = {
    draft: '草稿',
    designing: '设计中',
    completed: '已完成',
    archived: '已归档'
  }
  const statusOptions = [
    { label: '草稿', value: 1 },
    { label: '设计中', value: 2 },
    { label: '已完成', value: 3 },
    { label: '已归档', value: 4 }
  ]

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '分镜标题', minWidth: 200 },
    { prop: 'source', label: '来源', width: 110 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'shotCount', label: '镜头数', width: 90 },
    { prop: 'duration', label: '时长', width: 90 },
    { prop: 'description', label: '描述', minWidth: 160 },
    { prop: 'updateTime', label: '更新时间', width: 160, sortable: true },
    { prop: 'operation', label: '操作', width: 220, fixed: 'right' }
  ]

  // Mutations
  const createMutation = useCreateStoryboard()
  const updateMutation = useUpdateStoryboard()
  const deleteMutation = useDeleteStoryboard()

  const handleSelectionChange = (selection: StoryboardRow[]) => {
    selectedRows.value = selection
  }
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }
  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  // 表单
  const form = reactive({
    id: '',
    name: '',
    episodeId: '',
    description: '',
    thumbnail: ''
  })
  const formRules: FormRules = {
    name: [{ required: true, message: '请输入分镜标题', trigger: 'blur' }]
  }

  const handleCreate = () => {
    isEdit.value = false
    Object.assign(form, { id: '', name: '', episodeId: '', description: '', thumbnail: '' })
    dialogVisible.value = true
  }

  const handleEdit = (row: StoryboardRow) => {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      name: row.name,
      episodeId: row.episodeId,
      description: row.description,
      thumbnail: row.thumbnail
    })
    dialogVisible.value = true
  }

  const handleView = (row: StoryboardRow) => {
    currentItem.value = row
    viewDialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      try {
        if (isEdit.value && form.id) {
          await updateMutation.mutateAsync({
            storyboardId: form.id,
            params: {
              title: form.name,
              description: form.description,
              thumbnail: form.thumbnail
            } as any
          })
          ElMessage.success('分镜已更新')
        } else {
          const pid = projectId.value
          await createMutation.mutateAsync({
            projectId: pid,
            params: {
              title: form.name,
              episodeId: form.episodeId || undefined,
              description: form.description,
              thumbnail: form.thumbnail,
              source: 'manual'
            } as any
          })
          ElMessage.success('分镜创建成功')
        }
        await refetchList()
        dialogVisible.value = false
      } catch (err) {
        logger.apiError('Storyboard', isEdit.value ? 'update' : 'create', err)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      }
    })
  }

  const handleDelete = (row: StoryboardRow) => {
    ElMessageBox.confirm(`确定要删除分镜「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await deleteMutation.mutateAsync({ storyboardId: row.id })
        await refetchList()
        ElMessage.success('删除成功')
      } catch (err) {
        logger.apiError('Storyboard', 'delete', err)
        ElMessage.error('删除失败')
      }
    })
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
    width: 64px;
    height: 40px;
    overflow: hidden;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;

    .thumb-image {
      width: 100%;
      height: 100%;
    }

    .thumb-placeholder {
      width: 100%;
      height: 100%;
      font-size: 18px;
    }
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
          font-size: 28px;
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
