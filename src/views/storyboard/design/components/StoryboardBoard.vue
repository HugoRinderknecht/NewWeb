<template>
  <div class="storyboard-board">
    <div v-if="loading" class="board-loading flex-cc py-12">
      <ElSkeleton :rows="6" animated class="w-full" />
    </div>
    <ElEmpty v-else-if="!groups.length" description="暂无分镜" />
    <div v-else class="board-groups">
      <div v-for="g in groups" :key="g.key" class="board-group">
        <div class="group-header">
          <span class="group-title">
            <ArtSvgIcon icon="ri:film-line" class="mr-1" />
            {{ g.label }}
          </span>
          <ElTag size="small" type="info">{{ g.items.length }} 个</ElTag>
        </div>
        <div class="group-grid">
          <StoryboardCard
            v-for="item in g.items"
            :key="item.id"
            :item="item"
            :selected="selectedIds.includes(item.id)"
            :active="activeId === item.id"
            :selectable="selectable"
            @click="(it) => $emit('select', it)"
            @dblclick="(it) => $emit('open', it)"
            @select="(v) => $emit('toggle', { id: item.id, selected: v })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import StoryboardCard from './StoryboardCard.vue'

  interface ShotItem {
    id: string
    episodeId?: string
    episodeName?: string
    episodeIndex?: number
    title?: string
    cameraAngle?: string
    cameraMovement?: string
    status?: number
    storyboardNo?: number
    [k: string]: any
  }
  interface Group {
    key: string
    label: string
    items: ShotItem[]
  }
  const props = withDefaults(
    defineProps<{
      items: ShotItem[]
      selectedIds?: string[]
      activeId?: string | null
      selectable?: boolean
      loading?: boolean
      groupBy?: 'episode' | 'status' | 'scene'
    }>(),
    { selectedIds: () => [] }
  )
  defineEmits<{
    (e: 'select', item: ShotItem): void
    (e: 'open', item: ShotItem): void
    (e: 'toggle', payload: { id: string; selected: boolean }): void
  }>()

  const groups = computed<Group[]>(() => {
    if (!props.items?.length) return []
    if (props.groupBy === 'status') {
      return groupByStatus(props.items)
    }
    return groupByEpisode(props.items)
  })

  function groupByEpisode(items: ShotItem[]): Group[] {
    const map = new Map<string, Group>()
    items.forEach((it) => {
      const key = it.episodeId || 'ungrouped'
      const label = it.episodeName || `第${it.episodeIndex || '-'}集`
      if (!map.has(key)) map.set(key, { key, label, items: [] })
      map.get(key)!.items.push(it)
    })
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'))
  }

  function groupByStatus(items: ShotItem[]): Group[] {
    const map = new Map<number, Group>()
    const labels: Record<number, string> = { 1: '草稿', 2: '待审核', 3: '已通过', 4: '已驳回' }
    items.forEach((it) => {
      const s = (it.status || 1) as number
      if (!map.has(s)) map.set(s, { key: String(s), label: labels[s] || '其他', items: [] })
      map.get(s)!.items.push(it)
    })
    return Array.from(map.values()).sort((a, b) => Number(a.key) - Number(b.key))
  }
</script>

<style lang="scss" scoped>
  .storyboard-board {
    .board-groups {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .board-group {
      .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .group-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }

      .group-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 12px;
      }
    }
  }
</style>
