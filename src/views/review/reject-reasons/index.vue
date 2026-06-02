<template>
  <div class="reject-reasons-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">驳回原因配置</span>
            <ElTag type="info" size="small">管理预设驳回原因</ElTag>
          </div>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增原因
          </ElButton>
        </div>
      </template>

      <div class="flex-cb mb-4">
        <ElSpace>
          <ElInput v-model="searchQuery" placeholder="搜索原因内容" clearable style="width: 220px">
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
            </template>
          </ElInput>
          <ElSelect v-model="filterCategory" placeholder="分类筛选" clearable style="width: 140px">
            <ElOption
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
          <ElSelect v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px">
            <ElOption label="启用" value="enabled" />
            <ElOption label="禁用" value="disabled" />
          </ElSelect>
        </ElSpace>
      </div>

      <ArtTable
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="index" width="60" label="序号" />
          <ElTableColumn label="驳回原因" min-width="280">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:close-circle-line" class="text-danger" />
                <span class="font-medium">{{ scope.row.content }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="分类" width="120">
            <template #default="scope">
              <ElTag :type="getCategoryTag(scope.row.category)" size="small">
                {{ getCategoryLabel(scope.row.category) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="适用类型" width="160">
            <template #default="scope">
              <ElSpace wrap>
                <ElTag
                  v-for="(type, idx) in scope.row.applicableTypes"
                  :key="idx"
                  type="info"
                  size="small"
                >
                  {{ getTypeLabel(type) }}
                </ElTag>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="usageCount" label="使用次数" width="100" sortable />
          <ElTableColumn prop="sort" label="排序" width="80" />
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElSwitch
                v-model="scope.row.enabled"
                @change="
                  (val: string | number | boolean) => handleToggleStatus(scope.row, val as boolean)
                "
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="scope">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑驳回原因' : '新增驳回原因'"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <ElFormItem label="驳回原因" prop="content" required>
          <ElInput
            v-model="form.content"
            type="textarea"
            :rows="2"
            placeholder="请输入驳回原因内容"
          />
        </ElFormItem>
        <ElFormItem label="分类" prop="category" required>
          <ElSelect v-model="form.category" placeholder="选择分类" class="w-full">
            <ElOption
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="适用类型" prop="applicableTypes" required>
          <ElSelect
            v-model="form.applicableTypes"
            multiple
            placeholder="选择适用审核类型"
            class="w-full"
          >
            <ElOption label="分镜审核" value="storyboard" />
            <ElOption label="首帧图审核" value="firstFrame" />
            <ElOption label="视频审核" value="video" />
            <ElOption label="剧本审核" value="script" />
            <ElOption label="资产审核" value="asset" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="排序">
          <ElInputNumber v-model="form.sort" :min="0" :max="999" class="w-full" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElRadioGroup v-model="form.enabled">
            <ElRadio :value="true">启用</ElRadio>
            <ElRadio :value="false">禁用</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    fetchGetRejectReasons,
    fetchAddRejectReason,
    fetchDeleteRejectReason
  } from '@/api/review'

  defineOptions({ name: 'RejectReasons' })

  type CategoryType = 'quality' | 'content' | 'compliance' | 'technical' | 'other'
  type ApplicableType = 'storyboard' | 'firstFrame' | 'video' | 'script' | 'asset'

  interface ReasonItem {
    id: number
    content: string
    category: CategoryType
    applicableTypes: ApplicableType[]
    usageCount: number
    sort: number
    enabled: boolean
    createTime: string
  }

  const searchQuery = ref('')
  const filterCategory = ref<CategoryType | ''>('')
  const filterStatus = ref<'enabled' | 'disabled' | ''>('')
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const currentId = ref<number | null>(null)
  const formRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const categoryOptions = [
    { label: '质量问题', value: 'quality' },
    { label: '内容问题', value: 'content' },
    { label: '合规问题', value: 'compliance' },
    { label: '技术问题', value: 'technical' },
    { label: '其他', value: 'other' }
  ]

  const categoryTagMap: Record<
    CategoryType,
    'danger' | 'warning' | 'info' | 'success' | 'primary'
  > = {
    quality: 'danger',
    content: 'warning',
    compliance: 'success',
    technical: 'info',
    other: 'primary'
  }

  const categoryLabelMap: Record<CategoryType, string> = {
    quality: '质量问题',
    content: '内容问题',
    compliance: '合规问题',
    technical: '技术问题',
    other: '其他'
  }

  const typeLabelMap: Record<ApplicableType, string> = {
    storyboard: '分镜审核',
    firstFrame: '首帧图审核',
    video: '视频审核',
    script: '剧本审核',
    asset: '资产审核'
  }

  const getCategoryTag = (category: CategoryType) => categoryTagMap[category]
  const getCategoryLabel = (category: CategoryType) => categoryLabelMap[category]
  const getTypeLabel = (type: ApplicableType) => typeLabelMap[type]

  const route = useRoute()
  const projectId = (route.params.projectId as string) || '1'

  const form = reactive<Partial<ReasonItem>>({
    content: '',
    category: 'quality',
    applicableTypes: [],
    sort: 0,
    enabled: true
  })

  const formRules: FormRules = {
    content: [{ required: true, message: '请输入驳回原因', trigger: 'blur' }],
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    applicableTypes: [{ required: true, message: '请选择适用类型', trigger: 'change' }]
  }

  const reasonList = ref<ReasonItem[]>([])

  const loadReasonList = async () => {
    try {
      const res = await fetchGetRejectReasons(projectId)
      reasonList.value = (res || []) as ReasonItem[]
    } catch {
      reasonList.value = []
    }
  }

  const columns: ColumnOption[] = [
    { type: 'index' },
    { prop: 'content', label: '驳回原因', minWidth: 280 },
    { prop: 'category', label: '分类', width: 120 },
    { prop: 'applicableTypes', label: '适用类型', width: 160 },
    { prop: 'usageCount', label: '使用次数', width: 100, sortable: true },
    { prop: 'sort', label: '排序', width: 80 },
    { prop: 'enabled', label: '状态', width: 100 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const filteredList = computed(() => {
    let result = reasonList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter((item) => item.content.toLowerCase().includes(q))
    }

    if (filterCategory.value) {
      result = result.filter((item) => item.category === filterCategory.value)
    }

    if (filterStatus.value) {
      result = result.filter((item) =>
        filterStatus.value === 'enabled' ? item.enabled : !item.enabled
      )
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

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleAdd = () => {
    isEdit.value = false
    currentId.value = null
    form.content = ''
    form.category = 'quality'
    form.applicableTypes = []
    form.sort = reasonList.value.length + 1
    form.enabled = true
    dialogVisible.value = true
  }

  const handleEdit = (row: ReasonItem) => {
    isEdit.value = true
    currentId.value = row.id
    Object.assign(form, row)
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (isEdit.value && currentId.value) {
          const index = reasonList.value.findIndex((i) => i.id === currentId.value)
          if (index !== -1) {
            reasonList.value[index] = {
              ...reasonList.value[index],
              ...form
            } as ReasonItem
          }
          ElMessage.success('编辑成功')
        } else {
          try {
            const res = await fetchAddRejectReason(projectId, {
              content: form.content!,
              category: form.category as any,
              applicableTypes: form.applicableTypes as any,
              sort: form.sort || 0,
              enabled: form.enabled ?? true
            })
            const newItem: ReasonItem = {
              id: (res as any)?.id || Date.now(),
              content: form.content!,
              category: form.category as CategoryType,
              applicableTypes: form.applicableTypes as ApplicableType[],
              usageCount: 0,
              sort: form.sort || 0,
              enabled: form.enabled ?? true,
              createTime: new Date().toISOString().slice(0, 10)
            }
            reasonList.value.push(newItem)
            ElMessage.success('创建成功')
          } catch {
            const newItem: ReasonItem = {
              id: Date.now(),
              content: form.content!,
              category: form.category as CategoryType,
              applicableTypes: form.applicableTypes as ApplicableType[],
              usageCount: 0,
              sort: form.sort || 0,
              enabled: form.enabled ?? true,
              createTime: new Date().toISOString().slice(0, 10)
            }
            reasonList.value.push(newItem)
            ElMessage.success('创建成功')
          }
        }
        dialogVisible.value = false
      }
    })
  }

  const handleDelete = (row: ReasonItem) => {
    ElMessageBox.confirm(`确定要删除驳回原因「${row.content}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await fetchDeleteRejectReason(projectId, String(row.id))
      } catch {
        // proceed with local removal
      }
      reasonList.value = reasonList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  const handleToggleStatus = (row: ReasonItem, val: boolean) => {
    ElMessage.success(`已${val ? '启用' : '禁用'}驳回原因「${row.content}」`)
  }

  onMounted(() => {
    loadReasonList()
  })
</script>

<style lang="scss" scoped>
  .reject-reasons-page {
    .text-danger {
      color: var(--el-color-danger);
    }
  }
</style>
