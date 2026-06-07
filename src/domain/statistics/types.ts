/**
 * 统计领域 ViewModel 类型定义
 *
 * 面向统计页面 UI 展示的类型，与后端 DTO 解耦。
 *
 * @module domain/statistics/types
 */

import type {
  BarDataItem,
  LineDataItem,
  PieDataItem,
  RadarDataItem,
  ScatterDataItem
} from '@/types/component/chart'
import type { MetricCardViewModel, KpiCardViewModel } from '../types'

/** 仪表盘卡片 ViewModel */
export type DashboardCardViewModel = MetricCardViewModel

/** 工作台 KPI 卡片 ViewModel */
export type KpiCardViewModel$ = KpiCardViewModel

/** 月份 X 轴数据 */
export type MonthXAxis = string[]

/** 项目产出柱状图数据 */
export type OutputBarData = BarDataItem[]

/** 趋势折线图数据 */
export type TrendLineData = LineDataItem[]

/** 资源占比环形图数据 */
export type ResourcePieData = PieDataItem[]

/** 雷达图数据 */
export type RadarData = RadarDataItem[]

/** 散点图数据 */
export type ScatterData = ScatterDataItem[]

/** 热力图数据 */
export type HeatmapData = [number, number, number][]

/** 费用明细项 ViewModel */
export interface CostItemViewModel {
  id: string | number
  feature: string
  icon: string
  projectName: string
  type: string
  credits: number
  amount: string
  usageCount: number
  date: string
}

/** 功能分布数据 */
export type FeatureDistributionData = PieDataItem[]

/** 模型分布数据 */
export type ModelDistributionData = PieDataItem[]

/** 项目分布柱状图数据 */
export type ProjectBarData = BarDataItem[]

/** Token 明细项 ViewModel */
export interface TokenItemViewModel {
  id: string | number
  projectName: string
  model: string
  requestType: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: string
  requestTime: string
}

/** 积分概览 ViewModel */
export interface SalesOverviewViewModel {
  xAxisData: string[]
  data: number[]
  remainingCredits: number
  monthChange: string
  totalSpent: number
}
