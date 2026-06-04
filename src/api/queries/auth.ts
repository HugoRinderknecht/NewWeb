import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type MaybeRefOrGetter } from 'vue'
import {
  fetchGetUserInfo,
  fetchUpdateProfile,
  fetchUploadAvatar,
  fetchGetAvatar,
  fetchGetPermissions,
  fetchCaptcha
} from '@/api/auth'

const QUERY_KEY = 'auth' as const

/** 当前用户信息 */
export function useCurrentUser() {
  return useQuery({
    queryKey: [QUERY_KEY, 'user-info'] as const,
    queryFn: async () => await fetchGetUserInfo(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}

/** 用户头像 */
export function useAvatar(userId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'avatar', userId] as const,
    queryFn: async () => {
      const id = toValue(userId)
      if (!id) return null
      return await fetchGetAvatar(id)
    },
    enabled: () => !!toValue(userId),
    staleTime: 60 * 1000
  })
}

/** 权限信息 */
export function usePermissions(teamId?: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: [QUERY_KEY, 'permissions', teamId] as const,
    queryFn: async () => await fetchGetPermissions(toValue(teamId)),
    staleTime: 5 * 60 * 1000
  })
}

/** 验证码 */
export function useCaptcha() {
  return useQuery({
    queryKey: [QUERY_KEY, 'captcha'] as const,
    queryFn: async () => await fetchCaptcha(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  })
}

/** 更新个人资料 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (params: Api.Auth.UpdateProfileParams) => fetchUpdateProfile(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'user-info'] })
    }
  })
}

/** 上传头像 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => fetchUploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'user-info'] })
    }
  })
}
