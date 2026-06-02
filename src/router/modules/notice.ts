import { AppRouteRecord } from '@/types/router'

export const noticeRoutes: AppRouteRecord = {
  path: '/notice',
  name: 'Notice',
  component: '/index/index',
  meta: {
    title: '通知中心',
    icon: 'ri:notification-3-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'site',
      name: 'NoticeSite',
      component: '/notice/site',
      meta: { title: '站内通知', keepAlive: true }
    },
    {
      path: 'remind',
      name: 'NoticeRemind',
      component: '/notice/remind',
      meta: { title: '提醒设置', keepAlive: true }
    }
  ]
}
