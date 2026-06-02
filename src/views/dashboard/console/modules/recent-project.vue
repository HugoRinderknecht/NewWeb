<template>
  <div class="art-card p-5 h-128 overflow-hidden mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>最近的项目</h4>
        <p>本月新增<span class="text-success">+5</span></p>
      </div>
      <ElRadioGroup v-model="radio2">
        <ElRadioButton value="本月" label="本月"></ElRadioButton>
        <ElRadioButton value="上月" label="上月"></ElRadioButton>
        <ElRadioButton value="今年" label="今年"></ElRadioButton>
      </ElRadioGroup>
    </div>
    <ArtTable
      class="w-full"
      :data="tableData"
      style="width: 100%"
      size="large"
      :border="false"
      :stripe="false"
      :header-cell-style="{ background: 'transparent' }"
    >
      <template #default>
        <ElTableColumn label="项目名称" prop="name" width="180px">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <div
                class="size-9 rounded-lg flex-cc text-white text-sm font-medium"
                :style="{ background: scope.row.color }"
              >
                {{ scope.row.name.charAt(0) }}
              </div>
              <span class="ml-2">{{ scope.row.name }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="类型" prop="type" />
        <ElTableColumn label="负责人" prop="owner" />
        <ElTableColumn label="进度" width="240">
          <template #default="scope">
            <ElProgress
              :percentage="scope.row.pro"
              :color="scope.row.color"
              :stroke-width="4"
              :aria-label="`${scope.row.name}的完成进度: ${scope.row.pro}%`"
            />
          </template>
        </ElTableColumn>
      </template>
    </ArtTable>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetProjectList } from '@/api/project'

  interface ProjectTableItem {
    name: string
    type: string
    owner: string
    percentage: number
    pro: number
    color: string
  }

  const ANIMATION_DELAY = 100

  const radio2 = ref('本月')

  const COLORS = [
    'var(--art-primary)',
    'var(--art-secondary)',
    'var(--art-warning)',
    'var(--art-info)',
    'var(--art-error)',
    'var(--art-success)'
  ]

  /**
   * 最近项目表格数据
   * 包含项目基本信息和完成进度
   */
  const tableData = reactive<ProjectTableItem[]>([])

  const loadData = async () => {
    try {
      const res = await fetchGetProjectList({ current: 1, size: 6 })
      if (res?.records) {
        tableData.splice(
          0,
          tableData.length,
          ...res.records.map((item: any, index: number) => ({
            name: item.projectName ?? item.name ?? '',
            type: item.type ?? '',
            owner: item.owner ?? '',
            percentage: item.progress ?? 0,
            pro: 0,
            color: COLORS[index % COLORS.length]
          }))
        )
        addAnimation()
      }
    } catch (error) {
      console.error('获取项目列表失败:', error)
    }
  }

  /**
   * 添加进度条动画效果
   * 延迟后将进度值从 0 更新到目标百分比，触发动画
   */
  const addAnimation = (): void => {
    setTimeout(() => {
      tableData.forEach((item) => {
        item.pro = item.percentage
      })
    }, ANIMATION_DELAY)
  }

  onMounted(() => {
    loadData()
  })
</script>

<style lang="scss" scoped>
  .art-card {
    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: var(--el-color-primary) !important;
      background: transparent !important;
    }
  }
</style>
