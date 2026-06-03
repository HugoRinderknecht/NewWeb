<template>
  <div class="script-version-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">创意资产</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
          </div>
          <ElSpace>
            <ElInput
              v-model="searchKeyword"
              placeholder="搜索资产名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect
              v-model="filterAssetType"
              placeholder="资产类型"
              clearable
              style="width: 140px"
            >
              <ElOption label="人物" value="character" />
              <ElOption label="服装" value="costume" />
              <ElOption label="场景" value="scene" />
              <ElOption label="道具" value="prop" />
              <ElOption label="其他" value="other" />
            </ElSelect>
            <ElButton type="info" @click="handleExtractAssets">
              <ArtSvgIcon icon="ri:magic-line" class="mr-1" />
              提取资产
            </ElButton>
            <ElButton type="primary" @click="handleOpenCreateDialog">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建资产
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 资产类型 Tabs -->
      <ElTabs v-model="activeTab" class="mb-4" @tab-change="handleTabChange">
        <ElTabPane label="全部" name="all" />
        <ElTabPane label="人物" name="character" />
        <ElTabPane label="服装" name="costume" />
        <ElTabPane label="场景" name="scene" />
        <ElTabPane label="道具" name="prop" />
        <ElTabPane label="其他" name="other" />
      </ElTabs>

      <!-- 资产列表 -->
      <div v-loading="loading" class="scrollable-content">
        <ElTable :data="assetList" style="width: 100%">
          <ElTableColumn label="资产名称" min-width="160">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <img
                  v-if="row.referenceUrl"
                  :src="row.referenceUrl"
                  class="w-8 h-8 rounded object-cover flex-shrink-0"
                />
                <span class="font-medium">{{ row.assetName }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="资产类型" width="100">
            <template #default="{ row }">
              <ElTag :type="assetTypeColorMap[row.assetType as AssetType]" size="small">
                {{ assetTypeLabelMap[row.assetType as AssetType] || row.assetType }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="描述" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="text-g-400">{{ row.description || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="标签" min-width="140">
            <template #default="{ row }">
              <template v-if="row.tags && row.tags.length">
                <ElTag
                  v-for="tag in row.tags.slice(0, 3)"
                  :key="tag"
                  size="small"
                  class="mr-1 mb-1"
                >
                  {{ tag }}
                </ElTag>
                <ElTag v-if="row.tags.length > 3" size="small" type="info">
                  +{{ row.tags.length - 3 }}
                </ElTag>
              </template>
              <span v-else class="text-g-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="审核状态" width="100">
            <template #default="{ row }">
              <ElTag :type="reviewStatusColorMap[row.reviewStatus as ReviewStatus]" size="small">
                {{ reviewStatusLabelMap[row.reviewStatus as ReviewStatus] || row.reviewStatus }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="来源" width="90">
            <template #default="{ row }">
              <span class="text-g-400">{{
                sourceLabelMap[row.source as string] || row.source || '-'
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建时间" width="160" sortable>
            <template #default="{ row }">
              <span class="text-g-400">{{ row.createTime }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <ElButton type="primary" link size="small" @click="handleViewDetail(row)">
                <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                详情
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleOpenEditDialog(row)">
                <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                编辑
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleOpenUploadDialog(row)">
                <ArtSvgIcon icon="ri:image-add-line" class="mr-1" />
                上传图
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(row)">
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="loadAssetList"
          @size-change="handleSizeChange"
        />
      </div>
    </ElCard>

    <!-- 新建资产弹窗 -->
    <ElDialog
      v-model="createDialogVisible"
      title="新建资产"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="createFormRef" :model="createForm" :rules="formRules" label-width="100px">
        <ElFormItem label="资产名称" prop="assetName">
          <ElInput v-model="createForm.assetName" placeholder="请输入资产名称" />
        </ElFormItem>
        <ElFormItem label="资产类型" prop="assetType">
          <ElSelect
            v-model="createForm.assetType"
            placeholder="请选择资产类型"
            class="w-full"
            @change="handleFormTypeChange"
          >
            <ElOption label="人物" value="character" />
            <ElOption label="服装" value="costume" />
            <ElOption label="场景" value="scene" />
            <ElOption label="道具" value="prop" />
            <ElOption label="其他" value="other" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资产描述"
          />
        </ElFormItem>
        <ElFormItem label="标签">
          <ElSelect
            v-model="createForm.tags"
            multiple
            allow-create
            filterable
            default-first-option
            placeholder="输入标签后回车"
            class="w-full"
          />
        </ElFormItem>
        <!-- 人物特有字段 -->
        <template v-if="createForm.assetType === 'character'">
          <ElFormItem label="等级">
            <ElSelect v-model="createForm.assetLevel" placeholder="请选择等级" class="w-full">
              <ElOption label="主角" value="主角" />
              <ElOption label="配角" value="配角" />
              <ElOption label="龙套" value="龙套" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="别名">
            <ElSelect
              v-model="createForm.assetAliases"
              multiple
              allow-create
              filterable
              default-first-option
              placeholder="输入别名后回车"
              class="w-full"
            />
          </ElFormItem>
        </template>
        <!-- 道具特有字段 -->
        <template v-if="createForm.assetType === 'prop'">
          <ElFormItem label="分类">
            <ElSelect v-model="createForm.assetCategory" placeholder="请选择分类" class="w-full">
              <ElOption label="信物" value="信物" />
              <ElOption label="武器" value="武器" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="归属人物">
            <ElInput v-model="createForm.assetOwner" placeholder="请输入归属人物" />
          </ElFormItem>
        </template>
        <!-- 服装特有字段 -->
        <template v-if="createForm.assetType === 'costume'">
          <ElFormItem label="关联人物">
            <ElInput v-model="createForm.assetCharacterRef" placeholder="请输入关联人物" />
          </ElFormItem>
          <ElFormItem label="关联场景">
            <ElInput v-model="createForm.assetSceneRef" placeholder="请输入关联场景" />
          </ElFormItem>
        </template>
        <!-- 场景特有字段 -->
        <template v-if="createForm.assetType === 'scene'">
          <ElFormItem label="场景类型">
            <ElSelect
              v-model="createForm.assetSceneType"
              placeholder="请选择场景类型"
              class="w-full"
            >
              <ElOption label="室内" value="室内" />
              <ElOption label="室外" value="室外" />
            </ElSelect>
          </ElFormItem>
        </template>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="formLoading" @click="handleCreateAsset">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 编辑资产弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑资产"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="editFormRef" :model="editForm" :rules="formRules" label-width="100px">
        <ElFormItem label="资产名称" prop="assetName">
          <ElInput v-model="editForm.assetName" placeholder="请输入资产名称" />
        </ElFormItem>
        <ElFormItem label="资产类型" prop="assetType">
          <ElSelect v-model="editForm.assetType" placeholder="请选择资产类型" class="w-full">
            <ElOption label="人物" value="character" />
            <ElOption label="服装" value="costume" />
            <ElOption label="场景" value="scene" />
            <ElOption label="道具" value="prop" />
            <ElOption label="其他" value="other" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资产描述"
          />
        </ElFormItem>
        <ElFormItem label="标签">
          <ElSelect
            v-model="editForm.tags"
            multiple
            allow-create
            filterable
            default-first-option
            placeholder="输入标签后回车"
            class="w-full"
          />
        </ElFormItem>
        <!-- 人物特有字段 -->
        <template v-if="editForm.assetType === 'character'">
          <ElFormItem label="等级">
            <ElSelect v-model="editForm.assetLevel" placeholder="请选择等级" class="w-full">
              <ElOption label="主角" value="主角" />
              <ElOption label="配角" value="配角" />
              <ElOption label="龙套" value="龙套" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="别名">
            <ElSelect
              v-model="editForm.assetAliases"
              multiple
              allow-create
              filterable
              default-first-option
              placeholder="输入别名后回车"
              class="w-full"
            />
          </ElFormItem>
        </template>
        <!-- 道具特有字段 -->
        <template v-if="editForm.assetType === 'prop'">
          <ElFormItem label="分类">
            <ElSelect v-model="editForm.assetCategory" placeholder="请选择分类" class="w-full">
              <ElOption label="信物" value="信物" />
              <ElOption label="武器" value="武器" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="归属人物">
            <ElInput v-model="editForm.assetOwner" placeholder="请输入归属人物" />
          </ElFormItem>
        </template>
        <!-- 服装特有字段 -->
        <template v-if="editForm.assetType === 'costume'">
          <ElFormItem label="关联人物">
            <ElInput v-model="editForm.assetCharacterRef" placeholder="请输入关联人物" />
          </ElFormItem>
          <ElFormItem label="关联场景">
            <ElInput v-model="editForm.assetSceneRef" placeholder="请输入关联场景" />
          </ElFormItem>
        </template>
        <!-- 场景特有字段 -->
        <template v-if="editForm.assetType === 'scene'">
          <ElFormItem label="场景类型">
            <ElSelect v-model="editForm.assetSceneType" placeholder="请选择场景类型" class="w-full">
              <ElOption label="室内" value="室内" />
              <ElOption label="室外" value="室外" />
            </ElSelect>
          </ElFormItem>
        </template>
      </ElForm>
      <template #footer>
        <ElButton @click="editDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="formLoading" @click="handleUpdateAsset">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 资产详情弹窗 -->
    <ElDialog
      v-model="detailDialogVisible"
      title="资产详情"
      width="700px"
      align-center
      destroy-on-close
    >
      <div v-if="assetDetail" class="asset-detail">
        <!-- 参考图展示 -->
        <div v-if="assetDetail.referenceUrl" class="mb-6">
          <div class="section-title flex items-center gap-2 mb-4">
            <ArtSvgIcon icon="ri:image-line" />
            <span class="font-medium">参考图</span>
          </div>
          <img :src="assetDetail.referenceUrl" class="detail-reference-img" />
        </div>

        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="资产名称" :span="2">{{
            assetDetail.assetName
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="资产类型">
            <ElTag :type="assetTypeColorMap[assetDetail.assetType as AssetType]" size="small">
              {{ assetTypeLabelMap[assetDetail.assetType as AssetType] || assetDetail.assetType }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="审核状态">
            <ElTag
              :type="reviewStatusColorMap[assetDetail.reviewStatus as ReviewStatus]"
              size="small"
            >
              {{
                reviewStatusLabelMap[assetDetail.reviewStatus as ReviewStatus] ||
                assetDetail.reviewStatus
              }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="描述" :span="2">{{
            assetDetail.description || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="标签" :span="2">
            <template v-if="assetDetail.tags && assetDetail.tags.length">
              <ElTag v-for="tag in assetDetail.tags" :key="tag" size="small" class="mr-1 mb-1">{{
                tag
              }}</ElTag>
            </template>
            <span v-else>-</span>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="来源">{{
            sourceLabelMap[assetDetail.source as string] || assetDetail.source || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="版本">{{ assetDetail.version ?? '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="所属剧本">{{
            assetDetail.scriptTitle || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">{{ assetDetail.status || '-' }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ assetDetail.createTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ assetDetail.updateTime }}</ElDescriptionsItem>
        </ElDescriptions>

        <!-- 类型特有字段 -->
        <div
          v-if="
            assetDetail.assetType === 'character' ||
            assetDetail.assetType === 'prop' ||
            assetDetail.assetType === 'costume' ||
            assetDetail.assetType === 'scene'
          "
          class="mt-6"
        >
          <div class="section-title flex items-center gap-2 mb-4">
            <ArtSvgIcon icon="ri:settings-3-line" />
            <span class="font-medium">扩展属性</span>
          </div>
          <ElDescriptions :column="2" border>
            <template v-if="assetDetail.assetType === 'character'">
              <ElDescriptionsItem label="等级">{{
                (assetDetail.extraMetadata as any)?.assetLevel || '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="别名">
                <template v-if="(assetDetail.extraMetadata as any)?.assetAliases?.length">
                  <ElTag
                    v-for="alias in (assetDetail.extraMetadata as any).assetAliases"
                    :key="alias"
                    size="small"
                    class="mr-1"
                    >{{ alias }}</ElTag
                  >
                </template>
                <span v-else>-</span>
              </ElDescriptionsItem>
            </template>
            <template v-if="assetDetail.assetType === 'prop'">
              <ElDescriptionsItem label="分类">{{
                (assetDetail.extraMetadata as any)?.assetCategory || '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="归属人物">{{
                (assetDetail.extraMetadata as any)?.assetOwner || '-'
              }}</ElDescriptionsItem>
            </template>
            <template v-if="assetDetail.assetType === 'costume'">
              <ElDescriptionsItem label="关联人物">{{
                (assetDetail.extraMetadata as any)?.assetCharacterRef || '-'
              }}</ElDescriptionsItem>
              <ElDescriptionsItem label="关联场景">{{
                (assetDetail.extraMetadata as any)?.assetSceneRef || '-'
              }}</ElDescriptionsItem>
            </template>
            <template v-if="assetDetail.assetType === 'scene'">
              <ElDescriptionsItem label="场景类型" :span="2">{{
                (assetDetail.extraMetadata as any)?.assetSceneType || '-'
              }}</ElDescriptionsItem>
            </template>
          </ElDescriptions>
        </div>
      </div>
    </ElDialog>

    <!-- 上传参考图弹窗 -->
    <ElDialog
      v-model="uploadDialogVisible"
      title="上传参考图"
      width="500px"
      align-center
      destroy-on-close
    >
      <div class="upload-area">
        <ElUpload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept="image/*"
          drag
          class="w-full"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <div class="flex flex-col items-center py-4">
            <ArtSvgIcon icon="ri:upload-cloud-line" class="text-4xl text-g-400 mb-2" />
            <p class="text-sm text-g-400">将图片拖到此处，或点击上传</p>
            <p class="text-xs text-g-300 mt-1">支持 jpg/png/gif 格式</p>
          </div>
        </ElUpload>
        <div v-if="uploadPreviewUrl" class="mt-4 text-center">
          <img :src="uploadPreviewUrl" class="max-w-full max-h-48 rounded" />
        </div>
      </div>
      <template #footer>
        <ElButton @click="uploadDialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="uploadLoading"
          :disabled="!uploadFile"
          @click="handleUploadImage"
          >上传</ElButton
        >
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules, UploadFile, UploadInstance } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import { fetchExtractAssets } from '@/api/script'
  import {
    fetchGetScriptAssetList,
    fetchCreateScriptAsset,
    fetchUpdateScriptAsset,
    fetchDeleteScriptAsset,
    fetchGetScriptAssetDetail,
    fetchUploadScriptAssetImage
  } from '@/api/script-asset'

  defineOptions({ name: 'ScriptVersion' })

  type AssetType = 'character' | 'costume' | 'scene' | 'prop' | 'other'
  type ReviewStatus = 'approved' | 'pending' | 'rejected'

  // ==================== 映射表 ====================
  const assetTypeColorMap: Record<
    AssetType,
    'primary' | 'success' | 'warning' | 'danger' | 'info'
  > = {
    character: 'primary',
    costume: 'success',
    scene: 'warning',
    prop: 'danger',
    other: 'info'
  }
  const assetTypeLabelMap: Record<AssetType, string> = {
    character: '人物',
    costume: '服装',
    scene: '场景',
    prop: '道具',
    other: '其他'
  }
  const reviewStatusColorMap: Record<ReviewStatus, 'success' | 'warning' | 'danger'> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'danger'
  }
  const reviewStatusLabelMap: Record<ReviewStatus, string> = {
    approved: '已通过',
    pending: '待审核',
    rejected: '已驳回'
  }
  const sourceLabelMap: Record<string, string> = {
    ai_extract: 'AI提取',
    manual: '手动创建',
    import: '导入'
  }

  // ==================== Store ====================
  const scriptProjectStore = useScriptProjectStore()
  const { currentProjectId, projectList } = storeToRefs(scriptProjectStore)

  // ==================== 列表状态 ====================
  const searchKeyword = ref('')
  const filterAssetType = ref<AssetType | ''>('')
  const activeTab = ref('all')
  const loading = ref(false)
  const assetList = ref<Api.ScriptAsset.ScriptAssetListItem[]>([])

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  // ==================== 加载资产列表 ====================
  const loadAssetList = async () => {
    const projectId = currentProjectId.value
    if (!projectId) {
      assetList.value = []
      return
    }
    loading.value = true
    try {
      const params: Api.ScriptAsset.ScriptAssetSearchParams = {
        current: pagination.current,
        size: pagination.size
      }
      if (searchKeyword.value) {
        params.keyword = searchKeyword.value
      }
      const typeFilter = filterAssetType.value || (activeTab.value !== 'all' ? activeTab.value : '')
      if (typeFilter) {
        params.assetType = typeFilter
      }
      const res = await fetchGetScriptAssetList(projectId, params)
      assetList.value = res?.records || []
      pagination.total = res?.total || 0
    } catch {
      assetList.value = []
      ElMessage.error('加载资产列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleProjectChange = () => {
    pagination.current = 1
    loadAssetList()
  }

  const handleProjectRefresh = () => {
    loadAssetList()
  }

  const handleTabChange = () => {
    filterAssetType.value = ''
    pagination.current = 1
    loadAssetList()
  }

  const handleSizeChange = () => {
    pagination.current = 1
    loadAssetList()
  }

  // 搜索防抖
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(searchKeyword, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      pagination.current = 1
      loadAssetList()
    }, 300)
  })

  watch(filterAssetType, () => {
    activeTab.value = 'all'
    pagination.current = 1
    loadAssetList()
  })

  onMounted(() => {
    if (currentProjectId.value) {
      loadAssetList()
    }
  })

  watch(currentProjectId, (newId) => {
    if (newId) {
      pagination.current = 1
      loadAssetList()
    }
  })

  // ==================== 提取资产 ====================
  const handleExtractAssets = () => {
    const projectId = currentProjectId.value
    if (!projectId) {
      ElMessage.warning('请先选择项目')
      return
    }
    const scriptId = scriptProjectStore.currentScriptId
    if (!scriptId) {
      ElMessage.warning('当前项目没有关联剧本，无法提取资产')
      return
    }
    ElMessageBox.confirm(
      '将调用AI从剧本中提取创意资产（人物、服装、场景、道具等），是否继续？',
      '提取资产',
      {
        confirmButtonText: '确定提取',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(async () => {
      try {
        loading.value = true
        await fetchExtractAssets(projectId, scriptId)
        ElMessage.success('资产提取任务已提交，请稍后刷新查看结果')
        setTimeout(() => {
          loadAssetList()
        }, 2000)
      } catch {
        ElMessage.error('资产提取失败')
      } finally {
        loading.value = false
      }
    })
  }

  // ==================== 新建资产弹窗 ====================
  const createDialogVisible = ref(false)
  const formLoading = ref(false)
  const createFormRef = ref<FormInstance>()

  const createForm = reactive<Api.ScriptAsset.CreateScriptAssetParams>({
    assetName: '',
    assetType: '',
    description: '',
    tags: [],
    assetLevel: '',
    assetAliases: [],
    assetCategory: '',
    assetOwner: '',
    assetCharacterRef: '',
    assetSceneRef: '',
    assetSceneType: ''
  })

  const formRules: FormRules = {
    assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
    assetType: [{ required: true, message: '请选择资产类型', trigger: 'change' }]
  }

  const handleFormTypeChange = () => {
    // 切换类型时清空特有字段
    createForm.assetLevel = ''
    createForm.assetAliases = []
    createForm.assetCategory = ''
    createForm.assetOwner = ''
    createForm.assetCharacterRef = ''
    createForm.assetSceneRef = ''
    createForm.assetSceneType = ''
  }

  const handleOpenCreateDialog = () => {
    createForm.assetName = ''
    createForm.assetType = ''
    createForm.description = ''
    createForm.tags = []
    createForm.assetLevel = ''
    createForm.assetAliases = []
    createForm.assetCategory = ''
    createForm.assetOwner = ''
    createForm.assetCharacterRef = ''
    createForm.assetSceneRef = ''
    createForm.assetSceneType = ''
    createDialogVisible.value = true
  }

  const handleCreateAsset = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (!valid) return
      formLoading.value = true
      try {
        const projectId = currentProjectId.value
        if (!projectId) {
          ElMessage.warning('请先选择项目')
          return
        }
        const scriptId = scriptProjectStore.currentScriptId
        const data: Api.ScriptAsset.CreateScriptAssetParams = {
          assetName: createForm.assetName,
          assetType: createForm.assetType,
          description: createForm.description || undefined,
          tags: createForm.tags?.length ? createForm.tags : undefined,
          scriptId: scriptId || undefined
        }
        // 类型特有字段
        if (createForm.assetType === 'character') {
          data.assetLevel = createForm.assetLevel || undefined
          data.assetAliases = createForm.assetAliases?.length ? createForm.assetAliases : undefined
        }
        if (createForm.assetType === 'prop') {
          data.assetCategory = createForm.assetCategory || undefined
          data.assetOwner = createForm.assetOwner || undefined
        }
        if (createForm.assetType === 'costume') {
          data.assetCharacterRef = createForm.assetCharacterRef || undefined
          data.assetSceneRef = createForm.assetSceneRef || undefined
        }
        if (createForm.assetType === 'scene') {
          data.assetSceneType = createForm.assetSceneType || undefined
        }
        await fetchCreateScriptAsset(projectId, data)
        createDialogVisible.value = false
        ElMessage.success('创建成功')
        loadAssetList()
      } catch {
        ElMessage.error('创建失败')
      } finally {
        formLoading.value = false
      }
    })
  }

  // ==================== 编辑资产弹窗 ====================
  const editDialogVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const editingAssetId = ref('')

  const editForm = reactive<Api.ScriptAsset.UpdateScriptAssetParams>({
    assetName: '',
    assetType: '',
    description: '',
    tags: [],
    assetLevel: '',
    assetAliases: [],
    assetCategory: '',
    assetOwner: '',
    assetCharacterRef: '',
    assetSceneRef: '',
    assetSceneType: ''
  })

  const handleOpenEditDialog = async (row: Api.ScriptAsset.ScriptAssetListItem) => {
    editingAssetId.value = row.id
    try {
      const detail = await fetchGetScriptAssetDetail(row.id)
      if (detail) {
        editForm.assetName = detail.assetName || ''
        editForm.assetType = detail.assetType || ''
        editForm.description = detail.description || ''
        editForm.tags = detail.tags || []
        // 从 extraMetadata 恢复类型特有字段
        const meta = detail.extraMetadata || ({} as Record<string, unknown>)
        editForm.assetLevel = (meta.assetLevel as string) || ''
        editForm.assetAliases = (meta.assetAliases as string[]) || []
        editForm.assetCategory = (meta.assetCategory as string) || ''
        editForm.assetOwner = (meta.assetOwner as string) || ''
        editForm.assetCharacterRef = (meta.assetCharacterRef as string) || ''
        editForm.assetSceneRef = (meta.assetSceneRef as string) || ''
        editForm.assetSceneType = (meta.assetSceneType as string) || ''
        editDialogVisible.value = true
      }
    } catch {
      ElMessage.error('获取资产详情失败')
    }
  }

  const handleUpdateAsset = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (!valid) return
      formLoading.value = true
      try {
        const data: Api.ScriptAsset.UpdateScriptAssetParams = {
          assetName: editForm.assetName,
          assetType: editForm.assetType,
          description: editForm.description || undefined,
          tags: editForm.tags?.length ? editForm.tags : undefined
        }
        // 类型特有字段
        if (editForm.assetType === 'character') {
          data.assetLevel = editForm.assetLevel || undefined
          data.assetAliases = editForm.assetAliases?.length ? editForm.assetAliases : undefined
        }
        if (editForm.assetType === 'prop') {
          data.assetCategory = editForm.assetCategory || undefined
          data.assetOwner = editForm.assetOwner || undefined
        }
        if (editForm.assetType === 'costume') {
          data.assetCharacterRef = editForm.assetCharacterRef || undefined
          data.assetSceneRef = editForm.assetSceneRef || undefined
        }
        if (editForm.assetType === 'scene') {
          data.assetSceneType = editForm.assetSceneType || undefined
        }
        await fetchUpdateScriptAsset(editingAssetId.value, data)
        editDialogVisible.value = false
        ElMessage.success('更新成功')
        loadAssetList()
      } catch {
        ElMessage.error('更新失败')
      } finally {
        formLoading.value = false
      }
    })
  }

  // ==================== 资产详情弹窗 ====================
  const detailDialogVisible = ref(false)
  const assetDetail = ref<Api.ScriptAsset.ScriptAssetDetail | null>(null)

  const handleViewDetail = async (row: Api.ScriptAsset.ScriptAssetListItem) => {
    try {
      const detail = await fetchGetScriptAssetDetail(row.id)
      if (detail) {
        assetDetail.value = detail
        detailDialogVisible.value = true
      }
    } catch {
      ElMessage.error('获取资产详情失败')
    }
  }

  // ==================== 删除资产 ====================
  const handleDelete = (row: Api.ScriptAsset.ScriptAssetListItem) => {
    ElMessageBox.confirm(`确定要删除资产「${row.assetName}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteScriptAsset(row.id)
        ElMessage.success('删除成功')
        loadAssetList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // ==================== 上传参考图弹窗 ====================
  const uploadDialogVisible = ref(false)
  const uploadLoading = ref(false)
  const uploadRef = ref<UploadInstance>()
  const uploadFile = ref<File | null>(null)
  const uploadPreviewUrl = ref('')
  const uploadingAssetId = ref('')

  const handleOpenUploadDialog = (row: Api.ScriptAsset.ScriptAssetListItem) => {
    uploadingAssetId.value = row.id
    uploadFile.value = null
    uploadPreviewUrl.value = ''
    uploadDialogVisible.value = true
  }

  const handleFileChange = (file: UploadFile) => {
    if (file.raw) {
      uploadFile.value = file.raw
      uploadPreviewUrl.value = URL.createObjectURL(file.raw)
    }
  }

  const handleExceed = () => {
    ElMessage.warning('只能上传一张图片，请先移除已有图片')
  }

  const handleUploadImage = async () => {
    if (!uploadFile.value) {
      ElMessage.warning('请选择要上传的图片')
      return
    }
    uploadLoading.value = true
    try {
      await fetchUploadScriptAssetImage(uploadingAssetId.value, uploadFile.value)
      ElMessage.success('上传成功')
      uploadDialogVisible.value = false
      loadAssetList()
    } catch {
      ElMessage.error('上传失败')
    } finally {
      uploadLoading.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .scrollable-content {
    max-height: calc(100vh - 360px);
    padding-right: 8px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--el-text-color-secondary);
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }

  .asset-detail {
    .detail-reference-img {
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      border-radius: var(--custom-radius);
    }

    .section-title {
      padding-bottom: 12px;
      font-size: 15px;
      color: var(--el-text-color-primary);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }

  .upload-area {
    :deep(.el-upload-dragger) {
      width: 100%;
    }

    :deep(.el-upload) {
      width: 100%;
    }
  }
</style>
