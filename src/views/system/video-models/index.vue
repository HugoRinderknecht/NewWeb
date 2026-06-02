<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">视频模型配置</span>
        <ElButton type="primary" @click="handleAdd">
          <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
          添加模型
        </ElButton>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="modelName" label="模型名称" min-width="160" />
        <ElTableColumn prop="modelCode" label="模型编码" min-width="140" show-overflow-tooltip />
        <ElTableColumn prop="provider" label="提供商" min-width="120" />
        <ElTableColumn prop="maxDuration" label="最大时长(秒)" min-width="120" />
        <ElTableColumn prop="supportedRatios" label="支持比例" min-width="180">
          <template #default="scope">
            <ElTag
              v-for="ratio in scope.row.supportedRatios"
              :key="ratio"
              size="small"
              class="mr-1"
            >
              {{ ratio }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElSwitch v-model="scope.row.status" active-value="enabled" inactive-value="disabled" />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="scope">
            <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
              编辑
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
      :title="isEdit ? '编辑模型' : '添加模型'"
      width="600px"
      destroy-on-close
    >
      <ElForm :model="form" label-width="120px">
        <ElFormItem label="模型名称" required>
          <ElInput v-model="form.modelName" placeholder="请输入模型名称" />
        </ElFormItem>
        <ElFormItem label="模型编码" required>
          <ElInput v-model="form.modelCode" placeholder="请输入模型编码" />
        </ElFormItem>
        <ElFormItem label="提供商" required>
          <ElInput v-model="form.provider" placeholder="请输入提供商" />
        </ElFormItem>
        <ElFormItem label="最大时长(秒)" required>
          <ElInputNumber v-model="form.maxDuration" :min="1" style="width: 200px" />
        </ElFormItem>
        <ElFormItem label="支持比例">
          <ElSelect
            v-model="form.supportedRatios"
            multiple
            placeholder="请选择支持比例"
            style="width: 100%"
          >
            <ElOption label="16:9" value="16:9" />
            <ElOption label="9:16" value="9:16" />
            <ElOption label="1:1" value="1:1" />
            <ElOption label="4:3" value="4:3" />
          </ElSelect>
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
    fetchGetVideoModelList,
    fetchCreateVideoModel,
    fetchUpdateVideoModel,
    fetchDeleteVideoModel
  } from '@/api/video-model'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const editingId = ref('')

  const form = reactive<{
    modelName: string
    modelCode: string
    provider: string
    maxDuration: number
    supportedRatios: string[]
  }>({
    modelName: '',
    modelCode: '',
    provider: '',
    maxDuration: 10,
    supportedRatios: []
  })

  const tableData = ref<any[]>([])

  const loadModelList = async () => {
    loading.value = true
    try {
      const data = await fetchGetVideoModelList()
      if (Array.isArray(data)) {
        tableData.value = data.map((item: any) => ({
          modelId: item.modelId,
          modelName: item.name,
          modelCode: item.code,
          provider: item.provider,
          maxDuration: 10,
          supportedRatios: ['16:9', '9:16', '1:1'],
          status: item.enabled ? 'enabled' : 'disabled'
        }))
      }
    } catch {
      console.error('加载模型列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadModelList()
  })

  const handleAdd = () => {
    isEdit.value = false
    editingId.value = ''
    form.modelName = ''
    form.modelCode = ''
    form.provider = ''
    form.maxDuration = 10
    form.supportedRatios = []
    dialogVisible.value = true
  }

  const handleEdit = (row: any) => {
    isEdit.value = true
    editingId.value = row.modelId
    form.modelName = row.modelName
    form.modelCode = row.modelCode
    form.provider = row.provider
    form.maxDuration = row.maxDuration
    form.supportedRatios = [...(row.supportedRatios || [])]
    dialogVisible.value = true
  }

  const handleSave = async () => {
    try {
      if (isEdit.value) {
        await fetchUpdateVideoModel(editingId.value, {
          name: form.modelName,
          provider: form.provider
        })
      } else {
        await fetchCreateVideoModel({
          name: form.modelName,
          code: form.modelCode,
          provider: form.provider,
          apiUrl: ''
        })
      }
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      loadModelList()
    } catch {
      ElMessage.error('保存失败')
    }
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除模型 ${row.modelName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteVideoModel(row.modelId)
        ElMessage.success('删除成功')
        loadModelList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>
