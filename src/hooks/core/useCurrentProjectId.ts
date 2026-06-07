import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { Pinia, StoreDefinition } from 'pinia'

/**
 * 业务域当前项目 ID 的统一数据层 Hook（可写版）。
 *
 * 用途：在「剧本 / 分镜 / 资产」等业务域内，统一通过数据层获取与切换当前项目，
 * 避免各页面与全局 useProjectStore 直接耦合而产生跨业务域联动。
 *
 * 读取优先级：route.params.projectId > route.query.projectId > 域 store
 * 写入：仅写入传入的「域 store」，不污染全局。
 *
 * @example
 * const { currentProjectId } = useWritableProjectId(useStoryboardProjectStore)
 */
export interface DomainProjectStore {
  currentProjectId: string
  setCurrentProject: (id: string) => void
  clearCurrentProject?: () => void
}

export interface UseCurrentProjectIdResult {
  /** 只读：当前项目 ID（route 优先，回退到域 store） */
  projectId: ComputedRef<string>
  /** 可写：直接用于 v-model（写入只影响所属业务域 store） */
  currentProjectId: WritableComputedRef<string>
  /** 域 store 实例 */
  domainStore: DomainProjectStore
}

export function useWritableProjectId(
  useDomainStore: StoreDefinition<string, any, any, any>,
  pinia?: Pinia
): UseCurrentProjectIdResult {
  const route = useRoute()
  const domainStore = useDomainStore(pinia) as unknown as DomainProjectStore

  const projectId = computed<string>(() => {
    const fromParams = route?.params?.projectId as string | undefined
    const fromQuery = route?.query?.projectId as string | undefined
    return fromParams || fromQuery || domainStore.currentProjectId || ''
  })

  const currentProjectId = computed<string>({
    get: () => projectId.value,
    set: (val) => {
      if (!val) return
      if (val !== domainStore.currentProjectId) {
        domainStore.setCurrentProject(val)
      }
    }
  })

  return { projectId, currentProjectId, domainStore }
}
