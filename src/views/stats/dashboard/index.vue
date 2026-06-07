<template>
  <div class="stats-dashboard-page art-full-height" v-loading="isLoading">
    <!-- 错误提示 -->
    <ElAlert
      v-if="hasError"
      type="error"
      :title="errorMessage"
      show-icon
      :closable="false"
      class="mb-5"
    />

    <!-- 核心指标卡片 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol v-for="(item, index) in dashboardCards" :key="index" :sm="12" :md="6" :lg="6">
        <div class="art-card relative flex flex-col justify-center h-35 px-5">
          <span class="text-g-700 text-sm">{{ item.label }}</span>
          <ArtCountTo
            class="text-[26px] font-medium mt-2"
            :target="item.value"
            :duration="1300"
            :decimals="item.decimals"
            :separator="','"
          />
          <div class="flex-c mt-1">
            <span class="text-xs text-g-600">较上周</span>
            <span
              class="ml-1 text-xs font-semibold"
              :class="[item.change.startsWith('+') ? 'text-success' : 'text-danger']"
            >
              {{ item.change }}
            </span>
          </div>
          <div
            class="absolute top-0 bottom-0 right-5 m-auto size-12.5 rounded-xl flex-cc bg-theme/10"
          >
            <ArtSvgIcon :icon="item.icon" class="text-xl text-theme" />
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 柱状图 + 折线图 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">项目产出统计</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各月项目数与视频数对比（柱状图）</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="outputBarData"
            :xAxisData="monthXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">数据趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">存储与AI使用量变化趋势（折线图）</p>
            </div>
          </div>
          <ArtLineChart
            height="20rem"
            :data="trendLineData"
            :xAxisData="trendXAxis"
            :showAreaColor="true"
            :showLegend="true"
            legendPosition="bottom"
            :showAxisLine="true"
            :showSplitLine="true"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 饼图 + 雷达图 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">资源使用占比</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各类资源消耗分布（饼图）</p>
            </div>
          </div>
          <ArtRingChart
            height="20rem"
            :data="resourcePieData"
            :showLegend="true"
            legendPosition="bottom"
            :radius="['40%', '70%']"
            centerText="资源"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">团队能力雷达</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各维度能力评估（雷达图）</p>
            </div>
          </div>
          <ArtRadarChart
            height="20rem"
            :indicator="radarIndicators"
            :data="radarData"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 热力图 + 散点图 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">活跃度热力图</h4>
              <p class="text-sm text-g-500 mt-1 m-0">每日各时段操作活跃度分布</p>
            </div>
          </div>
          <div ref="heatmapRef" class="w-full" style="height: 20rem"></div>
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">产出效率散点</h4>
              <p class="text-sm text-g-500 mt-1 m-0">视频数与时长关系分布（散点图）</p>
            </div>
          </div>
          <ArtScatterChart
            height="20rem"
            :data="scatterData"
            :showAxisLine="true"
            :showSplitLine="true"
          />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { useChart } from '@/hooks/core/useChart'
  import { useStatsDashboardModel } from '@/domain/statistics/composables'

  defineOptions({ name: 'StatsDashboard' })

  const {
    isLoading,
    hasError,
    errorMessage,
    dashboardCards,
    monthXAxis,
    trendXAxis,
    outputBarData,
    trendLineData,
    resourcePieData,
    radarIndicators,
    radarData,
    scatterData,
    heatmapData,
    generateHeatmapOptions
  } = useStatsDashboardModel()

  // 活跃度热力图（基于实时活动派生，无数据时显示空）
  const heatmapRef = ref<HTMLElement>()
  const { initChart, destroyChart } = useChart()

  // 热力图响应数据变化
  watch(heatmapData, () => {
    if (heatmapRef.value) {
      initChart(generateHeatmapOptions())
    }
  })

  onMounted(() => {
    nextTick(() => {
      if (heatmapRef.value) {
        initChart(generateHeatmapOptions())
      }
    })
  })

  onBeforeUnmount(() => {
    destroyChart()
  })
</script>
