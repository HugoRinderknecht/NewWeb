<template>
  <div class="ai-review-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">AI审核结果</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElSelect
              v-model="currentScriptId"
              placeholder="选择剧本"
              clearable
              style="width: 220px"
              @change="handleScriptChange"
            >
              <ElOption
                v-for="script in scriptOptions"
                :key="script.id"
                :label="script.title"
                :value="script.id"
              />
            </ElSelect>
          </div>
          <ElButton type="primary" :loading="submitting" @click="handleStartReview">
            <ArtSvgIcon icon="ri:shield-check-line" class="mr-1" />
            发起审核
          </ElButton>
        </div>
      </template>

      <!-- 处理中状态 -->
      <div v-if="processStatus === 'PROCESSING'" class="processing-state">
        <div class="flex flex-col items-center justify-center py-20">
          <ElIcon class="is-loading" :size="48" color="var(--el-color-primary)">
            <ArtSvgIcon icon="ri:loader-4-line" />
          </ElIcon>
          <p class="mt-4 text-base text-g-500">AI审核进行中，请稍候...</p>
          <p class="mt-1 text-sm text-g-400">预计需要1-3分钟完成</p>
        </div>
      </div>

      <!-- 失败状态 -->
      <div v-else-if="processStatus === 'FAILED'" class="failed-state">
        <ElResult
          icon="error"
          title="审核失败"
          :sub-title="processMessage || 'AI审核处理失败，请稍后重试'"
        >
          <template #extra>
            <ElButton type="primary" @click="handleStartReview">重新审核</ElButton>
          </template>
        </ElResult>
      </div>

      <!-- 完成状态 -->
      <template v-else-if="processStatus === 'COMPLETED' || violations.length > 0">
        <!-- 统计卡片 -->
        <div class="review-stats mb-6">
          <ElRow :gutter="16">
            <ElCol :span="6" :xs="12">
              <div class="stat-card total">
                <div class="stat-icon">
                  <ArtSvgIcon icon="ri:file-list-line" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{
                    reviewResult?.violationCount ?? violations.length
                  }}</div>
                  <div class="stat-label">违规总数</div>
                </div>
              </div>
            </ElCol>
            <ElCol :span="6" :xs="12">
              <div class="stat-card high">
                <div class="stat-icon">
                  <ArtSvgIcon icon="ri:error-warning-line" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ highRiskCount }}</div>
                  <div class="stat-label">高风险</div>
                </div>
              </div>
            </ElCol>
            <ElCol :span="6" :xs="12">
              <div class="stat-card medium">
                <div class="stat-icon">
                  <ArtSvgIcon icon="ri:alert-line" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ mediumRiskCount }}</div>
                  <div class="stat-label">中风险</div>
                </div>
              </div>
            </ElCol>
            <ElCol :span="6" :xs="12">
              <div class="stat-card low">
                <div class="stat-icon">
                  <ArtSvgIcon icon="ri:shield-check-line" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ lowRiskCount }}</div>
                  <div class="stat-label">低风险</div>
                </div>
              </div>
            </ElCol>
          </ElRow>
        </div>

        <!-- 全局警告 -->
        <ElAlert v-if="reviewResult?.globalWarning" type="warning" :closable="false" class="mb-6">
          <template #title>
            <div class="flex items-center gap-2">
              <ArtSvgIcon icon="ri:alarm-warning-line" />
              <span>{{ reviewResult.globalWarning }}</span>
            </div>
          </template>
        </ElAlert>

        <!-- 违规列表 -->
        <ElTable :data="violations" stripe v-loading="loading" class="violation-table">
          <ElTableColumn prop="location" label="位置" min-width="160" show-overflow-tooltip />
          <ElTableColumn label="违规类型" width="120">
            <template #default="{ row }">
              <ElTag :type="violationTagMap[row.type as ViolationType] ?? 'info'" size="small">
                {{ violationLabelMap[row.type as ViolationType] ?? row.type }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="风险等级" width="100">
            <template #default="{ row }">
              <ElTag :type="levelTagMap[row.level as RiskLevel] ?? 'info'" size="small">
                {{ levelLabelMap[row.level as RiskLevel] ?? row.level }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="原文片段" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="snippet-text">{{ row.snippet }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="hitWord" label="命中词" width="120" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="hit-word">{{ row.hitWord }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="{ row }">
              <ElTag :type="statusTagMap[row.status as ViolationStatus] ?? 'info'" size="small">
                {{ statusLabelMap[row.status as ViolationStatus] ?? row.status }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" link size="small" @click="handleViewDetail(row)">
                查看详情
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </template>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <ElEmpty description="暂无审核结果，请选择剧本后发起审核">
          <ElButton type="primary" @click="handleStartReview">
            <ArtSvgIcon icon="ri:shield-check-line" class="mr-1" />
            发起审核
          </ElButton>
        </ElEmpty>
      </div>
    </ElCard>

    <!-- 发起审核弹窗 -->
    <ElDialog
      v-model="reviewDialogVisible"
      title="发起AI审核"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm label-width="90px">
        <ElFormItem label="选择剧本">
          <ElSelect v-model="currentScriptId" placeholder="选择剧本" style="width: 100%" disabled>
            <ElOption
              v-for="script in scriptOptions"
              :key="script.id"
              :label="script.title"
              :value="script.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="指定分集">
          <ElSelect
            v-model="selectedEpisodeIds"
            placeholder="不选则审核全部分集"
            multiple
            clearable
            style="width: 100%"
          >
            <ElOption
              v-for="ep in episodeOptions"
              :key="ep.id"
              :label="ep.episodeName"
              :value="ep.id"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="reviewDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmitReview"
          >确认审核</ElButton
        >
      </template>
    </ElDialog>

    <!-- 违规详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="违规详情"
      width="640px"
      align-center
      destroy-on-close
    >
      <div v-if="currentViolation" class="violation-detail">
        <ElDescriptions :column="2" border class="mb-6">
          <ElDescriptionsItem label="位置">{{ currentViolation.location }}</ElDescriptionsItem>
          <ElDescriptionsItem label="违规类型">
            <ElTag
              :type="violationTagMap[currentViolation.type as ViolationType] ?? 'info'"
              size="small"
            >
              {{
                violationLabelMap[currentViolation.type as ViolationType] ?? currentViolation.type
              }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="风险等级">
            <ElTag :type="levelTagMap[currentViolation.level as RiskLevel] ?? 'info'" size="small">
              {{ levelLabelMap[currentViolation.level as RiskLevel] ?? currentViolation.level }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag
              :type="statusTagMap[currentViolation.status as ViolationStatus] ?? 'info'"
              size="small"
            >
              {{
                statusLabelMap[currentViolation.status as ViolationStatus] ??
                currentViolation.status
              }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="命中词" :span="2">
            <span class="hit-word">{{ currentViolation.hitWord }}</span>
          </ElDescriptionsItem>
        </ElDescriptions>

        <div class="detail-section mb-4">
          <div class="section-label mb-2">
            <ArtSvgIcon icon="ri:file-text-line" class="mr-1" />
            原文片段
          </div>
          <div class="section-content snippet-block">
            {{ currentViolation.snippet }}
          </div>
        </div>

        <div v-if="currentViolation.suggestion" class="detail-section">
          <div class="section-label mb-2">
            <ArtSvgIcon icon="ri:lightbulb-line" class="mr-1" />
            修改建议
          </div>
          <div class="section-content suggestion-block">
            {{ currentViolation.suggestion }}
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import {
    fetchGetScriptList,
    fetchReviewScriptContent,
    fetchGetScriptEpisodes,
    fetchGetAiProcessStatus,
    fetchGetAiProcessDetail
  } from '@/api/script'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'

  defineOptions({ name: 'AiReview' })

  // ==================== 类型定义 ====================
  type RiskLevel = 'high' | 'medium' | 'low'
  type ViolationType =
    | 'sensitive'
    | 'political'
    | 'pornography'
    | 'violence'
    | 'copyright'
    | 'other'
  type ViolationStatus = 'pending' | 'confirmed' | 'dismissed' | 'fixed'
  type ProcessStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'IDLE'

  interface ViolationItem {
    location: string
    type: string
    level: string
    snippet: string
    hitWord: string
    status: string
    suggestion?: string
  }

  interface ReviewResult {
    scriptId: string
    violations: ViolationItem[]
    violationCount: number
    workflowRunId: string
    duration: number
    tokenUsage: number
    creditsDeducted: number
    markedVersion: string
    cleanVersion: string
    globalWarning: string
  }

  interface ScriptOption {
    id: string
    title: string
  }

  interface EpisodeOption {
    id: string
    episodeName: string
  }

  // ==================== 映射常量 ====================
  const levelTagMap: Record<RiskLevel, 'danger' | 'warning' | 'info'> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }

  const levelLabelMap: Record<RiskLevel, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }

  const violationTagMap: Record<ViolationType, 'danger' | 'warning' | 'info'> = {
    sensitive: 'danger',
    political: 'danger',
    pornography: 'danger',
    violence: 'warning',
    copyright: 'warning',
    other: 'info'
  }

  const violationLabelMap: Record<ViolationType, string> = {
    sensitive: '敏感信息',
    political: '政治违规',
    pornography: '色情低俗',
    violence: '暴力恐怖',
    copyright: '版权风险',
    other: '其他'
  }

  const statusTagMap: Record<ViolationStatus, 'warning' | 'danger' | 'info' | 'success'> = {
    pending: 'warning',
    confirmed: 'danger',
    dismissed: 'info',
    fixed: 'success'
  }

  const statusLabelMap: Record<ViolationStatus, string> = {
    pending: '待处理',
    confirmed: '已确认',
    dismissed: '已忽略',
    fixed: '已修复'
  }

  // ==================== Store ====================
  const scriptProjectStore = useScriptProjectStore()
  const { currentProjectId, projectList } = storeToRefs(scriptProjectStore)

  // ==================== 响应式数据 ====================
  const currentScriptId = ref('')
  const scriptOptions = ref<ScriptOption[]>([])
  const episodeOptions = ref<EpisodeOption[]>([])
  const selectedEpisodeIds = ref<string[]>([])

  const loading = ref(false)
  const submitting = ref(false)
  const processStatus = ref<ProcessStatus>('IDLE')
  const processMessage = ref('')

  const violations = ref<ViolationItem[]>([])
  const reviewResult = ref<ReviewResult | null>(null)

  // 弹窗
  const reviewDialogVisible = ref(false)
  const detailDialogVisible = ref(false)
  const currentViolation = ref<ViolationItem | null>(null)

  // 轮询定时器
  let pollTimer: ReturnType<typeof setTimeout> | null = null

  // ==================== 计算属性 ====================
  const highRiskCount = computed(() => violations.value.filter((v) => v.level === 'high').length)
  const mediumRiskCount = computed(
    () => violations.value.filter((v) => v.level === 'medium').length
  )
  const lowRiskCount = computed(() => violations.value.filter((v) => v.level === 'low').length)

  // ==================== 加载剧本列表 ====================
  const loadScriptList = async (projectId: string) => {
    if (!projectId) {
      scriptOptions.value = []
      return
    }
    try {
      const res = await fetchGetScriptList(projectId)
      const arr = res?.records || []
      scriptOptions.value = arr.map((s: Api.Script.ScriptListItem) => ({
        id: String(s.id),
        title: s.title ?? '未命名剧本'
      }))
      // 自动选中当前store中的scriptId或第一个
      let sid = scriptProjectStore.currentScriptId
      if (!sid && scriptOptions.value.length > 0) {
        sid = scriptOptions.value[0].id
      }
      if (sid) {
        currentScriptId.value = sid
        scriptProjectStore.setCurrentScript(sid)
        await loadReviewResult(projectId, sid)
      }
    } catch {
      scriptOptions.value = []
    }
  }

  // ==================== 加载分集列表 ====================
  const loadEpisodes = async (projectId: string, scriptId: string) => {
    if (!projectId || !scriptId) {
      episodeOptions.value = []
      return
    }
    try {
      const res = await fetchGetScriptEpisodes(projectId, scriptId)
      const arr = res ?? []
      episodeOptions.value = arr.map((ep: Api.Script.Episode) => ({
        id: String(ep.id),
        episodeName: ep.episodeName ?? `第${ep.episodeIndex ?? 1}集`
      }))
    } catch {
      episodeOptions.value = []
    }
  }

  // ==================== 加载审核结果 ====================
  const loadReviewResult = async (projectId: string, scriptId: string) => {
    if (!projectId || !scriptId) {
      violations.value = []
      reviewResult.value = null
      processStatus.value = 'IDLE'
      return
    }
    loading.value = true
    try {
      // 使用 GET /api/ai-process/status 查询已有的处理状态
      const res = await fetchGetAiProcessStatus({
        type: 'SCRIPT_REVIEW',
        businessId: scriptId
      })
      const record = res as Api.AiProcess.AiProcessRecord | null

      if (!record) {
        processStatus.value = 'IDLE'
        violations.value = []
        reviewResult.value = null
        return
      }

      if (record.status === 'PROCESSING') {
        processStatus.value = 'PROCESSING'
        processMessage.value = record.message || ''
        violations.value = []
        reviewResult.value = null
        startPolling(projectId, scriptId)
      } else if (record.status === 'FAILED') {
        processStatus.value = 'FAILED'
        processMessage.value = record.message || '审核处理失败'
        violations.value = []
        reviewResult.value = null
      } else if (record.status === 'COMPLETED') {
        // 获取完整结果数据
        if (record.resultData) {
          processStatus.value = 'COMPLETED'
          const result = record.resultData as unknown as ReviewResult
          reviewResult.value = result
          violations.value = result.violations || []
        } else if (record.id) {
          // resultData 为空时，通过详情接口获取
          try {
            const detail = await fetchGetAiProcessDetail(record.id)
            if (detail?.resultData) {
              processStatus.value = 'COMPLETED'
              const result = detail.resultData as unknown as ReviewResult
              reviewResult.value = result
              violations.value = result.violations || []
            } else {
              processStatus.value = 'COMPLETED'
              violations.value = []
              reviewResult.value = null
            }
          } catch {
            processStatus.value = 'COMPLETED'
            violations.value = []
            reviewResult.value = null
          }
        }
        stopPolling()
      } else {
        processStatus.value = 'IDLE'
        violations.value = []
        reviewResult.value = null
      }
    } catch {
      processStatus.value = 'IDLE'
      violations.value = []
      reviewResult.value = null
    } finally {
      loading.value = false
    }
  }

  // ==================== 轮询 ====================
  const startPolling = (projectId: string, scriptId: string) => {
    stopPolling()
    pollTimer = setTimeout(async () => {
      await loadReviewResult(projectId, scriptId)
    }, 5000)
  }

  const stopPolling = () => {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  // ==================== 事件处理 ====================
  const handleProjectChange = (projectId: string) => {
    scriptProjectStore.setCurrentProject(projectId)
    currentScriptId.value = ''
    violations.value = []
    reviewResult.value = null
    processStatus.value = 'IDLE'
    stopPolling()
    loadScriptList(projectId)
  }

  const handleProjectRefresh = () => {
    if (currentScriptId.value) {
      loadReviewResult(currentProjectId.value, currentScriptId.value)
    } else {
      loadScriptList(currentProjectId.value)
    }
  }

  const handleScriptChange = (scriptId: string) => {
    scriptProjectStore.setCurrentScript(scriptId)
    violations.value = []
    reviewResult.value = null
    processStatus.value = 'IDLE'
    stopPolling()
    if (scriptId) {
      loadReviewResult(currentProjectId.value, scriptId)
      loadEpisodes(currentProjectId.value, scriptId)
    }
  }

  // 发起审核
  const handleStartReview = async () => {
    if (!currentScriptId.value) {
      ElMessage.warning('请先选择剧本')
      return
    }
    // 加载分集列表供选择
    await loadEpisodes(currentProjectId.value, currentScriptId.value)
    selectedEpisodeIds.value = []
    reviewDialogVisible.value = true
  }

  const handleSubmitReview = async () => {
    if (!currentScriptId.value) {
      ElMessage.warning('请先选择剧本')
      return
    }
    submitting.value = true
    try {
      const episodeIds = selectedEpisodeIds.value.length > 0 ? selectedEpisodeIds.value : undefined
      // POST 发起审核
      const res = await fetchReviewScriptContent(
        currentProjectId.value,
        currentScriptId.value,
        episodeIds,
        true
      )
      const result = res as Api.Script.AiProcessResult<Api.Script.ReviewResult>
      reviewDialogVisible.value = false

      if (result?.status === 'PROCESSING') {
        processStatus.value = 'PROCESSING'
        processMessage.value = result.message || ''
        ElMessage.success('AI审核任务已提交，请稍候...')
        // 使用 GET 轮询，不再重复 POST
        startPolling(currentProjectId.value, currentScriptId.value)
      } else if (result?.status === 'COMPLETED' && result.result) {
        processStatus.value = 'COMPLETED'
        reviewResult.value = result.result as unknown as ReviewResult
        violations.value = (result.result as unknown as ReviewResult).violations || []
        ElMessage.success('AI审核完成')
      } else if (result?.status === 'FAILED') {
        processStatus.value = 'FAILED'
        processMessage.value = result.message || '审核处理失败'
        ElMessage.error('AI审核失败')
      } else {
        ElMessage.success('AI审核任务已提交')
        startPolling(currentProjectId.value, currentScriptId.value)
      }
    } catch {
      ElMessage.error('AI审核提交失败')
    } finally {
      submitting.value = false
    }
  }

  // 查看详情
  const handleViewDetail = (row: ViolationItem) => {
    currentViolation.value = row
    detailDialogVisible.value = true
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    loadScriptList(currentProjectId.value)
  })

  onUnmounted(() => {
    stopPolling()
  })
</script>

<style lang="scss" scoped>
  .ai-review-page {
    .review-stats {
      .stat-card {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 16px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);

        .stat-icon {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          font-size: 22px;
          border-radius: 10px;
        }

        &.total .stat-icon {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.high .stat-icon {
          color: var(--el-color-danger);
          background: var(--el-color-danger-light-9);
        }

        &.medium .stat-icon {
          color: var(--el-color-warning);
          background: var(--el-color-warning-light-9);
        }

        &.low .stat-icon {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
        }

        .stat-info {
          .stat-value {
            font-size: 22px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .stat-label {
            margin-top: 2px;
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }

    .snippet-text {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .hit-word {
      font-weight: 500;
      color: var(--el-color-danger);
    }

    .violation-detail {
      .detail-section {
        .section-label {
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .section-content {
          padding: 12px;
          font-size: 14px;
          line-height: 1.6;
          border-radius: var(--custom-radius);
        }

        .snippet-block {
          color: var(--el-text-color-regular);
          background: var(--el-fill-color-lighter);
          border-left: 3px solid var(--el-color-danger-light-5);
        }

        .suggestion-block {
          color: var(--el-text-color-regular);
          background: var(--el-color-success-light-9);
          border-left: 3px solid var(--el-color-success-light-5);
        }
      }
    }

    .processing-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }
  }
</style>
