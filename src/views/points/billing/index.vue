<template>
  <div class="points-billing-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">用量计费</span>
        </div>
      </template>
      <ElTable :data="billingList" style="width: 100%">
        <ElTableColumn prop="service" label="服务" />
        <ElTableColumn prop="usage" label="用量" />
        <ElTableColumn prop="unit" label="单位" />
        <ElTableColumn prop="cost" label="费用" />
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useMyCredits } from '@/api/queries'

  defineOptions({ name: 'PointsBilling' })

  const { data: creditsData } = useMyCredits()

  const billingList = computed(() => {
    const data = creditsData.value
    if (!data) return []
    return [
      {
        service: '积分余额',
        usage: String(data.balance),
        unit: '积分',
        cost: `¥${data.balance}`
      },
      {
        service: '累计获得',
        usage: String(data.totalEarned),
        unit: '积分',
        cost: `¥${data.totalEarned}`
      },
      {
        service: '累计消费',
        usage: String(data.totalSpent),
        unit: '积分',
        cost: `¥${data.totalSpent}`
      }
    ]
  })
</script>
