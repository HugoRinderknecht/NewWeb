<template>
  <div class="team-roles-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">团队角色管理</span>
            <ElTag type="info" size="small">配置角色权限</ElTag>
          </div>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            创建角色
          </ElButton>
        </div>
      </template>

      <!-- 角色统计卡片 -->
      <div class="role-stats mb-6">
        <ElRow :gutter="16">
          <ElCol v-for="stat in roleStats" :key="stat.type" :span="6" :xs="12" :sm="8" :md="6">
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

      <!-- 角色列表 -->
      <ArtTable
        :data="filteredRoles"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" label="序号" width="70" align="center" />
          <ElTableColumn label="角色名称" min-width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div class="role-icon" :class="row.type">
                  <ArtSvgIcon :icon="typeIconMap[row.type as RoleType]" />
                </div>
                <div>
                  <div class="font-medium">{{ row.name }}</div>
                  <div class="text-xs text-g-400">{{ row.description }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="120">
            <template #default="{ row }">
              <ElTag :type="typeTagMap[row.type as RoleType]" size="small">
                {{ typeLabelMap[row.type as RoleType] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="memberCount" label="成员数" width="100" align="center">
            <template #default="{ row }">
              <ElTag v-if="row.memberCount > 0" type="info" size="small"
                >{{ row.memberCount }} 人</ElTag
              >
              <span v-else class="text-g-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="权限数量" width="120" align="center">
            <template #default="{ row }">
              <span>{{ row.permissions.length }} 项</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="updateTime" label="更新时间" width="160" />
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleEdit(row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="primary" link size="small" @click="handlePermission(row)">
                  <ArtSvgIcon icon="ri:shield-keyhole-line" class="mr-1" />
                  权限
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleDelete(row)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 创建/编辑角色弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '创建角色'"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <ElFormItem label="角色名称" prop="name" required>
          <ElInput v-model="form.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="角色类型" prop="type" required>
          <ElSelect v-model="form.type" placeholder="请选择角色类型" class="w-full">
            <ElOption label="系统预设" value="system" />
            <ElOption label="自定义" value="custom" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 权限配置弹窗 -->
    <ElDialog
      v-model="permissionDialogVisible"
      title="权限配置"
      width="640px"
      align-center
      destroy-on-close
    >
      <ElForm :model="permissionForm" label-width="120px">
        <ElFormItem label="角色名称">
          <span class="font-medium">{{ permissionForm.name }}</span>
        </ElFormItem>
        <ElFormItem label="功能权限">
          <ElCheckboxGroup v-model="permissionForm.permissions">
            <ElRow :gutter="10">
              <ElCol :span="12" v-for="perm in allPermissions" :key="perm.value">
                <ElCheckbox :label="perm.value">{{ perm.label }}</ElCheckbox>
              </ElCol>
            </ElRow>
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="permissionDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handlePermissionSubmit">保存权限</ElButton>
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
  import {
    fetchGetTeamRoles,
    fetchCreateTeamRole,
    fetchUpdateTeamRole,
    fetchDeleteTeamRole,
    fetchSetRolePermissions,
    fetchGetRolePermissions,
    fetchGetAvailablePermissions
  } from '@/api/team'

  defineOptions({ name: 'TeamRoles' })

  type RoleType = 'system' | 'custom'

  interface RoleItem {
    id: string
    name: string
    type: RoleType
    description: string
    memberCount: number
    permissions: string[]
    updateTime: string
    createTime: string
  }

  const teamStore = useTeamStore()
  const route = useRoute()
  const teamId = computed(() =>
    String((route.query.id || route.query.teamId || teamStore.currentTeamId) as string)
  )
  const loading = ref(false)
  const searchQuery = ref('')
  const dialogVisible = ref(false)
  const permissionDialogVisible = ref(false)
  const isEdit = ref(false)
  const currentId = ref<string | null>(null)
  const formRef = ref<FormInstance>()

  const typeIconMap: Record<RoleType, string> = {
    system: 'ri:shield-star-line',
    custom: 'ri:user-settings-line'
  }

  const typeTagMap: Record<RoleType, 'primary' | 'success'> = {
    system: 'primary',
    custom: 'success'
  }

  const typeLabelMap: Record<RoleType, string> = {
    system: '系统预设',
    custom: '自定义'
  }

  const allPermissions = ref<{ label: string; value: string }[]>([])

  const roleList = ref<RoleItem[]>([])

  const loadRoleList = async () => {
    if (!teamId.value) return
    loading.value = true
    try {
      const res = await fetchGetTeamRoles(teamId.value)
      roleList.value = (res || []).map((role) => ({
        id: role.id,
        name: role.name,
        type: 'custom' as RoleType,
        description: role.description || '',
        memberCount: role.memberCount || 0,
        permissions: [],
        updateTime: role.createTime || '',
        createTime: role.createTime || ''
      }))
    } catch {
      ElMessage.error('加载角色列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadAvailablePermissions = async () => {
    if (!teamId.value) return
    try {
      const res = await fetchGetAvailablePermissions(teamId.value)
      allPermissions.value = (res || []).map((p) => ({
        label: p.name,
        value: p.code
      }))
    } catch {
      // silent
    }
  }

  onMounted(() => {
    loadRoleList()
    loadAvailablePermissions()
  })

  const roleStats = computed(() => {
    const types: RoleType[] = ['system', 'custom']
    return types.map((type) => {
      const list = roleList.value.filter((r) => r.type === type)
      return {
        type,
        name: typeLabelMap[type],
        icon: typeIconMap[type],
        count: list.length
      }
    })
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'name', label: '角色名称', minWidth: 180 },
    { prop: 'type', label: '类型', width: 120 },
    { prop: 'memberCount', label: '成员数', width: 100 },
    { prop: 'permissions', label: '权限数量', width: 120 },
    { prop: 'updateTime', label: '更新时间', width: 160 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredRoles = computed(() => {
    let result = roleList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    const total = result.length
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    nextTick(() => {
      pagination.total = total
    })
    return result.slice(start, end)
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const form = reactive<Partial<RoleItem>>({
    name: '',
    type: 'custom',
    description: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择角色类型', trigger: 'change' }]
  }

  const permissionForm = reactive({
    id: '',
    name: '',
    permissions: [] as string[]
  })

  const handleAdd = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.type = 'custom'
    form.description = ''
    dialogVisible.value = true
  }

  const handleEdit = (row: RoleItem) => {
    isEdit.value = true
    currentId.value = row.id
    Object.assign(form, row)
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    try {
      await formRef.value.validate()
    } catch {
      return
    }
    try {
      if (isEdit.value && currentId.value) {
        await fetchUpdateTeamRole(teamId.value, currentId.value, {
          name: form.name,
          description: form.description
        })
        ElMessage.success('编辑成功')
      } else {
        await fetchCreateTeamRole(teamId.value, {
          name: form.name!,
          code: form.name!.toLowerCase().replace(/\s+/g, '_'),
          description: form.description
        })
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      loadRoleList()
    } catch {
      ElMessage.error(isEdit.value ? '编辑失败' : '创建失败')
    }
  }

  const handlePermission = async (row: RoleItem) => {
    permissionForm.id = row.id
    permissionForm.name = row.name
    permissionForm.permissions = []
    permissionDialogVisible.value = true
    try {
      const res = await fetchGetRolePermissions(teamId.value, row.id)
      if (res) {
        permissionForm.permissions = [...(res.permissionCodes || [])]
      }
    } catch {
      ElMessage.error('加载权限失败')
    }
  }

  const handlePermissionSubmit = async () => {
    try {
      await fetchSetRolePermissions(teamId.value, permissionForm.id, permissionForm.permissions)
      ElMessage.success('权限配置已保存')
      permissionDialogVisible.value = false
      loadRoleList()
    } catch {
      ElMessage.error('保存权限失败')
    }
  }

  const handleDelete = (row: RoleItem) => {
    const confirmMsg =
      row.memberCount > 0
        ? `角色「${row.name}」下还有 ${row.memberCount} 个成员，删除后成员将变为无角色状态，确定要继续吗？`
        : `确定要删除角色「${row.name}」吗？`
    ElMessageBox.confirm(confirmMsg, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteTeamRole(teamId.value, row.id)
        ElMessage.success('删除成功')
        loadRoleList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .role-stats {
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

      &.system .stat-icon {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      &.custom .stat-icon {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
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

  .role-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 8px;

    &.system {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.custom {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
  }
</style>
