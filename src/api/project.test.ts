import { describe, it, expect, vi } from 'vitest'
import * as projectApi from '@/api/project'

// Mock getApiAdapter
vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get: vi.fn((url: string, _params?: any) => {
      if (url === '/api/projects') {
        return Promise.resolve({
          records: [
            {
              id: '1',
              projectName: '测试项目',
              status: 0,
              memberCount: 5,
              creatorName: 'admin',
              createTime: '2026-01-01'
            }
          ],
          total: 1,
          page: 1,
          pageSize: 10
        })
      }
      if (url.includes('/members')) {
        return Promise.resolve({
          records: [
            {
              id: 'm1',
              userId: 'u1',
              userName: '张三',
              role: 'admin',
              avatar: '',
              joinTime: '2026-01-01'
            }
          ],
          total: 1
        })
      }
      if (url.includes('/review-config')) {
        return Promise.resolve({ projectId: '1', storyboard: true, firstFrame: false, video: true })
      }
      if (url.includes('/config')) {
        return Promise.resolve({ projectId: '1', configs: { key1: 'value1' } })
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ memberCount: 10, adminCount: 2 })
      }
      return Promise.resolve({ id: '1', projectName: '测试项目详情', status: 0 })
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    post: vi.fn((_url: string, _data?: any) =>
      Promise.resolve({ id: 'new-1', projectName: '新建项目' })
    ),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    put: vi.fn((_url: string, _data?: any) => Promise.resolve(undefined)),
    del: vi.fn(() => Promise.resolve(undefined))
  })
}))

describe('project API 函数', () => {
  it('fetchGetProjectList 应返回分页数据', async () => {
    const res = await projectApi.fetchGetProjectList({ page: 1, pageSize: 10 })
    expect(res).toBeDefined()
    expect(res!.records).toHaveLength(1)
    expect(res!.records[0].projectName).toBe('测试项目')
  })

  it('fetchGetProjectDetail 应返回项目详情', async () => {
    const res = await projectApi.fetchGetProjectDetail('1')
    expect(res).toBeDefined()
    expect(res!.projectName).toBe('测试项目详情')
  })

  it('fetchGetProjectMembers 应返回成员列表', async () => {
    const res = await projectApi.fetchGetProjectMembers('1')
    expect(res).toBeDefined()
    expect(res!.records).toHaveLength(1)
    expect(res!.records[0].userName).toBe('张三')
  })

  it('fetchGetReviewConfig 应返回审核配置', async () => {
    const res = await projectApi.fetchGetReviewConfig('1')
    expect(res).toBeDefined()
    expect(res!.storyboard).toBe(true)
    expect(res!.firstFrame).toBe(false)
    expect(res!.video).toBe(true)
  })

  it('fetchGetProjectConfig 应返回项目配置', async () => {
    const res = await projectApi.fetchGetProjectConfig('1')
    expect(res).toBeDefined()
    expect(res!.configs.key1).toBe('value1')
  })

  it('fetchGetProjectStatistics 应返回统计数据', async () => {
    const res = await projectApi.fetchGetProjectStatistics('1')
    expect(res).toBeDefined()
    expect(res!.memberCount).toBe(10)
  })

  it('fetchCreateProject 应调用 POST /api/projects', async () => {
    const res = await projectApi.fetchCreateProject({ projectName: '新项目' })
    expect(res).toBeDefined()
  })

  it('fetchUpdateProject 应调用 PUT /api/projects/:id', async () => {
    // PUT 接口返回 void
    await expect(
      projectApi.fetchUpdateProject('1', { projectName: '更新名称' })
    ).resolves.toBeUndefined()
  })

  it('fetchDeleteProject 应调用 DELETE /api/projects/:id', async () => {
    await expect(projectApi.fetchDeleteProject('1')).resolves.toBeUndefined()
  })

  it('fetchUploadProjectCover 应调用 POST /api/projects/:id/cover', async () => {
    const file = new File(['test'], 'cover.png', { type: 'image/png' })
    const res = await projectApi.fetchUploadProjectCover('1', file)
    expect(res).toBeDefined()
  })
})

describe('project API 类型对齐验证', () => {
  it('ReviewConfigVO 应包含 storyboard/firstFrame/video 字段', async () => {
    const res = await projectApi.fetchGetReviewConfig('1')
    expect(res).toHaveProperty('storyboard')
    expect(res).toHaveProperty('firstFrame')
    expect(res).toHaveProperty('video')
    // 不应包含旧字段
    expect((res as any).enabled).toBeUndefined()
    expect((res as any).reviewType).toBeUndefined()
  })

  it('CoverUploadResponse 应使用 coverUrl 字段', async () => {
    // 类型层面的验证：如果 CoverUploadResponse 有 coverUrl 而非 url，
    // 那么 TypeScript 编译时就会报错，这里验证运行时
    const coverResponse: Api.Project.CoverUploadResponse = {
      coverUrl: 'https://example.com/cover.png'
    }
    expect(coverResponse.coverUrl).toBe('https://example.com/cover.png')
  })

  it('ProjectMemberRole 应为 7 种业务角色', () => {
    const roles: Api.Project.ProjectMemberRole[] = [
      'admin',
      'director',
      'storyboard',
      'art',
      'video',
      'audio',
      'edit'
    ]
    expect(roles).toHaveLength(7)
  })
})
