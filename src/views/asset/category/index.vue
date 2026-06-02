<template>
  <div class="asset-category-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">分类管理</span>
            <ElTag type="info" size="small">按类型分类管理素材</ElTag>
          </div>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增分类
          </ElButton>
        </div>
      </template>

      <!-- 分类统计卡片 -->
      <div class="category-stats mb-6">
        <ElRow :gutter="16">
          <ElCol
            v-for="stat in categoryStats"
            :key="stat.type"
            :span="4"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
          >
            <div class="stat-card" :class="stat.type">
              <div class="stat-icon">
                <ArtSvgIcon :icon="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.count }}</div>
                <div class="stat-label">{{ stat.name }}</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <!-- 分类列表 -->
      <ElTable :data="categoryList" style="width: 100%" v-loading="loading">
        <ElTableColumn label="分类名称" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <div class="category-icon" :class="row.type">
                <ArtSvgIcon :icon="typeIconMap[row.type as CategoryType]" />
              </div>
              <div>
                <div class="font-medium">{{ row.name }}</div>
                <div class="text-xs text-g-400">{{ row.code }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="type" label="类型" width="120">
          <template #default="{ row }">
            <ElTag :type="typeTagMap[row.type as CategoryType]" size="small">
              {{ typeLabelMap[row.type as CategoryType] }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="count" label="素材数量" width="120">
          <template #default="{ row }">
            <ElTag v-if="row.count > 0" type="info" size="small">{{ row.count }} 个</ElTag>
            <span v-else class="text-g-400">-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn prop="sort" label="排序" width="100" />
        <ElTableColumn prop="updateTime" label="更新时间" width="160" />
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.enabled"
              @change="(val: string | number | boolean) => handleToggleStatus(row, val as boolean)"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" link size="small" @click="handleEdit(row)">
                <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                编辑
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleViewAssets(row)">
                <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                查看素材
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(row)">
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增/编辑分类弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <ElFormItem label="分类名称" prop="name" required>
          <ElInput v-model="form.name" placeholder="请输入分类名称" />
        </ElFormItem>
        <ElFormItem label="分类编码">
          <ElInput v-model="form.code" placeholder="请输入分类编码" :disabled="isEdit" />
        </ElFormItem>
        <ElFormItem label="所属类型" prop="type" required>
          <ElSelect v-model="form.type" placeholder="请选择类型" class="w-full" :disabled="isEdit">
            <ElOption label="图片" value="image" />
            <ElOption label="视频" value="video" />
            <ElOption label="音频" value="audio" />
            <ElOption label="文档" value="document" />
            <ElOption label="AI生成" value="ai-generated" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="排序">
          <ElInputNumber v-model="form.sort" :min="0" :max="999" class="w-full" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
  import { fetchGetProjectAssets, fetchBatchMoveCategory } from '@/api/asset'

  defineOptions({ name: 'AssetCategory' })

  type CategoryType = 'image' | 'video' | 'audio' | 'document' | 'ai-generated'

  interface CategoryItem {
    id: number
    name: string
    code: string
    type: CategoryType
    count: number
    description: string
    sort: number
    enabled: boolean
    updateTime: string
    createTime: string
  }

  const loading = ref(false)
  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const currentId = ref<number | null>(null)
  const formRef = ref<FormInstance>()

  const typeIconMap: Record<CategoryType, string> = {
    image: 'ri:image-line',
    video: 'ri:video-line',
    audio: 'ri:music-2-line',
    document: 'ri:file-text-line',
    'ai-generated': 'ri:sparkling-line'
  }

  const typeTagMap: Record<CategoryType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    image: 'primary',
    video: 'success',
    audio: 'warning',
    document: 'info',
    'ai-generated': 'danger'
  }

  const typeLabelMap: Record<CategoryType, string> = {
    image: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    'ai-generated': 'AI生成'
  }

  const categoryList = ref<CategoryItem[]>([])

  const loadCategoryList = async () => {
    const projectId = '1'
    loading.value = true
    try {
      const data = await fetchGetProjectAssets(projectId)
      if (data) {
        const records = Array.isArray(data) ? data : (data as any).records || []
        const categoryMap = new Map<string, CategoryItem>()
        records.forEach((item: any) => {
          const cat = item.category || 'uncategorized'
          if (!categoryMap.has(cat)) {
            categoryMap.set(cat, {
              id: Date.now() + Math.random(),
              name: item.categoryName || cat,
              code: `CAT-${cat.toUpperCase().slice(0, 3)}`,
              type: (item.assetType || item.type || 'image') as CategoryType,
              count: 1,
              description: item.description || '',
              sort: categoryMap.size + 1,
              enabled: true,
              updateTime: item.updateTime || new Date().toISOString().slice(0, 10),
              createTime: item.createTime || new Date().toISOString().slice(0, 10)
            })
          } else {
            const existing = categoryMap.get(cat)!
            existing.count++
          }
        })
        categoryList.value = Array.from(categoryMap.values())
      }
    } catch {
      categoryList.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadCategoryList()
  })

  const categoryStats = computed(() => {
    const types: CategoryType[] = ['image', 'video', 'audio', 'document', 'ai-generated']
    return types.map((type) => {
      const count = categoryList.value
        .filter((c) => c.type === type && c.enabled)
        .reduce((sum, c) => sum + c.count, 0)
      return {
        type,
        name: typeLabelMap[type],
        icon: typeIconMap[type],
        count
      }
    })
  })

  const form = reactive<Partial<CategoryItem>>({
    name: '',
    code: '',
    type: 'image',
    description: '',
    sort: 0,
    enabled: true
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择类型', trigger: 'change' }]
  }

  const handleAdd = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.code = ''
    form.type = 'image'
    form.description = ''
    form.sort = categoryList.value.length + 1
    form.enabled = true
    dialogVisible.value = true
  }

  const handleEdit = (row: CategoryItem) => {
    isEdit.value = true
    currentId.value = row.id
    Object.assign(form, row)
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        const projectId = '1'
        if (isEdit.value && currentId.value) {
          const index = categoryList.value.findIndex((i) => i.id === currentId.value)
          if (index !== -1) {
            const oldCategory = categoryList.value[index].code
            categoryList.value[index] = {
              ...categoryList.value[index],
              ...form,
              updateTime: new Date().toISOString().slice(0, 10)
            } as CategoryItem
            if (oldCategory !== form.code) {
              try {
                await fetchBatchMoveCategory(projectId, {
                  assetIds: [],
                  targetCategory: form.code || ''
                } as any)
              } catch {
                // proceed with local update
              }
            }
          }
          ElMessage.success('编辑成功')
        } else {
          const prefixMap: Record<CategoryType, string> = {
            image: 'CAT-IMG',
            video: 'CAT-VID',
            audio: 'CAT-AUD',
            document: 'CAT-DOC',
            'ai-generated': 'CAT-AI'
          }
          const typeCount = categoryList.value.filter((i) => i.type === form.type).length + 1
          const newItem: CategoryItem = {
            id: Date.now(),
            name: form.name!,
            code:
              form.code ||
              `${prefixMap[form.type as CategoryType]}-${String(typeCount).padStart(3, '0')}`,
            type: form.type as CategoryType,
            count: 0,
            description: form.description || '',
            sort: form.sort || 0,
            enabled: form.enabled ?? true,
            createTime: new Date().toISOString().slice(0, 10),
            updateTime: new Date().toISOString().slice(0, 10)
          }
          categoryList.value.push(newItem)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
      }
    })
  }

  const handleDelete = (row: CategoryItem) => {
    if (row.count > 0) {
      ElMessageBox.confirm(
        `分类「${row.name}」下还有 ${row.count} 个素材，删除后素材将变为未分类状态，确定要继续吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        categoryList.value = categoryList.value.filter((item) => item.id !== row.id)
        ElMessage.success('删除成功')
      })
    } else {
      ElMessageBox.confirm(`确定要删除分类「${row.name}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        categoryList.value = categoryList.value.filter((item) => item.id !== row.id)
        ElMessage.success('删除成功')
      })
    }
  }

  const handleToggleStatus = (row: CategoryItem, val: boolean) => {
    ElMessage.success(`已${val ? '启用' : '禁用'}分类「${row.name}」`)
  }

  const handleViewAssets = async (row: CategoryItem) => {
    try {
      const projectId = '1'
      const data = await fetchGetProjectAssets(projectId, { category: row.code } as any)
      const records = data ? (Array.isArray(data) ? data : (data as any).records || []) : []
      ElMessage.info(`查看「${row.name}」下的 ${records.length || row.count} 个素材`)
    } catch {
      ElMessage.info(`查看「${row.name}」下的 ${row.count} 个素材`)
    }
  }
</script>

<style lang="scss" scoped>
  .category-stats {
    .stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      &.image .stat-icon {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &.video .stat-icon {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.audio .stat-icon {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }

      &.document .stat-icon {
        background: var(--el-color-info-light-9);
        color: var(--el-color-info);
      }

      &.ai-generated .stat-icon {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }
  }

  .category-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;

    &.image {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.video {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }

    &.audio {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }

    &.document {
      background: var(--el-color-info-light-9);
      color: var(--el-color-info);
    }

    &.ai-generated {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }
</style>
