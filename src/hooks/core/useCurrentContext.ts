/**
 * useCurrentContext - 统一业务上下文 Hook
 *
 * 提供当前业务上下文（projectId、teamId 等）的只读访问，
 * 遵循状态来源优先级：Route > Vue Query > Pinia。
 *
 * ## 设计原则
 *
 * 1. **只读**：本 hook 不修改任何状态，仅提供 computed 读取
 * 2. **优先级**：Route params > Route query > 域 scoped store > 全局 store
 * 3. **业务域感知**：根据传入的 domain 参数自动选择对应的 scoped store
 * 4. **单一来源**：同一上下文 ID 只有一个真实来源，避免多处维护
 *
 * ## 使用示例
 *
 * ```ts
 * // 在分镜域页面中获取当前项目 ID
 * const { projectId, teamId } = useCurrentContext('storyboard')
 *
 * // 在全局页面中获取
 * const { projectId, teamId } = useCurrentContext()
 *
 * // 便捷函数
 * const projectId = useCurrentProjectId('storyboard')
 * const teamId = useCurrentTeamId()
 * ```
 *
 * @see src/config/state-policy.ts 状态管理策略
 * @module hooks/core/useCurrentContext
 */

import { computed, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/store/modules/project'
import { useTeamStore } from '@/store/modules/team'
import { useScriptProjectStore } from '@/store/modules/script-project'
import { useStoryboardProjectStore } from '@/store/modules/storyboard-project'
import { useAssetProjectStore } from '@/store/modules/asset-project'
import type { BusinessDomain } from '@/config/state-policy'

// ============================================================
// 类型定义
// ============================================================

/** 当前业务上下文 */
export interface CurrentContext {
  /** 当前项目 ID（只读） */
  projectId: ComputedRef<string>
  /** 当前团队 ID（只读） */
  teamId: ComputedRef<string>
  /** 当前上下文来源描述（用于调试） */
  source: ComputedRef<{
    projectId: 'route-params' | 'route-query' | 'domain-store' | 'global-store'
    teamId: 'route-query' | 'global-store'
  }>
}

// ============================================================
// 业务域到 scoped store 的映射
// ============================================================

type ScopedStoreAccessor = {
  currentProjectId: string
}

function getDomainScopedStore(domain: BusinessDomain): ScopedStoreAccessor | null {
  switch (domain) {
    case 'script':
      return useScriptProjectStore() as unknown as ScopedStoreAccessor
    case 'storyboard':
      return useStoryboardProjectStore() as unknown as ScopedStoreAccessor
    case 'asset':
      return useAssetProjectStore() as unknown as ScopedStoreAccessor
    case 'global':
      return null
    default:
      return null
  }
}

// ============================================================
// 主 Hook
// ============================================================

/**
 * 获取当前业务上下文
 *
 * @param domain 业务域，默认 'global'。指定后优先从域 scoped store 读取
 * @returns 只读的业务上下文
 */
export function useCurrentContext(domain: BusinessDomain = 'global'): CurrentContext {
  const route = useRoute()
  const projectStore = useProjectStore()
  const teamStore = useTeamStore()

  // ---------- projectId 解析 ----------
  // 优先级：route.params.projectId > route.query.projectId > 域 scoped store > 全局 project store

  const projectId = computed<string>(() => {
    const fromParams = route?.params?.projectId as string | undefined
    if (fromParams) return fromParams

    const fromQuery = route?.query?.projectId as string | undefined
    if (fromQuery) return fromQuery

    if (domain !== 'global') {
      const scopedStore = getDomainScopedStore(domain)
      if (scopedStore?.currentProjectId) return scopedStore.currentProjectId
    }

    return projectStore.currentProjectId || ''
  })

  // ---------- teamId 解析 ----------
  // 优先级：route.query.teamId > 全局 team store

  const teamId = computed<string>(() => {
    const fromQuery = route?.query?.teamId as string | undefined
    if (fromQuery) return fromQuery

    return teamStore.currentTeamId || ''
  })

  // ---------- 来源描述（调试用） ----------

  const source = computed(() => ({
    projectId: (() => {
      if (route?.params?.projectId) return 'route-params' as const
      if (route?.query?.projectId) return 'route-query' as const
      if (domain !== 'global') {
        const scopedStore = getDomainScopedStore(domain)
        if (scopedStore?.currentProjectId) return 'domain-store' as const
      }
      return 'global-store' as const
    })(),
    teamId: (() => {
      if (route?.query?.teamId) return 'route-query' as const
      return 'global-store' as const
    })()
  }))

  return { projectId, teamId, source }
}

// ============================================================
// 便捷函数
// ============================================================

/**
 * 获取当前项目 ID（只读便捷函数）
 *
 * @param domain 业务域，默认 'global'
 * @returns 只读的当前项目 ID
 */
export function useCurrentProjectId(domain: BusinessDomain = 'global'): ComputedRef<string> {
  const { projectId } = useCurrentContext(domain)
  return projectId
}

/**
 * 获取当前团队 ID（只读便捷函数）
 *
 * @returns 只读的当前团队 ID
 */
export function useCurrentTeamId(): ComputedRef<string> {
  const { teamId } = useCurrentContext()
  return teamId
}
