import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { Ref } from 'vue'
import { createDefaultOnError, type MutationErrorOptions } from '@/utils/data-flow/mutation-error'

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
    /** 默认错误处理配置：传入后会先应用默认处理器，再调用自定义 onError */
    errorOptions?: MutationErrorOptions
  }
) {
  const queryClient = useQueryClient()

  // 构造合并后的 onError：默认错误处理 + 自定义 onError
  const defaultOnError = options?.errorOptions
    ? createDefaultOnError(options.errorOptions)
    : null
  const userOnError = options?.onError
  const mergedOnError =
    defaultOnError || userOnError
      ? (error: any, variables: TVariables) => {
          if (defaultOnError) defaultOnError(error, variables)
          if (userOnError) userOnError(error, variables)
        }
      : undefined

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
    onError: mergedOnError
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
