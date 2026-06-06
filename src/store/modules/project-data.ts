import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useProjectStore } from './project'

/**
 * 项目数据 Store（轻量版）
 *
 * 本 store 仅负责追踪当前项目/剧集/分镜选中状态、视频播放器状态等 UI 相关状态。
 * 所有服务端数据（项目列表、剧集、分镜、角色等）统一通过
 * `useProjectList`、`useProjectEpisodes`、`useStoryboardList` 等 Vue Query Hook 获取。
 *
 * 当前项目 ID 的唯一真实来源为 useProjectStore（带 sessionStorage 持久化），
 * 本 store 通过 computed 引用，不再维护独立副本，消除循环依赖。
 */

// ==================== UI 状态类型 ====================

export interface VideoPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isFullscreen: boolean
  playbackRate: number
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

// ==================== Store 定义 ====================

export const useProjectDataStore = defineStore('project-data', () => {
  // ---------- 引用 project store 的 currentProjectId（唯一真实来源） ----------
  const projectStore = useProjectStore()

  const currentProjectId = computed({
    get: () => projectStore.currentProjectId,
    set: (val: string) => projectStore.setCurrentProject(val)
  })

  // ---------- 本 store 独有的 UI 状态 ----------
  const currentEpisodeId = ref<string>('')
  const currentStoryboardId = ref<string | null>(null)

  const tracks = ref<Track[]>([])

  const videoPlayerState = ref<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 120,
    volume: 1,
    isFullscreen: false,
    playbackRate: 1
  })

  // ---------- Actions ----------
  function setCurrentProject(projectId: string) {
    projectStore.setCurrentProject(projectId)
  }

  function setCurrentEpisode(episodeId: string) {
    currentEpisodeId.value = episodeId
  }

  function setCurrentStoryboard(storyboardId: string | null) {
    currentStoryboardId.value = storyboardId
  }

  function updateVideoPlayerState(state: Partial<VideoPlayerState>) {
    Object.assign(videoPlayerState.value, state)
  }

  function updateTracks(newTracks: Track[]) {
    tracks.value = newTracks
  }

  return {
    // State（currentProjectId 为 computed 代理，行为与 ref 一致）
    currentProjectId,
    currentEpisodeId,
    currentStoryboardId,
    tracks,
    videoPlayerState,

    // Actions
    setCurrentProject,
    setCurrentEpisode,
    setCurrentStoryboard,
    updateVideoPlayerState,
    updateTracks
  }
})
