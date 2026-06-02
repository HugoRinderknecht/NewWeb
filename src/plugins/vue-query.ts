import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    }
  }
})

export const setupVueQuery = (app: any) => {
  app.use(VueQueryPlugin, { queryClient })
}

export { queryClient }
