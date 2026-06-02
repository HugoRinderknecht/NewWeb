import { AppRouteRecord } from '@/types/router'

export const workflowRoutes: AppRouteRecord = {
  path: '/workflow',
  name: 'Workflow',
  component: '/index/index',
  meta: {
    title: '工作流管理',
    icon: 'ri:flow-chart-line',
    roles: ['platform_admin', 'team_admin', 'member']
  },
  children: [
    {
      path: 'list',
      name: 'WorkflowList',
      component: '/workflow/list',
      meta: { title: '工作流列表', keepAlive: true }
    },
    {
      path: 'execute',
      name: 'WorkflowExecute',
      component: '/workflow/execute',
      meta: { title: '执行工作流', keepAlive: true }
    },
    {
      path: 'catalog',
      name: 'WorkflowCatalog',
      component: '/workflow/catalog',
      meta: { title: '工作流目录', keepAlive: true }
    }
  ]
}
