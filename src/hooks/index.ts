// 通用功能集合
export { useCommon } from './core/useCommon'

// 应用模式
export { useAppMode } from './core/useAppMode'

// 权限控制
export { useAuth } from './core/useAuth'

// 表格数据管理方案
export { useTable } from './core/useTable'

// 表格列配置管理
export { useTableColumns } from './core/useTableColumns'

// 主题相关
export { useTheme } from './core/useTheme'

// 礼花+文字滚动
export { useCeremony } from './core/useCeremony'

// 顶栏快速入口
export { useFastEnter } from './core/useFastEnter'

// 顶栏功能管理
export { useHeaderBar } from './core/useHeaderBar'

// 图表相关
export { useChart, useChartComponent, useChartOps } from './core/useChart'

// 布局高度
export { useLayoutHeight, useAutoLayoutHeight } from './core/useLayoutHeight'

export { useApiQuery, useApiMutation, useInvalidateQueries } from './core/useQueryApi'

// 业务域当前项目 ID（统一数据层入口）
export { useCurrentProjectId } from './core/useCurrentProjectId'
export type { DomainProjectStore, UseCurrentProjectIdResult } from './core/useCurrentProjectId'

// 统一业务上下文（只读，遵循 Route > Vue Query > Pinia 优先级）
export { useCurrentContext, useCurrentTeamId } from './core/useCurrentContext'
export type { CurrentContext } from './core/useCurrentContext'

// 注意：useCurrentProjectId 在此文件中有两个导出来源：
// 1. ./core/useCurrentProjectId - 可写版本，支持 v-model 绑定
// 2. ./core/useCurrentContext 中的 useCurrentProjectId - 只读版本，遵循 Route 优先策略
// 如需只读访问且遵循 Route > Store 优先级，推荐从 useCurrentContext 导入
