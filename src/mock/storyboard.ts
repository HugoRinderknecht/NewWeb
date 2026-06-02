import { MockMethod } from 'vite-plugin-mock'

export default [
  { url: '/api/projects/:projectId/storyboards', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id', method: 'get', response: () => ({ code: 200, message: 'success', data: { id: 'sb-001', name: '场景1-镜头1', type: 'close-up', description: '', duration: 3, focalLength: 50, status: 'draft', createTime: '2025-01-15 10:00:00', updateTime: '2025-05-20 14:30:00' }, timestamp: Date.now() }) },
  { url: '/api/projects/:projectId/storyboards', method: 'post', response: ({ body }: any) => ({ code: 200, message: '创建成功', data: { id: 'sb-new-' + Date.now(), ...body, status: 'draft', createTime: new Date().toISOString(), updateTime: new Date().toISOString() }, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id', method: 'put', response: ({ body }: any) => ({ code: 200, message: '更新成功', data: { ...body, updateTime: new Date().toISOString() }, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id', method: 'delete', response: () => ({ code: 200, message: '删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/batch-delete', method: 'delete', response: () => ({ code: 200, message: '批量删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/submit-review', method: 'post', response: () => ({ code: 200, message: '提交审核成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/batch-submit-review', method: 'post', response: () => ({ code: 200, message: '批量提交审核成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/withdraw-review', method: 'post', response: () => ({ code: 200, message: '撤回审核成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/review-status', method: 'get', response: () => ({ code: 200, message: 'success', data: { reviewType: 'storyboard', targetId: 'sb-001', status: 'pending', currentStep: '1', reviewer: '' }, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/versions', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/versions/:versionId/rollback', method: 'post', response: () => ({ code: 200, message: '回滚成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/images', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/images', method: 'post', response: () => ({ code: 200, message: '配图添加成功', data: { id: 'img-new-' + Date.now() }, timestamp: Date.now() }) },
  { url: '/api/storyboards/images/:imageId', method: 'delete', response: () => ({ code: 200, message: '配图删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/assets', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/assets', method: 'post', response: () => ({ code: 200, message: '资产关联成功', data: null, timestamp: Date.now() }) },
  { url: '/api/storyboards/:id/assets/:assetId', method: 'delete', response: () => ({ code: 200, message: '资产解除关联成功', data: null, timestamp: Date.now() }) },
  { url: '/api/scenes/:sceneId/storyboards/reorder', method: 'put', response: () => ({ code: 200, message: '排序更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/episodes/:episodeId/scenes', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/scenes', method: 'post', response: ({ body }: any) => ({ code: 200, message: '镜头创建成功', data: { id: 'scene-new-' + Date.now(), ...body }, timestamp: Date.now() }) },
  { url: '/api/projects/:projectId/scripts/:scriptId/episodes/:episodeId/storyboard/decompose', method: 'post', response: () => ({ code: 200, message: '分镜拆解已提交', data: null, timestamp: Date.now() }) },
  { url: '/api/projects/:projectId/scripts/:scriptId/episodes/:episodeId/storyboard/rebuild', method: 'post', response: () => ({ code: 200, message: '分镜重建已提交', data: null, timestamp: Date.now() }) },
  { url: '/api/projects/:projectId/scripts/:scriptId/storyboards', method: 'get', response: () => ({ code: 200, message: 'success', data: { scriptId: 'script-001', scriptName: '剧本1', storyboards: [] }, timestamp: Date.now() }) }
] as MockMethod[]
