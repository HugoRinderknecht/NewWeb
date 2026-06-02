<!-- 工作台页面 -->
<template>
  <div>
    <CardList></CardList>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <ActiveUser />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </ElCol>
    </ElRow>

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
  import ActiveUser from './modules/active-user.vue'
  import SalesOverview from './modules/sales-overview.vue'
  import RecentProject from './modules/recent-project.vue'
  import PendingReview from './modules/pending-review.vue'
  import LatestNotice from './modules/latest-notice.vue'
  import OnboardingDialog from '@/components/business/onboarding-dialog/index.vue'
  import { useUserStore } from '@/store/modules/user'
  import { fetchGetMyTeams } from '@/api/team'

  defineOptions({ name: 'Console' })

  const userStore = useUserStore()
  const onboardingDialogRef = ref<InstanceType<typeof OnboardingDialog>>()
  const onboardingMode = ref<'full' | 'inviteOnly'>('full')

  /**
   * 前置验证检查，决定引导弹窗的显示模式
   * a. 用户名和邮箱均未填写 → 完整引导（full）
   * b. 用户名和邮箱已填写但未加入团队 → 仅邀请码（inviteOnly）
   * c. 用户名和邮箱已填写且已加入团队 → 不显示
   */
  const checkOnboardingStatus = async () => {
    const userInfo = userStore.info
    if (!userInfo) return

    const hasUsername = !!userInfo.username
    const hasEmail = !!userInfo.email

    // 已填写用户名和邮箱，检查是否已加入团队
    if (hasUsername && hasEmail) {
      try {
        const teams = await fetchGetMyTeams()
        const hasTeam = Array.isArray(teams) && teams.length > 0

        if (hasTeam) {
          // 情况c：信息完整且已加入团队，无需引导
          return
        } else {
          // 情况b：信息完整但未加入团队，仅显示邀请码步骤
          onboardingMode.value = 'inviteOnly'
        }
      } catch {
        // 获取团队信息失败，默认显示邀请码步骤
        onboardingMode.value = 'inviteOnly'
      }
    } else {
      // 情况a：用户名或邮箱未填写，显示完整引导
      onboardingMode.value = 'full'
    }

    // 延迟显示弹窗，确保页面渲染完成
    nextTick(() => {
      onboardingDialogRef.value?.open()
    })
  }

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
