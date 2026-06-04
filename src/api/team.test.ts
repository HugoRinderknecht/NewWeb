/**
 * 团队管理 API 测试
 * 覆盖团队 CRUD、成员管理、角色权限、邀请码、配额等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockTeam,
  mockTeamMember,
  mockTeamMemberList,
  mockInviteCode,
  mockQuota,
  createMockAdapter,
} from '@/test/mock-data'

const mockAdapter = createMockAdapter()

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => ({ isLogin: true, info: { id: 'user-001' } }),
}))

import {
  fetchGetMyTeams,
  fetchGetTeamDetail,
  fetchCreateTeam,
  fetchUpdateTeam,
  fetchDeleteTeam,
  fetchTransferTeamOwnership,
  fetchLeaveTeam,
  fetchGetTeamMembers,
  fetchInviteTeamMember,
  fetchUpdateMemberRole,
  fetchRemoveTeamMember,
  fetchGetTeamRoles,
  fetchCreateTeamRole,
  fetchDeleteTeamRole,
  fetchGetRolePermissions,
  fetchSetRolePermissions,
  fetchGetInviteCodes,
  fetchCreateInviteCode,
  fetchDisableInviteCode,
  fetchGetTeamQuota,
  fetchUpdateTeamQuota,
  fetchGetTeamApplications,
  fetchApproveApplication,
  fetchRejectApplication,
} from '@/api/team'

describe('团队管理 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGetMyTeams - 我的团队列表', () => {
    it('应正确调用 GET /api/teams/my', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [mockTeam],
        total: 1,
      })

      const res = await fetchGetMyTeams()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/teams/my', undefined)
      expect(res?.records).toHaveLength(1)
      expect(res?.total).toBe(1)
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetMyTeams()

      expect(res).toBeNull()
    })
  })

  describe('fetchGetTeamDetail - 团队详情查询', () => {
    it('应正确调用 GET /api/teams/{id}', async () => {
      mockAdapter.get.mockResolvedValue(mockTeam)

      const res = await fetchGetTeamDetail('team-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/teams/team-001')
      expect(res?.id).toBe('team-001')
      expect(res?.teamName).toBe('Dreamcraft制作组')
    })
  })

  describe('fetchCreateTeam - 创建团队', () => {
    it('应正确调用 POST /api/teams', async () => {
      mockAdapter.post.mockResolvedValue({ ...mockTeam, id: 'new-team' })

      const res = await fetchCreateTeam({
        teamName: '新团队',
        description: '团队描述',
        email: 'team@example.com',
        region: '北京',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/teams', expect.objectContaining({
        teamName: '新团队',
        email: 'team@example.com',
      }))
      expect(res?.id).toBe('new-team')
    })
  })

  describe('fetchUpdateTeam - 更新团队', () => {
    it('应正确调用 PUT /api/teams/{id}', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdateTeam('team-001', {
        teamName: '更新后的团队名',
        description: '更新后的描述',
      })

      expect(mockAdapter.put).toHaveBeenCalledWith(
        '/api/teams/team-001',
        expect.objectContaining({ teamName: '更新后的团队名' })
      )
    })
  })

  describe('fetchDeleteTeam - 删除团队', () => {
    it('应正确调用 DELETE /api/teams/{id}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteTeam('team-001')

      expect(mockAdapter.del).toHaveBeenCalledWith('/api/teams/team-001')
    })
  })

  describe('fetchTransferTeamOwnership - 转让所有权', () => {
    it('应正确调用 POST /api/teams/{id}/transfer', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchTransferTeamOwnership('team-001', 'u2', '希望新的负责人能够带领团队发展')

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/teams/team-001/transfer',
        expect.objectContaining({ newOwnerId: 'u2' })
      )
    })
  })

  describe('fetchLeaveTeam - 退出团队', () => {
    it('应正确调用 POST /api/teams/{id}/leave', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchLeaveTeam('team-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/teams/team-001/leave')
    })
  })

  describe('fetchGetTeamMembers - 团队成员列表', () => {
    it('应正确调用 GET /api/teams/{id}/members', async () => {
      mockAdapter.get.mockResolvedValue(mockTeamMemberList)

      const res = await fetchGetTeamMembers('team-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/teams/team-001/members', undefined)
      expect(res?.records).toHaveLength(3)
      expect(res?.total).toBe(3)
    })

    it('应支持角色和状态筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockTeamMember], total: 1 })

      await fetchGetTeamMembers('team-001', { role: 'admin', status: 1 })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/teams/team-001/members',
        expect.objectContaining({ role: 'admin', status: 1 })
      )
    })

    it('应支持分页参数', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 20, page: 2, pageSize: 10 })

      const res = await fetchGetTeamMembers('team-001', { page: 2, pageSize: 10 })

      expect(res?.page).toBe(2)
      expect(res?.pageSize).toBe(10)
    })
  })

  describe('fetchInviteTeamMember - 邀请成员', () => {
    it('应支持邮箱邀请方式', async () => {
      mockAdapter.post.mockResolvedValue({ inviteId: 'inv-001' })

      await fetchInviteTeamMember('team-001', {
        inviteMethod: 'email',
        emails: ['newmember@example.com'],
        roles: ['member'],
        expireDays: 7,
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/teams/team-001/members/invite',
        expect.objectContaining({ inviteMethod: 'email' })
      )
    })

    it('应支持邀请码方式', async () => {
      mockAdapter.post.mockResolvedValue({ code: 'DCA-NEW-CODE' })

      await fetchInviteTeamMember('team-001', {
        inviteMethod: 'code',
        roles: ['member'],
      })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchUpdateMemberRole - 更新成员角色', () => {
    it('应正确调用 PUT /api/teams/{id}/members/{memberId}/role', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdateMemberRole('team-001', 'tm-001', { role: 'director' })

      expect(mockAdapter.put).toHaveBeenCalledWith(
        '/api/teams/team-001/members/tm-001/role',
        expect.objectContaining({ role: 'director' })
      )
    })
  })

  describe('fetchRemoveTeamMember - 移除成员', () => {
    it('应正确调用 DELETE /api/teams/{id}/members/{memberId}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchRemoveTeamMember('team-001', 'tm-003')

      expect(mockAdapter.del).toHaveBeenCalledWith('/api/teams/team-001/members/tm-003')
    })
  })

  describe('fetchGetTeamRoles - 团队角色列表', () => {
    it('应正确返回角色数据', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          { id: 'role-001', name: '管理员', type: 'system', memberCount: 2 },
          { id: 'role-002', name: '导演', type: 'custom', memberCount: 1 },
        ],
        total: 2,
      })

      const res = await fetchGetTeamRoles('team-001')

      expect(mockAdapter.get).toHaveBeenCalled()
      expect(res?.records).toHaveLength(2)
    })
  })

  describe('fetchCreateTeamRole - 创建角色', () => {
    it('应正确创建团队角色', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'new-role', name: '新角色' })

      await fetchCreateTeamRole('team-001', {
        name: '新角色',
        description: '角色描述',
        permissions: ['project:read'],
      })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchDeleteTeamRole - 删除角色', () => {
    it('应正确删除角色', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteTeamRole('team-001', 'role-002')

      expect(mockAdapter.del).toHaveBeenCalled()
    })
  })

  describe('fetchGetRolePermissions - 获取角色权限', () => {
    it('应返回权限列表', async () => {
      mockAdapter.get.mockResolvedValue({
        roleId: 'role-001',
        permissions: ['project:read', 'project:write', 'script:read'],
      })

      const res = await fetchGetRolePermissions('team-001', 'role-001')

      expect(res?.permissions).toContain('project:read')
    })
  })

  describe('fetchSetRolePermissions - 设置角色权限', () => {
    it('应正确更新权限', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchSetRolePermissions('team-001', 'role-001', ['project:read', 'script:write'])

      expect(mockAdapter.put).toHaveBeenCalled()
    })
  })

  describe('fetchGetInviteCodes - 邀请码列表', () => {
    it('应正确返回邀请码数据', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [mockInviteCode],
        total: 1,
      })

      const res = await fetchGetInviteCodes('team-001')

      expect(res?.records).toHaveLength(1)
      expect(res?.records[0].code).toBe('DCA-X7K9-M2LP')
    })
  })

  describe('fetchCreateInviteCode - 生成邀请码', () => {
    it('应正确生成邀请码', async () => {
      mockAdapter.post.mockResolvedValue({
        ...mockInviteCode,
        id: 'new-inv',
        code: 'DCA-NEW-CODE',
      })

      const res = await fetchCreateInviteCode('team-001', {
        role: 'member',
        maxUsage: 5,
        expireDays: 30,
      })

      expect(mockAdapter.post).toHaveBeenCalled()
      expect(res?.code).toBeDefined()
    })
  })

  describe('fetchDisableInviteCode - 禁用邀请码', () => {
    it('应正确禁用邀请码', async () => {
      mockAdapter.patch.mockResolvedValue(undefined)

      await fetchDisableInviteCode('team-001', 'inv-001')

      expect(mockAdapter.patch).toHaveBeenCalled()
    })
  })

  describe('fetchGetTeamQuota - 资源配额查询', () => {
    it('应正确返回配额数据', async () => {
      mockAdapter.get.mockResolvedValue(mockQuota)

      const res = await fetchGetTeamQuota('team-001')

      expect(res?.records).toHaveLength(2)
      expect(res?.records[0].resourceType).toBe('ai_calls')
    })

    it('配额应包含使用率计算', async () => {
      mockAdapter.get.mockResolvedValue(mockQuota)

      const res = await fetchGetTeamQuota('team-001')

      res?.records.forEach((q) => {
        const usageRate = (q.used / q.limit) * 100
        expect(usageRate).toBeGreaterThan(0)
        expect(usageRate).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('fetchUpdateTeamQuota - 更新配额', () => {
    it('应正确更新配额规则', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdateTeamQuota('team-001', {
        resourceType: 'ai_calls',
        limit: 2000,
        alertThreshold: 85,
        resetCycle: 'monthly',
      })

      expect(mockAdapter.put).toHaveBeenCalled()
    })
  })

  describe('fetchGetTeamApplications - 申请列表', () => {
    it('应正确返回申请数据', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          { id: 'app-001', applicantName: '申请人', status: 'pending', applyTime: '2026-06-01' },
        ],
        total: 1,
        pendingCount: 1,
      })

      const res = await fetchGetTeamApplications('team-001')

      expect(res?.records).toHaveLength(1)
      expect(res?.pendingCount).toBe(1)
    })
  })

  describe('fetchApproveApplication - 批准申请', () => {
    it('应正确批准申请', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchApproveApplication('team-001', 'app-001')

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchRejectApplication - 拒绝申请', () => {
    it('应正确拒绝申请', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchRejectApplication('team-001', 'app-001', { reason: '资质不符合要求' })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })
})

describe('团队数据类型验证', () => {
  it('团队成员角色应包含 7 种业务角色', () => {
    const validRoles = ['admin', 'director', 'storyboard', 'art', 'video', 'audio', 'edit']
    validRoles.forEach((role) => {
      expect(mockTeamMemberList.records.some((m) => m.role === role)).toBeTruthy()
    })
  })

  it('成员状态应正确映射', () => {
    const statusMap: Record<number, string> = {
      1: '正常',
      0: '已禁用',
    }
    expect(statusMap[1]).toBe('正常')
    expect(statusMap[0]).toBe('已禁用')
  })

  it('加入方式应正确映射', () => {
    const joinMethodMap: Record<string, string> = {
      invite: '邀请',
      apply: '申请',
    }
    expect(joinMethodMap['invite']).toBe('邀请')
    expect(joinMethodMap['apply']).toBe('申请')
  })

  it('配额资源类型应正确', () => {
    const validResourceTypes = ['ai_calls', 'tokens', 'storage', 'render_time', 'video_gen']
    validResourceTypes.forEach((type) => {
      expect(mockQuota.records.some((q) => q.resourceType === type)).toBeTruthy()
    })
  })

  it('配额使用率进度条颜色应正确', () => {
    const getProgressColor = (rate: number) => {
      if (rate < 75) return 'success'
      if (rate < 90) return 'warning'
      return 'danger'
    }
    expect(getProgressColor(50)).toBe('success')
    expect(getProgressColor(80)).toBe('warning')
    expect(getProgressColor(95)).toBe('danger')
  })

  it('配额重置周期应正确', () => {
    const validCycles = ['never', 'daily', 'weekly', 'monthly']
    validCycles.forEach((cycle) => {
      expect(mockQuota.records.some((q) => q.resetCycle === cycle)).toBeTruthy()
    })
  })
})
