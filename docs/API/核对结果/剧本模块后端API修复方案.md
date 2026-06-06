# 剧本模块后端 API 修复方案

## 一、问题诊断

### 现象

前端调用 `GET /api/projects/{projectId}/scripts/{scriptId}/episodes` 时，已认证用户返回 **404 Not Found**，但该剧本已经过拆解，分集数据已存在。

### 验证结果

| 测试方式           | 请求 URL                                       | HTTP 状态码 | 响应体                                     |
| -------------- | -------------------------------------------- | -------- | --------------------------------------- |
| 无 token 请求     | `GET /api/projects/.../scripts/.../episodes` | 401      | `{"code":401,"message":"未认证，请登录"}`      |
| 无效 token 请求    | 同上                                           | 401      | `{"code":1005,"message":"Token无效或已过期"}` |
| 浏览器带有效 token   | 同上                                           | **404**  | `{"code":404,"message":"请求的资源不存在"}`     |
| 无 token 请求其他端点 | `GET /api/scripts/.../character-profiles` 等  | 401      | 路由均已注册                                  |

### 结论

- 后端路由已注册（无 token 时返回 401 而非 404）
- 带 token 返回 404 是**后端业务逻辑问题**，非路由缺失
- 前端请求路径与 API 文档（OpenAPI spec）完全一致

***

## 二、需修复的端点清单

以下端点在"数据不存在"时应返回 **200 + 空列表/null**，而非 **404**：

| # | 端点                                                      | HTTP 方法 | 当前行为      | 期望行为                  | 影响的前端页面   |
| - | ------------------------------------------------------- | ------- | --------- | --------------------- | --------- |
| 1 | `/api/projects/{projectId}/scripts/{scriptId}/episodes` | GET     | 无数据返回 404 | 返回 200 + `data: []`   | 剧本拆解      |
| 2 | `/api/scripts/{scriptId}/character-profiles`            | GET     | 无数据返回 404 | 返回 200 + `data: null` | 人物小传      |
| 3 | `/api/scripts/{scriptId}/style-config`                  | GET     | 无数据返回 404 | 返回 200 + `data: null` | 风格配置      |
| 4 | `/api/scripts/{scriptId}/extracted-assets`              | GET     | 无数据返回 404 | 返回 200 + `data: null` | 资产提取      |
| 5 | `/api/scripts/{scriptId}/voice-prompts`                 | GET     | 无数据返回 404 | 返回 200 + `data: null` | 音色提示词     |
| 6 | `/api/scripts/{scriptId}/asset-prompts`                 | GET     | 无数据返回 404 | 返回 200 + `data: null` | 资产提示词     |
| 7 | `/api/scripts/{scriptId}/asset-images`                  | GET     | 无数据返回 404 | 返回 200 + `data: null` | 资产图片      |
| 8 | `/api/scripts/{scriptId}/ref-analysis`                  | GET     | 无数据返回 404 | 返回 200 + `data: null` | 参考图分析     |
| 9 | `/api/ai-process/status`                                | GET     | 无记录返回 404 | 返回 200 + `data: null` | AI 处理状态轮询 |

***

## 三、RESTful 语义规范

| 场景                                    | 正确 HTTP 状态码            | 说明                                             |
| ------------------------------------- | ---------------------- | ---------------------------------------------- |
| 查询集合，结果为空                             | **200** + `data: []`   | 集合查询永远不应返回 404                                 |
| 查询单个资源，资源本身不存在                        | **404**                | 如 `GET /api/scripts/{scriptId}` 中 scriptId 不存在 |
| 查询单个资源的子结果（如 character-profiles），尚未生成 | **200** + `data: null` | 资源存在但子结果未生成，不是"资源不存在"                          |
| 创建/更新操作的父资源不存在                        | **404**                | 如 POST 到不存在的 scriptId                          |

**核心原则**：404 表示"请求的 URL 路径对应的资源不存在"，而非"查询结果为空"。对于查询类接口，空结果应通过 `data` 字段表达（空数组或 null），HTTP 层面始终返回 200。

***

## 四、具体修复代码建议（Spring Boot）

### 4.1 集合查询端点

**修复前**（典型问题代码）：

```java
@GetMapping("/api/projects/{projectId}/scripts/{scriptId}/episodes")
public Result<List<ScriptEpisodeVO>> listEpisodes(
        @PathVariable String projectId,
        @PathVariable String scriptId) {
    List<ScriptEpisodeVO> episodes = episodeService.listByScriptId(scriptId);
    if (episodes.isEmpty()) {
        return Result.error(404, "请求的资源不存在");  // ← 错误！
    }
    return Result.success(episodes);
}
```

**修复后**：

```java
@GetMapping("/api/projects/{projectId}/scripts/{scriptId}/episodes")
public Result<List<ScriptEpisodeVO>> listEpisodes(
        @PathVariable String projectId,
        @PathVariable String scriptId) {
    List<ScriptEpisodeVO> episodes = episodeService.listByScriptId(scriptId);
    return Result.success(episodes);  // 空列表也返回 200
}
```

### 4.2 单个结果查询端点

**修复前**：

```java
@GetMapping("/api/scripts/{scriptId}/character-profiles")
public Result<CharacterProfileResultVO> getCharacterProfiles(
        @PathVariable String scriptId) {
    CharacterProfileResultVO result = aiProcessService.getCharacterProfiles(scriptId);
    if (result == null) {
        return Result.error(404, "请求的资源不存在");  // ← 错误！
    }
    return Result.success(result);
}
```

**修复后**：

```java
@GetMapping("/api/scripts/{scriptId}/character-profiles")
public Result<CharacterProfileResultVO> getCharacterProfiles(
        @PathVariable String scriptId) {
    CharacterProfileResultVO result = aiProcessService.getCharacterProfiles(scriptId);
    // result 为 null 表示尚未生成，返回 200 + null
    return Result.success(result);
}
```

### 4.3 AI 处理状态端点

**修复后**：

```java
@GetMapping("/api/ai-process/status")
public Result<AiProcessRecord> getStatus(
        @RequestParam String type,
        @RequestParam String businessId) {
    AiProcessRecord record = aiProcessService.getLatestStatus(type, businessId);
    // 无记录时返回 200 + null，前端据此判断为"尚未处理"
    return Result.success(record);
}
```

***

## 五、ScriptEpisodeVO 字段定义补充

API 文档 `docs/剧本-拆解/api.json` 中 `ScriptEpisodeVO` 被 `$ref` 引用但**未定义具体字段**。前端当前使用的字段为：

```typescript
interface ScriptEpisodeVO {
  id: string // 分集ID
  projectId: string // 项目ID
  scriptId: string // 剧本ID
  episodeName: string // 分集名称（如"第一集"、"序章"、"番外"）
  content: string // 分集正文内容
  episodeIndex: number // 排序位置（从0开始递增，数字越小越靠前）
  createTime: string // 创建时间
  updateTime: string // 更新时间
}
```

请后端确认 `ScriptEpisodeVO` 的实际字段是否与以上一致，并补充 API 文档中的 schema 定义。

### 对应的创建/更新请求体

```typescript
interface ScriptEpisodeUpdateRequest {
  scriptId?: string // 分集所属剧本ID（创建时可选）
  episodeName?: string // 分集名称
  episodeIndex?: number // 排序位置
  content?: string // 分集正文
}
```

***

## 六、前端已完成的配合修改

| 修改项      | 文件                                     | 说明                                                                                                |
| -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 字段名对齐    | `src/types/api/api.d.ts`               | `episodeKey` → `episodeName`，`sortOrder` → `episodeIndex`，移除 `childOf`，新增 `scriptId`、`updateTime` |
| API 函数补充 | `src/api/script.ts`                    | 新增 `fetchGetAiProcessStatus`、`fetchGetAiProcessHistory`、`fetchGetAiProcessDetail`                 |
| 类型定义完善   | `src/types/api/api.d.ts`               | 新增 `Api.AiProcess` 命名空间                                                                           |
| 轮询机制优化   | `src/views/script/ai-review/index.vue` | AI 审核轮询改用 `GET /api/ai-process/status`，不再重复 POST                                                  |
| 服务端分页    | `src/views/script/library/index.vue`   | 剧本列表改用服务端分页和筛选，消除 N+1 查询                                                                          |
| 数据一致性    | `src/views/script/write/index.vue`     | 保存后使用服务端返回的 `updateTime`，而非客户端本地时间                                                                |
| 全字段对齐    | `src/views/script/decompose/index.vue` | 分集编辑/创建表单字段名全部对齐后端                                                                                |
| 全字段对齐    | `src/views/script/profiles/index.vue`  | 人物小传页面分集选项字段名对齐                                                                                   |
| 全字段对齐    | `src/views/project/episodes/index.vue` | 集数管理页面字段名对齐                                                                                       |

***

## 七、前后端 API 端点完整对照

### 7.1 剧本管理模块

| 前端函数                         | HTTP 方法 | URL 路径                                         | 后端文档  | 状态      |
| ---------------------------- | ------- | ---------------------------------------------- | ----- | ------- |
| `fetchGetScriptList`         | GET     | `/api/projects/{projectId}/scripts`            | 剧本-管理 | 正常      |
| `fetchGetScriptDetail`       | GET     | `/api/scripts/{scriptId}`                      | 剧本-管理 | 正常      |
| `fetchCreateScript`          | POST    | `/api/projects/{projectId}/scripts`            | 剧本-管理 | 正常      |
| `fetchUpdateScript`          | PUT     | `/api/scripts/{scriptId}`                      | 剧本-管理 | 正常      |
| `fetchDeleteScript`          | DELETE  | `/api/scripts/{scriptId}`                      | 剧本-管理 | 正常      |
| `fetchSubmitScriptReview`    | POST    | `/api/scripts/{scriptId}/submit-review`        | 剧本-管理 | 正常      |
| `fetchWithdrawScriptReview`  | POST    | `/api/scripts/{scriptId}/withdraw-review`      | 剧本-管理 | 正常      |
| `fetchGetScriptReviewStatus` | GET     | `/api/scripts/{scriptId}/review-status`        | 剧本-管理 | 正常      |
| `fetchGetPostApprovalStatus` | GET     | `/api/scripts/{scriptId}/post-approval-status` | 剧本-管理 | 正常      |
| `fetchGetCharacterProfiles`  | GET     | `/api/scripts/{scriptId}/character-profiles`   | 剧本-管理 | **需修复** |
| `fetchGetStyleConfig`        | GET     | `/api/scripts/{scriptId}/style-config`         | 剧本-管理 | **需修复** |
| `fetchGetRefAnalysis`        | GET     | `/api/scripts/{scriptId}/ref-analysis`         | 剧本-管理 | **需修复** |
| `fetchGetExtractedAssets`    | GET     | `/api/scripts/{scriptId}/extracted-assets`     | 剧本-管理 | **需修复** |
| `fetchGetVoicePrompts`       | GET     | `/api/scripts/{scriptId}/voice-prompts`        | 剧本-管理 | **需修复** |
| `fetchGetAssetPrompts`       | GET     | `/api/scripts/{scriptId}/asset-prompts`        | 剧本-管理 | **需修复** |
| `fetchGetAssetImages`        | GET     | `/api/scripts/{scriptId}/asset-images`         | 剧本-管理 | **需修复** |
| `fetchGetVideoPrompts`       | GET     | `/api/episodes/{episodeId}/video-prompts`      | 剧本-管理 | 正常      |

### 7.2 剧本拆解模块

| 前端函数                      | HTTP 方法 | URL 路径                                                   | 后端文档  | 状态      |
| ------------------------- | ------- | -------------------------------------------------------- | ----- | ------- |
| `fetchDecomposeScript`    | POST    | `/api/projects/{projectId}/scripts/{scriptId}/decompose` | 剧本-拆解 | 正常      |
| `fetchGetScriptEpisodes`  | GET     | `/api/projects/{projectId}/scripts/{scriptId}/episodes`  | 剧本-拆解 | **需修复** |
| `fetchGetProjectEpisodes` | GET     | `/api/projects/{projectId}/episodes`                     | 剧本-拆解 | 正常      |
| `fetchGetEpisodeDetail`   | GET     | `/api/scripts/{scriptId}/episodes/{episodeId}`           | 剧本-拆解 | 正常      |
| `fetchUpdateEpisode`      | PUT     | `/api/scripts/{scriptId}/episodes/{episodeId}`           | 剧本-拆解 | 正常      |
| `fetchDeleteEpisode`      | DELETE  | `/api/scripts/{scriptId}/episodes/{episodeId}`           | 剧本-拆解 | 正常      |
| `fetchCreateEpisode`      | POST    | `/api/projects/{projectId}/episodes`                     | 剧本-拆解 | 正常      |

### 7.3 剧本内容生成模块

| 前端函数                             | HTTP 方法 | URL 路径                                                            | 后端文档    | 状态 |
| -------------------------------- | ------- | ----------------------------------------------------------------- | ------- | -- |
| `fetchGenerateCharacterProfiles` | POST    | `/api/projects/{projectId}/scripts/{scriptId}/character-profiles` | 剧本-内容生成 | 正常 |
| `fetchExtractAssets`             | POST    | `/api/projects/{projectId}/scripts/{scriptId}/extract-assets`     | 剧本-内容生成 | 正常 |
| `fetchReviewScriptContent`       | POST    | `/api/projects/{projectId}/scripts/{scriptId}/review-content`     | 剧本-内容生成 | 正常 |
| `fetchGenerateStyleConfig`       | POST    | `/api/projects/{projectId}/scripts/{scriptId}/style-config`       | 剧本-内容生成 | 正常 |
| `fetchRefAnalysis`               | POST    | `/api/projects/{projectId}/scripts/{scriptId}/ref-analysis`       | 剧本-内容生成 | 正常 |
| `fetchGenerateVoicePrompts`      | POST    | `/api/projects/{projectId}/scripts/{scriptId}/voice-prompts`      | 剧本-内容生成 | 正常 |

### 7.4 剧本资产模块

| 前端函数                           | HTTP 方法 | URL 路径                                                                | 后端文档  | 状态 |
| ------------------------------ | ------- | --------------------------------------------------------------------- | ----- | -- |
| `fetchGetScriptAssetList`      | GET     | `/api/projects/{projectId}/script-assets`                             | 剧本-资产 | 正常 |
| `fetchCreateScriptAsset`       | POST    | `/api/projects/{projectId}/script-assets`                             | 剧本-资产 | 正常 |
| `fetchBatchCreateScriptAssets` | POST    | `/api/projects/{projectId}/script-assets/batch`                       | 剧本-资产 | 正常 |
| `fetchGetScriptAssetDetail`    | GET     | `/api/script-assets/{assetId}`                                        | 剧本-资产 | 正常 |
| `fetchUpdateScriptAsset`       | PUT     | `/api/script-assets/{assetId}`                                        | 剧本-资产 | 正常 |
| `fetchDeleteScriptAsset`       | DELETE  | `/api/script-assets/{assetId}`                                        | 剧本-资产 | 正常 |
| `fetchUploadScriptAssetImage`  | POST    | `/api/script-assets/{assetId}/upload-image`                           | 剧本-资产 | 正常 |
| `fetchGenerateAssetPrompts`    | POST    | `/api/projects/{projectId}/scripts/{scriptId}/assets/prompts`         | 剧本-资产 | 正常 |
| `fetchGenerateAssetImages`     | POST    | `/api/projects/{projectId}/scripts/{scriptId}/assets/images/generate` | 剧本-资产 | 正常 |
| `fetchReviewAssetImages`       | POST    | `/api/projects/{projectId}/scripts/{scriptId}/assets/images/review`   | 剧本-资产 | 正常 |

### 7.5 AI 处理记录模块

| 前端函数                       | HTTP 方法 | URL 路径                               | 后端文档    | 状态      |
| -------------------------- | ------- | ------------------------------------ | ------- | ------- |
| `fetchGetAiProcessStatus`  | GET     | `/api/ai-process/status`             | AI-处理记录 | **需修复** |
| `fetchGetAiProcessHistory` | GET     | `/api/ai-process/history`            | AI-处理记录 | 正常      |
| `fetchGetAiProcessDetail`  | GET     | `/api/ai-process/history/{recordId}` | AI-处理记录 | 正常      |

### 7.6 后端文档有但前端未实现的端点

| 端点                                                                                                | HTTP 方法 | 后端文档模块 | 说明        |
| ------------------------------------------------------------------------------------------------- | ------- | ------ | --------- |
| `/api/prompts/{promptId}/submit-review`                                                           | POST    | 提示词-审核 | 提交提示词审核   |
| `/api/prompts/{promptId}/withdraw-review`                                                         | POST    | 提示词-审核 | 撤回提示词审核   |
| `/api/prompts/{promptId}/review-status`                                                           | GET     | 提示词-审核 | 获取提示词审核状态 |
| `/api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/violation-check` | POST    | 视频-提示词 | 视频提示词违规检测 |
| `/api/projects/{projectId}/scripts/{scriptId}/episodes/{episodeId}/video-prompts/fix`             | POST    | 视频-提示词 | 视频提示词修改   |

***

## 八、验证步骤

后端修复后，请按以下步骤逐一验证：

### 8.1 无数据场景

```bash
# 剧本分集列表（未拆解的剧本）
curl -s -H "Authorization: Bearer {token}" \
  "http://server.bsuniversal.cn:10006/api/projects/{projectId}/scripts/{scriptId}/episodes"
# 期望: {"code":200, "data":[], "message":"success"}

# 人物小传（未生成的剧本）
curl -s -H "Authorization: Bearer {token}" \
  "http://server.bsuniversal.cn:10006/api/scripts/{scriptId}/character-profiles"
# 期望: {"code":200, "data":null, "message":"success"}

# AI 处理状态（无处理记录）
curl -s -H "Authorization: Bearer {token}" \
  "http://server.bsuniversal.cn:10006/api/ai-process/status?type=SCRIPT_REVIEW&businessId={scriptId}"
# 期望: {"code":200, "data":null, "message":"success"}
```

### 8.2 有数据场景

```bash
# 剧本分集列表（已拆解的剧本）
curl -s -H "Authorization: Bearer {token}" \
  "http://server.bsuniversal.cn:10006/api/projects/{projectId}/scripts/{scriptId}/episodes"
# 期望: {"code":200, "data":[{...}, {...}], "message":"success"}

# 人物小传（已生成的剧本）
curl -s -H "Authorization: Bearer {token}" \
  "http://server.bsuniversal.cn:10006/api/scripts/{scriptId}/character-profiles"
# 期望: {"code":200, "data":{...}, "message":"success"}
```

### 8.3 前端页面验证

1. 打开"剧本拆解"页面，选择已拆解的剧本 → 应显示分集列表
2. 打开"人物小传"页面，选择已生成小传的剧本 → 应显示人物卡片
3. 打开"AI 审核"页面，提交审核 → 应正常轮询状态
4. 打开"剧本管理"页面，筛选和分页 → 应正常工作

