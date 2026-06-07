import { getApiAdapter } from './adapter'

export function fetchLogin(params: Api.Auth.LoginParams) {
  return getApiAdapter().post<Api.Auth.LoginResponse>('/api/auth/login', params)
}

/** 测试登录（仅 captcha.enabled=false 时可用） */
export function fetchTestLogin(params: Api.Auth.LoginParams) {
  return getApiAdapter().post<Api.Auth.LoginResponse>('/api/auth/test-login', params)
}

export function fetchRegister(params: Api.Auth.RegisterParams) {
  return getApiAdapter().post<Api.Auth.RegisterResponse>('/api/auth/register', params)
}

export function fetchLogout() {
  return getApiAdapter().post<void>('/api/auth/logout')
}

/**
 * 在已登录态主动刷新 AccessToken（需 JWT 认证）
 *
 * ⚠️ 警告：此接口仅用于业务页面主动续期场景；
 * HTTP 层 401 自动刷新使用的是 `/api/auth/refresh-token`（无需登录），
 * 请勿在拦截器中误用该函数。
 *
 * 文档 §1.10：返回 LoginVO，但其中 refreshToken 字段为 null（不会轮换刷新令牌）
 */
export function fetchRefresh() {
  return getApiAdapter().post<Api.Auth.RefreshResponse>('/api/auth/refresh')
}

/**
 * 基于 RefreshToken 刷新（无需登录）
 * 文档 §1.11：返回新的 AccessToken + RefreshToken 对
 */
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

/**
 * 修改用户信息
 * 文档 §1.6：用户名变更时会重新签发 Token（返回值含新 token/refreshToken）
 */
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

/**
 * ⚠️ 该端点未在 docs/api-overview.md 中列出，可能为平台定制接口。
 * 由 onboarding-dialog 业务使用。请与后端核对后决定是否迁移或保留。
 */
export function fetchRedeemPlatformCode(code: string) {
  return getApiAdapter().post<{ success: boolean; message: string }>('/api/auth/redeem-code', {
    code
  })
}
