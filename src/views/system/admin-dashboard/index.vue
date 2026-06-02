<template>
  <div class="art-full-height p-4">
    <!-- 统计卡片 -->
    <ElRow :gutter="16" class="mb-4">
      <ElCol :span="6">
        <ElCard shadow="hover">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white"
            >
              <ArtSvgIcon icon="ri:user-line" :size="24" />
            </div>
            <div>
              <div class="text-g-400 text-sm">总用户数</div>
              <div class="text-2xl font-bold">{{ totalUsers }}</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-lg bg-success flex items-center justify-center text-white"
            >
              <ArtSvgIcon icon="ri:team-line" :size="24" />
            </div>
            <div>
              <div class="text-g-400 text-sm">总团队数</div>
              <div class="text-2xl font-bold">{{ activeUsers }}</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-lg bg-warning flex items-center justify-center text-white"
            >
              <ArtSvgIcon icon="ri:folder-line" :size="24" />
            </div>
            <div>
              <div class="text-g-400 text-sm">总项目数</div>
              <div class="text-2xl font-bold">{{ totalProjects }}</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="6">
        <ElCard shadow="hover">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-danger flex items-center justify-center text-white">
              <ArtSvgIcon icon="ri:flash-line" :size="24" />
            </div>
            <div>
              <div class="text-g-400 text-sm">今日AI调用</div>
              <div class="text-2xl font-bold">{{ dailyVisits }}</div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 图表区域 -->
    <ElRow :gutter="16">
      <ElCol :span="12" class="mb-4">
        <ElCard shadow="never">
          <div class="text-lg font-medium mb-4">用户增长趋势</div>
          <div class="h-64 bg-g-200 rounded flex items-center justify-center text-g-400">
            [ECharts 用户增长图表]
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12" class="mb-4">
        <ElCard shadow="never">
          <div class="text-lg font-medium mb-4">团队活跃度</div>
          <div class="h-64 bg-g-200 rounded flex items-center justify-center text-g-400">
            [ECharts 团队活跃度图表]
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard shadow="never">
          <div class="text-lg font-medium mb-4">存储使用统计</div>
          <div class="h-64 bg-g-200 rounded flex items-center justify-center text-g-400">
            [ECharts 存储使用图表]
          </div>
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard shadow="never">
          <div class="text-lg font-medium mb-4">AI服务调用分布</div>
          <div class="h-64 bg-g-200 rounded flex items-center justify-center text-g-400">
            [ECharts 服务调用饼图]
          </div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetDashboard } from '@/api/statistics'

  const dashboardData = ref<Api.Statistics.DashboardData | null>(null)
  const loading = ref(false)

  const loadDashboard = async () => {
    loading.value = true
    try {
      dashboardData.value = await fetchGetDashboard()
    } catch {
      console.error('加载仪表盘数据失败')
    } finally {
      loading.value = false
    }
  }

  const totalUsers = computed(() => dashboardData.value?.totalUsers ?? '0')
  const totalProjects = computed(() => String(dashboardData.value?.totalProjects ?? 0))
  const activeUsers = computed(() => String(dashboardData.value?.activeUsers?.values?.length ?? 0))
  const dailyVisits = computed(() => dashboardData.value?.dailyVisits ?? '0')

  onMounted(() => {
    loadDashboard()
  })
</script>
