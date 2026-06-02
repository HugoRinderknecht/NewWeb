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
              <ElOption label="已完成" value="completed" />
              <ElOption label="失败" value="failed" />
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
                <div class="font-medium">{{ row.name }}</div>
                <div class="text-xs text-g-400">{{ row.id }}</div>
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
                :percentage="row.progress"
                :status="
                  row.status === 'failed'
                    ? 'exception'
                    : row.status === 'completed'
                      ? 'success'
                      : undefined
                "
                :stroke-width="6"
                class="flex-1"
              />
              <span class="text-xs text-g-400 w-10 text-right">{{ row.progress }}%</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="参数摘要" min-width="200">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElTag size="small" type="info">{{ row.style }}</ElTag>
              <ElTag size="small" type="info">{{ row.resolution }}</ElTag>
              <ElTag size="small" type="info">{{ row.shots }}个镜头</ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn label="优先级" width="100">
          <template #default="{ row }">
            <ElTag :type="priorityTagMap[(row as TaskItem).priority]" size="small">
              {{ priorityLabelMap[(row as TaskItem).priority] }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="提交时间" width="160">
          <template #default="{ row }">
            <div class="text-sm">{{ row.submitTime }}</div>
            <div class="text-xs text-g-400">{{
              row.estimatedTime ? `预计 ${row.estimatedTime}` : '-'
            }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton
                v-if="row.status === 'running' || row.status === 'queued'"
                type="primary"
                link
                size="small"
                @click="handleViewProgress(row)"
              >
                查看进度
              </ElButton>
              <ElButton
                v-if="row.status === 'completed'"
                type="primary"
                link
                size="small"
                @click="handlePreview(row)"
              >
                预览
              </ElButton>
              <ElButton
                v-if="row.status === 'failed'"
                type="warning"
                link
                size="small"
                @click="handleRetry(row)"
              >
                重试
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
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
        <ElFormItem label="任务名称" prop="name" required>
          <ElInput v-model="createForm.name" placeholder="请输入任务名称" />
        </ElFormItem>
        <ElFormItem label="选择分镜">
          <ElSelect
            v-model="createForm.shots"
            multiple
            placeholder="请选择要生成的分镜"
            class="w-full"
          >
            <ElOption
              v-for="shot in shotOptions"
              :key="shot.id"
              :label="shot.name"
              :value="shot.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="视频风格">
              <ElSelect v-model="createForm.style" placeholder="请选择风格" class="w-full">
                <ElOption label="写实风格" value="写实风格" />
                <ElOption label="卡通风格" value="卡通风格" />
                <ElOption label="3D动画" value="3D动画" />
                <ElOption label="水墨风格" value="水墨风格" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分辨率">
              <ElSelect v-model="createForm.resolution" placeholder="请选择分辨率" class="w-full">
                <ElOption label="1920x1080 (1080p)" value="1080p" />
                <ElOption label="2560x1440 (2K)" value="2k" />
                <ElOption label="3840x2160 (4K)" value="4k" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="帧率">
              <ElSelect v-model="createForm.fps" placeholder="请选择帧率" class="w-full">
                <ElOption label="24fps" value="24fps" />
                <ElOption label="30fps" value="30fps" />
                <ElOption label="60fps" value="60fps" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="视频格式">
              <ElSelect v-model="createForm.format" placeholder="请选择格式" class="w-full">
                <ElOption label="MP4" value="MP4" />
                <ElOption label="MOV" value="MOV" />
                <ElOption label="AVI" value="AVI" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="优先级">
          <ElRadioGroup v-model="createForm.priority">
            <ElRadio value="high">高</ElRadio>
            <ElRadio value="normal">普通</ElRadio>
            <ElRadio value="low">低</ElRadio>
          </ElRadioGroup>
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
    fetchSubmitVideoGeneration
  } from '@/api/video'

  defineOptions({ name: 'VideoGenTask' })

  type TaskStatus = 'queued' | 'running' | 'completed' | 'failed'
  type Priority = 'high' | 'normal' | 'low'

  interface TaskItem {
    id: string
    name: string
    status: TaskStatus
    progress: number
    style: string
    resolution: string
    shots: number
    priority: Priority
    submitTime: string
    estimatedTime: string
    remark: string
  }

  interface ShotOption {
    id: number
    name: string
  }

  const router = useRouter()
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

  const statusTagMap: Record<TaskStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
    queued: 'warning',
    running: 'primary',
    completed: 'success',
    failed: 'danger'
  }

  const statusLabelMap: Record<TaskStatus, string> = {
    queued: '排队中',
    running: '生成中',
    completed: '已完成',
    failed: '失败'
  }

  const statusIconMap: Record<TaskStatus, string> = {
    queued: 'ri:time-line',
    running: 'ri:loader-4-line',
    completed: 'ri:check-line',
    failed: 'ri:close-line'
  }

  const priorityTagMap: Record<Priority, 'danger' | 'primary' | 'info'> = {
    high: 'danger',
    normal: 'primary',
    low: 'info'
  }

  const priorityLabelMap: Record<Priority, string> = {
    high: '高',
    normal: '普通',
    low: '低'
  }

  const createForm = reactive({
    name: '',
    shots: [] as number[],
    style: '写实风格',
    resolution: '1080p',
    fps: '24fps',
    format: 'MP4',
    priority: 'normal' as Priority,
    remark: ''
  })

  const createRules: FormRules = {
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
  }

  const shotOptions: ShotOption[] = [
    { id: 1, name: '山巅全景' },
    { id: 2, name: '主角面部特写' },
    { id: 3, name: '山腰近景' },
    { id: 4, name: '九尾狐全景' },
    { id: 5, name: '对话过肩' },
    { id: 6, name: '大特写·眼睛' }
  ]

  const taskList = ref<TaskItem[]>([])

  const loadTaskList = async () => {
    loading.value = true
    try {
      const res = await fetchGetVideoTaskList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchQuery.value || undefined,
        status: statusFilter.value || undefined
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
        status: 'completed' as TaskStatus,
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
        (item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
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
    createForm.name = ''
    createForm.shots = []
    createForm.style = '写实风格'
    createForm.resolution = '1080p'
    createForm.fps = '24fps'
    createForm.format = 'MP4'
    createForm.priority = 'normal'
    createForm.remark = ''
    createVisible.value = true
  }

  const handleSubmitCreate = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          await fetchSubmitVideoGeneration({
            name: createForm.name,
            shotIds: createForm.shots,
            style: createForm.style,
            resolution: createForm.resolution,
            fps: createForm.fps,
            format: createForm.format,
            priority: createForm.priority,
            remark: createForm.remark
          } as any)
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
    router.push('/video-gen/progress')
    ElMessage.info(`正在查看任务 ${row.name} 的进度`)
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
    ElMessage.info(`正在预览任务 ${row.name} 的视频`)
  }

  const handleRetry = async (row: TaskItem) => {
    try {
      await ElMessageBox.confirm(`确定要重新执行任务「${row.name}」吗？`, '重试确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchSubmitVideoGeneration({
        name: row.name,
        retryTaskId: row.id
      } as any)
      await loadTaskList()
      ElMessage.success('任务已重新提交')
    } catch {
      // 用户取消
    }
  }

  const handleDelete = async (row: TaskItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除任务「${row.name}」吗？`, '删除确认', {
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
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;

      &:hover {
        border-color: var(--el-color-primary-light-7);
      }

      &.active {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }
  }

  .task-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;

    &.queued {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }

    &.running {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.completed {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }

    &.failed {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
</style>
