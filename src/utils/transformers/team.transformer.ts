/**
 * 团队成员数据转换器
 *
 * 负责将后端返回的原始数据转换为前端标准格式，
 * 统一处理字段兼容性和数据规范化。
 *
 * @module utils/transformers/team.transformer
 */

function firstDefined<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

function normalizeStatus(status?: number | string): 'active' | 'pending' | 'disabled' {
  if (status === 1 || status === '1' || status === 'active') return 'active'
  if (status === 0 || status === '0' || status === 'pending') return 'pending'
  return 'disabled'
}

function normalizeRoles(raw: Api.Team.TeamMemberRawVO): string[] {
  if (raw.roleNames?.length) return raw.roleNames
  if (raw.roleName) return [raw.roleName]
  if (raw.role) return [raw.role]
  return []
}

export function transformTeamMember(
  raw: Api.Team.TeamMemberRawVO
): Api.Team.TeamMemberDisplayVO {
  return {
    id: firstDefined(raw.memberId, raw.userId, raw.id) || '',
    name: firstDefined(raw.userName, raw.nickname) || '',
    email: raw.email || '',
    avatar: raw.avatar || '',
    roles: normalizeRoles(raw),
    department: raw.department || '',
    joinType: raw.joinType === 'invite' ? 'invite' : 'apply',
    joinTime: raw.joinTime || '',
    status: normalizeStatus(raw.status)
  }
}

export function transformTeamMemberList(
  rawList: Api.Team.TeamMemberRawVO[] | undefined | null
): Api.Team.TeamMemberDisplayVO[] {
  return (rawList || []).map(transformTeamMember)
}

export function transformAdminMember(
  raw: Api.PlatformAdmin.AdminMemberListItem
): Api.PlatformAdmin.AdminMemberDisplayVO {
  return {
    userId: raw.userId || '',
    username: raw.userName || '',
    role: raw.role || '',
    joinTime: raw.joinTime || ''
  }
}

export function transformAdminMemberList(
  rawList: Api.PlatformAdmin.AdminMemberListItem[] | undefined | null
): Api.PlatformAdmin.AdminMemberDisplayVO[] {
  return (rawList || []).map(transformAdminMember)
}

export function transformRoleOption(
  raw: Api.Team.TeamRoleVO
): { label: string; value: string } {
  return {
    label: raw.name || '',
    value: raw.id || ''
  }
}

export function transformRoleOptions(
  rawList: Api.Team.TeamRoleVO[] | undefined | null
): { label: string; value: string }[] {
  return (rawList || []).map(transformRoleOption)
}
