/**
 * 认证 API 集成测试
 *
 * 测试登录、注册、Token 管理等核心认证流程
 *
 * @module auth-integration.test.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock API adapter
const mockAdapter = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  request: vi.fn(),
}

vi.mock('@/api/adapter', () => ({
  getApiAdapter: () => mockAdapter,
  resetAdapter: vi.fn(),
}))

// Mock user store
const mockUserStore = {
  isLogin: false,
  info: {},
  accessToken: '',
  refreshToken: '',
  setToken: vi.fn(),
  setLoginStatus: vi.fn(),
  setUserInfo: vi.fn(),
  logOut: vi.fn(),
}

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => mockUserStore,
}))

// Mock menu store
const mockMenuStore = {
  menuList: [],
  setMenuList: vi.fn(),
  getHomePath: vi.fn(() => '/dashboard'),
}

vi.mock('@/store/modules/menu', () => ({
  useMenuStore: () => mockMenuStore,
}))

// Import after mocks
import {
  fetchLogin,
  fetchTestLogin,
  fetchRegister,
  fetchLogout,
  fetchRefresh,
  fetchRefreshToken,
  fetchCaptcha,
  fetchEmailCaptcha,
  fetchResetPassword,
  fetchGetUserInfo,
  fetchUpdateProfile,
  fetchUploadAvatar,
  fetchGetAvatar,
  fetchGetPermissions,
  fetchRedeemPlatformCode,
} from '@/api/auth'

describe('认证 API 函数测试', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchLogin - 登录接口', () => {
    it('应正确调用 POST /api/auth/login', async () => {
      mockAdapter.post.mockResolvedValue({
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshExpiresIn: 604800,
        userId: 'user-123',
        username: 'testuser',
        avatar: 'https://example.com/avatar.png',
        email: 'test@example.com',
      })

      const result = await fetchLogin({
        account: 'testuser',
        password: 'password123',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          account: 'testuser',
          password: 'password123',
        })
      )
      expect(result.token).toBe('mock-token')
      expect(result.refreshToken).toBe('mock-refresh-token')
    })

    it('登录参数不应包含验证码参数（验证码已禁用）', async () => {
      mockAdapter.post.mockResolvedValue({
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
      })

      await fetchLogin({
        account: 'testuser',
        password: 'password123',
        // captchaKey 和 captchaCode 不应传递
      })

      const calledParams = mockAdapter.post.mock.calls[0][1]
      expect(calledParams).not.toHaveProperty('captchaKey')
      expect(calledParams).not.toHaveProperty('captchaCode')
    })

    it('支持可选的 captchaKey 和 captchaCode 参数（类型定义保留）', async () => {
      mockAdapter.post.mockResolvedValue({
        token: 'mock-token',
        refreshToken: 'mock-refresh-token',
      })

      // 虽然验证码已禁用，但类型定义仍保留可选参数
      // 这允许未来需要时恢复验证码功能
      await fetchLogin({
        account: 'testuser',
        password: 'password123',
        captchaKey: 'optional-key',
        captchaCode: 'optional-code',
      })

      const calledParams = mockAdapter.post.mock.calls[0][1]
      expect(calledParams.captchaKey).toBe('optional-key')
      expect(calledParams.captchaCode).toBe('optional-code')
    })
  })

  describe('fetchTestLogin - 测试登录接口', () => {
    it('应正确调用 POST /api/auth/test-login', async () => {
      mockAdapter.post.mockResolvedValue({
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      })

      await fetchTestLogin({
        account: 'testuser',
        password: 'password123',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/test-login',
        expect.objectContaining({
          account: 'testuser',
          password: 'password123',
        })
      )
    })
  })

  describe('fetchRegister - 注册接口', () => {
    it('应正确调用 POST /api/auth/register', async () => {
      mockAdapter.post.mockResolvedValue({
        id: 'new-user-id',
        username: 'newuser',
        email: 'new@example.com',
        phone: '13800138000',
        token: 'new-token',
        refreshToken: 'new-refresh-token',
      })

      const result = await fetchRegister({
        phone: '13800138000',
        password: 'Test1234',
        autoLogin: false,
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          phone: '13800138000',
          password: 'Test1234',
          autoLogin: false,
        })
      )
      expect(result.id).toBe('new-user-id')
    })

    it('注册参数不应包含验证码参数（验证码已禁用）', async () => {
      mockAdapter.post.mockResolvedValue({
        id: 'new-user-id',
        token: 'new-token',
      })

      await fetchRegister({
        phone: '13800138000',
        password: 'Test1234',
      })

      const calledParams = mockAdapter.post.mock.calls[0][1]
      expect(calledParams).not.toHaveProperty('captchaKey')
      expect(calledParams).not.toHaveProperty('captchaCode')
    })

    it('支持可选的 captchaKey 和 captchaCode 参数（类型定义保留）', async () => {
      mockAdapter.post.mockResolvedValue({
        id: 'new-user-id',
        token: 'new-token',
      })

      await fetchRegister({
        phone: '13800138000',
        password: 'Test1234',
        captchaKey: 'optional-key',
        captchaCode: 'optional-code',
      })

      const calledParams = mockAdapter.post.mock.calls[0][1]
      expect(calledParams.captchaKey).toBe('optional-key')
      expect(calledParams.captchaCode).toBe('optional-code')
    })
  })

  describe('fetchLogout - 登出接口', () => {
    it('应正确调用 POST /api/auth/logout', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchLogout()

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/auth/logout')
    })
  })

  describe('fetchRefresh - Token 刷新接口', () => {
    it('应正确调用 POST /api/auth/refresh', async () => {
      mockAdapter.post.mockResolvedValue({
        token: 'refreshed-token',
        refreshToken: 'refreshed-refresh-token',
      })

      const result = await fetchRefresh()

      expect(mockAdapter.post).toHaveBeenCalledWith('/api/auth/refresh')
      expect(result.token).toBe('refreshed-token')
    })
  })

  describe('fetchRefreshToken - 自定义 Token 刷新接口', () => {
    it('应正确调用 POST /api/auth/refresh-token 并传递 refreshToken', async () => {
      mockAdapter.post.mockResolvedValue({
        token: 'new-token',
        refreshToken: 'new-refresh-token',
      })

      await fetchRefreshToken('old-refresh-token')

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/refresh-token',
        { refreshToken: 'old-refresh-token' }
      )
    })
  })

  describe('fetchCaptcha - 图形验证码接口', () => {
    it('应正确调用 GET /api/auth/captcha', async () => {
      mockAdapter.get.mockResolvedValue({
        key: 'captcha-key-123',
        image: 'data:image/png;base64,...',
      })

      const result = await fetchCaptcha()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/auth/captcha')
      expect(result.key).toBe('captcha-key-123')
      expect(result.image).toBe('data:image/png;base64,...')
    })

    it('应支持 captchaKey 和 captchaImage 字段（向后兼容）', async () => {
      mockAdapter.get.mockResolvedValue({
        captchaKey: 'alt-key-format',
        captchaImage: 'data:image/png;base64,...',
      })

      const result = await fetchCaptcha()

      expect(result.captchaKey).toBe('alt-key-format')
      expect(result.captchaImage).toBe('data:image/png;base64,...')
    })
  })

  describe('fetchEmailCaptcha - 邮箱验证码接口', () => {
    it('应正确调用 POST /api/auth/captcha/email', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchEmailCaptcha('test@example.com')

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/captcha/email',
        { email: 'test@example.com' }
      )
    })
  })

  describe('fetchResetPassword - 重置密码接口', () => {
    it('应正确调用 POST /api/auth/password/reset', async () => {
      mockAdapter.post.mockResolvedValue(undefined)

      await fetchResetPassword({
        email: 'test@example.com',
        captchaCode: '123456',
        newPassword: 'NewPass123',
      })

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/password/reset',
        {
          email: 'test@example.com',
          captchaCode: '123456',
          newPassword: 'NewPass123',
        }
      )
    })
  })

  describe('fetchGetUserInfo - 获取用户信息接口', () => {
    it('应正确调用 GET /api/auth/me', async () => {
      const mockUserInfo = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        phone: '13800138000',
        avatar: 'https://example.com/avatar.png',
        roles: ['admin'],
      }
      mockAdapter.get.mockResolvedValue(mockUserInfo)

      const result = await fetchGetUserInfo()

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/auth/me')
      expect(result.id).toBe('user-123')
      expect(result.username).toBe('testuser')
    })
  })

  describe('fetchUpdateProfile - 更新用户资料接口', () => {
    it('应正确调用 PUT /api/auth/profile', async () => {
      mockAdapter.put.mockResolvedValue({
        token: 'updated-token',
      })

      await fetchUpdateProfile({
        username: 'newname',
        email: 'new@example.com',
      })

      expect(mockAdapter.put).toHaveBeenCalledWith(
        '/api/auth/profile',
        expect.objectContaining({
          username: 'newname',
          email: 'new@example.com',
        })
      )
    })
  })

  describe('fetchUploadAvatar - 上传头像接口', () => {
    it('应正确调用 POST /api/auth/avatar 并使用 FormData', async () => {
      const mockFile = new File(['test'], 'avatar.png', { type: 'image/png' })
      mockAdapter.post.mockResolvedValue({
        userId: 'user-123',
        avatar: 'https://example.com/new-avatar.png',
      })

      await fetchUploadAvatar(mockFile)

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/avatar',
        expect.any(FormData)
      )
    })
  })

  describe('fetchGetAvatar - 获取头像接口', () => {
    it('应正确调用 GET /api/auth/avatar/:userId', async () => {
      mockAdapter.get.mockResolvedValue({
        userId: 'user-123',
        avatar: 'https://example.com/avatar.png',
        mediaType: 'image/png',
      })

      const result = await fetchGetAvatar('user-123')

      expect(mockAdapter.get).toHaveBeenCalledWith('/api/auth/avatar/user-123')
      expect(result.userId).toBe('user-123')
    })
  })

  describe('fetchGetPermissions - 获取权限接口', () => {
    it('应正确调用 GET /api/auth/permissions', async () => {
      mockAdapter.get.mockResolvedValue({
        userId: 'user-123',
        username: 'testuser',
        roleGroup: 'admin',
        permissions: [],
        teamInfo: { teamId: 'team-1', teamName: 'Test Team' },
      })

      const result = await fetchGetPermissions()

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/auth/permissions',
        undefined
      )
      expect(result.teamInfo.teamId).toBe('team-1')
    })

    it('应支持传递 teamId 参数', async () => {
      mockAdapter.get.mockResolvedValue({
        userId: 'user-123',
        permissions: [],
        teamInfo: { teamId: 'team-2', teamName: 'Team 2' },
      })

      await fetchGetPermissions('team-2')

      expect(mockAdapter.get).toHaveBeenCalledWith(
        '/api/auth/permissions',
        { teamId: 'team-2' }
      )
    })
  })

  describe('fetchRedeemPlatformCode - 兑换码接口', () => {
    it('应正确调用 POST /api/auth/redeem-code', async () => {
      mockAdapter.post.mockResolvedValue({
        success: true,
        message: '兑换成功',
      })

      const result = await fetchRedeemPlatformCode('CODE123456')

      expect(mockAdapter.post).toHaveBeenCalledWith(
        '/api/auth/redeem-code',
        { code: 'CODE123456' }
      )
      expect(result.success).toBe(true)
    })
  })
})

describe('认证 API 类型验证', () => {
  it('LoginResponse 应包含必要的 Token 字段', () => {
    const response: Api.Auth.LoginResponse = {
      token: 'token',
      refreshToken: 'refreshToken',
      tokenType: 'Bearer',
      expiresIn: 3600,
      refreshExpiresIn: 604800,
      userId: 'user-123',
      username: 'testuser',
      avatar: 'https://example.com/avatar.png',
      email: 'test@example.com',
    }

    expect(response.token).toBeDefined()
    expect(response.refreshToken).toBeDefined()
    expect(response.userId).toBeDefined()
  })

  it('RegisterResponse 应包含 token 字段（当 autoLogin 为 true 时）', () => {
    const response: Api.Auth.RegisterResponse = {
      id: 'user-123',
      username: 'newuser',
      email: 'new@example.com',
      phone: '13800138000',
      avatar: '',
      status: 1,
      createTime: '2026-01-01',
      updateTime: '2026-01-01',
      roles: ['user'],
      token: 'token-when-auto-login',
      refreshToken: 'refresh-token-when-auto-login',
    }

    expect(response.token).toBeDefined()
    expect(response.refreshToken).toBeDefined()
  })

  it('CaptchaResponse 应支持多种字段格式（向后兼容）', () => {
    // 标准格式
    const response1: Api.Auth.CaptchaResponse = {
      key: 'key1',
      image: 'data:image/png;base64,...',
    }
    expect(response1.key).toBe('key1')

    // 兼容格式
    const response2: Api.Auth.CaptchaResponse = {
      key: 'key2',
      image: 'data:image/png;base64,...',
      captchaKey: 'alt-key',
      captchaImage: 'alt-image',
    }
    expect(response2.captchaKey).toBe('alt-key')
  })

  it('UserInfo 应支持可选字段', () => {
    const userInfo: Api.Auth.UserInfo = {
      id: 'user-123',
      username: 'testuser',
    }

    expect(userInfo.id).toBe('user-123')
    expect(userInfo.email).toBeUndefined()
    expect(userInfo.roles).toBeUndefined()
  })
})
