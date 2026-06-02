<template>
  <div class="points-pricing-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">模型定价</span>
            <ElTag type="info" size="small">各模型定价标准</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索模型名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect
              v-model="filterVendor"
              placeholder="供应商筛选"
              clearable
              style="width: 140px"
            >
              <ElOption
                v-for="item in vendorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElButton type="primary" @click="handleCompare">
              <ArtSvgIcon icon="ri:bar-chart-grouped-line" class="mr-1" />
              价格对比
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ArtTable
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" label="序号" width="70" align="center" />
          <ElTableColumn label="模型" min-width="200">
            <template #default="scope">
              <div class="flex items-center gap-3">
                <div class="model-icon" :class="scope.row.vendor">
                  <ArtSvgIcon :icon="vendorIconMap[scope.row.vendor as VendorType]" />
                </div>
                <div>
                  <div class="font-medium">{{ scope.row.modelName }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.modelCode }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="供应商" width="120">
            <template #default="scope">
              <ElTag :type="vendorTagMap[scope.row.vendor as VendorType]" size="small">
                {{ vendorLabelMap[scope.row.vendor as VendorType] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Input 价格" width="130" align="right">
            <template #default="scope">
              <span class="font-medium text-success">{{ scope.row.inputPrice }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Output 价格" width="130" align="right">
            <template #default="scope">
              <span class="font-medium text-primary">{{ scope.row.outputPrice }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="图像价格" width="120" align="right">
            <template #default="scope">
              <span class="text-g-600">{{ scope.row.imagePrice || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="unit" label="计价单位" width="100" align="center" />
          <ElTableColumn prop="currency" label="币种" width="80" align="center" />
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="scope.row.enabled ? 'success' : 'info'" size="small">
                {{ scope.row.enabled ? '启用' : '停用' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="scope">
              <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                详情
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
                <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                编辑
              </ElButton>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 价格对比弹窗 -->
    <ElDialog v-model="compareVisible" title="价格对比" width="800px" align-center destroy-on-close>
      <ElTable :data="compareList" style="width: 100%">
        <ElTableColumn prop="modelName" label="模型" min-width="180" />
        <ElTableColumn prop="vendor" label="供应商" width="120">
          <template #default="{ row }">
            <ElTag :type="vendorTagMap[row.vendor as VendorType]" size="small">
              {{ vendorLabelMap[row.vendor as VendorType] }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="inputPrice" label="Input" width="120" align="right" />
        <ElTableColumn prop="outputPrice" label="Output" width="120" align="right" />
        <ElTableColumn prop="imagePrice" label="图像" width="120" align="right" />
        <ElTableColumn label="综合评分" width="120" align="center">
          <template #default="{ row }">
            <ElRate v-model="row.score" disabled show-score text-color="#ff9900" />
          </template>
        </ElTableColumn>
      </ElTable>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="compareVisible = false">关闭</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 编辑定价弹窗 -->
    <ElDialog v-model="editVisible" title="编辑定价" width="560px" align-center destroy-on-close>
      <ElForm :model="editForm" label-width="120px" :rules="editRules" ref="editFormRef">
        <ElFormItem label="模型名称">
          <ElInput v-model="editForm.modelName" disabled />
        </ElFormItem>
        <ElFormItem label="Input 价格" prop="inputPrice">
          <ElInput v-model="editForm.inputPrice" placeholder="请输入 Input 价格" />
        </ElFormItem>
        <ElFormItem label="Output 价格" prop="outputPrice">
          <ElInput v-model="editForm.outputPrice" placeholder="请输入 Output 价格" />
        </ElFormItem>
        <ElFormItem label="图像价格">
          <ElInput v-model="editForm.imagePrice" placeholder="请输入图像价格（可选）" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSwitch v-model="editForm.enabled" active-text="启用" inactive-text="停用" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="editVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEditSubmit">保存</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 详情弹窗 -->
    <ElDialog v-model="detailVisible" title="定价详情" width="520px" align-center destroy-on-close>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="模型名称">{{ currentRow?.modelName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="模型编码">{{ currentRow?.modelCode }}</ElDescriptionsItem>
        <ElDescriptionsItem label="供应商">
          <ElTag :type="vendorTagMap[currentRow?.vendor || 'openai']" size="small">
            {{ vendorLabelMap[currentRow?.vendor || 'openai'] }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="Input 价格">{{ currentRow?.inputPrice }}</ElDescriptionsItem>
        <ElDescriptionsItem label="Output 价格">{{ currentRow?.outputPrice }}</ElDescriptionsItem>
        <ElDescriptionsItem label="图像价格">{{
          currentRow?.imagePrice || '-'
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="计价单位">{{ currentRow?.unit }}</ElDescriptionsItem>
        <ElDescriptionsItem label="币种">{{ currentRow?.currency }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="currentRow?.enabled ? 'success' : 'info'" size="small">
            {{ currentRow?.enabled ? '启用' : '停用' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="更新时间">{{ currentRow?.updateTime }}</ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="detailVisible = false">关闭</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import { fetchGetPricingList } from '@/api/points'

  defineOptions({ name: 'PointsPricing' })

  type VendorType = 'openai' | 'anthropic' | 'midjourney' | 'stability' | 'alibaba'

  interface PricingItem {
    id: number
    modelName: string
    modelCode: string
    vendor: VendorType
    inputPrice: string
    outputPrice: string
    imagePrice: string
    unit: string
    currency: string
    enabled: boolean
    updateTime: string
    score: number
  }

  const searchQuery = ref('')
  const filterVendor = ref<VendorType | ''>('')
  const compareVisible = ref(false)
  const editVisible = ref(false)
  const detailVisible = ref(false)
  const currentRow = ref<PricingItem | null>(null)
  const editFormRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const vendorOptions = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Midjourney', value: 'midjourney' },
    { label: 'Stability', value: 'stability' },
    { label: '阿里云', value: 'alibaba' }
  ]

  const vendorTagMap: Record<VendorType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    openai: 'primary',
    anthropic: 'success',
    midjourney: 'warning',
    stability: 'info',
    alibaba: 'danger'
  }

  const vendorLabelMap: Record<VendorType, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    midjourney: 'Midjourney',
    stability: 'Stability',
    alibaba: '阿里云'
  }

  const vendorIconMap: Record<VendorType, string> = {
    openai: 'ri:openai-fill',
    anthropic: 'ri:brain-line',
    midjourney: 'ri:image-line',
    stability: 'ri:landscape-line',
    alibaba: 'ri:ali-baba-line'
  }

  const list = ref<PricingItem[]>([])

  const loadList = async () => {
    try {
      const data = await fetchGetPricingList()
      if (data) {
        list.value = (Array.isArray(data) ? data : (data as any).list || []).map((item: any) => ({
          id: item.id,
          modelName: item.modelName || '',
          modelCode: item.modelCode || '',
          vendor: item.vendor || 'openai',
          inputPrice: item.inputPrice || '',
          outputPrice: item.outputPrice || '',
          imagePrice: item.imagePrice || '-',
          unit: item.unit || '',
          currency: item.currency || '',
          enabled: item.enabled ?? true,
          updateTime: item.updateTime || '',
          score: item.score || 0
        })) as PricingItem[]
      }
    } catch {
      ElMessage.error('加载定价列表失败')
    }
  }

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'modelName', label: '模型', minWidth: 200 },
    { prop: 'vendor', label: '供应商', width: 120 },
    { prop: 'inputPrice', label: 'Input 价格', width: 130 },
    { prop: 'outputPrice', label: 'Output 价格', width: 130 },
    { prop: 'imagePrice', label: '图像价格', width: 120 },
    { prop: 'unit', label: '计价单位', width: 100 },
    { prop: 'currency', label: '币种', width: 80 },
    { prop: 'enabled', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
  ]

  const filteredList = computed(() => {
    let result = list.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.modelName.toLowerCase().includes(q) || item.modelCode.toLowerCase().includes(q)
      )
    }

    if (filterVendor.value) {
      result = result.filter((item) => item.vendor === filterVendor.value)
    }

    return result
  })

  const pagedList = computed(() => {
    const list = filteredList.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredList, (list) => {
    pagination.total = list.length
  })

  const compareList = computed(() => {
    return list.value.filter((item) => item.enabled).slice(0, 6)
  })

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleCompare = () => {
    compareVisible.value = true
  }

  const handleView = (row: PricingItem) => {
    currentRow.value = row
    detailVisible.value = true
  }

  const editForm = reactive({
    id: 0,
    modelName: '',
    inputPrice: '',
    outputPrice: '',
    imagePrice: '',
    enabled: true
  })

  const editRules: FormRules = {
    inputPrice: [{ required: true, message: '请输入 Input 价格', trigger: 'blur' }],
    outputPrice: [{ required: true, message: '请输入 Output 价格', trigger: 'blur' }]
  }

  const handleEdit = (row: PricingItem) => {
    editForm.id = row.id
    editForm.modelName = row.modelName
    editForm.inputPrice = row.inputPrice
    editForm.outputPrice = row.outputPrice
    editForm.imagePrice = row.imagePrice
    editForm.enabled = row.enabled
    editVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate((valid) => {
      if (valid) {
        const item = list.value.find((i) => i.id === editForm.id)
        if (item) {
          item.inputPrice = editForm.inputPrice
          item.outputPrice = editForm.outputPrice
          item.imagePrice = editForm.imagePrice
          item.enabled = editForm.enabled
          item.updateTime = new Date().toISOString().slice(0, 10)
        }
        ElMessage.success('定价已更新')
        editVisible.value = false
      }
    })
  }

  onMounted(() => {
    loadList()
  })
</script>

<style lang="scss" scoped>
  .points-pricing-page {
    height: 100%;

    .model-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;

      &.openai {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.anthropic {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.midjourney {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.stability {
        background: var(--el-color-info-light-9);
        color: var(--el-color-info);
      }

      &.alibaba {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }
    }
  }
</style>
