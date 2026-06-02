# DreamCraft Astra 项目数据联通性审核报告

**项目名称**: DreamCraft Astra (art-design-pro)  
**审核日期**: 2026-05-30  
**审核角色**: 企业客户代表  
**技术栈**: Vue 3.5 + TypeScript 5.6 + Pinia 3 + Vite 7 + Element Plus 2 + Axios 1  
**审核范围**: 全部14个业务模块、81个Vue视图文件、24个API模块、7个Store模块  

---

## 目录

1. [执行摘要](#1-执行摘要)
2. [模块检查清单](#2-模块检查清单)
3. [问题汇总表](#3-问题汇总表)
4. [缺陷分析](#4-缺陷分析)
5. [技术选型升级评估](#5-技术选型升级评估)
6. [数据层架构设计](#6-数据层架构设计)
7. [改进建议与优先级](#7-改进建议与优先级)

---

## 1. 执行摘要

### 1.1 总体评估

| 评估维度 | 成熟度 | 评级 |
|---------|--------|------|
| API 定义层 | 接口定义全面，覆盖24个业务模块，200+接口 | ★★★★☆ |
| Store 状态层 | 仅覆盖基础UI状态，业务数据Store使用硬编码，未与API联通 | ★★☆☆☆ |
| 数据流转平台 | 架构设计完善，但未与业务代码集成 | ★★★☆☆ |
| Mock 数据层 | 核心模块覆盖较好，但部分模块缺失 | ★★★☆☆ |
| WebSocket | 客户端实现完整，但未与业务集成 | ★★★☆☆ |
| 存储机制 | 版本化管理、自动迁移、兼容性检查设计良好 | ★★★★☆ |
| 视图层API对接 | 81个文件中仅29个较好对接，17个完全硬编码 | ★★☆☆☆ |
| 跨模块数据联动 | 全项目不存在任何跨模块数据联动机制 | ★☆☆☆☆ |

### 1.2 关键发现

- **96.3%的页面无共享状态**：仅3个Store被视图层使用，78个Vue文件无Pinia Store
- **dataFlowBus完全未使用**：项目设计了跨模块通信机制但视图层未采用
- **17个文件完全硬编码**：包括整个team模块(7个)、data-history模块(2个)、ai-process模块(2个)
- **23个文件写操作未持久化**：CRUD操作仅修改本地ref/reactive数据，刷新即丢失
- **生产环境API使用HTTP**：存在中间人攻击风险
- **Token存储在localStorage**：存在XSS攻击窃取令牌风险

---

## 2. 模块检查清单

### 2.1 团队管理模块 (Team)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| list | 团队列表/创建/切换 | 团队信息、统计数据 | ❌ 完全硬编码 | ❌ | ❌ | 创建/切换仅修改本地数据 |
| settings | 团队设置/转让/解散 | 团队详情、审计日志 | ❌ 完全硬编码 | ❌ | ❌ | 保存/转让/解散仅ElMessage |
| members | 成员管理 | 成员列表、统计 | ❌ 完全硬编码 | ❌ | ❌ | 邀请/编辑/禁用/移除仅本地 |
| roles | 角色权限管理 | 角色列表、权限树 | ❌ 完全硬编码 | ❌ | ❌ | 创建/编辑/删除/权限仅本地 |
| invite-codes | 邀请码管理 | 邀请码列表 | ❌ 完全硬编码 | ❌ | ❌ | 生成/禁用/启用/删除仅本地 |
| applications | 加入申请管理 | 申请列表 | ❌ 完全硬编码 | ❌ | ❌ | 通过/拒绝仅修改本地数据 |
| quota | 配额管理 | 配额列表、统计 | ❌ 完全硬编码 | ❌ | ❌ | 新增/编辑/删除/切换仅本地 |

**预期数据交互**:
- Team → Project: 团队切换应刷新项目列表
- Team → Auth: 成员角色变更应同步权限
- Team → Asset: 团队资产库应与团队关联
- Team → Points: 团队配额应与积分系统联动

**实际数据交互**: 无。7个子模块完全独立，无任何跨模块数据交互。

---

### 2.2 项目管理模块 (Project)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| list | 项目列表/创建/删除 | 项目信息、分页 | ✅ 6个API | ❌ | ❌ | 归档/恢复/复制调API |
| edit | 项目详情编辑 | 项目详情、剧本/分镜/视频/资产列表 | ❌ 完全硬编码 | ❌ | ❌ | 保存/归档/删除仅ElMessage |
| episodes | 分集管理 | 分集列表、镜头列表 | ⚠️ 部分API | ❌ | ❌ | 新建/编辑/删除集数仅本地 |
| characters | 角色管理 | 角色列表 | ⚠️ 跨模块API | ❌ | ❌ | 新建/编辑/删除仅本地 |
| scripts | 剧本管理 | 剧本列表 | ✅ 跨模块API | ❌ | ❌ | CRUD对接API |
| member | 成员管理 | 成员列表 | ✅ 3个API | ❌ | ❌ | 增删对接API |
| statistics | 项目统计 | 统计数据 | ❌ 完全硬编码 | ❌ | ❌ | 所有图表数据硬编码 |
| ProjectForm | 项目表单组件 | 表单数据 | ❌ 无 | ❌ | ❌ | 纯表单组件 |

**预期数据交互**:
- Project → Script: 项目下剧本数据联动
- Project → Storyboard: 项目下分镜数据联动
- Project → Asset: 项目资产关联
- Project → Team: 项目所属团队信息
- Project → Review: 项目审核状态同步

**实际数据交互**: 仅单向读取Script和Team的API，无双向联动。删除项目后不会通知edit页面刷新。

---

### 2.3 剧本管理模块 (Script)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| library | 剧本库 | 剧本列表、分集、资产、角色 | ⚠️ 部分API | ✅ scriptProjectStore | ❌ | 资产和角色数据未同步 |
| version | 版本管理 | 版本列表、回退 | ⚠️ 部分API | ✅ scriptProjectStore | ❌ | projectId/scriptId可能不一致 |
| profiles | 人物小传 | 人物数据 | ⚠️ 部分API | ✅ scriptProjectStore | ❌ | 人物数据硬编码在Map |
| decompose | 拆分 | 拆分结果 | ⚠️ 1个API | ✅ scriptProjectStore | ❌ | 拆解数据硬编码，与storyboard无联动 |
| ai-review | AI审核 | 审核结果 | ⚠️ 部分API | ✅ scriptProjectStore | ❌ | 审核结果未同步到review模块 |
| write | 剧本编写 | 编辑内容 | ❌ 模拟实现 | ✅ scriptProjectStore | ❌ | 保存操作为模拟，资产硬编码 |

**预期数据交互**:
- Script → Storyboard: 剧本拆分应生成分镜
- Script → Character: 人物小传应同步到角色管理
- Script → Review: 剧本审核提交应同步到审核模块
- Script → DataHistory: 版本管理应与数据历史联动

**实际数据交互**: 仅scriptProjectStore内部使用，无跨模块联动。decompose与storyboard有逻辑关联但无数据联动。

---

### 2.4 分镜管理模块 (Storyboard)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| design | 分镜设计 | 分镜列表、版本、审核 | ⚠️ 部分API | ❌ | ❌ | 版本历史硬编码，审核仅ElMessage |
| batch-edit | 批量编辑 | 分镜列表 | ⚠️ 部分API | ❌ | ❌ | 批量修改仅修改本地数据 |
| scene | 场景管理 | 场景数据 | ❌ 完全硬编码 | ❌ | ❌ | 纯本地mock数据 |
| preview | 预览 | 预览数据 | ❌ 完全硬编码 | ❌ | ❌ | 导出用setTimeout模拟 |

**预期数据交互**:
- Storyboard → Script: 分镜关联剧本数据
- Storyboard → Asset: 分镜配图关联资产
- Storyboard → VideoGen: 分镜生成视频
- Storyboard → Review: 分镜审核提交联动

**实际数据交互**: design页面与script/decompose有逻辑关联但无数据联动。scene和preview完全未对接。

---

### 2.5 资产管理模块 (Asset)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| library | 资产库 | 资产列表 | ⚠️ 部分API | ❌ | ❌ | 编辑/移动/标签仅本地 |
| ai-generate | AI生成 | 生成任务、风格 | ⚠️ 跨模块API | ❌ | ❌ | 保存到资产库仅ElMessage |
| preview | 资产预览 | 资产详情 | ⚠️ 1个API | ❌ | ❌ | - |
| reuse | 资产复用 | 团队资产 | ⚠️ 1个API | ❌ | ❌ | 复用操作仅本地模拟 |
| tags | 标签管理 | 标签数据 | ❌ 完全硬编码 | ❌ | ❌ | TODO待对接标签API |
| upload | 上传 | 上传数据 | ❌ 无 | ❌ | ❌ | - |
| category | 分类 | 分类数据 | ❌ 无 | ❌ | ❌ | - |
| import | 导入 | 导入数据 | ❌ 无 | ❌ | ❌ | - |

**预期数据交互**:
- Asset → Project: 项目资产关联
- Asset → Storyboard: 分镜配图关联资产
- Asset → Team: 团队资产库共享
- Asset → Points: AI生成消耗积分

**实际数据交互**: ai-generate跨模块调用workflow的fetchStyleInference，但保存结果未同步到资产库。

---

### 2.6 审核管理模块 (Review)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| pending | 待审核列表 | 审核任务 | ⚠️ 1个API | ❌ | ❌ | 通过/驳回/转审仅本地 |
| content | 审核内容 | 审核详情 | ✅ 3个API | ❌ | ❌ | 审批后不通知pending刷新 |
| flow | 审核流程 | 流程配置 | ⚠️ 1个API | ❌ | ❌ | 新增/编辑/删除仅本地 |
| reject-reasons | 驳回原因 | 原因列表 | ⚠️ 1个API | ❌ | ❌ | CRUD仅本地 |
| statistics | 审核统计 | 统计数据 | ❌ 完全硬编码 | ❌ | ❌ | 所有数据硬编码 |
| detail | 审核详情 | 详情数据 | ❌ 完全硬编码 | ❌ | ❌ | 通过/驳回/转审仅本地 |

**预期数据交互**:
- Review → Script: 剧本审核结果同步
- Review → Storyboard: 分镜审核结果同步
- Review → Points: 审核操作积分消耗
- Review → Notification: 审核结果通知

**实际数据交互**: content页面调用了fetchReviewDecision，但审批后不会通知pending页面刷新列表，是最典型的数据联动缺失案例。

---

### 2.7 工作流模块 (Workflow)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| list | 工作流列表 | 工作流信息 | ⚠️ 1个API | ❌ | ❌ | 列表硬编码，CRUD仅ElMessage |
| execute | 工作流执行 | 执行状态 | ✅ SSE流式API | ❌ | ❌ | 工作流列表硬编码 |
| catalog | 工作流目录 | 目录数据 | ❌ 完全硬编码 | ❌ | ❌ | 执行按钮为空函数 |

**预期数据交互**:
- Workflow → Script: 剧本AI处理工作流
- Workflow → Asset: 资产生成工作流
- Workflow → VideoGen: 视频生成工作流
- Workflow → AIProcess: 处理状态同步

**实际数据交互**: execute实现了SSE流式执行，但结果未同步到其他模块。catalog的执行按钮未实现。

---

### 2.8 视频生成模块 (VideoGen)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| task | 任务管理 | 任务列表 | ✅ 3个API | ❌ | ❌ | 分镜选项硬编码 |
| ai | AI生成 | 分镜数据、生成参数 | ⚠️ 跨模块API | ❌ | ❌ | 镜头类型映射硬编码 |
| history | 历史记录 | 历史列表 | ⚠️ 1个API | ❌ | ❌ | 删除/复用/导出仅本地 |
| preview | 预览 | 预览数据 | ⚠️ 1个API | ❌ | ❌ | 版本列表硬编码，重新生成setTimeout模拟 |

**预期数据交互**:
- VideoGen → Storyboard: 分镜数据关联
- VideoGen → Asset: 生成视频保存到资产
- VideoGen → Points: 生成消耗积分
- VideoGen → Editor: 视频进入剪辑

**实际数据交互**: ai页面跨模块调用storyboard的fetchGetStoryboardList，但task提交后不会通知ai页面刷新。

---

### 2.9 AI处理模块 (AIProcess)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| status | 处理状态 | 任务列表 | ❌ 完全硬编码 | ❌ | ❌ | 刷新/取消仅ElMessage |
| history | 处理历史 | 历史列表 | ❌ 完全硬编码 | ❌ | ❌ | 查询/重试仅ElMessage |

**预期数据交互**:
- AIProcess → Workflow: 工作流执行状态同步
- AIProcess → Script: AI审核结果同步
- AIProcess → Asset: AI生成结果同步
- AIProcess → Notification: 处理完成通知

**实际数据交互**: 完全无。整个模块未对接后端，尽管workflow/execute已实现SSE流式执行。

---

### 2.10 数据历史模块 (DataHistory)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| records | 历史记录 | 版本列表 | ❌ 完全硬编码 | ❌ | ❌ | 查询/回退仅ElMessage |
| rollback | 数据回退 | 版本对比 | ❌ 完全硬编码 | ❌ | ❌ | 确认回退仅ElMessage |

**预期数据交互**:
- DataHistory → Script: 版本回退同步
- DataHistory → Storyboard: 版本回退同步
- DataHistory → Asset: 资产版本管理

**实际数据交互**: 完全无。script/version模块调用了fetchRollbackDataHistory，但data-history自身未调用任何API。

---

### 2.11 积分计费模块 (Points)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| token-usage | Token用量 | 用量明细 | ⚠️ 1个API | ❌ | ❌ | 核心指标/趋势/分布硬编码 |
| transactions | 交易记录 | 交易列表 | ⚠️ 1个API | ❌ | ❌ | 导出仅ElMessage |
| pricing | 定价管理 | 定价列表 | ⚠️ 1个API | ❌ | ❌ | 编辑仅修改本地数据 |
| billing | 账单管理 | 账单数据 | ❌ 完全硬编码 | ❌ | ❌ | 所有数据硬编码 |
| record | 积分记录 | 积分数据 | ❌ 完全硬编码 | ❌ | ❌ | 所有数据硬编码 |

**预期数据交互**:
- Points → VideoGen: 视频生成消耗积分
- Points → Asset: AI生成消耗积分
- Points → Stats: 积分统计数据联动
- Points → Team: 团队配额联动

**实际数据交互**: stats模块跨模块调用points的API（fetchGetTokenUsageRecords、fetchGetCreditTransactions），但为单向读取。

---

### 2.12 统计分析模块 (Stats)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| analysis | 数据分析 | 分析图表 | ⚠️ 2个API | ❌ | ❌ | 成员工作量/产出效率硬编码 |
| report | 报表生成 | 报表数据 | ⚠️ 1个API | ❌ | ❌ | 预览/成本分析硬编码，导出仅ElMessage |
| ai-usage | AI用量 | 用量数据 | ⚠️ 跨模块API | ❌ | ❌ | 与points/token-usage高度重复 |
| cost | 成本分析 | 成本数据 | ⚠️ 跨模块API | ❌ | ❌ | 核心指标/趋势/分布/预测硬编码 |
| usage | 使用统计 | 使用数据 | ❌ 完全硬编码 | ❌ | ❌ | 所有数据硬编码 |
| dashboard | 数据看板 | 看板数据 | ❌ 完全硬编码 | ❌ | ❌ | 所有数据硬编码 |

**预期数据交互**:
- Stats → 全模块: 汇总所有模块的统计数据
- Stats → Points: 积分/成本数据联动
- Stats → Team: 团队排名/工作量数据

**实际数据交互**: 仅单向读取points模块API，且ai-usage与points/token-usage页面高度重复。

---

### 2.13 编辑器模块 (Editor)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| edit-manage | 剪辑项目管理 | 项目列表 | ⚠️ 4个API | ❌ | ❌ | 所属项目选项硬编码，导出仅ElMessage |
| export | 导出管理 | 导出状态 | ⚠️ 2个API | ❌ | ❌ | 重试/删除/下载仅本地 |
| timeline | 时间线 | 轨道/片段 | ❌ 完全硬编码 | ❌ | ❌ | 撤销/重做/导出仅ElMessage，视频URL硬编码 |

**预期数据交互**:
- Editor → VideoGen: 视频素材导入
- Editor → Asset: 资产素材导入
- Editor → Project: 剪辑项目关联

**实际数据交互**: 完全无。timeline所有数据硬编码。

---

### 2.14 系统管理模块 (System)

| 子模块 | 功能 | 数据范围 | API对接 | Store | dataFlowBus | 严重问题 |
|--------|------|---------|---------|-------|-------------|---------|
| user | 用户管理 | 用户列表 | ⚠️ 1个API | ❌ | ❌ | 弹窗提交仅ElMessage，角色列表TODO |
| role | 角色管理 | 角色列表 | ⚠️ 1个API | ✅ menuStore | ❌ | 编辑/权限保存有TODO未对接 |
| menu | 菜单管理 | 菜单列表 | ⚠️ 1个API | ❌ | ❌ | 删除/提交仅ElMessage |
| dify-workflows | Dify工作流 | 工作流列表 | ⚠️ 1个API | ❌ | ❌ | CRUD仅ElMessage |
| user-center | 个人中心 | 用户信息 | ❌ 无 | ✅ userStore | ❌ | 信息/密码修改仅切换编辑状态 |
| video-models | 视频模型 | 模型列表 | ❌ 完全硬编码 | ❌ | ❌ | CRUD仅ElMessage |
| billing-config | 计费配置 | 配置列表 | ❌ 完全硬编码 | ❌ | ❌ | CRUD仅ElMessage |
| platform-teams | 平台团队 | 团队列表 | ❌ 完全硬编码 | ❌ | ❌ | 查询/创建/删除仅ElMessage |
| runtime-config | 运行时配置 | 配置列表 | ❌ 完全硬编码 | ❌ | ❌ | CRUD/刷新缓存仅ElMessage |
| audit-logs | 审计日志 | 日志列表 | ❌ 完全硬编码 | ❌ | ❌ | 查询/导出仅ElMessage |
| admin-dashboard | 管理仪表盘 | 统计数据 | ❌ 完全硬编码 | ❌ | ❌ | 统计卡片和图表占位符硬编码 |
| team-invite | 团队邀请 | 邀请数据 | ❌ 完全硬编码 | ❌ | ❌ | 发送邀请仅ElMessage |
| team-create | 团队创建 | 创建数据 | ❌ 完全硬编码 | ❌ | ❌ | 创建团队仅ElMessage |
| team-permission | 团队权限 | 权限数据 | ❌ 完全硬编码 | ❌ | ❌ | 切换仅修改本地数据 |

**预期数据交互**:
- System → Team: 平台团队管理与团队模块联动
- System → Auth: 用户/角色/权限变更同步
- System → Workflow: 工作流配置同步
- System → Points: 计费配置同步

**实际数据交互**: 极少。仅user/role/menu读取了基础列表API，14个子模块中10个完全硬编码。

---

## 3. 问题汇总表

### 3.1 高严重度问题

| 编号 | 问题 | 影响范围 | 模块 | 根因 |
|------|------|---------|------|------|
| H-01 | dataFlowBus完全未使用 | 全局 | 全模块 | 视图层未集成数据流转平台 |
| H-02 | Store使用极度稀少(96.3%页面无Store) | 全局 | 全模块 | 业务数据未纳入状态管理 |
| H-03 | 17个文件完全硬编码(0% API对接) | 17个文件 | Team/DataHistory/AIProcess/System | 后端对接未完成 |
| H-04 | 23个文件写操作未持久化 | 23个文件 | 多模块 | CRUD操作仅修改本地数据 |
| H-05 | projectDataStore使用硬编码数据 | Store层 | Project/Script | Store未调用API接口 |
| H-06 | scriptProjectStore与projectDataStore循环依赖 | Store层 | Script/Project | 跨Store直接修改状态 |
| H-07 | 大量API接口返回类型为any | 类型安全 | 8个API模块 | 类型定义缺失 |
| H-08 | 生产环境API使用HTTP | 安全 | 全局 | 环境配置不当 |
| H-09 | Token存储在localStorage | 安全 | Auth | 敏感数据存储策略不当 |
| H-10 | 模块间数据不同步 | 数据一致性 | Review/Project/VideoGen | 无跨模块刷新机制 |

### 3.2 中严重度问题

| 编号 | 问题 | 影响范围 | 模块 | 根因 |
|------|------|---------|------|------|
| M-01 | WebSocket客户端未被业务代码使用 | 实时通信 | Notification | 未集成WebSocket到通知系统 |
| M-02 | Mock覆盖不均衡 | 开发效率 | 8个API模块 | 部分模块Mock缺失 |
| M-03 | SSE流式接口绕过HTTP拦截器 | 安全/一致性 | Workflow | 使用原生fetch绕过封装 |
| M-04 | API参数传递方式不一致 | 数据正确性 | 多个API | params/data混用 |
| M-05 | 通知WebSocket Token与客户端未桥接 | 实时通信 | Notification | 缺乏集成点 |
| M-06 | authList按钮级权限仅1处配置 | 权限控制 | System | 其他页面未配置authList |
| M-07 | 锁屏加密密钥硬编码在前端 | 安全 | Settings | 密钥管理不当 |
| M-08 | gpt-image路由模块孤立 | 路由 | GptImage | 未在modules/index.ts注册 |
| M-09 | 功能重复(stats/ai-usage与points/token-usage) | 代码质量 | Stats/Points | 页面设计重复 |
| M-10 | 导出操作均为模拟 | 功能完整性 | 多模块 | 未实现真实下载 |
| M-11 | Exception路由模块冗余 | 路由 | Exception | 静态路由已覆盖 |
| M-12 | 分页模式混乱 | 代码质量 | 多模块 | 服务端/前端分页混用 |

### 3.3 低严重度问题

| 编号 | 问题 | 影响范围 | 模块 | 根因 |
|------|------|---------|------|------|
| L-01 | 跨模块API调用不规范 | 模块边界 | Stats/Asset | 直接调用其他模块API |
| L-02 | 路由参数获取方式不一致 | 代码质量 | Project/Script | params/query混用 |
| L-03 | User子路由roles冗余配置 | 配置 | System | 与父级相同 |
| L-04 | terser与VITE_DROP_CONSOLE重复 | 构建 | 全局 | 两处配置功能重叠 |
| L-05 | RoutePermissionValidator前缀匹配过宽 | 安全 | 路由 | 可能路径越权 |
| L-06 | IframeRouteManager使用sessionStorage | 安全 | 路由 | XSS可读取篡改 |
| L-07 | VITE_WITH_CREDENTIALS设为false | 兼容性 | 全局 | 可能影响Cookie认证 |
| L-08 | v-auth指令不响应路由变化 | 权限 | 指令 | 时序问题 |

---

## 4. 缺陷分析

### 4.1 数据沟通机制缺失分析

#### 4.1.1 跨模块通信架构空白

项目虽已构建了完整的DataFlowBus数据流转平台（含通道管理、转换器、监控告警、可视化），但视图层81个Vue文件中**无一使用**该机制。这导致：

```
当前状态：
  Module A ←→ API ←→ Module B（无关联）
  Module A 的数据变更不会通知 Module B

期望状态：
  Module A → DataFlowBus → Module B（自动联动）
  Module A 的数据变更通过总线自动推送到相关模块
```

#### 4.1.2 Store共享状态缺失

当前7个Store中，仅3个被视图层使用：

| Store | 使用位置 | 覆盖率 |
|-------|---------|--------|
| useScriptProjectStore | Script模块6个文件 | 7.4% |
| useUserStore | System/user-center | 1.2% |
| useMenuStore | System/role | 1.2% |
| useProjectDataStore | **未被任何视图使用** | 0% |
| useSettingStore | **仅布局组件使用** | - |
| useTableStore | **仅表格组件使用** | - |
| useWorktabStore | **仅标签页组件使用** | - |

**关键业务数据**（当前项目、当前团队、审核状态、积分余额等）无全局共享，每个页面独立加载，无法实现数据联动。

#### 4.1.3 事件驱动机制缺失

以下业务场景需要事件驱动但未实现：

| 场景 | 事件源 | 事件消费者 | 当前状态 |
|------|--------|-----------|---------|
| 审批通过 | Review/content | Review/pending | ❌ 不通知 |
| 项目删除 | Project/list | Project/edit | ❌ 不通知 |
| 任务提交 | VideoGen/task | VideoGen/ai | ❌ 不通知 |
| 剧本拆分 | Script/decompose | Storyboard/design | ❌ 不通知 |
| 积分消耗 | VideoGen/ai | Points/token-usage | ❌ 不通知 |
| 团队切换 | Team/list | Project/list | ❌ 不通知 |
| 角色变更 | Team/roles | Auth/permissions | ❌ 不通知 |

### 4.2 数据联动更新缺陷分析

#### 4.2.1 写操作未持久化统计

| 类别 | 文件数 | 占比 | 典型表现 |
|------|--------|------|---------|
| 完全硬编码(0% API) | 17 | 21.0% | 所有数据本地ref/reactive，所有操作ElMessage |
| 大部分硬编码(<30% API) | 12 | 14.8% | 仅列表加载对接API，图表/统计硬编码 |
| 部分硬编码(30%-70% API) | 23 | 28.4% | 读取对接API，写操作仅本地 |
| 较好对接(>70% API) | 29 | 35.8% | 读写基本对接API |

#### 4.2.2 典型联动缺失案例

**案例1: 审核流程断裂**

```
Review/content 审批通过 → fetchReviewDecision() ✅ API调用成功
                         → Review/pending 列表 ❌ 未刷新
                         → Script/ai-review ❌ 未同步审核结果
                         → Notification ❌ 未发送通知
```

**案例2: 项目数据孤岛**

```
Project/list 删除项目 → fetchDeleteProject() ✅ API调用成功
                      → Project/edit ❌ 编辑页仍显示已删除项目
                      → Script/library ❌ 剧本仍关联已删除项目
                      → Dashboard ❌ 统计未更新
```

**案例3: 积分消耗无感知**

```
VideoGen/ai 提交生成 → fetchSubmitVideoGeneration() ✅ API调用成功
                     → Points/token-usage ❌ 用量未刷新
                     → Points/billing ❌ 账单未更新
                     → Stats/ai-usage ❌ 统计未更新
```

### 4.3 跨模块数据引用不一致分析

#### 4.3.1 ID类型不一致

| 数据 | API层类型 | Store层类型 | 视图层类型 |
|------|----------|-----------|-----------|
| projectId | string | number (scriptProjectStore) | string/number混用 |
| teamId | string | - | 硬编码为'1' |
| scriptId | string | - | 部分硬编码 |

#### 4.3.2 数据模型不一致

- projectDataStore中的projects/episodes/storyboards/characters为硬编码数据，与API层返回的数据结构可能不一致
- scriptProjectStore通过storeToRefs引用projectDataStore，但两者的currentProjectId语义不同
- 视图层部分页面直接使用API返回数据，部分使用Store数据，数据来源不统一

### 4.4 数据同步异常处理分析

#### 4.4.1 当前异常处理机制

HTTP层（src/utils/http）提供了：
- 401未授权自动登出（带防抖）
- 请求失败自动重试（MAX_RETRIES=0，实际未启用）
- 统一错误消息提示
- HttpError自定义错误类

#### 4.4.2 缺失的异常处理

| 场景 | 当前状态 | 风险 |
|------|---------|------|
| API调用失败后本地数据回滚 | ❌ 无 | 数据不一致 |
| 并发修改冲突处理 | ❌ 无 | 数据覆盖 |
| 网络断开恢复后数据同步 | ❌ 无 | 数据过期 |
| 长时间操作超时处理 | ❌ 无（timeout=15s） | 用户体验差 |
| 批量操作部分失败处理 | ❌ 无 | 数据不完整 |
| SSE连接断开重连 | ❌ 无 | 流式数据丢失 |

### 4.5 模块接口设计评估

#### 4.5.1 API接口设计问题

**问题1: params/data混用**

```typescript
// 正确：使用data传递请求体
fetchBatchDeleteStoryboards({ data: { ids } })

// 错误：使用params传递请求体（会被序列化为URL查询参数）
fetchBatchSubmitStoryboardReview({ params: { ids, reviewType } })
```

影响模块：storyboard、notification等多个API

**问题2: SSE接口绕过封装**

```typescript
// workflow.ts 中直接使用原生fetch
const response = await fetch(url, { method: 'POST', ... })
// 绕过了axios拦截器，Token刷新、错误处理均不生效
```

**问题3: 返回类型any泛滥**

8个API模块（statistics、workflow-manage、video-model、system-config、platform-admin、billing、character、script-asset）的接口返回类型全部为any，丧失TypeScript类型检查优势。

---

## 5. 技术选型升级评估

### 5.1 状态管理解决方案评估

#### 5.1.1 当前方案分析

项目当前使用 **Pinia 3.0.3** + **pinia-plugin-persistedstate 4.3.0**，配置了版本化存储键和自动数据迁移。

**优势**:
- Vue 3官方推荐，与Composition API深度集成
- TypeScript支持优秀
- 插件生态成熟（持久化、DevTools集成）
- 已在项目中使用，团队有经验

**不足**:
- 业务Store使用率极低（仅3个被视图层使用）
- projectDataStore使用硬编码数据，未与API联通
- 缺少跨Store协作机制

#### 5.1.2 候选方案对比

| 维度 | Pinia (当前) | Vuex 5 | Zustand | MobX |
|------|-------------|--------|---------|------|
| Vue兼容性 | ★★★★★ 原生 | ★★★★★ 官方 | ★★☆☆☆ 需适配 | ★★☆☆☆ 需适配 |
| TypeScript | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| 学习曲线 | ★★★★★ 低 | ★★★☆☆ 中 | ★★★★☆ 低 | ★★★☆☆ 中 |
| DevTools | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| 持久化 | ★★★★★ 插件 | ★★★☆☆ 需自实现 | ★★★★☆ 中间件 | ★★★☆☆ 需自实现 |
| SSR支持 | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ |
| 包体积 | 1.2KB | 6KB | 1.1KB | 16KB |
| 社区活跃度 | ★★★★★ | ★★★★☆ | ★★★★★(React) | ★★★☆☆ |

#### 5.1.3 选型建议

**推荐：继续使用 Pinia，但需重构业务Store架构**

理由：
1. 项目已深度集成Pinia，迁移成本高且无收益
2. Pinia是Vue 3生态唯一官方推荐方案
3. 当前问题不在工具选型，而在架构设计——Store使用率极低是设计问题而非工具问题
4. 需补充业务Store（如projectStore、teamStore、reviewStore等），将硬编码数据迁移到Store+API模式

**建议的Store架构重构**:

```
store/
├── modules/
│   ├── user.ts          (已有，需扩展)
│   ├── setting.ts       (已有，UI状态)
│   ├── table.ts         (已有，UI状态)
│   ├── menu.ts          (已有，需扩展)
│   ├── worktab.ts       (已有，UI状态)
│   ├── project.ts       (新增，替代projectDataStore)
│   ├── team.ts          (新增)
│   ├── script.ts        (新增，替代scriptProjectStore)
│   ├── storyboard.ts    (新增)
│   ├── asset.ts         (新增)
│   ├── review.ts        (新增)
│   ├── workflow.ts      (新增)
│   ├── notification.ts  (新增)
│   └── points.ts        (新增)
├── composables/         (新增，Store组合逻辑)
│   ├── useProjectContext.ts
│   └── useTeamContext.ts
└── index.ts
```

### 5.2 服务端通信方案评估

#### 5.2.1 当前方案分析

项目当前使用 **Axios 1.12.2** 作为主要HTTP客户端，**原生fetch** 用于SSE流式请求。

**优势**:
- 拦截器机制成熟
- 请求/响应转换灵活
- 重试机制已实现（但MAX_RETRIES=0未启用）
- 401防抖处理

**不足**:
- 无请求缓存机制（重复请求浪费带宽）
- 无请求去重（并发相同请求）
- 无请求取消（组件卸载时未取消pending请求）
- SSE接口绕过封装
- 缺少请求状态管理（loading/error/data）

#### 5.2.2 通信方式对比

| 维度 | REST API (当前) | GraphQL | WebSocket | SSE |
|------|----------------|---------|-----------|-----|
| 适用场景 | CRUD操作 | 复杂查询 | 双向实时 | 单向实时 |
| 数据获取 | 固定结构 | 按需获取 | 推送 | 推送 |
| 缓存能力 | HTTP缓存 | Apollo缓存 | 无 | 无 |
| 离线支持 | ★★★☆☆ | ★★★★☆ | ★★☆☆☆ | ★☆☆☆☆ |
| 学习曲线 | ★★★★★ 低 | ★★☆☆☆ 高 | ★★★☆☆ 中 | ★★★★☆ 低 |
| 当前使用 | ✅ 主要 | ❌ | ❌ 已实现未使用 | ✅ Workflow |

#### 5.2.3 请求库对比

| 维度 | Axios (当前) | Fetch API | TanStack Query | SWR |
|------|-------------|-----------|---------------|-----|
| 请求缓存 | ❌ | ❌ | ✅ 内置 | ✅ 内置 |
| 请求去重 | ❌ | ❌ | ✅ 内置 | ✅ 内置 |
| 自动重试 | ✅ 已实现 | ❌ | ✅ 内置 | ✅ 内置 |
| 请求取消 | ⚠️ 需手动 | ✅ AbortController | ✅ 自动 | ✅ 自动 |
| Loading状态 | ❌ 需手动 | ❌ 需手动 | ✅ 内置 | ✅ 内置 |
| 错误处理 | ✅ 拦截器 | ❌ 需手动 | ✅ 内置 | ✅ 内置 |
| 分页支持 | ❌ | ❌ | ✅ useInfiniteQuery | ✅ useSWRInfinite |
| 预请求 | ❌ | ❌ | ✅ prefetch | ✅ prefetch |
| Vue支持 | ✅ | ✅ | ✅ vue-query | ✅ swr-vue |
| 包体积 | 14KB | 0KB | 13KB | 4KB |

#### 5.2.4 选型建议

**推荐：Axios + TanStack Query (Vue Query) 组合方案**

理由：
1. 保留Axios作为底层HTTP客户端（拦截器、Token管理、错误处理）
2. 引入TanStack Query管理请求状态（缓存、去重、自动重试、loading/error）
3. TanStack Query与Pinia互补——Query管理服务端状态，Pinia管理客户端状态
4. 解决当前"每个页面独立加载、无缓存、无去重"的核心问题

**架构设计**:

```
utils/http/               (底层HTTP封装，已有)
  ├── index.ts            (Axios实例、拦截器)
  ├── error.ts            (错误处理)
  └── status.ts           (状态码)

composables/query/        (新增，TanStack Query封装)
  ├── useProjectQuery.ts  (项目相关查询)
  ├── useScriptQuery.ts   (剧本相关查询)
  ├── useTeamQuery.ts     (团队相关查询)
  └── ...

api/                      (API定义层，已有)
  ├── project.ts
  ├── script.ts
  └── ...
```

**通信方式选择**:

| 业务场景 | 推荐方式 | 理由 |
|---------|---------|------|
| 常规CRUD | REST API + TanStack Query | 标准化、可缓存 |
| AI工作流执行 | SSE (需封装) | 流式输出、实时反馈 |
| 通知推送 | WebSocket (需集成) | 双向实时通信 |
| 数据大屏 | WebSocket + REST | 实时推送+初始加载 |

---

## 6. 数据层架构设计

### 6.1 模拟数据服务设计

#### 6.1.1 数据模型定义

基于现有API类型定义，建立完整的Mock数据模型体系：

```typescript
// src/mock/models/index.ts

export interface MockProject {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'deleted'
  teamId: string
  createdAt: string
  updatedAt: string
  memberCount: number
  scriptCount: number
  storyboardCount: number
  assetCount: number
}

export interface MockScript {
  id: string
  projectId: string
  title: string
  content: string
  status: 'draft' | 'reviewing' | 'approved' | 'rejected'
  episodes: MockEpisode[]
  createdAt: string
  updatedAt: string
}

export interface MockEpisode {
  id: string
  scriptId: string
  projectId: string
  title: string
  episodeNumber: number
  storyboardCount: number
}

export interface MockStoryboard {
  id: string
  projectId: string
  episodeId: string
  shotNumber: number
  description: string
  dialogue: string
  cameraMovement: string
  duration: number
  imageUrl?: string
  status: 'draft' | 'reviewing' | 'approved' | 'rejected'
}

export interface MockCharacter {
  id: string
  projectId: string
  name: string
  role: string
  description: string
  avatarUrl?: string
}

export interface MockAsset {
  id: string
  projectId: string
  teamId: string
  name: string
  type: 'image' | 'video' | 'audio' | 'document'
  url: string
  fileSize: number
  tags: string[]
  category: string
  createdAt: string
}

export interface MockTeam {
  id: string
  name: string
  description: string
  memberCount: number
  projectCount: number
  quota: MockQuota
  isCurrent: boolean
}

export interface MockQuota {
  aiGenerationLimit: number
  aiGenerationUsed: number
  storageLimit: number
  storageUsed: number
  videoGenerationLimit: number
  videoGenerationUsed: number
}

export interface MockReview {
  id: string
  projectId: string
  type: 'script' | 'storyboard' | 'asset'
  targetId: string
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  assigneeId: string
  submitterId: string
  createdAt: string
}

export interface MockUser {
  id: string
  username: string
  email: string
  avatar: string
  role: 'R_SUPER' | 'R_ADMIN' | 'R_MEMBER'
  teamId: string
  points: number
}

export interface MockNotification {
  id: string
  userId: string
  title: string
  content: string
  type: 'system' | 'review' | 'team' | 'points'
  isRead: boolean
  createdAt: string
}

export interface MockWorkflow {
  id: string
  name: string
  code: string
  description: string
  status: 'active' | 'inactive'
  category: string
}

export interface MockPointsTransaction {
  id: string
  userId: string
  projectId: string
  amount: number
  type: 'consume' | 'recharge' | 'refund'
  description: string
  createdAt: string
}
```

#### 6.1.2 数据生成规则

```typescript
// src/mock/generators/index.ts

import { faker } from '@faker-js/faker/locale/zh_CN'

export function generateProject(overrides?: Partial<MockProject>): MockProject {
  return {
    id: faker.string.uuid(),
    name: faker.company.name() + '项目',
    description: faker.lorem.paragraph(),
    status: faker.helpers.arrayElement(['active', 'archived', 'deleted']),
    teamId: faker.string.uuid(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    memberCount: faker.number.int({ min: 1, max: 20 }),
    scriptCount: faker.number.int({ min: 0, max: 10 }),
    storyboardCount: faker.number.int({ min: 0, max: 50 }),
    assetCount: faker.number.int({ min: 0, max: 100 }),
    ...overrides
  }
}

export function generateScript(overrides?: Partial<MockScript>): MockScript {
  return {
    id: faker.string.uuid(),
    projectId: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(10),
    status: faker.helpers.arrayElement(['draft', 'reviewing', 'approved', 'rejected']),
    episodes: [],
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  }
}

// ... 其他生成器
```

#### 6.1.3 Mock数据服务

```typescript
// src/mock/services/MockDataService.ts

export class MockDataService {
  private static instance: MockDataService
  private data: Map<string, any[]> = new Map()

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  initialize(): void {
    this.data.set('projects', Array.from({ length: 20 }, () => generateProject()))
    this.data.set('scripts', Array.from({ length: 30 }, () => generateScript()))
    this.data.set('storyboards', Array.from({ length: 50 }, () => generateStoryboard()))
    this.data.set('characters', Array.from({ length: 15 }, () => generateCharacter()))
    this.data.set('assets', Array.from({ length: 40 }, () => generateAsset()))
    this.data.set('teams', Array.from({ length: 5 }, () => generateTeam()))
    this.data.set('reviews', Array.from({ length: 25 }, () => generateReview()))
    this.data.set('users', Array.from({ length: 10 }, () => generateUser()))
    this.data.set('notifications', Array.from({ length: 30 }, () => generateNotification()))
    this.data.set('workflows', Array.from({ length: 8 }, () => generateWorkflow()))
    this.data.set('transactions', Array.from({ length: 50 }, () => generatePointsTransaction()))
  }

  getList<T>(key: string): T[] {
    return this.data.get(key) || []
  }

  getItem<T>(key: string, id: string): T | undefined {
    return this.data.get(key)?.find((item: any) => item.id === id)
  }

  createItem<T>(key: string, item: T): T {
    const list = this.data.get(key) || []
    list.push(item)
    this.data.set(key, list)
    return item
  }

  updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | undefined {
    const list = this.data.get(key) || []
    const index = list.findIndex((item: any) => item.id === id)
    if (index === -1) return undefined
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() }
    this.data.set(key, list)
    return list[index]
  }

  deleteItem(key: string, id: string): boolean {
    const list = this.data.get(key) || []
    const index = list.findIndex((item: any) => item.id === id)
    if (index === -1) return false
    list.splice(index, 1)
    this.data.set(key, list)
    return true
  }

  query<T>(key: string, predicate: (item: T) => boolean): T[] {
    return (this.data.get(key) || []).filter(predicate)
  }

  paginate<T>(key: string, page: number, size: number, predicate?: (item: T) => boolean): {
    list: T[]
    total: number
    page: number
    size: number
  } {
    let filtered = this.data.get(key) || []
    if (predicate) filtered = filtered.filter(predicate)
    const total = filtered.length
    const start = (page - 1) * size
    const list = filtered.slice(start, start + size)
    return { list, total, page, size }
  }
}
```

### 6.2 接口适配层设计

#### 6.2.1 适配层架构

```
src/api/
├── adapter/                    (新增，接口适配层)
│   ├── interface.ts            (统一接口定义)
│   ├── mock-adapter.ts         (Mock数据适配器)
│   ├── http-adapter.ts         (真实API适配器)
│   ├── adapter-factory.ts      (适配器工厂)
│   └── middleware/             (中间件)
│       ├── request-logger.ts   (请求日志)
│       ├── response-transform.ts (响应转换)
│       ├── error-handler.ts    (错误处理)
│       └── cache.ts            (缓存中间件)
├── project.ts                  (已有，需重构)
├── script.ts
└── ...
```

#### 6.2.2 统一接口定义

```typescript
// src/api/adapter/interface.ts

export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
  signal?: AbortSignal
}

export interface PaginatedParams {
  current: number
  size: number
  [key: string]: any
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  current: number
  size: number
}

export interface IApiAdapter {
  request<T>(config: RequestConfig): Promise<T>
  get<T>(url: string, params?: Record<string, any>): Promise<T>
  post<T>(url: string, data?: any): Promise<T>
  put<T>(url: string, data?: any): Promise<T>
  delete<T>(url: string, data?: any): Promise<T>
  getPage<T>(url: string, params: PaginatedParams): Promise<PaginatedResponse<T>>
}

export interface IStreamAdapter {
  connect(url: string, data?: any): AsyncIterable<ServerSentEvent>
  disconnect(): void
}

export interface ServerSentEvent {
  event?: string
  data: string
  id?: string
  retry?: number
}
```

#### 6.2.3 Mock适配器

```typescript
// src/api/adapter/mock-adapter.ts

import type { IApiAdapter, RequestConfig, PaginatedParams, PaginatedResponse } from './interface'
import { MockDataService } from '@/mock/services/MockDataService'

export class MockAdapter implements IApiAdapter {
  private service: MockDataService
  private delay: number

  constructor(delay: number = 300) {
    this.service = MockDataService.getInstance()
    this.delay = delay
  }

  private async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delay + Math.random() * 200))
  }

  private resolvePath(url: string): { resource: string; id?: string } {
    const cleanUrl = url.replace(/^\/api\//, '')
    const parts = cleanUrl.split('/')
    return {
      resource: parts[0],
      id: parts[1]
    }
  }

  async request<T>(config: RequestConfig): Promise<T> {
    await this.simulateDelay()
    const { resource, id } = this.resolvePath(config.url)

    switch (config.method) {
      case 'GET':
        if (id) return this.service.getItem(resource, id) as T
        return this.service.getList(resource) as T
      case 'POST':
        return this.service.createItem(resource, config.data) as T
      case 'PUT':
        return this.service.updateItem(resource, id!, config.data) as T
      case 'DELETE':
        this.service.deleteItem(resource, id!)
        return undefined as T
      default:
        throw new Error(`Unsupported method: ${config.method}`)
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>({ url, method: 'GET', params })
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'POST', data })
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data })
  }

  async delete<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', data })
  }

  async getPage<T>(url: string, params: PaginatedParams): Promise<PaginatedResponse<T>> {
    await this.simulateDelay()
    const { resource } = this.resolvePath(url)
    const { current, size, ...filters } = params
    return this.service.paginate<T>(resource, current, size, filters)
  }
}
```

#### 6.2.4 HTTP适配器

```typescript
// src/api/adapter/http-adapter.ts

import type { IApiAdapter, RequestConfig, PaginatedParams, PaginatedResponse } from './interface'
import api from '@/utils/http'

export class HttpAdapter implements IApiAdapter {
  async request<T>(config: RequestConfig): Promise<T> {
    return api.request<T>({
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,
      showErrorMessage: config.showErrorMessage,
      showSuccessMessage: config.showSuccessMessage,
      signal: config.signal
    })
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return api.get<T>({ url, params })
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return api.post<T>({ url, data })
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return api.put<T>({ url, data })
  }

  async delete<T>(url: string, data?: any): Promise<T> {
    return api.del<T>({ url, data })
  }

  async getPage<T>(url: string, params: PaginatedParams): Promise<PaginatedResponse<T>> {
    return api.get<PaginatedResponse<T>>({ url, params })
  }
}
```

#### 6.2.5 适配器工厂

```typescript
// src/api/adapter/adapter-factory.ts

import type { IApiAdapter } from './interface'
import { MockAdapter } from './mock-adapter'
import { HttpAdapter } from './http-adapter'

type AdapterMode = 'mock' | 'http' | 'hybrid'

interface AdapterFactoryConfig {
  mode: AdapterMode
  mockRoutes?: string[]
  httpRoutes?: string[]
  mockDelay?: number
}

class AdapterFactory {
  private static instance: AdapterFactory
  private mockAdapter: MockAdapter
  private httpAdapter: HttpAdapter
  private config: AdapterFactoryConfig

  private constructor(config: AdapterFactoryConfig) {
    this.config = config
    this.mockAdapter = new MockAdapter(config.mockDelay)
    this.httpAdapter = new HttpAdapter()
  }

  static initialize(config: AdapterFactoryConfig): void {
    AdapterFactory.instance = new AdapterFactory(config)
  }

  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      throw new Error('AdapterFactory not initialized')
    }
    return AdapterFactory.instance
  }

  getAdapter(url?: string): IApiAdapter {
    switch (this.config.mode) {
      case 'mock':
        return this.mockAdapter
      case 'http':
        return this.httpAdapter
      case 'hybrid':
        if (url && this.config.mockRoutes?.some((route) => url.startsWith(route))) {
          return this.mockAdapter
        }
        if (url && this.config.httpRoutes?.some((route) => url.startsWith(route))) {
          return this.httpAdapter
        }
        return this.httpAdapter
      default:
        return this.httpAdapter
    }
  }
}

export function initializeAdapter(config?: Partial<AdapterFactoryConfig>): void {
  const defaultConfig: AdapterFactoryConfig = {
    mode: import.meta.env.VITE_API_MODE === 'mock' ? 'mock' : 'http',
    mockDelay: 300,
    ...config
  }
  AdapterFactory.initialize(defaultConfig)
}

export function getAdapter(url?: string): IApiAdapter {
  return AdapterFactory.getInstance().getAdapter(url)
}
```

### 6.3 环境切换机制设计

#### 6.3.1 环境配置

```ini
# .env (通用)
VITE_API_MODE=mock
VITE_MOCK_DELAY=300

# .env.development (开发)
VITE_API_MODE=mock
VITE_API_URL=/
VITE_API_PROXY_URL=http://server.bsuniversal.cn:10006

# .env.staging (测试)
VITE_API_MODE=http
VITE_API_URL=https://staging-api.example.com

# .env.production (生产)
VITE_API_MODE=http
VITE_API_URL=https://api.example.com
```

#### 6.3.2 混合模式配置

```typescript
// src/config/api-mode.ts

export const apiModeConfig = {
  mock: {
    mode: 'mock' as const,
    mockRoutes: ['/api'],
    mockDelay: 300
  },
  http: {
    mode: 'http' as const,
    httpRoutes: ['/api']
  },
  hybrid: {
    mode: 'hybrid' as const,
    mockRoutes: [
      '/api/statistics',
      '/api/billing',
      '/api/system-config',
      '/api/ai-process'
    ],
    httpRoutes: [
      '/api/auth',
      '/api/projects',
      '/api/scripts',
      '/api/storyboards',
      '/api/assets',
      '/api/teams',
      '/api/reviews',
      '/api/workflows',
      '/api/notifications',
      '/api/points'
    ],
    mockDelay: 300
  }
}
```

#### 6.3.3 运行时切换

```typescript
// src/composables/useApiMode.ts

import { ref, readonly } from 'vue'

type ApiMode = 'mock' | 'http' | 'hybrid'

const currentMode = ref<ApiMode>(
  (import.meta.env.VITE_API_MODE as ApiMode) || 'mock'
)

export function useApiMode() {
  function switchMode(mode: ApiMode) {
    currentMode.value = mode
    initializeAdapter(apiModeConfig[mode])
  }

  function toggleMock() {
    switchMode(currentMode.value === 'mock' ? 'http' : 'mock')
  }

  return {
    currentMode: readonly(currentMode),
    switchMode,
    toggleMock,
    isMock: () => currentMode.value === 'mock'
  }
}
```

### 6.4 统一错误处理策略

```typescript
// src/api/adapter/middleware/error-handler.ts

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  MOCK_ERROR = 'MOCK_ERROR'
}

export class ApiError extends Error {
  code: ErrorCode
  status?: number
  data?: any
  retryable: boolean

  constructor(options: {
    message: string
    code: ErrorCode
    status?: number
    data?: any
    retryable?: boolean
  }) {
    super(options.message)
    this.code = options.code
    this.status = options.status
    this.data = options.data
    this.retryable = options.retryable ?? false
  }
}

export function createErrorHandler(mode: 'mock' | 'http') {
  return function handleError(error: unknown): ApiError {
    if (error instanceof ApiError) return error

    if (mode === 'mock') {
      return new ApiError({
        message: '模拟数据服务异常',
        code: ErrorCode.MOCK_ERROR,
        retryable: true
      })
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new ApiError({
        message: '网络连接失败',
        code: ErrorCode.NETWORK_ERROR,
        retryable: true
      })
    }

    return new ApiError({
      message: '未知错误',
      code: ErrorCode.SERVER_ERROR,
      retryable: false
    })
  }
}
```

### 6.5 接口版本控制方案

```typescript
// src/api/adapter/version.ts

export interface ApiVersionConfig {
  current: string
  supported: string[]
  deprecated: string[]
  sunset: Record<string, string>
}

export const apiVersionConfig: ApiVersionConfig = {
  current: 'v1',
  supported: ['v1'],
  deprecated: [],
  sunset: {}
}

export function versionedUrl(url: string): string {
  const version = apiVersionConfig.current
  if (url.includes(`/api/${version}/`)) return url
  return url.replace('/api/', `/api/${version}/`)
}
```

---

## 7. 改进建议与优先级

### 7.1 紧急修复 (P0)

| 编号 | 建议 | 工作量 | 预期效果 |
|------|------|--------|---------|
| P0-01 | 生产环境API改为HTTPS | 0.5天 | 消除中间人攻击风险 |
| P0-02 | Token从localStorage迁移到httpOnly Cookie或sessionStorage | 1天 | 降低XSS令牌窃取风险 |
| P0-03 | 为team、data-history、ai-process三个完全硬编码模块对接后端API | 5天 | 17个文件从0%到70%+ API对接 |

### 7.2 重要修复 (P1)

| 编号 | 建议 | 工作量 | 预期效果 |
|------|------|--------|---------|
| P1-01 | 重构Store架构，新增业务Store(project/team/script/storyboard/asset/review等) | 5天 | 消除数据孤岛，实现跨页面状态共享 |
| P1-02 | 引入TanStack Query管理服务端状态 | 3天 | 请求缓存、去重、自动重试、loading/error管理 |
| P1-03 | 为23个"写操作仅本地"的页面补充API持久化 | 8天 | 数据操作真正持久化 |
| P1-04 | 激活dataFlowBus，在关键业务场景中实现跨模块数据联动 | 3天 | 审批通知、项目删除联动等 |
| P1-05 | 集成WebSocket到通知系统 | 2天 | 实时通知推送 |
| P1-06 | 消除API返回类型any，补充TypeScript类型定义 | 3天 | 类型安全 |
| P1-07 | 统一POST/PUT请求体传递方式(params→data) | 1天 | 请求正确性 |
| P1-08 | 封装SSE请求，纳入统一HTTP拦截器体系 | 1天 | 安全一致性 |
| P1-09 | 锁屏密钥改为后端提供或用户派生密钥 | 1天 | 安全性提升 |

### 7.3 一般改进 (P2)

| 编号 | 建议 | 工作量 | 预期效果 |
|------|------|--------|---------|
| P2-01 | 构建完整Mock数据服务(MockDataService) | 3天 | 开发阶段数据支撑 |
| P2-02 | 实现接口适配层(AdapterFactory) | 2天 | Mock/HTTP无缝切换 |
| P2-03 | 合并stats/ai-usage与points/token-usage重复页面 | 2天 | 代码精简 |
| P2-04 | 为需要按钮级权限的页面补充authList配置 | 2天 | 权限控制完整性 |
| P2-05 | 统一分页模式(服务端分页) | 2天 | 代码一致性 |
| P2-06 | 实现导出功能(报表/历史/视频) | 3天 | 功能完整性 |
| P2-07 | 删除孤立gpt-image路由模块或注册到路由 | 0.5天 | 路由清晰 |
| P2-08 | 移除冗余Exception路由模块 | 0.5天 | 路由清晰 |

### 7.4 优化建议 (P3)

| 编号 | 建议 | 工作量 | 预期效果 |
|------|------|--------|---------|
| P3-01 | 统一路由参数获取方式 | 1天 | 代码一致性 |
| P3-02 | 子路由显式声明roles | 1天 | 权限明确 |
| P3-03 | RoutePermissionValidator精确匹配 | 1天 | 安全性提升 |
| P3-04 | 统一terser与VITE_DROP_CONSOLE配置 | 0.5天 | 配置清晰 |
| P3-05 | 启用HTTP重试机制(MAX_RETRIES>0) | 0.5天 | 请求可靠性 |

### 7.5 实施路线图

```
第一阶段 (1-2周): 安全修复 + 核心模块API对接
  ├── P0-01: HTTPS配置
  ├── P0-02: Token存储迁移
  └── P0-03: team/data-history/ai-process API对接

第二阶段 (2-3周): 数据层架构重构
  ├── P1-01: Store架构重构
  ├── P1-02: TanStack Query引入
  ├── P2-01: Mock数据服务
  └── P2-02: 接口适配层

第三阶段 (2-3周): 数据联动 + 写操作持久化
  ├── P1-03: 写操作API持久化(23个文件)
  ├── P1-04: dataFlowBus激活
  ├── P1-05: WebSocket集成
  └── P1-06: 类型定义补充

第四阶段 (1-2周): 代码质量 + 功能完善
  ├── P1-07 ~ P1-09: API一致性修复
  ├── P2-03 ~ P2-08: 代码优化
  └── P3-01 ~ P3-05: 细节优化
```

---

## 附录A: API接口完整清单

### auth.ts (12个接口)

| 函数名 | 方法 | 路径 |
|--------|------|------|
| fetchRegister | POST | /api/auth/register |
| fetchLogin | POST | /api/auth/login |
| fetchLogout | POST | /api/auth/logout |
| fetchRefresh | POST | /api/auth/refresh |
| fetchRefreshToken | POST | /api/auth/refresh-token |
| fetchCaptcha | GET | /api/auth/captcha |
| fetchEmailCaptcha | POST | /api/auth/captcha/email |
| fetchResetPassword | POST | /api/auth/password/reset |
| fetchGetUserInfo | GET | /api/auth/me |
| fetchUpdateProfile | PUT | /api/auth/profile |
| fetchUploadAvatar | POST | /api/auth/avatar |
| fetchGetAvatar | GET | /api/auth/avatar/:userId |
| fetchGetPermissions | GET | /api/auth/permissions |

### project.ts (20个接口)

| 函数名 | 方法 | 路径 |
|--------|------|------|
| fetchGetProjectList | GET | /api/projects |
| fetchGetProjectDetail | GET | /api/projects/:id |
| fetchCreateProject | POST | /api/projects |
| fetchUpdateProject | PUT | /api/projects/:id |
| fetchDeleteProject | DELETE | /api/projects/:id |
| fetchRestoreProject | POST | /api/projects/:id/restore |
| fetchArchiveProject | POST | /api/projects/:id/archive |
| fetchUnarchiveProject | POST | /api/projects/:id/unarchive |
| fetchUpdateProjectStatus | PUT | /api/projects/:id/status |
| fetchCopyProject | POST | /api/projects/:id/copy |
| fetchUploadProjectCover | POST | /api/projects/:id/cover |
| fetchGetProjectMembers | GET | /api/projects/:id/members |
| fetchAddProjectMember | POST | /api/projects/:id/members |
| fetchUpdateProjectMemberRole | PUT | /api/projects/:id/members/role |
| fetchRemoveProjectMember | DELETE | /api/projects/:id/members/:mid |
| fetchGetProjectConfig | GET | /api/projects/:id/config |
| fetchUpdateProjectConfig | PUT | /api/projects/:id/config |
| fetchGetReviewConfig | GET | /api/projects/:id/review-config |
| fetchUpdateReviewConfig | PUT | /api/projects/:id/review-config |
| fetchGetProjectStatistics | GET | /api/projects/:id/statistics |

### script.ts (22个接口)

涵盖：CRUD、审核提交/撤回/状态、分集管理、人物小传生成、资产提取、风格配置、参考图分析、违规审核、音色提示词、资产生成进度、视频提示词等。

### storyboard.ts (17个接口)

涵盖：CRUD、批量操作、审核提交/撤回、版本管理、配图管理、资产关联、重排序、镜头管理、分镜拆解/重建等。

### asset.ts (20个接口)

涵盖：CRUD、上传（单文件/分片/批量）、下载、版本管理、标签管理、分类移动、AI生成、参考图管理、团队资产库等。

### team.ts (22个接口)

涵盖：团队信息、成员管理、角色权限、邀请码、加入申请等。

### review.ts (17个接口)

涵盖：审核任务CRUD、认领、决策、撤回、归档、下发、状态查询、统计、导出、驳回原因管理、路由配置等。

### workflow.ts (9个接口)

涵盖：文件上传、阻塞/流式执行、停止、状态查询、多模态执行、链式执行、风格反推、工作流目录等。

### notification.ts (20个接口)

涵盖：CRUD、已读/未读管理、收藏、搜索、导出、偏好设置、免打扰、订阅管理、WebSocket Token等。

### statistics.ts (17个接口)

涵盖：看板、实时数据、趋势、积分、预警、团队排名/工作量/贡献度/活跃度、项目完成率、报表管理、视频/分镜/资源/AI消耗统计等。

### video.ts (8个接口)

涵盖：视频生成提交、预览、任务列表/详情/结果、取消、提示词生成/违规检测/修改等。

### image.ts (6个接口)

涵盖：图片生成提交、任务状态/审核状态/结果查询、模型列表/详情等。

### editor.ts (9个接口)

涵盖：剪辑项目CRUD、片段管理、重排序、导出及状态查询等。

### points.ts (8个接口)

涵盖：个人/项目积分余额、流水、定价列表、Token用量统计/记录等。

### billing.ts (6个接口)

涵盖：定价CRUD、启停、调价历史等。

### character.ts (7个接口)

涵盖：角色CRUD、分镜关联/取消关联、按分镜查询角色等。

### script-asset.ts (9个接口)

涵盖：创意资产CRUD、批量创建、上传参考图、生成提示词/图片、审核图片等。

### workflow-manage.ts (7个接口)

涵盖：Dify工作流CRUD、启停、连通性测试等。

### video-model.ts (5个接口)

涵盖：模型CRUD、状态切换等。

### system-config.ts (11个接口)

涵盖：配置CRUD、分组查询、审计日志、缓存刷新、Webhook管理等。

### system-manage.ts (4个接口)

涵盖：用户列表/详情/状态、菜单列表、角色列表等。

### platform-admin.ts (13个接口)

涵盖：团队管理、成员管理、邀请码、加入申请审批等。

### ai-process.ts (3个接口)

涵盖：处理状态查询、历史列表、历史详情等。

### data-history.ts (3个接口)

涵盖：历史版本列表/详情、数据回退等。

---

## 附录B: Store模块完整清单

| Store | 状态字段数 | Actions数 | Getters数 | 持久化 | 视图使用率 |
|-------|-----------|----------|----------|--------|-----------|
| userStore | 8 | 10 | 3 | ✅ localStorage | 1.2% |
| settingStore | 27+ | 25+ | 5 | ✅ localStorage | 布局组件 |
| tableStore | 5 | 5 | 0 | ✅ 部分 | 表格组件 |
| menuStore | 4 | 6 | 0 | ❌ | 1.2% |
| worktabStore | 3 | 17 | 3 | ✅ localStorage | 标签页组件 |
| scriptProjectStore | 1 | 2 | 3 | ❌ | 7.4% |
| projectDataStore | 8 | 9 | 6 | ❌ | 0% |

---

## 附录C: 数据流转平台通道清单

| 通道ID | 方向 | 源 | 目标 | 状态 |
|--------|------|---|------|------|
| flow:api->project-list | 单向 | API | 页面 | 已注册未使用 |
| flow:api->script-list | 单向 | API | 页面 | 已注册未使用 |
| flow:api->asset-list | 单向 | API | 页面 | 已注册未使用 |
| flow:api->review-list | 单向 | API | 页面 | 已注册未使用 |
| flow:api->workflow-list | 单向 | API | 页面 | 已注册未使用 |
| flow:api->team-list | 单向 | API | 页面 | 已注册未使用 |
| flow:store->user-info | 广播 | Store | 页面 | 已注册未使用 |
| flow:store->settings | 广播 | Store | 页面 | 已注册未使用 |
| flow:store->project-data | 双向 | Store | 页面 | 已注册未使用 |
| flow:page->api:form-submit | 单向 | 页面 | API | 已注册未使用 |
| flow:event-bus:global | 广播 | 事件总线 | 全局 | 已注册未使用 |

---

*报告生成时间: 2026-05-30*  
*审核工具: Trae AI Code Assistant*  
*报告版本: v1.0*
