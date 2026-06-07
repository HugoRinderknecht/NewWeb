<!-- 工作台页面 -->
<template>
  <div class="console-page">
    <!-- ========================================== -->
    <!-- 顶部双层：左列 = 欢迎横幅 + 核心数据概览；右列 = 快捷入口（底部对齐） -->
    <!-- ========================================== -->
    <ElRow :gutter="20" class="top-section">
      <ElCol :sm="24" :md="24" :lg="16">
        <div class="left-stack">
          <WelcomeBanner />
          <div class="kpi-section art-card">
            <div class="kpi-section-header">
              <div class="kpi-section-title">
                <ArtSvgIcon icon="ri:dashboard-3-line" class="kpi-section-icon" />
                <h5>核心数据概览</h5>
              </div>
              <span class="kpi-section-desc">业务与资源关键指标实时统计</span>
            </div>
            <CardList layout="grid-2x2" :start="0" :count="4" :embedded="true" />
          </div>
        </div>
      </ElCol>
      <ElCol :sm="24" :md="24" :lg="8">
        <QuickActions class="quick-actions-full" />
      </ElCol>
    </ElRow>

    <!-- ========================================== -->
    <!-- 业务列表（最近项目 + 待审核 + 最新通知） -->
    <!-- ========================================== -->
    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="12">
        <RecentProject />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <PendingReview />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <LatestNotice />
      </ElCol>
    </ElRow>

    <!-- 新用户引导弹窗 -->
    <OnboardingDialog
      ref="onboardingDialogRef"
      :mode="onboardingMode"
      @complete="handleOnboardingComplete"
      @skip="handleOnboardingSkip"
    />
  </div>
</template>

<script setup lang="ts">
  import CardList from './modules/card-list.vue'
  import WelcomeBanner from './modules/welcome-banner.vue'
  import QuickActions from './modules/quick-actions.vue'
  import RecentProject from './modules/recent-project.vue'
  import PendingReview from './modules/pending-review.vue'
  import LatestNotice from './modules/latest-notice.vue'
  import OnboardingDialog from '@/components/business/onboarding-dialog/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import { useMyTeams } from '@/api/queries'

  defineOptions({ name: 'Console' })

  const userStore = useUserStore()
  const onboardingDialogRef = ref<InstanceType<typeof OnboardingDialog>>()
  const onboardingMode = ref<'full' | 'inviteOnly'>('full')
  const onboardingChecked = ref(false)

  const { data: teamsData } = useMyTeams()

  /**
   * 前置验证检查，决定引导弹窗的显示模式
   * a. 用户名和邮箱均未填写 → 完整引导（full）
   * b. 用户名和邮箱已填写但未加入团队 → 仅邀请码（inviteOnly）
   * c. 用户名和邮箱已填写且已加入团队 → 不显示
   */
  const checkOnboardingStatus = () => {
    if (onboardingChecked.value) return

    const userInfo = userStore.info
    if (!userInfo) return

    const hasUsername = !!userInfo.username
    const hasEmail = !!userInfo.email

    // 已填写用户名和邮箱，检查是否已加入团队
    if (hasUsername && hasEmail) {
      const teams = teamsData.value
      if (teams === undefined) return // 数据还在加载中，等 watch 触发

      const hasTeam = Array.isArray(teams) && teams.length > 0

      if (hasTeam) {
        // 情况c：信息完整且已加入团队，无需引导
        onboardingChecked.value = true
        return
      } else {
        // 情况b：信息完整但未加入团队，仅显示邀请码步骤
        onboardingMode.value = 'inviteOnly'
      }
    } else {
      // 情况a：用户名或邮箱未填写，显示完整引导
      onboardingMode.value = 'full'
    }

    onboardingChecked.value = true
    // 延迟显示弹窗，确保页面渲染完成
    nextTick(() => {
      onboardingDialogRef.value?.open()
    })
  }

  // 当团队数据加载完成时触发检查
  // 使用 immediate: true 解决 watch 注册时机晚于数据返回的竞态问题
  watch(
    teamsData,
    () => {
      checkOnboardingStatus()
    },
    { immediate: true }
  )

  const handleOnboardingComplete = () => {
    // 引导完成，可在此处执行额外逻辑（如刷新用户信息）
  }

  const handleOnboardingSkip = () => {
    // 用户跳过引导
  }

  onMounted(() => {
    checkOnboardingStatus()
  })
</script>

<style lang="scss" scoped>
  .console-page {
    width: 100%;

    // 行间距统一控制
    :deep(.el-row) {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  // 顶部区域：左列垂直堆叠（欢迎横幅 + 核心数据概览），右列快捷入口等高
  .top-section {
    :deep(.el-col) {
      display: flex;
    }
  }

  .left-stack {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  // 快捷入口拉满右列高度（与左列底部对齐）
  .quick-actions-full {
    flex: 1;
    height: 100%;
  }

  // 第二层（原）：核心指标 2x2 网格容器
  .kpi-section {
    box-sizing: border-box;
    padding: 14px 18px;
    margin-bottom: 0;
    border-radius: 8px;
  }

  .kpi-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--art-gray-200);
  }

  .kpi-section-title {
    display: flex;
    align-items: center;
    gap: 6px;

    h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-900);
    }
  }

  .kpi-section-icon {
    font-size: 15px;
    color: var(--art-primary);
  }

  .kpi-section-desc {
    font-size: 12px;
    color: var(--art-gray-500);
  }

  @media (max-width: 992px) {
    // 中等屏幕以下：快捷入口不强制等高
    .quick-actions-full {
      height: auto;
    }
  }

  @media (max-width: 768px) {
    .kpi-section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
</style>
