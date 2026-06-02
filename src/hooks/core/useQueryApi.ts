import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'

export function useApiQuery<TData>(
  queryKey: Ref<any[]> | any[],
  queryFn: () => Promise<TData>,
  options?: any
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options
  })
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateKeys?: any[][]
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: any, variables: TVariables) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables)
    }
  })
}

export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  return (keys: any[][]) => {
    keys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key })
    })
  }
}
