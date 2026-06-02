/**
 * 统一数据流转平台 - 数据转换器
 *
 * 提供标准化的数据格式转换机制：
 * - 转换器注册与管理
 * - 类型安全的转换执行
 * - 转换结果校验
 * - 转换链组合
 *
 * @module utils/data-flow/transformer
 */

import type {
  DataTransformerDefinition,
  TransformContext
} from '@/types/data-flow'

/** 转换器注册表 */
const transformerRegistry = new Map<string, DataTransformerDefinition>()

/**
 * 数据转换器管理器
 *
 * 负责转换器的注册、查询和执行，支持同步/异步转换、
 * 转换链组合以及结果校验。
 */
export class DataTransformerManager {
  /** 已注册的转换器 */
  private transformers = transformerRegistry

  /**
   * 注册数据转换器
   * @param definition 转换器定义
   * @throws 如果转换器ID已存在
   */
  register<TInput, TOutput>(definition: DataTransformerDefinition<TInput, TOutput>): void {
    if (this.transformers.has(definition.id)) {
      console.warn(`[DataFlow] 转换器 "${definition.id}" 已存在，将被覆盖`)
    }
    this.transformers.set(definition.id, definition as DataTransformerDefinition)
  }

  /**
   * 批量注册转换器
   * @param definitions 转换器定义数组
   */
  registerAll(definitions: DataTransformerDefinition[]): void {
    definitions.forEach((def) => this.register(def))
  }

  /**
   * 注销转换器
   * @param id 转换器ID
   */
  unregister(id: string): boolean {
    return this.transformers.delete(id)
  }

  /**
   * 获取转换器
   * @param id 转换器ID
   */
  get<TInput = unknown, TOutput = unknown>(
    id: string
  ): DataTransformerDefinition<TInput, TOutput> | undefined {
    return this.transformers.get(id) as
      | DataTransformerDefinition<TInput, TOutput>
      | undefined
  }

  /**
   * 检查转换器是否存在
   * @param id 转换器ID
   */
  has(id: string): boolean {
    return this.transformers.has(id)
  }

  /**
   * 执行数据转换
   * @param transformerId 转换器ID
   * @param data 输入数据
   * @param context 转换上下文
   * @returns 转换后的数据
   * @throws 如果转换器不存在或转换失败
   */
  async transform<TInput, TOutput>(
    transformerId: string,
    data: TInput,
    context?: TransformContext
  ): Promise<TOutput> {
    const transformer = this.get<TInput, TOutput>(transformerId)
    if (!transformer) {
      throw new Error(`[DataFlow] 转换器 "${transformerId}" 不存在`)
    }

    try {
      const result = await transformer.transform(data, context)

      // 执行校验
      if (transformer.validate && !transformer.validate(result)) {
        throw new Error(
          `[DataFlow] 转换器 "${transformerId}" 的输出校验失败`
        )
      }

      return result
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error)
      throw new Error(
        `[DataFlow] 转换器 "${transformerId}" 执行失败: ${message}`
      )
    }
  }

  /**
   * 执行反向转换
   * @param transformerId 转换器ID
   * @param data 输出数据
   * @param context 转换上下文
   * @returns 反向转换后的数据
   */
  async reverseTransform<TInput, TOutput>(
    transformerId: string,
    data: TOutput,
    context?: TransformContext
  ): Promise<TInput> {
    const transformer = this.get<TInput, TOutput>(transformerId)
    if (!transformer) {
      throw new Error(`[DataFlow] 转换器 "${transformerId}" 不存在`)
    }
    if (!transformer.reverseTransform) {
      throw new Error(
        `[DataFlow] 转换器 "${transformerId}" 不支持反向转换`
      )
    }
    return transformer.reverseTransform(data, context)
  }

  /**
   * 执行转换链（按顺序依次执行多个转换器）
   * @param transformerIds 转换器ID数组
   * @param data 初始输入数据
   * @param context 转换上下文
   * @returns 最终转换结果
   */
  async transformChain(
    transformerIds: string[],
    data: unknown,
    context?: TransformContext
  ): Promise<unknown> {
    let result = data
    for (const id of transformerIds) {
      result = await this.transform(id, result, context)
    }
    return result
  }

  /**
   * 获取所有已注册的转换器ID
   */
  getRegisteredIds(): string[] {
    return Array.from(this.transformers.keys())
  }

  /**
   * 清空所有转换器
   */
  clear(): void {
    this.transformers.clear()
  }
}

/** 全局转换器管理器实例 */
export const dataTransformerManager = new DataTransformerManager()

// ============================================================
// 内置通用转换器
// ============================================================

/** 日期格式化转换器：ISO字符串 -> 本地化字符串 */
dataTransformerManager.register({
  id: 'builtin:date-format',
  name: '日期格式化',
  description: '将 ISO 日期字符串转换为本地化格式',
  inputFormat: 'ISO 8601 字符串',
  outputFormat: '本地化日期字符串',
  transform: (data: string) => {
    if (!data) return data
    const date = new Date(data)
    if (isNaN(date.getTime())) return data
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
})

/** 分页参数转换器：前端格式 -> 后端格式 */
dataTransformerManager.register({
  id: 'builtin:pagination-params',
  name: '分页参数转换',
  description: '将前端分页参数转换为后端格式',
  inputFormat: '{ current, size }',
  outputFormat: '{ page, pageSize }',
  transform: (data: { current: number; size: number }) => ({
    page: data.current,
    pageSize: data.size
  }),
  reverseTransform: (data: { page: number; pageSize: number }) => ({
    current: data.page,
    size: data.pageSize
  })
})

/** 分页响应转换器：后端格式 -> 前端格式 */
dataTransformerManager.register({
  id: 'builtin:pagination-response',
  name: '分页响应转换',
  description: '将后端分页响应转换为前端标准格式',
  inputFormat: '后端分页响应',
  outputFormat: '{ records, total, current, size }',
  transform: (
    data: {
      records?: unknown[]
      list?: unknown[]
      items?: unknown[]
      total?: number
      count?: number
      current?: number
      page?: number
      size?: number
      pageSize?: number
    }
  ) => ({
    records: data.records ?? data.list ?? data.items ?? [],
    total: data.total ?? data.count ?? 0,
    current: data.current ?? data.page ?? 1,
    size: data.size ?? data.pageSize ?? 10
  })
})

/** 空值清洗转换器：移除空值字段 */
dataTransformerManager.register({
  id: 'builtin:sanitize-empty',
  name: '空值清洗',
  description: '移除对象中的空字符串、空数组、空对象和 null/undefined 值',
  inputFormat: '任意对象',
  outputFormat: '清洗后的对象',
  transform: (data: Record<string, unknown>) => {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue
      if (value === '') continue
      if (Array.isArray(value) && value.length === 0) continue
      if (typeof value === 'object' && !Array.isArray(value)) {
        const keys = Object.keys(value as Record<string, unknown>)
        if (keys.length === 0) continue
      }
      result[key] = value
    }
    return result
  }
})

/** 枚举映射转换器工厂 */
export function createEnumTransformer<TInput, TOutput>(
  id: string,
  name: string,
  mapping: Map<TInput, TOutput>,
  reverseMapping?: Map<TOutput, TInput>
): DataTransformerDefinition<TInput, TOutput> {
  return {
    id,
    name,
    description: `枚举映射: ${name}`,
    inputFormat: '枚举输入值',
    outputFormat: '枚举输出值',
    transform: (data: TInput) => {
      const result = mapping.get(data)
      if (result === undefined) {
        console.warn(`[DataFlow] 枚举映射 "${name}" 未找到输入值:`, data)
        return data as unknown as TOutput
      }
      return result
    },
    reverseTransform: reverseMapping
      ? (data: TOutput) => {
          const result = reverseMapping.get(data)
          if (result === undefined) {
            console.warn(`[DataFlow] 枚举反向映射 "${name}" 未找到输入值:`, data)
            return data as unknown as TInput
          }
          return result
        }
      : undefined
  }
}
