<template>
  <div class="asset-reuse-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">素材复用</span>
            <ElTag type="info" size="small">跨项目共享资产与引用管理</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索素材/项目"
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
            <ElButton type="primary" @click="handleCreateReference">
              <ArtSvgIcon icon="ri:link-m" class="mr-1" />
              创建资产引用
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="reuse-stats mb-6">
        <ElRow :gutter="16">
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon primary">
                <ArtSvgIcon icon="ri:share-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ sharedCount }}</div>
                <div class="stat-label">共享资产</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon success">
                <ArtSvgIcon icon="ri:link-m" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ referenceCount }}</div>
                <div class="stat-label">资产引用</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon warning">
                <ArtSvgIcon icon="ri:folder-shared-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ projectCount }}</div>
                <div class="stat-label">涉及项目</div>
              </div>
            </div>
          </ElCol>
          <ElCol :span="6">
            <div class="stat-card">
              <div class="stat-icon info">
                <ArtSvgIcon icon="ri:download-cloud-line" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ reuseCount }}</div>
                <div class="stat-label">复用次数</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <!-- 资产复用列表 -->
      <ElTabs v-model="activeTab" type="border-card">
        <ElTabPane label="共享资产" name="shared">
          <ElTable :data="filteredSharedList" style="width: 100%" v-loading="loading">
            <ElTableColumn label="素材名称" min-width="200">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <div class="asset-icon" :class="row.type">
                    <ArtSvgIcon :icon="typeIconMap[row.type as AssetType]" />
                  </div>
                  <div>
                    <div class="font-medium">{{ row.name }}</div>
                    <div class="text-xs text-g-400"
                      >{{ row.format }} · {{ formatSize(row.size) }}</div
                    >
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
            <ElTableColumn label="来源项目" width="160">
              <template #default="{ row }">
                <ElTag type="info" size="small">{{ row.sourceProject }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="被用于" min-width="200">
              <template #default="{ row }">
                <ElSpace wrap>
                  <ElTag
                    v-for="proj in (row.targetProjects || []).slice(0, 3)"
                    :key="proj"
                    size="small"
                  >
                    {{ proj }}
                  </ElTag>
                  <ElTag v-if="(row.targetProjects || []).length > 3" type="info" size="small">
                    +{{ (row.targetProjects || []).length - 3 }}
                  </ElTag>
                </ElSpace>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="reuseCount" label="复用次数" width="100">
              <template #default="{ row }">
                <ElTag type="primary" size="small">{{ row.reuseCount }} 次</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="updateTime" label="更新时间" width="160" />
            <ElTableColumn label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <ElSpace>
                  <ElButton type="primary" link size="small" @click="handleViewDetail(row)">
                    详情
                  </ElButton>
                  <ElButton type="success" link size="small" @click="handleReuseToProject(row)">
                    复用到项目
                  </ElButton>
                  <ElButton type="danger" link size="small" @click="handleCancelShare(row)">
                    取消共享
                  </ElButton>
                </ElSpace>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="资产引用" name="reference">
          <ElTable :data="filteredReferenceList" style="width: 100%" v-loading="loading">
            <ElTableColumn label="引用名称" min-width="200">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <div class="asset-icon" :class="row.type">
                    <ArtSvgIcon :icon="typeIconMap[row.type as AssetType]" />
                  </div>
                  <div>
                    <div class="font-medium">{{ row.name }}</div>
                    <div class="text-xs text-g-400">引用ID: {{ row.referenceId }}</div>
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
            <ElTableColumn label="原资产" width="160">
              <template #default="{ row }">
                <ElButton type="primary" link size="small" @click="handleViewOriginal(row)">
                  {{ row.originalName }}
                </ElButton>
              </template>
            </ElTableColumn>
            <ElTableColumn label="引用项目" width="160">
              <template #default="{ row }">
                <ElTag type="info" size="small">{{ row.project }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="creator" label="创建人" width="120" />
            <ElTableColumn label="同步状态" width="120">
              <template #default="{ row }">
                <ElTag :type="row.synced ? 'success' : 'warning'" size="small">
                  {{ row.synced ? '已同步' : '待同步' }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createTime" label="创建时间" width="160" />
            <ElTableColumn label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <ElSpace>
                  <ElButton type="primary" link size="small" @click="handleSync(row)">
                    同步
                  </ElButton>
                  <ElButton type="primary" link size="small" @click="handleViewOriginal(row)">
                    查看原资产
                  </ElButton>
                  <ElButton type="danger" link size="small" @click="handleDeleteReference(row)">
                    删除引用
                  </ElButton>
                </ElSpace>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>

        <ElTabPane label="项目间共享" name="project">
          <div class="project-share-grid">
            <ElCard
              v-for="proj in projectShareList"
              :key="proj.id"
              class="project-share-card"
              shadow="hover"
            >
              <div class="project-share-header">
                <div class="project-icon">
                  <ArtSvgIcon icon="ri:folder-shared-line" />
                </div>
                <div class="project-info">
                  <h4 class="font-medium">{{ proj.name }}</h4>
                  <ElTag type="info" size="small">{{ proj.assetCount }} 个共享资产</ElTag>
                </div>
              </div>
              <ElDivider />
              <div class="project-share-body">
                <div class="share-direction">
                  <div class="direction-item">
                    <span class="label">共享给</span>
                    <ElSpace wrap>
                      <ElTag
                        v-for="target in (proj.shareTo || []).slice(0, 3)"
                        :key="target"
                        size="small"
                      >
                        {{ target }}
                      </ElTag>
                      <ElTag v-if="(proj.shareTo || []).length > 3" type="info" size="small">
                        +{{ (proj.shareTo || []).length - 3 }}
                      </ElTag>
                    </ElSpace>
                  </div>
                  <div class="direction-item mt-3">
                    <span class="label">引用了</span>
                    <ElSpace wrap>
                      <ElTag
                        v-for="source in (proj.referencedFrom || []).slice(0, 3)"
                        :key="source"
                        size="small"
                        type="success"
                      >
                        {{ source }}
                      </ElTag>
                      <ElTag v-if="(proj.referencedFrom || []).length > 3" type="info" size="small">
                        +{{ (proj.referencedFrom || []).length - 3 }}
                      </ElTag>
                    </ElSpace>
                  </div>
                </div>
              </div>
              <div class="project-share-actions">
                <ElButton type="primary" link size="small" @click="handleManageShare(proj)">
                  管理共享
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleViewProjectAssets(proj)">
                  查看资产
                </ElButton>
              </div>
            </ElCard>
          </div>
        </ElTabPane>
      </ElTabs>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>

    <!-- 复用到项目弹窗 -->
    <ElDialog
      v-model="reuseDialogVisible"
      title="复用到项目"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm label-width="100px">
        <ElFormItem label="目标项目" required>
          <ElSelect
            v-model="reuseTargetProject"
            placeholder="请选择目标项目"
            class="w-full"
            multiple
          >
            <ElOption
              v-for="item in projectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="引用方式">
          <ElRadioGroup v-model="reuseMode">
            <ElRadio value="reference">创建引用（同步更新）</ElRadio>
            <ElRadio value="copy">复制副本（独立管理）</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="reuseDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleReuseSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 创建资产引用弹窗 -->
    <ElDialog
      v-model="referenceDialogVisible"
      title="创建资产引用"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm
        :model="referenceForm"
        label-width="100px"
        :rules="referenceRules"
        ref="referenceFormRef"
      >
        <ElFormItem label="选择资产" prop="assetId" required>
          <ElSelect
            v-model="referenceForm.assetId"
            placeholder="请选择资产"
            class="w-full"
            filterable
          >
            <ElOption
              v-for="item in assetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="引用名称" prop="name" required>
          <ElInput v-model="referenceForm.name" placeholder="请输入引用名称" />
        </ElFormItem>
        <ElFormItem label="目标项目" prop="project" required>
          <ElSelect v-model="referenceForm.project" placeholder="请选择目标项目" class="w-full">
            <ElOption
              v-for="item in projectOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="referenceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="referenceDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleReferenceSubmit">确定</ElButton>
      </template>
    </ElDialog>

    <!-- 详情弹窗 -->
    <ElDialog
      v-model="detailVisible"
      title="共享资产详情"
      width="600px"
      align-center
      destroy-on-close
    >
      <div v-if="currentItem" class="detail-content">
        <div class="detail-header flex items-center gap-4 mb-4">
          <div class="detail-icon" :class="currentItem.type">
            <ArtSvgIcon :icon="typeIconMap[currentItem.type]" />
          </div>
          <div>
            <h3 class="text-lg font-medium">{{ currentItem.name }}</h3>
            <ElSpace>
              <ElTag :type="typeTagMap[currentItem.type]" size="small">{{
                typeLabelMap[currentItem.type]
              }}</ElTag>
              <span class="text-sm text-g-400"
                >{{ currentItem.format }} · {{ formatSize(currentItem.size) }}</span
              >
            </ElSpace>
          </div>
        </div>
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="来源项目">{{ currentItem.sourceProject }}</ElDescriptionsItem>
          <ElDescriptionsItem label="复用次数">{{ currentItem.reuseCount }} 次</ElDescriptionsItem>
          <ElDescriptionsItem label="被用于项目">
            <ElSpace wrap>
              <ElTag v-for="proj in currentItem.targetProjects || []" :key="proj" size="small">{{
                proj
              }}</ElTag>
            </ElSpace>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ currentItem.updateTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="描述">{{ currentItem.description || '-' }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useRoute } from 'vue-router'
  import { useTeamStore } from '@/store/modules/team'
  import { useTeamAssetList } from '@/api/queries'

  defineOptions({ name: 'AssetReuse' })

  type AssetType = 'image' | 'video' | 'audio' | 'document' | 'ai-generated'

  interface SharedAsset {
    id: number
    name: string
    type: AssetType
    format: string
    size: number
    sourceProject: string
    targetProjects: string[]
    reuseCount: number
    description: string
    updateTime: string
  }

  interface AssetReference {
    id: number
    name: string
    referenceId: string
    type: AssetType
    originalName: string
    originalId: number
    project: string
    creator: string
    synced: boolean
    createTime: string
  }

  interface ProjectShare {
    id: number
    name: string
    assetCount: number
    shareTo: string[]
    referencedFrom: string[]
  }

  const searchQuery = ref('')
  const filterType = ref<AssetType | ''>('')
  const activeTab = ref('shared')
  const reuseDialogVisible = ref(false)
  const referenceDialogVisible = ref(false)
  const detailVisible = ref(false)
  const currentItem = ref<SharedAsset | null>(null)
  const reuseTargetProject = ref<string[]>([])
  const reuseMode = ref<'reference' | 'copy'>('reference')
  const referenceFormRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const typeOptions = [
    { label: '图片', value: 'image' },
    { label: '视频', value: 'video' },
    { label: '音频', value: 'audio' },
    { label: '文档', value: 'document' },
    { label: 'AI生成', value: 'ai-generated' }
  ]

  const projectOptions = [
    { label: '山海经动画', value: 'shanhaijing' },
    { label: '品牌宣传片', value: 'brand' },
    { label: '产品演示动画', value: 'product-demo' },
    { label: '节日祝福视频', value: 'festival' },
    { label: '教育培训动画', value: 'education' },
    { label: '游戏宣传PV', value: 'game-pv' }
  ]

  const assetOptions = [
    { label: '主角阿禹立绘', value: 1 },
    { label: '九尾狐概念图', value: 2 },
    { label: '青丘山场景', value: 3 },
    { label: '主题背景音乐', value: 6 },
    { label: '剑击音效合集', value: 7 }
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

  const referenceForm = reactive({
    assetId: null as number | null,
    name: '',
    project: '',
    description: ''
  })

  const referenceRules: FormRules = {
    assetId: [{ required: true, message: '请选择资产', trigger: 'change' }],
    name: [{ required: true, message: '请输入引用名称', trigger: 'blur' }],
    project: [{ required: true, message: '请选择目标项目', trigger: 'change' }]
  }

  const teamStore = useTeamStore()
  const route = useRoute()
  const teamId = computed(() => (route.params.teamId as string) || teamStore.currentTeamId || '')

  // Vue Query: 团队资产列表
  const { data: sharedAssetData, isLoading: loading } = useTeamAssetList(teamId)
  const { data: referenceAssetData } = useTeamAssetList(teamId, { category: 'reference' } as any)

  const sharedList = computed<SharedAsset[]>(() =>
    ((sharedAssetData.value as any)?.records || []) as unknown as SharedAsset[]
  )

  const referenceList = computed<AssetReference[]>(() =>
    ((referenceAssetData.value as any)?.records || []) as unknown as AssetReference[]
  )

  const projectShareList = ref<ProjectShare[]>([
    {
      id: 1,
      name: '山海经动画',
      assetCount: 12,
      shareTo: ['品牌宣传片', '游戏宣传PV', '产品演示动画', '教育培训动画'],
      referencedFrom: ['品牌宣传片']
    },
    {
      id: 2,
      name: '品牌宣传片',
      assetCount: 5,
      shareTo: ['产品演示动画', '节日祝福视频', '教育培训动画'],
      referencedFrom: ['山海经动画']
    },
    {
      id: 3,
      name: '游戏宣传PV',
      assetCount: 3,
      shareTo: ['产品演示动画'],
      referencedFrom: ['山海经动画', '品牌宣传片']
    },
    {
      id: 4,
      name: '教育培训动画',
      assetCount: 2,
      shareTo: [],
      referencedFrom: ['山海经动画', '品牌宣传片']
    }
  ])

  const sharedCount = computed(() => sharedList.value.length)
  const referenceCount = computed(() => referenceList.value.length)
  const projectCount = computed(() => projectShareList.value.length)
  const reuseCount = computed(() =>
    sharedList.value.reduce((sum, item) => sum + item.reuseCount, 0)
  )

  const filteredSharedList = computed(() => {
    let result = sharedList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sourceProject.toLowerCase().includes(q) ||
          (item.targetProjects || []).some((p) => p.toLowerCase().includes(q))
      )
    }
    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }
    return result
  })

  const filteredReferenceList = computed(() => {
    let result = referenceList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.originalName.toLowerCase().includes(q) ||
          item.project.toLowerCase().includes(q)
      )
    }
    if (filterType.value) {
      result = result.filter((item) => item.type === filterType.value)
    }
    return result
  })

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleViewDetail = (row: SharedAsset) => {
    currentItem.value = row
    detailVisible.value = true
  }

  const handleReuseToProject = (row: SharedAsset) => {
    currentItem.value = row
    reuseTargetProject.value = []
    reuseMode.value = 'reference'
    reuseDialogVisible.value = true
  }

  const handleReuseSubmit = () => {
    if (reuseTargetProject.value.length === 0) {
      ElMessage.warning('请选择目标项目')
      return
    }
    const modeLabel = reuseMode.value === 'reference' ? '引用' : '副本'
    ElMessage.success(
      `已将「${currentItem.value?.name}」以${modeLabel}方式复用到 ${reuseTargetProject.value.length} 个项目`
    )
    reuseDialogVisible.value = false
  }

  const handleCancelShare = (row: SharedAsset) => {
    ElMessageBox.confirm(`确定要取消共享「${row.name}」吗？其他项目中的引用将失效。`, '取消共享', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      sharedList.value = sharedList.value.filter((item) => item.id !== row.id)
      ElMessage.success('已取消共享')
    })
  }

  const handleCreateReference = () => {
    referenceForm.assetId = null
    referenceForm.name = ''
    referenceForm.project = ''
    referenceForm.description = ''
    referenceDialogVisible.value = true
  }

  const handleReferenceSubmit = async () => {
    if (!referenceFormRef.value) return
    await referenceFormRef.value.validate((valid) => {
      if (valid) {
        const asset = assetOptions.find((a) => a.value === referenceForm.assetId)
        const project = projectOptions.find((p) => p.value === referenceForm.project)
        const newRef: AssetReference = {
          id: Date.now(),
          name: referenceForm.name,
          referenceId: `REF-${String(referenceList.value.length + 1).padStart(3, '0')}`,
          type: 'image',
          originalName: asset?.label || '',
          originalId: referenceForm.assetId || 0,
          project: project?.label || '',
          creator: '当前用户',
          synced: true,
          createTime: new Date().toISOString().slice(0, 10)
        }
        referenceList.value.unshift(newRef)
        ElMessage.success('资产引用创建成功')
        referenceDialogVisible.value = false
      }
    })
  }

  const handleSync = (row: AssetReference) => {
    ElMessage.success(`已同步引用「${row.name}」到最新版本`)
    row.synced = true
  }

  const handleViewOriginal = (row: AssetReference) => {
    ElMessage.info(`查看原资产：${row.originalName}`)
  }

  const handleDeleteReference = (row: AssetReference) => {
    ElMessageBox.confirm(`确定要删除引用「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      referenceList.value = referenceList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  const handleManageShare = (proj: ProjectShare) => {
    ElMessage.info(`管理项目「${proj.name}」的共享设置`)
  }

  const handleViewProjectAssets = (proj: ProjectShare) => {
    ElMessage.info(`查看项目「${proj.name}」的共享资产`)
  }
</script>

<style lang="scss" scoped>
  .reuse-stats {
    .stat-card {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .stat-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        border-radius: 12px;

        &.primary {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.success {
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
        }

        &.warning {
          color: var(--el-color-warning);
          background: var(--el-color-warning-light-9);
        }

        &.info {
          color: var(--el-color-info);
          background: var(--el-color-info-light-9);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .stat-label {
          margin-top: 2px;
          font-size: 13px;
          color: var(--el-text-color-secondary);
        }
      }
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

  .project-share-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding-bottom: 16px;
  }

  .project-share-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }

    .project-share-header {
      display: flex;
      gap: 12px;
      align-items: center;

      .project-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        font-size: 24px;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        border-radius: 12px;
      }

      .project-info {
        h4 {
          margin-bottom: 4px;
        }
      }
    }

    .project-share-body {
      .share-direction {
        .direction-item {
          display: flex;
          gap: 8px;
          align-items: flex-start;

          .label {
            flex-shrink: 0;
            width: 56px;
            font-size: 13px;
            color: var(--el-text-color-secondary);
            white-space: nowrap;
          }
        }
      }
    }

    .project-share-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
  }

  .detail-content {
    .detail-header {
      .detail-icon {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 64px;
        height: 64px;
        font-size: 32px;
        border-radius: 16px;

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
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
</style>
