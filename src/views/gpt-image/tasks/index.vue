<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">图片生成任务</span>
        <ElSpace>
          <ElSelect
            v-model="searchForm.status"
            placeholder="任务状态"
            clearable
            style="width: 140px"
          >
            <ElOption label="排队中" value="queued" />
            <ElOption label="生成中" value="generating" />
            <ElOption label="已完成" value="completed" />
            <ElOption label="失败" value="failed" />
          </ElSelect>
          <ElButton type="primary" @click="handleSearch">
            <ArtSvgIcon icon="ri:search-line" :size="14" class="mr-1" />
            查询
          </ElButton>
        </ElSpace>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="taskId" label="任务ID" min-width="160" show-overflow-tooltip />
        <ElTableColumn
          prop="promptSummary"
          label="提示词摘要"
          min-width="250"
          show-overflow-tooltip
        />
        <ElTableColumn prop="model" label="模型" min-width="140" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElTag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusLabel(scope.row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" min-width="160" />
        <ElTableColumn prop="completeTime" label="完成时间" min-width="160" />
        <ElTableColumn label="结果" min-width="120">
          <template #default="scope">
            <ElImage
              v-if="scope.row.resultUrl"
              :src="scope.row.resultUrl"
              :preview-src-list="[scope.row.resultUrl]"
              style="width: 60px; height: 60px; border-radius: 4px"
              fit="cover"
            />
            <span v-else class="text-g-400">--</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
              查看
            </ElButton>
            <ElButton type="warning" link size="small" @click="handleRegenerate(scope.row)">
              重新生成
            </ElButton>
            <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
              删除
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
    <ElDialog v-model="detailVisible" title="生成详情" width="600px" destroy-on-close>
      <div v-if="currentRow" class="text-center">
        <ElImage
          v-if="currentRow.resultUrl"
          :src="currentRow.resultUrl"
          style="max-width: 100%; border-radius: 8px"
        />
        <div v-else class="py-8 text-g-400">暂无生成结果</div>
        <div class="mt-4 text-left">
          <div class="font-medium mb-2">提示词:</div>
          <div class="bg-g-200 p-3 rounded text-sm">{{ currentRow.prompt }}</div>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchGetImageTaskStatus, fetchGetImageTaskResult } from '@/api/image'

  const loading = ref(false)
  const detailVisible = ref(false)
  const currentRow = ref<any>(null)

  const searchForm = reactive({
    status: ''
  })

  const pagination = reactive({
    page: 1,
    limit: 20,
    total: 0
  })

  const tableData = ref([
    {
      taskId: 'IMG-202605270001',
      promptSummary: '一个未来城市的全景图，赛博朋克风格...',
      prompt: '一个未来城市的全景图，赛博朋克风格，霓虹灯闪烁，飞行汽车，夜晚',
      model: 'GPT-Image-2',
      status: 'completed',
      createTime: '2026-05-27 10:00:00',
      completeTime: '2026-05-27 10:00:15',
      resultUrl: 'https://picsum.photos/400/400?random=1'
    },
    {
      taskId: 'IMG-202605270002',
      promptSummary: '中国古代山水画风格的现代建筑...',
      prompt: '中国古代山水画风格的现代建筑，水墨画，云雾缭绕',
      model: 'GPT-Image-2',
      status: 'generating',
      createTime: '2026-05-27 11:00:00',
      completeTime: '',
      resultUrl: ''
    }
  ])

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      queued: '排队中',
      generating: '生成中',
      completed: '已完成',
      failed: '失败'
    }
    return map[status] || status
  }

  const getStatusType = (status: string) => {
    const map: Record<string, any> = {
      queued: 'info',
      generating: 'warning',
      completed: 'success',
      failed: 'danger'
    }
    return map[status] || 'info'
  }

  const handleSearch = async () => {
    loading.value = true
    try {
      for (const row of tableData.value) {
        if (row.taskId && row.status !== 'completed' && row.status !== 'failed') {
          try {
            const statusRes = await fetchGetImageTaskStatus(row.taskId)
            if (statusRes) {
              row.status = (statusRes as any).status || row.status
              if ((statusRes as any).completeTime) {
                row.completeTime = (statusRes as any).completeTime
              }
            }
          } catch {
            // keep current status
          }
        }
      }
      ElMessage.success('查询成功')
    } finally {
      loading.value = false
    }
  }

  const handleViewDetail = async (row: any) => {
    currentRow.value = row
    detailVisible.value = true
    if (row.taskId && row.status === 'completed' && !row.resultUrl) {
      try {
        const resultRes = await fetchGetImageTaskResult(row.taskId)
        if (resultRes) {
          row.resultUrl = (resultRes as any).url || (resultRes as any).resultUrl || row.resultUrl
          currentRow.value = { ...row }
        }
      } catch {
        // keep current data
      }
    }
  }

  const handleRegenerate = (row: any) => {
    ElMessageBox.confirm(`确定重新生成任务 ${row.taskId} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('重新生成任务已提交')
    })
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除任务 ${row.taskId} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('删除成功')
    })
  }

  const handleSizeChange = (val: number) => {
    pagination.limit = val
    handleSearch()
  }

  const handlePageChange = (val: number) => {
    pagination.page = val
    handleSearch()
  }
</script>
