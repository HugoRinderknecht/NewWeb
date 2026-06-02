<template>
  <div class="asset-library-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">资源库</span>
            <ElTag type="info" size="small">{{ pagination.total }} 个资产</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索资产名称/标签"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterType" placeholder="类型筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElSelect
              v-model="filterCategory"
              placeholder="分类筛选"
              clearable
              style="width: 140px"
            >
              <ElOption
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElButton type="primary" @click="handleUpload">
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
              上传素材
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 批量操作栏 -->
      <div class="batch-toolbar flex-cb mb-4">
        <ElSpace>
          <ElCheckbox
            v-model="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="(val: string | number | boolean) => handleSelectAllChange(val as boolean)"
          >
            全选
          </ElCheckbox>
          <ElDropdown @command="handleBatchCommand" :disabled="selectedAssets.length === 0">
            <ElButton :disabled="selectedAssets.length === 0" size="small">
              批量操作
              <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-1" />
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="download">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" /> 批量下载
                </ElDropdownItem>
                <ElDropdownItem command="move">
                  <ArtSvgIcon icon="ri:folder-transfer-line" class="mr-1" /> 批量移动
                </ElDropdownItem>
                <ElDropdownItem command="tag">
                  <ArtSvgIcon icon="ri:price-tag-3-line" class="mr-1" /> 批量标签
                </ElDropdownItem>
                <ElDropdownItem command="delete" divided>
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" /> 批量删除
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          <span v-if="selectedAssets.length > 0" class="text-sm text-g-400">
            已选择 {{ selectedAssets.length }} 项
          </span>
        </ElSpace>
        <ElRadioGroup v-model="viewMode">
          <ElRadioButton value="card">
            <ArtSvgIcon icon="ri:layout-grid-line" />
          </ElRadioButton>
          <ElRadioButton value="list">
            <ArtSvgIcon icon="ri:list-check" />
          </ElRadioButton>
        </ElRadioGroup>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="asset-card-grid">
        <ElCard
          v-for="item in pagedList"
          :key="item.id"
          class="asset-card"
          shadow="hover"
          :class="{ selected: selectedIds.includes(item.id) }"
          @click="handleCardClick(item, $event)"
        >
          <div class="asset-card-cover">
            <ElImage
              v-if="item.type === 'image'"
              :src="item.url"
              fit="cover"
              class="cover-image"
              preview-teleported
            >
              <template #error>
                <div class="cover-placeholder flex-cc">
                  <ArtSvgIcon :icon="typeIconMap[item.type]" class="text-3xl" />
                </div>
              </template>
            </ElImage>
            <div
              v-else-if="item.type === 'video'"
              class="cover-placeholder video-placeholder flex-cc"
              @click.stop="handlePreview(item)"
            >
              <ArtSvgIcon icon="ri:play-circle-line" class="text-4xl" />
            </div>
            <div
              v-else-if="item.type === 'audio'"
              class="cover-placeholder audio-placeholder flex-cc"
              @click.stop="handlePreview(item)"
            >
              <ArtSvgIcon icon="ri:music-2-line" class="text-3xl" />
            </div>
            <div v-else class="cover-placeholder flex-cc">
              <ArtSvgIcon :icon="typeIconMap[item.type]" class="text-3xl" />
            </div>
            <ElTag :type="typeTagMap[item.type]" size="small" class="cover-type">
              {{ typeLabelMap[item.type] }}
            </ElTag>
            <div v-if="selectedIds.includes(item.id)" class="cover-check">
              <ArtSvgIcon icon="ri:check-fill" class="text-white" />
            </div>
          </div>
          <div class="asset-card-body">
            <h4 class="asset-name">{{ item.name }}</h4>
            <p class="asset-desc">{{ item.description }}</p>
            <div class="asset-tags">
              <ElTag v-for="tag in item.tags.slice(0, 3)" :key="tag" size="small" class="mr-1">
                {{ tag }}
              </ElTag>
            </div>
            <div class="asset-meta flex-cb">
              <span class="text-xs text-g-400">{{ formatSize(item.size) }}</span>
              <span class="text-xs text-g-400">{{ item.updateTime }}</span>
            </div>
            <div class="asset-actions">
              <ElButton type="primary" link size="small" @click.stop="handlePreview(item)">
                预览
              </ElButton>
              <ElButton type="primary" link size="small" @click.stop="handleEdit(item)">
                编辑
              </ElButton>
              <ElButton type="primary" link size="small" @click.stop="handleReuse(item)">
                复用
              </ElButton>
              <ElButton type="danger" link size="small" @click.stop="handleDelete(item)">
                删除
              </ElButton>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 列表视图 -->
      <ElTable
        v-else
        :data="pagedList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />
        <ElTableColumn label="资产名称" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <div class="asset-icon" :class="row.type">
                <ArtSvgIcon :icon="typeIconMap[row.type as AssetType]" />
              </div>
              <div>
                <div class="font-medium">{{ row.name }}</div>
                <div class="text-xs text-g-400">{{ row.categoryName }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="类型" width="100">
          <template #default="{ row }">
            <ElTag :type="typeTagMap[row.type as AssetType]" size="small">{{
              typeLabelMap[row.type as AssetType]
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="标签" width="180">
          <template #default="{ row }">
            <ElTag v-for="tag in row.tags.slice(0, 2)" :key="tag" size="small" class="mr-1">{{
              tag
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="大小" width="100">
          <template #default="{ row }">
            {{ formatSize(row.size) }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updateTime" label="更新时间" width="160" />
        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" link size="small" @click="handlePreview(row)">预览</ElButton>
              <ElButton type="primary" link size="small" @click="handleEdit(row)">编辑</ElButton>
              <ElButton type="primary" link size="small" @click="handleReuse(row)">复用</ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>

    <!-- 预览弹窗 -->
    <ElDialog
      v-model="previewVisible"
      :title="currentAsset?.name"
      width="800px"
      align-center
      destroy-on-close
    >
      <div v-if="currentAsset" class="preview-content">
        <ElImage
          v-if="currentAsset.type === 'image'"
          :src="currentAsset.url"
          fit="contain"
          class="preview-image"
        />
        <div v-else-if="currentAsset.type === 'video'" class="preview-video flex-cc">
          <ArtSvgIcon icon="ri:video-line" class="text-6xl text-g-400" />
          <p class="mt-4 text-g-400">视频播放组件占位</p>
        </div>
        <div v-else-if="currentAsset.type === 'audio'" class="preview-audio flex-cc">
          <ArtSvgIcon icon="ri:music-2-line" class="text-6xl text-g-400" />
          <p class="mt-4 text-g-400">音频播放组件占位</p>
        </div>
        <div v-else class="preview-doc flex-cc">
          <ArtSvgIcon icon="ri:file-text-line" class="text-6xl text-g-400" />
          <p class="mt-4 text-g-400">文档预览组件占位</p>
        </div>
      </div>
      <div v-if="currentAsset" class="preview-meta mt-4">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="类型">{{
            typeLabelMap[currentAsset.type]
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="分类">{{ currentAsset.categoryName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="大小">{{ formatSize(currentAsset.size) }}</ElDescriptionsItem>
          <ElDescriptionsItem label="格式">{{ currentAsset.format }}</ElDescriptionsItem>
          <ElDescriptionsItem label="标签">{{
            currentAsset.tags.join('、') || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ currentAsset.updateTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="描述" :span="2">{{
            currentAsset.description
          }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElDialog>

    <!-- 编辑弹窗 -->
    <ElDialog v-model="editVisible" title="编辑资产" width="560px" align-center destroy-on-close>
      <ElForm :model="editForm" label-width="100px" :rules="editRules" ref="editFormRef">
        <ElFormItem label="资产名称" prop="name" required>
          <ElInput v-model="editForm.name" placeholder="请输入资产名称" />
        </ElFormItem>
        <ElFormItem label="分类">
          <ElSelect v-model="editForm.category" placeholder="请选择分类" class="w-full">
            <ElOption
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="标签">
          <ElSelect
            v-model="editForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请输入标签"
            class="w-full"
          >
            <ElOption v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="editVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleEditSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 批量移动弹窗 -->
    <ElDialog v-model="moveVisible" title="批量移动" width="480px" align-center destroy-on-close>
      <ElForm label-width="100px">
        <ElFormItem label="目标分类" required>
          <ElSelect v-model="moveTargetCategory" placeholder="请选择目标分类" class="w-full">
            <ElOption
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="moveVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleMoveSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 批量标签弹窗 -->
    <ElDialog v-model="tagVisible" title="批量标签" width="480px" align-center destroy-on-close>
      <ElForm label-width="100px">
        <ElFormItem label="添加标签">
          <ElSelect
            v-model="batchTags"
            multiple
            filterable
            allow-create
            placeholder="请输入标签"
            class="w-full"
          >
            <ElOption v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="操作方式">
          <ElRadioGroup v-model="tagMode">
            <ElRadio value="append">追加标签</ElRadio>
            <ElRadio value="replace">替换标签</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="tagVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleTagSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchGetProjectAssets, fetchDeleteAsset, fetchBatchDeleteAssets } from '@/api/asset'

  defineOptions({ name: 'AssetLibrary' })

  type AssetType = 'image' | 'video' | 'audio' | 'document' | 'ai-generated'

  interface AssetItem {
    id: number
    name: string
    type: AssetType
    category: string
    categoryName: string
    tags: string[]
    description: string
    size: number
    format: string
    url: string
    updateTime: string
    createTime: string
  }

  const router = useRouter()
  const route = useRoute()

  const projectId = computed(() => (route.params.projectId as string) || '1')

  const searchQuery = ref('')
  const filterType = ref<AssetType | ''>('')
  const filterCategory = ref('')
  const viewMode = ref<'card' | 'list'>('card')
  const selectedAssets = ref<AssetItem[]>([])
  const previewVisible = ref(false)
  const editVisible = ref(false)
  const moveVisible = ref(false)
  const tagVisible = ref(false)
  const currentAsset = ref<AssetItem | null>(null)
  const moveTargetCategory = ref('')
  const batchTags = ref<string[]>([])
  const tagMode = ref<'append' | 'replace'>('append')
  const editFormRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 12,
    total: 0
  })

  const typeOptions = [
    { label: '图片', value: 'image' },
    { label: '视频', value: 'video' },
    { label: '音频', value: 'audio' },
    { label: '文档', value: 'document' },
    { label: 'AI生成', value: 'ai-generated' }
  ]

  const categoryOptions = [
    { label: '角色原画', value: 'character-art' },
    { label: '场景背景', value: 'scene-bg' },
    { label: '动画片段', value: 'animation-clip' },
    { label: '宣传视频', value: 'promo-video' },
    { label: '背景音乐', value: 'bgm' },
    { label: '音效素材', value: 'sfx' },
    { label: '剧本文档', value: 'script-doc' },
    { label: 'AI生成图片', value: 'ai-image' },
    { label: 'AI生成视频', value: 'ai-video' }
  ]

  const typeIconMap: Record<AssetType, string> = {
    image: 'ri:image-line',
    video: 'ri:video-line',
    audio: 'ri:music-2-line',
    document: 'ri:file-text-line',
    'ai-generated': 'ri:sparkling-line'
  }

  const typeTagMap: Record<AssetType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    image: 'primary',
    video: 'success',
    audio: 'warning',
    document: 'info',
    'ai-generated': 'danger'
  }

  const typeLabelMap: Record<AssetType, string> = {
    image: '图片',
    video: '视频',
    audio: '音频',
    document: '文档',
    'ai-generated': 'AI生成'
  }

  const allTags = [
    '角色',
    '场景',
    '道具',
    'UI',
    '特效',
    '背景',
    '封面',
    '片头',
    '片尾',
    '音效',
    '配乐',
    '主角',
    '反派'
  ]

  const assetList = ref<AssetItem[]>([])
  const loading = ref(false)

  const loadAssetList = async () => {
    loading.value = true
    try {
      const data = await fetchGetProjectAssets(projectId.value)
      if (data) {
        const records = Array.isArray(data) ? data : data.records || []
        assetList.value = records.map((item: any) => ({
          id: Number(item.id),
          name: item.name || '',
          type: (item.type || item.assetType || 'image') as AssetType,
          category: item.category || '',
          categoryName: item.categoryName || item.category || '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          description: item.description || '',
          size: Number(item.size) || 0,
          format: item.format || '',
          url: item.url || '',
          updateTime: item.updateTime || '',
          createTime: item.createTime || ''
        }))
        pagination.total = Array.isArray(data) ? records.length : data.total || records.length
      }
    } catch {
      ElMessage.error('加载资产列表失败')
    } finally {
      loading.value = false
    }
  }

  const editForm = reactive({
    name: '',
    category: '',
    tags: [] as string[],
    description: ''
  })

  const editRules: FormRules = {
    name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }]
  }

  const selectedIds = computed(() => selectedAssets.value.map((a) => a.id))

  const isAllSelected = computed(() => {
    return (
      pagedList.value.length > 0 &&
      pagedList.value.every((item) => selectedIds.value.includes(item.id))
    )
  })

  const isIndeterminate = computed(() => {
    return selectedAssets.value.length > 0 && !isAllSelected.value
  })

  const filteredList = computed(() => {
    let result = assetList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q)
      )
    }

    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }

    if (filterCategory.value) {
      result = result.filter((item) => item.category === filterCategory.value)
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

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = () => {
    router.push('/asset/upload')
  }

  const handleSelectionChange = (selection: AssetItem[]) => {
    selectedAssets.value = selection
  }

  const handleSelectAllChange = (val: boolean) => {
    if (val) {
      const newSelection = [...selectedAssets.value]
      pagedList.value.forEach((item) => {
        if (!newSelection.find((s) => s.id === item.id)) {
          newSelection.push(item)
        }
      })
      selectedAssets.value = newSelection
    } else {
      const pageIds = pagedList.value.map((i) => i.id)
      selectedAssets.value = selectedAssets.value.filter((s) => !pageIds.includes(s.id))
    }
  }

  const handleCardClick = (item: AssetItem, event: MouseEvent) => {
    // 如果点击的是按钮，不触发选择
    const target = event.target as HTMLElement
    if (target.closest('button')) return

    const index = selectedAssets.value.findIndex((a) => a.id === item.id)
    if (index > -1) {
      selectedAssets.value.splice(index, 1)
    } else {
      selectedAssets.value.push(item)
    }
  }

  const handlePreview = (row: AssetItem) => {
    currentAsset.value = row
    previewVisible.value = true
  }

  const handleEdit = (row: AssetItem) => {
    currentAsset.value = row
    editForm.name = row.name
    editForm.category = row.category
    editForm.tags = [...row.tags]
    editForm.description = row.description
    editVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid && currentAsset.value) {
        const index = assetList.value.findIndex((i) => i.id === currentAsset.value!.id)
        if (index !== -1) {
          const cat = categoryOptions.find((c) => c.value === editForm.category)
          assetList.value[index] = {
            ...assetList.value[index],
            name: editForm.name,
            category: editForm.category,
            categoryName: cat?.label || assetList.value[index].categoryName,
            tags: [...editForm.tags],
            description: editForm.description,
            updateTime: new Date().toISOString().slice(0, 10)
          }
        }
        ElMessage.success('编辑成功')
        editVisible.value = false
      }
    })
  }

  const handleReuse = (row: AssetItem) => {
    ElMessageBox.confirm(`确定要将「${row.name}」创建为可复用资产引用吗？`, '创建资产引用', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      ElMessage.success(`已创建「${row.name}」的资产引用`)
    })
  }

  const handleDelete = async (row: AssetItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除资产「${row.name}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteAsset(projectId.value, String(row.id))
      assetList.value = assetList.value.filter((item) => item.id !== row.id)
      selectedAssets.value = selectedAssets.value.filter((s) => s.id !== row.id)
      ElMessage.success('删除成功')
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const handleBatchCommand = async (command: string) => {
    if (selectedAssets.value.length === 0) {
      ElMessage.warning('请先选择资产')
      return
    }
    if (command === 'delete') {
      const names = selectedAssets.value.map((a) => a.name).join('、')
      try {
        await ElMessageBox.confirm(
          `确定要删除以下 ${selectedAssets.value.length} 个资产吗？\n${names}`,
          '批量删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
          }
        )
        const ids = selectedAssets.value.map((a) => String(a.id))
        await fetchBatchDeleteAssets(projectId.value, ids)
        assetList.value = assetList.value.filter((item) => !ids.includes(String(item.id)))
        selectedAssets.value = []
        ElMessage.success('批量删除成功')
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败')
        }
      }
    } else if (command === 'download') {
      ElMessage.success(`开始批量下载 ${selectedAssets.value.length} 个资产`)
    } else if (command === 'move') {
      moveTargetCategory.value = ''
      moveVisible.value = true
    } else if (command === 'tag') {
      batchTags.value = []
      tagMode.value = 'append'
      tagVisible.value = true
    }
  }

  const handleMoveSubmit = () => {
    if (!moveTargetCategory.value) {
      ElMessage.warning('请选择目标分类')
      return
    }
    const cat = categoryOptions.find((c) => c.value === moveTargetCategory.value)
    selectedAssets.value.forEach((asset) => {
      const index = assetList.value.findIndex((i) => i.id === asset.id)
      if (index !== -1) {
        assetList.value[index].category = moveTargetCategory.value
        assetList.value[index].categoryName = cat?.label || ''
        assetList.value[index].updateTime = new Date().toISOString().slice(0, 10)
      }
    })
    ElMessage.success(`已将 ${selectedAssets.value.length} 个资产移动到「${cat?.label}」`)
    selectedAssets.value = []
    moveVisible.value = false
  }

  const handleTagSubmit = () => {
    if (batchTags.value.length === 0) {
      ElMessage.warning('请输入标签')
      return
    }
    selectedAssets.value.forEach((asset) => {
      const index = assetList.value.findIndex((i) => i.id === asset.id)
      if (index !== -1) {
        if (tagMode.value === 'replace') {
          assetList.value[index].tags = [...batchTags.value]
        } else {
          const existing = new Set(assetList.value[index].tags)
          batchTags.value.forEach((t) => existing.add(t))
          assetList.value[index].tags = Array.from(existing)
        }
        assetList.value[index].updateTime = new Date().toISOString().slice(0, 10)
      }
    })
    ElMessage.success(
      `已${tagMode.value === 'replace' ? '替换' : '追加'} ${selectedAssets.value.length} 个资产的标签`
    )
    selectedAssets.value = []
    tagVisible.value = false
  }

  onMounted(() => {
    loadAssetList()
  })
</script>

<style lang="scss" scoped>
  .batch-toolbar {
    padding: 12px 16px;
    background: var(--el-fill-color-lighter);
    border-radius: var(--custom-radius);
  }

  .asset-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding-bottom: 16px;
  }

  .asset-card {
    cursor: pointer;
    transition: all 0.2s;
    position: relative;

    &:hover {
      transform: translateY(-2px);
    }

    &.selected {
      border: 2px solid var(--el-color-primary);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .asset-card-cover {
    position: relative;
    height: 160px;
    overflow: hidden;
    border-radius: calc(var(--custom-radius) / 2 + 2px) calc(var(--custom-radius) / 2 + 2px) 0 0;

    .cover-image {
      width: 100%;
      height: 100%;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      background: var(--el-fill-color-lighter);

      &.video-placeholder {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.audio-placeholder {
        background: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
      }
    }

    .cover-type {
      position: absolute;
      top: 8px;
      left: 8px;
    }

    .cover-check {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--el-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .asset-card-body {
    padding: 12px;

    .asset-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--el-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .asset-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .asset-tags {
      margin-bottom: 8px;
    }

    .asset-meta {
      margin-bottom: 8px;
    }

    .asset-actions {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  .asset-icon {
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

  .preview-content {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-fill-color-lighter);
    border-radius: var(--custom-radius);
    overflow: hidden;

    .preview-image {
      max-width: 100%;
      max-height: 500px;
    }

    .preview-video,
    .preview-audio,
    .preview-doc {
      flex-direction: column;
      width: 100%;
      height: 300px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
</style>
