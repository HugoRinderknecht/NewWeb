# 项目 API 实现与文档一致性审查报告

> **审查依据**：[`docs/api-overview.md`](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/docs/api-overview.md)（AstraCloud-Server API 文档，350+ 端点）
> **审查范围**：`src/api/`、`src/utils/http/`、`src/api/adapter/` 等核心数据接入层
> **审查维度**：URL 路径、HTTP 方法、参数位置（path/query/body）、请求/响应字段命名、统一响应结构、错误码处理、Token 刷新、缺失/多余端点

---

## 一、问题严重程度分级

| 级别 | 含义 | 数量 |
|------|------|------|
| 🔴 P0 | 接口完全无法工作（404/400/参数缺失） | 12 |
| 🟠 P1 | 功能可工作但行为偏离文档（数据丢失/Token 不轮换/字段错位） | 18 |
| 🟡 P2 | 类型语义/命名/可维护性问题 | 14 |
| 🟢 P3 | 信息性/确认类问题（文档与代码均需对齐） | 8 |

---

## 二、HTTP 适配层与统一响应/错误处理（基础架构层）

### 🔴 H1. 响应体字段命名 `msg` 与文档规范 `message` 不一致
- **位置**：[error.ts:28-35](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/error.ts#L28-L35)、[error.ts:128](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/error.ts#L128)、[adapter/types.ts:20-24](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/adapter/types.ts#L20-L24)
- **文档**：`{"code":200,"message":"success","data":{},"timestamp":...}`
- **实现**：`ErrorResponse` 只声明 `msg`；`ApiResponse<T>` 也是 `{code, msg, data}`，且缺失 `timestamp`
- **建议**：统一使用 `message`（保留 `msg?` 作兼容），合并到 `BaseResponse<T>` 并补充 `timestamp?: number`

### 🟠 H2. Token 刷新成功后未持久化新的 RefreshToken
- **位置**：[utils/http/index.ts:299-318](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/index.ts#L299-L318)
- **文档（§1.11）**：`POST /api/auth/refresh-token` 返回**新 AccessToken + 新 RefreshToken 对**
- **实现**：仅读取 `payload.data.token`，丢弃响应中的新 `refreshToken`，导致 7 天后强制重新登录
- **建议**：`userStore.setToken(data.token, data.refreshToken ?? refreshToken)`

### 🟠 H3. 业务错误码 7xxx（视频）/8xxx（权限）未覆盖
- **位置**：[error.ts:303-320](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/error.ts#L303-L320)、整个 [status.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/status.ts) `BusinessCode` 枚举
- **文档**：错误码范围 1xxx-9xxx 共 9 大类
- **实现**：分支只覆盖 1xxx-6xxx 和部分 9xxx 区段；7xxx、8xxx、9035-9400、9430+ 均落到"未知错误"
- **建议**：补齐 `VIDEO_*` 与 `PERMISSION_*` 枚举，并扩展 9xxx 兜底范围为 `[9000, 9999]`

### 🟠 H4. HTTP 状态码与业务错误码混用同一 enum
- **位置**：[status.ts:1-16](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/status.ts#L1-L16)、[utils/http/index.ts:197-203](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/index.ts#L197-L203)
- **问题**：`ApiStatus.unauthorized=401` 同时承担 HTTP 状态码与业务码语义；业务错误命中后调用 `getErrorMessage(status)` 返回的是 HTTP 文案
- **建议**：业务错误改用 `getBusinessErrorMessage(code)`，HTTP 与业务码用两套独立枚举

### 🟠 H5. 错误处理未优先读取后端 `message`
- **位置**：[error.ts:127-148](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/error.ts#L127-L148)
- **问题**：`handleError` 仅读 `data?.msg`，最终被 `getErrorMessage(statusCode)` 静态映射覆盖
- **建议**：优先级改为 "后端 message > 本地状态码默认文案 > error.message"

### 🟠 H6. 分页响应字段定义为 `current/size`，文档为 `page/pageSize`
- **位置**：[adapter/types.ts:13-18](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/adapter/types.ts#L13-L18)
- **文档**：`{"total":100,"page":1,"pageSize":10,"records":[...]}`
- **实现**：`PaginatedResponse<T>` 为 `{records, total, current, size}`
- **建议**：改为 `{records, total, page, pageSize}`

### 🔴 H7. 二进制响应（Blob/ArrayBuffer）会被响应拦截器误判失败
- **位置**：[utils/http/index.ts:194-204](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/index.ts#L194-L204)
- **问题**：文档中所有 `ResponseEntity<byte[]>`（导出 CSV/XLSX/ZIP）的接口都会因 `response.data.code !== 200` 抛错
- **建议**：拦截器开头判断 `responseType === 'blob'/'arraybuffer'` 或非 JSON `Content-Type` 时直接放行

### 🟠 H8. HTTP 错误时丢弃后端业务 `code`
- **位置**：[error.ts:139-147](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/error.ts#L139-L147)
- **问题**：`HttpError.code` 设为 HTTP 状态码，后端业务 code 仅作为 `data` 附带
- **建议**：当 `response.data.code` 存在时优先作为 `HttpError.code`

### 🟡 H9. 适配层未支持 `withCredentials` 单次覆盖（Cookie 认证场景）
- **位置**：[adapter/types.ts:1-11](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/adapter/types.ts#L1-L11)、[http-adapter.ts:5-17](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/adapter/http-adapter.ts#L5-L17)
- **文档**：管理后台采用 `astracloud_token` Cookie 认证
- **建议**：`RequestConfig` 新增可选 `withCredentials?: boolean` 并透传

### 🟡 H10. 401 重试队列 `pendingRetryRequests` 是死代码
- **位置**：[utils/http/index.ts:52-58](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/index.ts#L52-L58)、[226-256](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/index.ts#L226-L256)
- **问题**：队列定义但从未入队，依赖单例 Promise 的 then 链
- **建议**：删除死代码或真正使用队列驱动

### 🟢 H11. 刷新请求未跳过 Authorization 头注入
- **位置**：[utils/http/index.ts:299-311](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/utils/http/index.ts#L299-L311)
- **文档**：`/api/auth/refresh-token` 标注"认证：无"
- **建议**：识别 `_isRefreshRequest` 时跳过 Authorization 注入

---

## 三、认证模块（auth）

### 🔴 A1. 存在文档未定义的 `/api/auth/redeem-code` 端点
- **位置**：[api/auth.ts:72-76](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/auth.ts#L72-L76)
- **建议**：与后端确认归属；若属其他模块需迁移，若无应删除

### 🟠 A2. `/api/auth/refresh` 返回类型未声明 `refreshToken: null`
- **位置**：[api/auth.ts:19-21](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/auth.ts#L19-L21)、[types/api/api.d.ts:93-103](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/types/api/api.d.ts#L93-L103)
- **文档（§1.10）**：返回 LoginVO 但 `refreshToken` 为 null
- **建议**：单独定义返回类型 `refreshToken: string | null`

### 🟠 A3. `useUpdateProfile` 未持久化用户名变更后的新 Token
- **位置**：[api/queries/auth.ts:59-67](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/auth.ts#L59-L67)
- **文档（§1.6）**：用户名变更时重新签发 Token
- **建议**：onSuccess 中检测响应 `token`/`refreshToken` 字段并 `userStore.setToken`

### 🟡 A4. `fetchRefresh` 函数无注释，与 `fetchRefreshToken` 易混用
- **位置**：[api/auth.ts:19-21](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/auth.ts#L19-L21)
- **建议**：补 JSDoc 说明使用条件，或删除（当前未被业务调用）

### 🟡 A5. `CaptchaResponse` 含文档未定义字段 `captchaKey?/captchaImage?`
- **位置**：[types/api/api.d.ts:136-141](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/types/api/api.d.ts#L136-L141)
- **建议**：迁移后移除旧字段

### 🟡 A6. `UserInfo` 含文档未定义字段 `buttons/userName/userId`
- **位置**：[types/api/api.d.ts:144-157](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/types/api/api.d.ts#L144-L157)
- **建议**：定位消费端，统一到文档定义的 `id/username` 后移除

### 🟢 A7. 邮箱验证码 60s 防重 / 权限缓存失效未在前端实现
- **位置**：[api/queries/auth.ts:38-56](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/auth.ts#L38-L56)
- **建议**：发送按钮加 60s 倒计时；角色切换 mutation 后 `invalidateQueries(authKeys.permissions())`

---

## 四、团队模块（team）

### 🔴 T1. 转移所有权 `newOwnerId` 放在 body 而非 query
- **位置**：[api/team.ts:74-76](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L74-L76)
- **文档**：`PUT /api/teams/{teamId}/owner?newOwnerId={id}`
- **建议**：`put(url, undefined, { params: { newOwnerId } })`

### 🔴 T2. 更新成员状态 `memberId/status` 放在 body 而非 query
- **位置**：[api/team.ts:50-52](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L50-L52)
- **文档**：`PUT /api/teams/{teamId}/members/status?memberId=&status=`
- **建议**：用 `{ params: ... }` 形式

### 🔴 T3. 设置成员权限 body 应是裸数组，不应包装为 `{permissionCodes}`
- **位置**：[api/team.ts:64-72](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L64-L72)
- **文档**：请求体为 `List<String>`
- **建议**：`put(url, permissionCodes)` 直传数组

### 🔴 T4. 设置角色权限 body 同 T3 的包装问题
- **位置**：[api/team.ts:104-108](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L104-L108)
- **建议**：同 T3

### 🔴 T5. 通过邀请码加入 `code` 放在 body 而非 query
- **位置**：[api/team.ts:23-25](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L23-L25)
- **文档**：`POST /api/teams/member/join-by-code?code={code}`
- **建议**：用 `{ params: { code } }` 形式

### 🔴 T6. 离开团队 `teamId` 放在 body 而非 query
- **位置**：[api/team.ts:27-29](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L27-L29)
- **文档**：`POST /api/teams/member/leave?teamId={teamId}`
- **建议**：用 `{ params: { teamId } }` 形式

### 🔴 T7. 拒绝申请 `reason` 字段名错误且位置错误
- **位置**：[api/team.ts:149-154](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/team.ts#L149-L154)
- **文档**：`PUT /api/teams/{teamId}/applications/{id}/reject?reason=`
- **实现**：把 `{ rejectReason: reason }` 放进 body
- **建议**：字段名改 `reason`，置于 query

---

## 五、项目模块（project）

### 🔴 P1. 更新项目状态 `status` 放在 body 而非 query
- **位置**：[api/project.ts:38-40](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/project.ts#L38-L40)
- **文档**：`PUT /api/projects/{projectId}/status?status={0|1|2|3}`
- **建议**：用 `{ params: { status } }` 形式

### 🟠 P2. 项目封面上传缺少 `url` 模式支持
- **位置**：[api/project.ts:49-56](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/project.ts#L49-L56)
- **文档**：请求参数 `file`（MultipartFile）或 `url`（String）二选一
- **建议**：扩展签名为 `(projectId, payload: { file?: File; url?: string })`

### 🟡 P3. 创建项目 payload 可能仍含 `teamId`
- **位置**：[api/project.ts:14-16](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/project.ts#L14-L16)
- **文档**：teamId 自动从上下文获取
- **建议**：检查 `CreateProjectParams` 类型并去除 `teamId`

### 🟡 P4. 更新成员角色手动拼 URL，风格不统一
- **位置**：[api/project.ts:69-75](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/project.ts#L69-L75)
- **建议**：统一改为 `{ params: ... }` 形式

### 🟢 P5. 项目列表/复制接口的 query/body 字段需文档确认
- **位置**：[api/project.ts:3-8](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/project.ts#L3-L8)、[42-47](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/project.ts#L42-L47)

---

## 六、剧本模块（script）

### 🔴 S1. 剧本审核 submit/withdraw 缺失 `note`/`reason` query 参数
- **位置**：[api/script.ts:47-54](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L47-L54)、[queries/script.ts:152-181](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/script.ts#L152-L181)
- **文档**：`POST /api/scripts/{id}/submit-review?note=`、`/withdraw-review?reason=`
- **建议**：增加参数并以 query 形式发送

### 🔴 S2. style-config GET 路径多了 `projects/{projectId}` 前缀
- **位置**：[api/script.ts:197-201](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L197-L201)
- **文档**：`GET /api/scripts/{scriptId}/style-config`（无 projects 前缀）
- **建议**：移除前缀；POST 路径正确无需改

### 🔴 S3. 参考图分析路径错位
- **位置**：[api/script.ts:204-220](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L204-L220)
- **文档**：
  - `GET/POST /api/projects/{projectId}/ref-analysis`（项目级）
  - `GET /api/scripts/{scriptId}/ref-analysis`（剧本级）
- **实现**：全部走错误的混合路径 `/api/projects/{id}/scripts/{id}/ref-analysis`
- **建议**：拆分两组接口

### 🔴 S4. voice-prompts GET 路径多了前缀
- **位置**：[api/script.ts:223-240](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L223-L240)
- **文档**：`GET /api/scripts/{scriptId}/voice-prompts`
- **建议**：移除 projects 前缀

### 🔴 S5. asset-prompts GET 路径多了前缀
- **位置**：[api/script.ts:243-258](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L243-L258)
- **文档**：`GET /api/scripts/{scriptId}/asset-prompts`
- **建议**：移除 projects 前缀

### 🔴 S6. asset-images GET 路径多了前缀
- **位置**：[api/script.ts:262-290](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L262-L290)
- **文档**：`GET /api/scripts/{scriptId}/asset-images`
- **建议**：移除 projects 前缀

### 🟠 S7. 缺失多个文档列出的接口
- **位置**：[api/script.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts)
- **缺失**：
  - `GET /api/projects/{projectId}/episodes/export`
  - `GET /api/scripts/{scriptId}/extracted-assets/export`
  - `POST /api/projects/{projectId}/scripts/{scriptId}/push-to-art`
  - `PATCH /api/projects/{projectId}/episodes/{episodeId}/child-of`

### 🟢 S8. 多个生成端点文档未列出，需确认
- **位置**：[api/script.ts:223-290](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L223-L290)
- **路径**：`/voice-prompts`、`/assets/prompts`、`/assets/images/generate`、`/assets/images/review` 等 POST 操作

### 🟢 S9. `useVideoPrompts` 多余 `projectId` 参数
- **位置**：[queries/script.ts:690-705](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/script.ts#L690-L705)
- **文档**：`GET /api/episodes/{episodeId}/video-prompts` 与 projectId 无关

### 🟢 S10. `fetchGetTeamScripts` 端点文档无定义
- **位置**：[api/script.ts:6-14](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script.ts#L6-L14)

---

## 七、创意资产模块（script-asset）

### 🔴 SA1. 详情/更新/删除/上传图片均缺失必填 `projectId` query
- **位置**：[api/script-asset.ts:39-66](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script-asset.ts#L39-L66)、[queries/script-asset.ts:33-117](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/script-asset.ts#L33-L117)
- **文档**：所有这些接口路径均带 `?projectId={projectId}` 必填 query
- **建议**：所有方法增加 `projectId: string` 入参并以 query 形式传递

### 🟡 SA2. 批量创建 body 多一层 `assets` 包装
- **位置**：[api/script-asset.ts:28-36](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/script-asset.ts#L28-L36)
- **建议**：核对后端实际接收结构

---

## 八、分镜模块（storyboard）

### 🔴 SB1. submit-review 缺失 `note` query
- **位置**：[api/storyboard.ts:48-50](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/storyboard.ts#L48-L50)、[queries/storyboard.ts:140-159](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/storyboard.ts#L140-L159)
- **文档**：`POST /api/storyboards/{id}/submit-review?note=`

### 🔴 SB2. withdraw-review 缺失 `reason` query
- **位置**：[api/storyboard.ts:59-61](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/storyboard.ts#L59-L61)、[queries/storyboard.ts:178-197](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/queries/storyboard.ts#L178-L197)
- **文档**：`POST /api/storyboards/{id}/withdraw-review?reason=`

### 🟠 SB3. 缺失 `GET /api/projects/{projectId}/storyboard-boards` 端点
- **位置**：[api/storyboard.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/storyboard.ts)

### 🟢 SB4. 批量删除 body 含文档未列出的 `hardDelete`
- **位置**：[api/storyboard.ts:41-46](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/storyboard.ts#L41-L46)

### 🟢 SB5. decompose/rebuild/scripts/storyboards/scenes CRUD 等端点文档未列
- **位置**：[api/storyboard.ts:139-178](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/storyboard.ts#L139-L178)
- **建议**：与后端核对，更新文档或删除前端实现

---

## 九、统计模块（statistics）

### 🔴 ST1. `fetchGetDashboard` 缺失 `teamId` query
- **位置**：[api/statistics.ts:3-5](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/statistics.ts#L3-L5)
- **文档**：`GET /api/statistics/dashboard?teamId={teamId}`
- **建议**：`fetchGetDashboard(teamId?: string)`

### 🟠 ST2. 缺失顶层 `GET /api/statistics/trends` 端点
- **位置**：[api/statistics.ts:11-19](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/statistics.ts#L11-L19)
- **建议**：新增 `fetchGetPlatformTrends`，将现有重命名为 `fetchGetTeamTrends`

### 🟢 ST3. 多余端点 `/api/statistics/projects/analysis`
- **位置**：[api/statistics.ts:140-144](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/statistics.ts#L140-L144)
- **文档无此端点**

### 🟢 ST4. 多余端点 `/api/statistics/users/activity-rank`
- **位置**：[api/statistics.ts:146-149](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/statistics.ts#L146-L149)

---

## 十、审核模块（review）

### 🔴 R1. `fetchDispatchReview` 缺失必填 `target` query
- **位置**：[api/review.ts:45-47](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/review.ts#L45-L47)
- **文档**：`POST /api/review/{id}/dispatch?target={art|video|edit|audio}`
- **建议**：增加 `target` 参数并加入联合类型约束

### 🟠 R2. `fetchGetReviewStatistics` 缺失 `startDate/endDate` query
- **位置**：[api/review.ts:66-70](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/review.ts#L66-L70)
- **文档**：`GET /api/review/projects/{projectId}/statistics?startDate=&endDate=`

### 🟠 R3. `fetchExportReviewRecords` 返回类型与文档不符
- **位置**：[api/review.ts:72-76](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/review.ts#L72-L76)
- **文档**：返回 `Result<String>`（文件 URL 字符串），参数为 query
- **实现**：声明 `Blob`，参数作 body 发送
- **建议**：改为 `post<string>(url, undefined, { params })`

### 🟡 R4. 响应类型 `ReviewStatusVO`/`ReviewTask` 与文档 `ReviewDetailVO` 命名不符
- **位置**：[api/review.ts:17-19](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/review.ts#L17-L19)、[49-53](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/review.ts#L49-L53)

### 🟡 R5. `reviewType` 缺少枚举类型约束
- **位置**：[api/review.ts:49-53](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/review.ts#L49-L53)
- **建议**：使用联合类型 `'storyboard'|'video'|'first_frame'|'script'|'image'|'prompt'|'asset'`

---

## 十一、通知模块（notification）

### 🔴 N1. `batch-delete` HTTP 方法错误且 body 形态错误
- **位置**：[api/notification.ts:38-40](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/notification.ts#L38-L40)
- **文档**：`POST /api/notifications/batch-delete`，body 为裸数组 `List<String>`
- **实现**：使用 `del()`（DELETE 方法），且 `{ids}` 被当成 query 而非 body
- **建议**：`post<void>('/api/notifications/batch-delete', ids)`

### 🔴 N2. `batch-read` body 形态错误
- **位置**：[api/notification.ts:30-32](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/notification.ts#L30-L32)
- **文档**：body 为裸数组
- **实现**：包装为 `{ids:[...]}`
- **建议**：`post<void>('/api/notifications/batch-read', ids)`

### 🟠 N3. `fetchExportNotifications` 未接受 query 参数
- **位置**：[api/notification.ts:64-68](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/notification.ts#L64-L68)
- **文档**：`GET /api/notifications/export` 接受 `NotificationExportRequest`
- **建议**：增加 `params?: Api.Notification.ExportParams`

### 🟠 N4. 缺失 `POST /api/notifications` 创建通知端点
- **位置**：[api/notification.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/notification.ts)

### 🟡 N5. `fetchGetWsToken` 返回类型为 `string`，应为 `{token, expiresIn}` 对象
- **位置**：[api/notification.ts:103-105](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/notification.ts#L103-L105)
- **文档**：返回 `Map<String,String>`，结构 `{token, expiresIn}`

---

## 十二、积分模块（token / points）

### 🟠 PT1. 缺失 `PUT /api/credits/alert-threshold` 端点
- **位置**：[api/points.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/points.ts)

### 🟠 PT2. 缺失 `GET /api/credits/transactions/export` 端点
- **位置**：[api/points.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/points.ts)

### 🟡 PT3. 文件命名 `points.ts` 与文档/后端命名 `credits`/`token` 不对齐
- **位置**：[api/points.ts](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/points.ts)
- **建议**：可重命名为 `credits.ts`（属可选优化）

### 🟢 PT4. 分页参数命名需核对 `CommonSearchParams`
- **位置**：[api/points.ts:7-12](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/src/api/points.ts#L7-L12)
- **文档**：`?page={1}&pageSize={20}`
- **建议**：确认 `CommonSearchParams` 字段命名是 `page+pageSize` 非 `current+size`

---

## 十三、修复优先级建议

### 🔴 P0 必须立即修复（接口不可用）
1. **H1**：统一响应字段 `message`
2. **H7**：Blob/二进制响应被拦截器误判
3. **T1-T7**：team 模块 7 处 query/body 位置错误
4. **P1**：project 状态更新 query/body 错位
5. **S1-S6**：script 模块路径错误与 query 缺失
6. **SA1**：script-asset 模块 4 处缺失 `projectId`
7. **SB1-SB2**：storyboard submit/withdraw 缺失 query
8. **ST1**：statistics dashboard 缺失 `teamId`
9. **R1**：review dispatch 缺失 `target`
10. **N1-N2**：notification batch 操作方法与 body 错误
11. **A1**：auth 模块未定义的 `/redeem-code`

### 🟠 P1 重要修复（行为偏离文档）
- **H2-H6, H8**：HTTP 基础设施层错误码/Token 刷新/分页字段/`message` 读取
- **A2-A3**：auth Token 处理
- **P2**：项目封面缺 url 模式
- **S7**：缺失导出/推送美术等端点
- **SB3**：缺失 storyboard-boards
- **ST2, R2-R3, N3-N4, PT1-PT2**：缺失端点或参数

### 🟡 P2 改进类（类型/语义/命名）
- **H9-H11, A4-A6, P3-P4, SA2, R4-R5, N5, PT3**：类型一致性、JSDoc 注释、命名规范

### 🟢 P3 确认类（需与后端/文档沟通确认）
- **A7, S8-S10, ST3-ST4, SB4-SB5, P5, PT4**：可能的文档遗漏或前端遗留代码

---

## 十四、按问题数量统计

| 模块 | P0 | P1 | P2 | P3 | 合计 |
|------|:--:|:--:|:--:|:--:|:--:|
| HTTP 基础设施 | 2 | 6 | 3 | 0 | 11 |
| 认证 auth | 1 | 2 | 3 | 1 | 7 |
| 团队 team | 7 | 0 | 0 | 0 | 7 |
| 项目 project | 1 | 1 | 2 | 1 | 5 |
| 剧本 script | 6 | 1 | 0 | 3 | 10 |
| 创意资产 script-asset | 1 | 0 | 1 | 0 | 2 |
| 分镜 storyboard | 2 | 1 | 0 | 2 | 5 |
| 统计 statistics | 1 | 1 | 0 | 2 | 4 |
| 审核 review | 1 | 2 | 2 | 0 | 5 |
| 通知 notification | 2 | 2 | 1 | 0 | 5 |
| 积分 token | 0 | 2 | 1 | 1 | 4 |
| **合计** | **24** | **18** | **13** | **10** | **65** |

---

## 十五、整体改进建议

1. **建立 API 一致性 CI 检查**：基于 `docs/api-overview.md` 或 OpenAPI Schema，编写脚本对 `src/api/**` 中的 URL/方法/参数位置做静态校验，每次 PR 自动比对。
2. **抽象统一参数传递层**：当前 `getApiAdapter().post/put/del` 的 query/body 语义易混淆。建议适配层为每个方法提供清晰的 `{ data?, params?, headers? }` 配置对象签名，减少误用。
3. **响应类型对齐**：将 `ApiResponse<T>`、`PaginatedResponse<T>`、`BaseResponse<T>` 三套定义合并为单一权威类型，字段命名与后端 `Result/PageResult` 完全一致。
4. **错误码完整性**：在 `BusinessCode` 中按文档 1xxx-9xxx 分类完整建模，并补齐 7xxx、8xxx；对全部业务码生成统一的国际化文案表。
5. **Token 全链路修复**：补全刷新 Token 的轮换持久化、修改 profile 后的新 Token 写回、Cookie 认证场景下的 `withCredentials` 支持。
6. **缺失端点补齐**：根据本报告"缺失端点"清单（共约 11 个），评估业务优先级并按模块补齐封装。
7. **文档反向同步**：本报告标记的 P3 类问题中，部分是代码中存在但文档未列出（如 decompose/rebuild/storyboard-boards 等），需推动后端/文档同步更新，以避免后续审查时再次出现噪声。

---

> **报告生成时间**：2026-06-07
> **审查方法**：文档静态对比 + 多 Agent 并行交叉验证
> **覆盖文件数**：22 个核心 API 与适配层文件
