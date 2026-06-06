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
  import { useTeamStore } from '@/store/modules/team'
  import { useRoute } from 'vue-router'
  import {
    useJoinApplications,
    useApproveApplication,
    useRejectApplication
  } from '@/api/queries'

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

  const teamStore = useTeamStore()
  const route = useRoute()
  const teamId = computed(() =>
    String((route.query.id || route.query.teamId || teamStore.currentTeamId) as string)
  )
  const activeTab = ref<'pending' | 'history'>('pending')

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // Vue Query: 申请列表
  const applicationParams = computed(() => ({
    current: pagination.current,
    size: pagination.size,
    ...(activeTab.value === 'pending' ? { status: 'pending' } : {})
  }))
  const { data: applicationData, isLoading: loading } = useJoinApplications(teamId, applicationParams)

  // Mutations
  const approveMutation = useApproveApplication()
  const rejectMutation = useRejectApplication()

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

  const applicationList = computed<ApplicationItem[]>(() => {
    const res = applicationData.value as any
    const list = res?.records || []
    let mapped = list.map((item: any) => ({
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
      mapped = mapped.filter((a: ApplicationItem) => a.status !== 'pending')
    }
    return mapped
  })

  // 同步分页 total
  watch(
    () => (applicationData.value as any)?.total,
    (total) => {
      if (total !== undefined) pagination.total = total
    }
  )

  watch(activeTab, () => {
    pagination.current = 1
  })

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

  const filteredApplications = computed(() => {
    return applicationList.value
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
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
        await approveMutation.mutateAsync({ teamId: teamId.value, id: row.id })
        ElMessage.success('已通过申请')
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
      await rejectMutation.mutateAsync({
        teamId: teamId.value,
        id: rejectForm.id,
        reason: rejectForm.reason || undefined
      })
      ElMessage.success('已拒绝申请')
      rejectDialogVisible.value = false
    } catch {
      ElMessage.error('拒绝失败')
    }
  }
</script>

<style lang="scss" scoped>
  .app-stats {
    .stat-card {
      display: flex;
      gap: 12px;
      align-items: center;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

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

      &.pending .stat-icon {
        color: var(--el-color-warning);
        background: var(--el-color-warning-light-9);
      }

      &.approved .stat-icon {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
      }

      &.rejected .stat-icon {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
      }

      &.total .stat-icon {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          margin-top: 2px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
</style>
