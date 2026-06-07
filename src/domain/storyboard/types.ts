/**
 * 分镜领域 ViewModel 类型定义
 *
 * 面向分镜列表/详情页面 UI 展示的类型，与后端 DTO 解耦。
 *
 * @module domain/storyboard/types
 */

import type { ListItemBaseViewModel, DetailBaseViewModel } from '../types'

/** 分镜状态枚举（前端语义） */
export type StoryboardStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'generating'

/** 分镜列表项 ViewModel */
export interface StoryboardListItemViewModel extends ListItemBaseViewModel {
  sceneId: string
  projectId: string
  scriptId: string
  episodeId: string
  episodeName: string
  episodeIndex: number
  storyboardNo: number
  title: string
  description: string
  prompt: string
  cameraAngle: string
  cameraMovement: string
  durationSeconds: number
  status: StoryboardStatus
  assetCount: number
  imageCount: number
  versionCount: number
  creatorName?: string
}

/** 分镜详情 ViewModel */
export interface StoryboardDetailViewModel extends DetailBaseViewModel {
  sceneId: string
  projectId: string
  scriptId: string
  episodeId: string
  episodeName: string
  episodeIndex: number
  storyboardNo: number
  title: string
  description: string
  prompt: string
  cameraAngle: string
  cameraMovement: string
  durationSeconds: number
  status: StoryboardStatus
  assetCount: number
  imageCount: number
  versionCount: number
  creatorName?: string
  projectName: string
  scriptTitle: string
}

/** 分镜表单 Model */
export interface StoryboardFormModel {
  title?: string
  description?: string
  prompt?: string
  cameraAngle?: string
  cameraMovement?: string
  durationSeconds?: number
  scriptText?: string
  soundEffect?: string
  backgroundMusic?: string
  storyboardNo?: number
  name?: string
  sceneId?: string
  thumbnail?: string
}
