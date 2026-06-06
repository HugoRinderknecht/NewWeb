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

  import { useAvailablePermissions, useSetRolePermissions } from '@/api/queries'
  import { useTeamStore } from '@/store/modules/team'

  interface PermissionItem {
    code: string
    name: string
    description: string
    category: string
    enabled: boolean
  }

  const teamStore = useTeamStore()

  // Vue Query: 可用权限列表
  const teamId = computed(() => teamStore.currentTeamId || undefined)
  const { data: permissionsData, isLoading: loading } = useAvailablePermissions(teamId)

  // Mutation
  const setRolePermissionsMutation = useSetRolePermissions()

  const permissionList = computed<PermissionItem[]>(() =>
    (permissionsData.value || []).map((item: any) => ({
      code: item.code,
      name: item.name,
      description: item.description,
      category: item.category,
      enabled: false
    }))
  )

  const handlePermissionChange = async (row: PermissionItem) => {
    const tid = teamStore.currentTeamId
    if (!tid) return
    const enabledCodes = permissionList.value.filter((p) => p.enabled).map((p) => p.code)
    try {
      await setRolePermissionsMutation.mutateAsync({
        teamId: tid,
        roleId: 'default',
        permissionCodes: enabledCodes
      })
    } catch {
      ElMessage.error('权限更新失败')
      row.enabled = !row.enabled
    }
  }
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
