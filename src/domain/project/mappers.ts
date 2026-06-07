/**
 * 项目领域 DTO → ViewModel 映射函数
 *
 * 纯函数，不依赖 Vue 响应式。
 * 将后端 DTO 转换为面向 UI 展示的 ViewModel。
 *
 * @module domain/project/mappers
 */

import type {
  ProjectListItemViewModel,
  ProjectDetailViewModel,
  ProjectFormModel,
  ProjectStatus
} from './types'

/** 后端状态码 → 前端语义状态 */
function normalizeProjectStatus(status: number | undefined): ProjectStatus {
  if (status === 0 || status === 1) return 'active'
  if (status === 2) return 'archived'
  if (status === -1) return 'deleted'
  return 'active'
}

/**
 * 将项目 DTO 映射为列表项 ViewModel
 */
export function mapProjectListItem(dto: Api.Project.ProjectListItem): ProjectListItemViewModel {
  return {
    id: dto.id,
    projectName: dto.projectName || '',
    description: dto.description || '',
    status: normalizeProjectStatus(dto.status),
    teamId: dto.teamId || '',
    creatorName: dto.creatorName || '',
    coverImage: dto.coverImage || '',
    memberCount: dto.memberCount ?? 0,
    userRole: dto.userRole,
    createTime: dto.createTime || ''
  }
}

/**
 * 将项目 DTO 映射为详情 ViewModel
 */
export function mapProjectDetail(dto: Api.Project.ProjectDetail): ProjectDetailViewModel {
  return {
    id: dto.id,
    projectName: dto.projectName || '',
    description: dto.description || '',
    status: normalizeProjectStatus(dto.status),
    teamId: dto.teamId || '',
    creatorName: dto.creatorName || '',
    coverImage: dto.coverImage || '',
    memberCount: dto.memberCount ?? 0,
    userRole: dto.userRole,
    adminCount: dto.adminCount ?? 0,
    storyboardCount: dto.storyboardCount ?? 0,
    completedStoryboardCount: dto.completedStoryboardCount ?? 0,
    videoCount: dto.videoCount ?? 0,
    assetCount: dto.assetCount ?? 0,
    createTime: dto.createTime || '',
    updateTime: dto.updateTime || ''
  }
}

/**
 * 将表单 Model 映射为创建项目参数
 */
export function mapFormToCreateParams(form: ProjectFormModel): Api.Project.CreateProjectParams {
  return {
    projectName: form.projectName,
    description: form.description,
    coverImage: form.coverImage
  }
}

/**
 * 将表单 Model 映射为更新项目参数
 */
export function mapFormToUpdateParams(form: Partial<ProjectFormModel>): Api.Project.UpdateProjectParams {
  return {
    projectName: form.projectName,
    description: form.description,
    coverImage: form.coverImage
  }
}
