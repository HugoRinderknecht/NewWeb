<template>
  <div
    class="storyboard-card"
    :class="{ 'is-selected': selected, 'is-active': active }"
    @click="$emit('click', item)"
    @dblclick="$emit('dblclick', item)"
  >
    <div class="card-image">
      <ElImage
        v-if="imageUrl"
        :src="imageUrl"
        fit="cover"
        :preview-src-list="[imageUrl]"
        :hide-on-click-modal="true"
        class="card-img"
      />
      <div v-else class="card-placeholder flex-cc">
        <ArtSvgIcon icon="ri:image-line" class="text-3xl text-g-300" />
      </div>
      <div class="card-badges">
        <ElTag v-if="item.status === 2" type="warning" size="small">待审核</ElTag>
        <ElTag v-if="item.status === 4" type="danger" size="small">已驳回</ElTag>
        <ElTag v-if="item.shotType" size="small" :type="shotTypeTagType">{{ shotTypeLabel }}</ElTag>
        <ElTag v-if="item.aiGenerated" type="info" size="small">[AI补写]</ElTag>
      </div>
      <div class="card-index">#{{ item.storyboardNo ?? '-' }}</div>
      <ElCheckbox
        v-if="selectable"
        :model-value="selected"
        class="card-check"
        @click.stop
        @change="(v: any) => $emit('select', Boolean(v))"
      />
    </div>

    <div class="card-body">
      <div class="card-title" :title="item.title">{{ item.title || '未命名分镜' }}</div>
      <div class="card-meta">
        <ElTooltip v-if="item.cameraAngle" :content="`景别：${cameraAngleLabel}`" placement="top">
          <span class="meta-chip"><ArtSvgIcon icon="ri:camera-line" /> {{ cameraAngleLabel }}</span>
        </ElTooltip>
        <ElTooltip v-if="item.cameraMovement" :content="`运镜：${cameraMovementLabel}`" placement="top">
          <span class="meta-chip"><ArtSvgIcon icon="ri:video-add-line" /> {{ cameraMovementLabel }}</span>
        </ElTooltip>
        <ElTooltip v-if="item.durationSeconds" content="时长" placement="top">
          <span class="meta-chip"><ArtSvgIcon icon="ri:time-line" /> {{ item.durationSeconds }}s</span>
        </ElTooltip>
      </div>
      <div v-if="item.scriptText" class="card-script">"{{ truncate(item.scriptText, 40) }}"</div>
      <div class="card-footer">
        <ShotStatusTag :status="item.status" />
        <ElSpace :size="4">
          <ElTooltip v-if="item.imageCount" content="配图数" placement="top">
            <span class="text-xs text-g-400"><ArtSvgIcon icon="ri:image-2-line" /> {{ item.imageCount }}</span>
          </ElTooltip>
          <ElTooltip v-if="item.assetCount" content="关联资产数" placement="top">
            <span class="text-xs text-g-400"><ArtSvgIcon icon="ri:links-line" /> {{ item.assetCount }}</span>
          </ElTooltip>
          <ElTooltip v-if="item.versionCount" content="版本数" placement="top">
            <span class="text-xs text-g-400"><ArtSvgIcon icon="ri:git-branch-line" /> {{ item.versionCount }}</span>
          </ElTooltip>
        </ElSpace>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface ShotItem {
    id: string
    title?: string
    description?: string
    prompt?: string
    scriptText?: string
    cameraAngle?: string
    cameraMovement?: string
    durationSeconds?: number
    status?: number
    shotType?: string
    storyboardNo?: number
    imageCount?: number
    assetCount?: number
    versionCount?: number
    aiGenerated?: boolean
    images?: Array<{ id: string; url: string; imageType?: string }>
  }

  const props = defineProps<{
    item: ShotItem
    selected?: boolean
    active?: boolean
    selectable?: boolean
  }>()

  defineEmits<{
    (e: 'click', item: ShotItem): void
    (e: 'dblclick', item: ShotItem): void
    (e: 'select', value: boolean): void
  }>()

  const ANGLE_MAP: Record<string, string> = {
    wide: '广角',
    medium: '中景',
    close: '近景',
    extreme_close: '特写',
    over_shoulder: '过肩',
    pov: '主观',
    birds_eye: '俯视',
    dutch: '荷兰角'
  }
  const MOVEMENT_MAP: Record<string, string> = {
    fixed: '固定',
    pan: '摇',
    tilt: '俯仰',
    dolly: '推拉',
    crane: '升降',
    tracking: '跟踪',
    steadicam: '斯坦尼康',
    zoom: '变焦',
    rack: '变焦'
  }
  const SHOT_TYPE_MAP: Record<string, { label: string; type: string }> = {
    narrative: { label: '叙述', type: 'primary' },
    breath: { label: '呼吸', type: 'success' },
    climax: { label: '高潮', type: 'danger' },
    transition: { label: '转场', type: 'warning' }
  }

  const imageUrl = computed(() => {
    const imgs = props.item.images
    if (!imgs || imgs.length === 0) return ''
    const main = imgs.find((i) => i.imageType === 'main')
    if (main) return main.url
    return imgs[0]?.url || ''
  })

  const cameraAngleLabel = computed(() => ANGLE_MAP[props.item.cameraAngle || ''] || props.item.cameraAngle || '-')
  const cameraMovementLabel = computed(
    () => MOVEMENT_MAP[props.item.cameraMovement || ''] || props.item.cameraMovement || '-'
  )

  const shotTypeMeta = computed(() => SHOT_TYPE_MAP[props.item.shotType || ''] || { label: '', type: 'info' })
  const shotTypeLabel = computed(() => shotTypeMeta.value.label)
  const shotTypeTagType = computed(() => shotTypeMeta.value.type as any)

  const truncate = (str: string, n: number) => (str.length > n ? str.slice(0, n) + '...' : str)
</script>

<style lang="scss" scoped>
  .storyboard-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 6px 18px rgb(0 0 0 / 8%);
    }

    &.is-selected {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
    }

    &.is-active {
      border-color: var(--el-color-primary);
    }

    .card-image {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background: var(--el-fill-color-lighter);

      .card-img {
        width: 100%;
        height: 100%;
      }

      .card-placeholder {
        width: 100%;
        height: 100%;
      }

      .card-badges {
        position: absolute;
        top: 8px;
        left: 8px;
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .card-index {
        position: absolute;
        right: 8px;
        bottom: 8px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 500;
        color: #fff;
        background: rgb(0 0 0 / 55%);
        border-radius: 4px;
      }

      .card-check {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px;
        background: rgb(255 255 255 / 85%);
        border-radius: 4px;
      }
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px 12px;

      .card-title {
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        color: var(--el-text-color-primary);
        @include ellipsis(1);
      }

      .card-meta {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;

        .meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          padding: 1px 6px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          background: var(--el-fill-color-lighter);
          border-radius: 3px;
        }
      }

      .card-script {
        padding: 6px 8px;
        font-size: 12px;
        font-style: italic;
        color: var(--el-text-color-secondary);
        background: var(--el-fill-color-lighter);
        border-radius: 4px;
        @include ellipsis(2);
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 2px;
      }
    }
  }
</style>
