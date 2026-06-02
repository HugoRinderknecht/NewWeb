<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">AI处理状态追踪</span>
        <ElButton type="primary" @click="handleRefresh">
          <ArtSvgIcon icon="ri:refresh-line" :size="14" class="mr-1" />
          刷新状态
        </ElButton>
      </div>

      <ElRow :gutter="16">
        <ElCol v-for="task in activeTasks" :key="task.taskId" :span="12" class="mb-4">
          <ElCard shadow="hover">
            <div class="flex-cb mb-3">
              <div>
                <div class="font-medium">{{ task.taskName }}</div>
                <div class="text-g-400 text-sm mt-1">任务ID: {{ task.taskId }}</div>
              </div>
              <ElTag :type="getStatusType(task.status)">{{ getStatusLabel(task.status) }}</ElTag>
            </div>

            <ElSteps :active="task.currentStep" finish-status="success" simple>
              <ElStep
                v-for="(step, index) in task.steps"
                :key="index"
                :title="step.title"
                :description="step.desc"
              />
            </ElSteps>

            <div class="mt-3 flex justify-between items-center">
              <div class="text-g-400 text-sm">
                进度: {{ task.progress }}% | 预计剩余: {{ task.estimateTime }}
              </div>
              <ElButton
                v-if="task.status === 'processing'"
                type="danger"
                size="small"
                @click="handleCancel(task)"
              >
                取消任务
              </ElButton>
            </div>

            <ElProgress
              v-if="task.status === 'processing'"
              :percentage="task.progress"
              :status="task.progress === 100 ? 'success' : ''"
              class="mt-2"
            />
          </ElCard>
        </ElCol>
      </ElRow>

      <ElEmpty v-if="activeTasks.length === 0" description="暂无进行中的AI处理任务" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchGetAiProcessStatus } from '@/api/ai-process'

  const loading = ref(false)

  const activeTasks = ref<any[]>([])

  const loadActiveTasks = async () => {
    loading.value = true
    try {
      const res = (await fetchGetAiProcessStatus({ status: 'processing' } as any)) as any
      activeTasks.value = (res?.records || (Array.isArray(res) ? res : [])).map((item: any) => ({
        taskId: item.taskId || item.id,
        taskName: item.taskName || item.workflowName || '',
        status: item.status || 'processing',
        progress: item.progress || 0,
        estimateTime: item.estimateTime || '',
        currentStep: item.currentStep || 0,
        steps: item.steps || [
          { title: '参数校验', desc: '完成' },
          { title: 'AI处理', desc: '进行中' },
          { title: '结果保存', desc: '等待' }
        ]
      }))
    } catch {
      ElMessage.error('获取处理状态失败')
    } finally {
      loading.value = false
    }
  }

  let refreshTimer: ReturnType<typeof setInterval> | null = null

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

  const handleRefresh = () => {
    loadActiveTasks()
  }

  const handleCancel = (task: any) => {
    ElMessageBox.confirm(`确定取消任务 ${task.taskId} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      task.status = 'cancelled'
      ElMessage.success('任务已取消')
    })
  }

  onMounted(() => {
    loadActiveTasks()
    refreshTimer = setInterval(() => {
      loadActiveTasks()
    }, 30000)
  })

  onUnmounted(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  })
</script>
