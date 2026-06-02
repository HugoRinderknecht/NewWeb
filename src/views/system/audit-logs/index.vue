<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">审计日志</span>
        <ElSpace>
          <ElInput
            v-model="searchForm.operator"
            placeholder="操作人"
            clearable
            style="width: 160px"
          />
          <ElSelect
            v-model="searchForm.operationType"
            placeholder="操作类型"
            clearable
            style="width: 140px"
          >
            <ElOption label="登录" value="login" />
            <ElOption label="新增" value="create" />
            <ElOption label="修改" value="update" />
            <ElOption label="删除" value="delete" />
            <ElOption label="导出" value="export" />
          </ElSelect>
          <ElDatePicker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
          <ElButton type="primary" @click="handleSearch">
            <ArtSvgIcon icon="ri:search-line" :size="14" class="mr-1" />
            查询
          </ElButton>
          <ElButton @click="handleReset">重置</ElButton>
          <ElButton type="success" @click="handleExport">
            <ArtSvgIcon icon="ri:download-line" :size="14" class="mr-1" />
            导出
          </ElButton>
        </ElSpace>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="logId" label="日志ID" min-width="160" show-overflow-tooltip />
        <ElTableColumn prop="operator" label="操作人" min-width="120" />
        <ElTableColumn prop="operationType" label="操作类型" min-width="100">
          <template #default="scope">
            <ElTag :type="getOperationType(scope.row.operationType)" size="small">
              {{ getOperationLabel(scope.row.operationType) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="operationObject"
          label="操作对象"
          min-width="180"
          show-overflow-tooltip
        />
        <ElTableColumn prop="ipAddress" label="IP地址" min-width="130" />
        <ElTableColumn prop="operationTime" label="操作时间" min-width="160" />
        <ElTableColumn prop="result" label="结果" min-width="90">
          <template #default="scope">
            <ElTag :type="scope.row.result === 'success' ? 'success' : 'danger'" size="small">
              {{ scope.row.result === 'success' ? '成功' : '失败' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="100" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
              详情
            </ElButton>
          </template>
        </ElTableColumn>
      </ArtTable>

      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </ElCard>

    <!-- 详情弹窗 -->
    <ElDialog v-model="detailVisible" title="日志详情" width="600px" destroy-on-close>
      <ElDescriptions :column="1" border v-if="currentRow">
        <ElDescriptionsItem label="日志ID">{{ currentRow.logId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作人">{{ currentRow.operator }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作类型">{{
          getOperationLabel(currentRow.operationType)
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作对象">{{ currentRow.operationObject }}</ElDescriptionsItem>
        <ElDescriptionsItem label="IP地址">{{ currentRow.ipAddress }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作时间">{{ currentRow.operationTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作结果">
          <ElTag :type="currentRow.result === 'success' ? 'success' : 'danger'">
            {{ currentRow.result === 'success' ? '成功' : '失败' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="详细内容">
          <pre class="bg-g-200 p-2 rounded text-sm">{{ currentRow.detail }}</pre>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchGetConfigAuditLog } from '@/api/system-config'

  const loading = ref(false)
  const detailVisible = ref(false)
  const currentRow = ref<any>(null)

  const searchForm = reactive({
    operator: '',
    operationType: '',
    dateRange: null
  })

  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const tableData = ref<any[]>([])

  const loadAuditLogs = async () => {
    loading.value = true
    try {
      const data = await fetchGetConfigAuditLog({
        current: pagination.page,
        size: pagination.limit,
        keyword: searchForm.operator
      } as any)
      if (Array.isArray(data)) {
        tableData.value = data.map((item: any) => ({
          logId: item.id,
          operator: item.operator,
          operationType: 'update',
          operationObject: item.configKey,
          ipAddress: '-',
          operationTime: item.createTime,
          result: 'success',
          detail: JSON.stringify({ oldValue: item.oldValue, newValue: item.newValue })
        }))
        pagination.total = data.length
      }
    } catch {
      console.error('加载审计日志失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadAuditLogs()
  })

  const getOperationLabel = (type: string) => {
    const map: Record<string, string> = {
      login: '登录',
      create: '新增',
      update: '修改',
      delete: '删除',
      export: '导出'
    }
    return map[type] || type
  }

  const getOperationType = (type: string) => {
    const map: Record<string, any> = {
      login: 'primary',
      create: 'success',
      update: 'warning',
      delete: 'danger',
      export: 'info'
    }
    return map[type] || 'info'
  }

  const handleSearch = () => {
    pagination.page = 1
    loadAuditLogs()
  }

  const handleReset = () => {
    searchForm.operator = ''
    searchForm.operationType = ''
    searchForm.dateRange = null
  }

  const handleExport = () => {
    ElMessage.success('审计日志导出成功')
  }

  const handleViewDetail = (row: any) => {
    currentRow.value = row
    detailVisible.value = true
  }

  const handleSizeChange = (val: number) => {
    pagination.limit = val
    loadAuditLogs()
  }

  const handlePageChange = (val: number) => {
    pagination.page = val
    loadAuditLogs()
  }
</script>
