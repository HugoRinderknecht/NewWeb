import { AppRouteRecord } from '@/types/router'

export const scriptRoutes: AppRouteRecord = {
  path: '/script',
  name: 'Script',
  component: '/index/index',
  meta: {
    title: '剧本管理',
    icon: 'ri:file-list-3-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'library',
      name: 'ScriptLibrary',
      component: '/script/library',
      meta: { title: '剧本管理', keepAlive: true }
    },
    {
      path: 'write',
      name: 'ScriptWrite',
      component: '/script/write',
      meta: { title: '剧本编写', keepAlive: true }
    },
    {
      path: 'decompose',
      name: 'ScriptDecompose',
      component: '/script/decompose',
      meta: { title: '剧本拆解', keepAlive: true }
    },
    {
      path: 'profiles',
      name: 'ScriptProfiles',
      component: '/script/profiles',
      meta: { title: '人物小传', keepAlive: true }
    },
    {
      path: 'ai-review',
      name: 'ScriptAiReview',
      component: '/script/ai-review',
      meta: { title: 'AI审核结果', keepAlive: true }
    },
    {
      path: 'version',
      name: 'ScriptVersion',
      component: '/script/version',
      meta: { title: '创意资产', keepAlive: true }
    }
  ]
}
