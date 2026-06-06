<template>
  <div class="shot-status-tag">
    <ElTag :type="tagType" size="small" :effect="active ? 'dark' : 'light'">
      <ArtSvgIcon :icon="iconName" class="mr-1" />
      {{ label }}
    </ElTag>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    status?: number | string
    active?: boolean
  }
  const props = withDefaults(defineProps<Props>(), { active: false })

  const STATUS_MAP: Record<number, { label: string; type: string; icon: string }> = {
    1: { label: '草稿', type: 'info', icon: 'ri:edit-box-line' },
    2: { label: '待审核', type: 'warning', icon: 'ri:hourglass-line' },
    3: { label: '已通过', type: 'success', icon: 'ri:check-double-line' },
    4: { label: '已驳回', type: 'danger', icon: 'ri:close-circle-line' }
  }
  const STRING_MAP: Record<string, { label: string; type: string; icon: string }> = {
    draft: { label: '草稿', type: 'info', icon: 'ri:edit-box-line' },
    pending: { label: '待审核', type: 'warning', icon: 'ri:hourglass-line' },
    approved: { label: '已通过', type: 'success', icon: 'ri:check-double-line' },
    rejected: { label: '已驳回', type: 'danger', icon: 'ri:close-circle-line' },
    designing: { label: '设计中', type: 'primary', icon: 'ri:palette-line' },
    completed: { label: '已完成', type: 'success', icon: 'ri:check-double-line' },
    archived: { label: '已归档', type: 'info', icon: 'ri:archive-line' }
  }

  const meta = computed(() => {
    if (typeof props.status === 'number') {
      return STATUS_MAP[props.status] || STATUS_MAP[1]
    }
    return STRING_MAP[String(props.status || 'draft')] || STRING_MAP.draft
  })
  const label = computed(() => meta.value.label)
  const tagType = computed(() => meta.value.type as any)
  const iconName = computed(() => meta.value.icon)
</script>
