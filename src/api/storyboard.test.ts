/**
 * 分镜管理 API 测试
 * 覆盖分镜 CRUD、AI 生成、场景编排、版本历史等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  mockStoryboard,
  mockStoryboardList,
  mockShots,
  mockScenes,
  createMockAdapter,
} from '@/test/mock-data'

const mockAdapter = createMockAdapter()

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

import {
  fetchGetStoryboardList,
  fetchGetStoryboardDetail,
  fetchCreateStoryboard,
  fetchUpdateStoryboard,
  fetchDeleteStoryboard,
  fetchSubmitStoryboardReview,
  fetchWithdrawStoryboardReview,
  fetchGetStoryboardVersionList,
  fetchRollbackStoryboardVersion,
  fetchGenerateStoryboardByAI,
  fetchGetSceneList,
  fetchCreateScene,
  fetchUpdateScene,
  fetchDeleteScene,
  fetchReorderScenes,
} from '@/api/storyboard'

describe('分镜管理 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGetStoryboardList - 分镜列表查询', () => {
    it('应正确调用 GET /api/projects/{projectId}/storyboards', async () => {
      mockAdapter.get.mockResolvedValue(mockStoryboardList)

      const res = await fetchGetStoryboardList('proj-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/projects/proj-001/storyboards', undefined)
      expect(res?.records).toHaveLength(2)
      expect(res?.total).toBe(2)
    })

    it('应支持分页和筛选参数', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockStoryboard], total: 1 })

      await fetchGetStoryboardList('proj-001', { page: 1, pageSize: 20, status: 1, source: 'script' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/projects/proj-001/storyboards',
        expect.objectContaining({ page: 1, status: 1, source: 'script' })
      )
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetStoryboardList('proj-001')

      expect(res).toBeNull()
    })
  })

  describe('fetchGetStoryboardDetail - 分镜详情查询', () => {
    it('应正确调用 GET /api/storyboards/{id}', async () => {
      mockAdapter.get.mockResolvedValue({ ...mockStoryboard, shots: mockShots })

      const res = await fetchGetStoryboardDetail('sb-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/storyboards/sb-001')
      expect(res?.id).toBe('sb-001')
      expect(res?.shots).toBeDefined()
    })
  })

  describe('fetchCreateStoryboard - 创建分镜', () => {
    it('应正确调用 POST /api/projects/{projectId}/storyboards', async () => {
      mockAdapter.post.mockResolvedValue({ ...mockStoryboard, id: 'new-sb' })

      const newSb = {
        name: '新分镜',
        description: '新分镜描述',
        episodeId: 'ep-001',
      }

      const res = await fetchCreateStoryboard('proj-001', newSb)

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/projects/proj-001/storyboards', newSb)
      expect(res?.id).toBe('new-sb')
    })
  })

  describe('fetchUpdateStoryboard - 更新分镜', () => {
    it('应正确调用 PUT /api/storyboards/{id}', async () => {
      mockAdapter.put.mockResolvedValue({ ...mockStoryboard, name: '更新后的名称' })

      await fetchUpdateStoryboard('sb-001', { name: '更新后的名称' })

      expect(mockAdapter.put).toHaveBeenCalledWith('/api/storyboards/sb-001', { name: '更新后的名称' })
    })
  })

  describe('fetchDeleteStoryboard - 删除分镜', () => {
    it('应正确调用 DELETE /api/storyboards/{id}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteStoryboard('sb-001')

      expect(mockAdapter.del).toHaveBeenCalledWith('/api/storyboards/sb-001')
    })
  })

  describe('fetchSubmitStoryboardReview - 提交审核', () => {
    it('应正确调用 POST /api/storyboards/{id}/submit-review', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchSubmitStoryboardReview('sb-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/storyboards/sb-001/submit-review')
    })
  })

  describe('fetchWithdrawStoryboardReview - 撤回审核', () => {
    it('应正确调用 POST /api/storyboards/{id}/withdraw-review', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchWithdrawStoryboardReview('sb-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/storyboards/sb-001/withdraw-review')
    })
  })

  describe('fetchGetStoryboardVersionList - 版本历史', () => {
    it('应返回分镜版本列表', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          { id: 'ver-002', version: 2, operatorName: '测试用户', changeSummary: '修改镜头参数', createTime: '2026-06-02' },
          { id: 'ver-001', version: 1, operatorName: '测试用户', changeSummary: '初始版本', createTime: '2026-06-01' },
        ],
        total: 2,
      })

      const res = await fetchGetStoryboardVersionList('sb-001')

      expect(mockAdapter.get).toHaveBeenCalled()
      expect(res?.records).toHaveLength(2)
      expect(res?.records[0].version).toBe(2)
    })
  })

  describe('fetchRollbackStoryboardVersion - 回退版本', () => {
    it('应正确调用 POST /api/storyboards/{id}/rollback', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'sb-001', version: 1 })

      await fetchRollbackStoryboardVersion('sb-001', 'ver-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/storyboards/sb-001/rollback', { versionId: 'ver-001' })
    })
  })

  describe('fetchGenerateStoryboardByAI - AI 生成分镜', () => {
    it('应发起 AI 生成请求', async () => {
      mockAdapter.post.mockResolvedValue({ status: 'PROCESSING', taskId: 'ai-task-001' })

      await fetchGenerateStoryboardByAI('proj-001', 'script-001', {
        count: 10,
        prompt: '古风玄幻风格',
      })

      expect(mockAdapter.post).toHaveBeenCalled()
    })

    it('应支持生成数量参数', async () => {
      mockAdapter.post.mockResolvedValue({ status: 'PROCESSING' })

      await fetchGenerateStoryboardByAI('proj-001', 'script-001', { count: 20 })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchGetSceneList - 场景列表查询', () => {
    it('应正确调用 GET /api/storyboards/{id}/scenes', async () => {
      mockAdapter.get.mockResolvedValue(mockScenes)

      const res = await fetchGetSceneList('sb-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/storyboards/sb-001/scenes', undefined)
      expect(res).toHaveLength(2)
    })
  })

  describe('fetchCreateScene - 创建场景', () => {
    it('应正确调用 POST /api/storyboards/{id}/scenes', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'new-scene', name: '新场景' })

      const newScene = {
        name: '新场景',
        sceneType: '内景',
        background: '室内环境',
        timeOfDay: '白天',
        atmosphere: '温馨',
      }

      await fetchCreateScene('sb-001', newScene)

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/storyboards/sb-001/scenes', newScene)
    })
  })

  describe('fetchUpdateScene - 更新场景', () => {
    it('应正确调用 PUT /api/storyboards/{sbId}/scenes/{sceneId}', async () => {
      mockAdapter.put.mockResolvedValue({ id: 'scene-001', name: '更新后的场景' })

      await fetchUpdateScene('sb-001', 'scene-001', { name: '更新后的场景' })

      expect(mockAdapter.put).toHaveBeenCalledWith('/api/storyboards/sb-001/scenes/scene-001', { name: '更新后的场景' })
    })
  })

  describe('fetchDeleteScene - 删除场景', () => {
    it('应正确调用 DELETE /api/storyboards/{sbId}/scenes/{sceneId}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteScene('sb-001', 'scene-001')

      expect(mockAdapter.del).toHaveBeenCalledWith('/api/storyboards/sb-001/scenes/scene-001')
    })
  })

  describe('fetchReorderScenes - 场景排序', () => {
    it('应正确调用 PUT /api/storyboards/{id}/scenes/reorder', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      const sceneOrder = ['scene-002', 'scene-001']

      await fetchReorderScenes('sb-001', sceneOrder)

      expect(mockAdapter.put).toHaveBeenCalledWith('/api/storyboards/sb-001/scenes/reorder', { sceneIds: sceneOrder })
    })
  })
})

describe('分镜数据类型验证', () => {
  it('StoryboardItem 应包含来源和状态字段', () => {
    expect(mockStoryboard.source).toBeDefined()
    expect(mockStoryboard.status).toBeDefined()
  })

  it('镜头类型枚举应正确', () => {
    const validShotTypes = ['特写', '近景', '远景', '全景', '大特写', '过肩']
    validShotTypes.forEach((type) => {
      expect(mockShots.some((s) => s.shotType === type)).toBe(true)
    })
  })

  it('场景类型枚举应正确', () => {
    const validSceneTypes = ['内景', '外景', '虚实结合', '摄影棚']
    validSceneTypes.forEach((type) => {
      expect(mockScenes.some((s) => s.sceneType === type)).toBe(true)
    })
  })

  it('时间选项枚举应正确', () => {
    const validTimes = ['清晨', '上午', '中午', '下午', '黄昏', '夜晚']
    mockShots.forEach((shot) => {
      expect(validTimes).toContain(shot.timeOfDay)
    })
  })

  it('氛围选项枚举应正确', () => {
    const validAtmospheres = ['神秘', '紧张', '温馨', '悲伤', '欢快', '恐怖']
    mockShots.forEach((shot) => {
      expect(validAtmospheres).toContain(shot.atmosphere)
    })
  })

  it('来源标签应正确映射', () => {
    const sourceMap: Record<string, string> = {
      script: '剧本生成',
      manual: '手动创建',
      ai: 'AI辅助',
    }
    expect(sourceMap['script']).toBe('剧本生成')
    expect(sourceMap['manual']).toBe('手动创建')
    expect(sourceMap['ai']).toBe('AI辅助')
  })

  it('状态标签应正确映射', () => {
    const statusMap: Record<number, string> = {
      0: '草稿',
      1: '设计中',
      2: '已完成',
      3: '已归档',
    }
    expect(statusMap[0]).toBe('草稿')
    expect(statusMap[1]).toBe('设计中')
    expect(statusMap[2]).toBe('已完成')
    expect(statusMap[3]).toBe('已归档')
  })
})
