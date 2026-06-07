<template>
  <div class="stats-ai-usage-page art-full-height" v-loading="isLoading">
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

    <!-- 趋势图表 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="24" :lg="24">
        <div class="art-card p-5">
          <div class="flex-cb mb-4">
            <div>
              <h4 class="text-lg font-medium m-0">AI 用量趋势</h4>
              <p class="text-sm text-g-500 mt-1 m-0">按日/周/月查看 Token 消耗与请求次数变化趋势</p>
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

    <!-- 模型分布与项目分布 -->
    <ElRow :gutter="20" class="mb-5">
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">模型分布</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各 AI 模型 Token 消耗占比</p>
            </div>
          </div>
          <ArtRingChart
            height="20rem"
            :data="modelDistributionData"
            :showLegend="true"
            legendPosition="bottom"
            centerText="总Token"
          />
        </div>
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="12">
        <div class="art-card p-5">
          <div class="art-card-header mb-4">
            <div class="title">
              <h4 class="m-0">项目分布</h4>
              <p class="text-sm text-g-500 mt-1 m-0">各项目 AI 用量排行</p>
            </div>
          </div>
          <ArtBarChart
            height="20rem"
            :data="projectBarData"
            :xAxisData="projectXAxis"
            :showAxisLine="true"
            :showSplitLine="true"
            :showLegend="false"
          />
        </div>
      </ElCol>
    </ElRow>

    <!-- Token 明细 -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="24">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex-cb">
              <div class="flex items-center gap-4">
                <span class="text-lg font-medium">Token 消耗明细</span>
                <ElTag type="info" size="small">按请求记录统计</ElTag>
              </div>
              <ElSpace>
                <ElInput
                  v-model="searchQuery"
                  placeholder="搜索项目/模型"
                  clearable
                  style="width: 220px"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="filterModel"
                  placeholder="模型筛选"
                  clearable
                  style="width: 140px"
                >
                  <ElOption
                    v-for="item in modelOptions"
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
            :data="filteredTokenList"
            :columns="columns"
            :pagination="pagination"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          >
            <template #default>
              <ElTableColumn type="index" label="序号" width="70" align="center" />
              <ElTableColumn label="项目" min-width="180">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <ArtSvgIcon icon="ri:folder-3-line" class="text-g-400" />
                    <span>{{ row.projectName }}</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="模型" width="160">
                <template #default="{ row }">
                  <ElTag :type="modelTagMap[row.model] || 'info'" size="small">
                    {{ row.model }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="requestType" label="请求类型" width="140" />
              <ElTableColumn prop="inputTokens" label="Input Tokens" width="130" align="right">
                <template #default="{ row }">
                  <span>{{ formatNumber(row.inputTokens) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="outputTokens" label="Output Tokens" width="140" align="right">
                <template #default="{ row }">
                  <span>{{ formatNumber(row.outputTokens) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="totalTokens" label="总 Tokens" width="130" align="right">
                <template #default="{ row }">
                  <span class="font-medium">{{ formatNumber(row.totalTokens) }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="cost" label="费用" width="100" align="right">
                <template #default="{ row }">
                  <span class="text-g-600">{{ row.cost }}</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="requestTime" label="请求时间" width="160" />
            </template>
          </ArtTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { useStatsAiUsageModel } from '@/domain/statistics/composables'

  defineOptions({ name: 'StatsAiUsage' })

  const {
    isLoading,
    hasError,
    errorMessage,
    coreMetrics,
    trendPeriod,
    trendXAxis,
    trendLineData,
    modelDistributionData,
    projectXAxis,
    projectBarData,
    columns,
    pagination,
    searchQuery,
    filterModel,
    modelOptions,
    modelTagMap,
    filteredTokenList,
    handleSizeChange,
    handleCurrentChange,
    formatNumber
  } = useStatsAiUsageModel()

  const handleExport = () => {
    ElMessage.success('Token 明细导出成功')
  }
</script>

<style lang="scss" scoped>
  .stats-ai-usage-page {
    height: 100%;
  }
</style>
