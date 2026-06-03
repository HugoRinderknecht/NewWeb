<template>
  <div class="project-member-page">
    <div class="flex-cb mb-4">
      <ElSpace>
        <ElInput
          v-model="searchQuery"
          placeholder="搜索成员姓名/邮箱"
          clearable
          style="width: 220px"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
          </template>
        </ElInput>
        <ElSelect v-model="filterRole" placeholder="角色筛选" clearable style="width: 140px">
          <ElOption
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElSpace>
      <ElButton type="primary" @click="handleInvite">
        <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
        邀请成员
      </ElButton>
    </div>

    <ArtTable
      :data="filteredMembers"
      :columns="columns"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @pagination:size-change="handleSizeChange"
      @pagination:current-change="handleCurrentChange"
    >
      <template #default>
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn label="成员信息" min-width="240">
          <template #default="scope">
            <div class="flex-c">
              <ElAvatar :size="40" :src="scope.row.avatar" class="mr-3">
                <ArtSvgIcon icon="ri:user-line" />
              </ElAvatar>
              <div>
                <div class="font-medium">{{ scope.row.name }}</div>
                <div class="text-xs text-g-400">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="角色" width="160">
          <template #default="scope">
            <ElSelect
              v-model="scope.row.role"
              size="small"
              style="width: 120px"
              @change="(val: string) => handleRoleChange(scope.row, val)"
            >
              <ElOption
                v-for="role in roleOptions"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
            </ElSelect>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="joinTime" label="加入时间" width="160" sortable />
        <ElTableColumn label="状态" width="100">
          <template #default="scope">
            <ElTag :type="scope.row.status === 'active' ? 'success' : 'info'" size="small">
              {{ scope.row.status === 'active' ? '正常' : '停用' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="180" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
              编辑
            </ElButton>
            <ElTooltip content="该功能尚未与后端打通" placement="top">
              <span>
                <ElButton
                  v-if="scope.row.status === 'active'"
                  type="warning"
                  link
                  size="small"
                  disabled
                >
                  停用
                </ElButton>
                <ElButton v-else type="success" link size="small" disabled> 启用 </ElButton>
              </span>
            </ElTooltip>
            <ElButton type="danger" link size="small" @click="handleRemove(scope.row)">
              移除
            </ElButton>
          </template>
        </ElTableColumn>
      </template>
    </ArtTable>

    <!-- 邀请成员弹窗 -->
    <ElDialog
      v-model="inviteDialogVisible"
      title="邀请成员"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm ref="inviteFormRef" :model="inviteForm" :rules="inviteRules" label-width="80px">
        <ElFormItem label="用户ID" prop="userId">
          <ElInput v-model="inviteForm.userId" placeholder="请输入用户ID" />
        </ElFormItem>
        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="inviteForm.role" placeholder="请选择角色" style="width: 100%">
            <ElOption
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="inviteDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleInviteSubmit">发送邀请</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 编辑成员弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑成员"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <ElFormItem label="成员">
          <ElInput :model-value="editForm.name" disabled />
        </ElFormItem>
        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="editForm.role" placeholder="请选择角色" style="width: 100%">
            <ElOption
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="editDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEditSubmit">保存</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    useProjectMembers,
    useAddProjectMember,
    useUpdateProjectMemberRole,
    useRemoveProjectMember
  } from '@/api/queries/project'
  import { logger } from '@/utils/logger'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'ProjectMember' })

  const route = useRoute()
  const projectId = computed(() => ((route.query.id || route.params.id) as string) || undefined)

  interface MemberItem {
    id: string
    userId: string
    name: string
    email: string
    avatar: string
    role: string
    joinTime: string
    status: 'active' | 'disabled'
  }

  const searchQuery = ref('')
  const filterRole = ref('')
  const selectedMembers = ref<MemberItem[]>([])
  const inviteDialogVisible = ref(false)
  const editDialogVisible = ref(false)

  const inviteFormRef = ref<FormInstance>()
  const editFormRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '导演', value: 'director' },
    { label: '分镜师', value: 'storyboard' },
    { label: '美术师', value: 'art' },
    { label: '视频师', value: 'video' },
    { label: '音频师', value: 'audio' },
    { label: '剪辑师', value: 'edit' }
  ]

  const roleLabelMap: Record<string, string> = {
    admin: '管理员',
    director: '导演',
    storyboard: '分镜师',
    art: '美术师',
    video: '视频师',
    audio: '音频师',
    edit: '剪辑师'
  }

  // ==================== vue-query: 成员列表查询 ====================
  const memberQueryParams = computed<Api.Project.MemberSearchParams>(() => ({
    keyword: searchQuery.value || undefined,
    page: pagination.current,
    pageSize: pagination.size
  }))

  const { data } = useProjectMembers(projectId, memberQueryParams)

  const memberList = computed<MemberItem[]>(() => {
    const records = data.value?.records ?? []
    return records.map((item: Api.Project.ProjectMemberVO) => ({
      id: String(item.id),
      userId: String(item.userId),
      name: item.userName || '',
      email: item.email || '',
      avatar: item.avatar || '',
      role: item.role || 'storyboard',
      joinTime: item.joinTime || '',
      status: item.status || 'active'
    }))
  })

  // 同步后端分页总数
  watch(
    () => data.value?.total,
    (total) => {
      if (total !== undefined) pagination.total = total
    }
  )

  // 搜索关键字变化时重置到第一页
  watch(searchQuery, () => {
    pagination.current = 1
  })

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '成员信息', minWidth: 240 },
    { prop: 'role', label: '角色', width: 160 },
    { prop: 'joinTime', label: '加入时间', width: 160, sortable: true },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
  ]

  // 仅保留角色本地过滤（后端不支持角色筛选），搜索已由后端 keyword 参数处理
  const filteredMembers = computed(() => {
    if (!filterRole.value) return memberList.value
    return memberList.value.filter((item) => item.role === filterRole.value)
  })

  const handleSelectionChange = (selection: MemberItem[]) => {
    selectedMembers.value = selection
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  // ==================== vue-query: Mutations ====================
  const updateRoleMutation = useUpdateProjectMemberRole()
  const addMutation = useAddProjectMember()
  const removeMutation = useRemoveProjectMember()

  const handleRoleChange = async (row: MemberItem, val: string) => {
    if (!projectId.value) return
    try {
      await updateRoleMutation.mutateAsync({
        projectId: projectId.value,
        params: {
          memberId: String(row.id),
          role: val as Api.Project.ProjectMemberRole
        }
      })
      ElMessage.success(`已将 ${row.name} 的角色修改为 ${roleLabelMap[val] || val}`)
      logger.info(
        'ProjectMember',
        'handleRoleChange',
        `角色修改成功: ${row.name} → ${roleLabelMap[val]}`
      )
    } catch {
      ElMessage.error('角色修改失败')
      logger.error('ProjectMember', 'handleRoleChange', '角色修改失败')
    }
  }

  // 邀请成员
  const inviteForm = reactive({
    userId: '',
    role: 'storyboard' as Api.Project.ProjectMemberRole
  })

  const inviteRules: FormRules = {
    userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const handleInvite = () => {
    inviteDialogVisible.value = true
    Object.assign(inviteForm, {
      userId: '',
      role: 'storyboard' as Api.Project.ProjectMemberRole
    })
  }

  const handleInviteSubmit = async () => {
    if (!inviteFormRef.value) return
    const currentProjectId = projectId.value
    if (!currentProjectId) return
    await inviteFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await addMutation.mutateAsync({
            projectId: currentProjectId,
            params: {
              userId: inviteForm.userId,
              role: inviteForm.role
            }
          })
          ElMessage.success('成员已添加')
          inviteDialogVisible.value = false
          logger.info('ProjectMember', 'handleInviteSubmit', `成员添加成功: ${inviteForm.userId}`)
        } catch {
          ElMessage.error('添加成员失败')
          logger.error('ProjectMember', 'handleInviteSubmit', '添加成员失败')
        }
      }
    })
  }

  // 编辑成员 - 仅支持角色变更
  const editForm = reactive({
    id: '',
    name: '',
    role: '' as Api.Project.ProjectMemberRole
  })

  const editRules: FormRules = {
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const handleEdit = (row: MemberItem) => {
    Object.assign(editForm, {
      id: row.id,
      name: row.name,
      role: row.role
    })
    editDialogVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    const currentProjectId = projectId.value
    if (!currentProjectId) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await updateRoleMutation.mutateAsync({
            projectId: currentProjectId,
            params: {
              memberId: editForm.id,
              role: editForm.role
            }
          })
          ElMessage.success('成员角色已更新')
          editDialogVisible.value = false
          logger.info('ProjectMember', 'handleEditSubmit', `成员角色更新成功: ${editForm.id}`)
        } catch {
          ElMessage.error('更新成员角色失败')
          logger.error('ProjectMember', 'handleEditSubmit', '更新成员角色失败')
        }
      }
    })
  }

  const handleRemove = async (row: MemberItem) => {
    if (!projectId.value) return
    try {
      await ElMessageBox.confirm(`确定要将 ${row.name} 从项目中移除吗？`, '移除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await removeMutation.mutateAsync({
        projectId: projectId.value,
        memberId: String(row.id)
      })
      ElMessage.success('成员已移除')
      logger.info('ProjectMember', 'handleRemove', `成员移除成功: ${row.name}`)
    } catch {
      // 用户取消或请求失败
    }
  }
</script>

<style lang="scss" scoped>
  .project-member-page {
    height: 100%;
  }
</style>
