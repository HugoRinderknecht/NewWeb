<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">工作流目录</span>
      </div>

      <ElRow :gutter="16">
        <ElCol v-for="wf in workflowList" :key="wf.workflowCode" :span="8" class="mb-4">
          <ElCard shadow="hover" class="h-full">
            <div class="flex items-start gap-3">
              <div
                class="w-12 h-12 rounded-lg bg-theme flex items-center justify-center text-white"
              >
                <ArtSvgIcon icon="ri:flow-chart-line" :size="24" />
              </div>
              <div class="flex-1">
                <div class="font-medium">{{ wf.workflowName }}</div>
                <div class="text-g-400 text-sm mt-1">{{ wf.description }}</div>
                <div class="mt-2">
                  <ElTag
                    size="small"
                    :type="
                      wf.type === 'text' ? 'primary' : wf.type === 'image' ? 'success' : 'warning'
                    "
                  >
                    {{ wf.type === 'text' ? '文本' : wf.type === 'image' ? '图片' : '多模态' }}
                  </ElTag>
                  <ElTag
                    size="small"
                    :type="wf.status === 'enabled' ? 'success' : 'info'"
                    class="ml-1"
                  >
                    {{ wf.status === 'enabled' ? '可用' : '维护中' }}
                  </ElTag>
                </div>
              </div>
            </div>
            <div class="mt-4 flex justify-end">
              <ElButton type="primary" size="small" @click="handleExecute(wf)">
                <ArtSvgIcon icon="ri:play-line" :size="14" class="mr-1" />
                执行
              </ElButton>
            </div>
          </ElCard>
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { fetchGetWorkflowCatalog } from '@/api/workflow'

  const router = useRouter()
  const workflowList = ref<any[]>([])

  const loadCatalog = async () => {
    try {
      const data = await fetchGetWorkflowCatalog()
      if (data) {
        workflowList.value = (Array.isArray(data) ? data : []).map((item) => ({
          workflowCode: item.code,
          workflowName: item.name,
          description: item.description || '',
          type: item.category || 'text',
          status: 'enabled'
        }))
      }
    } catch {
      // ignore
    }
  }

  const handleExecute = (wf: any) => {
    if (wf?.workflowCode) {
      router.push({ path: '/workflow/execute', query: { code: wf.workflowCode } })
    }
  }

  onMounted(() => {
    loadCatalog()
  })
</script>
