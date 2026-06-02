<template>
  <div class="points-transactions-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">交易记录</span>
            <ElTag type="info" size="small">积分交易历史</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索交易号/备注"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterType" placeholder="类型筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElDatePicker
              v-model="filterDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
            <ElButton type="primary" @click="handleExport">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              导出
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ArtTable
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="交易号" min-width="180">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:receipt-line" class="text-g-400" />
                <span class="font-medium">{{ scope.row.tradeNo }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="类型" width="120">
            <template #default="scope">
              <ElTag :type="typeTagMap[scope.row.type as TransactionType]" size="small">
                {{ typeLabelMap[scope.row.type as TransactionType] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="金额" width="140" align="right">
            <template #default="scope">
              <span
                :class="[
                  scope.row.amount.startsWith('+') ? 'text-success' : 'text-danger',
                  'font-medium'
                ]"
              >
                {{ scope.row.amount }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="余额" width="140" align="right">
            <template #default="scope">
              <span class="text-g-600">{{ scope.row.balance }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="channel" label="渠道" width="120" />
          <ElTableColumn prop="remark" label="备注" min-width="200" show-overflow-tooltip />
          <ElTableColumn prop="createTime" label="交易时间" width="160" sortable />
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                {{ scope.row.status === 'success' ? '成功' : '失败' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120" fixed="right">
            <template #default="scope">
              <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                详情
              </ElButton>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 交易详情弹窗 -->
    <ElDialog v-model="detailVisible" title="交易详情" width="520px" align-center destroy-on-close>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="交易号">{{ currentRow?.tradeNo }}</ElDescriptionsItem>
        <ElDescriptionsItem label="类型">
          <ElTag :type="typeTagMap[currentRow?.type || 'recharge']" size="small">
            {{ typeLabelMap[currentRow?.type || 'recharge'] }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="金额">{{ currentRow?.amount }}</ElDescriptionsItem>
        <ElDescriptionsItem label="余额">{{ currentRow?.balance }}</ElDescriptionsItem>
        <ElDescriptionsItem label="渠道">{{ currentRow?.channel }}</ElDescriptionsItem>
        <ElDescriptionsItem label="备注">{{ currentRow?.remark }}</ElDescriptionsItem>
        <ElDescriptionsItem label="交易时间">{{ currentRow?.createTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="currentRow?.status === 'success' ? 'success' : 'danger'" size="small">
            {{ currentRow?.status === 'success' ? '成功' : '失败' }}
          </ElTag>
        </ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="detailVisible = false">关闭</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { fetchGetCreditTransactions } from '@/api/points'

  defineOptions({ name: 'PointsTransactions' })

  type TransactionType = 'recharge' | 'consume' | 'refund' | 'gift'

  interface TransactionItem {
    id: number
    tradeNo: string
    type: TransactionType
    amount: string
    balance: string
    channel: string
    remark: string
    createTime: string
    status: 'success' | 'failed'
  }

  const searchQuery = ref('')
  const filterType = ref<TransactionType | ''>('')
  const filterDateRange = ref<[Date, Date] | null>(null)
  const selectedItems = ref<TransactionItem[]>([])
  const detailVisible = ref(false)
  const currentRow = ref<TransactionItem | null>(null)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const typeOptions = [
    { label: '充值', value: 'recharge' },
    { label: '消费', value: 'consume' },
    { label: '退款', value: 'refund' },
    { label: '赠送', value: 'gift' }
  ]

  const typeTagMap: Record<TransactionType, 'primary' | 'success' | 'warning' | 'info'> = {
    recharge: 'success',
    consume: 'primary',
    refund: 'warning',
    gift: 'info'
  }

  const typeLabelMap: Record<TransactionType, string> = {
    recharge: '充值',
    consume: '消费',
    refund: '退款',
    gift: '赠送'
  }

  const list = ref<TransactionItem[]>([])

  const loadList = async () => {
    try {
      const data = await fetchGetCreditTransactions()
      if (data) {
        list.value = (Array.isArray(data) ? data : (data as any).records || []).map(
          (item: any) => ({
            id: item.id,
            tradeNo: item.tradeNo || '',
            type: item.type || 'recharge',
            amount: item.amount || '',
            balance: item.balance || '',
            channel: item.channel || '',
            remark: item.remark || '',
            createTime: item.createTime || '',
            status: item.status || 'success'
          })
        ) as TransactionItem[]
      }
    } catch {
      ElMessage.error('加载交易记录失败')
    }
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'tradeNo', label: '交易号', minWidth: 180 },
    { prop: 'type', label: '类型', width: 120 },
    { prop: 'amount', label: '金额', width: 140 },
    { prop: 'balance', label: '余额', width: 140 },
    { prop: 'channel', label: '渠道', width: 120 },
    { prop: 'remark', label: '备注', minWidth: 200 },
    { prop: 'createTime', label: '交易时间', width: 160, sortable: true },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 120, fixed: 'right' }
  ]

  const filteredList = computed(() => {
    let result = list.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.tradeNo.toLowerCase().includes(q) || item.remark.toLowerCase().includes(q)
      )
    }

    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }

    if (filterDateRange.value && filterDateRange.value.length === 2) {
      const [start, end] = filterDateRange.value
      result = result.filter((item) => {
        const d = new Date(item.createTime)
        return d >= start && d <= end
      })
    }

    return result
  })

  const pagedList = computed(() => {
    const list = filteredList.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredList, (list) => {
    pagination.total = list.length
  })

  const handleSelectionChange = (selection: TransactionItem[]) => {
    selectedItems.value = selection
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleView = (row: TransactionItem) => {
    currentRow.value = row
    detailVisible.value = true
  }

  const handleExport = () => {
    ElMessage.success('交易记录导出成功')
  }

  onMounted(() => {
    loadList()
  })
</script>

<style lang="scss" scoped>
  .points-transactions-page {
    height: 100%;
  }
</style>
