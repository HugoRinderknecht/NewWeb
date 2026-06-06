import { AppRouteRecord } from '@/types/router'

export const storyboardRoutes: AppRouteRecord = {
  path: '/storyboard',
  name: 'Storyboard',
  component: '/index/index',
  meta: {
    title: '分镜管理',
    icon: 'ri:layout-masonry-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'design/:projectId?',
      name: 'StoryboardDesign',
      component: '/storyboard/design',
      meta: { title: '分镜设计', keepAlive: true }
    },
    {
      path: 'ai',
      name: 'StoryboardAi',
      component: '/storyboard/ai',
      meta: { title: 'AI 工作台', keepAlive: true }
    },
    {
      path: 'scene',
      name: 'StoryboardScene',
      component: '/storyboard/scene',
      meta: { title: '场景编排', keepAlive: true }
    },
    {
      path: 'preview',
      name: 'StoryboardPreview',
      component: '/storyboard/preview',
      meta: { title: '分镜预览', keepAlive: true }
    },
    {
      path: 'batch-edit',
      name: 'StoryboardBatchEdit',
      component: '/storyboard/batch-edit',
      meta: { title: '批量编辑', keepAlive: true }
    }
  ]
}
