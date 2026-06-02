import { AppRouteRecord } from '@/types/router'

export const projectRoutes: AppRouteRecord = {
  path: '/project',
  name: 'Project',
  component: '/index/index',
  meta: {
    title: '项目管理',
    icon: 'ri:folder-3-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'list',
      name: 'ProjectList',
      component: '/project/list',
      meta: { title: '项目列表', keepAlive: true }
    },
    {
      path: 'edit',
      name: 'ProjectEdit',
      component: '/project/edit',
      meta: { title: '项目编辑', keepAlive: true }
    },
    {
      path: 'scripts',
      name: 'ProjectScripts',
      component: '/project/scripts',
      meta: { title: '剧本管理', keepAlive: true }
    },
    {
      path: 'characters',
      name: 'ProjectCharacters',
      component: '/project/characters',
      meta: { title: '角色管理', keepAlive: true }
    },
    {
      path: 'episodes',
      name: 'ProjectEpisodes',
      component: '/project/episodes',
      meta: { title: '集数管理', keepAlive: true }
    },
    {
      path: 'member',
      name: 'ProjectMember',
      component: '/project/member',
      meta: { title: '成员管理', keepAlive: true }
    },
    {
      path: 'statistics',
      name: 'ProjectStatistics',
      component: '/project/statistics',
      meta: { title: '项目统计', keepAlive: true }
    }
  ]
}
