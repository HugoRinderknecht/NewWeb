/**
 * Vitest 测试全局设置
 * 提供 mock 全局变量、自动清理、路由 mock 等基础设施
 */
import { vi } from 'vitest'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue(true),
    alert: vi.fn(),
    prompt: vi.fn(),
    confirmButtonText: '',
    cancelButtonText: '',
  },
  ElNotification: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({
    path: '/',
    name: 'home',
    params: {},
    query: {},
    meta: {},
    matched: [],
    fullPath: '/',
    redirectedFrom: undefined,
    hash: '',
  }),
  createRouter: vi.fn(() => mockRouter),
  createWebHashHistory: vi.fn(),
  createWebHistory: vi.fn(),
  RouterView: {},
  RouterLink: {},
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(),
}))

// Mock SVG elements
const svgs = ['svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon']
svgs.forEach(() => {
  HTMLElement.prototype.getAttribute = HTMLElement.prototype.getAttribute || vi.fn()
})

// Mock crypto
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => `mock-uuid-${Math.random().toString(36).substring(2, 11)}`,
      getRandomValues: (arr: any) => {
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
        return arr
      },
    },
  })
}

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url')
URL.revokeObjectURL = vi.fn()

// Global test timeout
vi.setConfig({ testTimeout: 10000 })
