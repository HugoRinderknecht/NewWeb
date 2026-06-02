import { AppRouteRecord } from '@/types/router'

export const pointsRoutes: AppRouteRecord = {
  path: '/points',
  name: 'Points',
  component: '/index/index',
  meta: {
    title: '积分管理',
    icon: 'ri:coin-line',
    roles: ['platform_admin', 'team_admin', 'member']
  },
  children: [
    {
      path: 'billing',
      name: 'PointsBilling',
      component: '/points/billing',
      meta: { title: '用量计费', keepAlive: true }
    },
    {
      path: 'record',
      name: 'PointsRecord',
      component: '/points/record',
      meta: { title: '消费记录', keepAlive: true }
    },
    {
      path: 'transactions',
      name: 'PointsTransactions',
      component: '/points/transactions',
      meta: { title: '交易记录', keepAlive: true }
    },
    {
      path: 'token-usage',
      name: 'PointsTokenUsage',
      component: '/points/token-usage',
      meta: { title: 'Token用量', keepAlive: true }
    },
    {
      path: 'pricing',
      name: 'PointsPricing',
      component: '/points/pricing',
      meta: { title: '模型定价', keepAlive: true }
    }
  ]
}
