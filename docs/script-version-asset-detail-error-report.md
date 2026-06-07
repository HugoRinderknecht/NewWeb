# `/#/script/version` 资产详情报错分析报告

## 问题概述
- 页面：`http://localhost:3006/#/script/version`
- 用户操作：点击“详细”查看创意资产详情
- 页面提示：`服务器内部错误`、`获取资产详情失败`
- 日志来源：`C:\Users\MicaForever\Downloads\localhost-1780830820092.log`

## 结论摘要
本次报错的直接原因不是前端弹窗逻辑本身，而是前端请求了一个错误的详情接口路径：
- 当前页面列表数据通过 **项目级接口** 拉取：`/api/projects/{projectId}/script-assets`
- 但点击“详细”后，前端却调用了 **非项目级接口**：`/api/script-assets/{assetId}`
- 从日志看，该请求返回了 `400 Bad Request`，响应消息显示为 `服务器内部错误`

因此，根因高度确定为：**创意资产详情接口的前端路径与当前后端实际支持的路由约定不一致，缺少 `projectId` 这一层路径上下文，导致详情查询失败。**

## 关键证据

### 1. 浏览器日志中的失败请求
日志中可以看到点击详情时，前端实际发出了如下请求，并返回 400：

- `GET http://localhost:3006/api/script-assets/ddb8817a41601ead0de540cf80e42854 400 (Bad Request)`
- 错误对象：`message: '服务器内部错误'`
- 页面提示：`获取资产详情失败`

这说明“详细”按钮已经触发了请求，但请求本身失败，并非弹窗组件未打开或按钮无响应。

### 2. 详情弹窗中的调用位置
`src/views/script/version/index.vue` 在查看详情时执行：

```971:980:src/views/script/version/index.vue
const handleViewDetail = async (row: Api.ScriptAsset.ScriptAssetListItem) => {
  try {
    const detail = await fetchGetScriptAssetDetail(row.id)
    if (detail) {
      assetDetail.value = detail
      detailDialogVisible.value = true
    }
  } catch {
    ElMessage.error('获取资产详情失败')
  }
}
```

同样，编辑弹窗也复用了相同的详情接口：

```902:924:src/views/script/version/index.vue
const handleOpenEditDialog = async (row: Api.ScriptAsset.ScriptAssetListItem) => {
  editingAssetId.value = row.id
  try {
    const detail = await fetchGetScriptAssetDetail(row.id)
    if (detail) {
      editForm.assetName = detail.assetName || ''
      editForm.assetType = detail.assetType || ''
      editForm.description = detail.description || ''
      editForm.tags = detail.tags || []
      // 从 extraMetadata 恢复类型特有字段
      const meta = detail.extraMetadata || ({} as Record<string, unknown>)
      // ...
      editDialogVisible.value = true
    }
  } catch {
    ElMessage.error('获取资产详情失败')
  }
}
```

所以这个问题不只影响“详细”，也会影响“编辑”。

### 3. 列表接口是项目级接口
同一页面加载创意资产列表时，使用的是项目级路由：

```646:667:src/views/script/version/index.vue
const loadAssetList = async () => {
  const projectId = currentProjectId.value
  if (!projectId) {
    assetList.value = []
    return
  }
  loading.value = true
  try {
    const params: Api.ScriptAsset.ScriptAssetSearchParams = {
      current: pagination.current,
      size: pagination.size
    }
    // ...
    const res = await fetchGetScriptAssetList(projectId, params)
    assetList.value = res?.records || []
    pagination.total = res?.total || 0
  } catch {
```

而对应 API 定义也是：

```6:13:src/api/script-asset.ts
export function fetchGetScriptAssetList(
  projectId: string,
  params?: Api.ScriptAsset.ScriptAssetSearchParams
) {
  return getApiAdapter().get<Api.Common.PaginatedResponse<Api.ScriptAsset.ScriptAssetListItem>>(
    `/api/projects/${projectId}/script-assets`,
    params
  )
}
```

这说明“创意资产”这一模块的主数据访问模型，本身是依赖 `projectId` 的。

### 4. 出问题的详情接口缺少 `projectId`
当前详情 API 定义如下：

```38:40:src/api/script-asset.ts
/** 获取创意资产详情 */
export function fetchGetScriptAssetDetail(assetId: string) {
  return getApiAdapter().get<Api.ScriptAsset.ScriptAssetDetail>(`/api/script-assets/${assetId}`)
}
```

这里明显只传了 `assetId`，没有 `projectId`。

与此同时，项目中“普通资产”模块的详情接口写法是完整的项目级路由：

```10:12:src/api/asset.ts
export function fetchGetAssetDetail(projectId: string, assetId: string) {
  return getApiAdapter().get<Api.Asset.AssetDetail>(`/api/projects/${projectId}/assets/${assetId}`)
}
```

这进一步说明当前“创意资产详情”的 API 设计与项目内其他资产接口风格不一致，存在明显可疑点。

## 根因分析
综合日志与代码，可以得到以下推断链：

1. 页面列表能正常展示，说明 `projectId` 已正确选定，且 `/api/projects/{projectId}/script-assets` 可用。
2. 点击“详细”时，前端仅把 `row.id` 传给 `fetchGetScriptAssetDetail`。
3. `fetchGetScriptAssetDetail` 拼出的 URL 是 `/api/script-assets/{assetId}`。
4. 后端对该路由返回 `400`，消息表现为 `服务器内部错误`。
5. 因此前端 catch 到异常后，显示 `获取资产详情失败`。

根因可以归纳为：

### 根因 1：详情接口路径缺少项目上下文
当前实现默认后端支持全局路由：
- `/api/script-assets/{assetId}`

但从模块其余接口设计看，更合理且更可能真实存在的应是：
- `/api/projects/{projectId}/script-assets/{assetId}`

如果后端实际要求 `projectId` 进行鉴权、租户隔离或数据定位，那么当前请求就会因缺少项目上下文而失败。

### 根因 2：前端“查看详情 / 编辑详情”共用同一错误接口
因为“编辑”和“详细”都依赖 `fetchGetScriptAssetDetail(row.id)`，所以该接口一旦错误，两个功能都会受影响，而不是单点 UI 问题。

## 非根因但相关的问题
日志里还能看到一个额外警告：

- `Property "handleScriptChange" was accessed during render but is not defined on instance.`

模板中确实绑定了：

```14:20:src/views/script/version/index.vue
<ElSelect
  v-model="currentScriptId"
  placeholder="选择剧本"
  clearable
  style="width: 220px"
  @change="handleScriptChange"
>
```

但脚本区未定义 `handleScriptChange`。这会导致剧本切换时产生 Vue 警告，并可能使脚本筛选状态同步异常。

不过，这个问题不是本次“点击详细后接口 400”的直接根因。因为失败请求已经明确显示是详情接口地址本身返回错误。

## 影响范围
- “详细”按钮：必现失败
- “编辑”按钮：大概率同样失败
- 任何依赖 `fetchGetScriptAssetDetail(assetId)` 的地方：都会受到相同影响

## 修复建议

### 方案 A：按项目级接口修正前端调用（优先推荐）
如果后端真实接口是项目级路由，应将：
- `fetchGetScriptAssetDetail(assetId)`

改为：
- `fetchGetScriptAssetDetail(projectId, assetId)`

并把 API 路径改成：
- `/api/projects/${projectId}/script-assets/${assetId}`

同时在以下调用处补传 `currentProjectId.value`：
- `handleViewDetail`
- `handleOpenEditDialog`
- 如有需要，也应统一检查更新、删除、上传图片等接口是否同样缺少项目上下文

### 方案 B：若后端本来就支持全局详情路由，则排查后端参数校验/实现
如果后端设计上确实存在 `/api/script-assets/{assetId}`，则需要后端进一步检查：
- 是否要求额外 query/header/context 参数
- 是否因为资产 ID 不属于当前项目而被拦截
- 是否该接口实现内部错误地把参数校验异常映射成了 `400 + 服务器内部错误`

但基于当前前端代码结构，**方案 A 的概率明显更高。**

## 建议的排查顺序
1. 先确认后端 swagger / controller 是否存在：
   - `/api/projects/{projectId}/script-assets/{assetId}`
   - `/api/script-assets/{assetId}`
2. 若前者存在、后者不存在或不可用，则直接修正前端 API 封装。
3. 回归验证以下功能：
   - 创意资产列表加载
   - 详细弹窗
   - 编辑弹窗
   - 删除资产
   - 上传参考图
4. 顺手补上 `handleScriptChange`，避免剧本切换逻辑处于不一致状态。

## 最终判断
本次 `/#/script/version` 页面“点击详细报错”的核心原因是：

**前端在创意资产详情查询时调用了错误的接口路径 `/api/script-assets/{assetId}`，没有带上当前 `projectId`，导致后端返回 400，最终页面提示“服务器内部错误 / 获取资产详情失败”。**
