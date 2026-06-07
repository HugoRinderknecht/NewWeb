/**
 * 分镜领域统一导出
 *
 * @module domain/storyboard
 */

export type {
  StoryboardStatus,
  StoryboardListItemViewModel,
  StoryboardDetailViewModel,
  StoryboardFormModel
} from './types'

export {
  mapStoryboardListItem,
  mapStoryboardDetail,
  mapFormToCreateParams,
  mapFormToUpdateParams
} from './mappers'

export { useStoryboardBatchActions } from './actions'
export type { BatchApplyParams } from './actions'
