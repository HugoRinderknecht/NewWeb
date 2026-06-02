<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">运行时配置</span>
        <ElSpace>
          <ElButton type="primary" @click="handleRefresh">
            <ArtSvgIcon icon="ri:refresh-line" :size="14" class="mr-1" />
            刷新缓存
          </ElButton>
          <ElButton type="success" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
            添加配置
          </ElButton>
        </ElSpace>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="configKey" label="配置键" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="configValue" label="配置值" min-width="250" show-overflow-tooltip>
          <template #default="scope">
            <span :class="{ 'text-g-400': scope.row.sensitive }">
              {{ scope.row.sensitive ? maskValue(scope.row.configValue) : scope.row.configValue }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
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
      :title="isEdit ? '编辑配置' : '添加配置'"
      width="600px"
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px">
        <ElFormItem label="配置键" required>
          <ElInput v-model="form.configKey" placeholder="请输入配置键" :disabled="isEdit" />
        </ElFormItem>
        <ElFormItem label="配置值" required>
          <ElInput
            v-model="form.configValue"
            type="textarea"
            :rows="3"
            placeholder="请输入配置值"
          />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="form.description" placeholder="请输入描述" />
        </ElFormItem>
        <ElFormItem label="敏感配置">
          <ElSwitch v-model="form.sensitive" />
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
    fetchGetConfigList,
    fetchCreateConfig,
    fetchGetConfigByKey,
    fetchUpdateConfig,
    fetchDeleteConfig,
    fetchRefreshConfigCache
  } from '@/api/system-config'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const editingKey = ref('')

  const form = reactive({
    configKey: '',
    configValue: '',
    description: '',
    sensitive: false
  })

  const tableData = ref<any[]>([])

  const loadConfigList = async () => {
    loading.value = true
    try {
      const data = await fetchGetConfigList()
      if (Array.isArray(data)) {
        tableData.value = data.map((item: any) => ({
          configKey: item.key,
          configValue: item.value,
          description: item.description,
          sensitive:
            item.key?.toLowerCase().includes('key') || item.key?.toLowerCase().includes('secret'),
          updateTime: item.updateTime
        }))
      }
    } catch {
      console.error('加载配置列表失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadConfigList()
  })

  const maskValue = (value: string) => {
    if (!value || value.length < 4) return '****'
    return '****' + value.substring(value.length - 4)
  }

  const handleAdd = () => {
    isEdit.value = false
    editingKey.value = ''
    form.configKey = ''
    form.configValue = ''
    form.description = ''
    form.sensitive = false
    dialogVisible.value = true
  }

  const handleEdit = async (row: any) => {
    isEdit.value = true
    editingKey.value = row.configKey
    try {
      const detail = await fetchGetConfigByKey(row.configKey)
      form.configKey = detail.key
      form.configValue = detail.value
      form.description = detail.description
      form.sensitive = row.sensitive
    } catch {
      form.configKey = row.configKey
      form.configValue = row.sensitive ? '' : row.configValue
      form.description = row.description
      form.sensitive = row.sensitive
    }
    dialogVisible.value = true
  }

  const handleSave = async () => {
    try {
      if (isEdit.value) {
        await fetchUpdateConfig(editingKey.value, {
          value: form.configValue,
          description: form.description
        })
      } else {
        await fetchCreateConfig({
          key: form.configKey,
          value: form.configValue,
          description: form.description
        })
      }
      ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
      dialogVisible.value = false
      loadConfigList()
    } catch {
      ElMessage.error('保存失败')
    }
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除配置 ${row.configKey} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteConfig(row.configKey)
        ElMessage.success('删除成功')
        loadConfigList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleRefresh = async () => {
    try {
      await fetchRefreshConfigCache()
      ElMessage.success('缓存已刷新')
    } catch {
      ElMessage.error('刷新缓存失败')
    }
  }
</script>
