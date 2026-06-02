import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchGetMyTeams,
  fetchGetTeamDetail,
  fetchSwitchTeam,
  fetchGetTeamMembers,
  fetchGetTeamRoles,
  fetchGetInviteCodes,
  fetchGetJoinApplications,
  fetchGetAvailablePermissions
} from '@/api/team'

export const useTeamStore = defineStore(
  'team',
  () => {
    const teamList = ref<Api.Team.UserTeamVO[]>([])
    const currentTeamId = ref<string>('')
    const currentTeamDetail = ref<Api.Team.TeamDetail | null>(null)
    const teamMembers = ref<Api.Team.TeamMemberVO[]>([])
    const teamRoles = ref<Api.Team.TeamRoleVO[]>([])
    const availablePermissions = ref<Api.Team.AvailablePermissionVO[]>([])
    const loading = ref(false)

    const currentTeam = computed(() =>
      teamList.value.find((t: any) => t.teamId === currentTeamId.value)
    )

    const currentTeamName = computed(() =>
      currentTeamDetail.value?.teamName || currentTeamDetail.value?.name || ''
    )

    const memberCount = computed(() => teamMembers.value.length)

    const loadTeamList = async () => {
      loading.value = true
      try {
        const res = await fetchGetMyTeams()
        teamList.value = res || []
        const current = teamList.value.find((t: any) => t.isCurrent)
        if (current) {
          currentTeamId.value = (current as any).teamId
        } else if (teamList.value.length > 0) {
          currentTeamId.value = (teamList.value[0] as any).teamId
        }
      } catch {
        teamList.value = []
      } finally {
        loading.value = false
      }
    }

    const loadTeamDetail = async (teamId?: string) => {
      const id = teamId || currentTeamId.value
      if (!id) return
      try {
        const res = await fetchGetTeamDetail(id)
        currentTeamDetail.value = res
        if (teamId) {
          currentTeamId.value = teamId
        }
      } catch {
        currentTeamDetail.value = null
      }
    }

    const switchTeam = async (teamId: string) => {
      try {
        await fetchSwitchTeam(teamId)
        currentTeamId.value = teamId
        await loadTeamDetail(teamId)
      } catch {
        throw new Error('切换团队失败')
      }
    }

    const loadTeamMembers = async (params?: any) => {
      if (!currentTeamId.value) return
      try {
        const res = await fetchGetTeamMembers(currentTeamId.value, params)
        teamMembers.value = (res as any)?.records || res || []
      } catch {
        teamMembers.value = []
      }
    }

    const loadTeamRoles = async () => {
      if (!currentTeamId.value) return
      try {
        const res = await fetchGetTeamRoles(currentTeamId.value)
        teamRoles.value = res || []
      } catch {
        teamRoles.value = []
      }
    }

    const loadAvailablePermissions = async () => {
      if (!currentTeamId.value) return
      try {
        const res = await fetchGetAvailablePermissions(currentTeamId.value)
        availablePermissions.value = res || []
      } catch {
        availablePermissions.value = []
      }
    }

    const clearAll = () => {
      teamList.value = []
      currentTeamId.value = ''
      currentTeamDetail.value = null
      teamMembers.value = []
      teamRoles.value = []
      availablePermissions.value = []
    }

    return {
      teamList,
      currentTeamId,
      currentTeamDetail,
      teamMembers,
      teamRoles,
      availablePermissions,
      loading,
      currentTeam,
      currentTeamName,
      memberCount,
      loadTeamList,
      loadTeamDetail,
      switchTeam,
      loadTeamMembers,
      loadTeamRoles,
      loadAvailablePermissions,
      clearAll
    }
  },
  {
    persist: false
  }
)
