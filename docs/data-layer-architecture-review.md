# 数据层架构审查报告

> 审查日期：2026-06-07
> 项目：Dreamcraft Astra（AI短剧制作平台前端）
> 技术栈：Vue 3.5 + TypeScript 5.6 + Vite 7 + Pinia 3 + TanStack Vue Query 5 + Element Plus 2 + Tailwind CSS 4 + Axios

---

## 一、现有架构评估

### 1.1 数据获取层 — 三层架构（设计良好，覆盖不完整）

```
Layer 3: @/api/queries/*     (Vue Query Hooks - 推荐入口)
Layer 2: @/api/*              (原始 fetch 函数 - 底层入口)
Layer 1: @/api/adapter/*      (HTTP 适配器 - 最底层)
```

**优点**：

- 适配器模式（`src/api/adapter/http-adapter.ts`）实现了 HTTP 客户端的可替换性
- Vue Query Hooks（`src/api/queries/`）统一了缓存、重试、staleTime 管理
- HTTP 封装层（`src/utils/http/index.ts`）具备请求去重、LRU 缓存、Token 自动刷新等能力

**问题**：

- **58 处组件直接调用原始 API 函数**，绕过 Vue Query，手动管理 loading/error/data
- 缺失 Vue Query Hook 的模块：`video-model`、`system-manage`、`platform-admin`、`system-config`、`billing`、`workflow-manage`、`script-asset`、`dify`
- 典型案例：`src/views/video-gen/task/index.vue` 完全手动管理数据状态

### 1.2 状态管理 — Pinia + Vue Query 双层架构（设计合理）

**14 个 Store**，明确遵循 **"Store 只放 UI 状态，数据走 Vue Query"** 原则。

**优点**：

- `useProjectStore` 作为项目 ID 的唯一真实来源，通过 computed 代理消除循环依赖
- 业务域隔离设计（storyboard/script/asset 各自独立维护项目 ID）
- 完善的持久化体系：版本化键名 + localStorage/sessionStorage 分层 + 选择性持久化
- 组合式 API 风格占主导（11/14）

**问题**：

- `src/store/modules/storyboard.ts` 自行通过 `localStorage` 管理持久化，未使用 pinia-plugin-persistedstate
- 3 个 Store 仍使用选项式 API 风格（`storyboard-project`、`script-project`、`asset-project`），风格不统一

### 1.3 数据转换 — 集中基础设施 + 分散业务逻辑（基础设施完善，业务层利用率低）

**优点**：

- `src/utils/data-flow/transformer.ts`（DataTransformerManager）提供了完整的转换器注册/执行/链式/校验能力
- 内置转换器覆盖：日期格式化、分页参数/响应转换、空值清洗、枚举映射
- `src/utils/data-flow/normalize.ts` 统一处理后端返回 null/undefined 的不一致问题

**问题**：

- **业务转换器仅 `team.transformer.ts` 一个**，其他模块的数据映射逻辑散落在组件中
- `src/views/asset/library/index.vue` 第 649-670 行、769-789 行包含重复的字段映射逻辑
- `src/views/script/decompose/index.vue` 第 248-260 行手动映射 Episode 数据
- DataFlowBus 基础设施使用率极低，更多是预留而非实际使用

### 1.4 缓存机制 — 四层缓存体系（完善但存在冗余）

| 层级 | 机制 | 容量/策略 |
|------|------|-----------|
| HTTP 层 | LRU 响应缓存 | 200 条，按 cacheTTL 配置 |
| Vue Query | staleTime + gcTime | 5min stale / 10min gc |
| 表格层 | TableCache | 50 条，5min 过期，LRU |
| 本地存储 | pinia-plugin-persistedstate | 版本化键名 |

**问题**：

- HTTP 层 LRU 缓存与 Vue Query 缓存功能重叠，增加了缓存一致性风险
- TableCache 与 Vue Query 缓存并存，`useTable` 支持两种后端切换，增加了理解成本

### 1.5 错误处理 — 四层覆盖（完善度高）

| 层级 | 机制 | 文件 |
|------|------|------|
| 全局 | Vue/Script/Promise/Resource 错误捕获 | `src/utils/sys/error-handle.ts` |
| API | HttpError + 业务码映射 + Token 刷新 | `src/utils/http/error.ts` |
| 组件 | ArtErrorBoundary 错误边界 | `src/components/core/base/art-error-boundary/index.vue` |
| 监控 | DataFlowMonitor 告警规则 | `src/utils/data-flow/monitor.ts` |

**优点**：200+ 业务错误码精确映射，401 防抖，Token 自动刷新单例保护

**问题**：`reportError` 上报接口未启用，生产环境缺乏错误追踪能力

### 1.6 组件与数据逻辑耦合度 — 评分 6.5/10

| 维度 | 评分 | 说明 |
|------|------|------|
| API 调用耦合 | 6/10 | 核心模块已迁移 Vue Query，但 40%+ 页面仍直接调用 |
| 数据处理耦合 | 5/10 | 映射/转换逻辑散落组件，Transformer 层利用率低 |
| Store 耦合 | 8/10 | Store 设计合理，仅存 UI 状态 |
| 抽象层完整性 | 6/10 | 三层架构设计良好，Layer 3 覆盖不完整 |
| 组件职责划分 | 5/10 | 存在多个胖组件 |
| 类型安全 | 4/10 | 大量 `any` 类型使用 |

**胖组件 TOP 5**：

| 排名 | 组件 | 行数 | 核心问题 |
|------|------|------|---------|
| 1 | `src/views/asset/library/index.vue` | ~966 | 6 个弹窗内联，重复映射逻辑 |
| 2 | `src/views/video-gen/task/index.vue` | ~570 | 完全绕过 Vue Query 手动管理 |
| 3 | `src/views/stats/dashboard/index.vue` | ~426 | 6 种图表转换逻辑内联 |
| 4 | `src/views/script/version/index.vue` | ~630 | 混合使用两种调用模式 |
| 5 | `src/views/asset/ai-generate/index.vue` | ~500 | 三个 Tab 逻辑全部内联 |

---

## 二、改进方案

### 2.1 补全 Vue Query Hooks 覆盖（优先级：高）

为缺失模块创建 queries 封装，消除组件直接调用原始 API 的模式：

```
需新增的 queries 文件：
src/api/queries/video-model.ts
src/api/queries/system-manage.ts
src/api/queries/platform-admin.ts
src/api/queries/system-config.ts
src/api/queries/billing.ts
src/api/queries/workflow-manage.ts
src/api/queries/script-asset.ts
src/api/queries/dify.ts
```

**迁移策略**：逐模块迁移，每个模块分三步：

1. 创建 `queries/xxx.ts`，封装 `useQuery`/`useMutation` hooks
2. 修改组件引用，从 `import { fetchXxx } from '@/api/xxx'` 改为 `import { useXxx } from '@/api/queries'`
3. 删除组件中的手动 `loading`/`error`/`data` 状态管理代码

### 2.2 抽取业务数据 Transformer 层（优先级：高）

将散落在组件中的数据映射逻辑集中到 `src/utils/transformers/` 目录：

```
src/utils/transformers/
├── asset.transformer.ts     # AssetListItem → AssetItem 映射
├── script.transformer.ts    # Api.Script.Episode → Episode 映射
├── video.transformer.ts     # 视频任务状态映射
├── chart.transformer.ts     # 图表数据适配器（ECharts 格式转换）
└── index.ts                 # 统一导出 + 注册到 DataTransformerManager
```

**设计原则**：

- 每个 transformer 导出纯函数，输入为 API 原始类型，输出为 UI 展示类型
- 通过 `DataTransformerManager.register()` 注册，支持在 DataFlowBus 中自动执行
- 组件中仅调用 `transformAssetItem(raw)` 替代内联映射

### 2.3 拆分胖组件（优先级：高）

**资产库页面拆分方案**（`src/views/asset/library/index.vue`）：

```
asset/library/
├── index.vue                    # 主页面（列表+搜索+分页）
├── composables/
│   ├── useAssetList.ts          # 数据获取+转换+筛选逻辑
│   └── useAssetActions.ts       # 批量操作逻辑
├── components/
│   ├── AssetPreviewDialog.vue   # 预览弹窗
│   ├── AssetEditDialog.vue      # 编辑弹窗
│   ├── AssetMoveDialog.vue      # 批量移动弹窗
│   ├── AssetTagDialog.vue       # 批量标签弹窗
│   └── AssetDownloadDialog.vue  # 下载弹窗
└── types.ts                     # 本地类型定义
```

**视频任务页面改造方案**（`src/views/video-gen/task/index.vue`）：

- 创建 `src/api/queries/video.ts` 补全 hooks
- 创建 `useVideoTaskManager` composable 封装任务创建/轮询/取消逻辑
- 组件仅负责 UI 渲染和事件绑定

**统计页面改造方案**（`src/views/stats/dashboard/index.vue`）：

- 创建 `useChartDataAdapter` composable，封装各图表的数据转换逻辑
- 图表配置抽取为 `src/config/charts/` 下的静态配置文件

### 2.4 统一缓存策略（优先级：中）

**目标**：以 Vue Query 为唯一缓存层，移除冗余缓存机制。

1. **废弃 HTTP 层 LRU 缓存**：Vue Query 已提供 staleTime/gcTime 缓存，HTTP 层缓存增加了缓存一致性风险，建议移除或仅保留 `cacheTTL` 作为特殊场景的逃生阀
2. **统一 TableCache**：`useTable` 的 `queryKey` 模式已支持 Vue Query 缓存，废弃自建 TableCache，统一走 Vue Query
3. **明确缓存策略文档**：为每个 query key 定义 staleTime，按数据更新频率分级

```typescript
// 建议的 staleTime 分级策略
const STALE_TIME = {
  STATIC: 30 * 60 * 1000,     // 30min - 配置类数据（角色列表、系统配置）
  NORMAL: 5 * 60 * 1000,      // 5min - 常规列表数据（项目列表、剧本列表）
  FREQUENT: 60 * 1000,         // 1min - 频繁更新数据（任务状态、审核状态）
  REALTIME: 10 * 1000,         // 10s - 实时数据（AI生成进度）
} as const
```

### 2.5 补充业务 Composables（优先级：中）

当前 `src/hooks/core/` 缺少业务数据逻辑的封装，建议新增：

| Composable | 职责 | 受益组件 |
|-----------|------|---------|
| `useAssetList` | 资产列表数据获取+转换+筛选 | asset/library |
| `useVideoTaskManager` | 视频任务创建/轮询/取消 | video-gen/task |
| `useChartDataAdapter` | 图表数据转换（API→ECharts 格式） | stats/dashboard, review/statistics |
| `useAssetForm` | 资产编辑/创建表单逻辑 | asset/library, asset/ai-generate |
| `useBatchOperations` | 批量操作通用逻辑（选择/确认/执行） | asset/library, storyboard/design |

### 2.6 类型安全加固（优先级：中）

1. **消除 `any` 类型**：为 `StoryboardBoard` 的 `items` prop、`ShotDetailDrawer` 的 `imageList`/`assetList`/`versionList` 补充类型定义
2. **统一 ProjectSwitcher 的 props 类型**：当前各页面传入的 `project-list` 数据映射逻辑各不相同，建议定义 `ProjectOption` 标准接口
3. **API 响应类型补全**：部分 API 函数缺少泛型参数，返回 `any`

### 2.7 Store 风格统一与优化（优先级：低）

1. 将 `storyboard-project`、`script-project`、`asset-project` 三个选项式 Store 改为组合式 API 风格
2. 将 `storyboard` Store 的自行 localStorage 持久化改为使用 `pinia-plugin-persistedstate`
3. 启用 `reportError` 错误上报，接入生产环境错误追踪

---

## 三、实施路线图

```
Phase 1（基础加固）:
  ├── 补全 8 个缺失模块的 Vue Query Hooks
  ├── 抽取 asset/script/video transformer
  └── 消除组件直接调用原始 API 的 58 处引用

Phase 2（组件瘦身）:
  ├── 拆分 asset/library 胖组件（6 个弹窗抽取）
  ├── 改造 video-gen/task 为 Vue Query 模式
  ├── 抽取 useChartDataAdapter composable
  └── 补充 5 个业务 composables

Phase 3（架构优化）:
  ├── 统一缓存策略（废弃冗余缓存层）
  ├── 类型安全加固（消除 any、统一 props 类型）
  ├── Store 风格统一
  └── 启用错误上报
```

---

## 四、总结

项目数据层架构**设计理念先进**（Pinia + Vue Query 双层架构、适配器模式、DataFlowBus），**基础设施完善**（四层缓存、200+ 业务错误码、Token 自动刷新），但在**落地一致性**上存在明显差距：

- **架构分层已建立但执行不彻底**：40%+ 页面仍绕过 Vue Query 直接调用 API
- **转换基础设施已搭建但利用率极低**：DataTransformerManager 仅 team 模块使用
- **缓存机制完善但存在冗余**：HTTP LRU + Vue Query + TableCache 功能重叠

核心改进方向是**将已有的优秀基础设施真正用起来**，而非重新设计架构。补全 Vue Query 覆盖、抽取 Transformer、拆分胖组件这三项改进即可显著提升数据层的分离程度。
