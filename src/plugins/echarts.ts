import * as echarts from 'echarts/core'

import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  CandlestickChart
} from 'echarts/charts'

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  ToolboxComponent,
  VisualMapComponent,
  TransformComponent
} from 'echarts/components'

import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  CandlestickChart,

  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  ToolboxComponent,
  VisualMapComponent,
  TransformComponent,

  CanvasRenderer
])

export { echarts }
export type { EChartsOption, BarSeriesOption } from 'echarts'

export const graphic = echarts.graphic

let echartsLoadPromise: Promise<typeof echarts> | null = null

export function loadECharts(): Promise<typeof echarts> {
  if (echartsLoadPromise) return echartsLoadPromise
  echartsLoadPromise = Promise.resolve(echarts)
  return echartsLoadPromise
}
