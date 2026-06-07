/**
 * 领域层通用 ViewModel 类型定义
 *
 * 提供面向 UI 展示的通用类型接口，
 * 与后端 DTO 解耦，字段名使用前端语义。
 *
 * @module domain/types
 */

/** 通用指标卡片 ViewModel */
export interface MetricCardViewModel {
  label: string
  value: number
  decimals: number
  change: string
  icon: string
}

/** 工作台 KPI 卡片 ViewModel（字段名与 card-list 组件对齐） */
export interface KpiCardViewModel {
  des: string
  icon: string
  num: number
  change: string
  tone: 'primary' | 'success' | 'warning' | 'info'
}

/** 通用列表项 ViewModel 基础字段 */
export interface ListItemBaseViewModel {
  id: string
  createTime: string
}

/** 通用详情 ViewModel 基础字段 */
export interface DetailBaseViewModel extends ListItemBaseViewModel {
  updateTime: string
}
