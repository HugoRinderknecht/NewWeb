<template>
  <div class="review-detail-page art-full-height">
    <ElRow :gutter="16" class="h-full">
      <!-- 左侧：审核内容详情 -->
      <ElCol :span="16" class="h-full">
        <ElCard class="art-table-card h-full">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">审核详情</span>
                <ElTag :type="statusTypeMap[detail.status]" size="small">
                  {{ statusLabelMap[detail.status] }}
                </ElTag>
              </div>
              <ElButton @click="handleBack">
                <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                返回
              </ElButton>
            </div>
          </template>

          <ElDescriptions :column="2" border class="mb-6">
            <ElDescriptionsItem label="内容标题">{{ detail.title }}</ElDescriptionsItem>
            <ElDescriptionsItem label="内容类型">
              <ElTag :type="typeTagMap[detail.typeValue]" size="small">
                {{ typeLabelMap[detail.typeValue] }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="提交人">{{ detail.submitter }}</ElDescriptionsItem>
            <ElDescriptionsItem label="提交时间">{{ detail.submitTime }}</ElDescriptionsItem>
            <ElDescriptionsItem label="当前审批人">{{ detail.approver }}</ElDescriptionsItem>
            <ElDescriptionsItem label="优先级">
              <ElTag :type="priorityTypeMap[detail.priority]" size="small">
                {{ priorityLabelMap[detail.priority] }}
              </ElTag>
            </ElDescriptionsItem>
          </ElDescriptions>

          <!-- 内容预览 -->
          <div class="content-preview mb-6">
            <h4 class="text-base font-medium mb-3">内容预览</h4>
            <div class="preview-box">
              <div
                v-if="detail.typeValue === 'video' || detail.typeValue === 'animation'"
                class="video-preview"
              >
                <div class="preview-placeholder flex-cc">
                  <ArtSvgIcon icon="ri:movie-line" class="text-4xl text-g-400 mb-2" />
                  <span class="text-g-500">视频预览区域</span>
                </div>
              </div>
              <div v-else-if="detail.typeValue === 'design'" class="image-preview">
                <div class="preview-placeholder flex-cc">
                  <ArtSvgIcon icon="ri:image-line" class="text-4xl text-g-400 mb-2" />
                  <span class="text-g-500">设计稿预览区域</span>
                </div>
              </div>
              <div v-else-if="detail.typeValue === 'audio'" class="audio-preview">
                <div class="preview-placeholder flex-cc">
                  <ArtSvgIcon icon="ri:music-line" class="text-4xl text-g-400 mb-2" />
                  <span class="text-g-500">音频预览区域</span>
                </div>
              </div>
              <div v-else class="text-preview">
                <ElInput
                  v-model="detail.content"
                  type="textarea"
                  :rows="8"
                  readonly
                  resize="none"
                />
              </div>
            </div>
          </div>

          <!-- 审核历史 -->
          <div class="review-history">
            <h4 class="text-base font-medium mb-3">审核历史</h4>
            <ElTimeline>
              <ElTimelineItem
                v-for="(item, index) in historyList"
                :key="index"
                :type="historyTypeMap[item.action]"
                :icon="historyIconMap[item.action]"
              >
                <div class="history-item">
                  <div class="flex-cb">
                    <span class="font-medium">{{ item.actionText }}</span>
                    <span class="text-xs text-g-400">{{ item.time }}</span>
                  </div>
                  <div class="text-sm text-g-500 mt-1">
                    <span>{{ item.user }}</span>
                    <span v-if="item.comment" class="ml-2">批注: {{ item.comment }}</span>
                  </div>
                </div>
              </ElTimelineItem>
            </ElTimeline>
          </div>
        </ElCard>
      </ElCol>

      <!-- 右侧：审批操作 -->
      <ElCol :span="8" class="h-full">
        <ElCard class="art-table-card h-full">
          <template #header>
            <span class="text-lg font-medium">审批操作</span>
          </template>

          <div v-if="detail.status === 'pending'" class="review-actions">
            <ElForm label-position="top">
              <ElFormItem label="审核意见" required>
                <ElInput
                  v-model="reviewForm.comment"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入审核意见"
                />
              </ElFormItem>

              <ElFormItem label="添加批注">
                <ElInput
                  v-model="reviewForm.annotation"
                  type="textarea"
                  :rows="3"
                  placeholder="可添加批注（可选）"
                />
              </ElFormItem>

              <ElFormItem label="附件">
                <ElUpload
                  action="#"
                  :auto-upload="false"
                  :file-list="reviewForm.fileList"
                  @change="handleFileChange"
                >
                  <ElButton type="primary" plain>
                    <ArtSvgIcon icon="ri:upload-2-line" class="mr-1" />
                    上传附件
                  </ElButton>
                  <template #tip>
                    <div class="el-upload__tip">支持上传图片、文档等附件</div>
                  </template>
                </ElUpload>
              </ElFormItem>
            </ElForm>

            <ElDivider />

            <div class="action-buttons">
              <ElButton type="success" class="w-full mb-3" @click="handleApprove">
                <ArtSvgIcon icon="ri:check-line" class="mr-1" />
                通过
              </ElButton>
              <ElButton type="danger" class="w-full mb-3" @click="handleReject">
                <ArtSvgIcon icon="ri:close-line" class="mr-1" />
                驳回
              </ElButton>
              <div class="flex gap-2">
                <ElButton type="warning" class="flex-1" @click="handleTransfer">
                  <ArtSvgIcon icon="ri:exchange-line" class="mr-1" />
                  转审
                </ElButton>
                <ElButton type="info" class="flex-1" @click="handleAddSign">
                  <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />
                  加签
                </ElButton>
              </div>
            </div>
          </div>

          <div v-else class="review-result">
            <ElResult
              :icon="
                detail.status === 'approved'
                  ? 'success'
                  : detail.status === 'rejected'
                    ? 'error'
                    : 'info'
              "
              :title="statusLabelMap[detail.status]"
              :sub-title="`最终审批人: ${detail.approver}`"
            />
            <ElDescriptions :column="1" border>
              <ElDescriptionsItem label="审批意见">{{
                detail.finalComment || '无'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="审批时间">{{
                detail.approveTime || '-'
              }}</ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 转审弹窗 -->
    <ElDialog
      v-model="transferDialogVisible"
      title="转审"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm :model="transferForm" label-width="80px">
        <ElFormItem label="转审给" required>
          <ElSelect
            v-model="transferForm.targetUser"
            placeholder="请选择审批人"
            style="width: 100%"
          >
            <ElOption
              v-for="item in approverOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="转审原因">
          <ElInput
            v-model="transferForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入转审原因（可选）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="transferDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleTransferSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 加签弹窗 -->
    <ElDialog
      v-model="addSignDialogVisible"
      title="加签"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm :model="addSignForm" label-width="100px">
        <ElFormItem label="加签人" required>
          <ElSelect v-model="addSignForm.targetUser" placeholder="请选择加签人" style="width: 100%">
            <ElOption
              v-for="item in approverOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="加签方式" required>
          <ElRadioGroup v-model="addSignForm.mode">
            <ElRadio value="before">前加签（在我之前审批）</ElRadio>
            <ElRadio value="after">后加签（在我之后审批）</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="加签原因">
          <ElInput
            v-model="addSignForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入加签原因（可选）"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addSignDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddSignSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import { fetchGetReviewDetail } from '@/api/review'

  defineOptions({ name: 'ReviewDetail' })

  type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'recalled'
  type ContentType = 'animation' | 'video' | 'audio' | 'script' | 'design' | 'budget'
  type Priority = 'high' | 'medium' | 'low'
  type HistoryAction = 'submit' | 'approve' | 'reject' | 'transfer' | 'addSign'

  interface HistoryItem {
    action: HistoryAction
    actionText: string
    user: string
    time: string
    comment?: string
  }

  interface ReviewDetailData {
    id: number
    title: string
    type: string
    typeValue: ContentType
    submitter: string
    submitTime: string
    approver: string
    status: ReviewStatus
    priority: Priority
    content: string
    finalComment?: string
    approveTime?: string
  }

  const router = useRouter()
  const route = useRoute()

  const transferDialogVisible = ref(false)
  const addSignDialogVisible = ref(false)

  const reviewForm = reactive({
    comment: '',
    annotation: '',
    fileList: [] as UploadFile[]
  })

  const transferForm = reactive({
    targetUser: '',
    reason: ''
  })

  const addSignForm = reactive({
    targetUser: '',
    mode: 'before' as 'before' | 'after',
    reason: ''
  })

  const approverOptions = [
    { label: '张三', value: 'zhangsan' },
    { label: '李四', value: 'lisi' },
    { label: '王五', value: 'wangwu' },
    { label: '赵六', value: 'zhaoliu' }
  ]

  const statusTypeMap: Record<ReviewStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> =
    {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      recalled: 'info'
    }

  const statusLabelMap: Record<ReviewStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    recalled: '已撤回'
  }

  const typeTagMap: Record<ContentType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    animation: 'primary',
    video: 'success',
    audio: 'warning',
    script: 'info',
    design: 'danger',
    budget: 'primary'
  }

  const typeLabelMap: Record<ContentType, string> = {
    animation: '动画',
    video: '视频',
    audio: '音频',
    script: '剧本',
    design: '设计',
    budget: '预算'
  }

  const priorityTypeMap: Record<Priority, 'danger' | 'warning' | 'info'> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }

  const priorityLabelMap: Record<Priority, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }

  const historyTypeMap: Record<
    HistoryAction,
    'primary' | 'success' | 'danger' | 'warning' | 'info'
  > = {
    submit: 'primary',
    approve: 'success',
    reject: 'danger',
    transfer: 'warning',
    addSign: 'info'
  }

  const historyIconMap: Record<HistoryAction, string> = {
    submit: 'ri:send-plane-line',
    approve: 'ri:check-line',
    reject: 'ri:close-line',
    transfer: 'ri:exchange-line',
    addSign: 'ri:user-add-line'
  }

  const detail = reactive<ReviewDetailData>({
    id: Number(route.query.id) || 1,
    title: '',
    type: '',
    typeValue: 'animation',
    submitter: '',
    submitTime: '',
    approver: '',
    status: 'pending',
    priority: 'medium',
    content: '',
    finalComment: '',
    approveTime: ''
  })

  const historyList = ref<HistoryItem[]>([])

  const loadDetail = async () => {
    const id = route.query.id as string
    if (!id) return
    try {
      const res = await fetchGetReviewDetail(id)
      if (res) {
        Object.assign(detail, {
          id: (res as any).id || detail.id,
          title: (res as any).title || '',
          type: (res as any).type || '',
          typeValue: (res as any).typeValue || 'animation',
          submitter: (res as any).submitter || '',
          submitTime: (res as any).submitTime || '',
          approver: (res as any).approver || '',
          status: (res as any).status || 'pending',
          priority: (res as any).priority || 'medium',
          content: (res as any).content || '',
          finalComment: (res as any).finalComment || '',
          approveTime: (res as any).approveTime || ''
        })
        historyList.value = (res as any).historyList || []
      }
    } catch {
      // keep default empty state
    }
  }

  onMounted(() => {
    loadDetail()
  })

  const handleBack = () => {
    router.back()
  }

  const handleFileChange = (file: UploadFile) => {
    reviewForm.fileList.push(file)
  }

  const handleApprove = () => {
    if (!reviewForm.comment.trim()) {
      ElMessage.warning('请输入审核意见')
      return
    }
    ElMessageBox.confirm(`确定要通过「${detail.title}」吗？`, '审批确认', {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success'
    }).then(() => {
      detail.status = 'approved'
      detail.approver = '当前用户'
      detail.finalComment = reviewForm.comment
      detail.approveTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
      historyList.value.push({
        action: 'approve',
        actionText: '审批通过',
        user: '当前用户',
        time: detail.approveTime,
        comment: reviewForm.comment
      })
      if (reviewForm.annotation) {
        historyList.value.push({
          action: 'addSign',
          actionText: '添加批注',
          user: '当前用户',
          time: detail.approveTime,
          comment: reviewForm.annotation
        })
      }
      ElMessage.success('审批通过')
    })
  }

  const handleReject = () => {
    if (!reviewForm.comment.trim()) {
      ElMessage.warning('请输入驳回原因')
      return
    }
    ElMessageBox.confirm(`确定要驳回「${detail.title}」吗？`, '驳回确认', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      detail.status = 'rejected'
      detail.approver = '当前用户'
      detail.finalComment = reviewForm.comment
      detail.approveTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
      historyList.value.push({
        action: 'reject',
        actionText: '审批驳回',
        user: '当前用户',
        time: detail.approveTime,
        comment: reviewForm.comment
      })
      ElMessage.success('已驳回')
    })
  }

  const handleTransfer = () => {
    transferForm.targetUser = ''
    transferForm.reason = ''
    transferDialogVisible.value = true
  }

  const handleTransferSubmit = () => {
    if (!transferForm.targetUser) {
      ElMessage.warning('请选择转审人')
      return
    }
    const target = approverOptions.find((o) => o.value === transferForm.targetUser)
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    detail.approver = target?.label || transferForm.targetUser
    historyList.value.push({
      action: 'transfer',
      actionText: '转审',
      user: '当前用户',
      time: now,
      comment: `转审给 ${target?.label || transferForm.targetUser}${transferForm.reason ? '，原因：' + transferForm.reason : ''}`
    })
    ElMessage.success(`已转审给 ${target?.label || transferForm.targetUser}`)
    transferDialogVisible.value = false
  }

  const handleAddSign = () => {
    addSignForm.targetUser = ''
    addSignForm.mode = 'before'
    addSignForm.reason = ''
    addSignDialogVisible.value = true
  }

  const handleAddSignSubmit = () => {
    if (!addSignForm.targetUser) {
      ElMessage.warning('请选择加签人')
      return
    }
    const target = approverOptions.find((o) => o.value === addSignForm.targetUser)
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    historyList.value.push({
      action: 'addSign',
      actionText: `${addSignForm.mode === 'before' ? '前' : '后'}加签`,
      user: '当前用户',
      time: now,
      comment: `加签给 ${target?.label || addSignForm.targetUser}${addSignForm.reason ? '，原因：' + addSignForm.reason : ''}`
    })
    ElMessage.success(
      `已向 ${target?.label || addSignForm.targetUser} 发起${addSignForm.mode === 'before' ? '前' : '后'}加签`
    )
    addSignDialogVisible.value = false
  }
</script>

<style lang="scss" scoped>
  .review-detail-page {
    :deep(.el-row) {
      height: 100%;
    }

    :deep(.el-col) {
      height: 100%;
    }
  }

  .content-preview {
    .preview-box {
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--custom-radius);
      overflow: hidden;
    }

    .preview-placeholder {
      height: 240px;
      background: var(--el-fill-color-lighter);
      flex-direction: column;
    }

    .text-preview {
      padding: 12px;
    }
  }

  .review-history {
    .history-item {
      padding: 4px 0;
    }
  }

  .action-buttons {
    .el-button {
      justify-content: center;
    }
  }

  .review-result {
    :deep(.el-result) {
      padding: 24px 0;
    }
  }
</style>
