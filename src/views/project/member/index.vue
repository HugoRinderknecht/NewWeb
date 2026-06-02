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
        <ElTableColumn prop="department" label="部门" width="140" />
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
            <ElButton
              v-if="scope.row.status === 'active'"
              type="warning"
              link
              size="small"
              @click="handleDisable(scope.row)"
            >
              停用
            </ElButton>
            <ElButton v-else type="success" link size="small" @click="handleEnable(scope.row)">
              启用
            </ElButton>
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
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="inviteForm.email" placeholder="请输入成员邮箱" />
        </ElFormItem>
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="inviteForm.name" placeholder="请输入成员姓名" />
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
        <ElFormItem label="部门">
          <ElInput v-model="inviteForm.department" placeholder="请输入部门名称" />
        </ElFormItem>
        <ElFormItem label="邀请语">
          <ElInput
            v-model="inviteForm.message"
            type="textarea"
            :rows="3"
            placeholder="请输入邀请语（可选）"
          />
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
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="editForm.name" placeholder="请输入成员姓名" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="editForm.email" placeholder="请输入成员邮箱" />
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
        <ElFormItem label="部门">
          <ElInput v-model="editForm.department" placeholder="请输入部门名称" />
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
    fetchGetProjectMembers,
    fetchAddProjectMember,
    fetchRemoveProjectMember,
    fetchUpdateProjectMemberRole
  } from '@/api/project'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'ProjectMember' })

  const route = useRoute()
  const projectId = computed(() => (route.params.id as string) || '1')

  interface MemberItem {
    id: number
    name: string
    email: string
    avatar: string
    role: string
    department: string
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
    { label: '项目经理', value: 'manager' },
    { label: '导演', value: 'director' },
    { label: '美术', value: 'artist' },
    { label: '动画师', value: 'animator' },
    { label: '剪辑师', value: 'editor' },
    { label: '音效师', value: 'sound' },
    { label: '实习生', value: 'intern' },
    { label: '观察员', value: 'viewer' }
  ]

  const roleLabelMap: Record<string, string> = {
    manager: '项目经理',
    director: '导演',
    artist: '美术',
    animator: '动画师',
    editor: '剪辑师',
    sound: '音效师',
    intern: '实习生',
    viewer: '观察员'
  }

  const memberList = ref<MemberItem[]>([])

  const loadMemberList = async () => {
    try {
      const res = await fetchGetProjectMembers(projectId.value)
      const list = (res as any)?.records || (res as any)?.list || res || []
      memberList.value = list as MemberItem[]
    } catch {
      ElMessage.error('获取成员列表失败')
    }
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '成员信息', minWidth: 240 },
    { prop: 'role', label: '角色', width: 160 },
    { prop: 'department', label: '部门', width: 140 },
    { prop: 'joinTime', label: '加入时间', width: 160, sortable: true },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
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
      result = result.filter((item) => item.role === filterRole.value)
    }

    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return result.slice(start, end)
  })

  watch(filteredMembers, (list) => {
    pagination.total = list.length
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

  const handleRoleChange = async (row: MemberItem, val: string) => {
    try {
      await fetchUpdateProjectMemberRole(projectId.value, {
        userId: String(row.id),
        role: val
      })
      ElMessage.success(`已将 ${row.name} 的角色修改为 ${roleLabelMap[val] || val}`)
    } catch {
      ElMessage.error('角色修改失败')
      await loadMemberList()
    }
  }

  // 邀请成员
  const inviteForm = reactive({
    email: '',
    name: '',
    role: '',
    department: '',
    message: ''
  })

  const inviteRules: FormRules = {
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const handleInvite = () => {
    inviteDialogVisible.value = true
    Object.assign(inviteForm, {
      email: '',
      name: '',
      role: '',
      department: '',
      message: ''
    })
  }

  const handleInviteSubmit = async () => {
    if (!inviteFormRef.value) return
    await inviteFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await fetchAddProjectMember(projectId.value, {
            name: inviteForm.name,
            email: inviteForm.email,
            role: inviteForm.role,
            department: inviteForm.department || '未分配'
          })
          ElMessage.success('邀请已发送')
          inviteDialogVisible.value = false
          await loadMemberList()
        } catch {
          ElMessage.error('邀请发送失败')
        }
      }
    })
  }

  // 编辑成员
  const editForm = reactive({
    id: 0,
    name: '',
    email: '',
    role: '',
    department: ''
  })

  const editRules: FormRules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const handleEdit = (row: MemberItem) => {
    Object.assign(editForm, {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department
    })
    editDialogVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const member = memberList.value.find((item) => item.id === editForm.id)
          if (member) {
            member.name = editForm.name
            member.email = editForm.email
            member.role = editForm.role
            member.department = editForm.department
          }
          ElMessage.success('成员信息已更新')
          editDialogVisible.value = false
          await loadMemberList()
        } catch {
          ElMessage.error('更新成员信息失败')
        }
      }
    })
  }

  const handleDisable = async (row: MemberItem) => {
    try {
      await ElMessageBox.confirm(`确定要停用成员 ${row.name} 吗？`, '停用确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const member = memberList.value.find((item) => item.id === row.id)
      if (member) member.status = 'disabled'
      ElMessage.success('成员已停用')
      await loadMemberList()
    } catch {
      // 用户取消
    }
  }

  const handleEnable = async (row: MemberItem) => {
    const member = memberList.value.find((item) => item.id === row.id)
    if (member) member.status = 'active'
    ElMessage.success('成员已启用')
    await loadMemberList()
  }

  const handleRemove = async (row: MemberItem) => {
    try {
      await ElMessageBox.confirm(`确定要将 ${row.name} 从项目中移除吗？`, '移除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchRemoveProjectMember(projectId.value, String(row.id))
      ElMessage.success('成员已移除')
      await loadMemberList()
    } catch {
      // 用户取消或请求失败
    }
  }

  onMounted(() => {
    loadMemberList()
  })
</script>

<style lang="scss" scoped>
  .project-member-page {
    height: 100%;
  }
</style>
