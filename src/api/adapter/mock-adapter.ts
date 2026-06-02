import type { IApiAdapter, RequestConfig } from './types'

interface MockHandler {
  method: string
  pattern: RegExp
  handler: (url: string, data?: any, params?: any) => any
}

export class MockAdapter implements IApiAdapter {
  private handlers: MockHandler[] = []
  private delay: number

  constructor(delay = 300) {
    this.delay = delay
    this.registerDefaultHandlers()
  }

  private registerDefaultHandlers() {
    this.addHandler('POST', /\/api\/auth\/login/, () => ({
      token: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 43200,
      refreshExpiresIn: 604800,
      userId: 'user-001',
      username: 'SuperAdmin',
      avatar: '',
      email: 'admin@example.com'
    }))
    this.addHandler('POST', /\/api\/auth\/test-login/, () => ({
      token: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 43200,
      refreshExpiresIn: 604800,
      userId: 'user-001',
      username: 'SuperAdmin',
      avatar: '',
      email: 'admin@example.com'
    }))
    this.addHandler('POST', /\/api\/auth\/register/, () => ({
      id: 'user-' + Date.now(),
      username: 'NewUser',
      email: 'new@example.com',
      phone: '13800138000',
      avatar: '',
      status: 1,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      roles: ['team_member'],
      token: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 43200,
      refreshExpiresIn: 604800
    }))
    this.addHandler('POST', /\/api\/auth\/logout/, () => null)
    this.addHandler('POST', /\/api\/auth\/refresh/, () => ({
      token: 'mock-access-token-' + Date.now(),
      refreshToken: null,
      tokenType: 'Bearer',
      expiresIn: 43200,
      refreshExpiresIn: 0,
      userId: 'user-001',
      username: 'SuperAdmin',
      avatar: '',
      email: 'admin@example.com'
    }))
    this.addHandler('POST', /\/api\/auth\/refresh-token/, () => ({
      token: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 43200,
      refreshExpiresIn: 604800,
      userId: 'user-001',
      username: 'SuperAdmin',
      avatar: '',
      email: 'admin@example.com'
    }))
    this.addHandler('GET', /\/api\/auth\/captcha/, () => ({
      key: 'mock-captcha-key',
      image: ''
    }))
    this.addHandler('POST', /\/api\/auth\/captcha\/email/, () => null)
    this.addHandler('POST', /\/api\/auth\/password\/reset/, () => null)
    this.addHandler('GET', /\/api\/auth\/me/, () => ({
      id: 'user-001',
      username: 'SuperAdmin',
      email: 'admin@example.com',
      phone: '13800138000',
      avatar: '',
      status: 1,
      createTime: '2025-01-01T00:00:00',
      updateTime: '2025-05-20T14:30:00',
      roles: ['platform_admin']
    }))
    this.addHandler('PUT', /\/api\/auth\/profile/, (_url: string, data?: any) => ({
      token: 'mock-access-token-' + Date.now(),
      refreshToken: null,
      tokenType: 'Bearer',
      expiresIn: 43200,
      refreshExpiresIn: 0,
      userId: 'user-001',
      username: data?.username || 'SuperAdmin',
      avatar: '',
      email: data?.email || 'admin@example.com'
    }))
    this.addHandler('POST', /\/api\/auth\/avatar/, () => ({
      id: 'user-001',
      username: 'SuperAdmin',
      email: 'admin@example.com',
      phone: '13800138000',
      avatar: 'https://example.com/avatar.png',
      status: 1,
      createTime: '2025-01-01T00:00:00',
      updateTime: '2025-05-20T14:30:00',
      roles: ['platform_admin']
    }))
    this.addHandler('GET', /\/api\/auth\/avatar\//, () => ({
      userId: 'user-001',
      avatar: '',
      mediaType: 'image/png'
    }))
    this.addHandler('GET', /\/api\/auth\/permissions/, () => ({
      userId: 'user-001',
      username: 'SuperAdmin',
      roleGroup: 'platform_admin',
      roleGroupName: '平台管理员',
      roleLevel: 0,
      permissions: [
        { moduleCode: '*', moduleName: '全部权限', actions: ['*'] }
      ],
      teamInfo: { teamId: 'team-001', teamName: '创意团队' },
      projectIds: ['proj-001', 'proj-002'],
      projectRoles: {}
    }))
    this.addHandler('GET', /\/api\/teams\/member\/teams/, () => [
      { teamId: 'team-001', teamName: '创意团队', teamAvatar: '', role: 'owner', memberCount: 5, isCurrent: true },
      { teamId: 'team-002', teamName: '古风工作室', teamAvatar: '', role: 'member', memberCount: 3, isCurrent: false }
    ])
    this.addHandler('GET', /\/api\/projects/, () => ({
      records: [
        { id: 'proj-001', projectName: '星际迷航', description: '科幻短剧项目', coverImage: '', status: 1, teamId: 'team-001', createdBy: 'user-001', creatorName: '导演A', memberCount: 5, userRole: 'owner', createTime: '2025-01-15T10:00:00' }
      ],
      total: 1, page: 1, pageSize: 20, totalPages: 1, hasNext: false, hasPrevious: false, first: true, last: true, currentSize: 1, empty: false
    }))
    this.addHandler('GET', /\/api\/statistics\/dashboard/, () => ({
      totalProjects: 12, activeProjects: 5, totalVideos: 34, totalStoryboards: 156, totalAssets: 423,
      creditsBalance: 5000, creditsBalanceChange: '+200',
      activeUsers: { values: [10, 15, 12, 18, 20, 16, 22], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
      totalUsers: '128', totalVisits: '3,456', dailyVisits: '234', weeklyChange: '+12%',
      pendingReviews: 8, pendingReviewsChange: '-3', projectProgress: 65, projectProgressChange: '+5%',
      ownedProjects: 5, ownedProjectsChange: '+1'
    }))
    this.addHandler('GET', /\/api\/notifications\/unread-count/, () => 3)
    this.addHandler('GET', /\/api\/review\/pending-count/, () => 2)
    this.addHandler('GET', /\/api\/credits\/me/, () => ({ balance: 5000, totalEarned: 10000, totalSpent: 5000 }))
  }

  addHandler(method: string, pattern: RegExp, handler: MockHandler['handler']) {
    this.handlers.push({ method, pattern, handler })
  }

  private async matchHandler(config: RequestConfig): Promise<any> {
    const handler = this.handlers.find(
      (h) => h.method === config.method && h.pattern.test(config.url)
    )
    if (!handler) {
      return config.method === 'GET' ? null : {}
    }
    return handler.handler(config.url, config.data, config.params)
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay + Math.random() * 200))
  }

  async request<T>(config: RequestConfig): Promise<T> {
    await this.simulateDelay()
    return this.matchHandler(config) as T
  }

  get<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'GET', params })
  }

  post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  del<T>(url: string, params?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, url, method: 'DELETE', params })
  }
}
