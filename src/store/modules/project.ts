import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchGetProjectList,
  fetchGetProjectDetail,
  fetchGetProjectMembers,
  fetchGetProjectConfig
} from '@/api/project'
import { fetchGetProjectEpisodes } from '@/api/script'
import { fetchGetCharacterList } from '@/api/character'

export const useProjectStore = defineStore(
  'project',
  () => {
    const projectList = ref<any[]>([])
    const currentProjectId = ref<string>('')
    const currentProject = ref<any>(null)
    const episodes = ref<any[]>([])
    const characters = ref<any[]>([])
    const members = ref<any[]>([])
    const projectConfig = ref<Record<string, string>>({})
    const loading = ref(false)

    const currentProjectName = computed(() => currentProject.value?.projectName || currentProject.value?.name || '')
    const currentEpisodes = computed(() => episodes.value)

    const loadProjectList = async (params?: any) => {
      loading.value = true
      try {
        const res = await fetchGetProjectList(params)
        projectList.value = (res as any)?.records || res || []
      } catch {
        projectList.value = []
      } finally {
        loading.value = false
      }
    }

    const loadProjectDetail = async (projectId: string) => {
      if (!projectId) return
      loading.value = true
      try {
        const res = await fetchGetProjectDetail(projectId)
        currentProject.value = res
        currentProjectId.value = projectId
      } catch {
        currentProject.value = null
      } finally {
        loading.value = false
      }
    }

    const loadEpisodes = async (projectId?: string) => {
      const id = projectId || currentProjectId.value
      if (!id) return
      try {
        const res = await fetchGetProjectEpisodes(id)
        episodes.value = res || []
      } catch {
        episodes.value = []
      }
    }

    const loadCharacters = async (projectId?: string) => {
      const id = projectId || currentProjectId.value
      if (!id) return
      try {
        const res = await fetchGetCharacterList(id)
        characters.value = res || []
      } catch {
        characters.value = []
      }
    }

    const loadMembers = async (projectId?: string) => {
      const id = projectId || currentProjectId.value
      if (!id) return
      try {
        const res = await fetchGetProjectMembers(id)
        members.value = (res as any)?.records || res || []
      } catch {
        members.value = []
      }
    }

    const loadProjectConfig = async (projectId?: string) => {
      const id = projectId || currentProjectId.value
      if (!id) return
      try {
        const res = await fetchGetProjectConfig(id)
        projectConfig.value = (res as any)?.configs || res || {}
      } catch {
        projectConfig.value = {}
      }
    }

    const setCurrentProject = (projectId: string) => {
      currentProjectId.value = projectId
    }

    const clearCurrentProject = () => {
      currentProjectId.value = ''
      currentProject.value = null
      episodes.value = []
      characters.value = []
      members.value = []
      projectConfig.value = {}
    }

    const clearAll = () => {
      projectList.value = []
      clearCurrentProject()
    }

    return {
      projectList,
      currentProjectId,
      currentProject,
      episodes,
      characters,
      members,
      projectConfig,
      loading,
      currentProjectName,
      currentEpisodes,
      loadProjectList,
      loadProjectDetail,
      loadEpisodes,
      loadCharacters,
      loadMembers,
      loadProjectConfig,
      setCurrentProject,
      clearCurrentProject,
      clearAll
    }
  },
  {
    persist: {
      key: 'project',
      storage: sessionStorage,
      pick: ['currentProjectId']
    }
  }
)
