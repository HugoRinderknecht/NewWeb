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
import { useUserStore } from '@/store/modules/user'

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
  const userStore = useUserStore()
  return useMutation({
    mutationFn: (params: Api.Auth.UpdateProfileParams) => fetchUpdateProfile(params),
    onSuccess: (data) => {
      // 文档 §1.6：用户名变更时后端会重新签发 Token，需同步写回 store
      if (data?.token) {
        const nextRefreshToken = data.refreshToken ?? userStore.refreshToken
        userStore.setToken(data.token, nextRefreshToken)
      }
      queryClient.invalidateQueries({ queryKey: authKeys.userInfo() })
      // 角色/团队上下文可能受用户名变更影响，主动失效权限缓存
      queryClient.invalidateQueries({ queryKey: authKeys.permissions() })
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
