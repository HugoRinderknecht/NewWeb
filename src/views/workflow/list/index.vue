<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">工作流列表</span>
        <ElButton type="primary" @click="handleAdd">
          <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
          添加工作流
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
        <ElTableColumn prop="workflowType" label="类型" min-width="120">
          <template #default="scope">
            <ElTag size="small">{{ scope.row.workflowType }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="apiKeyStatus" label="API Key状态" min-width="120">
          <template #default="scope">
            <ElTag
              :type="scope.row.apiKeyStatus === 'configured' ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.apiKeyStatus === 'configured' ? '已配置' : '未配置' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElSwitch
              v-model="scope.row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(scope.row)"
            />
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
      :title="isEdit ? '编辑工作流' : '添加工作流'"
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
        <ElFormItem label="工作流类型" required>
          <ElSelect v-model="form.workflowType" placeholder="请选择类型" style="width: 100%">
            <ElOption label="文本生成" value="text" />
            <ElOption label="图片生成" value="image" />
            <ElOption label="多模态" value="multimodal" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="API Key" required>
          <ElInput
            v-model="form.apiKey"
            type="password"
            placeholder="请输入API Key"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="API地址">
          <ElInput v-model="form.apiUrl" placeholder="请输入API地址" />
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
    fetchToggleWorkflowStatus,
    fetchTestWorkflowConnection
  } from '@/api/workflow-manage'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const editingId = ref('')

  const form = reactive({
    workflowCode: '',
    workflowName: '',
    workflowType: '',
    apiKey: '',
    apiUrl: ''
  })

  const tableData = ref<any[]>([])

  const loadList = async () => {
    loading.value = true
    try {
      const data = await fetchGetWorkflowList()
      if (data) {
        tableData.value = (Array.isArray(data) ? data : []).map((item) => ({
          id: item.id,
          workflowCode: item.code,
          workflowName: item.name,
          workflowType: item.category || 'text',
          apiKeyStatus: item.apiUrl ? 'configured' : 'unconfigured',
          status: item.enabled ? 'enabled' : 'disabled'
        }))
      }
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    isEdit.value = false
    editingId.value = ''
    form.workflowCode = ''
    form.workflowName = ''
    form.workflowType = ''
    form.apiKey = ''
    form.apiUrl = ''
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    isEdit.value = true
    editingId.value = row.id
    form.workflowCode = row.workflowCode
    form.workflowName = row.workflowName
    form.workflowType = row.workflowType
    form.apiKey = ''
    form.apiUrl = ''
    dialogVisible.value = true
  }

  const handleSave = async () => {
    try {
      const params = {
        name: form.workflowName,
        code: form.workflowCode,
        category: form.workflowType,
        apiUrl: form.apiUrl,
        apiKey: form.apiKey || undefined
      }
      if (isEdit.value) {
        await fetchUpdateWorkflow(editingId.value, params)
      } else {
        await fetchCreateWorkflow(params as any)
      }
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      loadList()
    } catch {
      ElMessage.error(isEdit.value ? '修改失败' : '添加失败')
    }
  }

  const handleStatusChange = async (row: any) => {
    try {
      await fetchToggleWorkflowStatus(row.id, { enabled: row.status === 'enabled' })
      ElMessage.success(row.status === 'enabled' ? '已启用' : '已禁用')
    } catch {
      row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
      ElMessage.error('状态切换失败')
    }
  }

  const handleTest = async (row: any) => {
    ElMessage.info(`正在测试工作流 ${row.workflowName} 的连接...`)
    try {
      await fetchTestWorkflowConnection({ workflowCode: row.workflowCode })
      ElMessage.success('连接测试成功')
    } catch {
      ElMessage.error('连接测试失败')
    }
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除工作流 ${row.workflowName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await fetchDeleteWorkflow(row.id)
          ElMessage.success('删除成功')
          loadList()
        } catch {
          ElMessage.error('删除失败')
        }
      })
      .catch(() => {})
  }

  onMounted(() => {
    loadList()
  })
</script>
