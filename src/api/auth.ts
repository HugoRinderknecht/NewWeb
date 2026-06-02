import request from '@/utils/http'

export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
  })
}

export function fetchTestLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/test-login',
    params
  })
}

export function fetchRegister(params: Api.Auth.RegisterParams) {
  return request.post<Api.Auth.RegisterResponse>({
    url: '/api/auth/register',
    params
  })
}

export function fetchLogout() {
  return request.post<void>({
    url: '/api/auth/logout'
  })
}

export function fetchRefresh() {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/refresh'
  })
}

export function fetchRefreshToken(refreshToken: string) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/refresh-token',
    params: { refreshToken }
  })
}

export function fetchCaptcha() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/api/auth/captcha'
  })
}

export function fetchEmailCaptcha(email: string) {
  return request.post<void>({
    url: '/api/auth/captcha/email',
    params: { email }
  })
}

export function fetchResetPassword(params: Api.Auth.ResetPasswordParams) {
  return request.post<void>({
    url: '/api/auth/password/reset',
    params
  })
}

export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/auth/me'
  })
}

export function fetchUpdateProfile(params: Api.Auth.UpdateProfileParams) {
  return request.put<Api.Auth.LoginResponse>({
    url: '/api/auth/profile',
    params
  })
}

export function fetchUploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<Api.Auth.UserInfo>({
    url: '/api/auth/avatar',
    params: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function fetchGetAvatar(userId: string) {
  return request.get<Api.Auth.AvatarInfo>({
    url: `/api/auth/avatar/${userId}`
  })
}

export function fetchGetAvatarFile() {
  return request.get<Blob>({
    url: '/api/auth/avatar/file',
    responseType: 'blob'
  } as any)
}

export function fetchGetPermissions(teamId?: string) {
  return request.get<Api.Auth.PermissionInfo>({
    url: '/api/auth/permissions',
    params: teamId ? { teamId } : undefined
  })
}

export function fetchRedeemPlatformCode(code: string) {
  return request.post<{ success: boolean; message: string }>({
    url: '/api/auth/redeem-code',
    params: { code }
  })
}
