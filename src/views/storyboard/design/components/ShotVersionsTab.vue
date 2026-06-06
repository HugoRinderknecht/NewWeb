<template>
  <div class="shot-versions-tab">
    <div v-if="loading" class="py-6">
      <ElSkeleton :rows="4" animated />
    </div>
    <ElEmpty v-else-if="!versions?.length" description="暂无版本历史" />
    <ElTimeline v-else class="version-timeline">
      <ElTimelineItem
        v-for="(v, idx) in versions"
        :key="v.id"
        :type="idx === 0 ? 'primary' : 'info'"
        :timestamp="v.createTime"
        placement="top"
      >
        <ElCard shadow="never" class="version-card">
          <div class="flex-cb">
            <div>
              <span class="version-no">v{{ v.version }}</span>
              <ElTag v-if="idx === 0" type="primary" size="small" class="ml-2">当前</ElTag>
              <span class="version-operator ml-2 text-g-500 text-sm">by {{ v.operator || 'system' }}</span>
            </div>
            <ElButton
              v-if="idx !== 0"
              link
              type="primary"
              size="small"
              :loading="rolling"
              @click="handleRollback(v)"
            >
              <ArtSvgIcon icon="ri:history-line" class="mr-1" />回滚至此版本
            </ElButton>
          </div>
        </ElCard>
      </ElTimelineItem>
    </ElTimeline>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    useStoryboardVersions,
    useRollbackStoryboardVersion
  } from '@/api/queries/storyboard'
  import { useProjectStore } from '@/store/modules/project'

  interface StoryboardVersion {
    id: string
    version: number
    createTime: string
    operator?: string
  }
  const props = defineProps<{ storyboardId: string }>()
  const emit = defineEmits<{ (e: 'rolled-back'): void }>()

  const projectStore = useProjectStore()
  const { data: versions = [], isLoading: loading } = useStoryboardVersions(() => props.storyboardId)
  const { mutateAsync: rollback, isPending: rolling } = useRollbackStoryboardVersion()

  async function handleRollback(v: StoryboardVersion) {
    try {
      await ElMessageBox.confirm(`确定回滚到版本 v${v.version} 吗？回滚前会自动保存当前快照。`, '回滚确认', {
        type: 'warning'
      })
    } catch {
      return
    }
    try {
      await rollback({
        storyboardId: props.storyboardId,
        versionId: v.id,
        projectId: projectStore.currentProjectId
      })
      ElMessage.success('已回滚')
      emit('rolled-back')
    } catch {
      ElMessage.error('回滚失败')
    }
  }
</script>

<style lang="scss" scoped>
  .version-timeline {
    padding: 0 4px;
  }
  .version-card {
    .version-no {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
    .version-operator {
      color: var(--el-text-color-secondary);
    }
  }
</style>
