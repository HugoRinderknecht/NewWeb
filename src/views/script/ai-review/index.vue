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
            <ElTag type="info" size="small">剧本AI违规检测</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索剧本名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterLevel" placeholder="风险等级" clearable style="width: 140px">
              <ElOption
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElSelect v-model="filterType" placeholder="违规类型" clearable style="width: 140px">
              <ElOption
                v-for="item in violationOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ScriptUpload
              button-text="导入审核"
              button-type="info"
              dialog-title="导入剧本进行AI审核"
              accept-types=".doc,.docx,.pdf,.txt,.fountain"
              @success="handleImportForReview"
            />
          </ElSpace>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="review-stats mb-6">
        <ElRow :gutter="16">
          <ElCol :span="6" :xs="12">
            <div class="stat-card total">
              <div class="stat-icon">
                <ArtSvgIcon icon="ri:file-list-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ reviewList.length }}</div>
                <div class="stat-label">审核总数</div>
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
                <div class="stat-label">低风险/通过</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <div class="scrollable-content">
        <ArtTable
          :data="pagedList"
          :columns="columns"
          :pagination="pagination"
          v-loading="loading"
          @pagination:size-change="handleSizeChange"
          @pagination:current-change="handleCurrentChange"
        >
          <template #default>
            <ElTableColumn label="剧本信息" min-width="240">
              <template #default="scope">
                <div class="flex items-center gap-3">
                  <div class="script-icon">
                    <ArtSvgIcon icon="ri:book-open-line" />
                  </div>
                  <div>
                    <div class="font-medium">{{ scope.row.scriptName }}</div>
                    <div class="text-xs text-g-400">{{ scope.row.projectName }}</div>
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="风险等级" width="120">
              <template #default="scope">
                <ElTag :type="getLevelTag(scope.row.level)" size="small">
                  <ArtSvgIcon :icon="getLevelIcon(scope.row.level)" class="mr-1" />
                  {{ getLevelLabel(scope.row.level) }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="违规类型" width="140">
              <template #default="scope">
                <ElSpace wrap>
                  <ElTag
                    v-for="(v, idx) in scope.row.violations.slice(0, 2)"
                    :key="idx"
                    :type="getViolationTag(v.type)"
                    size="small"
                  >
                    {{ getViolationLabel(v.type) }}
                  </ElTag>
                  <ElTag v-if="scope.row.violations.length > 2" type="info" size="small">
                    +{{ scope.row.violations.length - 2 }}
                  </ElTag>
                </ElSpace>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="violationCount" label="违规条数" width="100">
              <template #default="scope">
                <ElBadge :value="scope.row.violationCount" :type="getLevelTag(scope.row.level)" />
              </template>
            </ElTableColumn>
            <ElTableColumn prop="reviewTime" label="审核时间" width="160" sortable />
            <ElTableColumn label="状态" width="100">
              <template #default="scope">
                <ElTag :type="scope.row.isHandled ? 'success' : 'warning'" size="small">
                  {{ scope.row.isHandled ? '已处理' : '待处理' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="200" fixed="right">
              <template #default="scope">
                <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  查看详情
                </ElButton>
                <ElButton
                  v-if="!scope.row.isHandled"
                  type="success"
                  link
                  size="small"
                  @click="handleMarkHandled(scope.row)"
                >
                  <ArtSvgIcon icon="ri:check-line" class="mr-1" />
                  标记处理
                </ElButton>
              </template>
            </ElTableColumn>
          </template>
        </ArtTable>
      </div>
    </ElCard>

    <!-- 违规详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="违规详情"
      width="720px"
      align-center
      destroy-on-close
    >
      <div v-if="currentReview" class="violation-detail">
        <ElDescriptions :column="2" border class="mb-6">
          <ElDescriptionsItem label="剧本名称">{{ currentReview.scriptName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="所属项目">{{ currentReview.projectName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="风险等级">
            <ElTag :type="getLevelTag(currentReview.level)" size="small">
              {{ getLevelLabel(currentReview.level) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="审核时间">{{ currentReview.reviewTime }}</ElDescriptionsItem>
        </ElDescriptions>

        <h4 class="text-base font-medium mb-4">违规明细</h4>
        <div class="violation-list">
          <div
            v-for="(item, idx) in currentReview.violations"
            :key="idx"
            class="violation-item"
            :class="item.level"
          >
            <div class="violation-header flex items-center gap-2 mb-2">
              <ArtSvgIcon :icon="getViolationIcon(item.type)" class="text-lg" />
              <span class="font-medium">{{ getViolationLabel(item.type) }}</span>
              <ElTag :type="getLevelTag(item.level)" size="small">{{
                getLevelLabel(item.level)
              }}</ElTag>
            </div>
            <div class="violation-content">
              <div class="violation-position text-sm text-g-400 mb-1">
                位置：第 {{ item.episode }} 集 / 第 {{ item.scene }} 场 / 第 {{ item.paragraph }} 段
              </div>
              <ElAlert :type="alertTypeMap[item.level]" :closable="false" class="mb-2">
                <template #title>
                  <div class="font-medium">原文内容</div>
                </template>
                <div class="text-sm">{{ item.originalText }}</div>
              </ElAlert>
              <div class="suggestion text-sm">
                <span class="font-medium">修改建议：</span>{{ item.suggestion }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="detailDialogVisible = false">关闭</ElButton>
        <ElButton
          v-if="currentReview && !currentReview.isHandled"
          type="primary"
          @click="handleMarkHandled(currentReview)"
        >
          标记为已处理
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { fetchGetScriptDetail, fetchReviewScriptContent } from '@/api/script'
  import { fetchCreateReview, fetchReviewDecision } from '@/api/review'

  defineOptions({ name: 'AiReview' })

  type RiskLevel = 'high' | 'medium' | 'low' | 'pass'
  type ViolationType =
    | 'sensitive'
    | 'political'
    | 'pornography'
    | 'violence'
    | 'copyright'
    | 'other'

  interface ViolationItem {
    type: ViolationType
    level: RiskLevel
    episode: number
    scene: number
    paragraph: number
    originalText: string
    suggestion: string
  }

  interface ReviewItem {
    id: string
    scriptName: string
    projectName: string
    level: RiskLevel
    violations: ViolationItem[]
    violationCount: number
    reviewTime: string
    isHandled: boolean
  }

  const searchQuery = ref('')
  const filterLevel = ref<RiskLevel | ''>('')
  const filterType = ref<ViolationType | ''>('')
  const detailDialogVisible = ref(false)
  const currentReview = ref<ReviewItem | null>(null)
  const loading = ref(false)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const levelOptions = [
    { label: '高风险', value: 'high' },
    { label: '中风险', value: 'medium' },
    { label: '低风险', value: 'low' },
    { label: '通过', value: 'pass' }
  ]

  const violationOptions = [
    { label: '敏感信息', value: 'sensitive' },
    { label: '政治违规', value: 'political' },
    { label: '色情低俗', value: 'pornography' },
    { label: '暴力恐怖', value: 'violence' },
    { label: '版权风险', value: 'copyright' },
    { label: '其他', value: 'other' }
  ]

  const levelTagMap: Record<RiskLevel, 'danger' | 'warning' | 'info' | 'success'> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
    pass: 'success'
  }

  const alertTypeMap: Record<RiskLevel, 'error' | 'warning' | 'info' | 'success'> = {
    high: 'error',
    medium: 'warning',
    low: 'info',
    pass: 'success'
  }

  const levelLabelMap: Record<RiskLevel, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
    pass: '通过'
  }

  const levelIconMap: Record<RiskLevel, string> = {
    high: 'ri:error-warning-line',
    medium: 'ri:alert-line',
    low: 'ri:information-line',
    pass: 'ri:shield-check-line'
  }

  const violationTagMap: Record<ViolationType, 'danger' | 'warning' | 'info' | 'success'> = {
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

  const violationIconMap: Record<ViolationType, string> = {
    sensitive: 'ri:lock-line',
    political: 'ri:government-line',
    pornography: 'ri:forbid-line',
    violence: 'ri:sword-line',
    copyright: 'ri:copyright-line',
    other: 'ri:question-line'
  }

  const getLevelTag = (level: RiskLevel) => levelTagMap[level]
  const getLevelLabel = (level: RiskLevel) => levelLabelMap[level]
  const getLevelIcon = (level: RiskLevel) => levelIconMap[level]
  const getViolationTag = (type: ViolationType) => violationTagMap[type]
  const getViolationLabel = (type: ViolationType) => violationLabelMap[type]
  const getViolationIcon = (type: ViolationType) => violationIconMap[type]

  const columns: ColumnOption[] = [
    { prop: 'scriptName', label: '剧本信息', minWidth: 240 },
    { prop: 'level', label: '风险等级', width: 120 },
    { prop: 'violations', label: '违规类型', width: 140 },
    { prop: 'violationCount', label: '违规条数', width: 100 },
    { prop: 'reviewTime', label: '审核时间', width: 160, sortable: true },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const highRiskCount = computed(() => reviewList.value.filter((i) => i.level === 'high').length)
  const mediumRiskCount = computed(
    () => reviewList.value.filter((i) => i.level === 'medium').length
  )
  const lowRiskCount = computed(
    () => reviewList.value.filter((i) => i.level === 'low' || i.level === 'pass').length
  )

  const filteredList = computed(() => {
    let result = reviewList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.scriptName.toLowerCase().includes(q) || item.projectName.toLowerCase().includes(q)
      )
    }

    if (filterLevel.value) {
      result = result.filter((item) => item.level === filterLevel.value)
    }

    if (filterType.value) {
      result = result.filter((item) => item.violations.some((v) => v.type === filterType.value))
    }

    return result
  })

  const pagedList = computed(() => {
    const list = filteredList.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredList, (list) => {
    pagination.total = list.length
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleViewDetail = (row: ReviewItem) => {
    currentReview.value = row
    detailDialogVisible.value = true
  }

  const handleImportForReview = async (data: { file: File; name: string; content?: string }) => {
    ElMessage.success(`剧本「${data.name}」导入成功，开始AI审核...`)
    try {
      await fetchCreateReview({
        scriptName: data.name.replace(/\.[^/.]+$/, ''),
        projectName: '导入审核',
        content: data.content || ''
      } as any)
      await loadReviewList(currentProjectId.value)
      ElMessage.success('AI审核完成')
    } catch {
      ElMessage.error('AI审核提交失败')
    }
  }

  const projectStore = useScriptProjectStore()

  const currentProjectId = computed(() => projectStore.currentProjectId)

  const projectList = computed(() => projectStore.projectList)

  const reviewList = ref<ReviewItem[]>([])

  const loadReviewList = async (projectId: string) => {
    loading.value = true
    try {
      const res = await fetchReviewScriptContent(String(projectId), String(projectId))
      const detail = res as any
      if (detail?.violations && Array.isArray(detail.violations)) {
        reviewList.value = detail.violations as ReviewItem[]
      } else if (detail?.review && Array.isArray(detail.review)) {
        reviewList.value = detail.review as ReviewItem[]
      } else if (detail?.reviews && Array.isArray(detail.reviews)) {
        reviewList.value = detail.reviews as ReviewItem[]
      } else if (Array.isArray(detail)) {
        reviewList.value = detail as ReviewItem[]
      } else {
        const scriptRes = await fetchGetScriptDetail(String(projectId))
        const scriptDetail = scriptRes as any
        if (scriptDetail?.review && Array.isArray(scriptDetail.review)) {
          reviewList.value = scriptDetail.review as ReviewItem[]
        } else if (scriptDetail?.reviews && Array.isArray(scriptDetail.reviews)) {
          reviewList.value = scriptDetail.reviews as ReviewItem[]
        } else {
          reviewList.value = []
        }
      }
    } catch {
      try {
        const res = await fetchGetScriptDetail(String(projectId))
        const detail = res as any
        if (detail?.review && Array.isArray(detail.review)) {
          reviewList.value = detail.review as ReviewItem[]
        } else if (detail?.reviews && Array.isArray(detail.reviews)) {
          reviewList.value = detail.reviews as ReviewItem[]
        } else {
          reviewList.value = []
        }
      } catch {
        reviewList.value = []
      }
    } finally {
      pagination.current = 1
      loading.value = false
    }
  }

  const handleProjectChange = (projectId: string) => {
    projectStore.setCurrentProject(projectId)
    loadReviewList(projectId)
  }

  const handleProjectRefresh = () => {
    loadReviewList(currentProjectId.value)
    ElMessage.success('数据已刷新')
  }

  onMounted(() => {
    loadReviewList(currentProjectId.value)
  })

  const handleMarkHandled = (row: ReviewItem) => {
    ElMessageBox.confirm(`确定要将「${row.scriptName}」标记为已处理吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    }).then(async () => {
      try {
        await fetchReviewDecision({
          reviewId: String(row.id),
          decision: 'handled'
        } as any)
        const item = reviewList.value.find((i) => i.id === row.id)
        if (item) item.isHandled = true
        if (currentReview.value?.id === row.id) {
          currentReview.value.isHandled = true
        }
        ElMessage.success('已标记为已处理')
      } catch {
        ElMessage.error('标记处理失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .review-stats {
    .stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      &.total .stat-icon {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.high .stat-icon {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }

      &.medium .stat-icon {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.low .stat-icon {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }
  }

  .script-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    flex-shrink: 0;
  }

  .scrollable-content {
    max-height: calc(100vh - 360px);
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--el-text-color-secondary);
    }
  }

  .violation-detail {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--el-text-color-secondary);
    }

    .violation-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .violation-item {
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      border-left: 4px solid var(--el-color-info);

      &.high {
        border-left-color: var(--el-color-danger);
      }

      &.medium {
        border-left-color: var(--el-color-warning);
      }

      &.low {
        border-left-color: var(--el-color-info);
      }

      .violation-header {
        color: var(--el-text-color-primary);
      }

      .suggestion {
        color: var(--el-text-color-secondary);
        padding: 8px;
        background: var(--el-bg-color);
        border-radius: var(--custom-radius);
      }
    }
  }
</style>
