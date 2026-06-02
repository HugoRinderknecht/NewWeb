<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
  interface SearchParams {
    title?: string
    type?: string
    level?: string
    isRead?: boolean
    senderName?: string
    page?: number
    limit?: number
  }

  interface Props {
    modelValue: SearchParams
  }
  interface Emits {
    (e: 'update:modelValue', value: SearchParams): void
    (e: 'search', params: SearchParams): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const rules = {}

  const formItems = computed(() => [
    {
      label: '通知标题',
      key: 'title',
      type: 'input',
      placeholder: '请输入通知标题',
      clearable: true
    },
    {
      label: '通知类型',
      key: 'type',
      type: 'select',
      props: {
        placeholder: '请选择通知类型',
        options: [
          { label: '系统通知', value: 'system' },
          { label: '任务通知', value: 'task' },
          { label: '审核通知', value: 'review' },
          { label: '项目通知', value: 'project' },
          { label: '评论通知', value: 'comment' }
        ]
      }
    },
    {
      label: '通知级别',
      key: 'level',
      type: 'select',
      props: {
        placeholder: '请选择通知级别',
        options: [
          { label: '信息', value: 'info' },
          { label: '警告', value: 'warning' },
          { label: '错误', value: 'error' },
          { label: '成功', value: 'success' }
        ]
      }
    },
    {
      label: '已读状态',
      key: 'isRead',
      type: 'select',
      props: {
        placeholder: '请选择已读状态',
        options: [
          { label: '已读', value: true },
          { label: '未读', value: false }
        ]
      }
    },
    {
      label: '发送者',
      key: 'senderName',
      type: 'input',
      props: { placeholder: '请输入发送者姓名' }
    }
  ])

  function handleReset() {
    emit('reset')
  }

  async function handleSearch(params: SearchParams) {
    await searchBarRef.value.validate()
    emit('search', params)
  }
</script>
