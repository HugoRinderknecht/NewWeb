import { MockMethod } from 'vite-plugin-mock'

export default [
  { url: '/api/notifications', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/notifications/:id', method: 'get', response: () => ({ code: 200, message: 'success', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/unread-count', method: 'get', response: () => ({ code: 200, message: 'success', data: 0, timestamp: Date.now() }) },
  { url: '/api/notifications/:id/read', method: 'post', response: () => ({ code: 200, message: '标记已读成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/:id/unread', method: 'post', response: () => ({ code: 200, message: '标记未读成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/read-all', method: 'post', response: () => ({ code: 200, message: '全部已读成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/batch-read', method: 'post', response: () => ({ code: 200, message: '批量已读成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/:id', method: 'delete', response: () => ({ code: 200, message: '删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/batch-delete', method: 'delete', response: () => ({ code: 200, message: '批量删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/clear-read', method: 'post', response: () => ({ code: 200, message: '清空成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/:id/star', method: 'post', response: () => ({ code: 200, message: '收藏成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/starred', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/notifications/search', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/notifications/export', method: 'get', response: () => ({ code: 200, message: 'success', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/preference', method: 'get', response: () => ({ code: 200, message: 'success', data: { emailEnabled: true, browserEnabled: true, types: [] }, timestamp: Date.now() }) },
  { url: '/api/notifications/preference', method: 'put', response: () => ({ code: 200, message: '更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/dnd', method: 'get', response: () => ({ code: 200, message: 'success', data: { enabled: false, startTime: '22:00', endTime: '08:00', timezone: 'Asia/Shanghai' }, timestamp: Date.now() }) },
  { url: '/api/notifications/dnd', method: 'put', response: () => ({ code: 200, message: '更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/subscribe', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/notifications/subscribe', method: 'post', response: () => ({ code: 200, message: '订阅成功', data: { id: 'sub-' + Date.now() }, timestamp: Date.now() }) },
  { url: '/api/notifications/subscribe/:id', method: 'delete', response: () => ({ code: 200, message: '取消订阅成功', data: null, timestamp: Date.now() }) },
  { url: '/api/notifications/ws-token', method: 'post', response: () => ({ code: 200, message: 'success', data: 'mock-ws-token-' + Date.now(), timestamp: Date.now() }) }
] as MockMethod[]
