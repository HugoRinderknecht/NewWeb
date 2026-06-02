<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">Dify工作流配置</span>
        <ElButton type="primary" @click="handleAdd">
          <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
          添加配置
        </ElButton>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn
          prop="workflowCode"
          label="工作流编码"
          min-width="160"
          show-overflow-tooltip
        />
        <ElTableColumn prop="workflowName" label="工作流名称" min-width="160" />
        <ElTableColumn prop="apiEndpoint" label="API端点" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="apiKey" label="API Key" min-width="160">
          <template #default="scope">
            <span class="text-g-400">{{ maskApiKey(scope.row.apiKey) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="timeout" label="超时(秒)" min-width="100" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElSwitch v-model="scope.row.status" active-value="enabled" inactive-value="disabled" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="250" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
              编辑
            </ElButton>
            <ElButton type="success" link size="small" @click="handleTest(scope.row)">
              测试连接
            </ElButton>
            <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
              删除
            </ElButton>
          </template>
        </ElTableColumn>
      </ArtTable>
    </ElCard>

    <!-- 添加/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑配置' : '添加配置'"
      width="600px"
      destroy-on-close
    >
      <ElForm :model="form" label-width="120px">
        <ElFormItem label="工作流编码" required>
          <ElInput v-model="form.workflowCode" placeholder="请输入工作流编码" :disabled="isEdit" />
        </ElFormItem>
        <ElFormItem label="工作流名称" required>
          <ElInput v-model="form.workflowName" placeholder="请输入工作流名称" />
        </ElFormItem>
        <ElFormItem label="API端点" required>
          <ElInput v-model="form.apiEndpoint" placeholder="请输入API端点" />
        </ElFormItem>
        <ElFormItem label="API Key" required>
          <ElInput
            v-model="form.apiKey"
            type="password"
            placeholder="请输入API Key"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="超时时间(秒)">
          <ElInputNumber v-model="form.timeout" :min="1" :max="300" style="width: 200px" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSave">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchGetWorkflowList,
    fetchCreateWorkflow,
    fetchUpdateWorkflow,
    fetchDeleteWorkflow,
    fetchTestWorkflowConnection
  } from '@/api/workflow-manage'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const editingId = ref('')

  const form = reactive({
    workflowCode: '',
    workflowName: '',
    apiEndpoint: '',
    apiKey: '',
    timeout: 30
  })

  const tableData = ref<any[]>([])

  const loadWorkflowList = async () => {
    loading.value = true
    try {
      const data = await fetchGetWorkflowList()
      if (Array.isArray(data)) {
        tableData.value = data.map((item: any) => ({
          id: item.id,
          workflowCode: item.code,
          workflowName: item.name,
          apiEndpoint: item.apiUrl,
          apiKey: item.apiKey || '',
          timeout: 30,
          status: item.enabled ? 'enabled' : 'disabled'
        }))
      }
    } catch {
      console.error('加载工作流列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadWorkflowList()
  })

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return '****'
    return key.substring(0, 4) + '****' + key.substring(key.length - 4)
  }

  const handleAdd = () => {
    isEdit.value = false
    editingId.value = ''
    form.workflowCode = ''
    form.workflowName = ''
    form.apiEndpoint = ''
    form.apiKey = ''
    form.timeout = 30
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    isEdit.value = true
    editingId.value = row.id
    form.workflowCode = row.workflowCode
    form.workflowName = row.workflowName
    form.apiEndpoint = row.apiEndpoint
    form.apiKey = ''
    form.timeout = row.timeout
    dialogVisible.value = true
  }

  const handleSave = async () => {
    try {
      if (isEdit.value) {
        await fetchUpdateWorkflow(editingId.value, {
          name: form.workflowName,
          apiUrl: form.apiEndpoint,
          apiKey: form.apiKey || undefined
        })
      } else {
        await fetchCreateWorkflow({
          name: form.workflowName,
          code: form.workflowCode,
          apiUrl: form.apiEndpoint,
          apiKey: form.apiKey || undefined
        })
      }
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      loadWorkflowList()
    } catch {
      ElMessage.error('保存失败')
    }
  }

  const handleTest = async (row: any) => {
    ElMessage.info(`正在测试工作流 ${row.workflowName} 的连接...`)
    try {
      await fetchTestWorkflowConnection({
        workflowCode: row.workflowCode,
        apiEndpoint: row.apiEndpoint,
        apiKey: row.apiKey
      })
      ElMessage.success('连接测试成功')
    } catch {
      ElMessage.error('连接测试失败')
    }
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除工作流配置 ${row.workflowName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteWorkflow(row.id)
        ElMessage.success('删除成功')
        loadWorkflowList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>
