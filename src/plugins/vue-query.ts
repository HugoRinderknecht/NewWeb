import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { VUE_QUERY_DEFAULT_STALE_TIME, VUE_QUERY_DEFAULT_GC_TIME } from '@/config/cache-policy'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: VUE_QUERY_DEFAULT_STALE_TIME,
      gcTime: VUE_QUERY_DEFAULT_GC_TIME
    }
  }
})

export const setupVueQuery = (app: any) => {
  app.use(VueQueryPlugin, { queryClient })
}

export { queryClient }
