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

import { authKeys } from './keys'

/** 当前用户信息 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.userInfo(),
    queryFn: async () => await fetchGetUserInfo(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}

/** 用户头像 */
export function useAvatar(userId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: authKeys.avatar(userId),
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
    queryKey: authKeys.permissions(teamId),
    queryFn: async () => await fetchGetPermissions(toValue(teamId)),
    staleTime: 5 * 60 * 1000
  })
}

/** 验证码 */
export function useCaptcha() {
  return useQuery({
    queryKey: authKeys.captcha(),
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
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() })
    }
  })
}

/** 上传头像 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => fetchUploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() })
    }
  })
}
