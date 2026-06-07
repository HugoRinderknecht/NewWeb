/**
 * 团队领域 DTO → ViewModel 映射函数
 *
 * 纯函数，不依赖 Vue 响应式。
 * 迁移自 src/utils/transformers/team.transformer.ts，逻辑完全一致。
 *
 * @module domain/team/mappers
 */

import type {
  TeamMemberViewModel,
  AdminMemberViewModel,
  RoleOptionViewModel,
  MemberStatus,
  JoinType
} from './types'

function firstDefined<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v
  }
  return undefined
}

function normalizeStatus(status?: number | string): MemberStatus {
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

/**
 * 将团队成员原始 DTO 映射为 ViewModel
 */
export function mapTeamMember(raw: Api.Team.TeamMemberRawVO): TeamMemberViewModel {
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

/**
 * 将团队成员列表映射
 */
export function mapTeamMemberList(
  rawList: Api.Team.TeamMemberRawVO[] | undefined | null
): TeamMemberViewModel[] {
  return (rawList || []).map(mapTeamMember)
}

/**
 * 将管理员成员 DTO 映射为 ViewModel
 */
export function mapAdminMember(raw: Api.PlatformAdmin.AdminMemberListItem): AdminMemberViewModel {
  return {
    userId: raw.userId || '',
    username: raw.userName || '',
    role: raw.role || '',
    joinTime: raw.joinTime || ''
  }
}

/**
 * 将管理员成员列表映射
 */
export function mapAdminMemberList(
  rawList: Api.PlatformAdmin.AdminMemberListItem[] | undefined | null
): AdminMemberViewModel[] {
  return (rawList || []).map(mapAdminMember)
}

/**
 * 将团队角色 DTO 映射为选项 ViewModel
 */
export function mapRoleOption(raw: Api.Team.TeamRoleVO): RoleOptionViewModel {
  return {
    label: raw.name || '',
    value: raw.id || ''
  }
}

/**
 * 将团队角色列表映射为选项列表
 */
export function mapRoleOptions(
  rawList: Api.Team.TeamRoleVO[] | undefined | null
): RoleOptionViewModel[] {
  return (rawList || []).map(mapRoleOption)
}
