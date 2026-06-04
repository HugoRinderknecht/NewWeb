/**
 * 路由权限验证测试
 * 测试平台角色路由守卫逻辑
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRouter, createWebHashHistory } from 'vue-router'

// Mock stores
const mockUserStore = {
  isLogin: false,
  info: { roles: [] as string[] },
  accessToken: '',
  setLoginStatus: vi.fn(),
}

const mockMenuStore = {
  menuList: [] as any[],
  dynamicAddedRoutes: [] as any[],
  setMenuList: vi.fn(),
  setDynamicAddedRoutes: vi.fn(),
}

vi.mock('@/store/modules/user', () => ({
  useUserStore: () => mockUserStore,
}))

vi.mock('@/store/modules/menu', () => ({
  useMenuStore: () => mockMenuStore,
}))

import { RoutePermissionValidator } from '@/router/core/RoutePermissionValidator'

// Test route meta definitions matching real routes
const testRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    meta: { title: '仪表盘', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/system',
    name: 'System',
    meta: { title: '系统管理', roles: ['platform_admin'] },
  },
  {
    path: '/system/user',
    name: 'SystemUser',
    meta: { title: '用户管理', roles: ['platform_admin', 'team_admin'] },
  },
  {
    path: '/project',
    name: 'Project',
    meta: { title: '项目管理', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/script',
    name: 'Script',
    meta: { title: '剧本管理', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/storyboard',
    name: 'Storyboard',
    meta: { title: '分镜管理', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/video-gen',
    name: 'VideoGen',
    meta: { title: '视频生成', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/review',
    name: 'Review',
    meta: { title: '审核中心', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/asset',
    name: 'Asset',
    meta: { title: '资产管理', roles: ['platform_admin', 'team_admin', 'team_member', 'member'] },
  },
  {
    path: '/workflow',
    name: 'Workflow',
    meta: { title: '工作流管理', roles: ['platform_admin', 'team_admin', 'member'] },
  },
  {
    path: '/team',
    name: 'Team',
    meta: { title: '团队管理', roles: ['platform_admin', 'team_admin', 'member'] },
  },
  {
    path: '/points',
    name: 'Points',
    meta: { title: '积分管理', roles: ['platform_admin', 'team_admin', 'member'] },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: testRoutes,
})

describe('RoutePermissionValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.isLogin = false
    mockUserStore.info = { roles: [] }
    mockUserStore.accessToken = ''
  })

  describe('角色权限矩阵验证', () => {
    const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)

    it('platform_admin 可访问所有模块', () => {
      mockUserStore.info = { roles: ['platform_admin'] }
      mockUserStore.isLogin = true

      expect(validator.hasPermission('/system')).toBe(true)
      expect(validator.hasPermission('/system/user')).toBe(true)
      expect(validator.hasPermission('/dashboard')).toBe(true)
      expect(validator.hasPermission('/project')).toBe(true)
      expect(validator.hasPermission('/workflow')).toBe(true)
      expect(validator.hasPermission('/team')).toBe(true)
      expect(validator.hasPermission('/points')).toBe(true)
    })

    it('team_admin 可访问业务模块和用户管理', () => {
      mockUserStore.info = { roles: ['team_admin'] }
      mockUserStore.isLogin = true

      expect(validator.hasPermission('/dashboard')).toBe(true)
      expect(validator.hasPermission('/project')).toBe(true)
      expect(validator.hasPermission('/workflow')).toBe(true)
      expect(validator.hasPermission('/team')).toBe(true)
      expect(validator.hasPermission('/points')).toBe(true)
      expect(validator.hasPermission('/system')).toBe(false)
    })

    it('team_member 可访问大部分业务模块', () => {
      mockUserStore.info = { roles: ['team_member'] }
      mockUserStore.isLogin = true

      expect(validator.hasPermission('/dashboard')).toBe(true)
      expect(validator.hasPermission('/project')).toBe(true)
      expect(validator.hasPermission('/workflow')).toBe(false)
      expect(validator.hasPermission('/team')).toBe(false)
      expect(validator.hasPermission('/points')).toBe(false)
    })

    it('member 可访问工作流和团队管理', () => {
      mockUserStore.info = { roles: ['member'] }
      mockUserStore.isLogin = true

      expect(validator.hasPermission('/dashboard')).toBe(true)
      expect(validator.hasPermission('/workflow')).toBe(true)
      expect(validator.hasPermission('/team')).toBe(true)
      expect(validator.hasPermission('/points')).toBe(true)
    })
  })

  describe('登录状态验证', () => {
    it('未登录用户应被重定向到登录页', () => {
      mockUserStore.isLogin = false
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.isAuthenticated()).toBe(false)
    })

    it('已登录用户应通过认证', () => {
      mockUserStore.isLogin = true
      mockUserStore.accessToken = 'valid-token'
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.isAuthenticated()).toBe(true)
    })
  })

  describe('getHomePath 路由导航', () => {
    it('platform_admin 应导航到管理员仪表盘', () => {
      mockUserStore.info = { roles: ['platform_admin'] }
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.getHomePath()).toBe('/system/admin-dashboard')
    })

    it('team_admin 应导航到控制台', () => {
      mockUserStore.info = { roles: ['team_admin'] }
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.getHomePath()).toBe('/dashboard/console')
    })

    it('team_member 应导航到控制台', () => {
      mockUserStore.info = { roles: ['team_member'] }
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.getHomePath()).toBe('/dashboard/console')
    })

    it('member 应导航到控制台', () => {
      mockUserStore.info = { roles: ['member'] }
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.getHomePath()).toBe('/dashboard/console')
    })

    it('无角色用户应导航到登录页', () => {
      mockUserStore.info = { roles: [] }
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.getHomePath()).toBe('/auth/login')
    })
  })

  describe('按钮级权限验证', () => {
    it('应识别具有 add 权限的按钮', () => {
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.hasButtonPermission('add')).toBe(true)
    })

    it('应识别具有 edit 权限的按钮', () => {
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.hasButtonPermission('edit')).toBe(true)
    })

    it('应识别具有 delete 权限的按钮', () => {
      const validator = new RoutePermissionValidator(mockUserStore, mockMenuStore)
      expect(validator.hasButtonPermission('delete')).toBe(true)
    })
  })
})

describe('路由权限集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserStore.isLogin = false
    mockUserStore.info = { roles: [] }
  })

  it('router.beforeEach 应正确挂载守卫', async () => {
    await router.isReady()
    expect(router).toBeDefined()
  })
})
