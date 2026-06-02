import { AppRouteRecord } from '@/types/router'

export const editorRoutes: AppRouteRecord = {
  path: '/editor',
  name: 'Editor',
  component: '/index/index',
  meta: {
    title: '剪辑工作台',
    icon: 'ri:scissors-cut-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'edit-manage',
      name: 'EditorEditManage',
      component: '/editor/edit-manage',
      meta: { title: '剪辑管理', keepAlive: true }
    },
    {
      path: 'timeline',
      name: 'EditorTimeline',
      component: '/editor/timeline',
      meta: { title: '时间线编辑', keepAlive: true }
    },
    {
      path: 'export',
      name: 'EditorExport',
      component: '/editor/export',
      meta: { title: '导出管理', keepAlive: true }
    }
  ]
}
