<template>
  <div class="team-settings-page art-full-height">
    <ElTabs v-model="activeTab" type="border-card" class="settings-tabs">
      <!-- 基本信息 -->
      <ElTabPane label="基本信息" name="basic">
        <ElRow :gutter="20">
          <ElCol :sm="24" :md="16" :lg="16">
            <ElCard class="art-table-card mb-5">
              <template #header>
                <div class="flex-cb">
                  <div class="flex items-center gap-4">
                    <span class="text-lg font-medium">团队信息</span>
                    <ElTag type="info" size="small">编辑团队基本信息</ElTag>
                  </div>
                </div>
              </template>
              <ElForm :model="teamForm" label-width="100px" :rules="teamRules" ref="teamFormRef">
                <ElFormItem label="团队名称" prop="name" required>
                  <ElInput v-model="teamForm.name" placeholder="请输入团队名称" />
                </ElFormItem>
                <ElFormItem label="团队简介">
                  <ElInput
                    v-model="teamForm.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入团队简介"
                  />
                </ElFormItem>
                <ElFormItem label="团队邮箱" prop="email">
                  <ElInput v-model="teamForm.email" placeholder="请输入团队邮箱" />
                </ElFormItem>
                <ElFormItem label="团队官网">
                  <ElInput v-model="teamForm.website" placeholder="请输入团队官网地址" />
                </ElFormItem>
                <ElFormItem label="所在地区">
                  <ElSelect v-model="teamForm.region" placeholder="请选择所在地区" class="w-full">
                    <ElOption label="北京" value="北京" />
                    <ElOption label="上海" value="上海" />
                    <ElOption label="广州" value="广州" />
                    <ElOption label="深圳" value="深圳" />
                    <ElOption label="杭州" value="杭州" />
                    <ElOption label="成都" value="成都" />
                    <ElOption label="其他" value="其他" />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" @click="handleSaveTeam">
                    <ArtSvgIcon icon="ri:save-line" class="mr-1" />
                    保存信息
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>

            <!-- 转让所有权 -->
            <ElCard class="art-table-card mb-5">
              <template #header>
                <div class="flex-cb">
                  <div class="flex items-center gap-4">
                    <span class="text-lg font-medium">转让所有权</span>
                    <ElTag type="warning" size="small">谨慎操作</ElTag>
                  </div>
                </div>
              </template>
              <ElForm :model="transferForm" label-width="100px">
                <ElFormItem label="新所有者" required>
                  <ElSelect
                    v-model="transferForm.newOwner"
                    placeholder="请选择新所有者"
                    class="w-full"
                  >
                    <ElOption
                      v-for="member in memberOptions"
                      :key="member.value"
                      :label="member.label"
                      :value="member.value"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="转让原因">
                  <ElInput
                    v-model="transferForm.reason"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入转让原因"
                  />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="warning" @click="handleTransfer">
                    <ArtSvgIcon icon="ri:exchange-line" class="mr-1" />
                    确认转让
                  </ElButton>
                </ElFormItem>
              </ElForm>
            </ElCard>
          </ElCol>

          <ElCol :sm="24" :md="8" :lg="8">
            <ElCard class="art-table-card mb-5">
              <template #header>
                <div class="flex-cb">
                  <span class="text-lg font-medium">团队概览</span>
                </div>
              </template>
              <div class="team-overview">
                <div class="overview-item">
                  <div class="overview-label">创建时间</div>
                  <div class="overview-value">{{ teamOverview.createTime }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">当前所有者</div>
                  <div class="overview-value">{{ teamOverview.owner }}</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">成员总数</div>
                  <div class="overview-value">{{ teamOverview.memberCount }} 人</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">项目总数</div>
                  <div class="overview-value">{{ teamOverview.projectCount }} 个</div>
                </div>
                <div class="overview-item">
                  <div class="overview-label">团队ID</div>
                  <div class="overview-value font-mono text-g-400">{{ teamOverview.teamId }}</div>
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>

        <!-- 危险区 -->
        <ElRow :gutter="20">
          <ElCol :sm="24" :md="24" :lg="24">
            <ElCard class="art-table-card danger-zone">
              <template #header>
                <div class="flex-cb">
                  <div class="flex items-center gap-4">
                    <span class="text-lg font-medium text-danger">危险区</span>
                    <ElTag type="danger" size="small">不可逆操作</ElTag>
                  </div>
                </div>
              </template>
              <div class="danger-content">
                <div class="danger-item">
                  <div>
                    <div class="font-medium">解散团队</div>
                    <div class="text-sm text-g-400 mt-1">
                      解散后所有项目、资产、数据将被永久删除，此操作不可恢复
                    </div>
                  </div>
                  <ElButton type="danger" @click="handleDisband">
                    <ArtSvgIcon icon="ri:alert-line" class="mr-1" />
                    解散团队
                  </ElButton>
                </div>
              </div>
            </ElCard>
          </ElCol>
        </ElRow>
      </ElTabPane>

      <!-- 操作审计日志 -->
      <ElTabPane label="操作审计" name="audit">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">操作审计日志</span>
                <ElTag type="info" size="small">记录团队敏感操作</ElTag>
              </div>
              <ElSpace>
                <ElInput
                  v-model="auditSearchQuery"
                  placeholder="搜索操作人/内容"
                  clearable
                  style="width: 220px"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="auditFilterType"
                  placeholder="操作类型"
                  clearable
                  style="width: 140px"
                >
                  <ElOption label="成员管理" value="member" />
                  <ElOption label="权限变更" value="permission" />
                  <ElOption label="团队设置" value="settings" />
                  <ElOption label="资源操作" value="resource" />
                </ElSelect>
              </ElSpace>
            </div>
          </template>

          <ArtTable
            :data="filteredAuditLogs"
            :columns="auditColumns"
            :pagination="auditPagination"
            @pagination:size-change="handleAuditSizeChange"
            @pagination:current-change="handleAuditCurrentChange"
          >
            <template #default>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="操作人" min-width="180">
                <template #default="{ row }">
                  <div class="flex-c">
                    <ElAvatar :size="32" :src="row.operatorAvatar" class="mr-2">
                      <ArtSvgIcon icon="ri:user-line" />
                    </ElAvatar>
                    <div>
                      <div class="font-medium">{{ row.operatorName }}</div>
                      <div class="text-xs text-g-400">{{ row.operatorEmail }}</div>
                    </div>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作类型" width="120">
                <template #default="{ row }">
                  <ElTag :type="auditTypeTagMap[row.type as AuditType]" size="small">
                    {{ auditTypeLabelMap[row.type as AuditType] }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn
                prop="content"
                label="操作内容"
                min-width="240"
                show-overflow-tooltip
              />
              <ElTableColumn prop="ip" label="IP地址" width="130" />
              <ElTableColumn prop="time" label="操作时间" width="160" />
              <ElTableColumn label="状态" width="90">
                <template #default="{ row }">
                  <ElTag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ row.status === 'success' ? '成功' : '失败' }}
                  </ElTag>
                </template>
              </ElTableColumn>
            </template>
          </ArtTable>
        </ElCard>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    fetchGetTeamDetail,
    fetchUpdateTeam,
    fetchTransferOwnership,
    fetchGetTeamMembers
  } from '@/api/team'
  import { useRoute } from 'vue-router'

  defineOptions({ name: 'TeamSettings' })

  const route = useRoute()
  const teamId = computed(() => String(route.query.id || ''))
  const loading = ref(false)

  const teamFormRef = ref<FormInstance>()

  const teamForm = reactive({
    name: '',
    description: '',
    email: '',
    website: '',
    region: ''
  })

  const teamRules: FormRules = {
    name: [{ required: true, message: '请输入团队名称', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
  }

  const transferForm = reactive({
    newOwner: '',
    reason: ''
  })

  const memberOptions = ref<{ label: string; value: string }[]>([])

  const loadMemberOptions = async () => {
    if (!teamId.value) return
    try {
      const res = await fetchGetTeamMembers(teamId.value, { current: 1, size: 100 })
      memberOptions.value = (res?.records || []).map((m: any) => ({
        label: `${m.userName || m.nickname} (${m.roleName || '成员'})`,
        value: m.memberId || m.userId
      }))
    } catch {
      // ignore
    }
  }

  const teamOverview = reactive({
    createTime: '',
    owner: '',
    memberCount: 0,
    projectCount: 0,
    teamId: ''
  })

  const loadTeamDetail = async () => {
    if (!teamId.value) return
    loading.value = true
    try {
      const res = await fetchGetTeamDetail(teamId.value)
      teamForm.name = res.teamName || res.name || ''
      teamForm.description = res.description || ''
      teamForm.email = res.email || ''
      teamForm.website = res.website || ''
      teamForm.region = res.region || ''
      teamOverview.createTime = res.createTime || ''
      teamOverview.owner = res.ownerName || ''
      teamOverview.memberCount = res.memberCount || 0
      teamOverview.projectCount = res.projectCount || 0
      teamOverview.teamId = res.teamId || teamId.value
    } catch {
      ElMessage.error('获取团队信息失败')
    } finally {
      loading.value = false
    }
  }

  const handleSaveTeam = async () => {
    if (!teamFormRef.value) return
    await teamFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await fetchUpdateTeam(teamId.value, {
            teamName: teamForm.name,
            description: teamForm.description,
            email: teamForm.email,
            website: teamForm.website,
            region: teamForm.region
          })
          ElMessage.success('团队信息已保存')
        } catch {
          ElMessage.error('保存失败')
        }
      }
    })
  }

  const handleTransfer = () => {
    if (!transferForm.newOwner) {
      ElMessage.warning('请选择新所有者')
      return
    }
    ElMessageBox.confirm('确定要将团队所有权转让吗？转让后您将失去所有者权限。', '转让确认', {
      confirmButtonText: '确定转让',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchTransferOwnership(teamId.value, transferForm.newOwner)
        const selected = memberOptions.value.find((m) => m.value === transferForm.newOwner)
        if (selected) teamOverview.owner = selected.label.split(' ')[0]
        transferForm.newOwner = ''
        transferForm.reason = ''
        ElMessage.success('团队所有权转让成功')
      } catch {
        ElMessage.error('转让失败')
      }
    })
  }

  const handleDisband = () => {
    ElMessageBox.confirm(
      '此操作将永久解散团队，所有项目、资产、数据将被删除且无法恢复。请输入「解散团队」以确认。',
      '解散团队确认',
      {
        confirmButtonText: '确认解散',
        cancelButtonText: '取消',
        type: 'error',
        inputPattern: /^解散团队$/,
        inputErrorMessage: '请输入「解散团队」以确认'
      }
    ).then(() => {
      ElMessage.success('团队已解散')
    })
  }

  onMounted(() => {
    loadTeamDetail()
    loadMemberOptions()
  })

  const activeTab = ref('basic')
  const auditSearchQuery = ref('')
  const auditFilterType = ref('')

  type AuditType = 'member' | 'permission' | 'settings' | 'resource'

  interface AuditLogItem {
    id: number
    operatorName: string
    operatorEmail: string
    operatorAvatar: string
    type: AuditType
    content: string
    ip: string
    time: string
    status: 'success' | 'failed'
  }

  const auditTypeTagMap: Record<AuditType, 'primary' | 'warning' | 'info' | 'danger'> = {
    member: 'primary',
    permission: 'warning',
    settings: 'info',
    resource: 'danger'
  }

  const auditTypeLabelMap: Record<AuditType, string> = {
    member: '成员管理',
    permission: '权限变更',
    settings: '团队设置',
    resource: '资源操作'
  }

  const auditLogList = ref<AuditLogItem[]>([
    {
      id: 1,
      operatorName: '张小明',
      operatorEmail: 'zhangxm@example.com',
      operatorAvatar: '',
      type: 'member',
      content: '邀请陈小东加入团队，角色：动画师',
      ip: '192.168.1.101',
      time: '2024-06-15 10:30:22',
      status: 'success'
    },
    {
      id: 2,
      operatorName: '张小明',
      operatorEmail: 'zhangxm@example.com',
      operatorAvatar: '',
      type: 'member',
      content: '将李小红的角色从"美术"变更为"导演"',
      ip: '192.168.1.101',
      time: '2024-06-14 16:45:10',
      status: 'success'
    },
    {
      id: 3,
      operatorName: '李小红',
      operatorEmail: 'lixh@example.com',
      operatorAvatar: '',
      type: 'permission',
      content: '为"动画师"角色添加"视频生成"权限',
      ip: '192.168.1.102',
      time: '2024-06-14 11:20:05',
      status: 'success'
    },
    {
      id: 4,
      operatorName: '张小明',
      operatorEmail: 'zhangxm@example.com',
      operatorAvatar: '',
      type: 'settings',
      content: '修改团队名称为"星梦云算创作团队"',
      ip: '192.168.1.101',
      time: '2024-06-13 09:15:33',
      status: 'success'
    },
    {
      id: 5,
      operatorName: '王小刚',
      operatorEmail: 'wangxg@example.com',
      operatorAvatar: '',
      type: 'resource',
      content: '导出项目"品牌宣传片"的全部资产',
      ip: '192.168.1.103',
      time: '2024-06-12 14:30:18',
      status: 'success'
    },
    {
      id: 6,
      operatorName: '赵小美',
      operatorEmail: 'zhaoxm@example.com',
      operatorAvatar: '',
      type: 'member',
      content: '尝试移除项目经理张小明，操作被拒绝',
      ip: '192.168.1.104',
      time: '2024-06-10 10:05:42',
      status: 'failed'
    },
    {
      id: 7,
      operatorName: '张小明',
      operatorEmail: 'zhangxm@example.com',
      operatorAvatar: '',
      type: 'permission',
      content: '禁用"实习生"角色的"视频生成"权限',
      ip: '192.168.1.101',
      time: '2024-06-09 17:20:11',
      status: 'success'
    },
    {
      id: 8,
      operatorName: '李小红',
      operatorEmail: 'lixh@example.com',
      operatorAvatar: '',
      type: 'settings',
      content: '修改团队邮箱为 team@stardream.com',
      ip: '192.168.1.102',
      time: '2024-06-08 11:45:29',
      status: 'success'
    }
  ])

  const auditColumns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'operatorName', label: '操作人', minWidth: 180 },
    { prop: 'type', label: '操作类型', width: 120 },
    { prop: 'content', label: '操作内容', minWidth: 240 },
    { prop: 'ip', label: 'IP地址', width: 130 },
    { prop: 'time', label: '操作时间', width: 160 },
    { prop: 'status', label: '状态', width: 90 }
  ]

  const auditPagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredAuditLogs = computed(() => {
    let result = auditLogList.value
    if (auditSearchQuery.value) {
      const q = auditSearchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.operatorName.toLowerCase().includes(q) || item.content.toLowerCase().includes(q)
      )
    }
    if (auditFilterType.value) {
      result = result.filter((item) => item.type === auditFilterType.value)
    }
    const total = result.length
    const start = (auditPagination.current - 1) * auditPagination.size
    const end = start + auditPagination.size
    nextTick(() => {
      auditPagination.total = total
    })
    return result.slice(start, end)
  })

  const handleAuditSizeChange = (size: number) => {
    auditPagination.size = size
    auditPagination.current = 1
  }

  const handleAuditCurrentChange = (current: number) => {
    auditPagination.current = current
  }
</script>

<style lang="scss" scoped>
  .team-settings-page {
    height: 100%;
  }

  .team-overview {
    .overview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .overview-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }

      .overview-value {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }

  .danger-zone {
    border-color: var(--el-color-danger-light-7);

    :deep(.el-card__header) {
      background: var(--el-color-danger-light-9);
    }
  }

  .danger-content {
    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: var(--el-color-danger-light-9);
      border-radius: var(--custom-radius);
    }
  }
</style>
