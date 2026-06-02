<template>
  <ElRow :gutter="20" class="flex">
    <ElCol v-for="(item, index) in dataList" :key="index" :sm="12" :md="6" :lg="6">
      <div class="art-card relative flex flex-col justify-center h-35 px-5 mb-5 max-sm:mb-4">
        <span class="text-g-700 text-sm">{{ item.des }}</span>
        <ArtCountTo class="text-[26px] font-medium mt-2" :target="item.num" :duration="1300" />
        <div class="flex-c mt-1">
          <span class="text-xs text-g-600">较上周</span>
          <span
            class="ml-1 text-xs font-semibold"
            :class="[item.change.indexOf('+') === -1 ? 'text-danger' : 'text-success']"
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
</template>

<script setup lang="ts">
  import { fetchGetDashboard } from '@/api/statistics'

  interface CardDataItem {
    des: string
    icon: string
    startVal: number
    duration: number
    num: number
    change: string
  }

  /**
   * 卡片统计数据列表
   * 展示总访问次数、在线访客数、点击量和新用户等核心数据指标
   */
  const dataList = reactive<CardDataItem[]>([])

  const loadData = async () => {
    try {
      const data = await fetchGetDashboard()
      if (data) {
        dataList.splice(
          0,
          dataList.length,
          ...[
            {
              des: '待处理审核',
              icon: 'ri:pie-chart-line',
              startVal: 0,
              duration: 1000,
              num: data.pendingReviews ?? 0,
              change: data.pendingReviewsChange ?? '+0%'
            },
            {
              des: '项目进度',
              icon: 'ri:group-line',
              startVal: 0,
              duration: 1000,
              num: data.projectProgress ?? 0,
              change: data.projectProgressChange ?? '+0%'
            },
            {
              des: '负责项目数',
              icon: 'ri:fire-line',
              startVal: 0,
              duration: 1000,
              num: data.ownedProjects ?? 0,
              change: data.ownedProjectsChange ?? '+0%'
            },
            {
              des: '积分余额',
              icon: 'ri:progress-2-line',
              startVal: 0,
              duration: 1000,
              num: data.creditsBalance ?? 0,
              change: data.creditsBalanceChange ?? '+0%'
            }
          ]
        )
      }
    } catch (error) {
      console.error('获取核心统计数据失败:', error)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>
