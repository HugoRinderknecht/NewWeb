<template>
  <div class="team-invite-codes-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">邀请码管理</span>
            <ElTag type="info" size="small">生成与管理团队邀请码</ElTag>
          </div>
          <ElButton type="primary" @click="handleGenerate">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            生成邀请码
          </ElButton>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="invite-stats mb-6">
        <ElRow :gutter="16">
          <ElCol v-for="stat in inviteStats" :key="stat.type" :span="6" :xs="12" :sm="8" :md="6">
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

      <!-- 邀请码列表 -->
      <ArtTable
        :data="filteredCodes"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" label="序号" width="70" align="center" />
          <ElTableColumn label="邀请码" min-width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:vip-crown-line" class="text-g-400" />
                <span class="font-mono font-medium">{{ row.code }}</span>
                <ElButton type="primary" link size="small" @click="handleCopy(row.code)">
                  <ArtSvgIcon icon="ri:file-copy-line" />
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="角色" width="140">
            <template #default="{ row }">
              <ElTag :type="roleTagMap[row.role]" size="small">{{ row.role }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="maxUses" label="最大使用次数" width="120" align="center" />
          <ElTableColumn prop="usedCount" label="已使用" width="100" align="center" />
          <ElTableColumn prop="expireTime" label="过期时间" width="160" />
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '有效' : '已禁用' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createTime" label="创建时间" width="160" />
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <ElSpace>
                <ElButton
                  v-if="row.status === 'active'"
                  type="warning"
                  link
                  size="small"
                  @click="handleDisable(row)"
                >
                  <ArtSvgIcon icon="ri:prohibited-line" class="mr-1" />
                  禁用
                </ElButton>
                <ElButton v-else type="success" link size="small" @click="handleEnable(row)">
                  <ArtSvgIcon icon="ri:check-line" class="mr-1" />
                  启用
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

    <!-- 生成邀请码弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      title="生成邀请码"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <ElFormItem label="分配角色" prop="role" required>
          <ElSelect v-model="form.role" placeholder="请选择角色" class="w-full">
            <ElOption label="项目经理" value="项目经理" />
            <ElOption label="导演" value="导演" />
            <ElOption label="美术" value="美术" />
            <ElOption label="动画师" value="动画师" />
            <ElOption label="剪辑师" value="剪辑师" />
            <ElOption label="观察员" value="观察员" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="最大使用次数">
          <ElInputNumber v-model="form.maxUses" :min="1" :max="100" class="w-full" />
        </ElFormItem>
        <ElFormItem label="过期时间">
          <ElSelect v-model="form.expireDays" placeholder="请选择过期时间" class="w-full">
            <ElOption label="7天" :value="7" />
            <ElOption label="30天" :value="30" />
            <ElOption label="90天" :value="90" />
            <ElOption label="永久有效" :value="3650" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">生成</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { useRoute } from 'vue-router'
  import { fetchGetInviteCodes, fetchCreateInviteCode, fetchRevokeInviteCode } from '@/api/team'

  defineOptions({ name: 'TeamInviteCodes' })

  interface InviteCodeItem {
    id: string
    code: string
    role: string
    maxUses: number
    usedCount: number
    expireTime: string
    status: 'active' | 'disabled'
    createTime: string
  }

  const route = useRoute()
  const teamId = computed(() => String(route.query.id || ''))
  const loading = ref(false)
  const dialogVisible = ref(false)
  const formRef = ref<FormInstance>()

  const roleTagMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    项目经理: 'primary',
    导演: 'success',
    美术: 'warning',
    动画师: 'danger',
    剪辑师: 'info',
    观察员: 'info'
  }

  const inviteCodeList = ref<InviteCodeItem[]>([])

  const inviteStats = computed(() => {
    const total = pagination.total
    const active = inviteCodeList.value.filter((i) => i.status === 'active').length
    const disabled = inviteCodeList.value.filter((i) => i.status === 'disabled').length
    const totalUsed = inviteCodeList.value.reduce((sum, i) => sum + i.usedCount, 0)
    return [
      { type: 'total', name: '总邀请码', icon: 'ri:vip-crown-line', count: total },
      { type: 'active', name: '有效邀请码', icon: 'ri:check-double-line', count: active },
      { type: 'disabled', name: '已禁用', icon: 'ri:prohibited-line', count: disabled },
      { type: 'used', name: '总使用次数', icon: 'ri:user-received-line', count: totalUsed }
    ]
  })

  const loadInviteCodes = async () => {
    if (!teamId.value) return
    loading.value = true
    try {
      const res = await fetchGetInviteCodes(teamId.value, {
        current: pagination.current,
        size: pagination.size
      })
      const list = res?.records || []
      inviteCodeList.value = list.map((item) => ({
        id: item.id,
        code: item.code,
        role: '',
        maxUses: item.maxUses || 0,
        usedCount: item.usedCount || 0,
        expireTime: item.expiresAt || '',
        status:
          item.expiresAt && new Date(item.expiresAt) < new Date()
            ? ('disabled' as const)
            : ('active' as const),
        createTime: item.createTime || ''
      }))
      pagination.total = res?.total || 0
    } catch {
      ElMessage.error('加载邀请码列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadInviteCodes()
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'code', label: '邀请码', minWidth: 180 },
    { prop: 'role', label: '角色', width: 140 },
    { prop: 'maxUses', label: '最大使用次数', width: 120 },
    { prop: 'usedCount', label: '已使用', width: 100 },
    { prop: 'expireTime', label: '过期时间', width: 160 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'createTime', label: '创建时间', width: 160 },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredCodes = computed(() => {
    return inviteCodeList.value
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadInviteCodes()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadInviteCodes()
  }

  const form = reactive({
    role: '',
    maxUses: 5,
    expireDays: 30
  })

  const formRules: FormRules = {
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const handleGenerate = () => {
    form.role = ''
    form.maxUses = 5
    form.expireDays = 30
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
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + form.expireDays)
      await fetchCreateInviteCode(teamId.value, {
        maxUses: form.maxUses,
        expiresAt: form.expireDays >= 3650 ? '' : expireDate.toISOString().slice(0, 10)
      })
      ElMessage.success('邀请码生成成功')
      dialogVisible.value = false
      loadInviteCodes()
    } catch {
      ElMessage.error('生成邀请码失败')
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      ElMessage.success('邀请码已复制到剪贴板')
    })
  }

  const handleDisable = (row: InviteCodeItem) => {
    ElMessageBox.confirm(`确定要禁用邀请码「${row.code}」吗？`, '禁用确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchRevokeInviteCode(teamId.value, row.id)
        ElMessage.success('邀请码已禁用')
        loadInviteCodes()
      } catch {
        ElMessage.error('禁用失败')
      }
    })
  }

  const handleEnable = (row: InviteCodeItem) => {
    ElMessage.info(`邀请码「${row.code}」启用功能暂不支持`)
  }

  const handleDelete = (row: InviteCodeItem) => {
    ElMessageBox.confirm(`确定要删除邀请码「${row.code}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await fetchRevokeInviteCode(teamId.value, row.id)
        ElMessage.success('删除成功')
        loadInviteCodes()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .invite-stats {
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

      &.total .stat-icon {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.active .stat-icon {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.disabled .stat-icon {
        background: var(--el-color-info-light-9);
        color: var(--el-color-info);
      }

      &.used .stat-icon {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
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
