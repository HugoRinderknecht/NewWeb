<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">平台团队管理</span>
        <ElSpace>
          <ElInput
            v-model="searchForm.keyword"
            placeholder="团队名称/ID"
            clearable
            style="width: 200px"
          />
          <ElSelect v-model="searchForm.status" placeholder="状态" clearable style="width: 120px">
            <ElOption label="启用" value="enabled" />
            <ElOption label="禁用" value="disabled" />
          </ElSelect>
          <ElButton type="primary" @click="handleSearch">
            <ArtSvgIcon icon="ri:search-line" :size="14" class="mr-1" />
            查询
          </ElButton>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
            创建团队
          </ElButton>
        </ElSpace>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="teamId" label="团队ID" min-width="140" show-overflow-tooltip />
        <ElTableColumn prop="teamName" label="团队名称" min-width="160" />
        <ElTableColumn prop="owner" label="负责人" min-width="120" />
        <ElTableColumn prop="memberCount" label="成员数" min-width="100" />
        <ElTableColumn prop="projectCount" label="项目数" min-width="100" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElSwitch
              v-model="scope.row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="(val: any) => handleStatusChange(scope.row, val)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" min-width="160" />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleViewMembers(scope.row)">
              查看成员
            </ElButton>
            <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ArtTable>

      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <!-- 成员弹窗 -->
    <ElDialog v-model="membersVisible" title="团队成员" width="700px" destroy-on-close>
      <ArtTable :data="memberData" stripe>
        <ElTableColumn prop="userId" label="用户ID" min-width="120" />
        <ElTableColumn prop="username" label="用户名" min-width="120" />
        <ElTableColumn prop="role" label="角色" min-width="100">
          <template #default="scope">
            <ElTag size="small">{{ scope.row.role }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="joinTime" label="加入时间" min-width="160" />
      </ArtTable>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchGetAdminTeamList,
    fetchCreateAdminTeam,
    fetchDeleteAdminTeam,
    fetchSetAdminTeamStatus,
    fetchGetAdminTeamMembers
  } from '@/api/platform-admin'
  import { transformAdminMemberList } from '@/utils/transformers'

  const loading = ref(false)
  const membersVisible = ref(false)

  const searchForm = reactive({
    keyword: '',
    status: ''
  })

  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const tableData = ref<any[]>([])
  const memberData = ref<Api.PlatformAdmin.AdminMemberDisplayVO[]>([])

  const loadTeamList = async () => {
    loading.value = true
    try {
      const data = await fetchGetAdminTeamList({
        current: pagination.page,
        size: pagination.limit,
        keyword: searchForm.keyword,
        status: searchForm.status
      } as any)
      if (data && data.records) {
        tableData.value = data.records.map((item: any) => ({
          teamId: item.teamId,
          teamName: item.teamName,
          owner: item.ownerName,
          memberCount: item.memberCount,
          projectCount: 0,
          status: item.status === 'active' ? 'enabled' : item.status,
          createTime: item.createTime
        }))
        pagination.total = data.total
      }
    } catch {
      console.error('加载团队列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadTeamList()
  })

  const handleSearch = () => {
    pagination.page = 1
    loadTeamList()
  }

  const handleAdd = async () => {
    ElMessageBox.prompt('请输入团队名称', '创建团队', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{2,50}$/,
      inputErrorMessage: '团队名称长度在 2 到 50 个字符'
    }).then(async ({ value }) => {
      try {
        await fetchCreateAdminTeam({ teamName: value })
        ElMessage.success('创建成功')
        loadTeamList()
      } catch {
        ElMessage.error('创建失败')
      }
    })
  }

  const handleStatusChange = async (row: any, val: any) => {
    try {
      await fetchSetAdminTeamStatus(row.teamId, { status: val })
      ElMessage.success(`团队 ${row.teamName} 状态已更新`)
    } catch {
      ElMessage.error('状态更新失败')
      row.status = val === 'enabled' ? 'disabled' : 'enabled'
    }
  }

  const handleViewMembers = async (row: any) => {
    try {
      const data = await fetchGetAdminTeamMembers(row.teamId, {
        current: 1,
        size: 100
      } as any)
      memberData.value = transformAdminMemberList(data?.records)
    } catch {
      memberData.value = []
    }
    membersVisible.value = true
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除团队 ${row.teamName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteAdminTeam(row.teamId)
        ElMessage.success('删除成功')
        loadTeamList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleSizeChange = (val: number) => {
    pagination.limit = val
    loadTeamList()
  }

  const handlePageChange = (val: number) => {
    pagination.page = val
    loadTeamList()
  }
</script>
