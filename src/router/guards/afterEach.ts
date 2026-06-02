import { nextTick } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import { Router, RouteLocationNormalized } from 'vue-router'
import NProgress from 'nprogress'
import { useCommon } from '@/hooks/core/useCommon'
import { loadingService } from '@/utils/ui'
import { getPendingLoading, resetPendingLoading } from './beforeEach'

const routeModuleMap: Record<string, string[]> = {
  '/dashboard': ['/project', '/script'],
  '/project': ['/script', '/storyboard'],
  '/script': ['/storyboard', '/video-gen'],
  '/storyboard': ['/video-gen', '/editor'],
  '/video-gen': ['/editor', '/review'],
  '/review': ['/asset', '/ai-process'],
  '/asset': ['/ai-process', '/data-history'],
  '/ai-process': ['/data-history', '/workflow'],
  '/workflow': ['/team', '/points'],
  '/team': ['/points', '/notice'],
  '/points': ['/notice', '/settings'],
  '/notice': ['/settings', '/system'],
  '/settings': ['/system'],
  '/system': ['/dashboard']
}

let prefetchedRoutes = new Set<string>()

function prefetchRoutes(currentPath: string) {
  const relatedPaths = routeModuleMap[currentPath]
  if (!relatedPaths) return

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      relatedPaths.forEach((path) => {
        if (!prefetchedRoutes.has(path)) {
          prefetchedRoutes.add(path)
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = path
          document.head.appendChild(link)
        }
      })
    })
  }
}

export function setupAfterEachGuard(router: Router) {
  const { scrollToTop } = useCommon()

  router.afterEach((to: RouteLocationNormalized) => {
    scrollToTop()

    const settingStore = useSettingStore()
    if (settingStore.showNprogress) {
      NProgress.done()
      setTimeout(() => {
        NProgress.remove()
      }, 600)
    }

    if (getPendingLoading()) {
      nextTick(() => {
        loadingService.hideLoading()
        resetPendingLoading()
      })
    }

    prefetchRoutes(to.path)
  })
}
