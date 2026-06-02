import { AppRouteRecord } from '@/types/router'

export const teamRoutes: AppRouteRecord = {
  path: '/team',
  name: 'Team',
  component: '/index/index',
  meta: {
    title: '团队管理',
    icon: 'ri:team-line',
    roles: ['platform_admin', 'team_admin', 'member']
  },
  children: [
    {
      path: 'list',
      name: 'TeamList',
      component: '/team/list',
      meta: { title: '团队列表', keepAlive: true }
    },
    {
      path: 'members',
      name: 'TeamMembers',
      component: '/team/members',
      meta: { title: '成员管理', keepAlive: true }
    },
    {
      path: 'roles',
      name: 'TeamRoles',
      component: '/team/roles',
      meta: { title: '角色管理', keepAlive: true }
    },
    {
      path: 'invite-codes',
      name: 'TeamInviteCodes',
      component: '/team/invite-codes',
      meta: { title: '邀请码管理', keepAlive: true }
    },
    {
      path: 'applications',
      name: 'TeamApplications',
      component: '/team/applications',
      meta: { title: '申请审批', keepAlive: true }
    },
    {
      path: 'quota',
      name: 'TeamQuota',
      component: '/team/quota',
      meta: { title: '资源配额', keepAlive: true }
    },
    {
      path: 'settings',
      name: 'TeamSettings',
      component: '/team/settings',
      meta: { title: '团队设置', keepAlive: true }
    }
  ]
}
