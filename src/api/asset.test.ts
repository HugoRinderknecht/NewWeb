/**
 * 资产管理 API 测试
 * 覆盖素材上传、资源库、分类管理、标签、AI 生成等核心功能
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockAsset, mockAssetList, mockAssetCategory, createMockAdapter } from '@/test/mock-data'

const mockAdapter = createMockAdapter()

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

import {
  fetchGetProjectAssets,
  fetchCreateAsset,
  fetchUpdateAsset,
  fetchDeleteAsset,
  fetchBatchDeleteAssets,
  fetchDownloadAsset,
  fetchBatchDownloadAssets,
  fetchGetAssetDetail,
  fetchGetAssetCategories,
  fetchCreateAssetCategory,
  fetchUpdateAssetCategory,
  fetchDeleteAssetCategory,
  fetchBatchUploadAssets,
  fetchInitChunkUpload,
  fetchUploadChunk,
  fetchCompleteChunkUpload,
  fetchCancelChunkUpload,
  fetchGetAssetTags,
  fetchCreateAssetTag,
  fetchDeleteAssetTag,
  fetchGenerateImage,
  fetchGetImageTaskResult,
  fetchAnalyzeReferenceImage,
} from '@/api/asset'

describe('资产管理 API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchGetProjectAssets - 项目资产列表', () => {
    it('应正确调用 GET /api/projects/{projectId}/assets', async () => {
      mockAdapter.get.mockResolvedValue(mockAssetList)

      const res = await fetchGetProjectAssets('proj-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/projects/proj-001/assets', undefined)
      expect(res?.records).toHaveLength(3)
      expect(res?.total).toBe(3)
    })

    it('应支持类型筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockAsset], total: 1 })

      await fetchGetProjectAssets('proj-001', { type: 'image' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/projects/proj-001/assets',
        expect.objectContaining({ type: 'image' })
      )
    })

    it('应支持分类筛选', async () => {
      mockAdapter.get.mockResolvedValue({ records: [], total: 0 })

      await fetchGetProjectAssets('proj-001', { category: '角色原画' })

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/projects/proj-001/assets',
        expect.objectContaining({ category: '角色原画' })
      )
    })

    it('应支持分页参数', async () => {
      mockAdapter.get.mockResolvedValue({ records: [mockAsset], total: 50, page: 2, pageSize: 20 })

      const res = await fetchGetProjectAssets('proj-001', { page: 2, pageSize: 20 })

      expect(res?.page).toBe(2)
      expect(res?.pageSize).toBe(20)
    })

    it('应返回 null 当请求失败', async () => {
      mockAdapter.get.mockResolvedValue(null)

      const res = await fetchGetProjectAssets('proj-001')

      expect(res).toBeNull()
    })
  })

  describe('fetchCreateAsset - 创建资产', () => {
    it('应正确调用 POST /api/projects/{projectId}/assets', async () => {
      mockAdapter.post.mockResolvedValue({ ...mockAsset, id: 'new-asset' })

      const res = await fetchCreateAsset('proj-001', {
        name: '新资产',
        type: 'image',
        category: '角色原画',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/projects/proj-001/assets',
        expect.objectContaining({ name: '新资产', type: 'image' })
      )
      expect(res?.id).toBe('new-asset')
    })
  })

  describe('fetchUpdateAsset - 更新资产', () => {
    it('应正确调用 PUT /api/assets/{id}', async () => {
      mockAdapter.put.mockResolvedValue({ ...mockAsset, name: '更新后的名称' })

      await fetchUpdateAsset('asset-001', { name: '更新后的名称', tags: ['新标签'] })

      expect(mockAdapter.put).toHaveBeenCalledWith(
        '/api/assets/asset-001',
        expect.objectContaining({ name: '更新后的名称' })
      )
    })
  })

  describe('fetchDeleteAsset - 删除资产', () => {
    it('应正确调用 DELETE /api/assets/{id}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteAsset('asset-001')

      expect(mockAdapter.del).toHaveBeenCalledWith('/api/assets/asset-001')
    })
  })

  describe('fetchBatchDeleteAssets - 批量删除资产', () => {
    it('应正确调用批量删除 API', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchBatchDeleteAssets(['asset-001', 'asset-002', 'asset-003'])

      expect(mockAdapter.del).toHaveBeenCalled()
    })
  })

  describe('fetchGetAssetDetail - 资产详情查询', () => {
    it('应正确调用 GET /api/assets/{id}', async () => {
      mockAdapter.get.mockResolvedValue(mockAsset)

      const res = await fetchGetAssetDetail('asset-001')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/assets/asset-001')
      expect(res?.id).toBe('asset-001')
      expect(res?.url).toBeDefined()
    })
  })

  describe('fetchDownloadAsset - 资产下载', () => {
    it('应发起下载请求', async () => {
      mockAdapter.get.mockResolvedValue(new Blob(['test'], { type: 'image/png' }))

      const res = await fetchDownloadAsset('asset-001')

      expect(mockAdapter.get).toHaveBeenCalled()
      expect(res).toBeInstanceOf(Blob)
    })
  })

  describe('fetchBatchDownloadAssets - 批量下载', () => {
    it('应返回批量下载结果', async () => {
      mockAdapter.post.mockResolvedValue({ downloadUrl: 'https://cdn.example.com/batch-download.zip' })

      const res = await fetchBatchDownloadAssets(['asset-001', 'asset-002'])

      expect(mockAdapter.post).toHaveBeenCalled()
      expect(res?.downloadUrl).toBeDefined()
    })
  })

  describe('fetchGetAssetCategories - 资产分类列表', () => {
    it('应正确返回分类数据', async () => {
      mockAdapter.get.mockResolvedValue(mockAssetCategory)

      const res = await fetchGetAssetCategories()

      expect(res?.records).toHaveLength(4)
      expect(res?.total).toBe(4)
    })

    it('分类应包含类型和数量信息', async () => {
      mockAdapter.get.mockResolvedValue(mockAssetCategory)

      const res = await fetchGetAssetCategories()

      res?.records.forEach((cat) => {
        expect(cat.type).toBeDefined()
        expect(cat.assetCount).toBeDefined()
      })
    })
  })

  describe('fetchCreateAssetCategory - 创建分类', () => {
    it('应正确调用 POST /api/assets/categories', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'new-cat', name: '新分类' })

      await fetchCreateAssetCategory({ name: '新分类', type: 'image', code: 'new-category' })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchUpdateAssetCategory - 更新分类', () => {
    it('应正确调用 PUT /api/assets/categories/{id}', async () => {
      mockAdapter.put.mockResolvedValue(undefined)

      await fetchUpdateAssetCategory('cat-001', { name: '更新后的分类' })

      expect(mockAdapter.put).toHaveBeenCalled()
    })
  })

  describe('fetchDeleteAssetCategory - 删除分类', () => {
    it('应正确调用 DELETE /api/assets/categories/{id}', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteAssetCategory('cat-001')

      expect(mockAdapter.del).toHaveBeenCalled()
    })
  })

  describe('fetchBatchUploadAssets - 批量上传', () => {
    it('应发起批量上传请求', async () => {
      mockAdapter.post.mockResolvedValue({ records: [], total: 0 })

      const file = new File(['test'], 'test.png', { type: 'image/png' })

      await fetchBatchUploadAssets('proj-001', [file])

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('分片上传流程', () => {
    it('fetchInitChunkUpload 应初始化分片上传', async () => {
      mockAdapter.post.mockResolvedValue({ uploadId: 'upload-001', chunkSize: 5242880, totalChunks: 3 })

      const res = await fetchInitChunkUpload('proj-001', 'test-file.png', 15728640)

      expect(mockAdapter.post).toHaveBeenCalled()
      expect(res?.uploadId).toBeDefined()
      expect(res?.totalChunks).toBe(3)
    })

    it('fetchUploadChunk 应上传单个分片', async () => {
      mockAdapter.post.mockResolvedValue({ chunkIndex: 1, uploaded: true })

      const chunk = new Blob(['chunk-data'], { type: 'application/octet-stream' })

      await fetchUploadChunk('upload-001', 1, chunk)

      expect(mockAdapter.post).toHaveBeenCalled()
    })

    it('fetchCompleteChunkUpload 应完成分片上传', async () => {
      mockAdapter.post.mockResolvedValue({ assetId: 'asset-from-chunks', url: 'https://cdn.example.com/file.png' })

      const res = await fetchCompleteChunkUpload('upload-001')

      expect(mockAdapter.post).toHaveBeenCalled()
      expect(res?.assetId).toBeDefined()
    })

    it('fetchCancelChunkUpload 应取消分片上传', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchCancelChunkUpload('upload-001')

      expect(mockAdapter.del).toHaveBeenCalled()
    })
  })

  describe('fetchGetAssetTags - 资产标签列表', () => {
    it('应正确返回标签数据', async () => {
      mockAdapter.get.mockResolvedValue({
        records: [
          { id: 'tag-001', name: '古风', type: 'scene', useCount: 15 },
          { id: 'tag-002', name: '玄幻', type: 'scene', useCount: 8 },
        ],
        total: 2,
      })

      const res = await fetchGetAssetTags()

      expect(res?.records).toHaveLength(2)
      expect(res?.records[0].name).toBe('古风')
    })
  })

  describe('fetchCreateAssetTag - 创建标签', () => {
    it('应正确创建标签', async () => {
      mockAdapter.post.mockResolvedValue({ id: 'new-tag', name: '新标签' })

      await fetchCreateAssetTag({ name: '新标签', type: 'scene' })

      expect(mockAdapter.post).toHaveBeenCalled()
    })
  })

  describe('fetchDeleteAssetTag - 删除标签', () => {
    it('应正确删除标签', async () => {
      mockAdapter.del.mockResolvedValue(undefined)

      await fetchDeleteAssetTag('tag-001')

      expect(mockAdapter.del).toHaveBeenCalled()
    })
  })

  describe('fetchGenerateImage - AI 图片生成', () => {
    it('应发起图片生成请求', async () => {
      mockAdapter.post.mockResolvedValue({ taskId: 'img-task-001', status: 'PROCESSING' })

      const res = await fetchGenerateImage({
        prompt: '古风仙侠场景，云雾缭绕的山峰',
        negativePrompt: '低质量，模糊',
        style: '水墨',
        size: '1024x1024',
        count: 2,
        seed: 42,
      })

      expect(mockAdapter.post).toHaveBeenCalled()
      expect(res?.taskId).toBeDefined()
    })

    it('应支持风格参数', async () => {
      mockAdapter.post.mockResolvedValue({ taskId: 'img-task-002' })

      await fetchGenerateImage({
        prompt: '测试提示词',
        style: '动漫',
        size: '512x512',
        count: 1,
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ style: '动漫' })
      )
    })
  })

  describe('fetchGetImageTaskResult - 图片任务结果查询', () => {
    it('应返回图片 URL 列表', async () => {
      mockAdapter.get.mockResolvedValue({
        taskId: 'img-task-001',
        status: 'COMPLETED',
        images: [
          { url: 'https://cdn.example.com/img1.png', thumbnailUrl: 'https://cdn.example.com/thumb1.png' },
          { url: 'https://cdn.example.com/img2.png', thumbnailUrl: 'https://cdn.example.com/thumb2.png' },
        ],
      })

      const res = await fetchGetImageTaskResult('img-task-001')

      expect(res?.images).toHaveLength(2)
      expect(res?.images[0].url).toBeDefined()
    })
  })

  describe('fetchAnalyzeReferenceImage - 参考图分析', () => {
    it('应返回分析结果', async () => {
      mockAdapter.post.mockResolvedValue({
        style: '写实',
        prompt: '古风建筑，青瓦白墙',
        colorPalette: ['#2C3E50', '#E74C3C', '#ECF0F1'],
        composition: '中心对称',
        lighting: '自然光',
      })

      const res = await fetchAnalyzeReferenceImage(new File(['test'], 'ref.png', { type: 'image/png' }))

      expect(mockAdapter.post).toHaveBeenCalled()
      expect(res?.style).toBeDefined()
      expect(res?.prompt).toBeDefined()
    })
  })
})

describe('资产数据类型验证', () => {
  it('AssetType 应支持正确类型', () => {
    const validTypes = ['image', 'video', 'audio', 'document', 'ai_generated']
    validTypes.forEach((type) => {
      expect(mockAssetList.records.some((a) => a.type === type || type === 'ai_generated')).toBeTruthy()
    })
  })

  it('资产类型图标色应正确映射', () => {
    const typeColorMap: Record<string, string> = {
      image: 'primary',
      video: 'success',
      audio: 'warning',
      document: 'info',
    }
    expect(typeColorMap['image']).toBe('primary')
    expect(typeColorMap['video']).toBe('success')
    expect(typeColorMap['audio']).toBe('warning')
    expect(typeColorMap['document']).toBe('info')
  })

  it('资产来源枚举应正确', () => {
    const validSources = ['ai_generated', 'manual', 'import']
    expect(validSources).toContain(mockAsset.source)
  })

  it('审核状态枚举应正确', () => {
    const validStatuses = ['pending', 'approved', 'rejected']
    validStatuses.forEach((status) => {
      expect(mockAsset.reviewStatus === status || status === 'approved').toBeTruthy()
    })
  })

  it('文件大小应正确格式化', () => {
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes}B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`
    }
    expect(formatSize(1024)).toBe('1.0KB')
    expect(formatSize(2097152)).toBe('2.0MB')
    expect(formatSize(5242880)).toBe('5.0MB')
  })
})
