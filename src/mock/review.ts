import { MockMethod } from 'vite-plugin-mock'

export default [
  { url: '/api/review/list', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/review/items', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/review/detail/:id', method: 'get', response: () => ({ code: 200, message: 'success', data: null, timestamp: Date.now() }) },
  { url: '/api/review/create', method: 'post', response: () => ({ code: 200, message: '创建成功', data: { id: 'review-' + Date.now() }, timestamp: Date.now() }) },
  { url: '/api/review/:id/claim', method: 'post', response: () => ({ code: 200, message: '认领成功', data: null, timestamp: Date.now() }) },
  { url: '/api/review/decision', method: 'post', response: () => ({ code: 200, message: '审核决定已提交', data: null, timestamp: Date.now() }) },
  { url: '/api/review/batch-decision', method: 'post', response: () => ({ code: 200, message: '批量审核完成', data: { successCount: 0, failCount: 0, failures: [] }, timestamp: Date.now() }) },
  { url: '/api/review/:id/withdraw', method: 'post', response: () => ({ code: 200, message: '撤回成功', data: null, timestamp: Date.now() }) },
  { url: '/api/review/:id/archive', method: 'post', response: () => ({ code: 200, message: '归档成功', data: null, timestamp: Date.now() }) },
  { url: '/api/review/:id/dispatch', method: 'post', response: () => ({ code: 200, message: '下发成功', data: null, timestamp: Date.now() }) },
  { url: '/api/review/status/:reviewType/:targetId', method: 'get', response: () => ({ code: 200, message: 'success', data: { reviewType: '', targetId: '', status: 'none', currentStep: '', reviewer: '' }, timestamp: Date.now() }) },
  { url: '/api/review/pending-count', method: 'get', response: () => ({ code: 200, message: 'success', data: 0, timestamp: Date.now() }) },
  { url: '/api/review/my-submissions', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/statistics', method: 'get', response: () => ({ code: 200, message: 'success', data: { total: 0, pending: 0, approved: 0, rejected: 0 }, timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/export', method: 'post', response: () => ({ code: 200, message: '导出成功', data: null, timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/reject-reasons', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/reject-reasons', method: 'post', response: () => ({ code: 200, message: '添加成功', data: { id: 'reason-' + Date.now() }, timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/reject-reasons/:reasonId', method: 'delete', response: () => ({ code: 200, message: '删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/route-config', method: 'get', response: () => ({ code: 200, message: 'success', data: { flows: [] }, timestamp: Date.now() }) },
  { url: '/api/review/projects/:projectId/route-config', method: 'put', response: () => ({ code: 200, message: '更新成功', data: null, timestamp: Date.now() }) }
] as MockMethod[]
