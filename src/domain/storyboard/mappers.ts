/**
 * 分镜领域 DTO → ViewModel 映射函数
 *
 * 纯函数，不依赖 Vue 响应式。
 * 将后端 DTO 转换为面向 UI 展示的 ViewModel。
 *
 * @module domain/storyboard/mappers
 */

import type {
  StoryboardListItemViewModel,
  StoryboardDetailViewModel,
  StoryboardFormModel,
  StoryboardStatus
} from './types'

/** 后端状态码 → 前端语义状态 */
function normalizeStoryboardStatus(status: number | undefined): StoryboardStatus {
  if (status === 0) return 'draft'
  if (status === 1) return 'pending_review'
  if (status === 2) return 'approved'
  if (status === 3) return 'rejected'
  if (status === 4) return 'generating'
  return 'draft'
}

/**
 * 将分镜 DTO 映射为列表项 ViewModel
 */
export function mapStoryboardListItem(
  dto: Api.Storyboard.StoryboardListItem
): StoryboardListItemViewModel {
  return {
    id: dto.id,
    sceneId: dto.sceneId || '',
    projectId: dto.projectId || '',
    scriptId: dto.scriptId || '',
    episodeId: dto.episodeId || '',
    episodeName: dto.episodeName || '',
    episodeIndex: dto.episodeIndex ?? 0,
    storyboardNo: dto.storyboardNo ?? 0,
    title: dto.title || '',
    description: dto.description || '',
    prompt: dto.prompt || '',
    cameraAngle: dto.cameraAngle || '',
    cameraMovement: dto.cameraMovement || '',
    durationSeconds: dto.durationSeconds ?? 0,
    status: normalizeStoryboardStatus(dto.status),
    assetCount: dto.assetCount ?? 0,
    imageCount: dto.imageCount ?? 0,
    versionCount: dto.versionCount ?? 0,
    creatorName: dto.creatorName,
    createTime: dto.createTime || ''
  }
}

/**
 * 将分镜 DTO 映射为详情 ViewModel
 */
export function mapStoryboardDetail(
  dto: Api.Storyboard.StoryboardDetail
): StoryboardDetailViewModel {
  return {
    id: dto.id,
    sceneId: dto.sceneId || '',
    projectId: dto.projectId || '',
    scriptId: dto.scriptId || '',
    episodeId: dto.episodeId || '',
    episodeName: dto.episodeName || '',
    episodeIndex: dto.episodeIndex ?? 0,
    storyboardNo: dto.storyboardNo ?? 0,
    title: dto.title || '',
    description: dto.description || '',
    prompt: dto.prompt || '',
    cameraAngle: dto.cameraAngle || '',
    cameraMovement: dto.cameraMovement || '',
    durationSeconds: dto.durationSeconds ?? 0,
    status: normalizeStoryboardStatus(dto.status),
    assetCount: dto.assetCount ?? 0,
    imageCount: dto.imageCount ?? 0,
    versionCount: dto.versionCount ?? 0,
    creatorName: dto.creatorName,
    projectName: dto.projectName || '',
    scriptTitle: dto.scriptTitle || '',
    createTime: dto.createTime || '',
    updateTime: dto.updateTime || ''
  }
}

/**
 * 将表单 Model 映射为创建分镜参数
 */
export function mapFormToCreateParams(
  form: StoryboardFormModel
): Api.Storyboard.CreateStoryboardParams {
  return {
    title: form.title,
    description: form.description,
    prompt: form.prompt,
    cameraAngle: form.cameraAngle,
    cameraMovement: form.cameraMovement,
    durationSeconds: form.durationSeconds,
    scriptText: form.scriptText,
    soundEffect: form.soundEffect,
    backgroundMusic: form.backgroundMusic,
    name: form.name,
    storyboardNo: form.storyboardNo,
    sceneId: form.sceneId,
    thumbnail: form.thumbnail
  }
}

/**
 * 将表单 Model 映射为更新分镜参数
 */
export function mapFormToUpdateParams(
  form: Partial<StoryboardFormModel>
): Api.Storyboard.UpdateStoryboardParams {
  return {
    title: form.title,
    description: form.description,
    prompt: form.prompt,
    cameraAngle: form.cameraAngle,
    cameraMovement: form.cameraMovement,
    durationSeconds: form.durationSeconds,
    scriptText: form.scriptText,
    soundEffect: form.soundEffect,
    backgroundMusic: form.backgroundMusic,
    storyboardNo: form.storyboardNo,
    name: form.name,
    sceneId: form.sceneId,
    thumbnail: form.thumbnail
  }
}
