<template>
  <div class="notice-remind-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">提醒设置</span>
          <ElButton type="primary" @click="handleSave">保存设置</ElButton>
        </div>
      </template>
      <ElForm :model="form" label-width="150px" class="max-w-2xl">
        <ElFormItem label="任务到期提醒">
          <ElSwitch v-model="form.taskRemind" />
        </ElFormItem>
        <ElFormItem label="审核通知提醒">
          <ElSwitch v-model="form.reviewRemind" />
        </ElFormItem>
        <ElFormItem label="系统公告提醒">
          <ElSwitch v-model="form.systemRemind" />
        </ElFormItem>
        <ElFormItem label="提醒方式">
          <ElCheckboxGroup v-model="form.methods">
            <ElCheckbox label="站内通知" />
            <ElCheckbox label="邮件" />
            <ElCheckbox label="短信" />
          </ElCheckboxGroup>
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import {
    useDndSettings,
    useSubscriptions,
    useUpdateDndSettings,
    useAddSubscription,
    useCancelSubscription
  } from '@/api/queries'

  defineOptions({ name: 'NoticeRemind' })

  const form = reactive({
    taskRemind: true,
    reviewRemind: true,
    systemRemind: false,
    methods: ['站内通知'] as string[]
  })

  // 查询 hooks - 自动加载数据
  const { data: dndSettings } = useDndSettings()
  const { data: subscriptions } = useSubscriptions()

  // 变更 hooks
  const { mutateAsync: updateDndSettings } = useUpdateDndSettings()
  const { mutateAsync: addSubscription } = useAddSubscription()
  const { mutateAsync: cancelSubscription } = useCancelSubscription()

  // 从查询结果同步表单数据
  watch(
    () => dndSettings.value,
    (dnd) => {
      if (dnd) {
        form.systemRemind = !(dnd as any).enabled
      }
    },
    { immediate: true }
  )

  watch(
    () => subscriptions.value,
    (subs) => {
      const subList = Array.isArray(subs) ? subs : []
      subList.forEach((sub: any) => {
        if (sub.type === 'task' || sub.name === '任务到期提醒') {
          form.taskRemind = sub.enabled
        } else if (sub.type === 'review' || sub.name === '审核通知提醒') {
          form.reviewRemind = sub.enabled
        } else if (sub.type === 'system' || sub.name === '系统公告提醒') {
          form.systemRemind = sub.enabled
        }
      })
    },
    { immediate: true }
  )

  const saving = ref(false)

  const handleSave = async () => {
    saving.value = true
    try {
      await updateDndSettings({
        enabled: !form.systemRemind,
        startTime: (dndSettings.value as any)?.startTime || '22:00',
        endTime: (dndSettings.value as any)?.endTime || '08:00',
        timezone: (dndSettings.value as any)?.timezone || 'Asia/Shanghai'
      })

      const subUpdates = [
        { type: 'task', name: '任务到期提醒', enabled: form.taskRemind },
        { type: 'review', name: '审核通知提醒', enabled: form.reviewRemind },
        { type: 'system', name: '系统公告提醒', enabled: form.systemRemind }
      ]

      const subList = Array.isArray(subscriptions.value) ? subscriptions.value : []
      for (const sub of subUpdates) {
        const existing = subList.find((s: any) => s.type === sub.type)
        if (existing) {
          if (!sub.enabled) {
            try {
              await cancelSubscription((existing as any).id)
            } catch {
              // 取消订阅失败
            }
          }
        } else if (sub.enabled) {
          try {
            await addSubscription({ type: sub.type, name: sub.name })
          } catch {
            // 添加订阅失败
          }
        }
      }

      ElMessage.success('设置已保存')
    } catch {
      ElMessage.error('保存设置失败')
    } finally {
      saving.value = false
    }
  }
</script>
