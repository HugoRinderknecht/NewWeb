<template>
  <div class="asset-preview-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">资产库预览</span>
            <ElTag type="info" size="small">{{ filteredList.length }} 个资产</ElTag>
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
            <ElButton type="primary" @click="handleBackToLibrary">
              <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
              返回资源库
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 分类导航栏 -->
      <div class="category-nav flex-c mb-4">
        <ElRadioGroup v-model="filterCategory" size="large">
          <ElRadioButton value="">全部</ElRadioButton>
          <ElRadioButton v-for="item in categoryOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </ElRadioButton>
        </ElRadioGroup>
      </div>

      <!-- 资产网格展示 -->
      <div class="preview-grid">
        <div
          v-for="item in pagedList"
          :key="item.id"
          class="preview-item"
          @click="handleOpenDetail(item)"
        >
          <div class="preview-cover">
            <ElImage
              v-if="item.type === 'image' || item.type === 'ai-generated'"
              :src="item.url"
              fit="cover"
              class="cover-image"
              preview-teleported
              :preview-src-list="imageUrlList"
              :initial-index="getImageIndex(item)"
            />
            <div
              v-else-if="item.type === 'video'"
              class="cover-placeholder video-placeholder flex-cc"
            >
              <ArtSvgIcon icon="ri:play-circle-line" class="text-4xl" />
            </div>
            <div
              v-else-if="item.type === 'audio'"
              class="cover-placeholder audio-placeholder flex-cc"
            >
              <ArtSvgIcon icon="ri:music-2-line" class="text-3xl" />
            </div>
            <div v-else class="cover-placeholder flex-cc">
              <ArtSvgIcon :icon="typeIconMap[item.type]" class="text-3xl" />
            </div>
            <div class="preview-overlay">
              <div class="overlay-content">
                <h4 class="preview-name">{{ item.name }}</h4>
                <div class="preview-tags">
                  <ElTag
                    v-for="tag in item.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    effect="dark"
                    class="mr-1"
                  >
                    {{ tag }}
                  </ElTag>
                </div>
              </div>
            </div>
          </div>
          <div class="preview-info">
            <div class="flex-cb">
              <ElTag :type="typeTagMap[item.type]" size="small">
                {{ typeLabelMap[item.type] }}
              </ElTag>
              <span class="text-xs text-g-400">{{ formatSize(item.size) }}</span>
            </div>
          </div>
        </div>
      </div>

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

    <!-- 资产详情预览弹窗 -->
    <ElDialog
      v-model="detailVisible"
      :title="currentAsset?.name"
      width="900px"
      align-center
      destroy-on-close
      class="asset-detail-dialog"
    >
      <div v-if="currentAsset" class="detail-content">
        <ElRow :gutter="24">
          <ElCol :span="14">
            <div class="detail-preview">
              <ElImage
                v-if="currentAsset.type === 'image' || currentAsset.type === 'ai-generated'"
                :src="currentAsset.url"
                fit="contain"
                class="detail-image"
              />
              <div v-else-if="currentAsset.type === 'video'" class="detail-video flex-cc">
                <ArtSvgIcon icon="ri:video-line" class="text-6xl text-g-400" />
                <p class="mt-4 text-g-400">视频播放组件占位</p>
              </div>
              <div v-else-if="currentAsset.type === 'audio'" class="detail-audio flex-cc">
                <ArtSvgIcon icon="ri:music-2-line" class="text-6xl text-g-400" />
                <p class="mt-4 text-g-400">音频播放组件占位</p>
              </div>
              <div v-else class="detail-doc flex-cc">
                <ArtSvgIcon icon="ri:file-text-line" class="text-6xl text-g-400" />
                <p class="mt-4 text-g-400">文档预览组件占位</p>
              </div>
            </div>
          </ElCol>
          <ElCol :span="10">
            <div class="detail-meta">
              <ElDescriptions :column="1" border>
                <ElDescriptionsItem label="类型">
                  <ElTag :type="typeTagMap[currentAsset.type]" size="small">
                    {{ typeLabelMap[currentAsset.type] }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="分类">{{
                  currentAsset.categoryName
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="大小">{{
                  formatSize(currentAsset.size)
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="格式">{{ currentAsset.format }}</ElDescriptionsItem>
                <ElDescriptionsItem label="标签">
                  <ElTag v-for="tag in currentAsset.tags" :key="tag" size="small" class="mr-1 mb-1">
                    {{ tag }}
                  </ElTag>
                </ElDescriptionsItem>
                <ElDescriptionsItem label="创建时间">{{
                  currentAsset.createTime
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="更新时间">{{
                  currentAsset.updateTime
                }}</ElDescriptionsItem>
                <ElDescriptionsItem label="描述">{{ currentAsset.description }}</ElDescriptionsItem>
              </ElDescriptions>

              <div class="detail-actions mt-4">
                <ElButton type="primary" class="w-full mb-2" @click="handleDownload(currentAsset)">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  下载资产
                </ElButton>
                <ElButton plain class="w-full" @click="handleReuse(currentAsset)">
                  <ArtSvgIcon icon="ri:links-line" class="mr-1" />
                  创建引用
                </ElButton>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { fetchGetProjectAssets, fetchGetAssetDetail, fetchDownloadAsset } from '@/api/asset'
  import { useProjectDataStore } from '@/store/modules/project-data'

  defineOptions({ name: 'AssetPreview' })

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
  const projectStore = useProjectDataStore()
  const projectId = computed(
    () => (route.params.projectId as string) || projectStore.currentProjectId || ''
  )

  const searchQuery = ref('')
  const filterType = ref<AssetType | ''>('')
  const filterCategory = ref('')
  const detailVisible = ref(false)
  const currentAsset = ref<AssetItem | null>(null)

  const pagination = reactive({
    current: 1,
    size: 24,
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

  const assetList = ref<AssetItem[]>([])

  const loadAssetList = async () => {
    try {
      const data = await fetchGetProjectAssets(projectId.value)
      if (data) {
        assetList.value = Array.isArray(data) ? data : (data as any).records || []
      }
    } catch {
      assetList.value = []
    }
  }

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

  const imageUrlList = computed(() => {
    return filteredList.value
      .filter((item) => item.type === 'image' || item.type === 'ai-generated')
      .map((item) => item.url)
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

  const getImageIndex = (item: AssetItem): number => {
    return imageUrlList.value.indexOf(item.url)
  }

  const handleOpenDetail = async (item: AssetItem) => {
    currentAsset.value = item
    detailVisible.value = true
    try {
      const res = await fetchGetAssetDetail(projectId.value, String(item.id))
      if (res) {
        currentAsset.value = { ...item, ...(res as any) }
      }
    } catch {
      // keep current item data
    }
  }

  const handleDownload = async (item: AssetItem) => {
    try {
      const blob = await fetchDownloadAsset(projectId.value, String(item.id))
      if (blob) {
        const url = window.URL.createObjectURL(blob as any)
        const a = document.createElement('a')
        a.href = url
        a.download = item.name
        a.click()
        window.URL.revokeObjectURL(url)
        ElMessage.success('下载成功')
      }
    } catch {
      ElMessage.error('下载失败')
    }
  }

  const handleReuse = (row: AssetItem) => {
    ElMessage.success(`已创建「${row.name}」的资产引用`)
  }

  const handleBackToLibrary = () => {
    router.push('/asset/library')
  }

  onMounted(() => {
    loadAssetList()
  })
</script>

<style lang="scss" scoped>
  .category-nav {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px 0;
  }

  .preview-item {
    overflow: hidden;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
      transform: translateY(-2px);

      .preview-overlay {
        opacity: 1;
      }
    }
  }

  .preview-cover {
    position: relative;
    height: 180px;
    overflow: hidden;

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
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 12px;
    background: rgb(0 0 0 / 60%);
    opacity: 0;
    transition: opacity 0.2s;

    .overlay-content {
      color: #fff;

      .preview-name {
        margin-bottom: 6px;
        overflow: hidden;
        font-size: 14px;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .preview-info {
    padding: 8px 12px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
  }

  .detail-content {
    .detail-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
      overflow: hidden;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .detail-image {
        width: 100%;
        height: 100%;
      }
    }

    .detail-meta {
      .detail-actions {
        display: flex;
        flex-direction: column;
      }
    }
  }
</style>
