import { MockMethod } from 'vite-plugin-mock'

const MOCK_TOKEN = 'mock-access-token-2024'
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-2024'

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        token: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        tokenType: 'Bearer',
        expiresIn: 43200,
        refreshExpiresIn: 604800,
        userId: 'user-001',
        username: 'SuperAdmin',
        avatar: '',
        email: 'admin@example.com'
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/test-login',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        token: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        tokenType: 'Bearer',
        expiresIn: 43200,
        refreshExpiresIn: 604800,
        userId: 'user-001',
        username: 'SuperAdmin',
        avatar: '',
        email: 'admin@example.com'
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/register',
    method: 'post',
    response: ({ body }: { body: { autoLogin?: boolean } }) => {
      const userData = {
        id: 'user-' + Date.now(),
        username: 'NewUser',
        email: 'new@example.com',
        phone: '13800138000',
        avatar: '',
        status: 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        roles: ['team_member']
      }

      const response: any = { ...userData }

      if (body?.autoLogin) {
        response.token = MOCK_TOKEN
        response.refreshToken = MOCK_REFRESH_TOKEN
        response.tokenType = 'Bearer'
        response.expiresIn = 43200
        response.refreshExpiresIn = 604800
      }

      return {
        code: 200,
        message: 'success',
        data: response,
        timestamp: Date.now()
      }
    }
  },
  {
    url: '/api/auth/me',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        id: 'user-001',
        username: 'SuperAdmin',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: '',
        status: 1,
        createTime: '2025-01-01T00:00:00',
        updateTime: '2025-05-20T14:30:00',
        roles: ['platform_admin']
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/permissions',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
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
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/captcha',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        key: 'mock-captcha-key-' + Date.now(),
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        token: MOCK_TOKEN,
        refreshToken: null,
        tokenType: 'Bearer',
        expiresIn: 43200,
        refreshExpiresIn: 0,
        userId: 'user-001',
        username: 'SuperAdmin',
        avatar: '',
        email: 'admin@example.com'
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/refresh-token',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        token: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        tokenType: 'Bearer',
        expiresIn: 43200,
        refreshExpiresIn: 604800,
        userId: 'user-001',
        username: 'SuperAdmin',
        avatar: '',
        email: 'admin@example.com'
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/captcha/email',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/password/reset',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/profile',
    method: 'put',
    response: ({ body }: { body: Record<string, unknown> }) => ({
      code: 200,
      message: 'success',
      data: {
        token: MOCK_TOKEN,
        refreshToken: null,
        tokenType: 'Bearer',
        expiresIn: 43200,
        refreshExpiresIn: 0,
        userId: 'user-001',
        username: body.username || 'SuperAdmin',
        avatar: '',
        email: body.email || 'admin@example.com'
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/avatar',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        id: 'user-001',
        username: 'SuperAdmin',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: 'https://example.com/avatar.png',
        status: 1,
        createTime: '2025-01-01T00:00:00',
        updateTime: '2025-05-20T14:30:00',
        roles: ['platform_admin']
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/avatar/:userId',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        userId: 'user-001',
        avatar: '',
        mediaType: 'image/png'
      },
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/avatar/file',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: null,
      timestamp: Date.now()
    })
  },
  {
    url: '/api/auth/redeem-code',
    method: 'post',
    response: ({ body }: { body: { code?: string } }) => {
      if (!body?.code) {
        return {
          code: 400,
          message: '邀请码不能为空',
          data: null,
          timestamp: Date.now()
        }
      }
      return {
        code: 200,
        message: 'success',
        data: {
          success: true,
          message: '平台邀请码已激活，欢迎加入！'
        },
        timestamp: Date.now()
      }
    }
  }
] as MockMethod[]
