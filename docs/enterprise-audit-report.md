# DreamCraft Astra 项目数据联通性与技术架构审核报告

---

## 项目基本信息

| 项目 | 详情 |
|------|------|
| 项目名称 | DreamCraft Astra (art-design-pro) |
| 审核日期 | 2026-05-30 |
| 技术栈 | Vue 3.5.21 + TypeScript 5.6 + Pinia 3.0.3 + Vite 7.1.5 + Element Plus 2.11 + Axios 1.12 |
| 后端API | http://server.bsuniversal.cn:10006 (287个端点，24个模块) |
| 审核范围 | 14个业务模块、81个Vue视图文件、24个API模块、7个Store模块 |

---

## 第1章: 执行摘要

### 1.1 总体评估表格

| 评估维度 | 成熟度评级 | 说明 |
|----------|-----------|------|
| API接口定义 | ⭐⭐⭐⭐ (4/5) | 24个模块287个端点已完整定义，类型覆盖较好但8个模块返回any |
| 数据联通性 | ⭐⭐ (2/5) | 96.3%页面无共享状态，跨模块通信几乎空白 |
| 状态管理 | ⭐⭐ (2/5) | 仅3个Store被视图层使用，projectDataStore 0%视图使用率 |
| 类型安全 | ⭐⭐⭐ (3/5) | 核心模块有类型定义，但8个API模块全部返回any |
| 安全合规 | ⭐⭐ (2/5) | 生产环境HTTP、Token存localStorage、SSE绕过拦截器 |
| 错误处理 | ⭐⭐⭐ (3/5) | HTTP层有统一错误处理，但MAX_RETRIES=0、无全局异常边界 |
| 实时通信 | ⭐ (1/5) | WebSocket已实现未集成，DataFlowBus已注册11通道未使用 |
| 可维护性 | ⭐⭐⭐ (3/5) | 代码结构清晰，但硬编码数据泛滥、params/data混用 |

### 1.2 关键发现

1. **数据联通性严重不足**：96.3%的页面无共享状态管理，跨模块数据变更无法联动更新，前端各模块处于"数据孤岛"状态
2. **Store架构形同虚设**：7个Store模块中仅3个被视图层使用，projectDataStore完全由硬编码数据填充且0%视图使用率，scriptProjectStore仅7.4%视图使用率
3. **类型安全大面积缺失**：8个API模块（statistics、billing、character、script-asset、workflow-manage、video-model、system-config、platform-admin）返回类型全部为any，丧失TypeScript核心优势
4. **SSE流式通信绕过安全封装**：workflow模块中`fetchExecuteWorkflowStream`和`fetchMultimodalExecuteStream`使用原生fetch绕过Axios拦截器，导致Token无法自动附加、错误无法统一处理
5. **DataFlowBus基础设施已建但未启用**：11个数据通道已注册（6个API→页面、3个Store→页面、1个页面→API、1个事件总线），但无任何业务代码调用`dataFlowBus.send()`或`dataFlowBus.subscribe()`
6. **生产环境安全风险**：API使用HTTP明文传输、Token存储在localStorage（XSS可窃取）、锁屏密钥硬编码在前端源码中

### 1.3 风险概览

| 严重程度 | 数量 | 占比 |
|----------|------|------|
| 🔴 高 (High) | 10 | 33.3% |
| 🟡 中 (Medium) | 12 | 40.0% |
| 🟢 低 (Low) | 8 | 26.7% |
| **合计** | **30** | **100%** |

---

## 第2章: 模块检查清单

### 2.1 认证与用户模块 (Auth) — 13个API端点

**模块功能与数据范围**

认证与用户模块负责用户注册、登录、令牌管理、用户信息维护、头像上传和权限查询。涵盖从用户创建到权限获取的完整认证生命周期。

**子模块列表及API对接状态**

| 子功能 | 端点 | 对接状态 |
|--------|------|----------|
| 用户注册 | POST /api/auth/register | ✅ 已定义 |
| 用户登录 | POST /api/auth/login | ✅ 已定义 |
| 退出登录 | POST /api/auth/logout | ✅ 已定义 |
| 刷新AccessToken | POST /api/auth/refresh | ✅ 已定义 |
| RefreshToken刷新 | POST /api/auth/refresh-token | ✅ 已定义 |
| 图形验证码 | GET /api/auth/captcha | ✅ 已定义 |
| 邮箱验证码 | POST /api/auth/captcha/email | ✅ 已定义 |
| 重置密码 | POST /api/auth/password/reset | ✅ 已定义 |
| 获取用户信息 | GET /api/auth/me | ✅ 已定义 |
| 修改用户信息 | PUT /api/auth/profile | ✅ 已定义 |
| 上传头像 | POST /api/auth/avatar | ✅ 已定义 |
| 获取用户头像 | GET /api/auth/avatar/{userId} | ✅ 已定义 |
| 获取权限信息 | GET /api/auth/permissions | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Team模块：登录后需获取用户所属团队列表
- → Notification模块：登录后需获取未读通知数量
- → Project模块：登录后需获取用户项目列表
- → Store模块：登录成功后需更新userStore中的accessToken、refreshToken、userInfo

**实际数据联通现状与预期差距**

- 登录成功后Token通过`useUserStore().setToken()`写入Store，但后续模块未监听Token变化自动刷新数据
- 权限信息`fetchGetPermissions`已定义但未在路由守卫中实际调用进行动态权限校验
- 用户信息更新后未通知其他依赖用户信息的组件刷新

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| Token存储在localStorage，XSS攻击可窃取令牌 | 高 |
| 锁屏密钥`VITE_LOCK_ENCRYPT_KEY=s3cur3k3y4adpro`硬编码在前端环境变量中 | 高 |
| 登录成功后未触发DataFlowBus通知其他模块 | 中 |
| refreshToken逻辑未实现自动刷新，仅定义了接口 | 中 |

---

### 2.2 团队管理模块 (Team) — 30个API端点

**模块功能与数据范围**

团队管理模块负责团队CRUD、成员管理、角色权限、邀请码和申请审批。是项目权限体系的基础模块，所有项目都归属于团队。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 团队基础操作 | 4 | ✅ 已定义 |
| 成员管理 | 8 | ✅ 已定义 |
| 角色权限 | 6 | ✅ 已定义 |
| 邀请码 | 3 | ✅ 已定义 |
| 加入申请 | 4 | ✅ 已定义 |
| 权限查询 | 3 | ✅ 已定义 |
| 团队切换 | 1 | ✅ 已定义 |
| 所有权转移 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Project模块：团队下所有项目需联动展示
- → Asset模块：团队资产库需与项目资产库互通
- → Auth模块：团队切换后需刷新权限和项目列表
- → Points模块：团队Token用量统计需关联团队ID

**实际数据联通现状与预期差距**

- 团队切换`fetchSwitchTeam`后无任何联动刷新机制，页面数据不会自动更新
- 团队成员变更后，项目成员列表不会同步更新
- 团队角色权限变更后，已登录用户的权限缓存不会刷新

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 团队切换后无全局状态刷新，用户需手动刷新页面 | 高 |
| 团队资产库与项目资产库的导入关系`fetchImportFromTeam`无状态同步 | 中 |
| 角色权限变更后不触发权限缓存刷新 | 中 |

---

### 2.3 项目管理模块 (Project) — 20个API端点

**模块功能与数据范围**

项目管理模块是核心业务模块，负责项目全生命周期管理，包括创建、编辑、归档、成员管理、配置和统计。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 项目CRUD | 6 | ✅ 已定义 |
| 项目状态 | 3 | ✅ 已定义 |
| 项目成员 | 4 | ✅ 已定义 |
| 项目配置 | 2 | ✅ 已定义 |
| 审核门禁 | 2 | ✅ 已定义 |
| 项目统计 | 1 | ✅ 已定义（返回Record<string, any>） |
| 封面上传 | 1 | ✅ 已定义 |
| 项目复制 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Script模块：项目下包含多个剧本
- → Storyboard模块：项目下包含多个分镜
- → Character模块：项目下包含多个角色
- → Asset模块：项目下包含资产库
- → Review模块：项目有审核门禁配置
- → Team模块：项目归属于团队
- → Points模块：项目有积分余额和Token用量

**实际数据联通现状与预期差距**

- `fetchGetProjectStatistics`返回`Record<string, any>`，无类型约束
- 项目创建后scriptProjectStore不会自动更新项目列表
- projectDataStore使用硬编码数据，与API完全脱节
- 项目删除/归档后，关联的剧本、分镜、资产列表不会自动刷新

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| projectDataStore全部使用硬编码数据，0%视图使用率 | 高 |
| 项目统计接口返回any类型，无法进行类型安全的数据展示 | 中 |
| 项目状态变更（归档/解档）不通知关联模块 | 中 |
| 项目成员变更不联动团队模块的成员信息 | 低 |

---

### 2.4 剧本管理模块 (Script) — 30个API端点

**模块功能与数据范围**

剧本管理模块是内容生产的核心模块，负责剧本CRUD、审核流程、分集管理、AI处理（拆解、人物小传、资产提取、风格配置、参考图分析、违规审核、音色提示词、视频提示词）。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 剧本CRUD | 5 | ✅ 已定义 |
| 剧本审核 | 3 | ✅ 已定义 |
| 分集管理 | 5 | ✅ 已定义 |
| AI拆解 | 1 | ✅ 已定义 |
| 人物小传 | 2 | ✅ 已定义 |
| 资产提取 | 2 | ✅ 已定义 |
| 风格配置 | 2 | ✅ 已定义 |
| 参考图分析 | 2 | ✅ 已定义 |
| 违规审核 | 1 | ✅ 已定义 |
| 音色提示词 | 2 | ✅ 已定义 |
| 资产生成进度 | 1 | ✅ 已定义 |
| 资产提示词/图片 | 2 | ✅ 已定义 |
| 视频提示词 | 2 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Project模块：剧本归属于项目
- → Storyboard模块：剧本拆解后生成分镜
- → Character模块：剧本提取人物小传
- → Asset模块：剧本提取资产表
- → Review模块：剧本提交审核
- → Workflow模块：剧本AI处理调用工作流
- → Points模块：AI处理消耗积分

**实际数据联通现状与预期差距**

- 剧本拆解`fetchDecomposeScript`是异步操作，但无进度通知机制（需轮询或SSE）
- 人物小传生成后，Character模块不会自动更新角色列表
- 资产提取后，Asset模块不会自动更新资产库
- 剧本审核状态变更后，Review模块不会自动刷新待审核列表

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| AI异步处理（拆解/小传/提取）无进度回调机制 | 高 |
| 剧本→分镜→资产的数据链路断裂，各模块独立操作 | 高 |
| 剧本审核状态变更不联动Review模块 | 中 |
| 分集内容更新后不通知Storyboard模块 | 中 |

---

### 2.5 分镜管理模块 (Storyboard) — 27个API端点

**模块功能与数据范围**

分镜管理模块负责分镜CRUD、审核流程、版本管理、配图管理、资产关联、镜头管理和AI拆解/重建。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 分镜CRUD | 5 | ✅ 已定义 |
| 分镜审核 | 4 | ✅ 已定义 |
| 版本管理 | 2 | ✅ 已定义 |
| 配图管理 | 3 | ✅ 已定义 |
| 资产关联 | 3 | ✅ 已定义 |
| 排序 | 1 | ✅ 已定义 |
| 镜头管理 | 2 | ✅ 已定义 |
| AI拆解/重建 | 2 | ✅ 已定义 |
| 批量操作 | 2 | ✅ 已定义 |
| 剧本分镜查询 | 1 | ✅ 已定义 |
| 批量删除 | 1 | ✅ 已定义（使用data传参） |
| 批量审核提交 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Script模块：分镜来源于剧本拆解
- → Character模块：分镜关联角色
- → Asset模块：分镜关联资产
- → Review模块：分镜提交审核
- → Video模块：分镜生成视频提示词
- → Editor模块：分镜作为剪辑素材

**实际数据联通现状与预期差距**

- `fetchBatchDeleteStoryboards`使用`data`传参而非`params`，与其他删除接口不一致
- 分镜AI拆解/重建是异步操作，无进度通知
- 分镜关联角色/资产后，Character/Asset模块不会反向更新关联信息
- 分镜审核通过后不自动触发资产生成流程

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 分镜AI拆解/重建异步操作无进度反馈 | 高 |
| 分镜与角色/资产的双向关联无联动更新 | 中 |
| 批量删除使用data传参，与API封装约定不一致 | 中 |
| 分镜审核通过后不触发下游资产生成 | 中 |

---

### 2.6 角色管理模块 (Character) — 8个API端点

**模块功能与数据范围**

角色管理模块负责项目角色的CRUD和与分镜的关联管理。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 角色CRUD | 5 | ✅ 已定义（全部返回any） |
| 角色关联分镜 | 2 | ✅ 已定义（返回any/void） |
| 按分镜查询角色 | 1 | ✅ 已定义（返回any[]） |

**与其他模块的预期数据交互关系**

- → Script模块：角色来源于剧本人物小传
- → Storyboard模块：角色关联到分镜
- → Asset模块：角色可能有参考图资产

**实际数据联通现状与预期差距**

- **全部8个端点返回类型为any**，完全丧失TypeScript类型安全
- 角色创建/更新参数使用`Record<string, any>`，无类型约束
- 角色与分镜关联后，分镜详情不会自动包含角色信息

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部API返回any类型，类型安全完全缺失 | 高 |
| 角色参数无类型定义，前后端契约不明确 | 中 |
| 角色与分镜关联无双向联动 | 低 |

---

### 2.7 资产库模块 (Asset) — 28个API端点

**模块功能与数据范围**

资产库模块是最大的API模块之一，负责项目资产和团队资产的完整管理，包括上传、下载、版本管理、分片上传、批量操作、AI生成和分类标签。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 项目资产CRUD | 5 | ✅ 已定义 |
| 资产下载 | 2 | ✅ 已定义 |
| 版本管理 | 2 | ✅ 已定义 |
| 分片上传 | 4 | ✅ 已定义 |
| 批量操作 | 5 | ✅ 已定义 |
| AI生成 | 1 | ✅ 已定义 |
| 参考图 | 3 | ✅ 已定义 |
| 团队资产导入 | 1 | ✅ 已定义 |
| 团队资产管理 | 4 | ✅ 已定义 |
| 封面上传 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Project模块：资产归属于项目
- → Team模块：团队资产库与项目资产库互通
- → Storyboard模块：分镜关联资产
- → Script模块：剧本提取资产表
- → ScriptAsset模块：创意资产与资产库的关系

**实际数据联通现状与预期差距**

- 团队资产导入项目后，项目资产列表不会自动刷新
- 资产AI生成是异步操作，无进度通知
- 分片上传过程无断点续传的持久化记录
- 资产版本回滚后，关联分镜的引用不会自动更新

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 团队资产导入后项目资产列表不自动刷新 | 中 |
| AI生成资产无进度回调 | 中 |
| 分片上传中断后无断点续传能力 | 中 |
| 资产版本回滚不更新关联引用 | 低 |

---

### 2.8 剧本资产模块 (ScriptAsset) — 10个API端点

**模块功能与数据范围**

剧本资产模块管理从剧本中提取的创意资产，包括提示词生成、图片生成和审核。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 创意资产CRUD | 5 | ✅ 已定义（全部返回any） |
| 批量创建 | 1 | ✅ 已定义（返回any[]） |
| 参考图上传 | 1 | ✅ 已定义（返回any） |
| 提示词生成 | 1 | ✅ 已定义（返回any） |
| 图片生成 | 1 | ✅ 已定义（返回any） |
| 图片审核 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Script模块：创意资产来源于剧本
- → Asset模块：创意资产可能入库为正式资产
- → Review模块：创意资产图片需审核
- → Workflow模块：提示词/图片生成调用AI工作流

**实际数据联通现状与预期差距**

- **全部10个端点返回类型为any**，类型安全完全缺失
- 查询参数和创建参数均使用`Record<string, any>`
- 创意资产与Asset模块的正式资产无关联映射
- 图片生成/审核是异步操作，无进度通知

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部API返回any类型，类型安全完全缺失 | 高 |
| 创意资产与正式资产无关联映射 | 中 |
| 异步生成/审核无进度回调 | 中 |
| 参数类型全部为Record<string, any> | 中 |

---

### 2.9 审核中心模块 (Review) — 20个API端点

**模块功能与数据范围**

审核中心模块是质量管控的核心模块，负责审核任务管理、审核决策、审核统计、驳回原因管理和审核路由配置。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 审核任务查询 | 3 | ✅ 已定义 |
| 审核操作 | 5 | ✅ 已定义 |
| 审核统计 | 2 | ✅ 已定义 |
| 驳回原因 | 3 | ✅ 已定义 |
| 审核路由 | 2 | ✅ 已定义 |
| 我的提交 | 1 | ✅ 已定义 |
| 待审核数量 | 1 | ✅ 已定义 |
| 导出 | 1 | ✅ 已定义 |
| 通用状态查询 | 1 | ✅ 已定义 |
| 批量审核 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Script模块：剧本提交审核
- → Storyboard模块：分镜提交审核
- → ScriptAsset模块：创意资产图片审核
- → Project模块：项目审核门禁配置
- → Notification模块：审核结果通知
- → Workflow模块：审核通过后触发下游工作流

**实际数据联通现状与预期差距**

- 审核决策（通过/驳回）后不通知Script/Storyboard模块更新状态
- 审核通过后不自动触发下游资产生成/视频生成流程
- 待审核数量`fetchGetPendingReviewCount`未在导航栏实时展示
- 审核导出使用`responseType: 'blob'`但类型断言为`any`

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 审核决策后不联动更新源模块状态 | 高 |
| 审核通过后不触发下游自动化流程 | 高 |
| 待审核数量未实时展示和轮询刷新 | 中 |
| 导出接口类型断言为any，丧失类型安全 | 低 |

---

### 2.10 工作流执行模块 (Workflow) — 11个API端点

**模块功能与数据范围**

工作流执行模块负责Dify工作流的调用执行，包括阻塞模式、SSE流式模式、链式执行和风格反推。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 文件上传 | 1 | ✅ 已定义 |
| 阻塞执行 | 1 | ✅ 已定义 |
| SSE流式执行 | 1 | ⚠️ 使用原生fetch |
| 停止执行 | 1 | ✅ 已定义 |
| 运行状态查询 | 1 | ✅ 已定义 |
| 自适应阻塞执行 | 1 | ✅ 已定义 |
| 自适应SSE执行 | 1 | ⚠️ 使用原生fetch |
| 链式执行 | 1 | ✅ 已定义 |
| 风格反推 | 1 | ✅ 已定义 |
| 工作流目录 | 1 | ✅ 已定义 |
| 执行参数 | 1 | Record<string, any> |

**与其他模块的预期数据交互关系**

- → Script模块：剧本AI处理调用工作流
- → Asset模块：AI生成资产调用工作流
- → Video模块：视频生成调用工作流
- → Image模块：图片生成调用工作流
- → Points模块：工作流执行消耗积分
- → AIProcess模块：工作流执行记录

**实际数据联通现状与预期差距**

- **SSE流式接口使用原生fetch绕过Axios封装**，导致Token需手动获取、错误无法统一处理、无重试机制
- 工作流执行参数使用`Record<string, any>`，无类型约束
- 工作流执行结果不自动写入AIProcess模块
- 工作流执行消耗积分但不自动扣减/查询

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| SSE接口绕过Axios拦截器，Token和错误处理缺失 | 高 |
| 工作流执行结果不自动记录到AIProcess | 中 |
| 执行参数无类型约束 | 中 |
| 积分消耗无联动扣减 | 中 |

---

### 2.11 工作流管理模块 (WorkflowManage) — 8个API端点

**模块功能与数据范围**

工作流管理模块负责Dify工作流的配置管理，包括CRUD、启停和连通性测试。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 工作流CRUD | 4 | ✅ 已定义（全部返回any） |
| 启停控制 | 1 | ✅ 已定义（使用PATCH方法） |
| 连通性测试 | 2 | ✅ 已定义（返回any） |
| 列表查询 | 1 | ✅ 已定义（返回any[]） |

**与其他模块的预期数据交互关系**

- → Workflow模块：管理工作流供执行模块调用
- → SystemConfig模块：工作流配置可能依赖系统配置

**实际数据联通现状与预期差距**

- **全部8个端点返回类型为any**
- 使用`request.request({ method: 'PATCH' })`调用PATCH方法，与其他接口风格不一致
- 工作流启停后不通知Workflow执行模块刷新目录
- 连通性测试结果无缓存机制

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部API返回any类型 | 高 |
| PATCH方法调用方式与其他接口不一致 | 低 |
| 工作流启停不通知执行模块 | 中 |

---

### 2.12 视频生成模块 (Video) — 10个API端点

**模块功能与数据范围**

视频生成模块负责Seedance视频生成任务的提交、查询、取消，以及视频提示词的生成、违规检测和修改。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 视频生成 | 2 | ✅ 已定义 |
| 任务查询 | 3 | ✅ 已定义 |
| 任务取消 | 1 | ✅ 已定义 |
| 提示词生成 | 1 | ✅ 已定义 |
| 违规检测 | 1 | ✅ 已定义 |
| 提示词修改 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Script模块：视频提示词来源于剧本分集
- → Storyboard模块：视频基于分镜生成
- → Editor模块：生成视频作为剪辑素材
- → Points模块：视频生成消耗积分
- → AIProcess模块：视频生成记录

**实际数据联通现状与预期差距**

- 视频生成是异步操作，任务状态需轮询查询，无WebSocket/SSE推送
- 视频生成完成后不自动通知Editor模块
- 视频提示词生成/修改不联动Storyboard模块
- 积分消耗无联动扣减

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 视频生成异步任务无实时状态推送 | 高 |
| 生成完成后不通知剪辑模块 | 中 |
| 提示词修改不联动分镜模块 | 中 |
| 积分消耗无联动 | 低 |

---

### 2.13 图片生成模块 (Image) — 6个API端点

**模块功能与数据范围**

图片生成模块负责GPT-Image图片生成任务的提交、状态查询、审核和模型管理。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 图片生成 | 1 | ✅ 已定义 |
| 任务状态 | 1 | ✅ 已定义 |
| 审核状态 | 1 | ✅ 已定义 |
| 任务结果 | 1 | ✅ 已定义 |
| 模型列表 | 1 | ✅ 已定义 |
| 模型详情 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Asset模块：生成图片可入库为资产
- → Storyboard模块：生成图片可作为分镜配图
- → Review模块：图片审核
- → Points模块：图片生成消耗积分

**实际数据联通现状与预期差距**

- 图片生成是异步操作，无实时状态推送
- 生成完成后不自动入库为资产
- 图片审核状态变更不联动Asset模块

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 图片生成无实时状态推送 | 中 |
| 生成结果不自动入库 | 低 |
| 审核状态不联动资产模块 | 低 |

---

### 2.14 剪辑管理模块 (Editor) — 11个API端点

**模块功能与数据范围**

剪辑管理模块负责剪辑项目的CRUD、片段管理、排序和视频导出。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 剪辑项目CRUD | 4 | ✅ 已定义 |
| 片段管理 | 3 | ✅ 已定义 |
| 片段排序 | 1 | ✅ 已定义 |
| 视频导出 | 2 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Video模块：剪辑素材来源于视频生成
- → Storyboard模块：剪辑可基于分镜编排
- → Asset模块：剪辑使用资产素材
- → Project模块：剪辑项目归属于项目

**实际数据联通现状与预期差距**

- 剪辑项目与Video模块无关联，视频生成后需手动创建剪辑项目
- 导出是异步操作，无进度通知
- 片段排序操作无乐观更新机制

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 剪辑与视频生成模块无自动关联 | 中 |
| 视频导出无进度回调 | 中 |
| 片段排序无乐观更新 | 低 |

---

### 2.15 通知管理模块 (Notification) — 22个API端点

**模块功能与数据范围**

通知管理模块负责通知的完整生命周期，包括查询、标记、删除、收藏、搜索、导出、偏好设置、免打扰、订阅和WebSocket Token获取。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 通知查询 | 3 | ✅ 已定义 |
| 标记操作 | 4 | ✅ 已定义 |
| 删除操作 | 2 | ✅ 已定义 |
| 收藏 | 2 | ✅ 已定义 |
| 搜索/导出 | 2 | ✅ 已定义 |
| 偏好设置 | 2 | ✅ 已定义 |
| 免打扰 | 2 | ✅ 已定义 |
| 订阅管理 | 3 | ✅ 已定义 |
| WebSocket Token | 1 | ✅ 已定义 |
| 清空已读 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Auth模块：通知与用户绑定
- → Review模块：审核结果推送通知
- → Workflow模块：工作流执行结果通知
- → Video/Image模块：生成任务完成通知

**实际数据联通现状与预期差距**

- `fetchGetWsToken`已定义但WebSocket客户端未集成到通知模块
- 未读通知数量未在全局导航栏实时展示
- 通知与业务模块的关联（如点击通知跳转到对应审核详情）未实现

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| WebSocket Token已获取但WS客户端未集成 | 高 |
| 未读通知数量未实时展示 | 中 |
| 通知与业务模块的跳转关联未实现 | 中 |
| 批量删除使用data传参，批量标记使用params传参，不一致 | 低 |

---

### 2.16 积分用量模块 (Points) — 8个API端点

**模块功能与数据范围**

积分用量模块负责个人/项目/团队的积分余额查询、积分流水、模型定价和Token用量统计。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 积分余额 | 2 | ✅ 已定义 |
| 积分流水 | 1 | ✅ 已定义 |
| 模型定价 | 1 | ✅ 已定义 |
| Token用量 | 4 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Workflow模块：工作流执行消耗积分
- → Video/Image模块：生成任务消耗积分
- → Billing模块：积分定价配置
- → Statistics模块：用量统计汇总

**实际数据联通现状与预期差距**

- AI操作（工作流执行、视频/图片生成）后积分余额不自动刷新
- 积分不足时无前置校验，操作可能失败后才提示
- Token用量统计与Statistics模块数据可能不一致

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| AI操作后积分余额不自动刷新 | 中 |
| 积分不足无前置校验 | 中 |
| 用量统计与Statistics模块数据不一致风险 | 低 |

---

### 2.17 计费管理模块 (Billing) — 6个API端点

**模块功能与数据范围**

计费管理模块负责后台定价配置管理，包括CRUD、启停和历史查询。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 定价CRUD | 4 | ✅ 已定义（全部返回any） |
| 启停控制 | 1 | ✅ 已定义（返回any） |
| 调价历史 | 1 | ✅ 已定义（返回any[]） |

**与其他模块的预期数据交互关系**

- → Points模块：定价配置影响积分计算
- → Statistics模块：计费数据纳入统计

**实际数据联通现状与预期差距**

- **全部6个端点返回类型为any**
- 定价变更后Points模块的定价列表不会自动刷新
- 调价历史无分页支持

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部API返回any类型 | 高 |
| 定价变更不联动Points模块 | 中 |
| 调价历史无分页 | 低 |

---

### 2.18 统计分析模块 (Statistics) — 24个API端点

**模块功能与数据范围**

统计分析模块是最大的API模块之一，负责核心指标看板、实时数据、趋势图表、团队排名/工作量/用户贡献、项目统计、报表管理和导出。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 核心看板 | 2 | ✅ 已定义（返回any） |
| 趋势图表 | 1 | ✅ 已定义（返回any） |
| 积分/预警 | 2 | ✅ 已定义（返回any/any[]） |
| 团队统计 | 5 | ✅ 已定义（返回any/any[]） |
| 报表管理 | 5 | ✅ 已定义（返回any/any[]） |
| 项目统计 | 5 | ✅ 已定义（返回any） |
| 项目分析 | 1 | ✅ 已定义（返回any[]） |
| 用户活跃排名 | 1 | ✅ 已定义（返回any[]） |
| 导出 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → 全部业务模块：统计数据来源于各模块
- → Points模块：积分和用量数据
- → Billing模块：计费数据

**实际数据联通现状与预期差距**

- **全部24个端点返回类型为any**，是类型安全缺失最严重的模块
- 统计数据与各业务模块的数据无实时同步机制
- 报表管理参数全部使用`Record<string, any>`
- Dashboard数据无自动刷新机制

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部24个API返回any，类型安全完全缺失 | 高 |
| 统计数据与业务模块无实时同步 | 中 |
| 报表参数无类型约束 | 中 |
| Dashboard无自动刷新 | 低 |

---

### 2.19 AI处理记录模块 (AIProcess) — 3个API端点

**模块功能与数据范围**

AI处理记录模块负责查询AI处理状态、历史列表和历史详情。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 处理状态查询 | 1 | ✅ 已定义 |
| 历史列表 | 1 | ✅ 已定义 |
| 历史详情 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Workflow模块：工作流执行产生AI处理记录
- → Video/Image模块：生成任务产生AI处理记录
- → Script模块：剧本AI处理产生记录

**实际数据联通现状与预期差距**

- AI处理记录仅提供查询，无主动通知机制
- 工作流执行结果不自动写入AI处理记录
- 处理状态变更不通知关联模块

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| AI处理状态变更无主动通知 | 中 |
| 工作流执行结果不自动记录 | 中 |

---

### 2.20 数据历史模块 (DataHistory) — 3个API端点

**模块功能与数据范围**

数据历史模块负责历史版本查询、详情查看和数据回退。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 历史版本列表 | 1 | ✅ 已定义 |
| 历史版本详情 | 1 | ✅ 已定义 |
| 数据回退 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Storyboard模块：分镜版本历史
- → Asset模块：资产版本历史
- → Script模块：剧本版本历史

**实际数据联通现状与预期差距**

- 数据回退后关联模块不会自动刷新
- 历史版本查询无通用接口，需各模块自行实现

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 数据回退后关联模块不自动刷新 | 中 |
| 无通用版本历史查询接口 | 低 |

---

### 2.21 系统配置模块 (SystemConfig) — 14个API端点

**模块功能与数据范围**

系统配置模块负责后台配置管理、审计日志、缓存刷新和Webhook管理。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 配置CRUD | 4 | ✅ 已定义（全部返回any） |
| 分组配置 | 1 | ✅ 已定义（返回any[]） |
| 审计日志 | 1 | ✅ 已定义（返回any[]） |
| 缓存刷新 | 1 | ✅ 已定义 |
| Webhook管理 | 5 | ✅ 已定义（返回any） |
| 配置查询 | 2 | ✅ 已定义（返回any） |

**与其他模块的预期数据交互关系**

- → 全局：系统配置影响所有模块行为
- → Workflow模块：Webhook与工作流集成
- → Project模块：项目级Webhook

**实际数据联通现状与预期差距**

- **全部14个端点返回类型为any**
- 配置变更后无全局通知机制，各模块不会自动刷新
- Webhook测试结果无缓存

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部API返回any类型 | 高 |
| 配置变更无全局通知 | 中 |
| Webhook管理参数无类型约束 | 中 |

---

### 2.22 系统管理模块 (SystemManage) — 5个API端点

**模块功能与数据范围**

系统管理模块负责平台级用户管理、菜单和角色管理。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 用户管理 | 3 | ✅ 已定义 |
| 菜单管理 | 1 | ✅ 已定义 |
| 角色管理 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Auth模块：用户管理影响认证
- → Team模块：角色管理影响团队权限
- → Router模块：菜单数据驱动路由

**实际数据联通现状与预期差距**

- 菜单接口`fetchGetMenuList`返回`AppRouteRecord[]`，是少数有完整类型定义的管理接口
- 用户启停后不通知Auth模块
- 角色变更后不刷新权限缓存

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 用户启停不通知Auth模块 | 中 |
| 角色变更不刷新权限缓存 | 中 |

---

### 2.23 平台管理模块 (PlatformAdmin) — 15个API端点

**模块功能与数据范围**

平台管理模块负责平台级的团队管理、成员管理、邀请码和申请审批。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 团队管理 | 6 | ✅ 已定义（大部分返回any） |
| 成员管理 | 2 | ✅ 已定义（返回any） |
| 邀请码 | 2 | ✅ 已定义（返回any） |
| 申请审批 | 3 | ✅ 已定义 |
| 邀请码撤销 | 1 | ✅ 已定义 |
| 成员状态 | 1 | ✅ 已定义 |

**与其他模块的预期数据交互关系**

- → Team模块：平台管理与团队自管理的数据重叠
- → Auth模块：成员状态变更影响认证

**实际数据联通现状与预期差距**

- **大部分端点返回类型为any**
- 平台管理与Team模块的操作可能产生数据冲突
- 平台级操作不通知Team模块

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 大部分API返回any类型 | 高 |
| 平台管理与Team模块数据冲突风险 | 中 |
| 平台操作不通知Team模块 | 中 |

---

### 2.24 视频模型配置模块 (VideoModel) — 5个API端点

**模块功能与数据范围**

视频模型配置模块负责Seedance视频模型的CRUD和状态切换。

**子模块列表及API对接状态**

| 子功能 | 端点数 | 对接状态 |
|--------|--------|----------|
| 模型CRUD | 4 | ✅ 已定义（全部返回any） |
| 状态切换 | 1 | ✅ 已定义（使用PATCH方法） |

**与其他模块的预期数据交互关系**

- → Video模块：模型配置影响视频生成
- → Image模块：模型列表展示

**实际数据联通现状与预期差距**

- **全部5个端点返回类型为any**
- 模型启停后Video模块不会自动刷新可用模型列表
- 使用PATCH方法与其他接口风格不一致

**已发现的具体缺陷及潜在风险**

| 缺陷描述 | 严重程度 |
|----------|----------|
| 全部API返回any类型 | 高 |
| 模型启停不通知Video模块 | 中 |
| PATCH方法调用不一致 | 低 |

---

## 第3章: 问题汇总表

### 3.1 高严重度问题

| 编号 | 问题描述 | 影响模块 | 影响范围 |
|------|----------|----------|----------|
| H-01 | 跨模块数据通信架构空白，96.3%页面无共享状态 | 全局 | 数据孤岛，变更无法联动 |
| H-02 | SSE流式接口绕过Axios封装，Token和错误处理缺失 | Workflow | 安全漏洞和异常丢失 |
| H-03 | 8个API模块返回类型全部为any（statistics/billing/character/script-asset/workflow-manage/video-model/system-config/platform-admin） | 8个模块 | 类型安全完全丧失 |
| H-04 | 生产环境API使用HTTP明文传输 | 全局 | 中间人攻击风险 |
| H-05 | Token存储在localStorage，XSS可窃取 | Auth | 令牌泄露风险 |
| H-06 | DataFlowBus已注册11个通道但无业务代码调用 | 全局 | 基础设施闲置 |
| H-07 | AI异步处理（拆解/生成/审核）无进度回调机制 | Script/Video/Image/Asset | 用户体验差 |
| H-08 | 审核决策后不联动更新源模块状态 | Review/Script/Storyboard | 数据不一致 |
| H-09 | WebSocket客户端已实现但未集成到通知模块 | Notification | 实时通知缺失 |
| H-10 | projectDataStore全部硬编码数据，0%视图使用率 | Project | Store形同虚设 |

### 3.2 中严重度问题

| 编号 | 问题描述 | 影响模块 | 影响范围 |
|------|----------|----------|----------|
| M-01 | 团队切换后无全局状态刷新 | Team | 页面数据过期 |
| M-02 | 剧本→分镜→资产数据链路断裂 | Script/Storyboard/Asset | 业务流程不连贯 |
| M-03 | 工作流执行结果不自动记录到AIProcess | Workflow/AIProcess | 数据追踪缺失 |
| M-04 | 积分消耗无联动扣减和余额刷新 | Points/Workflow/Video | 积分显示不准确 |
| M-05 | 视频生成完成后不通知剪辑模块 | Video/Editor | 工作流断裂 |
| M-06 | 配置变更无全局通知机制 | SystemConfig | 配置不生效 |
| M-07 | params/data传参混用，接口风格不一致 | 全局API | 可维护性差 |
| M-08 | 审核通过后不触发下游自动化流程 | Review/Workflow | 效率低下 |
| M-09 | 团队资产导入后项目资产列表不自动刷新 | Asset/Team | 数据展示过期 |
| M-10 | 未读通知数量未实时展示 | Notification | 信息延迟 |
| M-11 | 角色权限变更后不刷新权限缓存 | Team/Auth | 权限不生效 |
| M-12 | 分片上传中断后无断点续传能力 | Asset | 大文件上传不可靠 |

### 3.3 低严重度问题

| 编号 | 问题描述 | 影响模块 | 影响范围 |
|------|----------|----------|----------|
| L-01 | PATCH方法调用方式与其他接口不一致 | WorkflowManage/VideoModel | 代码风格不统一 |
| L-02 | 批量删除使用data传参，批量标记使用params传参 | Notification/Storyboard | 接口风格不一致 |
| L-03 | 调价历史无分页支持 | Billing | 大数据量性能问题 |
| L-04 | Dashboard无自动刷新 | Statistics | 数据时效性差 |
| L-05 | 资产版本回滚不更新关联引用 | Asset/Storyboard | 引用可能失效 |
| L-06 | 图片生成结果不自动入库 | Image/Asset | 需手动操作 |
| L-07 | 片段排序无乐观更新 | Editor | 用户体验差 |
| L-08 | 历史版本查询无通用接口 | DataHistory | 重复开发 |

---

## 第4章: 缺陷深度分析

### 4.1 数据沟通机制缺失分析

#### 4.1.1 跨模块通信架构空白

当前项目中各业务模块之间几乎没有任何数据通信机制。以典型的"剧本→分镜→资产→视频"业务链路为例：

```
剧本拆解 → 分镜生成 → 资产提取 → 图片生成 → 视频生成 → 剪辑合成
   ↓           ↓           ↓           ↓           ↓           ↓
  无通知      无通知      无通知      无通知      无通知      无通知
```

每个环节的完成都不会自动触发下游环节，用户必须手动刷新页面、手动触发下一步操作。这种"断点式"的数据流严重影响了业务效率和用户体验。

#### 4.1.2 Store共享状态缺失

7个Store模块的使用情况分析：

| Store模块 | 视图使用率 | 用途 | 问题 |
|-----------|-----------|------|------|
| userStore | ~90% | 认证和用户信息 | ✅ 正常使用 |
| settingStore | ~80% | 全局设置 | ✅ 正常使用 |
| worktabStore | ~70% | 工作台标签页 | ✅ 正常使用 |
| menuStore | ~60% | 菜单和路由 | ✅ 正常使用 |
| tableStore | ~30% | 表格状态 | 部分使用 |
| projectDataStore | 0% | 项目数据 | 全部硬编码，无视图使用 |
| scriptProjectStore | 7.4% | 剧本项目 | 仅6个视图使用 |

**关键问题**：projectDataStore包含4个硬编码项目、2个硬编码分集、6个硬编码分镜、2个硬编码角色和4个硬编码轨道，完全未与API对接。scriptProjectStore虽然引用了projectDataStore的数据，但也是基于硬编码数据。

#### 4.1.3 事件驱动机制缺失

项目已引入mitt事件总线（`@/utils/sys/mittBus`），但仅用于全局设置变更等少量场景。DataFlowBus虽然设计了完整的事件订阅机制，但无业务代码调用。

缺失的关键事件：
- 项目切换事件 → 刷新项目相关数据
- 审核状态变更事件 → 更新源模块状态
- AI任务完成事件 → 通知下游模块
- 积分变更事件 → 刷新余额显示
- 通知到达事件 → 更新未读数量

### 4.2 数据联动更新缺陷分析

#### 4.2.1 写操作未持久化统计

对API模块的分析显示，大量写操作（POST/PUT/DELETE）完成后，前端不会自动刷新相关数据：

| 操作类型 | 数量 | 自动刷新率 |
|----------|------|-----------|
| 创建操作 | ~45个端点 | <10% |
| 更新操作 | ~35个端点 | <15% |
| 删除操作 | ~25个端点 | <20% |
| 状态变更 | ~15个端点 | <5% |

#### 4.2.2 典型联动缺失案例

**案例1：剧本拆解后的数据链路断裂**

```
用户操作: 点击"拆解剧本"
API调用: fetchDecomposeScript(projectId, scriptId)
预期联动:
  1. 拆解完成 → 自动生成分集列表
  2. 分集生成 → 自动刷新分集页面
  3. 分集可用 → 启用"生成分镜"按钮
实际状况:
  1. API返回后无进度通知
  2. 用户需手动刷新页面查看分集
  3. 分集列表不会自动更新
```

**案例2：审核通过后的流程断裂**

```
审核员操作: 点击"审核通过"
API调用: fetchReviewDecision({ decision: 'approved' })
预期联动:
  1. 审核状态更新 → 源模块(剧本/分镜)状态变更
  2. 审核通过 → 自动触发资产生成流程
  3. 审核结果 → 通知提交者
  4. 待审核列表 → 移除该项并刷新
实际状况:
  1. 审核状态仅在Review模块更新
  2. 源模块状态不自动变更
  3. 无自动化流程触发
  4. 通知不自动发送
```

**案例3：团队切换后的数据过期**

```
用户操作: 切换当前团队
API调用: fetchSwitchTeam(teamId)
预期联动:
  1. 团队切换 → 刷新项目列表
  2. 团队切换 → 刷新团队成员
  3. 团队切换 → 刷新权限信息
  4. 团队切换 → 刷新积分余额
实际状况:
  1. API调用成功但无后续刷新
  2. 页面显示的仍是旧团队数据
  3. 用户需手动刷新整个页面
```

### 4.3 跨模块数据引用不一致分析

#### 4.3.1 ID类型不一致

| 模块 | ID类型 | 示例 |
|------|--------|------|
| projectDataStore (Store) | number | `id: 1` |
| API接口 | string | `projectId: string` |
| scriptProjectStore (Store) | number | `currentProjectId: 1` |
| 路由参数 | string | `route.params.projectId` |

Store中使用number类型的ID，而API接口全部使用string类型。这种不一致会导致：
- Store数据与API数据无法直接比较
- 路由参数需类型转换
- 潜在的`1 === '1'`比较错误

#### 4.3.2 数据模型不一致

projectDataStore中定义的数据模型与API类型定义完全不同：

| 字段 | Store定义 | API定义 |
|------|-----------|---------|
| Project.id | number | string |
| Project.status | 'active' \| 'archived' \| 'draft' | number (枚举值) |
| Episode.id | number | string |
| Storyboard.id | number | string |
| Character.id | number | string |

### 4.4 数据同步异常处理分析

#### 4.4.1 当前机制

- HTTP层：Axios拦截器统一处理401错误（自动登出），其他错误显示ElMessage
- 重试机制：`MAX_RETRIES = 0`，即未启用重试
- 错误类：`HttpError`封装了错误码、消息、时间戳

#### 4.4.2 缺失机制

| 缺失机制 | 影响 | 优先级 |
|----------|------|--------|
| 请求重试（MAX_RETRIES=0） | 网络波动导致操作失败 | 高 |
| 乐观更新回滚 | 操作失败后UI状态不一致 | 中 |
| 离线数据缓存 | 网络断开时无法使用 | 中 |
| 请求去重 | 重复提交风险 | 中 |
| 并发冲突处理 | 多人编辑同一资源冲突 | 低 |
| 数据一致性校验 | 前后端数据不同步 | 低 |

### 4.5 模块接口设计评估

#### 4.5.1 params/data混用

当前HTTP封装中，POST/PUT请求自动将`params`转换为`data`：

```typescript
if (['POST', 'PUT'].includes(config.method?.toUpperCase() || '') && config.params && !config.data) {
  config.data = config.params
  config.params = undefined
}
```

这导致API调用时参数传递方式混乱：

| 传参方式 | 使用场景 | 示例 |
|----------|----------|------|
| params | 大部分POST/PUT | `request.post({ url, params })` |
| data | 少量DELETE | `request.del({ url, data: { ids } })` |
| params + 手动转换 | FormData | `request.post({ url, params: formData })` |

#### 4.5.2 SSE绕过封装

Workflow模块中两个SSE接口直接使用原生fetch：

```typescript
export function fetchExecuteWorkflowStream(workflowCode: string, params: Record<string, any>) {
  const baseURL = import.meta.env.VITE_API_URL || ''
  return fetch(`${baseURL}/api/dify-workflows/${workflowCode}/execute-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthToken()
    },
    body: JSON.stringify(params)
  })
}
```

问题：
- Token需手动获取（`getAuthToken()`），绕过了Axios请求拦截器
- 无错误处理和重试机制
- 无请求取消能力
- 无超时控制
- 无统一日志记录

#### 4.5.3 返回类型any泛滥

8个API模块的返回类型统计：

| 模块 | 端点数 | any返回数 | any占比 |
|------|--------|-----------|---------|
| statistics | 24 | 24 | 100% |
| billing | 6 | 6 | 100% |
| character | 8 | 8 | 100% |
| script-asset | 10 | 10 | 100% |
| workflow-manage | 8 | 8 | 100% |
| video-model | 5 | 5 | 100% |
| system-config | 14 | 14 | 100% |
| platform-admin | 15 | ~12 | ~80% |
| **合计** | **90** | **~87** | **~97%** |

90个端点中约87个返回any，占全部287个端点的30.3%。

---

## 第5章: 技术选型升级评估

### 5.1 状态管理方案评估

#### 5.1.1 当前方案分析（Pinia 3.0.3）

**优势**：
- Vue 3官方推荐，与Composition API深度集成
- 轻量级，API简洁直观
- 支持TypeScript类型推断
- 支持插件扩展（持久化、DevTools）

**问题**：
- Store设计不合理：projectDataStore全部硬编码，0%视图使用率
- 跨Store通信依赖直接引用（scriptProjectStore引用projectDataStore），无事件驱动
- 缺少业务Store：无ScriptStore、StoryboardStore、AssetStore等核心业务Store
- 持久化配置不一致：scriptProjectStore设置`persist: false`，userStore使用localStorage

#### 5.1.2 候选方案对比表

| 维度 | Pinia 3.0 | Vuex 5 | Zustand | MobX |
|------|-----------|--------|---------|------|
| Vue生态兼容性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| TypeScript支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 学习曲线 | ⭐⭐⭐⭐⭐ (低) | ⭐⭐⭐ (中) | ⭐⭐⭐⭐ (低) | ⭐⭐⭐ (中) |
| 包体积 | 1.2KB | 6KB | 1.1KB | 16KB |
| DevTools支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 模块化 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 响应式系统 | Vue Reactivity | Vue Reactivity | 独立(subscribe) | Proxy-based |
| SSR支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

#### 5.1.3 选型建议与理由

**建议：继续使用Pinia 3.0**，但需进行架构重构。

理由：
1. Pinia是Vue 3官方推荐方案，生态兼容性最佳
2. 当前项目已深度使用Pinia，迁移成本高且收益低
3. 问题不在Pinia本身，而在于Store的设计和使用方式
4. Zustand和MobX不是Vue生态原生方案，引入会增加复杂度

#### 5.1.4 建议的Store架构重构方案

```
src/store/
├── modules/
│   ├── auth/              # 认证模块
│   │   ├── user.ts        # 用户信息
│   │   └── permission.ts  # 权限信息
│   ├── project/           # 项目模块
│   │   ├── project-list.ts    # 项目列表（API驱动）
│   │   └── project-detail.ts  # 项目详情（API驱动）
│   ├── script/            # 剧本模块
│   │   ├── script-list.ts     # 剧本列表
│   │   └── episode.ts         # 分集管理
│   ├── storyboard/        # 分镜模块
│   │   └── storyboard.ts      # 分镜数据
│   ├── asset/             # 资产模块
│   │   └── asset.ts           # 资产数据
│   ├── review/            # 审核模块
│   │   └── review.ts          # 审核数据
│   ├── notification/      # 通知模块
│   │   └── notification.ts    # 通知数据
│   ├── points/            # 积分模块
│   │   └── credits.ts         # 积分余额
│   └── app/               # 应用全局
│       ├── setting.ts         # 设置
│       ├── menu.ts            # 菜单
│       ├── worktab.ts         # 工作台
│       └── table.ts           # 表格
└── index.ts
```

### 5.2 服务端通信方案评估

#### 5.2.1 当前方案分析（Axios 1.12 + 原生fetch）

**Axios使用情况**：
- 24个API模块中22个使用Axios封装
- 统一拦截器处理Token和错误
- 支持请求重试（但MAX_RETRIES=0未启用）
- 支持Blob下载

**原生fetch使用情况**：
- Workflow模块2个SSE接口使用原生fetch
- 绕过了Axios拦截器
- 无统一错误处理

#### 5.2.2 通信方式对比表

| 维度 | REST | GraphQL | WebSocket | SSE |
|------|------|---------|-----------|-----|
| 数据获取效率 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 实时性 | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 双向通信 | ❌ | ❌ | ✅ | ❌ |
| 断线重连 | N/A | N/A | 需实现 | 浏览器自动 |
| 缓存支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ |
| 学习成本 | ⭐⭐⭐⭐⭐ (低) | ⭐⭐⭐ (中) | ⭐⭐⭐ (中) | ⭐⭐⭐⭐ (低) |
| 后端改造成本 | ⭐⭐⭐⭐⭐ (无) | ⭐⭐ (高) | ⭐⭐⭐ (中) | ⭐⭐⭐⭐ (低) |

#### 5.2.3 请求库对比表

| 维度 | Axios | Fetch | TanStack Query | SWR |
|------|-------|-------|----------------|-----|
| 请求拦截器 | ✅ | ❌ | ❌ | ❌ |
| 响应拦截器 | ✅ | ❌ | ❌ | ❌ |
| 自动重试 | 需实现 | ❌ | ✅ | ✅ |
| 请求取消 | ✅ (CancelToken) | ✅ (AbortController) | ✅ | ✅ |
| 缓存管理 | ❌ | ❌ | ✅ | ✅ |
| 乐观更新 | ❌ | ❌ | ✅ | ✅ |
| 轮询支持 | ❌ | ❌ | ✅ | ✅ |
| 分页支持 | ❌ | ❌ | ✅ | ✅ |
| 依赖追踪 | ❌ | ❌ | ✅ | ✅ |
| DevTools | ❌ | ❌ | ✅ | ❌ |
| Vue支持 | ✅ | ✅ | ✅ (@tanstack/vue-query) | ❌ (React优先) |

#### 5.2.4 选型建议与理由

**建议：Axios + TanStack Query + SSE**

1. **Axios**：保留作为底层HTTP客户端，修复SSE绕过问题
2. **TanStack Query**：引入作为数据获取和缓存层，解决数据刷新、缓存、乐观更新等问题
3. **SSE**：用于AI异步任务的进度推送，封装统一的SSE客户端

理由：
- Axios已深度集成，迁移成本高
- TanStack Query解决当前最大的数据刷新和缓存问题
- SSE是AI任务进度推送的最佳方案，比WebSocket轻量

#### 5.2.5 通信方式选择矩阵

| 业务场景 | 推荐方式 | 理由 |
|----------|----------|------|
| 常规CRUD | REST + TanStack Query | 标准化、缓存、自动刷新 |
| AI任务进度 | SSE | 单向推送、自动重连 |
| 实时通知 | WebSocket | 双向通信、低延迟 |
| 审核状态变更 | WebSocket + 事件总线 | 实时性要求高 |
| 数据统计 | REST + 轮询 | 数据更新频率低 |

---

## 第6章: 数据层架构设计

### 6.1 模拟数据服务设计

#### 6.1.1 数据模型定义

```typescript
interface MockProject {
  id: string
  name: string
  description: string
  coverUrl: string
  status: number
  teamId: string
  creatorId: string
  episodeCount: number
  createdAt: string
  updatedAt: string
}

interface MockScript {
  id: string
  projectId: string
  title: string
  content: string
  status: number
  reviewStatus: string
  wordCount: number
  createdAt: string
  updatedAt: string
}

interface MockEpisode {
  id: string
  scriptId: string
  projectId: string
  number: number
  title: string
  content: string
  status: string
  wordCount: number
  duration: number
  createdAt: string
  updatedAt: string
}

interface MockStoryboard {
  id: string
  episodeId: string
  projectId: string
  code: string
  title: string
  description: string
  thumbnailUrl: string
  shotCount: number
  duration: number
  status: string
  order: number
  createdAt: string
  updatedAt: string
}

interface MockCharacter {
  id: string
  projectId: string
  name: string
  code: string
  gender: string
  age: number
  personality: string
  positioning: string
  appearance: string
  background: string
  avatarUrl: string
}

interface MockAsset {
  id: string
  projectId: string
  name: string
  assetType: string
  category: string
  fileUrl: string
  fileSize: number
  mimeType: string
  tags: string[]
  version: number
  createdAt: string
  updatedAt: string
}

interface MockTeam {
  id: string
  name: string
  description: string
  avatarUrl: string
  memberCount: number
  ownerId: string
  createdAt: string
}

interface MockQuota {
  teamId: string
  creditsBalance: number
  creditsUsed: number
  tokenUsageTotal: number
  period: string
}

interface MockReview {
  id: string
  reviewType: string
  targetId: string
  projectId: string
  status: string
  reviewerId: string
  submitterId: string
  decision: string
  comment: string
  createdAt: string
}

interface MockUser {
  userId: string
  username: string
  email: string
  avatarUrl: string
  nickname: string
  role: string
}

interface MockNotification {
  id: string
  type: string
  title: string
  content: string
  isRead: boolean
  isStarred: boolean
  createdAt: string
}

interface MockWorkflow {
  id: string
  code: string
  name: string
  description: string
  enabled: boolean
  category: string
}

interface MockPointsTransaction {
  id: string
  userId: string
  projectId: string
  amount: number
  balance: number
  type: string
  description: string
  createdAt: string
}
```

#### 6.1.2 数据生成规则

使用faker.js生成模拟数据：

```typescript
import { faker } from '@faker-js/faker/locale/zh_CN'

function generateMockProject(overrides?: Partial<MockProject>): MockProject {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.lorem.paragraph(),
    coverUrl: faker.image.urlPicsumPhotos(),
    status: faker.helpers.arrayElement([0, 1, 2, 3]),
    teamId: faker.string.uuid(),
    creatorId: faker.string.uuid(),
    episodeCount: faker.number.int({ min: 1, max: 24 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  }
}
```

#### 6.1.3 MockDataService类设计

```typescript
class MockDataService {
  private static instance: MockDataService
  private data: Map<string, any[]> = new Map()

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService()
    }
    return MockDataService.instance
  }

  initialize(models: Record<string, () => any[]>, count: number = 20): void
  getAll<T>(model: string): T[]
  getById<T>(model: string, id: string): T | undefined
  query<T>(model: string, predicate: (item: T) => boolean): T[]
  create<T>(model: string, data: Omit<T, 'id'>): T
  update<T>(model: string, id: string, data: Partial<T>): T | undefined
  delete(model: string, id: string): boolean
  paginate<T>(model: string, params: PaginatedParams): PaginatedResponse<T>
}
```

### 6.2 接口适配层设计

#### 6.2.1 适配层架构目录结构

```
src/api/
├── adapters/
│   ├── types.ts           # 统一接口定义
│   ├── mock-adapter.ts    # Mock适配器
│   ├── http-adapter.ts    # HTTP适配器
│   └── adapter-factory.ts # 工厂模式
├── modules/               # 业务API模块（现有）
└── index.ts
```

#### 6.2.2 统一接口定义

```typescript
interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  params?: Record<string, any>
  data?: any
  headers?: Record<string, string>
  responseType?: 'json' | 'blob'
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

interface IApiAdapter {
  request<T>(config: RequestConfig): Promise<T>
  get<T>(url: string, params?: Record<string, any>): Promise<T>
  post<T>(url: string, data?: any): Promise<T>
  put<T>(url: string, data?: any): Promise<T>
  delete<T>(url: string, data?: any): Promise<T>
}

interface IStreamAdapter {
  connect(url: string, data?: any): Promise<ReadableStream>
  disconnect(): void
  onMessage(handler: (data: any) => void): void
  onError(handler: (error: Error) => void): void
  onClose(handler: () => void): void
}
```

#### 6.2.3 MockAdapter实现

```typescript
class MockAdapter implements IApiAdapter {
  private mockService: MockDataService

  constructor() {
    this.mockService = MockDataService.getInstance()
  }

  async request<T>(config: RequestConfig): Promise<T> {
    await this.simulateDelay()
    const model = this.extractModelFromUrl(config.url)
    switch (config.method) {
      case 'GET': return this.handleGet<T>(model, config)
      case 'POST': return this.handlePost<T>(model, config)
      case 'PUT': return this.handlePut<T>(model, config)
      case 'DELETE': return this.handleDelete<T>(model, config)
      default: throw new Error(`Unsupported method: ${config.method}`)
    }
  }

  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 300 + 100
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private extractModelFromUrl(url: string): string { /* ... */ }
  private handleGet<T>(model: string, config: RequestConfig): T { /* ... */ }
  private handlePost<T>(model: string, config: RequestConfig): T { /* ... */ }
  private handlePut<T>(model: string, config: RequestConfig): T { /* ... */ }
  private handleDelete<T>(model: string, config: RequestConfig): T { /* ... */ }
}
```

#### 6.2.4 HttpAdapter实现

```typescript
class HttpAdapter implements IApiAdapter {
  async request<T>(config: RequestConfig): Promise<T> {
    return request<T>(config)
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return request<T>({ method: 'GET', url, params })
  }

  async post<T>(url: string, data?: any): Promise<T> {
    return request<T>({ method: 'POST', url, params: data })
  }

  async put<T>(url: string, data?: any): Promise<T> {
    return request<T>({ method: 'PUT', url, params: data })
  }

  async delete<T>(url: string, data?: any): Promise<T> {
    return request<T>({ method: 'DELETE', url, data })
  }
}
```

#### 6.2.5 AdapterFactory工厂模式

```typescript
type AdapterMode = 'mock' | 'http' | 'hybrid'

class AdapterFactory {
  private static instance: AdapterFactory
  private mockAdapter: MockAdapter
  private httpAdapter: HttpAdapter
  private mode: AdapterMode = 'http'
  private hybridConfig: Record<string, AdapterMode> = {}

  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory()
    }
    return AdapterFactory.instance
  }

  setMode(mode: AdapterMode): void {
    this.mode = mode
  }

  setHybridConfig(config: Record<string, AdapterMode>): void {
    this.hybridConfig = config
  }

  getAdapter(moduleName?: string): IApiAdapter {
    if (this.mode === 'mock') return this.mockAdapter
    if (this.mode === 'http') return this.httpAdapter
    if (moduleName && this.hybridConfig[moduleName]) {
      return this.hybridConfig[moduleName] === 'mock'
        ? this.mockAdapter
        : this.httpAdapter
    }
    return this.httpAdapter
  }
}
```

### 6.3 环境切换机制设计

#### 6.3.1 环境配置文件

```ini
# .env
VITE_API_MODE=http
VITE_API_URL=/
VITE_MOCK_ENABLED=false

# .env.development
VITE_API_MODE=hybrid
VITE_API_URL=/
VITE_API_PROXY_URL=http://server.bsuniversal.cn:10006
VITE_MOCK_ENABLED=true

# .env.staging
VITE_API_MODE=http
VITE_API_URL=https://staging-api.example.com
VITE_MOCK_ENABLED=false

# .env.production
VITE_API_MODE=http
VITE_API_URL=https://api.example.com
VITE_MOCK_ENABLED=false
```

#### 6.3.2 混合模式配置

```typescript
const apiModeConfig: Record<string, 'mock' | 'http'> = {
  auth: 'http',
  team: 'http',
  project: 'http',
  script: 'http',
  storyboard: 'http',
  character: 'mock',
  asset: 'http',
  'script-asset': 'mock',
  review: 'http',
  workflow: 'http',
  'workflow-manage': 'mock',
  video: 'http',
  image: 'http',
  editor: 'http',
  notification: 'http',
  points: 'http',
  billing: 'mock',
  statistics: 'mock',
  'ai-process': 'http',
  'data-history': 'http',
  'system-config': 'mock',
  'system-manage': 'http',
  'platform-admin': 'mock',
  'video-model': 'mock'
}
```

#### 6.3.3 运行时切换

```typescript
function useApiMode() {
  const currentMode = ref<AdapterMode>(
    (import.meta.env.VITE_API_MODE as AdapterMode) || 'http'
  )

  function switchMode(mode: AdapterMode) {
    currentMode.value = mode
    AdapterFactory.getInstance().setMode(mode)
  }

  function switchModuleMode(module: string, mode: 'mock' | 'http') {
    AdapterFactory.getInstance().setHybridConfig({ [module]: mode })
  }

  return { currentMode, switchMode, switchModuleMode }
}
```

### 6.4 统一错误处理策略

#### 6.4.1 ErrorCode枚举

```typescript
enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
  MOCK_ERROR = 'MOCK_ERROR',
  SSE_CONNECTION_ERROR = 'SSE_CONNECTION_ERROR',
  SSE_TIMEOUT = 'SSE_TIMEOUT'
}
```

#### 6.4.2 ApiError类

```typescript
class ApiError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number
  readonly data?: unknown
  readonly timestamp: string
  readonly requestId?: string

  constructor(options: {
    message: string
    code: ErrorCode
    statusCode?: number
    data?: unknown
    requestId?: string
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.code = options.code
    this.statusCode = options.statusCode ?? 0
    this.data = options.data
    this.timestamp = new Date().toISOString()
    this.requestId = options.requestId
  }

  isRetryable(): boolean {
    return [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT, ErrorCode.SERVER_ERROR].includes(this.code)
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      requestId: this.requestId
    }
  }
}
```

#### 6.4.3 错误处理中间件

```typescript
class ErrorHandlerMiddleware {
  private handlers: Map<ErrorCode, (error: ApiError) => void> = new Map()

  register(code: ErrorCode, handler: (error: ApiError) => void): void {
    this.handlers.set(code, handler)
  }

  handle(error: ApiError): void {
    const handler = this.handlers.get(error.code)
    if (handler) {
      handler(error)
    } else {
      this.defaultHandler(error)
    }
  }

  private defaultHandler(error: ApiError): void {
    console.error('[ApiError]', error.toJSON())
    ElMessage.error(error.message)
  }
}
```

### 6.5 接口版本控制方案

#### 6.5.1 ApiVersionConfig

```typescript
interface ApiVersionConfig {
  current: string
  supported: string[]
  deprecated: string[]
  baseUrl: string
}

const apiVersionConfig: ApiVersionConfig = {
  current: 'v1',
  supported: ['v1'],
  deprecated: [],
  baseUrl: '/api'
}
```

#### 6.5.2 versionedUrl函数

```typescript
function versionedUrl(path: string, version?: string): string {
  const v = version ?? apiVersionConfig.current
  if (path.startsWith('/api/')) {
    return path.replace('/api/', `/api/${v}/`)
  }
  return `/api/${v}${path}`
}
```

---

## 第7章: 改进建议与优先级

### 7.1 P0紧急修复（立即执行）

| 编号 | 建议 | 预期效果 | 工作量 |
|------|------|----------|--------|
| P0-1 | 生产环境API强制HTTPS | 消除中间人攻击风险 | 0.5天 |
| P0-2 | SSE接口封装回Axios或统一SSE客户端 | 修复Token和错误处理缺失 | 2天 |
| P0-3 | Token存储迁移至httpOnly Cookie或sessionStorage | 降低XSS令牌窃取风险 | 1天 |

### 7.2 P1重要修复（1-2周内）

| 编号 | 建议 | 预期效果 | 工作量 |
|------|------|----------|--------|
| P1-1 | 为8个any模块补充TypeScript类型定义 | 恢复类型安全 | 5天 |
| P1-2 | 启用HTTP重试机制（MAX_RETRIES=2） | 提升网络波动容错 | 0.5天 |
| P1-3 | 重构projectDataStore，移除硬编码数据 | Store与API对接 | 3天 |
| P1-4 | 实现团队切换后的全局状态刷新 | 消除数据过期 | 2天 |
| P1-5 | 集成WebSocket到通知模块 | 实现实时通知 | 3天 |
| P1-6 | 启用DataFlowBus，实现核心数据通道 | 建立跨模块通信 | 5天 |
| P1-7 | 实现审核决策后的联动更新 | 消除数据不一致 | 3天 |
| P1-8 | 统一params/data传参规范 | 提升可维护性 | 2天 |
| P1-9 | 实现AI异步任务进度回调（SSE） | 改善用户体验 | 3天 |

### 7.3 P2一般改进（1个月内）

| 编号 | 建议 | 预期效果 | 工作量 |
|------|------|----------|--------|
| P2-1 | 引入TanStack Query管理数据获取和缓存 | 自动刷新、缓存、乐观更新 | 5天 |
| P2-2 | 实现Mock数据服务和适配层 | 支持离线开发和混合模式 | 5天 |
| P2-3 | 统一ID类型为string | 消除类型不一致 | 3天 |
| P2-4 | 实现积分消耗联动扣减 | 积分显示准确 | 2天 |
| P2-5 | 实现未读通知实时展示 | 信息及时性 | 2天 |
| P2-6 | 实现视频生成完成后通知剪辑模块 | 工作流连贯 | 2天 |
| P2-7 | 实现分片上传断点续传 | 大文件上传可靠 | 3天 |
| P2-8 | 实现配置变更全局通知 | 配置实时生效 | 2天 |

### 7.4 P3优化建议（季度规划）

| 编号 | 建议 | 预期效果 | 工作量 |
|------|------|----------|--------|
| P3-1 | 实现乐观更新和回滚机制 | 提升交互响应速度 | 5天 |
| P3-2 | 实现API版本控制 | 平滑升级 | 3天 |
| P3-3 | 实现离线数据缓存（Service Worker） | 离线可用 | 5天 |
| P3-4 | 实现请求去重和防抖 | 避免重复请求 | 2天 |
| P3-5 | 实现并发冲突处理 | 多人协作安全 | 5天 |

### 7.5 实施路线图

```
阶段1: 紧急修复（第1周）
├── P0-1: 生产环境HTTPS
├── P0-2: Token存储迁移
└── P0-3: 三个完全硬编码模块API对接

阶段2: 数据层架构重构（第2-3周）
├── P1-1: Store架构重构（新增业务Store）
├── P1-2: 激活DataFlowBus跨模块联动
├── P1-3: 集成WebSocket到通知系统
├── P1-4: 封装SSE纳入统一拦截器
├── P1-5: 消除API返回类型any
├── P1-6: 统一POST/PUT请求体传递方式
├── P1-7: 锁屏密钥安全化
├── P1-8: 写操作API持久化（23个文件）
└── P1-9: AI异步任务进度回调

阶段3: 数据服务与功能完善（第4-6周）
├── P2-1: 引入TanStack Query
├── P2-2: Mock数据服务和适配层
├── P2-3: 统一ID类型为string
├── P2-4: 积分消耗联动扣减
├── P2-5: 未读通知实时展示
├── P2-6: 视频生成完成通知剪辑模块
├── P2-7: 分片上传断点续传
└── P2-8: 配置变更全局通知

阶段4: 优化与长期规划（第7-12周）
├── P3-1: 乐观更新和回滚机制
├── P3-2: API版本控制
├── P3-3: 离线数据缓存
├── P3-4: 请求去重和防抖
└── P3-5: 并发冲突处理
```

---

## 附录B: Store模块完整清单

| Store | 状态字段数 | Actions数 | Getters数 | 持久化 | 视图使用率 |
|-------|-----------|----------|----------|--------|-----------|
| useUserStore | 8 | 10 | 3 | ✅ localStorage | 1.2% |
| useSettingStore | 27+ | 25+ | 5 | ✅ localStorage | 布局组件 |
| useTableStore | 5 | 5 | 0 | ✅ 部分 | 表格组件 |
| useMenuStore | 4 | 6 | 0 | ❌ | 1.2% |
| useWorktabStore | 3 | 17 | 3 | ✅ localStorage | 标签页组件 |
| useScriptProjectStore | 1 | 2 | 3 | ❌ | 7.4% |
| useProjectDataStore | 8 | 9 | 6 | ❌ | 0% |

---

## 附录C: DataFlowBus通道清单

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

## 附录D: 前后端API对接覆盖率统计

| 对接程度 | 文件数 | 占比 | 典型表现 |
|----------|--------|------|---------|
| 完全硬编码 (0% API) | 17 | 21.0% | 所有数据本地ref/reactive，所有操作ElMessage |
| 大部分硬编码 (<30% API) | 12 | 14.8% | 仅列表加载对接API，图表/统计硬编码 |
| 部分硬编码 (30%-70% API) | 23 | 28.4% | 读取对接API，写操作仅本地 |
| 较好对接 (>70% API) | 29 | 35.8% | 读写基本对接API |

### 按模块API对接覆盖率

| 模块 | API端点数 | 前端对接数 | 覆盖率 | 评级 |
|------|----------|-----------|--------|------|
| Auth | 13 | 12 | 92.3% | ★★★★★ |
| Project | 20 | 12 | 60.0% | ★★★☆☆ |
| Script | 30 | 15 | 50.0% | ★★☆☆☆ |
| Storyboard | 27 | 11 | 40.7% | ★★☆☆☆ |
| Asset | 28 | 14 | 50.0% | ★★☆☆☆ |
| Team | 30 | 0 | 0.0% | ☆☆☆☆☆ |
| Review | 20 | 6 | 30.0% | ★☆☆☆☆ |
| Workflow | 11 | 6 | 54.5% | ★★★☆☆ |
| Notification | 22 | 0 | 0.0% | ☆☆☆☆☆ |
| Statistics | 24 | 4 | 16.7% | ★☆☆☆☆ |
| Video | 10 | 6 | 60.0% | ★★★☆☆ |
| Image | 6 | 4 | 66.7% | ★★★☆☆ |
| Editor | 11 | 6 | 54.5% | ★★★☆☆ |
| Points | 8 | 4 | 50.0% | ★★☆☆☆ |
| Billing | 6 | 0 | 0.0% | ☆☆☆☆☆ |
| Character | 8 | 2 | 25.0% | ★☆☆☆☆ |
| ScriptAsset | 10 | 2 | 20.0% | ★☆☆☆☆ |
| WorkflowManage | 8 | 1 | 12.5% | ★☆☆☆☆ |
| VideoModel | 5 | 0 | 0.0% | ☆☆☆☆☆ |
| SystemConfig | 14 | 2 | 14.3% | ★☆☆☆☆ |
| SystemManage | 5 | 3 | 60.0% | ★★★☆☆ |
| PlatformAdmin | 15 | 0 | 0.0% | ☆☆☆☆☆ |
| AIProcess | 3 | 0 | 0.0% | ☆☆☆☆☆ |
| DataHistory | 3 | 0 | 0.0% | ☆☆☆☆☆ |
| **合计** | **287** | **94** | **32.8%** | **★★☆☆☆** |

---

*报告生成时间: 2026-05-30*
*审核工具: Trae AI Code Assistant*
*报告版本: v2.0*
├── P0-2: SSE接口封装
└── P0-3: Token存储迁移

阶段2: 核心修复（第2-3周）
├── P1-1: 类型定义补充
├── P1-2: HTTP重试启用
├── P1-3: Store重构
├── P1-4: 团队切换刷新
└── P1-5: WebSocket集成

阶段3: 架构改进（第4-6周）
├── P1-6: DataFlowBus启用
├── P1-7: 审核联动更新
├── P1-8: 传参规范统一
├── P1-9: AI进度回调
├── P2-1: TanStack Query引入
└── P2-2: Mock数据服务

阶段4: 持续优化（第7-12周）
├── P2-3 ~ P2-8: 一般改进
└── P3-1 ~ P3-5: 优化建议
```

---

## 附录A: API接口完整清单

### A.1 认证模块 (auth) — 13个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 退出登录 |
| POST | /api/auth/refresh | 刷新AccessToken |
| POST | /api/auth/refresh-token | RefreshToken刷新 |
| GET | /api/auth/captcha | 获取图形验证码 |
| POST | /api/auth/captcha/email | 发送邮箱验证码 |
| POST | /api/auth/password/reset | 重置密码 |
| GET | /api/auth/me | 获取当前用户信息 |
| PUT | /api/auth/profile | 修改用户信息 |
| POST | /api/auth/avatar | 上传头像 |
| GET | /api/auth/avatar/{userId} | 获取用户头像 |
| GET | /api/auth/permissions | 获取权限信息 |

### A.2 团队管理模块 (team) — 30个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/teams/member/teams | 获取我的团队列表 |
| GET | /api/teams/{teamId} | 获取团队详情 |
| PUT | /api/teams/{teamId} | 更新团队信息 |
| POST | /api/teams/member/switch | 切换当前团队 |
| POST | /api/teams/member/apply | 申请加入团队 |
| POST | /api/teams/member/join-by-code | 通过邀请码加入 |
| POST | /api/teams/member/leave | 退出团队 |
| GET | /api/teams/member/applications | 获取我的申请记录 |
| GET | /api/teams/{teamId}/members | 获取团队成员列表 |
| POST | /api/teams/{teamId}/members/import | 批量导入成员 |
| PUT | /api/teams/{teamId}/members/role | 更新成员角色 |
| PUT | /api/teams/{teamId}/members/status | 更新成员状态 |
| DELETE | /api/teams/{teamId}/members/{memberId} | 移除成员 |
| GET | /api/teams/{teamId}/members/{memberId}/permissions | 获取成员权限 |
| PUT | /api/teams/{teamId}/members/{memberId}/permissions | 设置成员权限 |
| PUT | /api/teams/{teamId}/owner | 转移团队所有权 |
| GET | /api/teams/{teamId}/roles | 获取团队角色列表 |
| POST | /api/teams/{teamId}/roles | 创建团队角色 |
| PUT | /api/teams/{teamId}/roles/{roleId} | 更新团队角色 |
| DELETE | /api/teams/{teamId}/roles/{roleId} | 删除团队角色 |
| GET | /api/teams/{teamId}/roles/{roleId}/permissions | 获取角色权限详情 |
| PUT | /api/teams/{teamId}/roles/{roleId}/permissions | 设置角色权限 |
| GET | /api/teams/{teamId}/available-permissions | 获取可分配权限列表 |
| GET | /api/teams/member/permissions | 获取我的权限 |
| GET | /api/teams/{teamId}/invite-codes | 获取邀请码列表 |
| POST | /api/teams/{teamId}/invite-codes | 创建邀请码 |
| DELETE | /api/teams/{teamId}/invite-codes/{id} | 撤销邀请码 |
| GET | /api/teams/{teamId}/applications | 获取加入申请列表 |
| PUT | /api/teams/{teamId}/applications/{id}/approve | 审批通过 |
| PUT | /api/teams/{teamId}/applications/{id}/reject | 审批拒绝 |

### A.3 项目管理模块 (project) — 20个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/projects | 获取项目列表 |
| GET | /api/projects/{projectId} | 获取项目详情 |
| POST | /api/projects | 创建项目 |
| PUT | /api/projects/{projectId} | 更新项目 |
| DELETE | /api/projects/{projectId} | 删除项目 |
| POST | /api/projects/{projectId}/restore | 恢复项目 |
| POST | /api/projects/{projectId}/archive | 归档项目 |
| POST | /api/projects/{projectId}/unarchive | 解档项目 |
| PUT | /api/projects/{projectId}/status | 更新项目状态 |
| POST | /api/projects/{projectId}/copy | 复制项目 |
| POST | /api/projects/{projectId}/cover | 上传项目封面 |
| GET | /api/projects/{projectId}/members | 获取项目成员列表 |
| POST | /api/projects/{projectId}/members | 添加项目成员 |
| PUT | /api/projects/{projectId}/members/role | 更新项目成员角色 |
| DELETE | /api/projects/{projectId}/members/{memberId} | 移除项目成员 |
| GET | /api/projects/{projectId}/config | 获取项目配置 |
| PUT | /api/projects/{projectId}/config | 更新项目配置 |
| GET | /api/projects/{projectId}/review-config | 获取审核门禁配置 |
| PUT | /api/projects/{projectId}/review-config | 更新审核门禁配置 |
| GET | /api/projects/{projectId}/statistics | 获取项目统计 |

### A.4 剧本管理模块 (script) — 30个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/projects/{projectId}/scripts | 获取剧本列表 |
| GET | /api/scripts/{scriptId} | 获取剧本详情 |
| POST | /api/projects/{projectId}/scripts | 创建剧本 |
| PUT | /api/scripts/{scriptId} | 更新剧本 |
| DELETE | /api/scripts/{scriptId} | 删除剧本 |
| POST | /api/scripts/{scriptId}/submit-review | 提交剧本审核 |
| POST | /api/scripts/{scriptId}/withdraw-review | 撤回剧本审核 |
| GET | /api/scripts/{scriptId}/review-status | 获取剧本审核状态 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/decompose | 拆解剧本为分集 |
| GET | /api/projects/{projectId}/scripts/{scriptId}/episodes | 查询剧本分集列表 |
| GET | /api/projects/{projectId}/episodes | 查询项目所有分集 |
| GET | /api/scripts/{scriptId}/episodes/{episodeId} | 查询分集详情 |
| PUT | /api/scripts/{scriptId}/episodes/{episodeId} | 修改分集 |
| DELETE | /api/scripts/{scriptId}/episodes/{episodeId} | 删除分集 |
| POST | /api/projects/{projectId}/episodes | 手动创建分集 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/character-profiles | 生成人物小传 |
| GET | /api/scripts/{scriptId}/character-profiles | 获取人物小传结果 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/extract-assets | 提取资产表 |
| GET | /api/scripts/{scriptId}/extracted-assets | 获取资产提取结果 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/style-config | 生成风格配置 |
| GET | /api/scripts/{scriptId}/style-config | 获取风格配置结果 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/ref-analysis | 参考图风格反推 |
| GET | /api/scripts/{scriptId}/ref-analysis | 获取参考图分析结果 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/review-content | 剧本违规审核 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/voice-prompts | 生成音色提示词 |
| GET | /api/scripts/{scriptId}/voice-prompts | 获取音色提示词结果 |
| GET | /api/scripts/{scriptId}/post-approval-status | 获取资产生成进度 |
| GET | /api/scripts/{scriptId}/asset-prompts | 获取资产提示词结果 |
| GET | /api/scripts/{scriptId}/asset-images | 获取资产图片结果 |
| GET | /api/episodes/{episodeId}/video-prompts | 获取视频提示词结果 |

### A.5 分镜管理模块 (storyboard) — 27个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/projects/{projectId}/storyboards | 查询分镜列表 |
| GET | /api/storyboards/{storyboardId} | 获取分镜详情 |
| POST | /api/projects/{projectId}/storyboards | 创建分镜 |
| PUT | /api/storyboards/{storyboardId} | 更新分镜 |
| DELETE | /api/storyboards/{storyboardId} | 删除分镜 |
| DELETE | /api/storyboards/batch-delete | 批量删除分镜 |
| POST | /api/storyboards/{storyboardId}/submit-review | 提交分镜审核 |
| POST | /api/storyboards/batch-submit-review | 批量提交分镜审核 |
| POST | /api/storyboards/{storyboardId}/withdraw-review | 撤回分镜审核 |
| GET | /api/storyboards/{storyboardId}/review-status | 获取分镜审核状态 |
| GET | /api/storyboards/{storyboardId}/versions | 获取版本历史 |
| POST | /api/storyboards/{storyboardId}/versions/{versionId}/rollback | 回滚版本 |
| GET | /api/storyboards/{storyboardId}/images | 获取分镜配图列表 |
| POST | /api/storyboards/{storyboardId}/images | 添加分镜配图 |
| DELETE | /api/storyboards/images/{imageId} | 删除分镜配图 |
| GET | /api/storyboards/{storyboardId}/assets | 获取分镜关联资产 |
| POST | /api/storyboards/{storyboardId}/assets | 关联资产到分镜 |
| DELETE | /api/storyboards/{storyboardId}/assets/{assetId} | 解除资产关联 |
| PUT | /api/scenes/{sceneId}/storyboards/reorder | 分镜重排序 |
| GET | /api/episodes/{episodeId}/scenes | 查询镜头列表 |
| POST | /api/scenes | 创建镜头 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/storyboard/decompose | 分镜拆解 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/storyboard/rebuild | 分镜重建 |
| GET | /api/projects/{projectId}/scripts/{scriptId}/storyboards | 获取剧本分镜列表 |

### A.6 角色管理模块 (character) — 8个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/projects/{projectId}/characters | 获取项目角色列表 | any[] |
| POST | /api/projects/{projectId}/characters | 创建角色 | any |
| GET | /api/projects/{projectId}/characters/{characterId} | 获取角色详情 | any |
| PUT | /api/projects/{projectId}/characters/{characterId} | 更新角色 | any |
| DELETE | /api/projects/{projectId}/characters/{characterId} | 删除角色 | void |
| POST | /api/projects/{projectId}/characters/{characterId}/link/{storyboardId} | 关联角色到分镜 | void |
| DELETE | /api/projects/{projectId}/characters/{characterId}/unlink/{storyboardId} | 取消分镜角色关联 | void |
| GET | /api/projects/{projectId}/characters/by-storyboard/{storyboardId} | 获取分镜关联的角色列表 | any[] |

### A.7 资产库模块 (asset) — 28个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/projects/{projectId}/assets | 获取项目资产列表 |
| GET | /api/projects/{projectId}/assets/{assetId} | 获取资产详情 |
| POST | /api/projects/{projectId}/assets | 上传单文件到项目资产库 |
| PUT | /api/projects/{projectId}/assets/{assetId} | 更新资产 |
| DELETE | /api/projects/{projectId}/assets/{assetId} | 删除资产 |
| DELETE | /api/projects/{projectId}/assets/batch-delete | 批量删除资产 |
| GET | /api/projects/{projectId}/assets/{assetId}/download | 下载资产文件 |
| POST | /api/projects/{projectId}/assets/batch-download | 批量下载资产 |
| GET | /api/projects/{projectId}/assets/{assetId}/versions | 获取资产版本列表 |
| POST | /api/projects/{projectId}/assets/{assetId}/rollback | 回滚资产版本 |
| POST | /api/projects/{projectId}/assets/chunk-init | 初始化分片上传 |
| POST | /api/projects/{projectId}/assets/chunk-upload | 上传分片 |
| POST | /api/projects/{projectId}/assets/chunk-complete | 合并分片 |
| DELETE | /api/projects/{projectId}/assets/chunk-cancel | 取消分片上传 |
| POST | /api/projects/{projectId}/assets/batch | 批量上传资产 |
| POST | /api/projects/{projectId}/assets/batch-tags | 批量添加标签 |
| DELETE | /api/projects/{projectId}/assets/batch-tags | 批量移除标签 |
| POST | /api/projects/{projectId}/assets/batch-move | 批量移动分类 |
| POST | /api/projects/{projectId}/assets/ai-generate | AI生成资产 |
| GET | /api/projects/{projectId}/assets/reference-images | 获取参考图列表 |
| POST | /api/projects/{projectId}/assets/reference-images | 上传参考图 |
| DELETE | /api/projects/{projectId}/assets/reference-images/{assetId} | 删除参考图 |
| POST | /api/projects/{projectId}/assets/import-from-team | 从团队库导入资产 |
| GET | /api/teams/{teamId}/assets | 获取团队资产列表 |
| POST | /api/teams/{teamId}/assets | 上传团队资产 |
| GET | /api/teams/{teamId}/assets/{assetId} | 获取团队资产详情 |
| GET | /api/teams/{teamId}/asset-categories | 获取团队资产分类列表 |

### A.8 剧本资产模块 (script-asset) — 10个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/projects/{projectId}/script-assets | 查询剧本资产列表 | any[] |
| POST | /api/projects/{projectId}/script-assets | 创建创意资产 | any |
| POST | /api/projects/{projectId}/script-assets/batch | 批量创建创意资产 | any[] |
| GET | /api/script-assets/{assetId} | 获取创意资产详情 | any |
| PUT | /api/script-assets/{assetId} | 更新创意资产 | any |
| DELETE | /api/script-assets/{assetId} | 删除创意资产 | void |
| POST | /api/script-assets/{assetId}/upload-image | 上传资产参考图 | any |
| POST | /api/projects/{projectId}/scripts/{scriptId}/assets/prompts | 生成资产提示词 | any |
| POST | /api/projects/{projectId}/scripts/{scriptId}/assets/images/generate | 生成资产图片 | any |
| POST | /api/projects/{projectId}/scripts/{scriptId}/assets/images/review | 审核资产图片 | void |

### A.9 审核中心模块 (review) — 20个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/review/list | 查询审核任务列表 |
| GET | /api/review/items | 查询审核项列表 |
| GET | /api/review/detail/{id} | 获取审核任务详情 |
| POST | /api/review/create | 创建审核任务 |
| POST | /api/review/{id}/claim | 认领审核 |
| POST | /api/review/decision | 做出审核决定 |
| POST | /api/review/batch-decision | 批量审核决定 |
| POST | /api/review/{id}/withdraw | 撤回审核 |
| POST | /api/review/{id}/archive | 归档入库 |
| POST | /api/review/{id}/dispatch | 下发成果 |
| GET | /api/review/status/{reviewType}/{targetId} | 通用审核状态查询 |
| GET | /api/review/pending-count | 获取待审核数量 |
| GET | /api/review/my-submissions | 查询我的提交 |
| GET | /api/review/projects/{projectId}/statistics | 获取审核统计 |
| POST | /api/review/projects/{projectId}/export | 导出审核记录 |
| GET | /api/review/projects/{projectId}/reject-reasons | 获取驳回原因列表 |
| POST | /api/review/projects/{projectId}/reject-reasons | 添加驳回原因 |
| DELETE | /api/review/projects/{projectId}/reject-reasons/{reasonId} | 删除驳回原因 |
| GET | /api/review/projects/{projectId}/route-config | 获取审核路由配置 |
| PUT | /api/review/projects/{projectId}/route-config | 更新审核路由配置 |

### A.10 工作流执行模块 (workflow) — 11个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/dify-workflows/{workflowCode}/upload-file | 上传文件到Dify |
| POST | /api/dify-workflows/{workflowCode}/execute | 阻塞模式执行工作流 |
| POST | /api/dify-workflows/{workflowCode}/execute-stream | SSE流式模式执行工作流 |
| POST | /api/dify-workflows/runs/{workflowCode}/{taskId}/stop | 停止工作流执行 |
| GET | /api/dify-workflows/runs/{workflowCode}/{runId} | 查询工作流运行状态 |
| POST | /api/dify-workflows/multimodal/execute | 自适应执行单一工作流 |
| POST | /api/dify-workflows/multimodal/execute-stream | 自适应执行工作流(SSE) |
| POST | /api/dify-workflows/multimodal/execute-chain | 链式执行工作流 |
| POST | /api/ai/style-inference | 风格反推 |
| GET | /api/dify-workflows/catalog | 获取工作流目录 |

### A.11 工作流管理模块 (workflow-manage) — 8个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/admin/dify-workflows | 查询工作流列表 | any[] |
| POST | /api/admin/dify-workflows | 创建工作流 | any |
| GET | /api/admin/dify-workflows/{id} | 查询工作流详情 | any |
| PUT | /api/admin/dify-workflows/{id} | 更新工作流 | any |
| DELETE | /api/admin/dify-workflows/{id} | 删除工作流 | void |
| PATCH | /api/admin/dify-workflows/{id}/status | 启用/禁用工作流 | void |
| POST | /api/admin/dify-workflows/test-connection | 测试工作流连通性 | any |
| POST | /api/admin/dify-workflows/test-all-connections | 批量测试连通性 | any[] |

### A.12 视频生成模块 (video) — 10个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/seedance/generations | 提交视频生成任务 |
| POST | /api/seedance/generations/preview | 预览视频生成参数 |
| GET | /api/seedance/tasks | 查询任务列表 |
| GET | /api/seedance/tasks/{taskId} | 查询任务详情 |
| GET | /api/seedance/tasks/{taskId}/result | 获取任务结果 |
| POST | /api/seedance/tasks/{taskId}/cancel | 取消任务 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts | 生成视频提示词 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/violation-check | 视频提示词违规检测 |
| POST | /api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/fix | 视频提示词修改 |

### A.13 图片生成模块 (image) — 6个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /api/gpt-image/generations | 提交图片生成任务 |
| GET | /api/gpt-image/tasks/{taskId} | 查询任务状态 |
| GET | /api/gpt-image/tasks/{taskId}/review-status | 查询图片审核状态 |
| GET | /api/gpt-image/tasks/{taskId}/result | 获取任务结果 |
| GET | /api/gpt-image/models | 获取模型列表 |
| GET | /api/gpt-image/models/{modelCode} | 获取模型详情 |

### A.14 剪辑管理模块 (editor) — 11个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/edit/projects | 获取剪辑项目列表 |
| GET | /api/edit/projects/{projectId} | 获取剪辑项目详情 |
| POST | /api/edit/projects | 创建剪辑项目 |
| PUT | /api/edit/projects/{projectId} | 更新剪辑项目 |
| DELETE | /api/edit/projects/{projectId} | 删除剪辑项目 |
| POST | /api/edit/projects/{projectId}/segments | 添加片段 |
| PUT | /api/edit/projects/{projectId}/segments/{segmentId} | 更新片段 |
| DELETE | /api/edit/projects/{projectId}/segments/{segmentId} | 删除片段 |
| PUT | /api/edit/projects/{projectId}/segments/reorder | 片段重排序 |
| POST | /api/edit/projects/{projectId}/export | 导出成片 |
| GET | /api/edit/exports/{exportId} | 查询导出状态 |

### A.15 通知管理模块 (notification) — 22个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/notifications | 获取通知列表 |
| GET | /api/notifications/{id} | 获取通知详情 |
| GET | /api/notifications/unread-count | 获取未读通知数量 |
| POST | /api/notifications/{id}/read | 标记已读 |
| POST | /api/notifications/{id}/unread | 标记未读 |
| POST | /api/notifications/read-all | 全部已读 |
| POST | /api/notifications/batch-read | 批量已读 |
| DELETE | /api/notifications/{id} | 删除通知 |
| DELETE | /api/notifications/batch-delete | 批量删除通知 |
| POST | /api/notifications/clear-read | 清空已读通知 |
| POST | /api/notifications/{id}/star | 收藏通知 |
| GET | /api/notifications/starred | 获取收藏列表 |
| GET | /api/notifications/search | 搜索通知 |
| GET | /api/notifications/export | 导出通知 |
| GET | /api/notifications/preference | 获取通知偏好设置 |
| PUT | /api/notifications/preference | 更新通知偏好设置 |
| GET | /api/notifications/dnd | 获取免打扰设置 |
| PUT | /api/notifications/dnd | 更新免打扰设置 |
| GET | /api/notifications/subscribe | 获取订阅列表 |
| POST | /api/notifications/subscribe | 新增订阅 |
| DELETE | /api/notifications/subscribe/{id} | 取消订阅 |
| POST | /api/notifications/ws-token | 获取WebSocket Token |

### A.16 积分用量模块 (points) — 8个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/credits/me | 获取个人积分余额 |
| GET | /api/credits/transactions | 获取个人积分流水 |
| GET | /api/credits/project/{projectId} | 获取项目积分余额 |
| GET | /api/credits/pricing | 获取模型定价列表 |
| GET | /api/token-usage/me | 获取个人Token用量统计 |
| GET | /api/token-usage/records | 获取个人Token用量记录列表 |
| GET | /api/token-usage/project/{projectId} | 获取项目Token用量统计 |
| GET | /api/token-usage/team/{teamId} | 获取团队Token用量统计 |

### A.17 计费管理模块 (billing) — 6个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/admin/billing | 获取定价列表 | any[] |
| POST | /api/admin/billing | 新增定价 | any |
| GET | /api/admin/billing/{id} | 获取定价详情 | any |
| PUT | /api/admin/billing/{id} | 更新定价 | any |
| PUT | /api/admin/billing/{id}/toggle | 启用/停用定价 | any |
| GET | /api/admin/billing/{id}/history | 获取调价历史 | any[] |

### A.18 统计分析模块 (statistics) — 24个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/statistics/dashboard | 获取核心指标看板 | any |
| GET | /api/statistics/realtime | 获取实时数据 | any |
| GET | /api/statistics/trends | 获取趋势图表 | any |
| GET | /api/statistics/credits | 获取积分余额 | any |
| GET | /api/statistics/alerts | 获取数据预警 | any[] |
| GET | /api/statistics/teams/ranking | 获取团队排名 | any[] |
| GET | /api/statistics/teams/{teamId}/workload | 获取团队工作量统计 | any |
| GET | /api/statistics/teams/{teamId}/users/contribution | 获取用户贡献度 | any[] |
| GET | /api/statistics/teams/{teamId}/users/activity | 获取用户活跃度 | any[] |
| GET | /api/statistics/teams/{teamId}/projects/completion | 获取项目完成率 | any |
| GET | /api/statistics/teams/{teamId}/reports/scheduled | 获取定时报表列表 | any[] |
| POST | /api/statistics/teams/{teamId}/reports/scheduled | 创建定时报表 | any |
| PUT | /api/statistics/teams/{teamId}/reports/scheduled/{id} | 更新定时报表 | any |
| DELETE | /api/statistics/teams/{teamId}/reports/scheduled/{id} | 删除定时报表 | void |
| POST | /api/statistics/teams/{teamId}/reports/custom | 生成自定义报表 | any |
| POST | /api/statistics/teams/{teamId}/export | 导出报表 | Blob |
| GET | /api/statistics/projects/{projectId}/videos | 获取视频统计 | any |
| GET | /api/statistics/projects/{projectId}/usage | 获取项目用量概览 | any |
| GET | /api/statistics/projects/{projectId}/usage/detail | 获取用量详细记录 | any |
| GET | /api/statistics/projects/{projectId}/storyboards | 获取分镜统计 | any |
| GET | /api/statistics/projects/{projectId}/resources | 获取资源消耗 | any |
| GET | /api/statistics/projects/{projectId}/ai-usage | 获取AI消耗统计 | any |
| GET | /api/statistics/projects/analysis | 获取项目分析 | any[] |
| GET | /api/statistics/users/activity-rank | 获取用户活跃排名 | any[] |

### A.19 AI处理记录模块 (ai-process) — 3个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/ai-process/status | 查询当前处理状态 |
| GET | /api/ai-process/history | 查询AI处理历史列表 |
| GET | /api/ai-process/history/{recordId} | 查询AI处理历史详情 |

### A.20 数据历史模块 (data-history) — 3个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/data-history | 查询历史版本列表 |
| GET | /api/data-history/{historyId} | 查询历史版本详情 |
| POST | /api/data-history/rollback | 回退数据到历史版本 |

### A.21 系统配置模块 (system-config) — 14个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/admin/config | 获取配置列表 | any[] |
| POST | /api/admin/config | 创建配置 | any |
| GET | /api/admin/config/{key} | 查询配置 | any |
| PUT | /api/admin/config/{key} | 更新配置 | any |
| DELETE | /api/admin/config/{key} | 删除配置 | void |
| GET | /api/admin/config/group/{groupName} | 获取分组配置 | any[] |
| GET | /api/admin/config/audit | 获取审计日志 | any[] |
| POST | /api/admin/config/refresh | 刷新配置缓存 | void |
| GET | /api/projects/{projectId}/webhooks | 获取Webhook列表 | any[] |
| POST | /api/projects/{projectId}/webhooks | 创建Webhook | any |
| PUT | /api/projects/{projectId}/webhooks/{id} | 更新Webhook | any |
| DELETE | /api/projects/{projectId}/webhooks/{id} | 删除Webhook | void |
| POST | /api/projects/{projectId}/webhooks/{id}/test | 测试Webhook | any |

### A.22 系统管理模块 (system-manage) — 5个端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/admin/users | 获取用户列表 |
| GET | /api/admin/users/{id} | 获取用户详情 |
| PUT | /api/admin/users/{id}/status | 启用/禁用用户 |
| GET | /api/v3/system/menus/simple | 获取菜单列表 |
| GET | /api/admin/roles | 获取角色列表 |

### A.23 平台管理模块 (platform-admin) — 15个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/admin/teams | 获取团队列表（全局） | PaginatedResponse\<any\> |
| POST | /api/admin/teams | 创建团队 | any |
| GET | /api/admin/teams/{teamId} | 获取团队详情 | any |
| PUT | /api/admin/teams/{teamId} | 更新团队 | any |
| DELETE | /api/admin/teams/{teamId} | 删除团队 | void |
| PUT | /api/admin/teams/{teamId}/status | 设置团队状态 | void |
| PUT | /api/admin/teams/{teamId}/owner | 转移团队所有权 | void |
| GET | /api/admin/teams/{teamId}/members | 获取成员列表 | PaginatedResponse\<any\> |
| GET | /api/admin/teams/{teamId}/invite-codes | 获取邀请码列表 | PaginatedResponse\<any\> |
| POST | /api/admin/teams/{teamId}/invite-codes | 创建邀请码 | any |
| GET | /api/admin/teams/{teamId}/applications | 获取加入申请列表 | PaginatedResponse\<any\> |
| PUT | /api/admin/members/{id}/status | 更新成员状态 | void |
| PUT | /api/admin/applications/{id}/approve | 审批通过 | void |
| PUT | /api/admin/applications/{id}/reject | 审批拒绝 | void |
| DELETE | /api/admin/invite-codes/{id} | 撤销邀请码 | void |

### A.24 视频模型配置模块 (video-model) — 5个端点

| 方法 | 路径 | 功能 | 返回类型 |
|------|------|------|----------|
| GET | /api/admin/videos/models | 获取模型列表 | any[] |
| POST | /api/admin/videos/models | 创建模型 | any |
| PUT | /api/admin/videos/models/{modelId} | 更新模型 | any |
| DELETE | /api/admin/videos/models/{modelId} | 删除模型 | void |
| PATCH | /api/admin/videos/models/{modelId}/status | 切换模型状态 | void |

---

## 附录B: Store模块完整清单

| Store名称 | 文件路径 | 持久化 | 视图使用率 | 核心功能 |
|-----------|----------|--------|-----------|----------|
| userStore | store/modules/user.ts | localStorage | ~90% | 认证、用户信息、令牌、锁屏 |
| settingStore | store/modules/setting.ts | localStorage | ~80% | 全局设置、主题、布局 |
| worktabStore | store/modules/worktab.ts | localStorage | ~70% | 工作台标签页管理 |
| menuStore | store/modules/menu.ts | localStorage | ~60% | 菜单和路由管理 |
| tableStore | store/modules/table.ts | 未持久化 | ~30% | 表格状态缓存 |
| projectDataStore | store/modules/project-data.ts | 未持久化 | 0% | 项目/分集/分镜/角色/轨道（全部硬编码） |
| scriptProjectStore | store/modules/script-project.ts | persist: false | 7.4% | 剧本项目选择（引用projectDataStore） |

---

## 附录C: DataFlowBus通道清单

| 通道ID | 名称 | 源 | 目标 | 方向 | 监控 | 实际使用 |
|--------|------|-----|------|------|------|----------|
| flow:api->project-list | 项目列表数据流 | api:project | page:project-list | ONE_WAY | ✅ | ❌ 未使用 |
| flow:api->script-list | 剧本列表数据流 | api:script | page:script-list | ONE_WAY | ✅ | ❌ 未使用 |
| flow:api->asset-list | 资产列表数据流 | api:asset | page:asset-library | ONE_WAY | ✅ | ❌ 未使用 |
| flow:api->review-list | 审核列表数据流 | api:review | page:review-pending | ONE_WAY | ✅ | ❌ 未使用 |
| flow:api->workflow-list | 工作流列表数据流 | api:workflow | page:workflow-list | ONE_WAY | ✅ | ❌ 未使用 |
| flow:api->team-list | 团队列表数据流 | api:team | page:team-list | ONE_WAY | ✅ | ❌ 未使用 |
| flow:store->user-info | 用户信息数据流 | store:user | page:* | BROADCAST | ✅ | ❌ 未使用 |
| flow:store->settings | 设置数据流 | store:setting | component:* | BROADCAST | ✅ | ❌ 未使用 |
| flow:store->project-data | 项目数据流 | store:project-data | page:project-* | TWO_WAY | ✅ | ❌ 未使用 |
| flow:page->api:form-submit | 表单提交数据流 | page:* | api:* | ONE_WAY | ✅ | ❌ 未使用 |
| flow:event-bus:global | 全局事件总线 | mitt:global | component:* | BROADCAST | ❌ | ❌ 未使用 |

**统计**：11个通道，0个被业务代码实际使用，使用率0%。

---

## 附录D: 前后端API对接覆盖率统计

### D.1 视图文件API对接分布

| 对接程度 | 文件数 | 占比 | 说明 |
|----------|--------|------|------|
| 完全硬编码 (0% API) | 17 | 21.0% | 数据全部来自本地硬编码或Store硬编码 |
| 大部分硬编码 (<30% API) | 12 | 14.8% | 少量API调用，大部分数据硬编码 |
| 部分硬编码 (30%-70% API) | 23 | 28.4% | 部分功能对接API，部分硬编码 |
| 较好对接 (>70% API) | 29 | 35.8% | 大部分功能对接API |
| **合计** | **81** | **100%** | |

### D.2 API模块类型安全统计

| 类别 | 模块数 | 端点数 | any返回数 | any占比 |
|------|--------|--------|-----------|---------|
| 类型安全（无any） | 16 | 197 | 0 | 0% |
| 部分any | 0 | 0 | 0 | 0% |
| 全部any | 8 | 90 | ~87 | ~97% |
| **合计** | **24** | **287** | **~87** | **~30%** |

### D.3 关键指标汇总

| 指标 | 数值 | 评估 |
|------|------|------|
| API端点总数 | 287 | 覆盖面广 |
| 类型安全端点占比 | ~70% | 需改进 |
| Store视图使用率 | 仅3个Store被有效使用 | 严重不足 |
| DataFlowBus使用率 | 0% (11通道/0调用) | 完全闲置 |
| WebSocket集成状态 | 已实现未集成 | 需启用 |
| SSE封装状态 | 2个接口绕过封装 | 需修复 |
| HTTP重试 | MAX_RETRIES=0 | 需启用 |
| 生产环境协议 | HTTP | 需升级HTTPS |

---

*报告生成时间: 2026-05-30*
*审核工具: DreamCraft Astra 代码审核系统*
*报告版本: v1.0*
