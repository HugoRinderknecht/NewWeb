<template>
  <div class="art-loading-state">
    <!-- 加载中：首次加载显示骨架屏 -->
    <template v-if="isLoading">
      <div v-if="variant === 'skeleton'" class="art-loading-state__skeleton">
        <ElSkeleton :rows="rows" :animated="animated" />
      </div>
      <div v-else-if="variant === 'spinner'" class="art-loading-state__spinner flex-cc">
        <ElIcon class="is-loading" :size="size">
          <Loading />
        </ElIcon>
        <span v-if="loadingText" class="ml-2 text-sm text-g-500">{{ loadingText }}</span>
      </div>
      <div v-else class="art-loading-state__default flex-cc">
        <ElSkeleton :rows="rows" :animated="animated" />
      </div>
    </template>

    <!-- 错误：显示错误信息 -->
    <template v-else-if="isError">
      <div class="art-loading-state__error flex-cc flex-col">
        <ElIcon :size="32" color="#f56c6c">
          <CircleClose />
        </ElIcon>
        <p class="mt-2 text-sm text-g-500 text-center">{{ errorText || defaultErrorText }}</p>
        <div v-if="$slots.errorAction || retryable" class="mt-3">
          <slot name="errorAction">
            <ElButton v-if="retryable" size="small" type="primary" @click="handleRetry">
              重试
            </ElButton>
          </slot>
        </div>
      </div>
    </template>

    <!-- 空数据：显示空状态 -->
    <template v-else-if="isEmpty">
      <div class="art-loading-state__empty flex-cc flex-col">
        <slot name="empty">
          <ElEmpty :description="emptyText || '暂无数据'" />
        </slot>
      </div>
    </template>

    <!-- 正常内容：显示业务内容 -->
    <template v-else>
      <div class="art-loading-state__content">
        <slot />
      </div>
      <div v-if="isFetching && showFetchingIndicator" class="art-loading-state__fetching">
        <slot name="fetching">
          <ElIcon class="is-loading" :size="14">
            <Loading />
          </ElIcon>
          <span class="ml-1 text-xs text-g-500">刷新中...</span>
        </slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElSkeleton, ElEmpty, ElIcon, ElButton } from 'element-plus'
  import { Loading, CircleClose } from '@element-plus/icons-vue'

  interface Props {
    /** 是否首次加载中（无任何数据时） */
    isLoading?: boolean
    /** 是否有错误 */
    isError?: boolean
    /** 错误对象（用于提取消息） */
    error?: unknown
    /** 是否空数据 */
    isEmpty?: boolean
    /** 是否后台刷新中（有数据时静默刷新） */
    isFetching?: boolean
    /** 骨架屏行数 */
    rows?: number
    /** 是否开启动画 */
    animated?: boolean
    /** 加载变体：'skeleton' | 'spinner' | 'default' */
    variant?: 'skeleton' | 'spinner' | 'default'
    /** spinner 尺寸 */
    size?: number
    /** 加载文案 */
    loadingText?: string
    /** 错误文案（不传则尝试从 error 提取） */
    errorText?: string
    /** 空数据文案 */
    emptyText?: string
    /** 是否可重试（错误时显示重试按钮） */
    retryable?: boolean
    /** 是否显示后台刷新指示器 */
    showFetchingIndicator?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    isError: false,
    error: null,
    isEmpty: false,
    isFetching: false,
    rows: 5,
    animated: true,
    variant: 'skeleton',
    size: 32,
    loadingText: '',
    errorText: '',
    emptyText: '',
    retryable: true,
    showFetchingIndicator: true
  })

  const emit = defineEmits<{
    (e: 'retry'): void
  }>()

  const defaultErrorText = computed(() => {
    if (props.error instanceof Error) return props.error.message || '加载失败'
    if (props.error && typeof props.error === 'object' && 'message' in props.error) {
      return String((props.error as { message: unknown }).message) || '加载失败'
    }
    return '加载失败，请稍后重试'
  })

  const handleRetry = () => {
    emit('retry')
  }
</script>

<style scoped>
  .art-loading-state {
    position: relative;
    width: 100%;
    min-height: 80px;
  }

  .art-loading-state__skeleton,
  .art-loading-state__default {
    padding: 8px 0;
  }

  .art-loading-state__spinner {
    padding: 24px 0;
  }

  .art-loading-state__error,
  .art-loading-state__empty {
    padding: 32px 16px;
    min-height: 120px;
  }

  .art-loading-state__content {
    width: 100%;
  }

  .art-loading-state__fetching {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--el-fill-color-light, #f5f7fa);
    border-radius: 12px;
    z-index: 1;
  }

  .flex-cc {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .flex-col {
    flex-direction: column;
  }

  .ml-1 {
    margin-left: 4px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .mt-2 {
    margin-top: 8px;
  }

  .mt-3 {
    margin-top: 12px;
  }

  .text-xs {
    font-size: 12px;
  }

  .text-sm {
    font-size: 14px;
  }

  .text-g-500 {
    color: var(--el-text-color-secondary, #909399);
  }
</style>
