import { getApiAdapter } from './adapter'

export function fetchLogin(params: Api.Auth.LoginParams) {
  return getApiAdapter().post<Api.Auth.LoginResponse>('/api/auth/login', params)
}

export function fetchTestLogin(params: Api.Auth.LoginParams) {
  return getApiAdapter().post<Api.Auth.LoginResponse>('/api/auth/test-login', params)
}

export function fetchRegister(params: Api.Auth.RegisterParams) {
  return getApiAdapter().post<Api.Auth.RegisterResponse>('/api/auth/register', params)
}

export function fetchLogout() {
  return getApiAdapter().post<void>('/api/auth/logout')
}

export function fetchRefresh() {
  return getApiAdapter().post<Api.Auth.LoginResponse>('/api/auth/refresh')
}

export function fetchRefreshToken(refreshToken: string) {
  return getApiAdapter().post<Api.Auth.LoginResponse>('/api/auth/refresh-token', {
    refreshToken
  })
}

export function fetchCaptcha() {
  return getApiAdapter().get<Api.Auth.CaptchaResponse>('/api/auth/captcha')
}

export function fetchEmailCaptcha(email: string) {
  return getApiAdapter().post<void>('/api/auth/captcha/email', { email })
}

export function fetchResetPassword(params: Api.Auth.ResetPasswordParams) {
  return getApiAdapter().post<void>('/api/auth/password/reset', params)
}

export function fetchGetUserInfo() {
  return getApiAdapter().get<Api.Auth.UserInfo>('/api/auth/me')
}

export function fetchUpdateProfile(params: Api.Auth.UpdateProfileParams) {
  return getApiAdapter().put<Api.Auth.LoginResponse>('/api/auth/profile', params)
}

export function fetchUploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return getApiAdapter().post<Api.Auth.UserInfo>('/api/auth/avatar', formData)
}

export function fetchGetAvatar(userId: string) {
  return getApiAdapter().get<Api.Auth.AvatarInfo>(`/api/auth/avatar/${userId}`)
}

export function fetchGetAvatarFile() {
  return getApiAdapter().get<Blob>('/api/auth/avatar/file', undefined, {
    responseType: 'blob'
  })
}

export function fetchGetPermissions(teamId?: string) {
  return getApiAdapter().get<Api.Auth.PermissionInfo>(
    '/api/auth/permissions',
    teamId ? { teamId } : undefined
  )
}

export function fetchRedeemPlatformCode(code: string) {
  return getApiAdapter().post<{ success: boolean; message: string }>('/api/auth/redeem-code', {
    code
  })
}
