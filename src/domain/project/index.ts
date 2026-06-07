/**
 * 项目领域统一导出
 *
 * @module domain/project
 */

export type {
  ProjectStatus,
  ProjectListItemViewModel,
  ProjectDetailViewModel,
  ProjectFormModel
} from './types'

export {
  mapProjectListItem,
  mapProjectDetail,
  mapFormToCreateParams,
  mapFormToUpdateParams
} from './mappers'

export { useProjectBatchActions } from './actions'
