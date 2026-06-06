<template>
  <ElConfigProvider
    size="default"
    :locale="zh"
    :z-index="3000"
    :card="{
      shadow: 'never'
    }"
  >
    <ArtErrorBoundary>
      <RouterView></RouterView>
    </ArtErrorBoundary>
  </ElConfigProvider>
</template>

<script setup lang="ts">
  import zh from 'element-plus/es/locale/lang/zh-cn'
  import ArtErrorBoundary from '@/components/core/base/art-error-boundary/index.vue'
  import { systemUpgrade } from './utils/sys'
  import { toggleTransition } from './utils/ui/animation'
  import { checkStorageCompatibility } from './utils/storage'
  import { initializeTheme } from './hooks/core/useTheme'

  onBeforeMount(() => {
    toggleTransition(true)
    initializeTheme()
  })

  onMounted(() => {
    checkStorageCompatibility()
    toggleTransition(false)
    systemUpgrade()
  })
</script>
