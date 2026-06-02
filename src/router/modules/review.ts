import { AppRouteRecord } from '@/types/router'

export const reviewRoutes: AppRouteRecord = {
  path: '/review',
  name: 'Review',
  component: '/index/index',
  meta: {
    title: '审核中心',
    icon: 'ri:shield-check-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'content',
      name: 'ReviewContent',
      component: '/review/content',
      meta: { title: '内容审核', keepAlive: true }
    },
    {
      path: 'flow',
      name: 'ReviewFlow',
      component: '/review/flow',
      meta: { title: '审批流程', keepAlive: true }
    },
    {
      path: 'pending',
      name: 'ReviewPending',
      component: '/review/pending',
      meta: { title: '待审列表', keepAlive: true }
    },
    {
      path: 'detail',
      name: 'ReviewDetail',
      component: '/review/detail',
      meta: { title: '审核详情', keepAlive: true }
    },
    {
      path: 'reject-reasons',
      name: 'ReviewRejectReasons',
      component: '/review/reject-reasons',
      meta: { title: '驳回原因配置', keepAlive: true }
    },
    {
      path: 'statistics',
      name: 'ReviewStatistics',
      component: '/review/statistics',
      meta: { title: '审核统计', keepAlive: true }
    }
  ]
}
