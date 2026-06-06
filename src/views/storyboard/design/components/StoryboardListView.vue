<template>
  <div class="storyboard-list">
    <ArtTable
      :data="items"
      :loading="loading"
      :pagination="pagination"
      :total="total"
      empty-text="暂无分镜"
      @selection-change="(rows: ShotItem[]) => $emit('selection', rows)"
      @pagination:size-change="(s: number) => $emit('page-change', { size: s, current: 1 })"
      @pagination:current-change="(c: number) => $emit('page-change', { size: pagination.size, current: c })"
    >
      <template #default>
        <ElTableColumn v-if="selectable" type="selection" width="48" />
        <ElTableColumn label="序号" width="70">
          <template #default="scope">
            <span class="text-g-500">#{{ scope.row.storyboardNo ?? scope.$index + 1 }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="分镜标题" min-width="220">
          <template #default="scope">
            <div class="title-cell" @click="$emit('open', scope.row)">
              <span class="title-text">{{ scope.row.title || '未命名分镜' }}</span>
              <ElTag v-if="scope.row.aiGenerated" type="info" size="small" class="ml-2">[AI补写]</ElTag>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="镜头语言" width="200">
          <template #default="scope">
            <ElSpace :size="4" wrap>
              <ElTag v-if="scope.row.cameraAngle" size="small">{{ angleMap[scope.row.cameraAngle] || scope.row.cameraAngle }}</ElTag>
              <ElTag v-if="scope.row.cameraMovement" size="small" type="info">{{ movementMap[scope.row.cameraMovement] || scope.row.cameraMovement }}</ElTag>
              <ElTag v-if="scope.row.shotType" size="small" :type="shotTypeTagType(scope.row.shotType)">{{ shotTypeLabel(scope.row.shotType) }}</ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>
        <ElTableColumn label="时长" width="80" align="center">
          <template #default="scope">
            <span>{{ scope.row.durationSeconds || 0 }}s</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="配图" width="70" align="center">
          <template #default="scope">
            <ElBadge v-if="scope.row.imageCount" :value="scope.row.imageCount" type="primary" />
            <span v-else class="text-g-300">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="资产" width="70" align="center">
          <template #default="scope">
            <ElBadge v-if="scope.row.assetCount" :value="scope.row.assetCount" type="success" />
            <span v-else class="text-g-300">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="scope">
            <ShotStatusTag :status="scope.row.status" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="更新" width="160" prop="updateTime" sortable />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="scope">
            <ElSpace>
              <ElButton link type="primary" size="small" @click="$emit('open', scope.row)">查看</ElButton>
              <ElButton link type="primary" size="small" @click="$emit('edit', scope.row)">编辑</ElButton>
              <ElButton link type="danger" size="small" @click="$emit('delete', scope.row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </template>
    </ArtTable>
  </div>
</template>

<script setup lang="ts">
  import ShotStatusTag from './ShotStatusTag.vue'

  interface ShotItem {
    id: string
    title?: string
    cameraAngle?: string
    cameraMovement?: string
    shotType?: string
    status?: number
    storyboardNo?: number
    durationSeconds?: number
    imageCount?: number
    assetCount?: number
    aiGenerated?: boolean
    updateTime?: string
  }
  interface PaginationState {
    current: number
    size: number
  }
  const props = withDefaults(
    defineProps<{
      items: ShotItem[]
      total: number
      loading?: boolean
      pagination: PaginationState
      selectable?: boolean
    }>(),
    { total: 0, loading: false, selectable: false }
  )
  const emit = defineEmits<{
    (e: 'open', item: ShotItem): void
    (e: 'edit', item: ShotItem): void
    (e: 'delete', item: ShotItem): void
    (e: 'selection', items: ShotItem[]): void
    (e: 'page-change', payload: { size: number; current: number }): void
  }>()

  const shotTypeMap: Record<string, { label: string; type: any }> = {
    narrative: { label: '叙述', type: 'primary' },
    breath: { label: '呼吸', type: 'success' },
    climax: { label: '高潮', type: 'danger' },
    transition: { label: '转场', type: 'warning' }
  }
  const shotTypeLabel = (t: string) => shotTypeMap[t]?.label || t
  const shotTypeTagType = (t: string): any => shotTypeMap[t]?.type || 'info'

  const angleMap: Record<string, string> = {
    wide: '广角', medium: '中景', close: '近景', extreme_close: '特写',
    over_shoulder: '过肩', pov: '主观', birds_eye: '俯视', dutch: '荷兰角'
  }
  const movementMap: Record<string, string> = {
    fixed: '固定', pan: '摇', tilt: '俯仰', dolly: '推拉', crane: '升降',
    tracking: '跟踪', steadicam: '斯坦尼康', zoom: '变焦', rack: '变焦'
  }
</script>

<style lang="scss" scoped>
  .title-cell {
    cursor: pointer;
    .title-text {
      color: var(--el-color-primary);
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
