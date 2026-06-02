import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== 类型定义 ====================

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
  const currentProjectId = ref<string>('1')
  const currentEpisodeId = ref<string>('1')
  const currentStoryboardId = ref<string | null>(null)

  const projects = ref<Project[]>([
    {
      id: '1',
      name: '《重生之我在古代当厨神》',
      description: '现代厨师穿越到古代，凭借厨艺征服宫廷的爆笑短剧',
      episodeCount: 12,
      status: 'active',
      createTime: '2024-01-10',
      updateTime: '2024-06-15'
    },
    {
      id: '2',
      name: '《总裁的契约甜妻》',
      description: '霸道总裁与元气少女的甜蜜契约爱情故事',
      episodeCount: 8,
      status: 'active',
      createTime: '2024-02-15',
      updateTime: '2024-06-10'
    },
    {
      id: '3',
      name: '《末日生存指南》',
      description: '丧尸病毒爆发后的末日生存冒险短剧',
      episodeCount: 6,
      status: 'active',
      createTime: '2024-01-20',
      updateTime: '2024-06-12'
    },
    {
      id: '4',
      name: '《我的AI女友》',
      description: '程序员意外获得AI女友的科幻爱情短剧',
      episodeCount: 10,
      status: 'active',
      createTime: '2024-03-01',
      updateTime: '2024-06-14'
    }
  ])

  const episodes = ref<Episode[]>([
    {
      id: '1',
      number: 1,
      name: '穿越了？我是厨神？',
      projectId: '1',
      status: 'completed',
      content: `场景：现代厨房·日景\n\n（林小厨正在厨房里忙碌，一道道精美的菜肴从他手中诞生。）\n\n林小厨\n（擦汗，看着满桌的菜品）\n终于完成了！这次的美食大赛冠军非我莫属！\n\n（突然，一道闪电劈下，林小厨眼前一黑。）\n\n场景：古代御膳房·日景\n\n（林小厨醒来，发现自己穿着古装，周围是古色古香的厨房。）\n\n林小厨\n（惊慌，看着自己的装束）\n这是哪里？我怎么会……\n\n御膳房总管\n（走进来，皱眉）\n小林子，发什么呆？还不快去准备午膳！\n\n林小厨\n（茫然，但很快镇定下来）\n是……是！\n\n（林小厨环顾四周的食材，眼中闪过一丝精光。）\n\n林小厨\n（内心独白）\n虽然不知道发生了什么，但既然有食材，那就让我这个现代厨神来大显身手吧！`,
      wordCount: 4200,
      duration: 15,
      updateTime: '2024-06-15'
    },
    {
      id: '2',
      number: 2,
      name: '第一道招牌菜',
      projectId: '1',
      status: 'completed',
      content: `场景：御膳房·日景\n\n（林小厨站在灶台前，看着眼前的猪肉，胸有成竹。）\n\n林小厨\n（自言自语）\n既然要征服古代人的胃，那就从最简单的红烧肉开始吧！`,
      wordCount: 3800,
      duration: 15,
      updateTime: '2024-06-14'
    }
  ])

  const storyboards = ref<Storyboard[]>([
    {
      id: '1',
      code: 'SB-001',
      name: '开场·山巅俯瞰',
      source: 'script',
      sceneId: '1',
      sceneName: '青丘山',
      description: '主角阿禹站在青丘山巅，俯瞰大地，风吹衣袂',
      thumbnail: '',
      shotCount: 3,
      duration: 15,
      status: 'completed',
      order: 1,
      projectId: '1',
      scriptRef: '场景：青丘山·日景',
      createTime: '2024-01-10',
      updateTime: '2024-06-15'
    },
    {
      id: '2',
      code: 'SB-002',
      name: '九尾狐现身',
      source: 'ai',
      sceneId: '1',
      sceneName: '青丘山',
      description: '九尾狐从竹林中缓缓走出，九条尾巴摇曳生姿',
      thumbnail: '',
      shotCount: 5,
      duration: 25,
      status: 'designing',
      order: 2,
      projectId: '1',
      scriptRef: '九尾狐从竹林中缓缓走出',
      createTime: '2024-01-12',
      updateTime: '2024-06-14'
    },
    {
      id: '3',
      code: 'SB-003',
      name: '对话·寻药之旅',
      source: 'manual',
      sceneId: '1',
      sceneName: '青丘山',
      description: '阿禹与九尾狐对话，得知救治师父的方法',
      thumbnail: '',
      shotCount: 4,
      duration: 30,
      status: 'completed',
      order: 3,
      projectId: '1',
      scriptRef: '阿禹与九尾狐对话',
      createTime: '2024-01-15',
      updateTime: '2024-06-10'
    },
    {
      id: '4',
      code: 'SB-004',
      name: '昆仑仙境',
      source: 'script',
      sceneId: '2',
      sceneName: '昆仑墟',
      description: '昆仑墟云雾缭绕，仙鹤飞舞，仙乐飘飘',
      thumbnail: '',
      shotCount: 6,
      duration: 35,
      status: 'draft',
      order: 4,
      projectId: '2',
      scriptRef: '场景：昆仑墟·日景',
      createTime: '2024-02-01',
      updateTime: '2024-06-16'
    },
    {
      id: '5',
      code: 'SB-005',
      name: '白泽授业',
      source: 'manual',
      sceneId: '2',
      sceneName: '昆仑墟',
      description: '白泽向阿禹传授辨识万物之法',
      thumbnail: '',
      shotCount: 4,
      duration: 28,
      status: 'designing',
      order: 5,
      projectId: '2',
      scriptRef: '白泽向阿禹传授辨识万物之法',
      createTime: '2024-02-05',
      updateTime: '2024-06-12'
    },
    {
      id: '6',
      code: 'SB-006',
      name: '幽都之门',
      source: 'ai',
      sceneId: '3',
      sceneName: '幽都',
      description: '阴森恐怖的幽都城门，鬼火闪烁',
      thumbnail: '',
      shotCount: 3,
      duration: 18,
      status: 'completed',
      order: 6,
      projectId: '3',
      scriptRef: '场景：幽都·夜景',
      createTime: '2024-03-01',
      updateTime: '2024-05-20'
    }
  ])

  const characters = ref<Character[]>([
    {
      id: '1',
      name: '林小厨',
      code: 'CHAR-001',
      gender: 'male',
      age: 25,
      personality: '乐观开朗、机智幽默',
      positioning: '主角',
      appearance: '阳光帅气，常穿白色厨师服',
      background: '现代顶级厨师，意外穿越到古代',
      avatar: '',
      projectId: '1'
    },
    {
      id: '2',
      name: '御膳房总管',
      code: 'CHAR-002',
      gender: 'male',
      age: 50,
      personality: '严厉、正直',
      positioning: '配角',
      appearance: '威严中年，身着官服',
      background: '御膳房负责人，对厨艺要求极高',
      avatar: '',
      projectId: '1'
    }
  ])

  const tracks = ref<Track[]>([
    {
      id: 'tv1',
      name: '视频 1',
      type: 'video',
      muted: false,
      volume: 100,
      clips: [
        { id: 'c1', name: '开场', startTime: 0, endTime: 15, color: '#409eff', type: 'video' },
        { id: 'c2', name: '介绍', startTime: 15, endTime: 45, color: '#67c23a', type: 'video' },
        { id: 'c3', name: '结尾', startTime: 45, endTime: 60, color: '#e6a23c', type: 'video' }
      ]
    },
    {
      id: 'tv2',
      name: '视频 2',
      type: 'video',
      muted: false,
      volume: 100,
      clips: [{ id: 'c4', name: '字幕', startTime: 0, endTime: 60, color: '#f56c6c', type: 'video' }]
    },
    {
      id: 'ta1',
      name: '音频 1',
      type: 'audio',
      muted: false,
      volume: 80,
      clips: [{ id: 'c5', name: '背景音乐', startTime: 0, endTime: 60, color: '#909399', type: 'audio' }]
    },
    {
      id: 'ta2',
      name: '音频 2',
      type: 'audio',
      muted: false,
      volume: 60,
      clips: [{ id: 'c6', name: '旁白', startTime: 5, endTime: 50, color: '#b88230', type: 'audio' }]
    }
  ])

  const videoPlayerState = ref<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 120,
    volume: 1,
    isFullscreen: false,
    playbackRate: 1
  })

  // ---------- Getters ----------
  const currentProject = computed(() =>
    projects.value.find((p) => p.id === currentProjectId.value)
  )

  const currentEpisode = computed(() =>
    episodes.value.find((e) => e.id === currentEpisodeId.value)
  )

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
  function setCurrentProject(projectId: string) {
    currentProjectId.value = projectId
    currentEpisodeId.value = episodes.value.find((e) => e.projectId === projectId)?.id || '1'
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
    projects,
    episodes,
    storyboards,
    characters,
    tracks,
    videoPlayerState,

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
