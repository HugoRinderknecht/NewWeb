/**
 * 团队领域 ViewModel 类型定义
 *
 * 面向团队页面 UI 展示的类型，与后端 DTO 解耦。
 * 复用现有 team.transformer.ts 的标准化逻辑。
 *
 * @module domain/team/types
 */

/** 团队成员状态（前端语义） */
export type MemberStatus = 'active' | 'pending' | 'disabled'

/** 加入方式 */
export type JoinType = 'invite' | 'apply'

/** 团队成员 ViewModel */
export interface TeamMemberViewModel {
  id: string
  name: string
  email: string
  avatar: string
  roles: string[]
  department: string
  joinType: JoinType
  joinTime: string
  status: MemberStatus
}

/** 管理员成员 ViewModel */
export interface AdminMemberViewModel {
  userId: string
  username: string
  role: string
  joinTime: string
}

/** 角色选项 ViewModel */
export interface RoleOptionViewModel {
  label: string
  value: string
}

/** 团队成员表单 Model */
export interface TeamMemberFormModel {
  userId: string
  role: string
}
