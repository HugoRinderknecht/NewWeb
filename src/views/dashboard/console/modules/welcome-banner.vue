<!-- 工作台顶部欢迎横幅 -->
<template>
  <div class="welcome-banner art-card mb-5">
    <div class="banner-content">
      <div class="banner-left">
        <div class="banner-greeting">
          <h2 class="banner-title"> {{ greeting }}，{{ displayName }} </h2>
          <p class="banner-subtitle"> {{ todayText }} · {{ weekdayText }} </p>
        </div>
        <div class="banner-stats">
          <div class="stat-item">
            <span class="stat-value">{{ pendingCount }}</span>
            <span class="stat-label">待处理审核</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ activeProjects }}</span>
            <span class="stat-label">进行中项目</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ unreadCount }}</span>
            <span class="stat-label">未读通知</span>
          </div>
        </div>
      </div>
      <div class="banner-right">
        <div class="banner-illustration">
          <ArtSvgIcon icon="ri:rocket-2-line" class="illustration-icon" />
        </div>
      </div>
    </div>
    <div class="banner-decoration banner-decoration-1"></div>
    <div class="banner-decoration banner-decoration-2"></div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import {
    useStatsDashboard,
    useStatsRealtime,
    useNotificationList,
    usePendingReviewCount
  } from '@/api/queries'

  defineOptions({ name: 'WelcomeBanner' })

  const userStore = useUserStore()

  // 数据获取：统一通过 vue-query hooks
  const { data: dashboardData } = useStatsDashboard()
  const { data: realtimeData } = useStatsRealtime()
  const { data: notificationData } = useNotificationList({ current: 1, size: 50 })
  const { data: pendingReviewCount } = usePendingReviewCount()

  // 显示名称：优先使用 username，否则使用 userName
  const displayName = computed(() => {
    const info = userStore.info
    return info?.username || info?.userName || '同学'
  })

  // 问候语：根据当前小时动态生成
  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    if (hour < 22) return '晚上好'
    return '夜深了'
  })

  // 今日日期文本
  const todayText = computed(() => {
    const now = new Date()
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  })

  // 星期文本
  const weekdayText = computed(() => {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return weekdays[new Date().getDay()]
  })

  // 待处理审核数
  const pendingCount = computed(() => {
    if (typeof pendingReviewCount.value === 'number') return pendingReviewCount.value
    return dashboardData.value?.pendingReviews ?? 0
  })

  // 进行中项目数
  const activeProjects = computed(() => {
    return realtimeData.value?.runningTasks ?? dashboardData.value?.activeProjects ?? 0
  })

  // 未读通知数：基于通知列表数据计算
  const unreadCount = computed(() => {
    const records = notificationData.value?.records
    if (!Array.isArray(records)) return 0
    return records.filter((item: any) => !item.isRead && !item.read).length
  })
</script>

<style lang="scss" scoped>
  .welcome-banner {
    position: relative;
    overflow: hidden;
    padding: 18px 22px;
    background: linear-gradient(135deg, var(--art-primary) 0%, var(--art-secondary) 100%);
    border: none;
    color: #fff;
    box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--art-primary) 40%, transparent);
    margin-bottom: 0;
    height: 100%;
  }

  .banner-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .banner-left {
    flex: 1;
    min-width: 0;
  }

  .banner-greeting {
    margin-bottom: 12px;
  }

  .banner-title {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
    color: #fff;
    margin: 0 0 4px;
  }

  .banner-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  .banner-stats {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.25);
  }

  .banner-right {
    flex-shrink: 0;
  }

  .banner-illustration {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .illustration-icon {
    font-size: 30px;
    color: #fff;
  }

  .banner-decoration {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    pointer-events: none;
  }

  .banner-decoration-1 {
    top: -50px;
    right: -50px;
    width: 160px;
    height: 160px;
  }

  .banner-decoration-2 {
    bottom: -30px;
    right: 100px;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.06);
  }

  @media (max-width: 768px) {
    .welcome-banner {
      padding: 16px 18px;
    }

    .banner-title {
      font-size: 18px;
    }

    .stat-divider {
      display: none;
    }

    .banner-stats {
      gap: 14px;
    }

    .banner-illustration {
      width: 50px;
      height: 50px;
    }

    .illustration-icon {
      font-size: 26px;
    }
  }
</style>
