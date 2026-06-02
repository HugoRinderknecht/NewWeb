import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: '系统管理',
    icon: 'ri:settings-3-line',
    roles: ['platform_admin', 'team_admin']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: '用户管理',
        keepAlive: true,
        roles: ['platform_admin', 'team_admin']
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: '角色管理',
        keepAlive: true,
        roles: ['platform_admin']
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: '个人中心',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
    {
      path: 'menu',
      name: 'Menus',
      component: '/system/menu',
      meta: {
        title: '菜单管理',
        keepAlive: true,
        roles: ['platform_admin'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'admin-dashboard',
      name: 'AdminDashboard',
      component: '/system/admin-dashboard',
      meta: { title: '管理仪表盘', keepAlive: true, roles: ['platform_admin'] }
    },
    {
      path: 'audit-logs',
      name: 'AuditLogs',
      component: '/system/audit-logs',
      meta: { title: '审计日志', keepAlive: true, roles: ['platform_admin'] }
    },
    {
      path: 'billing-config',
      name: 'BillingConfig',
      component: '/system/billing-config',
      meta: { title: '计费配置', keepAlive: true, roles: ['platform_admin'] }
    },
    {
      path: 'platform-teams',
      name: 'PlatformTeams',
      component: '/system/platform-teams',
      meta: { title: '平台团队管理', keepAlive: true, roles: ['platform_admin'] }
    },
    {
      path: 'video-models',
      name: 'VideoModels',
      component: '/system/video-models',
      meta: { title: '视频模型配置', keepAlive: true, roles: ['platform_admin'] }
    },
    {
      path: 'dify-workflows',
      name: 'DifyWorkflows',
      component: '/system/dify-workflows',
      meta: { title: 'Dify工作流配置', keepAlive: true, roles: ['platform_admin'] }
    },
    {
      path: 'runtime-config',
      name: 'RuntimeConfig',
      component: '/system/runtime-config',
      meta: { title: '运行时配置', keepAlive: true, roles: ['platform_admin'] }
    }
  ]
}
