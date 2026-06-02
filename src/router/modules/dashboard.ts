import { AppRouteRecord } from '@/types/router'

export const dashboardRoutes: AppRouteRecord = {
  name: 'Dashboard',
  path: '/dashboard',
  component: '/index/index',
  meta: {
    title: '仪表盘',
    icon: 'ri:pie-chart-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'console',
      name: 'Console',
      component: '/dashboard/console',
      meta: {
        title: '工作台',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'usage',
      name: 'StatsUsage',
      component: '/stats/usage',
      meta: { title: '使用统计', keepAlive: true }
    },
    {
      path: 'analysis',
      name: 'StatsAnalysis',
      component: '/stats/analysis',
      meta: { title: '数据分析', keepAlive: true }
    },
    {
      path: 'report',
      name: 'StatsReport',
      component: '/stats/report',
      meta: { title: '报表生成', keepAlive: true }
    },
    {
      path: 'data-dashboard',
      name: 'StatsDashboard',
      component: '/stats/dashboard',
      meta: { title: '数据看板', keepAlive: true }
    },
    {
      path: 'ai-usage',
      name: 'StatsAiUsage',
      component: '/stats/ai-usage',
      meta: { title: 'AI用量统计', keepAlive: true }
    },
    {
      path: 'cost',
      name: 'StatsCost',
      component: '/stats/cost',
      meta: { title: '成本分析', keepAlive: true }
    }
  ]
}
