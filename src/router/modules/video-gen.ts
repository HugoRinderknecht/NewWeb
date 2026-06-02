import { AppRouteRecord } from '@/types/router'

export const videoGenRoutes: AppRouteRecord = {
  path: '/video-gen',
  name: 'VideoGen',
  component: '/index/index',
  meta: {
    title: '视频生成',
    icon: 'ri:video-ai-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'ai',
      name: 'VideoGenAi',
      component: '/video-gen/ai',
      meta: { title: 'AI视频生成', keepAlive: true }
    },
    {
      path: 'task',
      name: 'VideoGenTask',
      component: '/video-gen/task',
      meta: { title: '任务管理', keepAlive: true }
    },
    {
      path: 'preview',
      name: 'VideoGenPreview',
      component: '/video-gen/preview',
      meta: { title: '视频预览', keepAlive: true }
    },
    {
      path: 'history',
      name: 'VideoGenHistory',
      component: '/video-gen/history',
      meta: { title: '生成历史', keepAlive: true }
    }
  ]
}
