import { AppRouteRecord } from '@/types/router'

export const aiProcessRoutes: AppRouteRecord = {
  path: '/ai-process',
  name: 'AiProcess',
  component: '/index/index',
  meta: {
    title: 'AI处理记录',
    icon: 'ri:robot-2-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'history',
      name: 'AiProcessHistory',
      component: '/ai-process/history',
      meta: { title: '处理历史', keepAlive: true }
    },
    {
      path: 'status',
      name: 'AiProcessStatus',
      component: '/ai-process/status',
      meta: { title: '状态追踪', keepAlive: true }
    }
  ]
}
