<template>
  <div class="storyboard-timeline">
    <div v-if="!items.length" class="py-10">
      <ElEmpty description="暂无分镜" />
    </div>
    <div v-else class="timeline-wrap">
      <div class="timeline-ruler">
        <div
          v-for="tick in ticks"
          :key="tick"
          class="tick"
          :style="{ left: `${(tick / totalDuration) * 100}%` }"
        >
          <span class="tick-label">{{ tick }}s</span>
        </div>
      </div>

      <div class="timeline-track">
        <div
          v-for="(item, idx) in items"
          :key="item.id"
          class="shot-block"
          :class="[`shot-${item.shotType || 'narrative'}`]"
          :style="{
            left: `${(offsetOf(idx) / totalDuration) * 100}%`,
            width: `${(widthOf(item) / totalDuration) * 100}%`
          }"
          :title="`#${item.storyboardNo ?? idx + 1} ${item.title} (${item.durationSeconds || 0}s)`"
          @click="$emit('open', item)"
        >
          <div class="shot-no">#{{ item.storyboardNo ?? idx + 1 }}</div>
          <div class="shot-title">{{ item.title || '未命名' }}</div>
          <div class="shot-meta">
            {{ item.durationSeconds || 0 }}s · {{ angleMap[item.cameraAngle || ''] || item.cameraAngle || '-' }}
          </div>
          <ShotStatusTag :status="item.status" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import ShotStatusTag from './ShotStatusTag.vue'

  interface ShotItem {
    id: string
    title?: string
    cameraAngle?: string
    shotType?: string
    status?: number
    storyboardNo?: number
    durationSeconds?: number
  }
  const props = defineProps<{ items: ShotItem[] }>()
  defineEmits<{ (e: 'open', item: ShotItem): void }>()

  const angleMap: Record<string, string> = {
    wide: '广角', medium: '中景', close: '近景', extreme_close: '特写',
    over_shoulder: '过肩', pov: '主观', birds_eye: '俯视', dutch: '荷兰角'
  }

  const totalDuration = computed(() => {
    const sum = props.items.reduce((s, i) => s + (i.durationSeconds || 0), 0)
    return Math.max(sum, 30)
  })

  const ticks = computed(() => {
    const total = totalDuration.value
    const step = total <= 60 ? 5 : total <= 300 ? 30 : 60
    const arr: number[] = []
    for (let t = 0; t <= total; t += step) arr.push(t)
    return arr
  })

  function offsetOf(idx: number) {
    return props.items
      .slice(0, idx)
      .reduce((s, i) => s + (i.durationSeconds || 0), 0)
  }
  function widthOf(item: ShotItem) {
    return Math.max(item.durationSeconds || 0, 1)
  }
</script>

<style lang="scss" scoped>
  .storyboard-timeline {
    .timeline-wrap {
      position: relative;
      padding: 24px 16px 32px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }
    .timeline-ruler {
      position: relative;
      width: 100%;
      height: 24px;
      margin-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      .tick {
        position: absolute;
        top: 0;
        height: 100%;
        border-left: 1px dashed var(--el-border-color);
        transform: translateX(-1px);
        .tick-label {
          position: absolute;
          bottom: -2px;
          left: 2px;
          font-size: 11px;
          color: var(--el-text-color-secondary);
          transform: translateY(100%);
        }
      }
    }
    .timeline-track {
      position: relative;
      width: 100%;
      height: 80px;
      .shot-block {
        position: absolute;
        top: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px 8px;
        overflow: hidden;
        cursor: pointer;
        background: var(--el-color-primary-light-9);
        border: 1px solid var(--el-color-primary-light-5);
        border-radius: 4px;
        transition: all 0.15s ease;
        &:hover {
          background: var(--el-color-primary-light-8);
          transform: translateY(-1px);
        }
        &.shot-narrative {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary-light-5);
        }
        &.shot-breath {
          background: var(--el-color-success-light-9);
          border-color: var(--el-color-success-light-5);
        }
        &.shot-climax {
          background: var(--el-color-danger-light-9);
          border-color: var(--el-color-danger-light-5);
        }
        &.shot-transition {
          background: var(--el-color-warning-light-9);
          border-color: var(--el-color-warning-light-5);
        }
        .shot-no {
          font-size: 11px;
          font-weight: 600;
          color: var(--el-text-color-secondary);
        }
        .shot-title {
          font-size: 12px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          @include ellipsis(1);
        }
        .shot-meta {
          font-size: 10px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
</style>
