<template>
  <div class="review-pending-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">待审列表</span>
            <ElTag type="warning" size="small">{{ pendingCount }} 项待处理</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索标题/提交人"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterType" placeholder="类型筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElDatePicker
              v-model="filterDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
            <ElButton
              type="primary"
              @click="handleBatchApprove"
              :disabled="selectedItems.length === 0"
            >
              <ArtSvgIcon icon="ri:check-double-line" class="mr-1" />
              批量通过
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ArtTable
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        :loading="isLoading"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="标题" min-width="220">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ElTag :type="getTypeTag(scope.row.typeValue)" size="small">
                  {{ getTypeLabel(scope.row.typeValue) }}
                </ElTag>
                <div>
                  <div class="font-medium">{{ scope.row.title }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.description }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="submitter" label="提交人" width="120" />
          <ElTableColumn prop="submitTime" label="提交时间" width="160" sortable />
          <ElTableColumn prop="priority" label="优先级" width="100">
            <template #default="scope">
              <ElTag :type="getPriorityTag(scope.row.priority)" size="small">
                {{ getPriorityLabel(scope.row.priority) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="deadline" label="截止时间" width="120">
            <template #default="scope">
              <span :class="isUrgent(scope.row.deadline) ? 'text-danger' : 'text-g-500'">
                {{ scope.row.deadline }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="260" fixed="right">
            <template #default="scope">
              <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                查看
              </ElButton>
              <ElButton type="success" link size="small" @click="handleApprove(scope.row)">
                通过
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleReject(scope.row)">
                驳回
              </ElButton>
              <ElButton type="warning" link size="small" @click="handleTransfer(scope.row)">
                转审
              </ElButton>
              <ElButton type="info" link size="small" @click="handleAddSign(scope.row)">
                加签
              </ElButton>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 转审弹窗 -->
    <ElDialog
      v-model="transferDialogVisible"
      title="转审"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm :model="transferForm" label-width="80px">
        <ElFormItem label="转审给" required>
          <ElSelect
            v-model="transferForm.targetUser"
            placeholder="请选择审批人"
            style="width: 100%"
          >
            <ElOption
              v-for="item in approverOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="转审原因">
          <ElInput
            v-model="transferForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入转审原因（可选）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="transferDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleTransferSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 加签弹窗 -->
    <ElDialog
      v-model="addSignDialogVisible"
      title="加签"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm :model="addSignForm" label-width="100px">
        <ElFormItem label="加签人" required>
          <ElSelect v-model="addSignForm.targetUser" placeholder="请选择加签人" style="width: 100%">
            <ElOption
              v-for="item in approverOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="加签方式" required>
          <ElRadioGroup v-model="addSignForm.mode">
            <ElRadio value="before">前加签（在我之前审批）</ElRadio>
            <ElRadio value="after">后加签（在我之后审批）</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="加签原因">
          <ElInput
            v-model="addSignForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入加签原因（可选）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addSignDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddSignSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    useReviewList,
    usePendingReviewCount,
    useReviewDecision,
    useBatchReviewDecision,
    useClaimReview,
    useDispatchReview
  } from '@/api/queries'

  defineOptions({ name: 'ReviewPending' })

  type ContentType = 'animation' | 'video' | 'audio' | 'script' | 'design' | 'budget'
  type Priority = 'high' | 'medium' | 'low'

  interface PendingItem {
    id: number
    title: string
    description: string
    type: string
    typeValue: ContentType
    submitter: string
    submitTime: string
    priority: Priority
    deadline: string
  }

  const getTypeTag = (type: ContentType) => typeTagMap[type]
  const getTypeLabel = (type: ContentType) => typeLabelMap[type]
  const getPriorityTag = (priority: Priority) => priorityTypeMap[priority]
  const getPriorityLabel = (priority: Priority) => priorityLabelMap[priority]

  const router = useRouter()

  const searchQuery = ref('')
  const filterType = ref<ContentType | ''>('')
  const filterDateRange = ref<[Date, Date] | null>(null)
  const selectedItems = ref<PendingItem[]>([])
  const transferDialogVisible = ref(false)
  const addSignDialogVisible = ref(false)
  const currentRow = ref<PendingItem | null>(null)

  /** Date 转为 YYYY-MM-DD 格式（后端期望的日期格式） */
  const toISODate = (d: Date): string => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const transferForm = reactive({
    targetUser: '',
    reason: ''
  })

  const addSignForm = reactive({
    targetUser: '',
    mode: 'before' as 'before' | 'after',
    reason: ''
  })

  const typeOptions = [
    { label: '动画', value: 'animation' },
    { label: '视频', value: 'video' },
    { label: '音频', value: 'audio' },
    { label: '剧本', value: 'script' },
    { label: '设计', value: 'design' },
    { label: '预算', value: 'budget' }
  ]

  const approverOptions = [
    { label: '张三', value: 'zhangsan' },
    { label: '李四', value: 'lisi' },
    { label: '王五', value: 'wangwu' },
    { label: '赵六', value: 'zhaoliu' }
  ]

  const typeTagMap: Record<ContentType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    animation: 'primary',
    video: 'success',
    audio: 'warning',
    script: 'info',
    design: 'danger',
    budget: 'primary'
  }

  const typeLabelMap: Record<ContentType, string> = {
    animation: '动画',
    video: '视频',
    audio: '音频',
    script: '剧本',
    design: '设计',
    budget: '预算'
  }

  const priorityTypeMap: Record<Priority, 'danger' | 'warning' | 'info'> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }

  const priorityLabelMap: Record<Priority, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // Vue Query: 审核列表（后端分页/过滤）
  const searchParams = computed<Api.Review.ReviewSearchParams>(() => {
    const [startDate, endDate] = filterDateRange.value || []
    return {
      page: pagination.current,
      pageSize: pagination.size,
      keyword: searchQuery.value || undefined,
      reviewType: filterType.value || undefined,
      // 日期范围筛选：转换为后端需要的 startDate/endDate
      startDate: startDate ? toISODate(startDate) : undefined,
      endDate: endDate ? toISODate(endDate) : undefined
    }
  })

  const { data: listResult, isLoading } = useReviewList(searchParams)
  const { data: pendingCountData } = usePendingReviewCount()

  const pendingList = computed(() => listResult.value?.records ?? [])
  const paginationTotal = computed(() => listResult.value?.total ?? 0)
  const pendingCount = computed(() => pendingCountData.value ?? 0)

  watch(paginationTotal, (val) => {
    pagination.total = val
  })

  watch([searchQuery, filterType, filterDateRange], () => {
    pagination.current = 1
  })

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'title', label: '标题', minWidth: 220 },
    { prop: 'submitter', label: '提交人', width: 120 },
    { prop: 'submitTime', label: '提交时间', width: 160, sortable: true },
    { prop: 'priority', label: '优先级', width: 100 },
    { prop: 'deadline', label: '截止时间', width: 120 },
    { prop: 'operation', label: '操作', width: 260, fixed: 'right' }
  ]

  const isUrgent = (deadline: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const d = new Date(deadline)
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 1
  }

  // 后端分页：直接使用 Vue Query 数据
  const pagedList = pendingList

  // Mutations
  const claimMutation = useClaimReview()
  const dispatchMutation = useDispatchReview()
  const decisionMutation = useReviewDecision()
  const batchDecisionMutation = useBatchReviewDecision()

  const handleSelectionChange = (selection: PendingItem[]) => {
    selectedItems.value = selection
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleView = (row: PendingItem) => {
    router.push(`/review/detail?id=${row.id}`)
  }

  const handleApprove = (row: PendingItem) => {
    ElMessageBox.confirm(`确定要通过「${row.title}」吗？`, '审批确认', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success'
    }).then(async () => {
      try {
        await claimMutation.mutateAsync(String(row.id))
        ElMessage.success('审批通过')
      } catch {
        ElMessage.error('审批失败')
      }
    })
  }

  const handleReject = (row: PendingItem) => {
    ElMessageBox.prompt(`请输入驳回「${row.title}」的原因`, '驳回确认', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      type: 'error',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回原因'
    }).then(async ({ value }) => {
      try {
        await decisionMutation.mutateAsync({
          reviewId: String(row.id),
          decision: 'rejected',
          comment: value
        })
        ElMessage.success('已驳回')
      } catch {
        ElMessage.error('驳回失败')
      }
    })
  }

  const handleTransfer = (row: PendingItem) => {
    currentRow.value = row
    transferForm.targetUser = ''
    transferForm.reason = ''
    transferDialogVisible.value = true
  }

  const handleTransferSubmit = async () => {
    if (!transferForm.targetUser) {
      ElMessage.warning('请选择转审人')
      return
    }
    if (!currentRow.value) return
    try {
      await dispatchMutation.mutateAsync(String(currentRow.value.id))
      ElMessage.success('转审成功')
    } catch {
      ElMessage.error('转审失败')
    }
    transferDialogVisible.value = false
  }

  const handleAddSign = (row: PendingItem) => {
    currentRow.value = row
    addSignForm.targetUser = ''
    addSignForm.mode = 'before'
    addSignForm.reason = ''
    addSignDialogVisible.value = true
  }

  const handleAddSignSubmit = async () => {
    if (!addSignForm.targetUser) {
      ElMessage.warning('请选择加签人')
      return
    }
    if (!currentRow.value) return
    try {
      await dispatchMutation.mutateAsync(String(currentRow.value.id))
      ElMessage.success('加签成功')
    } catch {
      ElMessage.error('加签失败')
    }
    addSignDialogVisible.value = false
  }

  const handleBatchApprove = () => {
    if (selectedItems.value.length === 0) {
      ElMessage.warning('请先选择要审批的项目')
      return
    }
    const names = selectedItems.value.map((item) => item.title).join('、')
    ElMessageBox.confirm(
      `确定要批量通过以下 ${selectedItems.value.length} 项内容吗？\n${names}`,
      '批量通过确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    ).then(async () => {
      const total = selectedItems.value.length
      try {
        // 使用批量接口一次提交所有任务，避免单条串行调用
        const result = await batchDecisionMutation.mutateAsync({
          taskIds: selectedItems.value.map((item) => String(item.id)),
          decision: 'approved',
          comment: '批量审批'
        })
        selectedItems.value = []
        if (result && typeof result === 'object') {
          const { successCount = total, failCount = 0, failures = [] } = result
          if (failCount === 0) {
            ElMessage.success(`已批量通过 ${successCount} 项`)
          } else if (successCount === 0) {
            ElMessage.error(`批量通过失败：${failures[0]?.reason || '所有任务均未通过'}`)
          } else {
            ElMessage.warning(
              `部分通过：成功 ${successCount} 项，失败 ${failCount} 项${failures[0]?.reason ? `（${failures[0].reason}）` : ''}`
            )
          }
        } else {
          ElMessage.success('批量通过成功')
        }
      } catch {
        ElMessage.error('批量通过失败')
      }
    })
  }
</script>
