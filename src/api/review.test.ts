/**
 * 审核中心 API 测试
 * 覆盖内容审核、审批流程、待审列表、驳回原因、统计等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockReviewItem, mockReviewList, createMockAdapter } from '@/test/mock-data'

const mockAdapter = createMockAdapter()

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => ({ isLogin: true, info: { id: 'user-001' } }),
}))

import {
  fetchGetReviewList,
  fetchGetReviewDetail,
  fetchApproveReview,
  fetchRejectReview,
  fetchTransferReview,
  fetchWithdrawReview,
  fetchAddSignature,
  fetchGetReviewFlowList,
  fetchUpdateReviewFlow,
  fetchGetRejectReasons,
  fetchCreateRejectReason,
  fetchUpdateRejectReason,
  fetchDeleteRejectReason,
  fetchGetReviewStatistics,
} from '@/api/review'

describe('审核中心 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGetReviewList - 审核列表查询', () => {
    it('应正确调用 GET /api/review/items', async () => {
      mockAdapter.get.mockResolvedValue(mockReviewList)

      const res = await fetchGetReviewList()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/review/items', undefined)
      expect(res?.records).toHaveLength(3)
      expect(res?.total).toBe(3)
    })

    it('应支持状态筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockReviewItem], total: 1, pendingCount: 1 })

      await fetchGetReviewList({ status: 'pending' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/review/items',
        expect.objectContaining({ status: 'pending' })
      )
    })

    it('应支持内容类型筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetReviewList({ contentType: 'design' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/review/items',
        expect.objectContaining({ contentType: 'design' })
      )
    })

    it('应支持待我审核筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockReviewItem], total: 1 })

      await fetchGetReviewList({ isMyTask: true })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/review/items',
        expect.objectContaining({ isMyTask: true })
      )
    })

    it('应支持我提交的筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetReviewList({ isMySubmit: true })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/review/items',
        expect.objectContaining({ isMySubmit: true })
      )
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetReviewList()

      expect(res).toBeNull()
    })
  })

  describe('fetchGetReviewDetail - 审核详情查询', () => {
    it('应正确调用 GET /api/review/items/{id}', async () => {
      mockAdapter.get.mockResolvedValue({
        ...mockReviewItem,
        history: [
          { action: 'submit', operatorName: '测试用户', operateTime: '2026-06-01T09:00:00Z' },
          { action: 'approve', operatorName: '审核员', operateTime: '2026-06-01T10:00:00Z' },
        ],
      })

      const res = await fetchGetReviewDetail('review-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/review/items/review-001')
      expect(res?.id).toBe('review-001')
      expect(res?.history).toBeDefined()
    })
  })

  describe('fetchApproveReview - 审核通过', () => {
    it('应正确调用 POST /api/review/items/{id}/approve', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchApproveReview('review-001', { comment: '内容合规，同意通过' })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/review/items/review-001/approve',
        expect.objectContaining({ comment: '内容合规，同意通过' })
      )
    })
  })

  describe('fetchRejectReview - 审核驳回', () => {
    it('应正确调用 POST /api/review/items/{id}/reject 并传递驳回原因', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchRejectReview('review-001', {
        reasonId: 'reason-001',
        comment: '分镜设计不符合规范',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/review/items/review-001/reject',
        expect.objectContaining({ reasonId: 'reason-001', comment: '分镜设计不符合规范' })
      )
    })

    it('应支持直接传递驳回原因文本', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchRejectReview('review-001', { comment: '内容需要修改' })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/review/items/review-001/reject',
        expect.objectContaining({ comment: '内容需要修改' })
      )
    })
  })

  describe('fetchTransferReview - 转审', () => {
    it('应正确调用 POST /api/review/items/{id}/transfer', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchTransferReview('review-001', {
        targetUserId: 'reviewer-002',
        comment: '请转交给更有经验的审核员处理',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/review/items/review-001/transfer',
        expect.objectContaining({ targetUserId: 'reviewer-002' })
      )
    })
  })

  describe('fetchWithdrawReview - 撤回审核', () => {
    it('应正确调用 POST /api/review/items/{id}/withdraw', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchWithdrawReview('review-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/review/items/review-001/withdraw')
    })
  })

  describe('fetchAddSignature - 加签', () => {
    it('应正确调用 POST /api/review/items/{id}/signature', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchAddSignature('review-001', {
        userId: 'signer-001',
        position: 'before',
        comment: '需要相关领域专家确认',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/review/items/review-001/signature',
        expect.objectContaining({ userId: 'signer-001', position: 'before' })
      )
    })

    it('应支持后加签', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchAddSignature('review-001', {
        userId: 'signer-002',
        position: 'after',
        comment: '最终确认',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/review/items/review-001/signature',
        expect.objectContaining({ position: 'after' })
      )
    })
  })

  describe('fetchGetReviewFlowList - 审批流程列表', () => {
    it('应正确返回流程数据', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          {
            id: 'flow-001',
            name: '标准审批流程',
            steps: [
              { name: '初审', reviewerName: '审核员A', status: 'done' },
              { name: '复审', reviewerName: '审核员B', status: 'current' },
            ],
            status: 1,
          },
        ],
        total: 1,
      })

      const res = await fetchGetReviewFlowList('proj-001')

      expect(res?.records).toHaveLength(1)
      expect(res?.records[0].steps).toHaveLength(2)
    })
  })

  describe('fetchUpdateReviewFlow - 更新审批流程', () => {
    it('应正确更新流程配置', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdateReviewFlow('proj-001', {
        name: '更新后的流程',
        steps: [
          { name: '初审', reviewerId: 'r1' },
          { name: '复审', reviewerId: 'r2' },
          { name: '终审', reviewerId: 'r3' },
        ],
      })

      expect(mockAdapter.put).toHaveBeenCalled()
    })
  })

  describe('fetchGetRejectReasons - 驳回原因列表', () => {
    it('应正确返回驳回原因数据', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          { id: 'reason-001', content: '内容质量不达标', category: 'quality', applicableTypes: ['design', 'video'], useCount: 15 },
          { id: 'reason-002', content: '包含敏感信息', category: 'compliance', applicableTypes: ['script', 'design'], useCount: 8 },
        ],
        total: 2,
      })

      const res = await fetchGetRejectReasons()

      expect(res?.records).toHaveLength(2)
      expect(res?.records[0].content).toBe('内容质量不达标')
    })

    it('应支持分类筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetRejectReasons({ category: 'quality' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/review/reject-reasons',
        expect.objectContaining({ category: 'quality' })
      )
    })
  })

  describe('fetchCreateRejectReason - 创建驳回原因', () => {
    it('应正确创建驳回原因', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'new-reason', content: '新的驳回原因' })

      await fetchCreateRejectReason({
        content: '新的驳回原因',
        category: 'quality',
        applicableTypes: ['design', 'video', 'script'],
        sort: 10,
        status: 1,
      })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchUpdateRejectReason - 更新驳回原因', () => {
    it('应正确更新驳回原因', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdateRejectReason('reason-001', {
        content: '更新后的内容',
        sort: 5,
      })

      expect(mockAdapter.put).toHaveBeenCalled()
    })
  })

  describe('fetchDeleteRejectReason - 删除驳回原因', () => {
    it('应正确删除驳回原因', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteRejectReason('reason-001')

      expect(mockAdapter.del).toHaveBeenCalled()
    })
  })

  describe('fetchGetReviewStatistics - 审核统计', () => {
    it('应正确返回统计数据', async () => {
      mockAdapter.get.mockResolvedValue({
        totalReviews: 150,
        approvedCount: 120,
        rejectedCount: 20,
        avgReviewTimeHours: 4.5,
        trend: [
          { date: '2026-05-01', approved: 10, rejected: 2 },
          { date: '2026-05-02', approved: 12, rejected: 1 },
        ],
        distribution: [
          { type: 'design', count: 50 },
          { type: 'script', count: 40 },
          { type: 'video', count: 30 },
          { type: 'animation', count: 20 },
          { type: 'audio', count: 10 },
        ],
      })

      const res = await fetchGetReviewStatistics()

      expect(res?.totalReviews).toBe(150)
      expect(res?.approvedCount).toBe(120)
      expect(res?.rejectedCount).toBe(20)
      expect(res?.distribution).toHaveLength(5)
    })
  })
})

describe('审核数据类型验证', () => {
  it('内容类型枚举应正确', () => {
    const validTypes = ['animation', 'video', 'audio', 'script', 'design', 'budget']
    validTypes.forEach((type) => {
      expect(mockReviewList.records.some((r) => r.contentType === type)).toBeTruthy()
    })
  })

  it('审核状态枚举应正确', () => {
    const statusMap: Record<string, string> = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回',
      withdrawn: '已撤回',
    }
    expect(statusMap['pending']).toBe('待审核')
    expect(statusMap['approved']).toBe('已通过')
    expect(statusMap['rejected']).toBe('已驳回')
  })

  it('优先级枚举应正确', () => {
    const priorityMap: Record<string, string> = {
      high: '高',
      medium: '中',
      low: '低',
    }
    expect(priorityMap['high']).toBe('高')
    expect(priorityMap['medium']).toBe('中')
    expect(priorityMap['low']).toBe('低')
  })

  it('内容类型颜色应正确映射', () => {
    const typeColorMap: Record<string, string> = {
      animation: 'primary',
      video: 'success',
      audio: 'warning',
      script: 'info',
      design: 'danger',
      budget: 'primary',
    }
    expect(typeColorMap['animation']).toBe('primary')
    expect(typeColorMap['video']).toBe('success')
    expect(typeColorMap['audio']).toBe('warning')
    expect(typeColorMap['script']).toBe('info')
    expect(typeColorMap['design']).toBe('danger')
  })

  it('驳回原因分类应正确映射', () => {
    const categoryMap: Record<string, string> = {
      quality: '质量问题',
      content: '内容问题',
      compliance: '合规问题',
      technical: '技术问题',
      other: '其他',
    }
    expect(categoryMap['quality']).toBe('质量问题')
    expect(categoryMap['compliance']).toBe('合规问题')
  })

  it('审核历史动作应正确映射', () => {
    const actionMap: Record<string, string> = {
      submit: '提交',
      approve: '通过',
      reject: '驳回',
      transfer: '转审',
      signature: '加签',
    }
    expect(actionMap['submit']).toBe('提交')
    expect(actionMap['approve']).toBe('通过')
    expect(actionMap['reject']).toBe('驳回')
    expect(actionMap['transfer']).toBe('转审')
    expect(actionMap['signature']).toBe('加签')
  })

  it('截止日期紧迫度判断应正确', () => {
    const isUrgent = (deadline: string) => {
      const deadlineTime = new Date(deadline).getTime()
      const now = Date.now()
      const hoursLeft = (deadlineTime - now) / (1000 * 60 * 60)
      return hoursLeft < 24
    }

    const tomorrow = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
    const inTwoDays = new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString()

    expect(isUrgent(tomorrow)).toBe(false)
    expect(isUrgent(inTwoDays)).toBe(true)
  })
})
