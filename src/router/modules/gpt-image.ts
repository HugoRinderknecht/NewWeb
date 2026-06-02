import { AppRouteRecord } from '@/types/router'

export const gptImageRoutes: AppRouteRecord = {
  path: '/gpt-image',
  name: 'GptImage',
  component: '/index/index',
  meta: {
    title: '图片生成',
    icon: 'ri:image-ai-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'generate',
      name: 'GptImageGenerate',
      component: '/gpt-image/generate',
      meta: { title: '生成提交', keepAlive: true }
    },
    {
      path: 'tasks',
      name: 'GptImageTasks',
      component: '/gpt-image/tasks',
      meta: { title: '任务管理', keepAlive: true }
    },
    {
      path: 'models',
      name: 'GptImageModels',
      component: '/gpt-image/models',
      meta: { title: '模型配置', keepAlive: true }
    }
  ]
}
