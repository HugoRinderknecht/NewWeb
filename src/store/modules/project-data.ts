import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchGetProjectList } from '@/api/project'
import { useScriptProjectStore } from './script-project'
import { useProjectStore } from './project'

export interface Project {
  id: string
  name: string
  description: string
  episodeCount: number
  status: 'active' | 'archived' | 'draft'
  createTime: string
  updateTime: string
}

export interface Episode {
  id: string
  number: number
  name: string
  projectId: string
  status: 'draft' | 'writing' | 'review' | 'completed'
  content: string
  wordCount: number
  duration: number
  updateTime: string
}

export interface Storyboard {
  id: string
  code: string
  name: string
  source: 'script' | 'manual' | 'ai'
  sceneId: string
  sceneName: string
  description: string
  thumbnail: string
  shotCount: number
  duration: number
  status: 'draft' | 'designing' | 'completed' | 'archived'
  order: number
  projectId: string
  scriptRef?: string // 关联剧本内容引用
  createTime: string
  updateTime: string
}

export interface Character {
  id: string
  name: string
  code: string
  gender: 'male' | 'female' | 'other'
  age: number
  personality: string
  positioning: string
  appearance: string
  background: string
  avatar: string
  projectId: string
}

export interface TimelineClip {
  id: string
  name: string
  startTime: number
  endTime: number
  color: string
  type: 'video' | 'audio' | 'effect'
  src?: string
}

export interface Track {
  id: string
  name: string
  type: 'video' | 'audio'
  muted: boolean
  volume: number
  clips: TimelineClip[]
}

export interface VideoPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isFullscreen: boolean
  playbackRate: number
}

// ==================== Store 定义 ====================

export const useProjectDataStore = defineStore('project-data', () => {
  // ---------- State ----------
  const currentProjectId = ref<string>('')
  const currentEpisodeId = ref<string>('')
  const currentStoryboardId = ref<string | null>(null)

  const loadingProjects = ref(false)
  const loadingProjectsError = ref<string | null>(null)

  const projects = ref<Project[]>([])

  const episodes = ref<Episode[]>([])

  const storyboards = ref<Storyboard[]>([])

  const characters = ref<Character[]>([])

  const tracks = ref<Track[]>([])

  const videoPlayerState = ref<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 120,
    volume: 1,
    isFullscreen: false,
    playbackRate: 1
  })

  // ---------- Getters ----------
  const currentProject = computed(() => projects.value.find((p) => p.id === currentProjectId.value))

  const currentEpisode = computed(() => episodes.value.find((e) => e.id === currentEpisodeId.value))

  const currentStoryboard = computed(() =>
    storyboards.value.find((s) => s.id === currentStoryboardId.value)
  )

  const projectEpisodes = computed(() =>
    episodes.value.filter((e) => e.projectId === currentProjectId.value)
  )

  const projectStoryboards = computed(() =>
    storyboards.value
      .filter((s) => s.projectId === currentProjectId.value)
      .sort((a, b) => a.order - b.order)
  )

  const projectCharacters = computed(() =>
    characters.value.filter((c) => c.projectId === currentProjectId.value)
  )

  // ---------- Actions ----------
  async function loadProjects() {
    loadingProjects.value = true
    loadingProjectsError.value = null
    try {
      const res = await fetchGetProjectList()
      const list = (res as any)?.records || res || []
      projects.value = list
      if (!currentProjectId.value && list.length > 0) {
        const firstProject = list[0]
        setCurrentProject(firstProject.id)
      }
      if (!currentEpisodeId.value && episodes.value.length > 0) {
        currentEpisodeId.value = episodes.value[0].id
      }
    } catch (error) {
      loadingProjectsError.value = error instanceof Error ? error.message : '加载项目失败'
    } finally {
      loadingProjects.value = false
    }
  }

  function setCurrentProject(projectId: string) {
    currentProjectId.value = projectId
    currentEpisodeId.value = episodes.value.find((e) => e.projectId === projectId)?.id || ''
    const scriptProjectStore = useScriptProjectStore()
    if (scriptProjectStore.currentProjectId !== projectId) {
      scriptProjectStore.setCurrentProject(projectId)
    }
    const projectStore = useProjectStore()
    if (projectStore.currentProjectId !== projectId) {
      projectStore.setCurrentProject(projectId)
    }
  }

  function setCurrentEpisode(episodeId: string) {
    currentEpisodeId.value = episodeId
  }

  function setCurrentStoryboard(storyboardId: string | null) {
    currentStoryboardId.value = storyboardId
  }

  function updateEpisodeContent(episodeId: string, content: string) {
    const episode = episodes.value.find((e) => e.id === episodeId)
    if (episode) {
      episode.content = content
      episode.wordCount = content.replace(/\s/g, '').length
      episode.updateTime = new Date().toISOString().slice(0, 10)
    }
  }

  function addStoryboard(storyboard: Omit<Storyboard, 'id' | 'createTime' | 'updateTime'>) {
    const newId = String(Math.max(...storyboards.value.map((s) => Number(s.id)), 0) + 1)
    const now = new Date().toISOString().slice(0, 10)
    storyboards.value.push({
      ...storyboard,
      id: newId,
      createTime: now,
      updateTime: now
    })
    return newId
  }

  function updateStoryboardOrder(storyboardId: string, newOrder: number) {
    const sb = storyboards.value.find((s) => s.id === storyboardId)
    if (sb) {
      sb.order = newOrder
      sb.updateTime = new Date().toISOString().slice(0, 10)
    }
  }

  function removeStoryboard(storyboardId: string) {
    storyboards.value = storyboards.value.filter((s) => s.id !== storyboardId)
  }

  function updateVideoPlayerState(state: Partial<VideoPlayerState>) {
    Object.assign(videoPlayerState.value, state)
  }

  function updateTracks(newTracks: Track[]) {
    tracks.value = newTracks
  }

  return {
    // State
    currentProjectId,
    currentEpisodeId,
    currentStoryboardId,
    loadingProjects,
    loadingProjectsError,
    projects,
    episodes,
    storyboards,
    characters,
    tracks,
    videoPlayerState,
    loadProjects,

    // Getters
    currentProject,
    currentEpisode,
    currentStoryboard,
    projectEpisodes,
    projectStoryboards,
    projectCharacters,

    // Actions
    setCurrentProject,
    setCurrentEpisode,
    setCurrentStoryboard,
    updateEpisodeContent,
    addStoryboard,
    updateStoryboardOrder,
    removeStoryboard,
    updateVideoPlayerState,
    updateTracks
  }
})
