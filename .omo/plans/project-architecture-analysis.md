# 项目架构分析 - UML/流程图/甘特图

## TL;DR

> **快速摘要**: 对 Art Design Pro 短剧制作平台进行全面架构分析，生成三份独立的架构文档（UML图、流程图、甘特图），详细记录所有模块间的数据流向，特别关注功能类似元素之间的数据交换和同步机制。
> 
> **交付物**:
> - `docs/uml-diagrams.md` - UML类图、时序图、组件图
> - `docs/flowcharts.md` - 业务流程图、数据流向图
> - `docs/gantt-charts.md` - 项目开发甘特图
> 
> **预计工作量**: Short (2-3小时)
> **并行执行**: YES - 3 waves
> **关键路径**: 分析完成 → 生成UML → 生成流程图 → 生成甘特图

---

## Context

### Original Request
用户要求查看、审查项目，检查项目所有元素，分析判断所有元素的数据流向，重点检查功能类似的元素之间的数据交换、同步、获取等操作，需要交付详细的UML、流程图、甘特图，分别存储在三个独立文件中。

### Interview Summary
**关键发现**:
- 项目是一个完整的短剧制作平台，包含24个API模块、11个Store模块
- 存在统一的数据流转平台（DataFlowBus），包含通道、转换器、监控和可视化
- 多个功能类似的Store模块存在数据交换（如ProjectStore vs ProjectDataStore）
- 审核流程（剧本审核/分镜审核）共用同一套审核API
- 资产管理存在项目级和团队级两个层级

**研究发现**:
- DataFlowBus已内置10+数据通道，覆盖API→页面、Store→页面、事件总线等流向
- Store间存在明确的依赖关系：ScriptProjectStore依赖ProjectDataStore
- 用户登出时会跨Store清理状态（UserStore → MenuStore → WorktabStore）
- 团队切换会触发项目列表重新加载（TeamStore → ProjectStore）

---

## Work Objectives

### Core Objective
生成三份完整的架构分析文档，详细记录项目所有模块的数据流向和交互关系。

### Concrete Deliverables
1. `docs/uml-diagrams.md` - 包含系统架构类图、API层类图、数据流转平台类图、数据模型类图、认证时序图、项目数据流转时序图、审核流程时序图、工作流执行时序图、组件图、Store依赖图
2. `docs/flowcharts.md` - 包含核心业务流程图、数据流向图、审核流程图、AI处理流程图
3. `docs/gantt-charts.md` - 包含项目开发阶段甘特图

### Definition of Done
- [ ] 三个文件全部生成并包含完整的Mermaid图表
- [ ] 所有API模块和Store模块均已覆盖
- [ ] 功能类似元素间的数据交换关系已详细记录
- [ ] DataFlowBus的内置通道和Store桥接已完整描述

### Must Have
- 完整的类图覆盖所有主要模块
- 时序图展示核心业务流程
- 流程图展示数据流向
- 功能类似元素间的数据交换关系图
- Store间依赖关系图

### Must NOT Have (Guardrails)
- 不要包含第三方库的内部实现细节
- 不要包含样式相关的分析
- 不要包含部署配置的分析
- 不要生成过于复杂的嵌套图表

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (文档生成任务)
- **Agent-Executed QA**: 验证Mermaid语法正确性、图表完整性

### QA Policy
每个任务完成后验证：
- Mermaid语法是否正确
- 图表是否能正常渲染
- 内容是否完整覆盖要求的模块

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (立即开始 - 独立分析任务):
├── Task 1: 生成UML类图和时序图 [writing]
├── Task 2: 生成业务流程图和数据流向图 [writing]
└── Task 3: 生成项目开发甘特图 [writing]

Wave FINAL (所有任务完成后 - 验证):
├── Task F1: 验证所有Mermaid语法和内容完整性 [quick]
└── Task F2: 用户确认 [quick]

Critical Path: Task 1/2/3 并行 → F1 → F2
Parallel Speedup: ~66% faster than sequential
Max Concurrent: 3 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | None | F1 |
| 2 | None | F1 |
| 3 | None | F1 |
| F1 | 1, 2, 3 | F2 |
| F2 | F1 | None |

### Agent Dispatch Summary

- **Wave 1**: 3 tasks - T1 → `writing`, T2 → `writing`, T3 → `writing`
- **Wave FINAL**: 2 tasks - F1 → `quick`, F2 → `quick`

---

## TODOs

- [x] 1. 生成UML类图和时序图

  **What to do**:
  - 创建 `docs/uml-diagrams.md` 文件
  - 生成系统整体架构类图（App、Router、Store、DataFlowBus）
  - 生成API层类图（所有24个API模块）
  - 生成数据流转平台类图（DataFlowBus、ChannelManager、TransformerManager、Monitor、Visualizer）
  - 生成数据模型类图（Project、Episode、Storyboard、Character、Scene、ReviewTask、Team、Asset等）
  - 生成用户认证时序图（登录流程、Token管理）
  - 生成项目数据流转时序图（项目→剧本→分镜的数据加载流程）
  - 生成审核流程时序图（提交→认领→决策的完整流程）
  - 生成工作流执行时序图（SSE流式执行流程）
  - 生成数据流转平台组件图
  - 生成Store间数据依赖图

  **Must NOT do**:
  - 不要包含第三方库内部实现
  - 不要生成过于复杂的嵌套类图

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 文档生成任务，需要清晰的结构和准确的技术描述
  - **Skills**: []
    - 无特殊技能需求

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/utils/data-flow/bus.ts` - DataFlowBus核心实现，包含所有内置通道定义
  - `src/utils/data-flow/channel.ts` - DataChannelImpl实现，包含send/subscribe逻辑
  - `src/utils/data-flow/transformer.ts` - 内置转换器（分页、日期、空值清洗）
  - `src/utils/data-flow/monitor.ts` - 监控指标采集和告警规则
  - `src/utils/data-flow/visualizer.ts` - 可视化实现，generateMermaid()方法

  **API/Type References**:
  - `src/types/data-flow/index.ts` - 所有数据流转平台的类型定义
  - `src/store/modules/*.ts` - 所有11个Store模块的实现
  - `src/api/*.ts` - 所有24个API模块的实现

  **Acceptance Criteria**:
  - [ ] 文件 `docs/uml-diagrams.md` 已创建
  - [ ] 包含至少8个Mermaid图表（类图、时序图、组件图）
  - [ ] 所有主要模块（API、Store、DataFlow）均已覆盖
  - [ ] Mermaid语法正确，可正常渲染

  **QA Scenarios**:

  ```
  Scenario: 验证UML文件完整性
    Tool: Bash (grep)
    Preconditions: docs/uml-diagrams.md 已创建
    Steps:
      1. 检查文件是否包含 "classDiagram" 关键字
      2. 检查文件是否包含 "sequenceDiagram" 关键字
      3. 检查文件是否包含 "graph" 关键字
      4. 统计Mermaid代码块数量
    Expected Result: 文件包含至少3种图表类型，至少8个Mermaid代码块
    Evidence: .omo/evidence/task-1-uml-completeness.txt

  Scenario: 验证Mermaid语法
    Tool: Bash (grep)
    Preconditions: docs/uml-diagrams.md 已创建
    Steps:
      1. 检查所有mermaid代码块是否正确闭合
      2. 检查是否有未闭合的引号或括号
    Expected Result: 所有Mermaid代码块语法正确
    Evidence: .omo/evidence/task-1-mermaid-syntax.txt
  ```

  **Commit**: NO (文档生成，无需提交)

---

- [x] 2. 生成业务流程图和数据流向图

  **What to do**:
  - 创建 `docs/flowcharts.md` 文件
  - 生成核心业务流程图（项目创建→剧本编写→分镜设计→视频生成）
  - 生成数据流向图（API层→Store层→页面层的完整数据流）
  - 生成审核流程图（剧本审核和分镜审核的完整流程）
  - 生成AI处理流程图（工作流执行、SSE流式处理）
  - 生成功能类似元素间数据交换图：
    - ProjectStore vs ProjectDataStore 数据交换
    - 项目成员 vs 团队成员 数据同步
    - 剧本审核 vs 分镜审核 共用机制
    - 项目资产 vs 团队资产 导入机制
    - 个人/项目/团队积分 同步机制
  - 生成Store间依赖关系图
  - 生成DataFlowBus内置通道流向图

  **Must NOT do**:
  - 不要包含实现细节的伪代码
  - 不要生成过于复杂的嵌套流程图

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 文档生成任务，需要清晰的流程描述
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/store/modules/project.ts` - ProjectStore实现，包含loadProjectList等方法
  - `src/store/modules/team.ts` - TeamStore实现，包含switchTeam等方法
  - `src/store/modules/review.ts` - ReviewStore实现，包含loadPendingCount等方法
  - `src/store/modules/script-project.ts` - ScriptProjectStore，复用ProjectDataStore
  - `src/store/modules/project-data.ts` - ProjectDataStore，内置演示数据

  **API/Type References**:
  - `src/api/project.ts` - 项目API，包含CRUD和成员管理
  - `src/api/script.ts` - 剧本API，包含审核和AI处理
  - `src/api/storyboard.ts` - 分镜API，包含审核和版本管理
  - `src/api/review.ts` - 审核API，共用审核流程
  - `src/api/asset.ts` - 资产API，包含项目资产和团队资产
  - `src/api/points.ts` - 积分API，包含个人/项目/团队积分

  **Acceptance Criteria**:
  - [ ] 文件 `docs/flowcharts.md` 已创建
  - [ ] 包含至少6个Mermaid流程图
  - [ ] 功能类似元素间的数据交换关系已详细记录
  - [ ] Store间依赖关系已完整描述
  - [ ] Mermaid语法正确，可正常渲染

  **QA Scenarios**:

  ```
  Scenario: 验证流程图文件完整性
    Tool: Bash (grep)
    Preconditions: docs/flowcharts.md 已创建
    Steps:
      1. 检查文件是否包含 "graph" 或 "flowchart" 关键字
      2. 统计Mermaid代码块数量
      3. 检查是否包含 "ProjectStore"、"TeamStore"、"ReviewStore" 等关键字
    Expected Result: 文件包含至少6个Mermaid流程图，覆盖所有主要Store
    Evidence: .omo/evidence/task-2-flowchart-completeness.txt

  Scenario: 验证数据交换关系描述
    Tool: Bash (grep)
    Preconditions: docs/flowcharts.md 已创建
    Steps:
      1. 检查是否包含 "ProjectStore vs ProjectDataStore" 相关描述
      2. 检查是否包含 "项目成员 vs 团队成员" 相关描述
      3. 检查是否包含 "剧本审核 vs 分镜审核" 相关描述
      4. 检查是否包含 "项目资产 vs 团队资产" 相关描述
    Expected Result: 所有功能类似元素间的数据交换关系已记录
    Evidence: .omo/evidence/task-2-data-exchange.txt
  ```

  **Commit**: NO (文档生成，无需提交)

---

- [x] 3. 生成项目开发甘特图

  **What to do**:
  - 创建 `docs/gantt-charts.md` 文件
  - 基于项目结构推断开发阶段和任务依赖
  - 生成项目整体开发甘特图（基础设施→核心功能→高级功能→优化）
  - 生成各模块开发甘特图：
    - 用户认证模块
    - 项目管理模块
    - 剧本管理模块
    - 分镜管理模块
    - 团队管理模块
    - 审核系统模块
    - 工作流引擎模块
    - 资产管理模块
    - 视频/图片生成模块
    - 积分系统模块
    - 数据流转平台模块
  - 生成关键路径分析图

  **Must NOT do**:
  - 不要编造具体的日期（使用相对时间）
  - 不要包含人员分配信息

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: 文档生成任务，需要清晰的时间线描述
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task F1
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/router/modules/*.ts` - 所有19个路由模块，反映功能模块划分
  - `src/views/*/` - 所有22个视图目录，反映业务功能
  - `src/api/*.ts` - 所有24个API模块，反映后端接口覆盖

  **Acceptance Criteria**:
  - [ ] 文件 `docs/gantt-charts.md` 已创建
  - [ ] 包含至少2个Mermaid甘特图
  - [ ] 覆盖所有主要功能模块
  - [ ] 包含任务依赖关系
  - [ ] Mermaid语法正确，可正常渲染

  **QA Scenarios**:

  ```
  Scenario: 验证甘特图文件完整性
    Tool: Bash (grep)
    Preconditions: docs/gantt-charts.md 已创建
    Steps:
      1. 检查文件是否包含 "gantt" 关键字
      2. 统计Mermaid代码块数量
      3. 检查是否包含 "section" 关键字（甘特图分区）
    Expected Result: 文件包含至少2个Mermaid甘特图，包含多个section
    Evidence: .omo/evidence/task-3-gantt-completeness.txt

  Scenario: 验证模块覆盖
    Tool: Bash (grep)
    Preconditions: docs/gantt-charts.md 已创建
    Steps:
      1. 检查是否包含 "用户认证"、"项目管理"、"剧本管理" 等关键字
      2. 检查是否包含 "分镜管理"、"团队管理"、"审核系统" 等关键字
      3. 检查是否包含 "工作流"、"资产管理"、"视频生成" 等关键字
    Expected Result: 所有主要功能模块均已覆盖
    Evidence: .omo/evidence/task-3-module-coverage.txt
  ```

  **Commit**: NO (文档生成，无需提交)

---

## Final Verification Wave

- [x] F1. **验证所有文档完整性** — `quick`
  检查三个文件是否都已创建，Mermaid语法是否正确，内容是否完整覆盖所有要求的模块和数据流向。
  Output: `Files [3/3] | Mermaid Blocks [N] | Coverage [COMPLETE/PARTIAL] | VERDICT`

- [x] F2. **用户确认** — `quick`
  向用户展示生成的文档，确认是否满足需求。
  Output: `User [APPROVED/REJECTED] | VERDICT`

---

## Commit Strategy

- **Task 1-3**: 文档生成任务，无需Git提交
- **Final**: 用户确认后，可选择性提交文档

---

## Success Criteria

### Verification Commands
```bash
# 检查文件是否存在
Test-Path docs/uml-diagrams.md
Test-Path docs/flowcharts.md
Test-Path docs/gantt-charts.md

# 检查Mermaid代码块数量
Select-String -Path docs/*.md -Pattern "```mermaid" | Measure-Object
```

### Final Checklist
- [ ] `docs/uml-diagrams.md` 包含完整的UML类图和时序图
- [ ] `docs/flowcharts.md` 包含完整的业务流程图和数据流向图
- [ ] `docs/gantt-charts.md` 包含完整的项目开发甘特图
- [ ] 所有功能类似元素间的数据交换关系已详细记录
- [ ] 所有Mermaid语法正确，可正常渲染
