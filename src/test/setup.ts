/**
 * 测试环境全局 setup
 *
 * - 挂载 Pinia 测试实例
 * - 模拟 vue-router
 * - 抑制 console.warn 中已知的 Element Plus 无害警告
 */
import { setActivePinia, createPinia } from 'pinia'
import { vi } from 'vitest'

// 每个测试前创建全新 Pinia 实例
beforeEach(() => {
  setActivePinia(createPinia())
})

// 模拟 vue-router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn()
  })),
  createWebHashHistory: vi.fn(),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    path: '/',
    meta: {}
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn()
  })),
  onBeforeRouteLeave: vi.fn(),
  onBeforeRouteUpdate: vi.fn()
}))

// 模拟项目路由模块，避免初始化时依赖 DOM
vi.mock('@/router', () => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn()
  }
}))

// 抑制 Element Plus 的已知无害警告
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  const msg = String(args[0])
  if (msg.includes('[ElForm]') || msg.includes('[ElPopper]')) return
  originalWarn.apply(console, args)
}
