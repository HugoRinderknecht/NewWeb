<template>
  <ElDialog
    v-model="visible"
    :title="`选择${typeLabel}资产`"
    width="720px"
    align-center
    destroy-on-close
  >
    <div class="picker-toolbar">
      <ElInput
        v-model="keyword"
        placeholder="搜索资产名称"
        clearable
        style="width: 220px"
      >
        <template #prefix>
          <ArtSvgIcon icon="ri:search-line" />
        </template>
      </ElInput>
    </div>

    <div v-if="loading" class="py-6">
      <ElSkeleton :rows="4" animated />
    </div>
    <ElEmpty v-else-if="!filtered.length" description="未找到匹配的资产" />
    <div v-else class="picker-grid">
      <div
        v-for="a in filtered"
        :key="a.id"
        class="picker-card"
        :class="{ active: selectedId === a.id }"
        @click="selectedId = a.id"
      >
        <ElImage
          v-if="a.thumbnailUrl"
          :src="a.thumbnailUrl"
          fit="cover"
        />
        <div v-else class="picker-placeholder">
          <ArtSvgIcon icon="ri:image-line" class="text-2xl text-g-300" />
        </div>
        <div class="picker-name" :title="a.assetName">{{ a.assetName }}</div>
      </div>
    </div>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :disabled="!selectedId" @click="confirm">确认关联</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { fetchGetProjectAssets } from '@/api/asset'
  import { useRoute } from 'vue-router'

  interface AssetItem {
    id: string
    assetName: string
    thumbnailUrl?: string
    assetType?: string
  }
  const props = defineProps<{ visible: boolean; assetType: string }>()
  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void
    (e: 'confirm', asset: AssetItem): void
  }>()

  const route = useRoute()
  const keyword = ref('')
  const assets = ref<AssetItem[]>([])
  const loading = ref(false)
  const selectedId = ref<string | null>(null)

  const visible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const typeLabel = computed(() => ({
    character: '角色', scene: '场景', prop: '道具', clothes: '服装', audio: '音频'
  } as Record<string, string>)[props.assetType] || '资产')

  const filtered = computed(() => {
    const k = keyword.value.trim().toLowerCase()
    if (!k) return assets.value
    return assets.value.filter((a) => a.assetName.toLowerCase().includes(k))
  })

  async function load() {
    const projectId = (route.params.projectId as string) || ''
    if (!projectId) {
      assets.value = []
      return
    }
    loading.value = true
    try {
      const res: any = await fetchGetProjectAssets(projectId, {
        assetType: props.assetType,
        page: 1,
        pageSize: 50
      })
      const list = Array.isArray(res) ? res : res?.records || []
      assets.value = list
    } catch {
      assets.value = []
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [props.visible, props.assetType],
    ([v]) => {
      if (v) {
        selectedId.value = null
        keyword.value = ''
        load()
      }
    }
  )

  function confirm() {
    const found = assets.value.find((a) => a.id === selectedId.value)
    if (found) emit('confirm', found)
  }
</script>

<style lang="scss" scoped>
  .picker-toolbar {
    margin-bottom: 12px;
  }
  .picker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    max-height: 50vh;
    overflow-y: auto;
  }
  .picker-card {
    cursor: pointer;
    background: var(--el-bg-color);
    border: 2px solid var(--el-border-color-lighter);
    border-radius: 6px;
    transition: all 0.15s;
    &:hover {
      border-color: var(--el-color-primary-light-5);
    }
    &.active {
      border-color: var(--el-color-primary);
    }
    :deep(.el-image) {
      width: 100%;
      aspect-ratio: 1 / 1;
    }
    .picker-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: var(--el-fill-color-lighter);
    }
    .picker-name {
      padding: 6px 8px;
      font-size: 12px;
      @include ellipsis(1);
    }
  }
</style>
