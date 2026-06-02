<template>
  <div class="art-skeleton" :class="{ animated }">
    <!-- 列表骨架 -->
    <template v-if="type === 'list'">
      <div v-for="i in rows" :key="i" class="skeleton-row">
        <div v-if="avatar" class="skeleton-avatar" :style="avatarStyle" />
        <div class="skeleton-content">
          <div class="skeleton-line" :style="{ width: getTitleWidth(i) }" />
          <div v-for="j in lines" :key="j" class="skeleton-line" :style="{ width: getLineWidth(i, j) }" />
        </div>
      </div>
    </template>

    <!-- 卡片骨架 -->
    <template v-else-if="type === 'card'">
      <div v-for="i in rows" :key="i" class="skeleton-card">
        <div class="skeleton-image" :style="imageStyle" />
        <div class="skeleton-card-content">
          <div class="skeleton-line" style="width: 70%" />
          <div class="skeleton-line" style="width: 50%" />
          <div class="skeleton-line" style="width: 90%" />
        </div>
      </div>
    </template>

    <!-- 表格骨架 -->
    <template v-else-if="type === 'table'">
      <div class="skeleton-table">
        <div class="skeleton-header">
          <div v-for="col in columns" :key="col" class="skeleton-cell" :style="{ width: `${100 / columns}%` }" />
        </div>
        <div v-for="i in rows" :key="i" class="skeleton-row-table">
          <div v-for="col in columns" :key="col" class="skeleton-cell" :style="{ width: `${100 / columns}%` }" />
        </div>
      </div>
    </template>

    <!-- 图文骨架 -->
    <template v-else-if="type === 'image-text'">
      <div class="skeleton-image-text">
        <div class="skeleton-image-large" :style="imageStyle" />
        <div class="skeleton-text-content">
          <div class="skeleton-line" style="width: 60%; height: 20px" />
          <div class="skeleton-line" style="width: 90%" />
          <div class="skeleton-line" style="width: 80%" />
          <div class="skeleton-line" style="width: 70%" />
        </div>
      </div>
    </template>

    <!-- 自定义骨架 -->
    <template v-else>
      <slot />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ name: 'ArtSkeleton' })

  const props = defineProps<{
    type?: 'list' | 'card' | 'table' | 'image-text' | 'custom'
    rows?: number
    lines?: number
    columns?: number
    avatar?: boolean
    avatarSize?: number
    imageWidth?: string
    imageHeight?: string
    animated?: boolean
  }>()

  const rows = computed(() => props.rows || 3)
  const lines = computed(() => props.lines || 2)
  const columns = computed(() => props.columns || 4)
  const animated = computed(() => props.animated !== false)

  const avatarStyle = computed(() => ({
    width: `${props.avatarSize || 40}px`,
    height: `${props.avatarSize || 40}px`
  }))

  const imageStyle = computed(() => ({
    width: props.imageWidth || '100%',
    height: props.imageHeight || '120px'
  }))

  function getTitleWidth(row: number): string {
    const widths = ['60%', '55%', '65%', '50%', '70%']
    return widths[(row - 1) % widths.length]
  }

  function getLineWidth(row: number, line: number): string {
    const seed = row * 3 + line
    const widths = ['90%', '85%', '95%', '80%', '88%', '92%', '75%', '100%']
    return widths[seed % widths.length]
  }
</script>

<style lang="scss" scoped>
  .art-skeleton {
    &.animated {
      .skeleton-line,
      .skeleton-avatar,
      .skeleton-image,
      .skeleton-image-large,
      .skeleton-cell {
        background: linear-gradient(
          90deg,
          var(--el-skeleton-color, var(--el-fill-color)) 25%,
          var(--el-skeleton-to-color, var(--el-fill-color-darker)) 37%,
          var(--el-skeleton-color, var(--el-fill-color)) 63%
        );
        background-size: 400% 100%;
        animation: skeleton-loading 1.4s ease infinite;
      }
    }
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0 50%;
    }
  }

  // 通用骨架元素
  .skeleton-line {
    height: 14px;
    background: var(--el-fill-color);
    border-radius: 4px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .skeleton-avatar {
    border-radius: 50%;
    background: var(--el-fill-color);
    flex-shrink: 0;
  }

  .skeleton-image {
    background: var(--el-fill-color);
    border-radius: var(--custom-radius);
  }

  .skeleton-image-large {
    background: var(--el-fill-color);
    border-radius: var(--custom-radius);
  }

  // 列表骨架
  .skeleton-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .skeleton-content {
      flex: 1;
      min-width: 0;
    }
  }

  // 卡片骨架
  .skeleton-card {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    overflow: hidden;
    margin-bottom: 16px;

    .skeleton-card-content {
      padding: 12px;
    }
  }

  // 表格骨架
  .skeleton-table {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    overflow: hidden;

    .skeleton-header {
      display: flex;
      background: var(--el-fill-color-lighter);
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .skeleton-row-table {
      display: flex;
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }
    }

    .skeleton-cell {
      height: 14px;
      background: var(--el-fill-color);
      border-radius: 4px;
      margin: 0 8px;
    }
  }

  // 图文骨架
  .skeleton-image-text {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);

    .skeleton-text-content {
      flex: 1;
      min-width: 0;
    }
  }
</style>
