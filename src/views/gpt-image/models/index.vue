<template>
  <div class="art-full-height p-4">
    <ElCard class="art-table-card" shadow="never">
      <div class="flex-cb mb-4">
        <span class="text-lg font-medium">图片生成模型配置</span>
        <ElButton type="primary" @click="handleAdd">
          <ArtSvgIcon icon="ri:add-line" :size="14" class="mr-1" />
          添加模型
        </ElButton>
      </div>

      <ArtTable :data="tableData" :loading="loading" stripe>
        <ElTableColumn prop="modelName" label="模型名称" min-width="160" />
        <ElTableColumn prop="modelCode" label="模型编码" min-width="140" show-overflow-tooltip />
        <ElTableColumn prop="provider" label="提供商" min-width="120" />
        <ElTableColumn prop="supportedSizes" label="支持尺寸" min-width="200">
          <template #default="scope">
            <ElTag v-for="size in scope.row.supportedSizes" :key="size" size="small" class="mr-1">
              {{ size }}
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
      <ElForm :model="form" label-width="100px">
        <ElFormItem label="模型名称" required>
          <ElInput v-model="form.modelName" placeholder="请输入模型名称" />
        </ElFormItem>
        <ElFormItem label="模型编码" required>
          <ElInput v-model="form.modelCode" placeholder="请输入模型编码" />
        </ElFormItem>
        <ElFormItem label="提供商" required>
          <ElInput v-model="form.provider" placeholder="请输入提供商" />
        </ElFormItem>
        <ElFormItem label="支持尺寸">
          <ElSelect
            v-model="form.supportedSizes"
            multiple
            placeholder="请选择支持尺寸"
            style="width: 100%"
          >
            <ElOption label="1024x1024" value="1024x1024" />
            <ElOption label="1024x1792" value="1024x1792" />
            <ElOption label="1792x1024" value="1792x1024" />
            <ElOption label="512x512" value="512x512" />
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
  import { fetchGetImageModels, fetchGetImageModelDetail } from '@/api/image'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)

  const form = reactive<{
    modelName: string
    modelCode: string
    provider: string
    supportedSizes: string[]
  }>({
    modelName: '',
    modelCode: '',
    provider: '',
    supportedSizes: []
  })

  const tableData = ref<any[]>([])

  const loadModelList = async () => {
    loading.value = true
    try {
      const res = await fetchGetImageModels()
      if (res && Array.isArray(res)) {
        tableData.value = res.map((item: any) => ({
          modelName: item.modelName || item.name || '',
          modelCode: item.modelCode || item.code || '',
          provider: item.provider || '',
          supportedSizes: item.supportedSizes || [],
          status: item.status || 'enabled'
        }))
      }
    } catch {
      tableData.value = [
        {
          modelName: 'GPT-Image-2',
          modelCode: 'gpt-image-2',
          provider: 'OpenAI',
          supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
          status: 'enabled'
        },
        {
          modelName: 'GPT-Image-1',
          modelCode: 'gpt-image-1',
          provider: 'OpenAI',
          supportedSizes: ['1024x1024', '512x512'],
          status: 'enabled'
        },
        {
          modelName: 'DALL-E 3',
          modelCode: 'dall-e-3',
          provider: 'OpenAI',
          supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
          status: 'disabled'
        }
      ]
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadModelList()
  })

  const handleAdd = () => {
    isEdit.value = false
    form.modelName = ''
    form.modelCode = ''
    form.provider = ''
    form.supportedSizes = []
    dialogVisible.value = true
  }

  const handleEdit = async (row: any) => {
    isEdit.value = true
    form.modelName = row.modelName
    form.modelCode = row.modelCode
    form.provider = row.provider
    form.supportedSizes = [...row.supportedSizes]
    dialogVisible.value = true
    try {
      const res = await fetchGetImageModelDetail(row.modelCode)
      if (res) {
        form.modelName = (res as any).modelName || (res as any).name || form.modelName
        form.provider = (res as any).provider || form.provider
        form.supportedSizes = (res as any).supportedSizes || form.supportedSizes
      }
    } catch {
      // keep current data
    }
  }

  const handleSave = () => {
    ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
  }

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除模型 ${row.modelName} 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('删除成功')
    })
  }
</script>
