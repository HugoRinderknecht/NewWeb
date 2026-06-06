<template>
  <div class="shot-assets-tab">
    <div v-if="loading" class="py-6">
      <ElSkeleton :rows="4" animated />
    </div>
    <div v-else-if="!assets.length" class="py-10">
      <ElEmpty description="暂未关联资产" />
    </div>
    <div v-else>
      <div v-for="group in grouped" :key="group.type" class="asset-group">
        <div class="group-label">
          <span>{{ group.label }}</span>
          <ElTag size="small">{{ group.items.length }}</ElTag>
        </div>
        <div class="asset-grid">
          <div v-for="a in group.items" :key="a.id" class="asset-item">
            <ElImage
              v-if="a.thumbnailUrl"
              :src="a.thumbnailUrl"
              fit="cover"
              :preview-src-list="[a.thumbnailUrl]"
              :hide-on-click-modal="true"
            />
            <div v-else class="asset-placeholder">
              <ArtSvgIcon :icon="assetIcon(a.assetType)" class="text-2xl text-g-300" />
            </div>
            <div class="asset-info">
              <div class="asset-name" :title="a.assetName">{{ a.assetName }}</div>
              <ElButton link type="danger" size="small" @click="handleUnlink(a)">
                <ArtSvgIcon icon="ri:link-unlink" />解绑
              </ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDivider />
    <ElSpace wrap>
      <ElButton type="primary" @click="openPicker('character')">
        <ArtSvgIcon icon="ri:user-add-line" class="mr-1" />关联角色
      </ElButton>
      <ElButton @click="openPicker('scene')">
        <ArtSvgIcon icon="ri:landscape-line" class="mr-1" />关联场景
      </ElButton>
      <ElButton @click="openPicker('prop')">
        <ArtSvgIcon icon="ri:box-3-line" class="mr-1" />关联道具
      </ElButton>
      <ElButton @click="openPicker('clothes')">
        <ArtSvgIcon icon="ri:t-shirt-line" class="mr-1" />关联服装
      </ElButton>
      <ElButton @click="openPicker('audio')">
        <ArtSvgIcon icon="ri:music-2-line" class="mr-1" />关联音频
      </ElButton>
    </ElSpace>

    <AssetPickerDialog
      v-model:visible="pickerVisible"
      :asset-type="pickerType"
      @confirm="handlePickerConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useStoryboardAssets, useLinkAssetToStoryboard, useUnlinkAssetFromStoryboard } from '@/api/queries/storyboard'
  import AssetPickerDialog from './AssetPickerDialog.vue'

  interface StoryboardAsset {
    id: string
    storyboardId: string
    assetId: string
    assetName: string
    assetType: string
    thumbnailUrl?: string
  }
  const props = defineProps<{ storyboardId: string }>()
  const { data: assetsData, isLoading: loading } = useStoryboardAssets(() => props.storyboardId)
  const assets = computed<StoryboardAsset[]>(() => (assetsData.value as any) || [])
  const { mutateAsync: linkAsset } = useLinkAssetToStoryboard()
  const { mutateAsync: unlinkAsset } = useUnlinkAssetFromStoryboard()

  const ASSET_TYPE_META: Record<string, { label: string; icon: string }> = {
    character: { label: '角色', icon: 'ri:user-line' },
    scene: { label: '场景', icon: 'ri:landscape-line' },
    prop: { label: '道具', icon: 'ri:box-3-line' },
    clothes: { label: '服装', icon: 'ri:t-shirt-line' },
    audio: { label: '音频', icon: 'ri:music-2-line' }
  }
  const assetIcon = (t: string) => ASSET_TYPE_META[t]?.icon || 'ri:links-line'
  const assetLabel = (t: string) => ASSET_TYPE_META[t]?.label || t

  const grouped = computed(() => {
    const map = new Map<string, StoryboardAsset[]>()
    assets.value.forEach((a: StoryboardAsset) => {
      const t = a.assetType || 'other'
      if (!map.has(t)) map.set(t, [])
      map.get(t)!.push(a)
    })
    return Array.from(map.entries()).map(([type, items]) => ({
      type,
      label: assetLabel(type),
      items
    }))
  })

  const pickerVisible = ref(false)
  const pickerType = ref<string>('character')
  function openPicker(type: string) {
    pickerType.value = type
    pickerVisible.value = true
  }

  async function handlePickerConfirm(asset: { id: string }) {
    try {
      await linkAsset({
        storyboardId: props.storyboardId,
        assetId: asset.id,
        assetType: pickerType.value
      })
      ElMessage.success('已关联')
      pickerVisible.value = false
    } catch {
      ElMessage.error('关联失败')
    }
  }

  async function handleUnlink(a: StoryboardAsset) {
    try {
      await ElMessageBox.confirm(`确定要解绑资产「${a.assetName}」吗？`, '确认', { type: 'warning' })
    } catch {
      return
    }
    try {
      await unlinkAsset({ storyboardId: props.storyboardId, assetId: a.assetId })
      ElMessage.success('已解绑')
    } catch {
      ElMessage.error('解绑失败')
    }
  }
</script>

<style lang="scss" scoped>
  .asset-group {
    margin-bottom: 18px;
    .group-label {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
    }
    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 10px;
    }
    .asset-item {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 6px;
      :deep(.el-image) {
        width: 100%;
        aspect-ratio: 1 / 1;
      }
      .asset-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        aspect-ratio: 1 / 1;
        background: var(--el-fill-color-lighter);
      }
      .asset-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        .asset-name {
          flex: 1;
          font-size: 12px;
          @include ellipsis(1);
        }
      }
    }
  }
</style>
