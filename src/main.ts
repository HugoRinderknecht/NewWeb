import App from './App.vue'
import { createApp } from 'vue'
import { initStore } from './store'
import { initRouter } from './router'
import { setupVueQuery } from './plugins/vue-query'
import '@styles/core/tailwind.css'
import '@styles/index.scss'
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import { dataFlowBus } from './utils/data-flow'
import { initWebVitals } from './utils/sys/web-vitals'
import { queryClient } from './plugins/vue-query'
import { fetchGetProjectList } from '@/api/project'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: true }
)

async function bootstrap() {
  const app = createApp(App)
  initStore(app)
  setupVueQuery(app)
  initRouter(app)
  setupGlobDirectives(app)
  setupErrorHandle(app)

  app.mount('#app')

  queryClient.fetchQuery({
    queryKey: ['projects', 'list', undefined] as const,
    queryFn: async () => {
      const res = await fetchGetProjectList(undefined as any)
      return res ?? null
    }
  })

  dataFlowBus.init().catch((err) => {
    console.error('[DataFlow] 初始化失败:', err)
  })

  initWebVitals()
}

bootstrap()
