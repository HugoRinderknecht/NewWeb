# API 文档与项目实现一致性审查报告

## 审查范围与方法

- 审查基准：`docs/api-overview.md`
- 对比对象：`src/api/**/*.ts`、`src/api/queries/**/*.ts`、`src/utils/http/**/*.ts`、`src/types/**/*.ts`
- 审查维度：
  - API 接口定义完整性
  - 参数规范一致性
  - 返回数据格式准确性
  - 错误处理机制合理性
  - 接口调用流程正确性

> 说明：本次审查以“前端实际实现是否符合 API 文档”为核心，重点记录已经发现的显式不一致项，以及可能导致联调风险的设计偏差。

---

## 总体结论

项目的数据访问层整体结构较清晰，已形成如下统一模式：

- `src/api/*.ts` 负责底层接口路径封装；
- `src/api/queries/*.ts` 负责 Vue Query 查询/变更封装；
- `src/utils/http/index.ts` 负责统一响应解包、401 自动刷新、错误提示与重试。

但与 `docs/api-overview.md` 逐项比对后，仍存在多类不一致：

1. **文档已定义但前端实现缺失**：尤其是统计模块与部分脚本导出/推送接口。
2. **同一接口的参数传递方式不一致**：文档定义为 query 参数，前端却改成 body；或文档要求原始数组，前端包了一层对象。
3. **返回类型声明不一致**：文档返回 `Void`，前端却声明为对象；文档返回下载流时，前端以 `Blob` 处理，这本身可接受，但仍应在文档/类型层保持一致说明。
4. **调用流程与文档不完全吻合**：例如统计看板未透传 `teamId`、刷新 token 后未按文档更新新的 `refreshToken`。
5. **错误处理有统一机制，但与业务规范存在边界风险**：401 自动刷新流程较完善，但部分接口返回格式、失败重试与二进制响应处理仍存在潜在不一致风险。

---

## 发现的问题清单

## 一、接口定义完整性问题

### 1. 认证模块存在未文档化但已实现的接口：`/api/auth/redeem-code`

- **位置**：`src/api/auth.ts`
- **实现**：存在 `fetchRedeemPlatformCode(code)`，调用 `POST /api/auth/redeem-code`
- **文档情况**：`docs/api-overview.md` 中未检索到该接口定义
- **问题描述**：前端已依赖此接口，但 API 文档未收录，导致文档与实现不完整一致。
- **影响**：
  - 联调人员无法从文档获知接口存在；
  - 无法确认认证要求、参数约束、返回格式、错误码语义。
- **改进建议**：
  - 在 `auth` 模块补充该接口文档；
  - 明确其请求体、权限要求、成功/失败响应与业务语义；
  - 若该接口已废弃，应删除前端实现。

### 2. 统计模块文档有定义，但前端缺少 `/api/statistics/trends` 平台趋势接口实现

- **位置**：`docs/api-overview.md` 2416-2420；实现侧 `src/api/statistics.ts`
- **文档定义**：`GET /api/statistics/trends?eventType={type}`
- **实现情况**：仅实现了 `GET /api/statistics/teams/{teamId}/trends`
- **问题描述**：平台级趋势接口在文档中存在，但前端 API 封装中缺失。
- **影响**：平台管理员场景若需要该接口，将无法通过当前数据层直接调用。
- **改进建议**：
  - 若平台趋势接口仍有效，补充 `fetchGetPlatformTrends` 及对应 query hook；
  - 若后端已收敛为团队趋势接口，应同步修正文档。

### 3. 统计模块文档有定义，但前端缺少项目统计导出与分析部分接口对齐说明

- **位置**：`docs/api-overview.md` 2470-2559；实现侧 `src/api/statistics.ts`
- **问题描述**：前端额外实现了 `GET /api/statistics/projects/analysis` 与 `GET /api/statistics/users/activity-rank`，而文档统计模块主清单未见对应端点说明。
- **影响**：实现集合大于文档集合，接口资产台账不完整。
- **改进建议**：
  - 补充文档中遗漏的接口；
  - 或确认这些为实验/后台专用接口并隔离到单独文档。

### 4. 脚本模块文档定义了导出与推送接口，但前端实现缺失

- **位置**：`docs/api-overview.md` 823-842
- **文档定义**：
  - `GET /api/projects/{projectId}/episodes/export`
  - `GET /api/scripts/{scriptId}/extracted-assets/export`
  - `POST /api/projects/{projectId}/scripts/{scriptId}/push-to-art`
- **实现情况**：在 `src/api/script.ts` 中未发现对应封装。
- **问题描述**：文档中已承诺的能力未出现在前端数据访问层。
- **影响**：
  - 页面层若需要这些能力只能绕过统一 API 层临时实现；
  - 文档功能覆盖面与实际可用能力不一致。
- **改进建议**：
  - 补充底层 API 方法与对应 query/mutation hook；
  - 若功能尚未接入前端，应在审查说明或产品范围中标注“后端已提供，前端未接入”。

---

## 二、参数规范不一致问题

### 5. `join-by-code` 文档要求 query 参数，前端改为 JSON body

- **位置**：
  - 文档：`docs/api-overview.md` 408-413
  - 实现：`src/api/team.ts`
- **文档定义**：`POST /api/teams/member/join-by-code?code={code}`
- **前端实现**：`post('/api/teams/member/join-by-code', { code })`
- **问题描述**：参数承载位置不一致。
- **影响**：若后端仅按 query 读取，前端调用会失败；即使后端兼容 body，也与文档不一致。
- **改进建议**：
  - 优先统一为文档声明方式；
  - 若后端实际改为 body，请同步更新文档，明确请求体结构。

### 6. `leave team` 文档要求 query 参数，前端改为 JSON body

- **位置**：
  - 文档：`docs/api-overview.md` 435-440
  - 实现：`src/api/team.ts`
- **文档定义**：`POST /api/teams/member/leave?teamId={teamId}`
- **前端实现**：`post('/api/teams/member/leave', { teamId })`
- **问题描述**：参数位置与文档不一致。
- **改进建议**：与问题 5 相同，统一 query/body 规范，避免联调歧义。

### 7. 平台团队列表文档将 GET 参数写成“请求体”，表述不规范，前端按 query 调用

- **位置**：
  - 文档：`docs/api-overview.md` 449-454
  - 实现：`src/api/platform-admin.ts`
- **文档定义**：`GET /api/admin/teams`，但说明中写 `请求体`
- **前端实现**：`get('/api/admin/teams', params)`，即标准 query 参数
- **问题描述**：文档对 GET 方法的参数描述不符合 HTTP 语义，也与前端实现不一致。
- **影响**：影响调用方理解，增加错误传参概率。
- **改进建议**：将文档中的“请求体”统一改为“查询参数”。

### 8. `transfer ownership` 文档定义 query 参数，前端改为 body

- **位置**：
  - 文档：`docs/api-overview.md` 253-257
  - 实现：`src/api/team.ts`
- **文档定义**：`PUT /api/teams/{teamId}/owner?newOwnerId={newOwnerId}`
- **前端实现**：`put('/api/teams/${teamId}/owner', { newOwnerId })`
- **问题描述**：参数位置不一致。
- **改进建议**：统一文档与服务端约定，避免前后端各自理解不同。

### 9. 平台管理员强制转移所有权同样存在 query/body 不一致

- **位置**：
  - 文档：`docs/api-overview.md` 488-491
  - 实现：`src/api/platform-admin.ts`
- **文档定义**：`PUT /api/admin/teams/{teamId}/owner?newOwnerId={newOwnerId}`
- **前端实现**：`put('/api/admin/teams/${teamId}/owner', data)`
- **问题描述**：与问题 8 相同，是同类规范漂移。
- **改进建议**：统一管理类接口参数风格，建议在团队/平台管理接口层保持一致设计。

### 10. 团队成员状态更新文档定义 query 参数，前端改为 body

- **位置**：
  - 文档：`docs/api-overview.md` 272-276
  - 实现：`src/api/team.ts`
- **文档定义**：`PUT /api/teams/{teamId}/members/status?memberId={memberId}&status={0|1}`
- **前端实现**：`put('/api/teams/${teamId}/members/status', params)`
- **问题描述**：参数承载方式不一致。
- **改进建议**：统一到 query 或 body，并同步更新文档与接口测试用例。

### 11. 团队成员权限设置文档定义原始 `List<String>`，前端包装为对象 `{ permissionCodes }`

- **位置**：
  - 文档：`docs/api-overview.md` 297-302
  - 实现：`src/api/team.ts`
- **文档定义**：请求体为原始数组 `List<String>`
- **前端实现**：`put(..., { permissionCodes })`
- **问题描述**：请求体结构不一致。
- **影响**：若后端控制器直接接收数组，前端当前实现无法成功绑定。
- **改进建议**：
  - 核实后端 DTO 实际定义；
  - 若后端已改为对象，应修正文档；
  - 若后端仍接收数组，前端必须改为直接传 `string[]`。

### 12. 角色权限设置文档定义原始 `List<String>`，前端包装为对象 `{ permissionCodes }`

- **位置**：
  - 文档：`docs/api-overview.md` 336-341
  - 实现：`src/api/team.ts`
- **问题描述**：与问题 11 同类。
- **改进建议**：统一权限设置类接口的 body 结构。

### 13. 拒绝加入申请文档定义 query 参数 `reason`，前端改为 body `{ rejectReason }`

- **位置**：
  - 文档：`docs/api-overview.md` 381-385
  - 实现：`src/api/team.ts`
- **文档定义**：`PUT /api/teams/{teamId}/applications/{id}/reject?reason={reason}`
- **前端实现**：`put(..., reason ? { rejectReason: reason } : undefined)`
- **问题描述**：不仅参数位置不一致，字段名也从 `reason` 变成了 `rejectReason`。
- **影响**：这是高风险不一致，若后端仅遵循文档则必然失败。
- **改进建议**：立即核实后端签名并统一三者：URL、字段名、DTO。

### 14. 项目成员角色更新文档与前端一致，但项目/团队同类接口风格不统一

- **位置**：
  - 文档：`docs/api-overview.md` 640-645
  - 实现：`src/api/project.ts`
- **现状**：项目成员角色更新使用 query 参数，团队模块对应角色/状态更新大量使用 body。
- **问题描述**：虽然单接口未必错误，但跨模块风格显著不统一。
- **影响**：增加维护复杂度，也让文档规范缺乏可预测性。
- **改进建议**：制定统一规则：
  - 简单状态切换/单值更新统一用 query，或
  - 统一改为 JSON body，并在文档中保持一致。

### 15. 统计看板文档支持 `teamId`，前端 query hook 未透传

- **位置**：
  - 文档：`docs/api-overview.md` 2411-2414
  - 实现：`src/api/queries/statistics.ts`, `src/api/statistics.ts`
- **文档定义**：`GET /api/statistics/dashboard?teamId={teamId}`
- **前端实现**：`useStatsDashboard(teamId?)` 虽然接收了 `teamId`，但内部实际调用 `fetchGetDashboard()`，未传参。
- **问题描述**：hook 设计与文档意图不一致，属于实际调用流程遗漏。
- **影响**：不同团队上下文下可能始终拿到同一份默认看板数据。
- **改进建议**：
  - 将 `fetchGetDashboard` 改为支持可选 `teamId`；
  - 在 `useStatsDashboard` 中透传该参数；
  - 为团队切换场景补充测试。

---

## 三、返回数据格式不一致问题

### 16. 团队更新文档返回 `Result<Void>`，前端声明为返回 `TeamDetail`

- **位置**：
  - 文档：`docs/api-overview.md` 246-251
  - 实现：`src/api/team.ts`
- **文档定义**：更新团队返回 `Result<Void>`
- **前端实现**：`put<Api.Team.TeamDetail>(...)`
- **问题描述**：返回类型声明与文档不一致。
- **影响**：
  - 若后端实际返回空，前端类型将误导页面逻辑；
  - 若后端已返回详情，文档则过时。
- **改进建议**：统一文档与 TS 类型，避免“类型乐观化”。

### 17. 更新剧本文档返回 `Result<Void>`，前端声明为 `ScriptDetail`

- **位置**：
  - 文档：`docs/api-overview.md` 725-730
  - 实现：`src/api/script.ts`
- **问题描述**：与问题 16 相同。
- **改进建议**：核实后端真实返回值，统一文档与类型。

### 18. 更新分集文档返回 `Result<EpisodeVO>`，前端声明为 `EpisodeDetail`

- **位置**：
  - 文档：`docs/api-overview.md` 886-892
  - 实现：`src/api/script.ts`
- **问题描述**：VO 语义与 Detail 语义不一致，前端可能假设了更多字段。
- **改进建议**：
  - 若后端返回详细结构，文档应从 `EpisodeVO` 更新为 `EpisodeDetailVO`；
  - 若仅返回标准 VO，前端类型应收紧。

### 19. 平台团队更新文档返回 `Result<Void>`，前端声明为 `AdminTeamDetail`

- **位置**：
  - 文档：`docs/api-overview.md` 469-474
  - 实现：`src/api/platform-admin.ts`
- **问题描述**：更新类接口返回值定义不一致。
- **改进建议**：统一更新类接口的返回策略，不建议一部分文档写 Void、一部分前端依赖详情对象。

### 20. 计费切换接口文档返回 `Result<Void>`，前端声明为 `BillingItem`

- **位置**：
  - 文档：`docs/api-overview.md` 2697-2701
  - 实现：`src/api/billing.ts`
- **问题描述**：切换状态类接口一般更适合 `Void` 或最小必要字段，前端类型与文档不符。
- **改进建议**：若前端不依赖响应体，建议改为 `void`；若确有返回对象，更新文档。

### 21. 统计自定义报表文档返回 `Result<Map<String,Object>>`，前端按 `Blob` 下载处理

- **位置**：
  - 文档：`docs/api-overview.md` 2490-2495
  - 实现：`src/api/statistics.ts`
- **文档定义**：返回普通 JSON 对象
- **前端实现**：`post<Blob>(..., { responseType: 'blob' })`
- **问题描述**：返回介质完全不一致，一个是 JSON，一个是二进制下载。
- **影响**：这是高风险不一致，几乎可以判定文档或实现至少一方错误。
- **改进建议**：
  - 若接口用于文件导出，文档应改为 `ResponseEntity<byte[]>`；
  - 若接口用于创建报表任务，则前端不应按 blob 处理。

### 22. 通知导出、统计导出等文件接口在统一响应结构上的兼容策略未文档化

- **位置**：`src/utils/http/index.ts`, `src/api/statistics.ts`, `src/api/review.ts`, `src/api/notification.ts`
- **问题描述**：统一响应格式文档声明所有接口返回 `code/message/data`，但若为 `blob`/文件流，HTTP 层会直接返回二进制，不再遵循统一 `Result<T>` 包装。
- **影响**：统一响应规范与文件下载接口之间存在隐式例外，但文档未做总则说明。
- **改进建议**：
  - 在 API 规范总则中增加“文件下载接口例外”说明；
  - 为所有下载接口统一标注 `ResponseEntity<byte[]> / blob` 行为。

---

## 四、错误处理机制与调用流程问题

### 23. Token 刷新流程未按文档更新新的 `refreshToken`

- **位置**：`src/utils/http/index.ts`
- **文档基准**：`docs/api-overview.md` 166-178，说明 `/api/auth/refresh-token` 返回新的 AccessToken + RefreshToken 对
- **前端实现**：`doRefresh(refreshToken)` 仅取 `payload.data.token`，随后 `userStore.setToken(newToken, refreshToken)` 保留旧 refresh token。
- **问题描述**：实现没有消费后端返回的新 `refreshToken`。
- **影响**：
  - 如果后端执行 refresh token 轮换，前端会继续保存旧 token；
  - 可能导致下一次刷新失败，形成隐蔽登录状态问题。
- **改进建议**：
  - 同时读取并更新 `payload.data.refreshToken`；
  - 若后端确实返回 `null` 或不轮换，文档需明确；
  - 增加刷新链路自动化测试。

### 24. 401 自动刷新策略合理，但文档未体现“自动重试请求”的前端行为约束

- **位置**：`src/utils/http/index.ts`
- **现状**：前端在遇到 401 时会自动调用 `/api/auth/refresh-token`，并重放挂起请求。
- **问题描述**：这属于关键调用流程行为，但 API 文档仅描述了刷新接口本身，未描述前端实际依赖的交互顺序和约束条件。
- **影响**：对联调、测试和后端排障不友好。
- **改进建议**：
  - 在认证章节补充推荐调用流程：AccessToken 过期 → refresh-token → 重试原请求；
  - 说明刷新失败后的登出策略与并发刷新约束。

### 25. 统一响应提取同时兼容 `message` 与 `msg`，说明后端返回格式存在漂移

- **位置**：`src/types/common/response.ts`, `src/utils/http/index.ts`
- **现状**：前端 `BaseResponse` 定义中既有 `message` 又兼容 `msg`。
- **问题描述**：文档统一响应格式只声明了 `message`，但实现明显在兼容另一套字段。
- **影响**：说明实际后端响应格式可能不稳定，或存在历史接口未完全统一。
- **改进建议**：
  - 推动后端统一为单一字段；
  - 在整改前，文档应注明兼容期策略，避免前后理解偏差。

### 26. 自动重试机制对文件下载与非幂等接口的适用范围未显式限定

- **位置**：`src/utils/http/index.ts`
- **现状**：HTTP 层对失败请求提供最多一次自动重试。
- **问题描述**：虽然当前 `shouldRetry` 只针对超时/5xx，但文档中没有说明哪些业务接口允许客户端自动重试，尤其是报表生成、审核提交、创建资源类接口。
- **风险**：若后端幂等性不足，重试可能造成重复副作用。
- **改进建议**：
  - 为具副作用的接口定义幂等保证或幂等键；
  - 在接口文档中标注“是否支持安全重试”；
  - 前端可考虑仅对 GET 或明确幂等接口启用自动重试。

---

## 五、文档自身规范性问题

### 27. 统计模块与管理后台模块存在命名/分组重叠，容易误导前端选错接口

- **位置**：`docs/api-overview.md` 2407-2707
- **问题描述**：
  - 统计模块中既有平台级接口，又有团队/项目级接口；
  - 管理后台中又存在另一套 `/api/admin/*` 管理统计与配置接口；
  - 文档虽有分组，但前端实现中同时存在 `src/api/statistics.ts`、`src/api/platform-admin.ts`、`src/api/admin/*` 多套封装，边界感较弱。
- **影响**：容易出现“文档有接口，但实现接到了另一套管理接口”的情况。
- **改进建议**：
  - 文档中增加“面向用户侧 / 面向平台管理侧”标签；
  - 前端目录结构也可进一步按业务域聚合，而不是并列多套相近命名。

### 28. 部分 GET 接口将参数说明写成“请求体”，降低文档可信度

- **位置**：典型如 `GET /api/admin/teams`
- **问题描述**：这是文档表述层面问题，但会直接影响前端/测试/SDK 调用方式。
- **改进建议**：统一扫描全量文档，将 GET 方法中的参数描述标准化为“查询参数”。

---

## 建议的整改优先级

### P0（应优先处理）

1. 修正 `refresh-token` 流程，确保刷新后同步保存新的 `refreshToken`。
2. 核实并统一以下高风险参数不一致接口：
   - `/api/teams/member/join-by-code`
   - `/api/teams/member/leave`
   - `/api/teams/{teamId}/applications/{id}/reject`
   - `/api/teams/{teamId}/members/{memberId}/permissions`
   - `/api/teams/{teamId}/roles/{roleId}/permissions`
3. 修正统计自定义报表 `reports/custom` 的返回格式文档或前端实现。
4. 修正 `useStatsDashboard` 未传 `teamId` 的实际调用缺陷。

### P1（建议尽快处理）

1. 统一更新类接口返回值定义：`Void` vs 详情对象。
2. 补齐脚本导出/推送接口的前端封装，或明确标注为未接入功能。
3. 补全文档中缺失但前端已实现的接口，如 `/api/auth/redeem-code`。
4. 补充统计模块缺失的文档/实现映射，尤其是 `projects/analysis`、`users/activity-rank`。

### P2（规范性优化）

1. 统一 query/body 的设计风格与命名规则。
2. 在 API 总则中增加文件下载接口例外说明。
3. 明确消息字段 `message/msg` 的兼容策略与淘汰计划。
4. 在文档中补充推荐认证刷新时序与重试语义。

---

## 审查中使用到的关键定位文件

- `docs/api-overview.md`
- `src/api/auth.ts`
- `src/api/team.ts`
- `src/api/project.ts`
- `src/api/script.ts`
- `src/api/statistics.ts`
- `src/api/billing.ts`
- `src/api/platform-admin.ts`
- `src/api/admin/team-manage.ts`
- `src/api/admin/dashboard.ts`
- `src/api/admin/billing-config.ts`
- `src/api/queries/statistics.ts`
- `src/utils/http/index.ts`
- `src/types/common/response.ts`
- `src/types/api/api.d.ts`

---

## 结论

本项目前端 API 层已经具备较好的抽象与统一错误处理能力，但与 `docs/api-overview.md` 之间存在“文档更新滞后 + 参数风格漂移 + 返回类型乐观化 + 调用流程细节遗漏”四类核心问题。其中若干项已达到会直接影响联调成功率的程度，尤其是：

- query/body 承载方式不一致；
- 权限设置接口 body 结构不一致；
- refresh token 轮换未落地；
- 统计看板 `teamId` 未透传；
- 自定义报表返回格式前后矛盾。

建议先完成 P0 项整改，再对全量文档与 `src/api` 进行一次自动化契约扫描，建立“文档路径 / 参数 / 返回 / 权限”与前端实现之间的可持续一致性校验机制。
