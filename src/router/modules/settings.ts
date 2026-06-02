import { AppRouteRecord } from '@/types/router'

export const settingsRoutes: AppRouteRecord = {
  path: '/settings',
  name: 'Settings',
  component: '/index/index',
  meta: {
    title: '系统设置',
    icon: 'ri:settings-3-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'account',
      name: 'SettingsAccount',
      component: '/settings/account',
      meta: { title: '账号管理', keepAlive: true }
    },
    {
      path: 'system',
      name: 'SettingsSystem',
      component: '/settings/system',
      meta: { title: '系统参数', keepAlive: true }
    },
    {
      path: 'security',
      name: 'SettingsSecurity',
      component: '/settings/security',
      meta: { title: '账号安全', keepAlive: true }
    },
    {
      path: 'danger',
      name: 'SettingsDanger',
      component: '/settings/danger',
      meta: { title: '危险区', keepAlive: true }
    }
  ]
}
