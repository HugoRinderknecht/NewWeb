import { MockMethod } from 'vite-plugin-mock'

const mockTeams = [
  { teamId: 'team-001', teamName: '创意团队', teamAvatar: '', role: 'owner', memberCount: 5, isCurrent: true },
  { teamId: 'team-002', teamName: '古风工作室', teamAvatar: '', role: 'member', memberCount: 3, isCurrent: false }
]

export default [
  { url: '/api/teams/member/teams', method: 'get', response: () => ({ code: 200, message: 'success', data: mockTeams, timestamp: Date.now() }) },
  { url: '/api/teams/:id', method: 'get', response: () => ({ code: 200, message: 'success', data: { id: 'team-001', teamId: 'team-001', name: '创意团队', teamName: '创意团队', avatar: '', description: '专注AI短剧创作', email: 'team@example.com', website: '', region: 'CN', ownerId: 'user-001', ownerName: '导演A', memberCount: 5, projectCount: 3, createTime: '2025-01-01 00:00:00', updateTime: '2025-05-01 00:00:00' }, timestamp: Date.now() }) },
  { url: '/api/teams/:id', method: 'put', response: ({ body }: any) => ({ code: 200, message: '更新成功', data: { ...body, updateTime: new Date().toISOString() }, timestamp: Date.now() }) },
  { url: '/api/teams/member/switch', method: 'post', response: () => ({ code: 200, message: '切换成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/member/apply', method: 'post', response: () => ({ code: 200, message: '申请已提交', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/member/join-by-code', method: 'post', response: () => ({ code: 200, message: '加入成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/member/leave', method: 'post', response: () => ({ code: 200, message: '退出成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/member/applications', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/teams/member/permissions', method: 'get', response: () => ({ code: 200, message: 'success', data: ['*'], timestamp: Date.now() }) },
  { url: '/api/teams/:id/members', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [{ id: 'mem-001', userId: 'user-001', userName: '导演A', avatar: '', role: 'owner', status: 'active', joinTime: '2025-01-01 00:00:00' }], total: 1, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/members/import', method: 'post', response: () => ({ code: 200, message: '导入成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/members/role', method: 'put', response: () => ({ code: 200, message: '角色更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/members/status', method: 'put', response: () => ({ code: 200, message: '状态更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/members/:memberId', method: 'delete', response: () => ({ code: 200, message: '成员移除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/members/:memberId/permissions', method: 'get', response: () => ({ code: 200, message: 'success', data: { memberId: 'mem-001', permissionCodes: ['*'] }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/members/:memberId/permissions', method: 'put', response: () => ({ code: 200, message: '权限更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/owner', method: 'put', response: () => ({ code: 200, message: '所有权转移成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/roles', method: 'get', response: () => ({ code: 200, message: 'success', data: [{ id: 'role-001', name: '管理员', code: 'ADMIN', description: '团队管理员', memberCount: 2, createTime: '2025-01-01 00:00:00' }], timestamp: Date.now() }) },
  { url: '/api/teams/:id/roles', method: 'post', response: ({ body }: any) => ({ code: 200, message: '角色创建成功', data: { id: 'role-new-' + Date.now(), ...body, memberCount: 0, createTime: new Date().toISOString() }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/roles/:roleId', method: 'put', response: () => ({ code: 200, message: '角色更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/roles/:roleId', method: 'delete', response: () => ({ code: 200, message: '角色删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/roles/:roleId/permissions', method: 'get', response: () => ({ code: 200, message: 'success', data: { id: 'role-001', name: '管理员', code: 'ADMIN', description: '团队管理员', memberCount: 2, permissionCodes: ['*'], createTime: '2025-01-01 00:00:00' }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/roles/:roleId/permissions', method: 'put', response: () => ({ code: 200, message: '权限更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/available-permissions', method: 'get', response: () => ({ code: 200, message: 'success', data: [{ code: 'project:create', name: '创建项目', category: '项目管理', description: '允许创建新项目' }], timestamp: Date.now() }) },
  { url: '/api/teams/:id/invite-codes', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/invite-codes', method: 'post', response: () => ({ code: 200, message: '邀请码创建成功', data: { id: 'ic-' + Date.now(), code: 'MOCK' + Math.random().toString(36).slice(2, 8).toUpperCase(), createdBy: 'user-001', usedCount: 0, maxUses: 10, expiresAt: '2026-01-01 00:00:00', createTime: new Date().toISOString() }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/invite-codes/:icId', method: 'delete', response: () => ({ code: 200, message: '邀请码撤销成功', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/applications', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [], total: 0, current: 1, size: 20 }, timestamp: Date.now() }) },
  { url: '/api/teams/:id/applications/:appId/approve', method: 'put', response: () => ({ code: 200, message: '审批通过', data: null, timestamp: Date.now() }) },
  { url: '/api/teams/:id/applications/:appId/reject', method: 'put', response: () => ({ code: 200, message: '审批拒绝', data: null, timestamp: Date.now() }) }
] as MockMethod[]
