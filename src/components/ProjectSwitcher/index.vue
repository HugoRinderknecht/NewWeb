<template>
  <div class="project-switcher-component">
    <div class="flex items-center gap-3">
      <span class="switch-label">
        <ArtSvgIcon icon="ri:stack-line" class="mr-1" />
        当前项目
      </span>
      <ElSelect
        v-model="selectedProjectId"
        placeholder="选择项目"
        style="width: 220px"
        @change="handleProjectChange"
      >
        <ElOption
          v-for="project in projectList"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        >
          <div class="flex items-center gap-2">
            <ArtSvgIcon icon="ri:folder-3-line" class="text-g-400" />
            <span>{{ project.name }}</span>
            <ElTag
              v-if="project.scriptCount !== undefined"
              type="info"
              size="small"
              class="ml-auto"
            >
              {{ project.scriptCount }} 部
            </ElTag>
          </div>
        </ElOption>
      </ElSelect>
      <ElButton text size="small" @click="handleRefresh">
        <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
        刷新
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ProjectSwitcher' })

  export interface ProjectItem {
    id: string
    name: string
    scriptCount?: number
  }

  interface Props {
    modelValue: string
    projectList: ProjectItem[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', projectId: string, project: ProjectItem | undefined): void
    (e: 'refresh', projectId: string): void
  }>()

  const selectedProjectId = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const handleProjectChange = (projectId: string) => {
    const project = props.projectList.find((p) => p.id === projectId)
    emit('change', projectId, project)
    ElMessage.success(`已切换到项目「${project?.name}」`)
  }

  const handleRefresh = () => {
    emit('refresh', selectedProjectId.value)
    ElMessage.success('数据已刷新')
  }
</script>

<style lang="scss" scoped>
  .project-switcher-component {
    .switch-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      white-space: nowrap;
    }
  }
</style>
