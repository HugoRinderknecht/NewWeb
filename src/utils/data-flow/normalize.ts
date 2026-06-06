/**
 * 空状态响应统一处理工具
 *
 * 项目中列表查询的返回类型不一致：部分返回 []，部分返回 null
 * 提供本工具统一归一化为约定值：
 * - 列表查询：空数据统一返回 []
 * - 单个数据查询：空数据统一返回 null
 */
import type { MaybeRefOrGetter } from 'vue'
import { unref } from 'vue'

/**
 * 将可能为 null/undefined 的列表归一化为 []
 * 使用场景：消费方从 useQuery 取出 data 后调用，避免到处写 `?? []`
 *
 * @example
 * const { data } = useStoryboardList(...)
 * const list = toList(data)  // 始终是数组
 */
export function toList<T>(value: MaybeRefOrGetter<T[] | null | undefined> | null | undefined): T[] {
  if (value == null) return []
  const v = typeof value === 'function' ? (value as () => unknown)() : unref(value as never)
  if (Array.isArray(v)) return v as T[]
  if (v == null) return []
  // 非数组非 null：返回空数组更安全
  return []
}

/**
 * 将可能为 null 的单值数据归一化为 null
 */
export function toValue_<T>(value: MaybeRefOrGetter<T | null | undefined> | null | undefined): T | null {
  if (value == null) return null
  const v = typeof value === 'function' ? (value as () => unknown)() : unref(value as never)
  if (v == null) return null
  return v as T
}

/**
 * 判断列表数据是否为空
 */
export function isEmptyList(value: unknown): boolean {
  if (value == null) return true
  if (Array.isArray(value)) return value.length === 0
  return true
}

/**
 * 判断单值数据是否为空
 */
export function isEmptyValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * 分页响应统一归一化
 * 后端可能返回 records/list/items 作为列表字段，total/count 作为总数
 */
export function normalizePageResponse<T = unknown>(
  raw: any
): { records: T[]; total: number; current: number; size: number } {
  if (!raw || typeof raw !== 'object') {
    return { records: [], total: 0, current: 1, size: 10 }
  }
  const records = raw.records ?? raw.list ?? raw.items ?? []
  return {
    records: Array.isArray(records) ? records : [],
    total: raw.total ?? raw.count ?? 0,
    current: raw.current ?? raw.page ?? 1,
    size: raw.size ?? raw.pageSize ?? 10
  }
}
