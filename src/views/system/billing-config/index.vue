<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">计费配置</span>
        <ElButton type="primary" @click="handleAdd">
          <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
          添加定价
        </ElButton>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="modelName" label="模型名称" min-width="160" />
        <ElTableColumn prop="modelCode" label="模型编码" min-width="140" show-overflow-tooltip />
        <ElTableColumn prop="creditPrice" label="积分单价" min-width="120">
          <template #default="scope">
            <span class="text-theme font-medium">{{ scope.row.creditPrice }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="unit" label="计费单位" min-width="120" />
        <ElTableColumn prop="status" label="状态" min-width="100">
          <template #default="scope">
            <ElSwitch v-model="scope.row.status" active-value="enabled" inactive-value="disabled" />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updateTime" label="更新时间" min-width="160" />
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
      :title="isEdit ? '编辑定价' : '添加定价'"
      width="600px"
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px">
        <ElFormItem label="模型名称" required>
          <ElInput v-model="form.modelName" placeholder="请输入模型名称" />
        </ElFormItem>
        <ElFormItem label="模型编码" required>
          <ElInput v-model="form.modelCode" placeholder="请输入模型编码" />
        </ElFormItem>
        <ElFormItem label="积分单价" required>
          <ElInputNumber v-model="form.creditPrice" :min="0" :precision="2" style="width: 200px" />
        </ElFormItem>
        <ElFormItem label="计费单位" required>
          <ElSelect v-model="form.unit" placeholder="请选择计费单位" style="width: 200px">
            <ElOption label="次" value="per_call" />
            <ElOption label="千字符" value="per_1k_tokens" />
            <ElOption label="秒" value="per_second" />
            <ElOption label="张" value="per_image" />
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
    fetchGetBillingList,
    fetchCreateBilling,
    fetchUpdateBilling,
    fetchToggleBilling,
    fetchGetBillingDetail
  } from '@/api/billing'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const editingId = ref('')

  const form = reactive({
    modelName: '',
    modelCode: '',
    creditPrice: 0,
    unit: ''
  })

  const tableData = ref<any[]>([])

  const loadBillingList = async () => {
    loading.value = true
    try {
      const data = await fetchGetBillingList()
      if (Array.isArray(data)) {
        tableData.value = data.map((item: any) => ({
          id: item.id,
          modelName: item.name,
          modelCode: item.code,
          creditPrice: item.unitPrice,
          unit: item.unit,
          status: item.enabled ? 'enabled' : 'disabled',
          updateTime: item.updateTime
        }))
      }
    } catch {
      console.error('加载计费配置失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadBillingList()
  })

  const handleAdd = () => {
    isEdit.value = false
    editingId.value = ''
    form.modelName = ''
    form.modelCode = ''
    form.creditPrice = 0
    form.unit = ''
    dialogVisible.value = true
  }

  const handleEdit = async (row: any) => {
    isEdit.value = true
    editingId.value = row.id
    try {
      const detail = await fetchGetBillingDetail(row.id)
      form.modelName = detail.name
      form.modelCode = detail.code
      form.creditPrice = detail.unitPrice
      form.unit = detail.unit
    } catch {
      form.modelName = row.modelName
      form.modelCode = row.modelCode
      form.creditPrice = row.creditPrice
      form.unit = row.unit
    }
    dialogVisible.value = true
  }

  const handleSave = async () => {
    try {
      if (isEdit.value) {
        await fetchUpdateBilling(editingId.value, {
          name: form.modelName,
          unitPrice: form.creditPrice,
          unit: form.unit
        })
      } else {
        await fetchCreateBilling({
          name: form.modelName,
          code: form.modelCode,
          category: 'default',
          unitPrice: form.creditPrice,
          unit: form.unit
        })
      }
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      loadBillingList()
    } catch {
      ElMessage.error('保存失败')
    }
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除 ${row.modelName} 的定价配置吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchToggleBilling(row.id)
        ElMessage.success('删除成功')
        loadBillingList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>
