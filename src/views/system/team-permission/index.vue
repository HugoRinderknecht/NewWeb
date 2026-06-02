<template>
  <div class="team-permission-page">
    <h2 class="page-title">权限分配</h2>

    <ElCard>
      <ElTable :data="permissionList" border style="width: 100%">
        <ElTableColumn prop="name" label="权限名称" min-width="180" />
        <ElTableColumn prop="description" label="权限描述" min-width="280" />
        <ElTableColumn label="启用状态" width="120" align="center">
          <template #default="{ row }">
            <ElSwitch v-model="row.enabled" @change="handlePermissionChange(row)" />
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'TeamPermission' })

  import { fetchGetAvailablePermissions, fetchSetRolePermissions } from '@/api/team'
  import { useTeamStore } from '@/store/modules/team'

  interface PermissionItem {
    code: string
    name: string
    description: string
    category: string
    enabled: boolean
  }

  const teamStore = useTeamStore()
  const loading = ref(false)

  const permissionList = ref<PermissionItem[]>([])

  const loadPermissions = async () => {
    const teamId = teamStore.currentTeamId
    if (!teamId) return
    loading.value = true
    try {
      const data = await fetchGetAvailablePermissions(teamId)
      if (Array.isArray(data)) {
        permissionList.value = data.map((item: any) => ({
          code: item.code,
          name: item.name,
          description: item.description,
          category: item.category,
          enabled: false
        }))
      }
    } catch {
      console.error('加载权限列表失败')
    } finally {
      loading.value = false
    }
  }

  const handlePermissionChange = async (row: PermissionItem) => {
    const teamId = teamStore.currentTeamId
    if (!teamId) return
    const enabledCodes = permissionList.value.filter((p) => p.enabled).map((p) => p.code)
    try {
      await fetchSetRolePermissions(teamId, 'default', enabledCodes)
    } catch {
      ElMessage.error('权限更新失败')
      row.enabled = !row.enabled
    }
  }

  onMounted(() => {
    loadPermissions()
  })
</script>

<style scoped>
  .team-permission-page {
    padding: 20px;
  }

  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: 600;
  }
</style>
