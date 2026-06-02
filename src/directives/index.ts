import type { App } from 'vue'
import { setupAuthDirective, type AuthDirective } from './core/auth'
import { setupHighlightDirective, type HighlightDirective } from './business/highlight'
import { setupRippleDirective, type RippleDirective } from './business/ripple'
import { setupRolesDirective, type RolesDirective } from './core/roles'
import lazyLoad from './lazyLoad'

export function setupGlobDirectives(app: App) {
  setupAuthDirective(app) // 权限指令
  setupRolesDirective(app) // 角色权限指令
  setupHighlightDirective(app) // 高亮指令
  setupRippleDirective(app) // 水波纹指令
  app.directive('lazy', lazyLoad) // 图片懒加载指令
}

export type { AuthDirective, HighlightDirective, RippleDirective, RolesDirective }
