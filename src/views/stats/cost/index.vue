<template>
  <div class="stats-cost-page art-full-height" v-loading="isLoading">
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
      <ElCol v-for="(item, index) in coreMetrics" :key="index" :sm="12" :md="6" :lg="6">
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

    <!-- 积分趋势 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">积分消耗趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">按日/周/月查看积分消耗变化趋势</p>
            </div>
            <ElRadioGroup v-model="trendPeriod" size="small">
              <ElRadioButton label="day">按日</ElRadioButton>
              <ElRadioButton label="week">按周</ElRadioButton>
              <ElRadioButton label="month">按月</ElRadioButton>
            </ElRadioGroup>
          </div>
          <ArtLineChart
            height="22rem"
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

    <!-- 功能分布与成本预测 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">功能分布</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各功能模块积分消耗占比</p>
            </div>
          </div>
          <ArtRingChart
            height="20rem"
            :data="featureDistributionData"
            :showLegend="true"
            legendPosition="bottom"
            centerText="总积分"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">成本预测</h4>
              <p class="text-sm text-g-500 mt-1 m-0">基于历史数据的未来成本预测</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="forecastBarData"
            :xAxisData="forecastXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- 费用明细 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="24">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">费用明细</span>
                <ElTag type="info" size="small">按功能模块统计</ElTag>
              </div>
              <ElSpace>
                <ElInput
                  v-model="searchQuery"
                  placeholder="搜索功能/项目"
                  clearable
                  style="width: 220px"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="filterType"
                  placeholder="类型筛选"
                  clearable
                  style="width: 140px"
                >
                  <ElOption
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
                <ElButton type="primary" @click="handleExport">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  导出
                </ElButton>
              </ElSpace>
            </div>
          </template>
          <ArtTable
            :data="filteredCostList"
            :columns="columns"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
            <template #default>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="功能模块" min-width="160">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <ArtSvgIcon :icon="row.icon" class="text-g-400" />
                    <span>{{ row.feature }}</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="projectName" label="项目" min-width="160" />
              <ElTableColumn label="类型" width="120">
                <template #default="{ row }">
                  <ElTag :type="typeTagMap[row.type]" size="small">{{ row.type }}</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="credits" label="消耗积分" width="130" align="right">
                <template #default="{ row }">
                  <span class="font-medium">{{ formatNumber(row.credits) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="amount" label="金额" width="100" align="right">
                <template #default="{ row }">
                  <span class="text-g-600">{{ row.amount }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="usageCount" label="使用次数" width="100" align="center" />
              <ElTableColumn prop="date" label="日期" width="120" />
            </template>
          </ArtTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { useStatsCostModel } from '@/domain/statistics/composables'

  defineOptions({ name: 'StatsCost' })

  const {
    isLoading,
    hasError,
    errorMessage,
    coreMetrics,
    trendPeriod,
    trendXAxis,
    trendLineData,
    featureDistributionData,
    forecastXAxis,
    forecastBarData,
    columns,
    pagination,
    searchQuery,
    filterType,
    typeOptions,
    typeTagMap,
    filteredCostList,
    handleSizeChange,
    handleCurrentChange,
    formatNumber
  } = useStatsCostModel()

  const handleExport = () => {
    ElMessage.success('费用明细导出成功')
  }
</script>

<style lang="scss" scoped>
  .stats-cost-page {
    height: 100%;
  }
</style>
