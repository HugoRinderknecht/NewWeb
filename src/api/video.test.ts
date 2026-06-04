/**
 * 视频生成 API 测试
 * 覆盖 AI 视频生成、任务管理、视频预览等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockVideoTask, mockVideoTaskList, createMockAdapter } from '@/test/mock-data'

const mockAdapter = createMockAdapter()

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

import {
  fetchPreviewVideoGeneration,
  fetchSubmitVideoGeneration,
  fetchGetVideoTaskList,
  fetchGetVideoTaskDetail,
  fetchGetVideoTaskResult,
  fetchCancelVideoTask,
  fetchGetVideoHistory,
} from '@/api/video'

describe('视频生成 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchPreviewVideoGeneration - 预览生成（第一阶段）', () => {
    it('应正确调用 POST /api/seedance/generations/preview', async () => {
      mockAdapter.post.mockResolvedValue({ previewToken: 'preview-token-abc123' })

      const res = await fetchPreviewVideoGeneration({
        storyboardId: 'sb-001',
        shotIds: ['shot-001', 'shot-002'],
        model: 'seedance-2.0',
        resolution: '720p',
        aspectRatio: '16:9',
        duration: 10,
        priority: 5,
      })

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/seedance/generations/preview', expect.any(Object))
      expect(res?.previewToken).toBeDefined()
    })

    it('应支持附加选项参数', async () => {
      mockAdapter.post.mockResolvedValue({ previewToken: 'token' })

      await fetchPreviewVideoGeneration({
        storyboardId: 'sb-001',
        shotIds: ['shot-001'],
        withAudio: true,
        withWatermark: false,
        fixedCamera: true,
        returnLastFrame: true,
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/seedance/generations/preview',
        expect.objectContaining({
          withAudio: true,
          withWatermark: false,
          fixedCamera: true,
          returnLastFrame: true,
        })
      )
    })
  })

  describe('fetchSubmitVideoGeneration - 提交生成（第二阶段）', () => {
    it('应正确调用 POST /api/seedance/generations 并传递 previewToken', async () => {
      mockAdapter.post.mockResolvedValue({ taskId: 'vt-new-001', status: 'queued' })

      const res = await fetchSubmitVideoGeneration('preview-token-abc123', ['shot-001', 'shot-002'], {
        remark: '测试提交',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/seedance/generations', expect.objectContaining({
        previewToken: 'preview-token-abc123',
        shotIds: ['shot-001', 'shot-002'],
      }))
      expect(res?.taskId).toBeDefined()
    })
  })

  describe('fetchGetVideoTaskList - 任务列表查询', () => {
    it('应正确调用 GET /api/seedance/tasks', async () => {
      mockAdapter.get.mockResolvedValue(mockVideoTaskList)

      const res = await fetchGetVideoTaskList()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/seedance/tasks', undefined)
      expect(res?.records).toHaveLength(4)
      expect(res?.pending).toBe(1)
      expect(res?.running).toBe(1)
      expect(res?.succeeded).toBe(1)
      expect(res?.failed).toBe(1)
    })

    it('应支持状态筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockVideoTask], total: 1 })

      await fetchGetVideoTaskList({ status: 'succeeded' })

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/seedance/tasks', expect.objectContaining({ status: 'succeeded' }))
    })

    it('应支持分页参数', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockVideoTask], total: 10, page: 2, pageSize: 5 })

      const res = await fetchGetVideoTaskList({ page: 2, pageSize: 5 })

      expect(res?.page).toBe(2)
      expect(res?.pageSize).toBe(5)
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetVideoTaskList()

      expect(res).toBeNull()
    })
  })

  describe('fetchGetVideoTaskDetail - 任务详情查询', () => {
    it('应正确调用 GET /api/seedance/tasks/{taskId}', async () => {
      mockAdapter.get.mockResolvedValue({ ...mockVideoTask, shots: [] })

      const res = await fetchGetVideoTaskDetail('vt-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/seedance/tasks/vt-001')
      expect(res?.id).toBe('vt-001')
    })

    it('应包含进度信息', async () => {
      mockAdapter.get.mockResolvedValue({ ...mockVideoTask, progress: 75 })

      const res = await fetchGetVideoTaskDetail('vt-running')

      expect(res?.progress).toBeDefined()
    })
  })

  describe('fetchGetVideoTaskResult - 任务结果查询', () => {
    it('应正确调用 GET /api/seedance/tasks/{taskId}/result', async () => {
      mockAdapter.get.mockResolvedValue({
        videoUrl: 'https://cdn.example.com/video.mp4',
        thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
        duration: 10,
        resolution: '720p',
      })

      const res = await fetchGetVideoTaskResult('vt-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/seedance/tasks/vt-001/result')
      expect(res?.videoUrl).toBeDefined()
      expect(res?.thumbnailUrl).toBeDefined()
    })
  })

  describe('fetchCancelVideoTask - 取消任务', () => {
    it('应正确调用 POST /api/seedance/tasks/{taskId}/cancel', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchCancelVideoTask('vt-queued-001')

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/seedance/tasks/vt-queued-001/cancel')
    })
  })

  describe('fetchGetVideoHistory - 生成历史查询', () => {
    it('应正确调用历史查询 API', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockVideoTask], total: 1 })

      const res = await fetchGetVideoHistory()

      expect(mockAdapter.get).toHaveBeenCalled()
      expect(res?.records).toHaveLength(1)
    })

    it('应支持分辨率筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetVideoHistory({ resolution: '1080p' })

      expect(mockAdapter.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ resolution: '1080p' }))
    })
  })
})

describe('视频生成数据类型验证', () => {
  it('视频任务状态枚举应正确', () => {
    const validStatuses = ['queued', 'running', 'succeeded', 'failed', 'cancelled', 'expired']
    validStatuses.forEach((status) => {
      expect(mockVideoTaskList.records.some((t) => t.status === status)).toBeTruthy()
    })
  })

  it('生成模型枚举应正确', () => {
    const validModels = ['Seedance 2.0', 'Seedance 2.0 Fast']
    expect(validModels).toContain(mockVideoTask.model)
  })

  it('分辨率枚举应正确', () => {
    const validResolutions = ['480p', '720p', '1080p']
    expect(validResolutions).toContain(mockVideoTask.resolution)
  })

  it('宽高比枚举应正确', () => {
    const validRatios = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9']
    expect(validRatios).toContain(mockVideoTask.aspectRatio)
  })

  it('时长范围应正确（4-15秒）', () => {
    expect(mockVideoTask.duration).toBeGreaterThanOrEqual(4)
    expect(mockVideoTask.duration).toBeLessThanOrEqual(15)
  })

  it('优先级范围应正确（0-9）', () => {
    expect(mockVideoTask.priority).toBeGreaterThanOrEqual(0)
    expect(mockVideoTask.priority).toBeLessThanOrEqual(9)
  })

  it('优先级高风险判断应正确', () => {
    const isHighPriority = (p: number) => p >= 7
    const isMediumPriority = (p: number) => p >= 4

    expect(isHighPriority(9)).toBe(true)
    expect(isHighPriority(7)).toBe(true)
    expect(isHighPriority(6)).toBe(false)
    expect(isMediumPriority(5)).toBe(true)
    expect(isMediumPriority(3)).toBe(false)
  })
})

describe('视频生成两阶段提交流程', () => {
  it('应先获取 previewToken 再提交任务', async () => {
    mockAdapter.post
      .mockResolvedValueOnce({ previewToken: 'token-abc' })
      .mockResolvedValueOnce({ taskId: 'vt-001', status: 'queued' })

    const previewRes = await fetchPreviewVideoGeneration({
      storyboardId: 'sb-001',
      shotIds: ['shot-001'],
      model: 'seedance-2.0',
      resolution: '720p',
      aspectRatio: '16:9',
      duration: 10,
      priority: 5,
    })

    expect(previewRes?.previewToken).toBe('token-abc')

    const submitRes = await fetchSubmitVideoGeneration('token-abc', ['shot-001'], {})

    expect(submitRes?.taskId).toBe('vt-001')
    expect(mockAdapter.post).toHaveBeenCalledTimes(2)
  })
})
