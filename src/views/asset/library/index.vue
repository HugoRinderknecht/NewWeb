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
              :src="item.thumbnailUrl || item.url"
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
              <ElImage
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                fit="cover"
                class="cover-image"
                preview-teleported
              >
                <template #error>
                  <ArtSvgIcon icon="ri:play-circle-line" class="text-4xl" />
                </template>
              </ElImage>
              <ArtSvgIcon v-else icon="ri:play-circle-line" class="text-4xl" />
            </div>
            <div
              v-else-if="item.type === 'audio'"
              class="cover-placeholder audio-placeholder flex-cc"
              @click.stop="handlePreview(item)"
            >
              <ArtSvgIcon icon="ri:music-2-line" class="text-3xl" />
            </div>
            <div v-else class="cover-placeholder flex-cc">
              <ElImage
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                fit="cover"
                class="cover-image"
              >
                <template #error>
                  <ArtSvgIcon :icon="typeIconMap[item.type] || 'ri:file-line'" class="text-3xl" />
                </template>
              </ElImage>
              <ArtSvgIcon
                v-else
                :icon="typeIconMap[item.type] || 'ri:file-line'"
                class="text-3xl"
              />
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
      :title="previewAsset?.name || currentAsset?.name"
      width="880px"
      align-center
      destroy-on-close
      :close-on-press-escape="!previewLoading"
    >
      <div v-if="previewAsset || currentAsset" v-loading="previewLoading" class="preview-wrapper">
        <div class="preview-content">
          <!-- 图片：ElImage 内嵌预览 + 灯箱放大 -->
          <ElImage
            v-if="(previewAsset || currentAsset)?.type === 'image'"
            :src="(previewAsset || currentAsset)?.url"
            :preview-src-list="[(previewAsset || currentAsset)?.url].filter(Boolean) as string[]"
            fit="contain"
            class="preview-image"
            preview-teleported
          >
            <template #error>
              <div class="preview-error flex-cc">
                <ArtSvgIcon icon="ri:image-broken-line" class="text-5xl text-g-400" />
                <p class="mt-2 text-g-400">图片加载失败</p>
              </div>
            </template>
          </ElImage>

          <!-- 视频：HTML5 原生 video，带控制条、海报图、下载入口 -->
          <div v-else-if="(previewAsset || currentAsset)?.type === 'video'" class="preview-video">
            <video
              v-if="(previewAsset || currentAsset)?.url"
              :src="(previewAsset || currentAsset)?.url"
              :poster="(previewAsset || currentAsset)?.thumbnailUrl"
              controls
              preload="metadata"
              playsinline
              class="preview-video-el"
            />
            <div v-else class="preview-error flex-cc">
              <ArtSvgIcon icon="ri:video-off-line" class="text-5xl text-g-400" />
              <p class="mt-2 text-g-400">视频地址不可用</p>
            </div>
          </div>

          <!-- 音频：HTML5 原生 audio -->
          <div v-else-if="(previewAsset || currentAsset)?.type === 'audio'" class="preview-audio">
            <div class="audio-art flex-cc">
              <ElImage
                v-if="(previewAsset || currentAsset)?.thumbnailUrl"
                :src="(previewAsset || currentAsset)?.thumbnailUrl"
                fit="cover"
                class="audio-cover"
              />
              <ArtSvgIcon v-else icon="ri:music-2-line" class="text-6xl" />
            </div>
            <audio
              v-if="(previewAsset || currentAsset)?.url"
              :src="(previewAsset || currentAsset)?.url"
              controls
              preload="metadata"
              class="preview-audio-el"
            />
            <p v-else class="text-g-400 mt-2">音频地址不可用</p>
          </div>

          <!-- 文档/AI生成：文本类用 iframe 内嵌预览，其他提供占位+下载 -->
          <div v-else class="preview-doc">
            <template
              v-if="
                ['txt', 'md', 'json', 'xml', 'html', 'csv', 'log'].includes(
                  ((previewAsset || currentAsset)?.format || '').toLowerCase()
                )
              "
            >
              <iframe
                v-if="(previewAsset || currentAsset)?.url"
                :src="(previewAsset || currentAsset)?.url"
                class="preview-doc-iframe"
                frameborder="0"
                sandbox="allow-same-origin"
              />
              <div v-else class="preview-error flex-cc">
                <ArtSvgIcon icon="ri:file-warning-line" class="text-5xl text-g-400" />
                <p class="mt-2 text-g-400">文档地址不可用</p>
              </div>
            </template>
            <div v-else class="preview-doc-placeholder flex-cc">
              <ArtSvgIcon
                :icon="
                  (previewAsset || currentAsset)?.type === 'ai-generated'
                    ? 'ri:sparkling-line'
                    : 'ri:file-text-line'
                "
                class="text-6xl text-g-400"
              />
              <p class="mt-4 text-g-400">
                {{
                  (previewAsset || currentAsset)?.type === 'ai-generated'
                    ? 'AI 生成资产暂不支持在线预览'
                    : '该格式文档暂不支持在线预览，请下载后查看'
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="preview-meta mt-4">
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="资产名称">{{
              (previewAsset || currentAsset)?.name
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="类型">{{
              typeLabelMap[(previewAsset || currentAsset)?.type as AssetType] ||
              (previewAsset || currentAsset)?.type
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="分类">{{
              (previewAsset || currentAsset)?.categoryName || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="格式">{{
              (previewAsset || currentAsset)?.format || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="大小">{{
              formatSize((previewAsset || currentAsset)?.size || 0)
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="更新时间">{{
              (previewAsset || currentAsset)?.updateTime || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="标签" :span="2">
              <ElTag
                v-for="tag in (previewAsset || currentAsset)?.tags || []"
                :key="tag"
                size="small"
                class="mr-1"
              >
                {{ tag }}
              </ElTag>
              <span v-if="!((previewAsset || currentAsset)?.tags || []).length" class="text-g-400"
                >-</span
              >
            </ElDescriptionsItem>
            <ElDescriptionsItem label="描述" :span="2">
              {{ (previewAsset || currentAsset)?.description || '-' }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>
      </div>
      <template #footer>
        <ElButton @click="previewVisible = false">关闭</ElButton>
        <ElButton type="primary" :loading="downloading" @click="handleDownload()">
          <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />
          下载原文件
        </ElButton>
      </template>
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
  import FileSaver from 'file-saver'
  import {
    useAssetList,
    useAssetDetail,
    useUpdateAsset,
    useBatchDeleteAssets,
    useBatchAddTags,
    useBatchMoveCategory,
    useDeleteAsset
  } from '@/api/queries'
  import { fetchDownloadAsset } from '@/api/asset'
  import { useProjectDataStore } from '@/store/modules/project-data'

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
  const projectStore = useProjectDataStore()

  // 当前项目 ID 统一走数据层（project-data store）
  const projectId = computed(() => projectStore.currentProjectId || '')

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

  // Vue Query: 资产列表（后端分页/过滤）
  // 统一从 project-data store 读取当前项目 ID，与 upload / 其他资产页保持一致
  const searchParams = computed<Api.Asset.AssetSearchParams>(() => ({
    page: pagination.current,
    pageSize: pagination.size,
    keyword: searchQuery.value || undefined,
    assetType: filterType.value || undefined,
    categoryName: filterCategory.value || undefined
  }))

  const { data: listResult, isLoading } = useAssetList(projectId, searchParams)

  const assetList = computed(() => {
    const records = listResult.value?.records ?? []
    return records.map((item: any) => {
      // 后端 AssetListItem 字段：assetName / assetType / fileType / fileUrl / thumbnailUrl / fileSize / categoryName
      const type = (item.assetType || item.type || 'image') as AssetType
      return {
        id: Number(item.id),
        name: item.assetName || item.name || '',
        type,
        category: item.categoryId || item.category || item.categoryName || '',
        categoryName: item.categoryName || item.category || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        description: item.description || '',
        size: Number(item.fileSize ?? item.size) || 0,
        format: item.fileType || item.format || '',
        url: item.fileUrl || item.url || '',
        thumbnailUrl: item.thumbnailUrl || item.fileUrl || item.url || '',
        updateTime: item.updateTime || '',
        createTime: item.createTime || ''
      }
    })
  })

  const paginationTotal = computed(() => listResult.value?.total ?? 0)

  watch(paginationTotal, (val) => {
    pagination.total = val
  })

  watch([searchQuery, filterType, filterCategory], () => {
    pagination.current = 1
  })

  // 删除操作后会自动 invalidate，不需要手动刷新

  const editForm = reactive({
    name: '',
    category: '',
    tags: [] as string[],
    description: ''
  })

  const editRules: FormRules = {
    name: [{ required: true, message: '请输入资产名称', trigger: 'blur' }]
  }

  // Mutations
  const deleteMutation = useDeleteAsset()
  const batchDeleteMutation = useBatchDeleteAssets()
  const updateMutation = useUpdateAsset()
  const batchAddTagsMutation = useBatchAddTags()

  const selectedIds = computed(() => selectedAssets.value.map((a) => a.id))

  const isAllSelected = computed(() => {
    return (
      assetList.value.length > 0 &&
      assetList.value.every((item) => selectedIds.value.includes(item.id))
    )
  })

  const isIndeterminate = computed(() => {
    return selectedAssets.value.length > 0 && !isAllSelected.value
  })

  // 后端分页：数据直接来自 Vue Query
  const pagedList = assetList

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
      assetList.value.forEach((item) => {
        if (!newSelection.find((s) => s.id === item.id)) {
          newSelection.push(item)
        }
      })
      selectedAssets.value = newSelection
    } else {
      const pageIds = assetList.value.map((i) => i.id)
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

  // ==================== 预览：通过详情接口拉取完整字段（含 description/tags/fileUrl 等） ====================
  const previewAssetId = ref<string>('')
  const { data: previewDetail, isFetching: previewLoading } = useAssetDetail(
    projectId,
    computed(() => previewAssetId.value || undefined)
  )

  // 预览态资产：优先用详情回填，列表行作为兜底（避免弹窗空白闪烁）
  const previewAsset = computed<AssetItem | null>(() => {
    if (previewDetail.value) {
      const d: any = previewDetail.value
      return {
        id: Number(d.id),
        name: d.assetName || d.name || '',
        type: (d.assetType || d.type || 'image') as AssetType,
        category: d.categoryId || d.category || d.categoryName || '',
        categoryName: d.categoryName || d.category || '',
        tags: Array.isArray(d.tags) ? d.tags : [],
        description: d.description || '',
        size: Number(d.fileSize ?? d.size) || 0,
        format: d.fileType || d.format || '',
        url: d.fileUrl || d.url || '',
        thumbnailUrl: d.thumbnailUrl || d.fileUrl || d.url || '',
        updateTime: d.updateTime || '',
        createTime: d.createTime || ''
      }
    }
    return currentAsset.value
  })

  const handlePreview = (row: AssetItem) => {
    currentAsset.value = row
    previewAssetId.value = String(row.id)
    previewVisible.value = true
  }

  // 下载：调用后端 download 接口（支持鉴权场景），用 file-saver 保存
  const downloading = ref(false)
  const handleDownload = async (row?: AssetItem | null) => {
    const target = row || previewAsset.value || currentAsset.value
    if (!target) return
    if (downloading.value) return
    downloading.value = true
    try {
      const blob = await fetchDownloadAsset(projectId.value, String(target.id))
      const ext = target.format ? `.${target.format}` : ''
      const filename =
        target.name && /\.[^./\\]+$/.test(target.name) ? target.name : `${target.name}${ext}`
      FileSaver.saveAs(blob, filename)
      ElMessage.success('下载已开始')
    } catch {
      ElMessage.error('下载失败')
    } finally {
      downloading.value = false
    }
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
        try {
          await updateMutation.mutateAsync({
            projectId: projectId.value,
            assetId: String(currentAsset.value.id),
            params: {
              assetName: editForm.name,
              category: editForm.category,
              tags: editForm.tags,
              description: editForm.description
            }
          })
          ElMessage.success('编辑成功')
          editVisible.value = false
        } catch {
          ElMessage.error('编辑失败')
        }
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
      await deleteMutation.mutateAsync({
        projectId: projectId.value,
        assetId: String(row.id)
      })
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
        await batchDeleteMutation.mutateAsync({
          projectId: projectId.value,
          assetIds: ids
        })
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

  onMounted(() => {})
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
    position: relative;
    cursor: pointer;
    transition: all 0.2s;

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
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
      }

      &.audio-placeholder {
        color: var(--el-color-warning);
        background: var(--el-color-warning-light-9);
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--el-color-primary);
      border-radius: 50%;
    }
  }

  .asset-card-body {
    padding: 12px;

    .asset-name {
      margin-bottom: 6px;
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .asset-desc {
      display: -webkit-box;
      margin-bottom: 8px;
      overflow: hidden;
      font-size: 12px;
      line-height: 1.5;
      color: var(--el-text-color-secondary);
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .asset-tags {
      margin-bottom: 8px;
    }

    .asset-meta {
      margin-bottom: 8px;
    }

    .asset-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  }

  .asset-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 8px;

    &.image {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &.video {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }

    &.audio {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }

    &.document {
      color: var(--el-color-info);
      background: var(--el-color-info-light-9);
    }

    &.ai-generated {
      color: var(--el-color-danger);
      background: var(--el-color-danger-light-9);
    }
  }

  .preview-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    max-height: 560px;
    overflow: hidden;
    background: var(--el-fill-color-lighter);
    border-radius: var(--custom-radius);

    .preview-image {
      max-width: 100%;
      max-height: 540px;
    }

    .preview-video {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-height: 540px;
      padding: 12px;

      .preview-video-el {
        width: 100%;
        max-width: 800px;
        max-height: 520px;
        background: #000;
        border-radius: 4px;
      }
    }

    .preview-audio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 300px;
      padding: 24px;

      .audio-art {
        width: 160px;
        height: 160px;
        margin-bottom: 16px;
        overflow: hidden;
        background: var(--el-color-warning-light-9);
        border-radius: 50%;

        .audio-cover {
          width: 100%;
          height: 100%;
        }
      }

      .preview-audio-el {
        width: 100%;
        max-width: 480px;
      }
    }

    .preview-doc {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-height: 540px;
      padding: 12px;

      .preview-doc-iframe {
        width: 100%;
        height: 500px;
        background: #fff;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 4px;
      }

      .preview-doc-placeholder {
        width: 100%;
        height: 300px;
      }
    }

    .preview-error {
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
