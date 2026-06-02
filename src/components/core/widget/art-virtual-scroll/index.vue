<template>
  <div ref="containerRef" class="virtual-scroll-container" @scroll="handleScroll">
    <!-- 占位层，撑起滚动条 -->
    <div class="virtual-scroll-phantom" :style="{ height: `${totalHeight}px` }" />

    <!-- 可视区域内容 -->
    <div class="virtual-scroll-content" :style="contentStyle">
      <div
        v-for="item in visibleItems"
        :key="getItemKey(item.item)"
        :style="{ height: `${itemHeight}px` }"
        class="virtual-scroll-item"
      >
        <slot :item="item.item" :index="item.index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

  defineOptions({ name: 'ArtVirtualScroll' })

  const props = defineProps<{
    items: any[]
    itemHeight: number
    itemKey?: string | ((item: any) => string)
    buffer?: number // 上下缓冲行数
  }>()

  // ---------- State ----------
  const containerRef = ref<HTMLDivElement>()
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  const bufferCount = computed(() => props.buffer || 5)

  // ---------- 计算属性 ----------
  const totalHeight = computed(() => props.items.length * props.itemHeight)

  const startIndex = computed(() => {
    const index = Math.floor(scrollTop.value / props.itemHeight)
    return Math.max(0, index - bufferCount.value)
  })

  const visibleCount = computed(() => {
    if (!containerHeight.value) return 0
    return Math.ceil(containerHeight.value / props.itemHeight) + bufferCount.value * 2
  })

  const endIndex = computed(() => {
    return Math.min(props.items.length, startIndex.value + visibleCount.value)
  })

  const visibleItems = computed(() => {
    const result = []
    for (let i = startIndex.value; i < endIndex.value; i++) {
      if (i < props.items.length) {
        result.push({ item: props.items[i], index: i })
      }
    }
    return result
  })

  const contentStyle = computed(() => {
    const offset = startIndex.value * props.itemHeight
    return {
      transform: `translateY(${offset}px)`
    }
  })

  // ---------- 方法 ----------
  function getItemKey(item: any): string {
    if (typeof props.itemKey === 'function') {
      return props.itemKey(item)
    }
    if (typeof props.itemKey === 'string') {
      return item[props.itemKey]
    }
    return item.id || item.key || JSON.stringify(item)
  }

  function handleScroll() {
    if (containerRef.value) {
      scrollTop.value = containerRef.value.scrollTop
    }
  }

  function updateContainerHeight() {
    if (containerRef.value) {
      containerHeight.value = containerRef.value.clientHeight
    }
  }

  function scrollToIndex(index: number) {
    if (containerRef.value) {
      containerRef.value.scrollTop = index * props.itemHeight
    }
  }

  function scrollToTop() {
    if (containerRef.value) {
      containerRef.value.scrollTop = 0
    }
  }

  function scrollToBottom() {
    if (containerRef.value) {
      containerRef.value.scrollTop = totalHeight.value
    }
  }

  // ---------- 生命周期 ----------
  onMounted(() => {
    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateContainerHeight)
  })

  watch(() => props.items, () => {
    nextTick(() => {
      updateContainerHeight()
    })
  })

  // 暴露方法
  defineExpose({
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    updateContainerHeight
  })
</script>

<style lang="scss" scoped>
  .virtual-scroll-container {
    position: relative;
    overflow-y: auto;
    height: 100%;
  }

  .virtual-scroll-phantom {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 0;
  }

  .virtual-scroll-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    will-change: transform;
  }

  .virtual-scroll-item {
    box-sizing: border-box;
  }
</style>
