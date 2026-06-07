/**
 * 项目领域 ViewModel 类型定义
 *
 * 面向项目列表/详情页面 UI 展示的类型，与后端 DTO 解耦。
 *
 * @module domain/project/types
 */

import type { ListItemBaseViewModel, DetailBaseViewModel } from '../types'

/** 项目状态枚举（前端语义） */
export type ProjectStatus = 'active' | 'archived' | 'deleted'

/** 项目列表项 ViewModel */
export interface ProjectListItemViewModel extends ListItemBaseViewModel {
  projectName: string
  description: string
  status: ProjectStatus
  teamId: string
  creatorName: string
  coverImage: string
  memberCount: number
  userRole?: string
}

/** 项目详情 ViewModel */
export interface ProjectDetailViewModel extends DetailBaseViewModel {
  projectName: string
  description: string
  status: ProjectStatus
  teamId: string
  creatorName: string
  coverImage: string
  memberCount: number
  userRole?: string
  adminCount: number
  storyboardCount: number
  completedStoryboardCount: number
  videoCount: number
  assetCount: number
}

/** 项目表单 Model */
export interface ProjectFormModel {
  projectName: string
  description?: string
  coverImage?: string
}
