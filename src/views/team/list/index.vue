<template>
  <div class="team-list-page art-full-height">
    <!-- 顶部统计 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol v-for="(item, index) in statsCards" :key="index" :sm="12" :md="6" :lg="6">
        <div class="art-card relative flex flex-col justify-center h-35 px-5">
          <span class="text-g-700 text-sm">{{ item.label }}</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-[26px] font-medium">{{ item.value }}</span>
            <span class="text-g-500 text-sm">{{ item.unit }}</span>
          </div>
          <div
            class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
          >
            <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 团队列表 -->
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">我的团队</span>
            <ElTag type="info" size="small">管理您创建或加入的团队</ElTag>
          </div>
          <ElButton type="primary" @click="handleCreateTeam">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            创建团队
          </ElButton>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar mb-4">
        <ElSpace>
          <ElInput v-model="searchQuery" placeholder="搜索团队名称" clearable style="width: 260px">
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
            </template>
          </ElInput>
          <ElSelect
            v-model="filterRole"
            placeholder="我在团队中的身份"
            clearable
            style="width: 160px"
          >
            <ElOption label="创建者" value="owner" />
            <ElOption label="管理员" value="admin" />
            <ElOption label="成员" value="member" />
          </ElSelect>
        </ElSpace>
      </div>

      <ArtTable
        :data="filteredTeams"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" label="序号" width="70" align="center" />
          <ElTableColumn label="团队" min-width="260">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg"
                >
                  {{ row.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-medium flex items-center gap-2">
                    {{ row.name }}
                    <ElTag v-if="row.isCurrent" type="success" size="small">当前团队</ElTag>
                  </div>
                  <div class="text-xs text-g-400 mt-0.5">{{ row.description }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="我的身份" width="120">
            <template #default="{ row }">
              <ElTag :type="roleTagMap[row.myRole as TeamRole]" size="small">
                {{ roleLabelMap[row.myRole as TeamRole] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="memberCount" label="成员数" width="100" align="center" />
          <ElTableColumn prop="projectCount" label="项目数" width="100" align="center" />
          <ElTableColumn prop="createTime" label="创建时间" width="160" />
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                {{ row.status === 'active' ? '正常' : '已归档' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <ElSpace>
                <ElButton
                  v-if="!row.isCurrent"
                  type="primary"
                  link
                  size="small"
                  @click="handleSwitchTeam(row)"
                >
                  <ArtSvgIcon icon="ri:exchange-line" class="mr-1" />
                  切换
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleGoSettings(row)">
                  <ArtSvgIcon icon="ri:settings-3-line" class="mr-1" />
                  设置
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleGoMembers(row)">
                  <ArtSvgIcon icon="ri:team-line" class="mr-1" />
                  成员
                </ElButton>
                <ElButton
                  v-if="row.myRole !== 'owner'"
                  type="danger"
                  link
                  size="small"
                  @click="handleLeaveTeam(row)"
                >
                  <ArtSvgIcon icon="ri:logout-box-r-line" class="mr-1" />
                  退出
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 创建团队弹窗 -->
    <ElDialog
      v-model="showCreateDialog"
      title="创建团队"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm :model="createForm" label-width="100px" :rules="createRules" ref="createFormRef">
        <ElFormItem label="团队名称" prop="name">
          <ElInput
            v-model="createForm.name"
            placeholder="请输入团队名称"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="团队描述" prop="description">
          <ElInput
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入团队描述"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem label="团队邮箱" prop="email">
          <ElInput v-model="createForm.email" placeholder="请输入团队邮箱" />
        </ElFormItem>
        <ElFormItem label="所在地区">
          <ElSelect v-model="createForm.region" placeholder="请选择所在地区" class="w-full">
            <ElOption label="北京" value="北京" />
            <ElOption label="上海" value="上海" />
            <ElOption label="广州" value="广州" />
            <ElOption label="深圳" value="深圳" />
            <ElOption label="杭州" value="杭州" />
            <ElOption label="成都" value="成都" />
            <ElOption label="其他" value="其他" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showCreateDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleCreateSubmit">创建</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { fetchGetMyTeams, fetchSwitchTeam, fetchLeaveTeam } from '@/api/team'

  defineOptions({ name: 'TeamList' })

  const router = useRouter()

  type TeamRole = 'owner' | 'admin' | 'member'

  interface TeamItem {
    id: string
    name: string
    description: string
    myRole: TeamRole
    memberCount: number
    projectCount: number
    createTime: string
    status: 'active' | 'archived'
    isCurrent: boolean
  }

  const searchQuery = ref('')
  const filterRole = ref('')
  const showCreateDialog = ref(false)
  const createFormRef = ref<FormInstance>()
  const loading = ref(false)

  const roleTagMap: Record<TeamRole, 'danger' | 'warning' | 'info'> = {
    owner: 'danger',
    admin: 'warning',
    member: 'info'
  }

  const roleLabelMap: Record<TeamRole, string> = {
    owner: '创建者',
    admin: '管理员',
    member: '成员'
  }

  const statsCards = computed(() => {
    const list = teamList.value
    return [
      { label: '我的团队', value: list.length, unit: '个', icon: 'ri:team-line' },
      {
        label: '我创建的',
        value: list.filter((t) => t.myRole === 'owner').length,
        unit: '个',
        icon: 'ri:user-star-line'
      },
      {
        label: '总成员',
        value: list.reduce((sum, t) => sum + t.memberCount, 0),
        unit: '人',
        icon: 'ri:user-follow-line'
      },
      {
        label: '总项目',
        value: list.reduce((sum, t) => sum + t.projectCount, 0),
        unit: '个',
        icon: 'ri:folder-3-line'
      }
    ]
  })

  const teamList = ref<TeamItem[]>([])

  const loadTeamList = async () => {
    loading.value = true
    try {
      const res = await fetchGetMyTeams()
      teamList.value = (res || []).map((item: any) => ({
        id: item.teamId,
        name: item.teamName || '',
        description: item.description || '',
        myRole: item.role || 'member',
        memberCount: item.memberCount || 0,
        projectCount: item.projectCount || 0,
        createTime: item.createTime || '',
        status: item.status === 1 ? 'active' : 'archived',
        isCurrent: item.isCurrent || false
      }))
    } catch {
      ElMessage.error('获取团队列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadTeamList()
  })

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'name', label: '团队', minWidth: 260 },
    { prop: 'myRole', label: '我的身份', width: 120 },
    { prop: 'memberCount', label: '成员数', width: 100 },
    { prop: 'projectCount', label: '项目数', width: 100 },
    { prop: 'createTime', label: '创建时间', width: 160 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 280, fixed: 'right' }
  ]

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const filteredTeams = computed(() => {
    let result = teamList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.name.toLowerCase().includes(q))
    }
    if (filterRole.value) {
      result = result.filter((item) => item.myRole === filterRole.value)
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

  const handleCreateTeam = () => {
    showCreateDialog.value = true
  }

  const createForm = reactive({
    name: '',
    description: '',
    email: '',
    region: ''
  })

  const createRules: FormRules = {
    name: [
      { required: true, message: '请输入团队名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入团队描述', trigger: 'blur' },
      { max: 200, message: '长度不超过 200 个字符', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入团队邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ]
  }

  const handleCreateSubmit = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate((valid) => {
      if (valid) {
        // TODO: 后端暂无用户自助创建团队接口，待接口就绪后替换为API调用
        const newTeam: TeamItem = {
          id: String(Date.now()),
          name: createForm.name,
          description: createForm.description,
          myRole: 'owner',
          memberCount: 1,
          projectCount: 0,
          createTime: new Date().toLocaleString('zh-CN'),
          status: 'active',
          isCurrent: false
        }
        teamList.value.push(newTeam)
        ElMessage.success('团队创建成功')
        showCreateDialog.value = false
        createFormRef.value?.resetFields()
      }
    })
  }

  const handleSwitchTeam = async (row: TeamItem) => {
    try {
      await fetchSwitchTeam(String(row.id))
      teamList.value.forEach((t) => (t.isCurrent = false))
      const team = teamList.value.find((t) => t.id === row.id)
      if (team) team.isCurrent = true
      ElMessage.success(`已切换到「${row.name}」`)
    } catch {
      ElMessage.error('切换团队失败')
    }
  }

  const handleGoSettings = (row: TeamItem) => {
    router.push(`/team/settings?id=${row.id}`)
  }

  const handleGoMembers = (row: TeamItem) => {
    router.push(`/team/members?id=${row.id}`)
  }

  const handleLeaveTeam = (row: TeamItem) => {
    ElMessageBox.confirm(
      `确定要退出「${row.name}」吗？退出后将无法访问该团队的资源。`,
      '退出确认',
      {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await fetchLeaveTeam(String(row.id))
        teamList.value = teamList.value.filter((t) => t.id !== row.id)
        ElMessage.success('已退出团队')
      } catch {
        ElMessage.error('退出团队失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .team-list-page {
    .search-bar {
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }
  }
</style>
