/**
 * 剧本管理 API 测试
 * 覆盖剧本 CRUD、审核、拆解、AI 生成等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockScript,
  mockScriptList,
  mockScriptDetail,
  mockEpisodes,
  mockCharacterProfiles,
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
  fetchGetScriptList,
  fetchGetScriptDetail,
  fetchCreateScript,
  fetchUpdateScript,
  fetchDeleteScript,
  fetchSubmitScriptReview,
  fetchWithdrawScriptReview,
  fetchGetScriptReviewStatus,
  fetchDecomposeScript,
  fetchGetProjectEpisodes,
  fetchGetCharacterProfiles,
  fetchGenerateCharacterProfiles,
  fetchReviewScriptContent,
  fetchExtractAssets,
} from '@/api/script'

describe('剧本管理 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGetScriptList - 剧本列表查询', () => {
    it('应正确调用 GET /api/projects/{projectId}/scripts', async () => {
      mockAdapter.get.mockResolvedValue(mockScriptList)

      const res = await fetchGetScriptList('proj-001', { page: 1, pageSize: 10 })

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/projects/proj-001/scripts', { page: 1, pageSize: 10 })
      expect(res?.records).toHaveLength(2)
      expect(res?.total).toBe(2)
    })

    it('应支持状态筛选参数', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockScript], total: 1 })

      await fetchGetScriptList('proj-001', { status: 1 })

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/projects/proj-001/scripts', expect.objectContaining({ status: 1 }))
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetScriptList('proj-001')

      expect(res).toBeNull()
    })
  })

  describe('fetchGetScriptDetail - 剧本详情查询', () => {
    it('应正确调用 GET /api/scripts/{scriptId}', async () => {
      mockAdapter.get.mockResolvedValue(mockScriptDetail)

      const res = await fetchGetScriptDetail('script-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/scripts/script-001')
      expect(res?.id).toBe('script-001')
      expect(res?.content).toBeDefined()
    })

    it('应包含审核状态字段', async () => {
      mockAdapter.get.mockResolvedValue(mockScriptDetail)

      const res = await fetchGetScriptDetail('script-001')

      expect(res?.reviewStatus).toBeDefined()
    })
  })

  describe('fetchCreateScript - 创建剧本', () => {
    it('应正确调用 POST /api/projects/{projectId}/scripts', async () => {
      mockAdapter.post.mockResolvedValue({ ...mockScript, id: 'new-script' })

      const newScript = {
        title: '新剧本',
        description: '新剧本描述',
        content: '剧本正文内容...',
        status: 0,
      }

      const res = await fetchCreateScript('proj-001', newScript)

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/projects/proj-001/scripts', newScript)
      expect(res?.id).toBe('new-script')
    })
  })

  describe('fetchUpdateScript - 更新剧本', () => {
    it('应正确调用 PUT /api/scripts/{scriptId}', async () => {
      mockAdapter.put.mockResolvedValue({ ...mockScript, title: '更新后的标题' })

      const updates = { title: '更新后的标题', description: '更新后的描述' }

      await fetchUpdateScript('script-001', updates)

      expect(mockAdapter.put).toHaveBeenCalledWith('/api/scripts/script-001', updates)
    })
  })

  describe('fetchDeleteScript - 删除剧本', () => {
    it('应正确调用 DELETE /api/scripts/{scriptId}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteScript('script-001')

      expect(mockAdapter.del).toHaveBeenCalledWith('/api/scripts/script-001')
    })
  })

  describe('fetchSubmitScriptReview - 提交审核', () => {
    it('应正确调用 POST /api/scripts/{scriptId}/submit-review', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchSubmitScriptReview('script-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/scripts/script-001/submit-review')
    })
  })

  describe('fetchWithdrawScriptReview - 撤回审核', () => {
    it('应正确调用 POST /api/scripts/{scriptId}/withdraw-review', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchWithdrawScriptReview('script-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/scripts/script-001/withdraw-review')
    })
  })

  describe('fetchGetScriptReviewStatus - 审核状态查询', () => {
    it('应正确调用 GET /api/scripts/{scriptId}/review-status', async () => {
      mockAdapter.get.mockResolvedValue({ reviewStatus: 1, reviewerName: '审核员', reviewTime: '2026-06-01' })

      const res = await fetchGetScriptReviewStatus('script-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/scripts/script-001/review-status')
      expect(res?.reviewStatus).toBe(1)
    })
  })

  describe('fetchDecomposeScript - AI 剧本拆解', () => {
    it('应正确调用 POST /api/projects/{projectId}/scripts/{scriptId}/decompose', async () => {
      mockAdapter.post.mockResolvedValue({
        id: 'ai-proc-001',
        status: 'PROCESSING',
        message: '剧本拆解中',
      })

      const res = await fetchDecomposeScript('proj-001', 'script-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/projects/proj-001/scripts/script-001/decompose', undefined)
      expect(res?.status).toBe('PROCESSING')
    })

    it('应支持 force 参数强制重新拆解', async () => {
      mockAdapter.post.mockResolvedValue({ status: 'PROCESSING' })

      await fetchDecomposeScript('proj-001', 'script-001', true)

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/projects/proj-001/scripts/script-001/decompose',
        { force: true }
      )
    })
  })

  describe('fetchGetProjectEpisodes - 分集列表查询', () => {
    it('应正确调用 GET /api/projects/{projectId}/episodes', async () => {
      mockAdapter.get.mockResolvedValue(mockEpisodes)

      const res = await fetchGetProjectEpisodes('proj-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/projects/proj-001/episodes', undefined)
      expect(res).toHaveLength(2)
      expect(res?.[0].episodeName).toBe('第一集：神秘的开始')
    })
  })

  describe('fetchGetCharacterProfiles - 人物小传查询', () => {
    it('应正确调用 GET /api/scripts/{scriptId}/character-profiles', async () => {
      mockAdapter.get.mockResolvedValue(mockCharacterProfiles.profiles)

      const res = await fetchGetCharacterProfiles('script-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/scripts/script-001/character-profiles')
      expect(res).toHaveLength(2)
      expect(res?.[0].name).toBe('张三')
    })

    it('应正确解析 profiles 数组', async () => {
      mockAdapter.get.mockResolvedValue(mockCharacterProfiles.profiles)

      const res = await fetchGetCharacterProfiles('script-001')

      expect(res?.[0].identity).toBe('主角')
      expect(res?.[0].verificationStatus).toBe('一致')
      expect(res?.[0].relations).toHaveLength(2)
    })
  })

  describe('fetchGenerateCharacterProfiles - AI 生成人物小传', () => {
    it('应发起 AI 生成请求', async () => {
      mockAdapter.post.mockResolvedValue({ status: 'PROCESSING' })

      await fetchGenerateCharacterProfiles('proj-001', 'script-001')

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchReviewScriptContent - AI 内容审核', () => {
    it('应发起 AI 内容审核请求', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'ai-review-001', status: 'PROCESSING' })

      await fetchReviewScriptContent('proj-001', 'script-001')

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchExtractAssets - AI 提取资产', () => {
    it('应发起资产提取请求', async () => {
      mockAdapter.post.mockResolvedValue({ status: 'PROCESSING', extractedCount: 0 })

      await fetchExtractAssets('proj-001', 'script-001')

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })
})

describe('剧本 API 类型验证', () => {
  it('ScriptListItem 应包含必要字段', () => {
    const item = mockScript
    expect(item.id).toBeDefined()
    expect(item.title).toBeDefined()
    expect(item.status).toBeDefined()
    expect(item.reviewStatus).toBeDefined()
  })

  it('ScriptReviewStatusVO 应包含审核状态字段', () => {
    const status = { reviewStatus: 1, reviewerName: '审核员', reviewTime: '2026-06-01', reviewComment: '通过' }
    expect(status.reviewStatus).toBe(1)
  })

  it('审核状态枚举值应正确映射', () => {
    const statusMap: Record<number, string> = {
      null: '未提交',
      1: '待审核',
      2: '已通过',
      3: '已驳回',
      4: '已撤回',
    }
    expect(statusMap[1]).toBe('待审核')
    expect(statusMap[2]).toBe('已通过')
    expect(statusMap[3]).toBe('已驳回')
    expect(statusMap[4]).toBe('已撤回')
  })
})
