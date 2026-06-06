<template>
  <div class="review-flow-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">审批流程</span>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增流程
          </ElButton>
        </div>
      </template>

      <div class="flex-cb mb-4">
        <ElSpace>
          <ElInput v-model="searchQuery" placeholder="搜索流程名称" clearable style="width: 220px">
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
        </ElSpace>
      </div>

      <ArtTable
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn label="流程名称" min-width="180">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:flow-chart" class="text-primary" />
                <span class="font-medium">{{ scope.row.name }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="审批步骤" min-width="280">
            <template #default="scope">
              <div class="flow-steps">
                <ElSteps :active="scope.row.activeStep" finish-status="success" simple>
                  <ElStep
                    v-for="(step, idx) in scope.row.steps"
                    :key="idx"
                    :title="step.name"
                    :status="stepStatus(scope.row, idx)"
                  />
                </ElSteps>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="approvers" label="审批人" width="180">
            <template #default="scope">
              <ElSpace>
                <ElTag
                  v-for="(approver, idx) in scope.row.approverList"
                  :key="idx"
                  :type="approver.done ? 'success' : approver.current ? 'warning' : 'info'"
                  size="small"
                >
                  {{ approver.name }}
                </ElTag>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createTime" label="创建时间" width="160" sortable />
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="getStatusTag(scope.row.status)" size="small">
                {{ getStatusLabel(scope.row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="scope">
              <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                查看
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
                编辑
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 查看流程图弹窗 -->
    <ElDialog
      v-model="viewDialogVisible"
      title="流程详情"
      width="700px"
      align-center
      destroy-on-close
    >
      <div v-if="currentFlow" class="flow-detail">
        <ElDescriptions :column="2" border class="mb-6">
          <ElDescriptionsItem label="流程名称">{{ currentFlow.name }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ currentFlow.createTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="当前状态">
            <ElTag :type="getStatusTag(currentFlow.status)" size="small">
              {{ getStatusLabel(currentFlow.status) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="当前节点">
            {{ currentFlow.steps[currentFlow.activeStep]?.name || '已完成' }}
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="flow-chart">
          <h4 class="text-base font-medium mb-4">流程节点状态</h4>
          <div class="node-list">
            <div
              v-for="(step, idx) in currentFlow.steps"
              :key="idx"
              class="flow-node"
              :class="{
                'node-done': idx < currentFlow.activeStep,
                'node-current': idx === currentFlow.activeStep,
                'node-pending': idx > currentFlow.activeStep
              }"
            >
              <div class="node-icon">
                <ArtSvgIcon
                  :icon="
                    idx < currentFlow.activeStep
                      ? 'ri:check-fill'
                      : idx === currentFlow.activeStep
                        ? 'ri:loader-4-line'
                        : 'ri:circle-line'
                  "
                  class="text-xl"
                />
              </div>
              <div class="node-info">
                <div class="node-name">{{ step.name }}</div>
                <div class="node-approver">审批人: {{ step.approver }}</div>
                <div v-if="step.time" class="node-time">{{ step.time }}</div>
              </div>
              <div class="node-status">
                <ElTag
                  :type="
                    idx < currentFlow.activeStep
                      ? 'success'
                      : idx === currentFlow.activeStep
                        ? 'warning'
                        : 'info'
                  "
                  size="small"
                >
                  {{
                    idx < currentFlow.activeStep
                      ? '已通过'
                      : idx === currentFlow.activeStep
                        ? '进行中'
                        : '待处理'
                  }}
                </ElTag>
              </div>
              <div v-if="idx < currentFlow.steps.length - 1" class="node-arrow">
                <ArtSvgIcon icon="ri:arrow-right-line" class="text-g-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- 新增/编辑流程弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      :title="isEdit ? '编辑流程' : '新增流程'"
      width="600px"
      align-center
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px">
        <ElFormItem label="流程名称" required>
          <ElInput v-model="form.name" placeholder="请输入流程名称" />
        </ElFormItem>
        <ElFormItem label="流程节点">
          <div class="step-list">
            <div
              v-for="(step, idx) in form.steps"
              :key="idx"
              class="step-item flex items-center gap-2 mb-2"
            >
              <ElInput v-model="step.name" placeholder="节点名称" style="width: 140px" />
              <ElInput v-model="step.approver" placeholder="审批人" style="width: 120px" />
              <ElButton type="danger" link @click="removeStep(idx)">
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </ElButton>
            </div>
            <ElButton type="primary" link @click="addStep">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              添加节点
            </ElButton>
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { useReviewRouteConfig, useUpdateReviewRouteConfig } from '@/api/queries'

  defineOptions({ name: 'ReviewFlow' })

  type FlowStatus = 'active' | 'inactive' | 'completed'

  interface FlowStep {
    name: string
    approver: string
    time?: string
  }

  interface FlowApprover {
    name: string
    done: boolean
    current: boolean
  }

  interface FlowItem {
    id: number
    name: string
    steps: FlowStep[]
    approverList: FlowApprover[]
    createTime: string
    status: FlowStatus
    activeStep: number
  }

  const getStatusTag = (status: FlowStatus) => statusTypeMap[status]
  const getStatusLabel = (status: FlowStatus) => statusLabelMap[status]

  const route = useRoute()
  const projectId = (route.params.projectId as string) || '1'

  const searchQuery = ref('')
  const filterStatus = ref<FlowStatus | ''>('')
  const viewDialogVisible = ref(false)
  const editDialogVisible = ref(false)
  const isEdit = ref(false)
  const currentFlow = ref<FlowItem | null>(null)

  const form = reactive<{
    id?: number
    name: string
    steps: FlowStep[]
  }>({
    name: '',
    steps: [{ name: '', approver: '' }]
  })

  const statusOptions = [
    { label: '启用中', value: 'active' },
    { label: '已停用', value: 'inactive' },
    { label: '已完成', value: 'completed' }
  ]

  const statusTypeMap: Record<FlowStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    active: 'primary',
    inactive: 'info',
    completed: 'success'
  }

  const statusLabelMap: Record<FlowStatus, string> = {
    active: '启用中',
    inactive: '已停用',
    completed: '已完成'
  }

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const { data: routeConfigData } = useReviewRouteConfig(projectId)
  const updateRouteConfigMutation = useUpdateReviewRouteConfig()

  const flowList = computed<FlowItem[]>(() => (routeConfigData.value as any)?.flows || [])

  const columns: ColumnOption[] = [
    { prop: 'name', label: '流程名称', minWidth: 180 },
    { prop: 'steps', label: '审批步骤', minWidth: 280 },
    { prop: 'approvers', label: '审批人', width: 180 },
    { prop: 'createTime', label: '创建时间', width: 160, sortable: true },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const stepStatus = (
    row: FlowItem,
    idx: number
  ): 'wait' | 'process' | 'finish' | 'error' | 'success' => {
    if (idx < row.activeStep) return 'success'
    if (idx === row.activeStep) return row.status === 'inactive' ? 'error' : 'process'
    return 'wait'
  }

  const filteredList = computed(() => {
    let result = flowList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }

    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }

    return result
  })

  const pagedList = computed(() => {
    const list = filteredList.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredList, (list) => {
    pagination.total = list.length
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleView = (row: FlowItem) => {
    currentFlow.value = row
    viewDialogVisible.value = true
  }

  const handleAdd = () => {
    isEdit.value = false
    form.name = ''
    form.steps = [{ name: '', approver: '' }]
    editDialogVisible.value = true
  }

  const handleEdit = (row: FlowItem) => {
    isEdit.value = true
    form.id = row.id
    form.name = row.name
    form.steps = row.steps.map((s) => ({ ...s }))
    editDialogVisible.value = true
  }

  const addStep = () => {
    form.steps.push({ name: '', approver: '' })
  }

  const removeStep = (idx: number) => {
    if (form.steps.length <= 1) {
      ElMessage.warning('至少需要保留一个节点')
      return
    }
    form.steps.splice(idx, 1)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      ElMessage.warning('请输入流程名称')
      return
    }
    if (form.steps.some((s) => !s.name.trim() || !s.approver.trim())) {
      ElMessage.warning('请完善节点信息')
      return
    }
    try {
      await updateRouteConfigMutation.mutateAsync({
        projectId,
        params: {
          flows: [
            ...(isEdit.value && form.id
              ? flowList.value.map((i) =>
                  i.id === form.id
                    ? {
                        ...i,
                        name: form.name,
                        steps: form.steps.map((s) => ({ ...s })),
                        approverList: form.steps.map((s, idx) => ({
                          name: s.approver,
                          done: idx < i.activeStep,
                          current: idx === i.activeStep
                        }))
                      }
                    : i
                )
              : [
                  ...flowList.value,
                  {
                    id: Date.now(),
                    name: form.name,
                    steps: form.steps.map((s) => ({ ...s })),
                    approverList: form.steps.map((s) => ({
                      name: s.approver,
                      done: false,
                      current: false
                    })),
                    createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    status: 'active',
                    activeStep: 0
                  }
                ])
          ]
        } as any
      })
      ElMessage.success(isEdit.value ? '流程更新成功' : '流程创建成功')
    } catch {
      ElMessage.error(isEdit.value ? '流程更新失败' : '流程创建失败')
    }
    editDialogVisible.value = false
  }

  const handleDelete = (row: FlowItem) => {
    ElMessageBox.confirm(`确定要删除流程「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await updateRouteConfigMutation.mutateAsync({
          projectId,
          params: {
            flows: flowList.value.filter((item) => item.id !== row.id)
          } as any
        })
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // Vue Query 自动获取数据，无需 onMounted 手动加载
</script>

<style lang="scss" scoped>
  .flow-steps {
    :deep(.el-steps--simple) {
      padding: 8px 4px;
    }
  }

  .flow-chart {
    .node-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .flow-node {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      border: 2px solid transparent;
      transition: all 0.2s;

      &.node-done {
        border-color: var(--el-color-success-light-5);
        background: var(--el-color-success-light-9);
      }

      &.node-current {
        border-color: var(--el-color-warning-light-5);
        background: var(--el-color-warning-light-9);
      }

      &.node-pending {
        border-color: var(--el-fill-color);
      }

      .node-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--el-fill-color-dark);
        color: var(--el-text-color-secondary);
        flex-shrink: 0;
      }

      &.node-done .node-icon {
        background: var(--el-color-success);
        color: white;
      }

      &.node-current .node-icon {
        background: var(--el-color-warning);
        color: white;
      }

      .node-info {
        flex: 1;
        min-width: 0;

        .node-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--el-text-color-primary);
        }

        .node-approver {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }

        .node-time {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          margin-top: 2px;
        }
      }

      .node-status {
        flex-shrink: 0;
      }
    }
  }

  .step-list {
    .step-item {
      padding: 8px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }
  }
</style>
