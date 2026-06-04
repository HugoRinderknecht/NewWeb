/**
 * 统一数据层 - 迁移验证指标
 *
 * 本文件记录了数据层迁移的效果验证指标和测试方法。
 * 在完成所有迁移后，应运行以下验证。
 *
 * @module docs/data-layer-verification
 */

/**
 * ============================================================
 * 一、迁移覆盖率指标
 * ============================================================
 *
 * [x] 核心模块 Query Hooks
 *     - script.ts (剧本): 10 个 hooks
 *     - asset.ts (资产): 14 个 hooks
 *     - review.ts (审核): 13 个 hooks
 *     - team.ts (团队): 14 个 hooks
 *     - video.ts (视频): 7 个 hooks
 *     - auth.ts (认证): 6 个 hooks
 *     - workflow.ts (工作流): 7 个 hooks
 *     - notification.ts (通知): 13 个 hooks
 *     - points.ts (积分): 7 个 hooks
 *     - ai-process.ts (AI 流程): 3 个 hooks
 *     - statistics.ts (统计): 23 个 hooks
 *     - character.ts (角色): 5 个 hooks
 *     - storyboard.ts (分镜): 18 个 hooks
 *
 * [x] 视图迁移
 *     - project/list (项目列表): Vue Query ✓
 *     - project/edit (项目编辑): Vue Query ✓
 *     - project/scripts (剧本管理): Vue Query + 后端分页 ✓
 *     - asset/library (资产库): Vue Query + 后端分页 ✓
 *     - review/pending (审核待办): Vue Query + 后端分页 ✓
 *     - project/characters (角色管理): Vue Query ✓
 *     - project/episodes (集数管理): Vue Query ✓
 *     - project/statistics (项目统计): Vue Query ✓
 *     - project/members (团队成员): Vue Query ✓
 *     - project/edit 子列表 (剧本/分镜/视频/资产): Vue Query ✓
 *
 * [ ] script/library (剧本库)
 * [ ] script/write (剧本编写)
 * [ ] script/profiles (角色设定)
 * [ ] script/decompose (剧本拆解)
 * [ ] script/ai-review (AI 审核)
 * [ ] storyboard/design (分镜设计)
 * [ ] storyboard/scene (场景管理)
 * [ ] storyboard/batch-edit (批量编辑)
 * [ ] video-gen/task (视频任务)
 * [ ] video-gen/preview (视频预览)
 * [ ] video-gen/history (历史记录)
 * [ ] video-gen/ai (AI 视频)
 * [ ] team/settings (团队设置)
 * [ ] team/quota (配额管理)
 * [ ] auth/login (登录)
 * [ ] auth/register (注册)
 *
 * ============================================================
 * 二、代码质量指标
 * ============================================================
 *
 * 1. 直接 API 调用移除率
 *    - 目标: 从视图层移除所有 `fetch*` 直接调用
 *    - 验证: `grep -r "fetch[A-Z].*(" src/views --include="*.vue" | grep -v "from '@/api/queries'"`
 *    - 当前状态: 进行中 (已修复 9 个主要视图)
 *
 * 2. 视图层类型安全性
 *    - 目标: 所有 `.vue` 文件无 TypeScript 错误
 *    - 验证: `npx vue-tsc --noEmit 2>&1 | grep "error TS" | wc -l`
 *    - 当前状态: 约 160+ 预存错误 (test files 和非迁移视图)
 *
 * 3. Hook 函数导出完整性
 *    - 目标: `@/api/queries/index.ts` 导出所有 hooks
 *    - 验证: 运行 `src/api/queries/*.test.ts`
 *    - 当前状态: project.test.ts ✓, character.test.ts ✓
 *
 * ============================================================
 * 三、运行时行为验证
 * ============================================================
 *
 * 1. Vue Query Cache 行为
 *    - 列表页切换分页/筛选: cache 自动失效并重新获取
 *    - 创建/更新/删除操作: 相关 query 自动 invalidate
 *    - 后端分页: 每次翻页发起新请求，前端不缓存全量数据
 *
 * 2. DataFlowBus 集成
 *    - useDataFlowMutation: mutation 成功后自动广播
 *    - useDataFlowInvalidation: 订阅通道并自动 invalidate cache
 *    - 验证: 运行 `src/utils/data-flow/data-flow.integration.test.ts`
 *
 * 3. Pinia Store 精简
 *    - project.ts: 轻量化，仅跟踪 currentProjectId
 *    - project-data.ts: 移除 loadProjects，数据由 Vue Query 管理
 *    - 无循环依赖: 使用动态 import 打破 import 链
 *
 * ============================================================
 * 四、性能指标（预期）
 * ============================================================
 *
 * | 指标 | 迁移前 | 迁移后（预期） |
 * |------|--------|----------------|
 * | 重复请求率 | 高（多个组件独立请求） | 低（统一 cache） |
 * | 首屏加载时间 | 较慢 | 更快（cache 优先） |
 * | 内存占用 | 多个 store 实例 | 减少（共享 cache） |
 * | 开发体验 | API 分散 | 统一 hooks，类型安全 |
 *
 * ============================================================
 * 五、验证方法
 * ============================================================
 *
 * 运行单元测试:
 *   npm test -- --run src/api/queries/
 *   npm test -- --run src/utils/data-flow/
 *
 * 运行类型检查:
 *   npx vue-tsc --noEmit
 *
 * 检查直接 API 调用:
 *   grep -r "from '@/api/[a-z]'" src/views --include="*.vue"
 *
 * 手动功能测试（开发环境）:
 *   1. 登录 -> 访问项目列表 -> 验证缓存
 *   2. 创建项目 -> 验证列表自动刷新
 *   3. 切换分页/筛选 -> 验证数据正确
 *   4. 删除项目 -> 验证列表自动更新
 */
