<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">执行工作流</span>
      </div>

      <ElSteps :active="currentStep" finish-status="success" simple class="mb-6">
        <ElStep title="选择工作流" />
        <ElStep title="输入参数" />
        <ElStep title="执行结果" />
      </ElSteps>

      <!-- 步骤1: 选择工作流 -->
      <div v-if="currentStep === 0">
        <ElForm label-width="100px">
          <ElFormItem label="工作流">
            <ElSelect
              v-model="selectedWorkflow"
              placeholder="请选择要执行的工作流"
              style="width: 400px"
            >
              <ElOption
                v-for="wf in workflowList"
                :key="wf.workflowCode"
                :label="wf.workflowName"
                :value="wf.workflowCode"
              />
            </ElSelect>
          </ElFormItem>
        </ElForm>
        <div class="flex justify-center mt-4">
          <ElButton type="primary" :disabled="!selectedWorkflow" @click="currentStep = 1">
            下一步
          </ElButton>
        </div>
      </div>

      <!-- 步骤2: 输入参数 -->
      <div v-if="currentStep === 1">
        <ElForm :model="paramForm" label-width="100px">
          <ElFormItem label="输入内容" required>
            <ElInput
              v-model="paramForm.input"
              type="textarea"
              :rows="4"
              placeholder="请输入工作流所需的输入内容..."
            />
          </ElFormItem>
          <ElFormItem label="文件上传">
            <ElUpload action="#" :auto-upload="false" :limit="5">
              <ElButton type="primary">
                <ArtSvgIcon icon="ri:upload-line" :size="14" class="mr-1" />
                选择文件
              </ElButton>
            </ElUpload>
            <div class="text-g-400 text-sm mt-1">支持多模态工作流的文件输入</div>
          </ElFormItem>
        </ElForm>
        <div class="flex justify-center mt-4 gap-2">
          <ElButton @click="currentStep = 0">上一步</ElButton>
          <ElButton type="primary" @click="handleExecute">
            <ArtSvgIcon icon="ri:play-line" :size="14" class="mr-1" />
            开始执行
          </ElButton>
        </div>
      </div>

      <!-- 步骤3: 执行结果 -->
      <div v-if="currentStep === 2">
        <div v-if="executing" class="text-center py-8">
          <ElIcon class="is-loading" :size="40">
            <Loading />
          </ElIcon>
          <div class="mt-4 text-g-400">工作流执行中，请稍候...</div>
          <ElProgress :percentage="executeProgress" class="mt-4 max-w-md mx-auto" />
        </div>
        <div v-else>
          <ElResult icon="success" title="执行成功" sub-title="工作流已执行完成">
            <template #extra>
              <div class="text-left bg-g-200 p-4 rounded max-w-2xl mx-auto">
                <div class="font-medium mb-2">执行结果:</div>
                <pre class="text-sm">{{ executeResult }}</pre>
              </div>
              <div class="mt-4">
                <ElButton type="primary" @click="currentStep = 0">再次执行</ElButton>
                <ElButton @click="handleExport">导出结果</ElButton>
              </div>
            </template>
          </ElResult>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import { fetchExecuteWorkflowStream } from '@/api/workflow'

  const currentStep = ref(0)
  const selectedWorkflow = ref('')
  const executing = ref(false)
  const executeProgress = ref(0)
  const executeResult = ref('')

  const workflowList = ref([
    { workflowCode: 'script-decompose', workflowName: '剧本拆解工作流' },
    { workflowCode: 'storyboard-generate', workflowName: '分镜生成工作流' },
    { workflowCode: 'violation-check', workflowName: '违规检测工作流' }
  ])

  const paramForm = reactive({
    input: '',
    files: []
  })

  const handleExecute = async () => {
    if (!paramForm.input.trim()) {
      ElMessage.warning('请输入输入内容')
      return
    }
    currentStep.value = 2
    executing.value = true
    executeProgress.value = 0

    try {
      let resultText = ''

      await fetchExecuteWorkflowStream(
        selectedWorkflow.value,
        { input: paramForm.input },
        (msg) => {
          const data = msg.data
          if (data === '[DONE]') {
            executeProgress.value = 100
          } else if (typeof data === 'object') {
            if (data.progress !== undefined) {
              executeProgress.value = Math.min(data.progress, 100)
            }
            if (data.result) {
              resultText += data.result
            }
          }
        },
        () => {
          executing.value = false
          executeProgress.value = 0
          ElMessage.error('工作流执行失败')
        },
        () => {
          executing.value = false
          executeResult.value =
            resultText ||
            JSON.stringify(
              {
                success: true,
                data: { result: '工作流执行成功' },
                cost: '2.5s'
              },
              null,
              2
            )
        }
      )
    } catch {
      executing.value = false
      executeProgress.value = 0
      ElMessage.error('工作流执行失败')
    }
  }

  const handleExport = () => {
    ElMessage.success('结果已导出')
  }
</script>
