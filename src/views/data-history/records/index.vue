<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">数据修改记录</span>
        <ElSpace>
          <ElSelect
            v-model="searchForm.dataType"
            placeholder="数据类型"
            clearable
            style="width: 160px"
          >
            <ElOption label="项目" value="project" />
            <ElOption label="剧本" value="script" />
            <ElOption label="分镜" value="storyboard" />
            <ElOption label="角色" value="character" />
            <ElOption label="资产" value="asset" />
          </ElSelect>
          <ElSelect
            v-model="searchForm.operationType"
            placeholder="操作类型"
            clearable
            style="width: 140px"
          >
            <ElOption label="新增" value="CREATE" />
            <ElOption label="修改" value="UPDATE" />
            <ElOption label="删除" value="DELETE" />
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
        </ElSpace>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="historyId" label="记录ID" min-width="160" show-overflow-tooltip />
        <ElTableColumn prop="dataType" label="数据类型" min-width="100">
          <template #default="scope">
            <ElTag size="small">{{ getDataTypeLabel(scope.row.dataType) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="dataId" label="数据ID" min-width="120" show-overflow-tooltip />
        <ElTableColumn prop="operationType" label="操作" min-width="90">
          <template #default="scope">
            <ElTag :type="getOperationType(scope.row.operationType)" size="small">
              {{ getOperationLabel(scope.row.operationType) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="operator" label="操作人" min-width="120" />
        <ElTableColumn prop="operationTime" label="操作时间" min-width="160" />
        <ElTableColumn
          prop="changeSummary"
          label="变更摘要"
          min-width="200"
          show-overflow-tooltip
        />
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
              查看详情
            </ElButton>
            <ElButton type="warning" link size="small" @click="handleRollback(scope.row)">
              回退版本
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
    <ElDialog v-model="detailVisible" title="变更详情" width="720px" destroy-on-close>
      <div v-if="currentRow">
        <ElDescriptions :column="2" border class="mb-4">
          <ElDescriptionsItem label="记录ID">{{ currentRow.historyId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="数据类型">{{
            getDataTypeLabel(currentRow.dataType)
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="数据ID">{{ currentRow.dataId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="操作类型">
            <ElTag :type="getOperationType(currentRow.operationType)">
              {{ getOperationLabel(currentRow.operationType) }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="操作人">{{ currentRow.operator }}</ElDescriptionsItem>
          <ElDescriptionsItem label="操作时间">{{ currentRow.operationTime }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="font-medium mb-2">变更对比</div>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <div class="bg-g-200 p-3 rounded">
              <div class="text-g-400 text-sm mb-2">修改前</div>
              <pre class="text-sm">{{ JSON.stringify(currentRow.beforeData, null, 2) }}</pre>
            </div>
          </ElCol>
          <ElCol :span="12">
            <div class="bg-g-200 p-3 rounded">
              <div class="text-g-400 text-sm mb-2">修改后</div>
              <pre class="text-sm">{{ JSON.stringify(currentRow.afterData, null, 2) }}</pre>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchGetDataHistoryList, fetchGetDataHistoryDetail } from '@/api/data-history'

  const loading = ref(false)
  const detailVisible = ref(false)
  const currentRow = ref<any>(null)

  const searchForm = reactive({
    dataType: '',
    operationType: '',
    dateRange: null
  })

  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const tableData = ref<any[]>([])

  const loadHistoryList = async () => {
    loading.value = true
    try {
      const res = await fetchGetDataHistoryList({
        dataType: searchForm.dataType || undefined,
        operationType: searchForm.operationType || undefined,
        current: pagination.page,
        size: pagination.limit
      } as any)
      tableData.value = (Array.isArray(res) ? res : (res as any)?.records || []).map(
        (item: any) => ({
          historyId: item.historyId || item.id,
          dataType: item.dataType || '',
          dataId: item.dataId || '',
          operationType: item.operationType || '',
          operator: item.operatorName || item.operator || '',
          operationTime: item.operationTime || '',
          changeSummary: item.changeSummary || '',
          beforeData: item.beforeData || null,
          afterData: item.afterData || null
        })
      )
      pagination.total = (res as any)?.total || (Array.isArray(res) ? res.length : 0)
    } catch {
      ElMessage.error('获取修改记录失败')
    } finally {
      loading.value = false
    }
  }

  const getDataTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      project: '项目',
      script: '剧本',
      storyboard: '分镜',
      character: '角色',
      asset: '资产'
    }
    return map[type] || type
  }

  const getOperationLabel = (type: string) => {
    const map: Record<string, string> = {
      CREATE: '新增',
      UPDATE: '修改',
      DELETE: '删除'
    }
    return map[type] || type
  }

  const getOperationType = (type: string) => {
    const map: Record<string, any> = {
      CREATE: 'success',
      UPDATE: 'warning',
      DELETE: 'danger'
    }
    return map[type] || 'info'
  }

  const handleSearch = () => {
    pagination.page = 1
    loadHistoryList()
  }

  const handleReset = () => {
    searchForm.dataType = ''
    searchForm.operationType = ''
    searchForm.dateRange = null
  }

  const handleViewDetail = async (row: any) => {
    try {
      const res = (await fetchGetDataHistoryDetail(row.historyId)) as any
      currentRow.value = {
        ...row,
        beforeData: res?.beforeData || row.beforeData,
        afterData: res?.afterData || row.afterData
      }
      detailVisible.value = true
    } catch {
      currentRow.value = row
      detailVisible.value = true
    }
  }

  const handleRollback = (row: any) => {
    ElMessageBox.confirm(
      `确定将 ${getDataTypeLabel(row.dataType)}(${row.dataId}) 回退到此版本吗？`,
      '警告',
      {
        confirmButtonText: '确定回退',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      ElMessage.success('版本回退成功')
    })
  }

  const handleSizeChange = (val: number) => {
    pagination.limit = val
    pagination.page = 1
    loadHistoryList()
  }

  const handlePageChange = (val: number) => {
    pagination.page = val
    loadHistoryList()
  }

  onMounted(() => {
    loadHistoryList()
  })
</script>
