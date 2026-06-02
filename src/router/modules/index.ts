import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { exceptionRoutes } from './exception'
import { projectRoutes } from './project'
import { scriptRoutes } from './script'
import { storyboardRoutes } from './storyboard'
import { videoGenRoutes } from './video-gen'
import { editorRoutes } from './editor'
import { reviewRoutes } from './review'
import { assetRoutes } from './asset'
import { aiProcessRoutes } from './ai-process'
import { dataHistoryRoutes } from './data-history'
import { workflowRoutes } from './workflow'
import { teamRoutes } from './team'
import { pointsRoutes } from './points'
import { noticeRoutes } from './notice'
import { settingsRoutes } from './settings'

/**
 * 导出所有模块化路由
 * 按AI短剧制作流程顺序排列：
 * 仪表盘 -> 项目管理 -> 剧本管理 -> 分镜管理 -> 视频生成 -> 剪辑 -> 审核 -> 资产 -> AI处理 -> 数据历史 -> 工作流 -> 团队 -> 积分 -> 通知 -> 设置 -> 系统
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  projectRoutes,
  scriptRoutes,
  storyboardRoutes,
  videoGenRoutes,
  editorRoutes,
  reviewRoutes,
  assetRoutes,
  aiProcessRoutes,
  dataHistoryRoutes,
  workflowRoutes,
  teamRoutes,
  pointsRoutes,
  noticeRoutes,
  settingsRoutes,
  systemRoutes,
  exceptionRoutes
]
