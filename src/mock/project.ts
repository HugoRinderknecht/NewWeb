import { MockMethod } from 'vite-plugin-mock'

const mockProjects = [
  { id: 'proj-001', projectName: '星际迷航', description: '科幻短剧项目', coverImage: '', status: 1, teamId: 'team-001', createdBy: 'user-001', creatorName: '导演A', memberCount: 5, userRole: 'owner', createTime: '2025-01-15T10:00:00' },
  { id: 'proj-002', projectName: '都市传说', description: '都市悬疑短剧', coverImage: '', status: 1, teamId: 'team-001', createdBy: 'user-002', creatorName: '导演B', memberCount: 3, userRole: 'editor', createTime: '2025-02-10T09:00:00' },
  { id: 'proj-003', projectName: '古风奇缘', description: '古装爱情短剧', coverImage: '', status: 2, teamId: 'team-002', createdBy: 'user-001', creatorName: '导演A', memberCount: 8, userRole: 'owner', createTime: '2025-03-05T11:00:00' }
]

export default [
  {
    url: '/api/projects',
    method: 'get',
    response: ({ query }: any) => ({
      code: 200,
      message: 'success',
      data: {
        records: mockProjects,
        total: mockProjects.length,
        page: Number(query.page) || 1,
        pageSize: Number(query.pageSize) || 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true,
        currentSize: mockProjects.length,
        empty: mockProjects.length === 0
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id',
    method: 'get',
    response: ({ query }: any) => {
      const project = mockProjects.find((p) => p.id === query.id)
      return {
        code: 200,
        message: 'success',
        data: project
          ? {
              ...project,
              adminCount: 2,
              storyboardCount: 24,
              completedStoryboardCount: 12,
              videoCount: 5,
              assetCount: 156,
              updateTime: '2025-05-20T14:30:00'
            }
          : null,
        timestamp: Date.now()
      }
    }
  },
  {
    url: '/api/projects',
    method: 'post',
    response: ({ body }: any) => ({
      code: 200,
      message: 'success',
      data: {
        id: 'proj-' + Date.now(),
        projectName: body.projectName || '新项目',
        description: body.description || '',
        coverImage: body.coverImage || '',
        status: 1,
        teamId: 'team-001',
        createdBy: 'user-001',
        creatorName: '导演A',
        memberCount: 1,
        userRole: 'owner',
        createTime: new Date().toISOString()
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id',
    method: 'put',
    response: ({ body }: any) => ({
      code: 200,
      message: 'success',
      data: {
        id: body.id || 'proj-001',
        projectName: body.projectName || '星际迷航',
        description: body.description || '科幻短剧项目',
        coverImage: body.coverImage || '',
        status: 1,
        teamId: 'team-001',
        createdBy: 'user-001',
        creatorName: '导演A',
        memberCount: 5,
        userRole: 'owner',
        createTime: '2025-01-15T10:00:00',
        updateTime: new Date().toISOString()
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id',
    method: 'delete',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/archive',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/restore',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/copy',
    method: 'post',
    response: ({ body }: any) => ({
      code: 200,
      message: 'success',
      data: {
        id: 'proj-copy-' + Date.now(),
        projectName: (body?.projectName || '项目副本'),
        description: body?.description || '',
        coverImage: '',
        status: 1,
        teamId: 'team-001',
        createdBy: 'user-001',
        creatorName: '导演A',
        memberCount: 1,
        userRole: 'owner',
        createTime: new Date().toISOString()
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/cover',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: { url: '/uploads/covers/project-cover-new.jpg' },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/members',
    method: 'get',
    response: ({ query }: any) => ({
      code: 200,
      message: 'success',
      data: {
        records: [
          { id: 'member-001', userId: 'user-001', userName: '导演A', avatar: '', role: 'owner', joinTime: '2025-01-15T10:00:00' },
          { id: 'member-002', userId: 'user-002', userName: '导演B', avatar: '', role: 'editor', joinTime: '2025-02-10T09:00:00' },
          { id: 'member-003', userId: 'user-003', userName: '美术C', avatar: '', role: 'viewer', joinTime: '2025-03-05T11:00:00' }
        ],
        total: 3,
        page: Number(query.page) || 1,
        pageSize: Number(query.pageSize) || 20,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
        first: true,
        last: true,
        currentSize: 3,
        empty: false
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/members',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/members/:memberId',
    method: 'put',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/members/:memberId',
    method: 'delete',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/config',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: { projectId: 'proj-001', configs: {} },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/config',
    method: 'put',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/review-config',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: { projectId: 'proj-001', enabled: true, reviewType: 'storyboard', autoApprove: false, steps: ['reviewer', 'approver'] },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/review-config',
    method: 'put',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/projects/:id/statistics',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        projectId: 'proj-001',
        totalStoryboards: 24,
        completedStoryboards: 12,
        totalVideos: 5,
        totalAssets: 156,
        totalCredits: 5000,
        totalTokens: 120000
      },
      timestamp: Date.now()
    })
  }
] as MockMethod[]
