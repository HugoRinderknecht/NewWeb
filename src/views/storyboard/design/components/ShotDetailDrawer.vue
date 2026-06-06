<template>
  <ElDrawer
    v-model="visible"
    :title="drawerTitle"
    direction="rtl"
    size="780px"
    :destroy-on-close="false"
    @close="handleClose"
  >
    <div v-if="loading" class="drawer-loading">
      <ElSkeleton :rows="10" animated />
    </div>
    <div v-else-if="!detail" class="drawer-empty">
      <ElEmpty description="未找到分镜详情" />
    </div>
    <ElTabs v-else v-model="activeTab" class="drawer-tabs">
      <!-- Tab 1: 基础信息 -->
      <ElTabPane label="基础信息" name="info">
        <div class="info-section">
          <div class="info-header">
            <h2 class="info-title">{{ detail.title || '未命名分镜' }}</h2>
            <div class="info-tags">
              <ShotStatusTag :status="detail.status" />
              <ElTag v-if="detail.shotType" size="small">{{ shotTypeLabel(detail.shotType) }}</ElTag>
              <ElTag v-if="detail.aiGenerated" type="info" size="small">[AI补写]</ElTag>
            </div>
          </div>
          <ElDescriptions :column="2" border class="info-desc">
            <ElDescriptionsItem label="分镜编号">#{{ detail.storyboardNo ?? '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="所属剧集">{{ detail.episodeName || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="景别">{{ angleLabel(detail.cameraAngle) }}</ElDescriptionsItem>
            <ElDescriptionsItem label="运镜">{{ movementLabel(detail.cameraMovement) }}</ElDescriptionsItem>
            <ElDescriptionsItem label="时长">{{ detail.durationSeconds || 0 }} 秒</ElDescriptionsItem>
            <ElDescriptionsItem label="创建人">{{ detail.creatorName || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="创建时间">{{ detail.createTime || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="更新时间">{{ detail.updateTime || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="分镜描述" :span="2">
              {{ detail.description || '-' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="detail.prompt" label="AI 提示词" :span="2">
              <pre class="prompt-block">{{ detail.prompt }}</pre>
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="detail.scriptText" label="台词/旁白" :span="2">
              <div class="script-block">"{{ detail.scriptText }}"</div>
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="detail.soundEffect" label="音效" :span="2">
              {{ detail.soundEffect }}
            </ElDescriptionsItem>
            <ElDescriptionsItem v-if="detail.backgroundMusic" label="背景音乐" :span="2">
              {{ detail.backgroundMusic }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>
      </ElTabPane>

      <!-- Tab 2: 配图 -->
      <ElTabPane :label="`配图 (${imageList.length})`" name="images">
        <ShotImagesTab :storyboard-id="shotId!" />
      </ElTabPane>

      <!-- Tab 3: 关联资产 -->
      <ElTabPane :label="`资产 (${assetList.length})`" name="assets">
        <ShotAssetsTab :storyboard-id="shotId!" />
      </ElTabPane>

      <!-- Tab 4: 审核 -->
      <ElTabPane label="审核" name="review">
        <ShotReviewTab :storyboard-id="shotId!" @submit-success="refresh" @withdraw-success="refresh" />
      </ElTabPane>

      <!-- Tab 5: 版本 -->
      <ElTabPane :label="`版本 (${versionList.length})`" name="versions">
        <ShotVersionsTab :storyboard-id="shotId!" @rolled-back="refresh" />
      </ElTabPane>
    </ElTabs>

    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="handleClose">关闭</ElButton>
        <ElButton v-if="detail" type="primary" @click="handleEdit">编辑分镜</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { ElMessage } from 'element-plus'
  import {
    useStoryboardDetail,
    useStoryboardImages,
    useStoryboardAssets,
    useStoryboardVersions
  } from '@/api/queries/storyboard'
  import { useStoryboardStore } from '@/store/modules/storyboard'
  import ShotStatusTag from './ShotStatusTag.vue'
  import ShotImagesTab from './ShotImagesTab.vue'
  import ShotAssetsTab from './ShotAssetsTab.vue'
  import ShotReviewTab from './ShotReviewTab.vue'
  import ShotVersionsTab from './ShotVersionsTab.vue'

  const store = useStoryboardStore()
  const { detailOpen, detailStoryboardId, detailTab } = storeToRefs(store)

  const shotId = computed(() => detailStoryboardId.value || '')
  const visible = computed({
    get: () => detailOpen.value,
    set: (v) => {
      if (!v) store.closeDetail()
    }
  })
  const activeTab = computed({
    get: () => detailTab.value,
    set: (v) => store.setDetailTab(v as string)
  })

  const { data: detail, isLoading: loading, refetch } = useStoryboardDetail(shotId)
  const { data: imageData } = useStoryboardImages(shotId)
  const { data: assetData } = useStoryboardAssets(shotId)
  const { data: versionData } = useStoryboardVersions(shotId)
  const imageList = computed<any[]>(() => (imageData.value as any) || [])
  const assetList = computed<any[]>(() => (assetData.value as any) || [])
  const versionList = computed<any[]>(() => (versionData.value as any) || [])

  const drawerTitle = computed(() => {
    if (!detail.value) return '分镜详情'
    return `分镜 #${detail.value.storyboardNo ?? '-'} ${detail.value.title || '未命名分镜'}`
  })

  const angleMap: Record<string, string> = {
    wide: '广角', medium: '中景', close: '近景', extreme_close: '特写',
    over_shoulder: '过肩', pov: '主观', birds_eye: '俯视', dutch: '荷兰角'
  }
  const movementMap: Record<string, string> = {
    fixed: '固定', pan: '摇', tilt: '俯仰', dolly: '推拉', crane: '升降',
    tracking: '跟踪', steadicam: '斯坦尼康', zoom: '变焦', rack: '变焦'
  }
  const angleLabel = (a?: string) => (a ? angleMap[a] || a : '-')
  const movementLabel = (m?: string) => (m ? movementMap[m] || m : '-')
  const shotTypeLabel = (t: string) => ({
    narrative: '叙述', breath: '呼吸', climax: '高潮', transition: '转场'
  } as Record<string, string>)[t] || t

  function refresh() {
    refetch()
  }
  function handleClose() {
    store.closeDetail()
  }
  function handleEdit() {
    if (!shotId.value) return
    store.openEditor(shotId.value)
  }
</script>

<style lang="scss" scoped>
  .drawer-loading,
  .drawer-empty {
    padding: 40px 0;
  }
  .drawer-tabs {
    :deep(.el-tabs__content) {
      padding-top: 8px;
    }
  }
  .info-section {
    .info-header {
      margin-bottom: 16px;
      .info-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
      }
      .info-tags {
        display: flex;
        gap: 6px;
      }
    }
    .info-desc {
      .prompt-block,
      .script-block {
        margin: 0;
        padding: 8px 12px;
        font-size: 13px;
        background: var(--el-fill-color-lighter);
        border-radius: 4px;
      }
      .script-block {
        font-style: italic;
        color: var(--el-text-color-secondary);
      }
    }
  }
  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
