<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <div class="error-boundary__content">
      <p class="error-boundary__title">{{ title }}</p>
      <p class="error-boundary__desc">{{ description }}</p>
      <div class="error-boundary__actions">
        <ElButton type="primary" @click="handleReset" v-ripple>重试</ElButton>
        <ElButton @click="handleReload" v-ripple>刷新页面</ElButton>
      </div>
      <details v-if="showDetails && errorInfo" class="error-boundary__details">
        <summary>错误详情</summary>
        <pre>{{ errorInfo }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onErrorCaptured } from 'vue'
  import { ElButton } from 'element-plus'
  import { showError } from '@/utils/http/error'

  interface Props {
    /** 错误标题 */
    title?: string
    /** 错误描述 */
    description?: string
    /** 是否显示错误详情 */
    showDetails?: boolean
    /** 是否在捕获错误时调用全局错误提示 */
    showErrorMessage?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '页面出现异常',
    description: '抱歉，组件渲染时发生了错误，请尝试刷新页面或返回首页。',
    showDetails: import.meta.env.DEV,
    showErrorMessage: true
  })

  const emit = defineEmits<{
    (e: 'error', error: Error, info: string): void
    (e: 'reset'): void
  }>()

  const hasError = ref(false)
  const errorInfo = ref('')

  onErrorCaptured((error: Error, _instance, info: string) => {
    hasError.value = true
    errorInfo.value = error?.stack || `${error?.name || 'Error'}: ${error?.message || '未知错误'}\n${info}`

    // 输出到控制台方便调试
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] 捕获到组件错误:', error, info)

    if (props.showErrorMessage) {
      showError(error, true)
    }

    emit('error', error, info)

    // 阻止错误继续向上传播，避免整个应用白屏
    return false
  })

  /** 重试：重置错误状态，重新渲染子组件 */
  const handleReset = () => {
    hasError.value = false
    errorInfo.value = ''
    emit('reset')
  }

  /** 刷新页面 */
  const handleReload = () => {
    window.location.reload()
  }
</script>

<style scoped>
  .error-boundary {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    width: 100%;
    padding: 32px 16px;
  }

  .error-boundary__content {
    text-align: center;
    max-width: 480px;
  }

  .error-boundary__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    margin: 0 0 12px;
  }

  .error-boundary__desc {
    font-size: 14px;
    color: var(--el-text-color-regular, #606266);
    line-height: 1.6;
    margin: 0 0 20px;
  }

  .error-boundary__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .error-boundary__details {
    margin-top: 20px;
    text-align: left;
    background: var(--el-fill-color-light, #f5f7fa);
    border-radius: 6px;
    padding: 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399);
    overflow: auto;
    max-height: 200px;
  }

  .error-boundary__details summary {
    cursor: pointer;
    margin-bottom: 8px;
    user-select: none;
  }

  .error-boundary__details pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
</style>
