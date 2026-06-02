<template>
  <div class="points-record-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">消费记录</span>
        </div>
      </template>
      <ElTable :data="recordList" style="width: 100%">
        <ElTableColumn prop="time" label="时间" />
        <ElTableColumn prop="type" label="类型" />
        <ElTableColumn prop="amount" label="金额" />
        <ElTableColumn prop="balance" label="余额" />
        <ElTableColumn prop="remark" label="备注" />
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetCreditTransactions } from '@/api/points'

  defineOptions({ name: 'PointsRecord' })

  const recordList = ref<any[]>([])

  const loadRecords = async () => {
    try {
      const data = await fetchGetCreditTransactions({ current: 1, size: 20 })
      if (data) {
        recordList.value = data.records.map((record) => ({
          time: record.createTime,
          type: record.type === 'earn' ? '充值' : '消费',
          amount: record.type === 'earn' ? `+¥${record.amount}` : `-¥${record.amount}`,
          balance: `¥${record.balance}`,
          remark: record.description
        }))
      }
    } catch {
      // ignore
    }
  }

  onMounted(() => {
    loadRecords()
  })
</script>
