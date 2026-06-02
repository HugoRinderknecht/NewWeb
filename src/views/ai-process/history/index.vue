<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">AI处理历史</span>
        <ElSpace>
          <ElSelect
            v-model="searchForm.workflowType"
            placeholder="工作流类型"
            clearable
            style="width: 160px"
          >
            <ElOption label="剧本拆解" value="script_decompose" />
            <ElOption label="分镜生成" value="storyboard_generate" />
            <ElOption label="视频生成" value="video_generate" />
            <ElOption label="图片生成" value="image_generate" />
            <ElOption label="违规检测" value="violation_check" />
          </ElSelect>
          <ElSelect
            v-model="searchForm.status"
            placeholder="处理状态"
            clearable
            style="width: 140px"
          >
            <ElOption label="处理中" value="processing" />
            <ElOption label="成功" value="success" />
            <ElOption label="失败" value="failed" />
            <ElOption label="已取消" value="cancelled" />
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
        <ElTableColumn prop="taskId" label="任务ID" min-width="180" show-overflow-tooltip />
        <ElTableColumn prop="workflowType" label="工作流类型" min-width="140">
          <template #default="scope">
            <ElTag size="small" :type="getWorkflowTypeType(scope.row.workflowType)">
              {{ getWorkflowTypeLabel(scope.row.workflowType) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="inputSummary" label="输入摘要" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElTag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" min-width="160" />
        <ElTableColumn prop="completeTime" label="完成时间" min-width="160" />
        <ElTableColumn label="操作" width="180" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
              查看详情
            </ElButton>
            <ElButton type="warning" link size="small" @click="handleRetry(scope.row)">
              重新执行
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
    <ElDialog v-model="detailVisible" title="处理详情" width="720px" destroy-on-close>
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="任务ID">{{ currentRow?.taskId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="工作流类型">
          {{ getWorkflowTypeLabel(currentRow?.workflowType) }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="getStatusType(currentRow?.status)">
            {{ getStatusLabel(currentRow?.status) }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ currentRow?.createTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="完成时间" :span="2">{{
          currentRow?.completeTime
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="输入内容" :span="2">
          <pre class="bg-g-200 p-2 rounded text-sm">{{ currentRow?.inputContent }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="输出结果" :span="2">
          <pre class="bg-g-200 p-2 rounded text-sm">{{ currentRow?.outputResult }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem v-if="currentRow?.errorMessage" label="错误信息" :span="2">
          <span class="text-danger">{{ currentRow?.errorMessage }}</span>
        </ElDescriptionsItem>
      </ElDescriptions>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchGetAiProcessHistory, fetchGetAiProcessHistoryDetail } from '@/api/ai-process'

  const loading = ref(false)
  const detailVisible = ref(false)
  const currentRow = ref<any>(null)

  const searchForm = reactive({
    workflowType: '',
    status: '',
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
      const res = await fetchGetAiProcessHistory({
        workflowType: searchForm.workflowType || undefined,
        status: searchForm.status || undefined,
        current: pagination.page,
        size: pagination.limit
      } as any)
      tableData.value = (res || []).map((item: any) => ({
        taskId: item.taskId || item.id,
        workflowType: item.workflowType || '',
        inputSummary: item.inputSummary || '',
        status: item.status || '',
        createTime: item.createTime || '',
        completeTime: item.completeTime || '',
        inputContent: item.inputContent || '',
        outputResult: item.outputResult || '',
        errorMessage: item.errorMessage || ''
      }))
      pagination.total = (res as any)?.total || (Array.isArray(res) ? res.length : 0)
    } catch {
      ElMessage.error('获取处理历史失败')
    } finally {
      loading.value = false
    }
  }

  const getWorkflowTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      script_decompose: '剧本拆解',
      storyboard_generate: '分镜生成',
      video_generate: '视频生成',
      image_generate: '图片生成',
      violation_check: '违规检测'
    }
    return map[type] || type
  }

  const getWorkflowTypeType = (type: string) => {
    const map: Record<string, any> = {
      script_decompose: 'primary',
      storyboard_generate: 'success',
      video_generate: 'warning',
      image_generate: 'info',
      violation_check: 'danger'
    }
    return map[type] || 'info'
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      processing: '处理中',
      success: '成功',
      failed: '失败',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  const getStatusType = (status: string) => {
    const map: Record<string, any> = {
      processing: 'primary',
      success: 'success',
      failed: 'danger',
      cancelled: 'info'
    }
    return map[status] || 'info'
  }

  const handleSearch = () => {
    pagination.page = 1
    loadHistoryList()
  }

  const handleReset = () => {
    searchForm.workflowType = ''
    searchForm.status = ''
    searchForm.dateRange = null
  }

  const handleViewDetail = async (row: any) => {
    try {
      const res = (await fetchGetAiProcessHistoryDetail(row.taskId)) as any
      currentRow.value = {
        ...row,
        inputContent: res?.inputContent || res?.params || row.inputContent,
        outputResult: res?.outputResult || res?.result || row.outputResult,
        errorMessage: res?.errorMessage || res?.error || row.errorMessage
      }
      detailVisible.value = true
    } catch {
      currentRow.value = row
      detailVisible.value = true
    }
  }

  const handleRetry = (row: any) => {
    ElMessageBox.confirm(`确定重新执行任务 ${row.taskId} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('任务已重新提交')
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
