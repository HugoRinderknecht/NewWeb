<template>
  <div class="video-gen-task-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">任务提交</span>
            <ElTag type="info" size="small">{{ filteredTasks.length }} 个任务</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索任务名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption label="排队中" value="queued" />
              <ElOption label="生成中" value="running" />
              <ElOption label="已完成" value="succeeded" />
              <ElOption label="失败" value="failed" />
              <ElOption label="已取消" value="cancelled" />
              <ElOption label="已过期" value="expired" />
            </ElSelect>
            <ElButton type="primary" @click="handleCreateTask">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建任务
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 状态统计卡片 -->
      <div class="status-stats flex-cb mb-4">
        <div
          v-for="stat in statusStats"
          :key="stat.status"
          class="stat-card"
          :class="{ active: statusFilter === stat.status }"
          @click="handleFilterByStatus(stat.status)"
        >
          <div class="stat-icon" :style="{ background: stat.bgColor, color: stat.color }">
            <ArtSvgIcon :icon="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.count }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- 任务列表 -->
      <ElTable :data="pagedTasks" style="width: 100%" v-loading="loading">
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn label="任务名称" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <div class="task-icon" :class="(row as TaskItem).status">
                <ArtSvgIcon :icon="statusIconMap[(row as TaskItem).status]" />
              </div>
              <div>
                <div class="font-medium">{{ (row as TaskItem).name || (row as TaskItem).id }}</div>
                <div class="text-xs text-g-400">{{ (row as TaskItem).id }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="120">
          <template #default="{ row }">
            <ElTag :type="statusTagMap[(row as TaskItem).status]" size="small">
              <ArtSvgIcon :icon="statusIconMap[(row as TaskItem).status]" class="mr-1" />
              {{ statusLabelMap[(row as TaskItem).status] }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="进度" width="200">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <ElProgress
                :percentage="(row as TaskItem).progress"
                :status="
                  (row as TaskItem).status === 'failed'
                    ? 'exception'
                    : (row as TaskItem).status === 'succeeded'
                      ? 'success'
                      : undefined
                "
                :stroke-width="6"
                class="flex-1"
              />
              <span class="text-xs text-g-400 w-10 text-right"
                >{{ (row as TaskItem).progress }}%</span
              >
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="参数摘要" min-width="200">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElTag size="small" type="info">{{ (row as TaskItem).resolution }}</ElTag>
              <ElTag size="small" type="info">{{ (row as TaskItem).ratio }}</ElTag>
              <ElTag size="small" type="info">{{ (row as TaskItem).duration }}s</ElTag>
              <ElTag size="small" type="info">{{
                (row as TaskItem).model === 'doubao-seedance-2-0-fast-260128' ? 'Fast' : '标准'
              }}</ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn label="优先级" width="100">
          <template #default="{ row }">
            <ElTag
              :type="
                (row as TaskItem).priority >= 7
                  ? 'danger'
                  : (row as TaskItem).priority >= 4
                    ? 'primary'
                    : 'info'
              "
              size="small"
            >
              {{ (row as TaskItem).priority }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="提交时间" width="160">
          <template #default="{ row }">
            <div class="text-sm">{{
              (row as TaskItem).submitTime || (row as TaskItem).createdAt
            }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton
                v-if="
                  (row as TaskItem).status === 'running' || (row as TaskItem).status === 'queued'
                "
                type="primary"
                link
                size="small"
                @click="handleViewProgress(row as TaskItem)"
              >
                查看进度
              </ElButton>
              <ElButton
                v-if="(row as TaskItem).status === 'succeeded'"
                type="primary"
                link
                size="small"
                @click="handlePreview(row as TaskItem)"
              >
                预览
              </ElButton>
              <ElButton
                v-if="(row as TaskItem).status === 'failed'"
                type="warning"
                link
                size="small"
                @click="handleRetry(row as TaskItem)"
              >
                重试
              </ElButton>
              <ElButton
                v-if="
                  (row as TaskItem).status === 'running' || (row as TaskItem).status === 'queued'
                "
                type="warning"
                link
                size="small"
                @click="handleCancel(row as TaskItem)"
              >
                取消
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(row as TaskItem)"
                >删除</ElButton
              >
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
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

    <!-- 新建任务弹窗 -->
    <ElDialog
      v-model="createVisible"
      title="新建生成任务"
      width="700px"
      align-center
      destroy-on-close
    >
      <ElForm :model="createForm" label-width="100px" :rules="createRules" ref="createFormRef">
        <ElFormItem label="选择分镜">
          <ElSelect
            v-model="createForm.storyboardId"
            placeholder="请选择要生成的分镜"
            class="w-full"
          >
            <ElOption
              v-for="shot in shotOptions"
              :key="shot.id"
              :label="shot.title || shot.name"
              :value="shot.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="模型">
              <ElSelect v-model="createForm.model" placeholder="请选择模型" class="w-full">
                <ElOption label="Seedance 2.0 (标准)" value="doubao-seedance-2-0-260128" />
                <ElOption
                  label="Seedance 2.0 Fast (快速)"
                  value="doubao-seedance-2-0-fast-260128"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分辨率">
              <ElSelect v-model="createForm.resolution" placeholder="请选择分辨率" class="w-full">
                <ElOption label="480p" value="480p" />
                <ElOption label="720p" value="720p" />
                <ElOption label="1080p" value="1080p" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="宽高比">
              <ElSelect v-model="createForm.ratio" placeholder="请选择宽高比" class="w-full">
                <ElOption label="自适应" value="adaptive" />
                <ElOption label="16:9" value="16:9" />
                <ElOption label="4:3" value="4:3" />
                <ElOption label="1:1" value="1:1" />
                <ElOption label="3:4" value="3:4" />
                <ElOption label="9:16" value="9:16" />
                <ElOption label="21:9" value="21:9" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="时长(秒)">
              <ElInputNumber v-model="createForm.duration" :min="4" :max="15" class="w-full" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="提示词">
          <ElInput
            v-model="createForm.prompt"
            type="textarea"
            :rows="3"
            placeholder="视频描述文本"
          />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可选：添加任务备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmitCreate">
          <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
          提交任务
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    fetchGetVideoTaskList,
    fetchGetVideoTaskDetail,
    fetchGetVideoTaskResult,
    fetchCancelVideoTask,
    fetchSubmitVideoGeneration,
    fetchPreviewVideoGeneration
  } from '@/api/video'
  import { fetchGetStoryboardList } from '@/api/storyboard'

  defineOptions({ name: 'VideoGenTask' })

  type TaskStatus = Api.Video.VideoTaskStatus

  type TaskItem = Api.Video.VideoTask

  interface ShotOption {
    id: string
    name: string
    title: string
  }

  const router = useRouter()
  const route = useRoute()
  const projectId = computed(
    () => (route.params.projectId as string) || (route.query.projectId as string) || ''
  )
  const searchQuery = ref('')
  const statusFilter = ref<TaskStatus | ''>('')
  const loading = ref(false)
  const createVisible = ref(false)
  const submitting = ref(false)
  const createFormRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusTagMap: Record<TaskStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    queued: 'warning',
    running: 'primary',
    succeeded: 'success',
    failed: 'danger',
    cancelled: 'info',
    expired: 'info'
  }

  const statusLabelMap: Record<TaskStatus, string> = {
    queued: '排队中',
    running: '生成中',
    succeeded: '已完成',
    failed: '失败',
    cancelled: '已取消',
    expired: '已过期'
  }

  const statusIconMap: Record<TaskStatus, string> = {
    queued: 'ri:time-line',
    running: 'ri:loader-4-line',
    succeeded: 'ri:check-line',
    failed: 'ri:close-line',
    cancelled: 'ri:close-circle-line',
    expired: 'ri:timer-line'
  }

  const createForm = reactive({
    storyboardId: '',
    model: 'doubao-seedance-2-0-260128',
    resolution: '720p',
    ratio: 'adaptive',
    duration: 5,
    prompt: '',
    remark: ''
  })

  const createRules: FormRules = {
    storyboardId: [{ required: true, message: '请选择分镜', trigger: 'change' }]
  }

  const shotOptions = ref<ShotOption[]>([])

  const loadShotOptions = async () => {
    if (!projectId.value) return
    try {
      const res = await fetchGetStoryboardList(projectId.value)
      shotOptions.value = (res.records || []).map((item: any) => ({
        id: item.id,
        name: item.title || item.name || '',
        title: item.title || item.name || ''
      }))
    } catch {
      shotOptions.value = []
    }
  }

  const taskList = ref<TaskItem[]>([])

  const loadTaskList = async () => {
    loading.value = true
    try {
      const res = await fetchGetVideoTaskList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchQuery.value || undefined,
        status: statusFilter.value || undefined,
        projectId: projectId.value || undefined
      })
      if (res) {
        taskList.value = (res.records || []) as TaskItem[]
        pagination.total = res.total || 0
      }
    } catch {
      ElMessage.error('加载任务列表失败')
    } finally {
      loading.value = false
    }
  }

  const statusStats = computed(() => {
    const stats = [
      {
        status: 'queued' as TaskStatus,
        label: '排队中',
        icon: 'ri:time-line',
        bgColor: '#fdf6ec',
        color: '#e6a23c'
      },
      {
        status: 'running' as TaskStatus,
        label: '生成中',
        icon: 'ri:loader-4-line',
        bgColor: '#ecf5ff',
        color: '#409eff'
      },
      {
        status: 'succeeded' as TaskStatus,
        label: '已完成',
        icon: 'ri:check-line',
        bgColor: '#f0f9eb',
        color: '#67c23a'
      },
      {
        status: 'failed' as TaskStatus,
        label: '失败',
        icon: 'ri:close-line',
        bgColor: '#fef0f0',
        color: '#f56c6c'
      }
    ]
    return stats.map((s) => ({
      ...s,
      count: taskList.value.filter((t) => t.status === s.status).length
    }))
  })

  const filteredTasks = computed(() => {
    let result = taskList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => (item.name || '').toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      )
    }
    if (statusFilter.value) {
      result = result.filter((item) => item.status === statusFilter.value)
    }
    return result
  })

  const pagedTasks = computed(() => {
    return filteredTasks.value
  })

  watch([searchQuery, statusFilter], () => {
    pagination.current = 1
    loadTaskList()
  })

  watch([() => pagination.current, () => pagination.size], () => {
    loadTaskList()
  })

  const handleFilterByStatus = (status: TaskStatus) => {
    statusFilter.value = statusFilter.value === status ? '' : status
  }

  const handleCreateTask = () => {
    createForm.storyboardId = ''
    createForm.model = 'doubao-seedance-2-0-260128'
    createForm.resolution = '720p'
    createForm.ratio = 'adaptive'
    createForm.duration = 5
    createForm.prompt = ''
    createForm.remark = ''
    createVisible.value = true
    loadShotOptions()
  }

  const handleSubmitCreate = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          // 1. 先调用预览接口获取 previewToken
          const previewParams: Api.Video.VideoPreviewParams = {
            model: createForm.model,
            prompt: createForm.prompt || undefined,
            resolution: createForm.resolution,
            ratio: createForm.ratio,
            duration: createForm.duration,
            projectId: projectId.value,
            storyboardId: createForm.storyboardId
          }
          const previewResult = await fetchPreviewVideoGeneration(previewParams)
          const previewToken = previewResult?.previewToken
          if (!previewToken) {
            ElMessage.error('预览确认失败，未获取到 previewToken')
            return
          }

          // 2. 提交生成任务
          const generateParams: Api.Video.VideoGenerateParams = {
            ...previewParams,
            previewToken
          }
          await fetchSubmitVideoGeneration(generateParams)
          await loadTaskList()
          createVisible.value = false
          ElMessage.success('任务创建成功')
        } catch {
          ElMessage.error('任务创建失败')
        } finally {
          submitting.value = false
        }
      }
    })
  }

  const handleViewProgress = async (row: TaskItem) => {
    try {
      const detail = await fetchGetVideoTaskDetail(row.id)
      if (detail) {
        Object.assign(row, detail)
      }
    } catch {
      // 使用本地数据
    }
    router.push('/video-gen/preview')
    ElMessage.info(`正在查看任务 ${row.name || row.id} 的进度`)
  }

  const handlePreview = async (row: TaskItem) => {
    try {
      const result = await fetchGetVideoTaskResult(row.id)
      if (result) {
        Object.assign(row, result)
      }
    } catch {
      // 使用本地数据
    }
    router.push('/video-gen/preview')
    ElMessage.info(`正在预览任务 ${row.name || row.id} 的视频`)
  }

  const handleRetry = async (row: TaskItem) => {
    try {
      await ElMessageBox.confirm(`确定要重新执行任务「${row.name || row.id}」吗？`, '重试确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      // 重新提交需要先获取 previewToken
      const previewParams: Api.Video.VideoPreviewParams = {
        model: row.model,
        prompt: row.prompt || undefined,
        resolution: row.resolution,
        ratio: row.ratio,
        duration: row.duration,
        projectId: row.projectId,
        storyboardId: row.storyboardId
      }
      const previewResult = await fetchPreviewVideoGeneration(previewParams)
      if (previewResult?.previewToken) {
        await fetchSubmitVideoGeneration({
          ...previewParams,
          previewToken: previewResult.previewToken
        })
        await loadTaskList()
        ElMessage.success('任务已重新提交')
      } else {
        ElMessage.error('预览确认失败')
      }
    } catch {
      // 用户取消或请求失败
    }
  }

  const handleCancel = async (row: TaskItem) => {
    try {
      await ElMessageBox.confirm(`确定要取消任务「${row.name || row.id}」吗？`, '取消确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchCancelVideoTask(row.id)
      await loadTaskList()
      ElMessage.success('任务已取消')
    } catch {
      // 用户取消
    }
  }

  const handleDelete = async (row: TaskItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除任务「${row.name || row.id}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchCancelVideoTask(row.id)
      await loadTaskList()
      ElMessage.success('删除成功')
    } catch {
      // 用户取消
    }
  }

  onMounted(() => {
    loadTaskList()
  })
</script>

<style lang="scss" scoped>
  .status-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .stat-card {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      cursor: pointer;
      background: var(--el-fill-color-lighter);
      border: 2px solid transparent;
      border-radius: var(--custom-radius);
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary-light-7);
      }

      &.active {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }

      .stat-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        font-size: 22px;
        border-radius: 10px;
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          line-height: 1.2;
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

  .task-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 8px;

    &.queued {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }

    &.running {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.succeeded {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.failed {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }

    &.cancelled,
    &.expired {
      color: var(--el-color-info);
      background: var(--el-color-info-light-9);
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
</style>
