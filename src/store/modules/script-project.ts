import { defineStore } from 'pinia'
import { storeToRefs } from 'pinia'
import { useProjectDataStore, type Project } from './project-data'

export interface ProjectItem {
  id: string
  name: string
  description: string
  episodeCount: number
}

export const useScriptProjectStore = defineStore('script-project', {
  state: () => ({
    currentProjectId: '',
    currentScriptId: ''
  }),

  getters: {
    /** 复用 project-data store 的项目列表 */
    projectList(): ProjectItem[] {
      const { projects } = storeToRefs(useProjectDataStore())
      return projects.value.map((p: Project) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        episodeCount: p.episodeCount
      }))
    },
    currentProject(): ProjectItem | undefined {
      return this.projectList.find((p) => p.id === this.currentProjectId)
    },
    projectOptions(): { id: string; name: string; episodeCount: number }[] {
      return this.projectList.map((p) => ({ id: p.id, name: p.name, episodeCount: p.episodeCount }))
    }
  },

  actions: {
    setCurrentProject(projectId: string) {
      this.currentProjectId = projectId
      const projectDataStore = useProjectDataStore()
      if (projectDataStore.currentProjectId !== projectId) {
        projectDataStore.setCurrentProject(projectId)
      }
    },

    setCurrentScript(scriptId: string) {
      this.currentScriptId = scriptId
    },

    updateEpisodeCount(projectId: string, delta: number) {
      // 同步更新到 project-data store
      const projectDataStore = useProjectDataStore()
      const project = projectDataStore.projects.find((p) => p.id === projectId)
      if (project) {
        project.episodeCount = Math.max(0, project.episodeCount + delta)
      }
    }
  },

  persist: false
})
