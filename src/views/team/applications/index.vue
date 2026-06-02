<template>
  <div class="team-applications-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">申请审批</span>
            <ElTag type="info" size="small">管理团队加入申请</ElTag>
          </div>
          <ElSpace>
            <ElRadioGroup v-model="activeTab" size="small">
              <ElRadioButton label="pending">待审批</ElRadioButton>
              <ElRadioButton label="history">历史记录</ElRadioButton>
            </ElRadioGroup>
          </ElSpace>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="app-stats mb-6">
        <ElRow :gutter="16">
          <ElCol v-for="stat in appStats" :key="stat.type" :span="6" :xs="12" :sm="8" :md="6">
            <div class="stat-card" :class="stat.type">
              <div class="stat-icon">
                <ArtSvgIcon :icon="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.count }}</div>
                <div class="stat-label">{{ stat.name }}</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <!-- 申请列表 -->
      <ArtTable
        :data="filteredApplications"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" label="序号" width="70" align="center" />
          <ElTableColumn label="申请人" min-width="200">
            <template #default="{ row }">
              <div class="flex-c">
                <ElAvatar :size="40" :src="row.avatar" class="mr-3">
                  <ArtSvgIcon icon="ri:user-line" />
                </ElAvatar>
                <div>
                  <div class="font-medium">{{ row.name }}</div>
                  <div class="text-xs text-g-400">{{ row.email }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="申请角色" width="140">
            <template #default="{ row }">
              <ElTag :type="roleTagMap[row.role]" size="small">{{ row.role }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="reason" label="申请理由" min-width="200" show-overflow-tooltip />
          <ElTableColumn prop="applyTime" label="申请时间" width="160" />
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="statusTagMap[row.status as ApplicationStatus]" size="small">
                {{ statusLabelMap[row.status as ApplicationStatus] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="handler" label="处理人" width="120" />
          <ElTableColumn prop="handleTime" label="处理时间" width="160" />
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <ElSpace v-if="row.status === 'pending'">
                <ElButton type="success" link size="small" @click="handleApprove(row)">
                  <ArtSvgIcon icon="ri:check-line" class="mr-1" />
                  通过
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleReject(row)">
                  <ArtSvgIcon icon="ri:close-line" class="mr-1" />
                  拒绝
                </ElButton>
              </ElSpace>
              <span v-else class="text-g-400">-</span>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 拒绝申请弹窗 -->
    <ElDialog
      v-model="rejectDialogVisible"
      title="拒绝申请"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm :model="rejectForm" label-width="80px">
        <ElFormItem label="申请人">
          <span class="font-medium">{{ rejectForm.name }}</span>
        </ElFormItem>
        <ElFormItem label="拒绝原因">
          <ElInput
            v-model="rejectForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因（可选）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="rejectDialogVisible = false">取消</ElButton>
        <ElButton type="danger" @click="handleRejectSubmit">确认拒绝</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { useRoute } from 'vue-router'
  import {
    fetchGetJoinApplications,
    fetchApproveApplication,
    fetchRejectApplication
  } from '@/api/team'

  defineOptions({ name: 'TeamApplications' })

  type ApplicationStatus = 'pending' | 'approved' | 'rejected'

  interface ApplicationItem {
    id: string
    name: string
    email: string
    avatar: string
    role: string
    reason: string
    applyTime: string
    status: ApplicationStatus
    handler: string
    handleTime: string
  }

  const route = useRoute()
  const teamId = computed(() => String(route.query.id || ''))
  const loading = ref(false)
  const activeTab = ref<'pending' | 'history'>('pending')

  const roleTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    项目经理: 'primary',
    导演: 'success',
    美术: 'warning',
    动画师: 'danger',
    剪辑师: 'info',
    观察员: 'info',
    实习生: 'info'
  }

  const statusTagMap: Record<ApplicationStatus, 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }

  const statusLabelMap: Record<ApplicationStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }

  const applicationList = ref<ApplicationItem[]>([])

  const appStats = computed(() => {
    const pending = applicationList.value.filter((a) => a.status === 'pending').length
    const approved = applicationList.value.filter((a) => a.status === 'approved').length
    const rejected = applicationList.value.filter((a) => a.status === 'rejected').length
    const total = pagination.total
    return [
      { type: 'pending', name: '待审批', icon: 'ri:time-line', count: pending },
      { type: 'approved', name: '已通过', icon: 'ri:check-double-line', count: approved },
      { type: 'rejected', name: '已拒绝', icon: 'ri:close-circle-line', count: rejected },
      { type: 'total', name: '总申请', icon: 'ri:file-list-line', count: total }
    ]
  })

  const loadApplications = async () => {
    if (!teamId.value) return
    loading.value = true
    try {
      const params: any = {
        current: pagination.current,
        size: pagination.size
      }
      if (activeTab.value === 'pending') {
        params.status = 'pending'
      }
      const res = await fetchGetJoinApplications(teamId.value, params)
      const list = res?.records || []
      let mapped = list.map((item) => ({
        id: item.id,
        name: item.userName,
        email: '',
        avatar: item.userAvatar || '',
        role: '',
        reason: item.reason || '',
        applyTime: item.applyTime || '',
        status: item.status as ApplicationStatus,
        handler: '',
        handleTime: item.processTime || ''
      }))
      if (activeTab.value === 'history') {
        mapped = mapped.filter((a) => a.status !== 'pending')
      }
      applicationList.value = mapped
      pagination.total = res?.total || 0
    } catch {
      ElMessage.error('加载申请列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadApplications()
  })

  watch(activeTab, () => {
    pagination.current = 1
    loadApplications()
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'name', label: '申请人', minWidth: 200 },
    { prop: 'role', label: '申请角色', width: 140 },
    { prop: 'reason', label: '申请理由', minWidth: 200 },
    { prop: 'applyTime', label: '申请时间', width: 160 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'handler', label: '处理人', width: 120 },
    { prop: 'handleTime', label: '处理时间', width: 160 },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredApplications = computed(() => {
    return applicationList.value
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadApplications()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadApplications()
  }

  const rejectDialogVisible = ref(false)
  const rejectForm = reactive({
    id: '',
    name: '',
    reason: ''
  })

  const handleApprove = (row: ApplicationItem) => {
    ElMessageBox.confirm(`确定要通过 ${row.name} 的加入申请吗？`, '审批确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }).then(async () => {
      try {
        await fetchApproveApplication(teamId.value, row.id)
        ElMessage.success('已通过申请')
        loadApplications()
      } catch {
        ElMessage.error('审批失败')
      }
    })
  }

  const handleReject = (row: ApplicationItem) => {
    rejectForm.id = row.id
    rejectForm.name = row.name
    rejectForm.reason = ''
    rejectDialogVisible.value = true
  }

  const handleRejectSubmit = async () => {
    try {
      await fetchRejectApplication(teamId.value, rejectForm.id, rejectForm.reason || undefined)
      ElMessage.success('已拒绝申请')
      rejectDialogVisible.value = false
      loadApplications()
    } catch {
      ElMessage.error('拒绝失败')
    }
  }
</script>

<style lang="scss" scoped>
  .app-stats {
    .stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

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

      &.pending .stat-icon {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.approved .stat-icon {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.rejected .stat-icon {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }

      &.total .stat-icon {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }
  }
</style>
