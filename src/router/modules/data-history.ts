import { AppRouteRecord } from '@/types/router'

export const dataHistoryRoutes: AppRouteRecord = {
  path: '/data-history',
  name: 'DataHistory',
  component: '/index/index',
  meta: {
    title: '数据历史',
    icon: 'ri:history-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'records',
      name: 'DataHistoryRecords',
      component: '/data-history/records',
      meta: { title: '修改记录', keepAlive: true }
    },
    {
      path: 'rollback',
      name: 'DataHistoryRollback',
      component: '/data-history/rollback',
      meta: { title: '版本回退', keepAlive: true }
    }
  ]
}
