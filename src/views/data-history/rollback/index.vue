<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">版本回退</span>
      </div>

      <ElSteps :active="currentStep" finish-status="success" simple class="mb-6">
        <ElStep title="选择数据" />
        <ElStep title="选择版本" />
        <ElStep title="确认回退" />
      </ElSteps>

      <!-- 步骤1: 选择数据 -->
      <div v-if="currentStep === 0">
        <ElForm :model="selectForm" label-width="100px">
          <ElFormItem label="数据类型">
            <ElSelect
              v-model="selectForm.dataType"
              placeholder="请选择数据类型"
              style="width: 300px"
            >
              <ElOption label="项目" value="project" />
              <ElOption label="剧本" value="script" />
              <ElOption label="分镜" value="storyboard" />
              <ElOption label="角色" value="character" />
              <ElOption label="资产" value="asset" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="数据ID">
            <ElInput v-model="selectForm.dataId" placeholder="请输入数据ID" style="width: 300px" />
          </ElFormItem>
        </ElForm>
        <div class="flex justify-center mt-4">
          <ElButton type="primary" @click="handleQueryVersions">
            <ArtSvgIcon icon="ri:search-line" :size="14" class="mr-1" />
            查询版本
          </ElButton>
        </div>
      </div>

      <!-- 步骤2: 选择版本 -->
      <div v-if="currentStep === 1">
        <ElTimeline>
          <ElTimelineItem
            v-for="(version, index) in versionList"
            :key="version.versionId"
            :type="index === 0 ? 'primary' : undefined"
            :timestamp="version.versionTime"
            placement="top"
          >
            <ElCard
              shadow="hover"
              :class="{ 'border-theme': selectedVersion?.versionId === version.versionId }"
            >
              <div class="flex-cb">
                <div>
                  <div class="font-medium">版本 {{ version.versionId }}</div>
                  <div class="text-g-400 text-sm mt-1"
                    >操作人: {{ version.operator }} | {{ version.operationType }}</div
                  >
                  <div class="text-g-400 text-sm mt-1">{{ version.changeSummary }}</div>
                </div>
                <ElRadio v-model="selectedVersion" :label="version.versionId"> 选择此版本 </ElRadio>
              </div>
            </ElCard>
          </ElTimelineItem>
        </ElTimeline>
        <div class="flex justify-center mt-4 gap-2">
          <ElButton @click="currentStep = 0">上一步</ElButton>
          <ElButton type="primary" :disabled="!selectedVersion" @click="currentStep = 2">
            下一步
          </ElButton>
        </div>
      </div>

      <!-- 步骤3: 确认回退 -->
      <div v-if="currentStep === 2">
        <ElAlert title="警告" type="warning" :closable="false" class="mb-4">
          <div>回退操作将覆盖当前数据，此操作不可撤销。请确认是否继续？</div>
        </ElAlert>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="数据类型">{{
            getDataTypeLabel(selectForm.dataType)
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="数据ID">{{ selectForm.dataId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="回退版本">{{ selectedVersion?.versionId }}</ElDescriptionsItem>
          <ElDescriptionsItem label="版本时间">{{
            selectedVersion?.versionTime
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="操作人">{{ selectedVersion?.operator }}</ElDescriptionsItem>
        </ElDescriptions>
        <div class="flex justify-center mt-4 gap-2">
          <ElButton @click="currentStep = 1">上一步</ElButton>
          <ElButton type="danger" @click="handleConfirmRollback">
            <ArtSvgIcon icon="ri:arrow-go-back-line" :size="14" class="mr-1" />
            确认回退
          </ElButton>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRollbackDataHistory } from '@/api/queries'
  import { queryClient } from '@/plugins/vue-query'
  import { fetchGetDataHistoryList } from '@/api/data-history'

  const QUERY_KEY = 'data-history' as const

  const currentStep = ref(0)
  const selectedVersion = ref<any>(null)
  const loading = ref(false)

  const selectForm = reactive({
    dataType: '',
    dataId: ''
  })

  const versionList = ref<any[]>([])

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

  const handleQueryVersions = async () => {
    if (!selectForm.dataType || !selectForm.dataId) {
      ElMessage.warning('请选择数据类型并输入数据ID')
      return
    }
    loading.value = true
    try {
      // 通过 queryClient.fetchQuery 走 Vue Query 缓存，便于跨步骤复用
      const res: any = await queryClient.fetchQuery({
        queryKey: [
          QUERY_KEY,
          'list',
          { targetType: selectForm.dataType, targetId: selectForm.dataId }
        ],
        queryFn: () =>
          fetchGetDataHistoryList({
            // targetType / targetId 字段名因后端差异做兼容（HistorySearchParams 实际定义不固定）
            dataType: selectForm.dataType,
            dataId: selectForm.dataId
          } as any)
      })
      versionList.value = (Array.isArray(res) ? res : res?.records || []).map((item: any) => ({
        versionId: item.versionId || item.id,
        versionTime: item.versionTime || item.createTime || '',
        operator: item.operator || '',
        operationType: item.operationType || '',
        changeSummary: item.changeSummary || item.summary || ''
      }))
      currentStep.value = 1
    } catch {
      ElMessage.error('查询版本列表失败')
    } finally {
      loading.value = false
    }
  }

  // 使用 Vue Query mutation 触发回退，失败后自动失效历史列表缓存
  const rollbackMutation = useRollbackDataHistory()

  const handleConfirmRollback = () => {
    ElMessageBox.confirm('确定执行版本回退吗？此操作不可撤销！', '危险操作', {
      confirmButtonText: '确定回退',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await rollbackMutation.mutateAsync({
          historyId: selectedVersion.value?.versionId
        } as any)
        ElMessage.success('版本回退成功')
        currentStep.value = 0
        selectedVersion.value = null
        versionList.value = []
      } catch {
        ElMessage.error('版本回退失败')
      }
    })
  }
</script>
