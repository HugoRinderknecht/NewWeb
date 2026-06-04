<template>
  <div class="team-members-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">成员管理</span>
            <ElTag type="info" size="small">管理团队成员</ElTag>
          </div>
          <ElSpace>
            <ElButton type="primary" @click="showInviteDialog = true">
              <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
              邀请成员
            </ElButton>
            <ElButton @click="showBatchRemoveDialog" :disabled="!selectedMembers.length">
              <ArtSvgIcon icon="ri:user-unfollow-line" class="mr-1" />
              批量移除
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="member-stats mb-6">
        <ElRow :gutter="16">
          <ElCol v-for="stat in memberStats" :key="stat.type" :span="6" :xs="12" :sm="8" :md="6">
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

      <!-- 搜索栏 -->
      <div class="search-bar mb-4">
        <ElSpace>
          <ElInput
            v-model="searchQuery"
            placeholder="搜索成员姓名/邮箱"
            clearable
            style="width: 260px"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
            </template>
          </ElInput>
          <ElSelect v-model="filterRole" placeholder="角色筛选" clearable style="width: 140px">
            <ElOption
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </ElSelect>
          <ElSelect v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px">
            <ElOption label="正常" value="active" />
            <ElOption label="待激活" value="pending" />
            <ElOption label="已禁用" value="disabled" />
          </ElSelect>
        </ElSpace>
      </div>

      <!-- 成员列表 -->
      <ArtTable
        :data="filteredMembers"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" align="center" />
          <ElTableColumn label="成员" min-width="220">
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
          <ElTableColumn label="角色" min-width="180">
            <template #default="{ row }">
              <ElSpace wrap>
                <ElTag v-for="role in row.roles" :key="role" :type="roleTagMap[role]" size="small">
                  {{ role }}
                </ElTag>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn label="部门" width="140">
            <template #default="{ row }">
              <span class="text-g-600">{{ row.department || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="加入方式" width="120">
            <template #default="{ row }">
              <ElTag :type="row.joinType === 'invite' ? 'success' : 'info'" size="small">
                {{ row.joinType === 'invite' ? '邀请加入' : '主动申请' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="joinTime" label="加入时间" width="160" />
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="statusTagMap[row.status as MemberStatus]" size="small">
                {{ statusLabelMap[row.status as MemberStatus] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleEdit(row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="warning" link size="small" @click="handleToggleStatus(row)">
                  <ArtSvgIcon icon="ri:lock-unlock-line" class="mr-1" />
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleRemove(row)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  移除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 邀请成员弹窗 -->
    <ElDialog
      v-model="showInviteDialog"
      title="邀请成员"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm :model="inviteForm" label-width="100px" :rules="inviteRules" ref="inviteFormRef">
        <ElFormItem label="邀请方式" prop="method">
          <ElRadioGroup v-model="inviteForm.method">
            <ElRadio label="email">邮件邀请</ElRadio>
            <ElRadio label="code">邀请码</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem v-if="inviteForm.method === 'email'" label="邮箱" prop="emails">
          <ElSelect
            v-model="inviteForm.emails"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入邮箱地址，支持多个"
            class="w-full"
          >
            <ElOption v-for="item in emailOptions" :key="item" :label="item" :value="item" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem v-else label="邀请码">
          <div class="flex items-center gap-2">
            <ElInput v-model="generatedCode" readonly class="flex-1" />
            <ElButton type="primary" @click="handleGenerateCode">生成</ElButton>
            <ElButton @click="handleCopyCode">复制</ElButton>
          </div>
        </ElFormItem>
        <ElFormItem label="分配角色" prop="roles">
          <ElSelect v-model="inviteForm.roles" multiple placeholder="请选择角色" class="w-full">
            <ElOption
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="过期时间">
          <ElSelect v-model="inviteForm.expireDays" class="w-full">
            <ElOption label="7天" :value="7" />
            <ElOption label="30天" :value="30" />
            <ElOption label="90天" :value="90" />
            <ElOption label="永久有效" :value="3650" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="留言">
          <ElInput
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="给被邀请人的留言（可选）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showInviteDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleInviteSubmit">发送邀请</ElButton>
      </template>
    </ElDialog>

    <!-- 编辑成员弹窗 -->
    <ElDialog v-model="showEditDialog" title="编辑成员" width="480px" align-center destroy-on-close>
      <ElForm :model="editForm" label-width="100px" :rules="editRules" ref="editFormRef">
        <ElFormItem label="成员名称">
          <span class="font-medium">{{ editForm.name }}</span>
        </ElFormItem>
        <ElFormItem label="角色" prop="roles">
          <ElSelect v-model="editForm.roles" multiple placeholder="请选择角色" class="w-full">
            <ElOption
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="部门">
          <ElInput v-model="editForm.department" placeholder="请输入部门" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showEditDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleEditSubmit">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { useTeamStore } from '@/store/modules/team'
  import { useRoute } from 'vue-router'
  import { useTeamMembers, useTeamRoles, useUpdateMemberRole, useUpdateMemberStatus, useRemoveMember } from '@/api/queries'
  import { transformTeamMemberList, transformRoleOptions } from '@/utils/transformers'

  defineOptions({ name: 'TeamMembers' })

  type MemberStatus = 'active' | 'pending' | 'disabled'

  type MemberItem = Api.Team.TeamMemberDisplayVO

  const teamStore = useTeamStore()
  const route = useRoute()
  const teamId = computed(() =>
    String((route.query.id || route.query.teamId || teamStore.currentTeamId) as string)
  )

  const searchQuery = ref('')
  const filterRole = ref('')
  const filterStatus = ref('')
  const selectedMembers = ref<MemberItem[]>([])

  const showInviteDialog = ref(false)
  const showEditDialog = ref(false)
  const inviteFormRef = ref<FormInstance>()
  const editFormRef = ref<FormInstance>()
  const generatedCode = ref('')

  const roleTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    项目经理: 'primary',
    导演: 'success',
    美术: 'warning',
    动画师: 'danger',
    剪辑师: 'info',
    观察员: 'info',
    实习生: 'info'
  }

  const statusTagMap: Record<MemberStatus, 'success' | 'warning' | 'info'> = {
    active: 'success',
    pending: 'warning',
    disabled: 'info'
  }

  const statusLabelMap: Record<MemberStatus, string> = {
    active: '正常',
    pending: '待激活',
    disabled: '已禁用'
  }

  const memberStats = computed(() => {
    const total = memberList.value.length
    const active = memberList.value.filter((m) => m.status === 'active').length
    const pending = memberList.value.filter((m) => m.status === 'pending').length
    const disabled = memberList.value.filter((m) => m.status === 'disabled').length
    return [
      { type: 'total', name: '总成员', icon: 'ri:team-line', count: total },
      { type: 'active', name: '正常', icon: 'ri:user-follow-line', count: active },
      { type: 'pending', name: '待激活', icon: 'ri:user-received-line', count: pending },
      { type: 'disabled', name: '已禁用', icon: 'ri:user-unfollow-line', count: disabled }
    ]
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // Vue-query: 成员列表
  const searchParams = computed(() => ({
    current: pagination.current,
    size: pagination.size
  }))
  const { data: memberData, isLoading: loading } = useTeamMembers(teamId, searchParams)
  const memberList = computed(() => transformTeamMemberList(memberData.value?.records))

  // Vue-query: 角色列表
  const { data: rolesData } = useTeamRoles(teamId)
  const roleOptions = computed(() => transformRoleOptions(rolesData.value))

  // Mutations
  const updateRoleMutation = useUpdateMemberRole()
  const updateStatusMutation = useUpdateMemberStatus()
  const removeMutation = useRemoveMember()

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '成员', minWidth: 220 },
    { prop: 'roles', label: '角色', minWidth: 180 },
    { prop: 'department', label: '部门', width: 140 },
    { prop: 'joinType', label: '加入方式', width: 120 },
    { prop: 'joinTime', label: '加入时间', width: 160 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const filteredMembers = computed(() => {
    let result = memberList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q)
      )
    }
    if (filterRole.value) {
      result = result.filter((item) => item.roles.includes(filterRole.value))
    }
    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }
    return result
  })

  // 同步分页 total
  watch(
    () => memberData.value?.total,
    (total) => {
      if (total !== undefined) pagination.total = total
    }
  )

  // 搜索/筛选变化时重置页码
  watch([searchQuery, filterRole, filterStatus], () => {
    pagination.current = 1
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleSelectionChange = (selection: MemberItem[]) => {
    selectedMembers.value = selection
  }

  const inviteForm = reactive({
    method: 'email' as 'email' | 'code',
    emails: [] as string[],
    roles: [] as string[],
    expireDays: 30,
    message: ''
  })

  const emailOptions = ref<string[]>([])

  const inviteRules: FormRules = {
    method: [{ required: true, message: '请选择邀请方式', trigger: 'change' }],
    emails: [
      {
        required: true,
        message: '请输入邮箱地址',
        trigger: 'change',
        validator: (_rule, _value, callback) => {
          if (inviteForm.method === 'email' && !inviteForm.emails.length) {
            callback(new Error('请输入邮箱地址'))
          } else {
            callback()
          }
        }
      }
    ],
    roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleGenerateCode = () => {
    generatedCode.value = generateCode()
  }

  const handleCopyCode = () => {
    if (!generatedCode.value) {
      ElMessage.warning('请先生成邀请码')
      return
    }
    navigator.clipboard.writeText(generatedCode.value).then(() => {
      ElMessage.success('邀请码已复制')
    })
  }

  const handleInviteSubmit = async () => {
    if (!inviteFormRef.value) return
    await inviteFormRef.value.validate((valid) => {
      if (valid) {
        ElMessage.success('邀请已发送')
        showInviteDialog.value = false
        inviteForm.emails = []
        inviteForm.roles = []
        inviteForm.message = ''
        generatedCode.value = ''
      }
    })
  }

  const editForm = reactive({
    id: '',
    name: '',
    roles: [] as string[],
    department: ''
  })

  const editRules: FormRules = {
    roles: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const handleEdit = (row: MemberItem) => {
    editForm.id = row.id
    editForm.name = row.name
    editForm.roles = [...row.roles]
    editForm.department = row.department
    showEditDialog.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await updateRoleMutation.mutateAsync({
            teamId: teamId.value,
            params: {
              memberId: String(editForm.id),
              role: editForm.roles.join(',')
            }
          })
          ElMessage.success('成员信息已更新')
          showEditDialog.value = false
        } catch {
          ElMessage.error('更新成员信息失败')
        }
      }
    })
  }

  const handleToggleStatus = (row: MemberItem) => {
    const action = row.status === 'active' ? '禁用' : '启用'
    ElMessageBox.confirm(`确定要${action}成员「${row.name}」吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await updateStatusMutation.mutateAsync({
          teamId: teamId.value,
          params: {
            memberId: String(row.id),
            status: row.status === 'active' ? '0' : '1'
          }
        })
        ElMessage.success(`已${action}`)
      } catch {
        ElMessage.error(`${action}失败`)
      }
    })
  }

  const handleRemove = (row: MemberItem) => {
    ElMessageBox.confirm(`确定要将「${row.name}」移出团队吗？`, '移除确认', {
      confirmButtonText: '确定移除',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await removeMutation.mutateAsync({ teamId: teamId.value, memberId: String(row.id) })
        ElMessage.success('成员已移除')
      } catch {
        ElMessage.error('移除成员失败')
      }
    })
  }

  const showBatchRemoveDialog = () => {
    const names = selectedMembers.value.map((m) => m.name).join('、')
    ElMessageBox.confirm(
      `确定要移除以下 ${selectedMembers.value.length} 位成员吗？<br/><strong>${names}</strong>`,
      '批量移除确认',
      {
        confirmButtonText: '确定移除',
        cancelButtonText: '取消',
        type: 'error',
        dangerouslyUseHTMLString: true
      }
    ).then(async () => {
      try {
        for (const member of selectedMembers.value) {
          await removeMutation.mutateAsync({ teamId: teamId.value, memberId: String(member.id) })
        }
        selectedMembers.value = []
        ElMessage.success('批量移除成功')
      } catch {
        ElMessage.error('批量移除失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .member-stats {
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

      &.total .stat-icon {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      &.active .stat-icon {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
      }

      &.pending .stat-icon {
        color: var(--el-color-warning);
        background: var(--el-color-warning-light-9);
      }

      &.disabled .stat-icon {
        color: var(--el-color-info);
        background: var(--el-color-info-light-9);
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

  .search-bar {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: var(--custom-radius);
  }
</style>
