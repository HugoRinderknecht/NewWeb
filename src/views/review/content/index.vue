<template>
  <div class="review-content-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">内容审核</span>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索内容标题"
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
            <ElSelect v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in statusOptions"
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
          </ElSpace>
        </div>
      </template>

      <ElTabs v-model="activeTab" type="border-card" class="mb-4">
        <ElTabPane label="待审核" name="pending">
          <ElBadge :value="pendingCount" class="tab-badge" />
        </ElTabPane>
        <ElTabPane label="已审核" name="approved">
          <ElBadge :value="approvedCount" class="tab-badge" />
        </ElTabPane>
        <ElTabPane label="我发起的" name="my">
          <ElBadge :value="myCount" class="tab-badge" />
        </ElTabPane>
      </ElTabs>

      <ArtTable
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn label="内容标题" min-width="200">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ElTag :type="getTypeTag(scope.row.typeValue)" size="small">
                  {{ getTypeLabel(scope.row.typeValue) }}
                </ElTag>
                <span class="font-medium">{{ scope.row.title }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="submitter" label="提交人" width="120" />
          <ElTableColumn prop="submitTime" label="提交时间" width="160" sortable />
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="getStatusTag(scope.row.status)" size="small">
                {{ getStatusLabel(scope.row.status) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="approver" label="当前审批人" width="120" />
          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="scope">
              <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                查看
              </ElButton>
              <template v-if="scope.row.status === 'pending' && scope.row.isMyTask">
                <ElButton type="success" link size="small" @click="handleApprove(scope.row)">
                  通过
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleReject(scope.row)">
                  驳回
                </ElButton>
                <ElButton type="warning" link size="small" @click="handleTransfer(scope.row)">
                  转审
                </ElButton>
              </template>
              <template v-else-if="scope.row.status === 'pending'">
                <ElButton type="info" link size="small" @click="handleRecall(scope.row)">
                  撤回
                </ElButton>
              </template>
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
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { fetchGetReviewList, fetchReviewDecision, fetchWithdrawReview } from '@/api/review'

  defineOptions({ name: 'ReviewContent' })

  type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'recalled'
  type ContentType = 'animation' | 'video' | 'audio' | 'script' | 'design' | 'budget'

  interface ReviewItem {
    id: number
    title: string
    type: string
    typeValue: ContentType
    submitter: string
    submitTime: string
    status: ReviewStatus
    approver: string
    isMyTask: boolean
    isMySubmit: boolean
  }

  const getTypeTag = (type: ContentType) => typeTagMap[type]
  const getTypeLabel = (type: ContentType) => typeLabelMap[type]
  const getStatusTag = (status: ReviewStatus) => statusTypeMap[status]
  const getStatusLabel = (status: ReviewStatus) => statusLabelMap[status]

  const router = useRouter()

  const searchQuery = ref('')
  const filterType = ref<ContentType | ''>('')
  const filterStatus = ref<ReviewStatus | ''>('')
  const filterDateRange = ref<[Date, Date] | null>(null)
  const activeTab = ref<'pending' | 'approved' | 'my'>('pending')
  const transferDialogVisible = ref(false)
  const currentRow = ref<ReviewItem | null>(null)

  const transferForm = reactive({
    targetUser: '',
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

  const statusOptions = [
    { label: '待审核', value: 'pending' },
    { label: '已通过', value: 'approved' },
    { label: '已驳回', value: 'rejected' },
    { label: '已撤回', value: 'recalled' }
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

  const statusTypeMap: Record<ReviewStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> =
    {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      recalled: 'info'
    }

  const statusLabelMap: Record<ReviewStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    recalled: '已撤回'
  }

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const reviewList = ref<ReviewItem[]>([])

  const loadReviewList = async () => {
    try {
      const res = await fetchGetReviewList()
      if (res && res.records) {
        const list = res.records
        reviewList.value = list.map((item: any) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          typeValue: item.typeValue,
          submitter: item.submitter,
          submitTime: item.submitTime,
          status: item.status,
          approver: item.approver,
          isMyTask: item.isMyTask,
          isMySubmit: item.isMySubmit
        }))
      }
    } catch {
      ElMessage.error('加载审核列表失败')
    }
  }

  const columns: ColumnOption[] = [
    { prop: 'title', label: '内容标题', minWidth: 200 },
    { prop: 'submitter', label: '提交人', width: 120 },
    { prop: 'submitTime', label: '提交时间', width: 160, sortable: true },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'approver', label: '当前审批人', width: 120 },
    { prop: 'operation', label: '操作', width: 220, fixed: 'right' }
  ]

  const pendingCount = computed(
    () => reviewList.value.filter((item) => item.status === 'pending' && item.isMyTask).length
  )
  const approvedCount = computed(
    () =>
      reviewList.value.filter(
        (item) => (item.status === 'approved' || item.status === 'rejected') && item.isMyTask
      ).length
  )
  const myCount = computed(() => reviewList.value.filter((item) => item.isMySubmit).length)

  const filteredList = computed(() => {
    let result = reviewList.value

    if (activeTab.value === 'pending') {
      result = result.filter((item) => item.status === 'pending' && item.isMyTask)
    } else if (activeTab.value === 'approved') {
      result = result.filter(
        (item) => (item.status === 'approved' || item.status === 'rejected') && item.isMyTask
      )
    } else if (activeTab.value === 'my') {
      result = result.filter((item) => item.isMySubmit)
    }

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.title.toLowerCase().includes(q))
    }

    if (filterType.value) {
      result = result.filter((item) => item.typeValue === filterType.value)
    }

    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }

    if (filterDateRange.value && filterDateRange.value.length === 2) {
      const [start, end] = filterDateRange.value
      result = result.filter((item) => {
        const d = new Date(item.submitTime)
        return d >= start && d <= end
      })
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

  const handleView = (row: ReviewItem) => {
    router.push(`/review/detail?id=${row.id}`)
  }

  const handleApprove = (row: ReviewItem) => {
    ElMessageBox.confirm(`确定要通过「${row.title}」吗？`, '审批确认', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success'
    }).then(async () => {
      try {
        await fetchReviewDecision({
          id: String(row.id),
          decision: 'approved'
        })
        ElMessage.success('审批通过')
        await loadReviewList()
      } catch {
        ElMessage.error('审批失败')
      }
    })
  }

  const handleReject = (row: ReviewItem) => {
    ElMessageBox.prompt(`请输入驳回「${row.title}」的原因`, '驳回确认', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      type: 'error',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回原因'
    }).then(async ({ value }) => {
      try {
        await fetchReviewDecision({
          id: String(row.id),
          decision: 'rejected',
          reason: value
        })
        ElMessage.success('已驳回: ' + (value || '无原因'))
        await loadReviewList()
      } catch {
        ElMessage.error('驳回失败')
      }
    })
  }

  const handleTransfer = (row: ReviewItem) => {
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
    try {
      await fetchReviewDecision({
        id: String(currentRow.value?.id),
        decision: 'transfer',
        targetUser: transferForm.targetUser,
        reason: transferForm.reason
      })
      const target = approverOptions.find((o) => o.value === transferForm.targetUser)
      ElMessage.success(`已转审给 ${target?.label || transferForm.targetUser}`)
      transferDialogVisible.value = false
      await loadReviewList()
    } catch {
      ElMessage.error('转审失败')
    }
  }

  const handleRecall = (row: ReviewItem) => {
    ElMessageBox.confirm(`确定要撤回「${row.title}」吗？`, '撤回确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchWithdrawReview(String(row.id))
        ElMessage.success('撤回成功')
        await loadReviewList()
      } catch {
        ElMessage.error('撤回失败')
      }
    })
  }

  onMounted(() => {
    loadReviewList()
  })
</script>

<style lang="scss" scoped>
  .tab-badge {
    :deep(.el-badge__content) {
      transform: translateY(-50%) translateX(100%);
    }
  }
</style>
