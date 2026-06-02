import { AppRouteRecord } from '@/types/router'

export const assetRoutes: AppRouteRecord = {
  path: '/asset',
  name: 'Asset',
  component: '/index/index',
  meta: {
    title: '资产管理',
    icon: 'ri:folder-5-line',
    roles: ['platform_admin', 'team_admin', 'team_member', 'member']
  },
  children: [
    {
      path: 'upload',
      name: 'AssetUpload',
      component: '/asset/upload',
      meta: { title: '素材上传', keepAlive: true }
    },
    {
      path: 'category',
      name: 'AssetCategory',
      component: '/asset/category',
      meta: { title: '分类管理', keepAlive: true }
    },
    {
      path: 'library',
      name: 'AssetLibrary',
      component: '/asset/library',
      meta: { title: '资源库', keepAlive: true }
    },
    {
      path: 'reuse',
      name: 'AssetReuse',
      component: '/asset/reuse',
      meta: { title: '素材复用', keepAlive: true }
    },
    {
      path: 'tags',
      name: 'AssetTags',
      component: '/asset/tags',
      meta: { title: '标签管理', keepAlive: true }
    },
    {
      path: 'import',
      name: 'AssetImport',
      component: '/asset/import',
      meta: { title: '资产导入', keepAlive: true }
    },
    {
      path: 'ai-generate',
      name: 'AssetAiGenerate',
      component: '/asset/ai-generate',
      meta: { title: 'AI资产生成', keepAlive: true }
    },
    {
      path: 'preview',
      name: 'AssetPreview',
      component: '/asset/preview',
      meta: { title: '资产库预览', keepAlive: true }
    },
    {
      path: 'image-generate',
      name: 'AssetImageGenerate',
      component: '/gpt-image/generate',
      meta: { title: '图片生成', keepAlive: true }
    },
    {
      path: 'image-tasks',
      name: 'AssetImageTasks',
      component: '/gpt-image/tasks',
      meta: { title: '生成任务', keepAlive: true }
    },
    {
      path: 'image-models',
      name: 'AssetImageModels',
      component: '/gpt-image/models',
      meta: { title: '模型配置', keepAlive: true }
    }
  ]
}
