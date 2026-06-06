<template>
  <div class="shot-review-tab">
    <div class="status-card" :class="`status-${statusKey}`">
      <div class="status-icon">
        <ArtSvgIcon :icon="statusIcon" class="text-3xl" />
      </div>
      <div class="status-info">
        <div class="status-title">{{ statusTitle }}</div>
        <div class="status-desc">{{ statusDesc }}</div>
      </div>
    </div>

    <ElDescriptions v-if="reviewStatus" :column="1" border class="mt-4">
      <ElDescriptionsItem label="审核任务ID">{{ reviewStatus.taskId || reviewStatus.id || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="审核人">{{ reviewStatus.reviewer || reviewStatus.assigneeName || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="提交备注">{{ reviewStatus.note || reviewStatus.submitNote || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem v-if="reviewStatus.comment" label="审核意见">
        <pre class="comment-block">{{ reviewStatus.comment }}</pre>
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="reviewStatus.rejectReason" label="驳回原因">
        <ElTag type="danger">{{ reviewStatus.rejectReason }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="提交时间">{{ reviewStatus.submitTime || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="审核时间">{{ reviewStatus.reviewTime || '-' }}</ElDescriptionsItem>
    </ElDescriptions>

    <ElDivider />

    <ElSpace wrap>
      <ElButton
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />提交审核
      </ElButton>
      <ElButton
        type="warning"
        :loading="withdrawing"
        :disabled="!canWithdraw"
        @click="handleWithdraw"
      >
        <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />撤回审核
      </ElButton>
    </ElSpace>

    <ElDialog v-model="submitDialog" title="提交审核" width="480px">
      <ElForm label-width="80px">
        <ElFormItem label="提交备注">
          <ElInput v-model="submitNote" type="textarea" :rows="3" placeholder="可填写提交说明" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="submitDialog = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="confirmSubmit">确认提交</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="withdrawDialog" title="撤回审核" width="480px">
      <ElForm label-width="80px">
        <ElFormItem label="撤回原因">
          <ElInput v-model="withdrawReason" type="textarea" :rows="3" placeholder="可填写撤回原因" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="withdrawDialog = false">取消</ElButton>
        <ElButton type="warning" :loading="withdrawing" @click="confirmWithdraw">确认撤回</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useProjectStore } from '@/store/modules/project'
  import {
    useSubmitStoryboardReview,
    useWithdrawStoryboardReview,
    useStoryboardReviewStatus
  } from '@/api/queries/storyboard'

  const props = defineProps<{ storyboardId: string }>()
  const emit = defineEmits<{
    (e: 'submit-success'): void
    (e: 'withdraw-success'): void
  }>()

  const projectStore = useProjectStore()

  const { data: reviewStatus } = useStoryboardReviewStatus(() => props.storyboardId)
  const { mutateAsync: submit, isPending: submitting } = useSubmitStoryboardReview()
  const { mutateAsync: withdraw, isPending: withdrawing } = useWithdrawStoryboardReview()

  const submitDialog = ref(false)
  const submitNote = ref('')
  const withdrawDialog = ref(false)
  const withdrawReason = ref('')

  const statusKey = computed(() => {
    const s = reviewStatus.value?.status
    if (typeof s === 'number') {
      return { 1: 'draft', 2: 'pending', 3: 'approved', 4: 'rejected' }[s] || 'draft'
    }
    return String(s || 'draft')
  })

  const statusMeta: Record<string, { title: string; desc: string; icon: string }> = {
    draft: { title: '草稿', desc: '分镜处于草稿状态，可继续编辑或提交审核', icon: 'ri:edit-box-line' },
    pending: { title: '待审核', desc: '已提交审核，等待审核人处理', icon: 'ri:hourglass-line' },
    approved: { title: '已通过', desc: '审核通过，可继续后续配图与视频化流程', icon: 'ri:check-double-line' },
    rejected: { title: '已驳回', desc: '审核未通过，请根据驳回原因调整后重新提交', icon: 'ri:close-circle-line' }
  }
  const statusTitle = computed(() => statusMeta[statusKey.value]?.title || '未知状态')
  const statusDesc = computed(() => statusMeta[statusKey.value]?.desc || '')
  const statusIcon = computed(() => statusMeta[statusKey.value]?.icon || 'ri:question-line')

  const canSubmit = computed(() => ['draft', 'rejected'].includes(statusKey.value))
  const canWithdraw = computed(() => statusKey.value === 'pending')

  function handleSubmit() {
    submitNote.value = ''
    submitDialog.value = true
  }
  async function confirmSubmit() {
    try {
      await submit({
        storyboardId: props.storyboardId,
        note: submitNote.value,
        projectId: projectStore.currentProjectId
      })
      ElMessage.success('已提交审核')
      submitDialog.value = false
      emit('submit-success')
    } catch {
      ElMessage.error('提交失败')
    }
  }

  function handleWithdraw() {
    withdrawReason.value = ''
    withdrawDialog.value = true
  }
  async function confirmWithdraw() {
    try {
      await withdraw({
        storyboardId: props.storyboardId,
        reason: withdrawReason.value,
        projectId: projectStore.currentProjectId
      })
      ElMessage.success('已撤回')
      withdrawDialog.value = false
      emit('withdraw-success')
    } catch {
      ElMessage.error('撤回失败')
    }
  }
</script>

<style lang="scss" scoped>
  .status-card {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    &.status-draft {
      background: var(--el-color-info-light-9);
      color: var(--el-color-info);
    }
    &.status-pending {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }
    &.status-approved {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }
    &.status-rejected {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
    .status-title {
      font-size: 16px;
      font-weight: 600;
    }
    .status-desc {
      margin-top: 4px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
  .comment-block {
    margin: 0;
    padding: 8px 12px;
    font-size: 13px;
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }
</style>
