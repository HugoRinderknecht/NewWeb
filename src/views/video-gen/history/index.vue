<template>
  <div class="video-gen-history-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">生成历史</span>
            <ElTag type="info" size="small">{{ filteredHistory.length }} 条记录</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索任务名称/ID"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect
              v-model="resolutionFilter"
              placeholder="分辨率筛选"
              clearable
              style="width: 140px"
            >
              <ElOption label="480p" value="480p" />
              <ElOption label="720p" value="720p" />
              <ElOption label="1080p" value="1080p" />
            </ElSelect>
            <ElButton type="primary" @click="handleBatchExport">
              <ArtSvgIcon icon="ri:download-line" class="mr-1" />
              批量导出
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ArtTable
        :data="pagedHistory"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="任务名称" min-width="200">
            <template #default="scope">
              <div class="flex items-center gap-3">
                <div class="history-icon">
                  <ArtSvgIcon icon="ri:video-line" />
                </div>
                <div>
                  <div class="font-medium">{{ scope.row.name || scope.row.id }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.id }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="生成参数" min-width="200">
            <template #default="scope">
              <ElSpace wrap>
                <ElTag size="small" type="info">{{ scope.row.resolution }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.ratio }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.duration }}s</ElTag>
                <ElTag size="small" type="info">{{
                  scope.row.model === 'doubao-seedance-2-0-fast-260128' ? 'Fast' : '标准'
                }}</ElTag>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn label="完成时间" width="160">
            <template #default="scope">
              <div class="text-sm">{{ scope.row.completeTime || scope.row.updatedAt }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="文件大小" width="100">
            <template #default="scope">
              <span class="text-sm">{{ scope.row.fileSize || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="240" fixed="right">
            <template #default="scope">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handlePreview(scope.row)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  预览
                </ElButton>
                <ElButton type="success" link size="small" @click="handleDownload(scope.row)">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  下载
                </ElButton>
                <ElButton type="warning" link size="small" @click="handleReuse(scope.row)">
                  <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                  复用
                </ElButton>
                <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
                  删除
                </ElButton>
              </ElSpace>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>
    </ElCard>

    <!-- 复用参数弹窗 -->
    <ElDialog
      v-model="reuseVisible"
      title="复用生成参数"
      width="700px"
      align-center
      destroy-on-close
    >
      <ElForm :model="reuseForm" label-width="100px" :rules="reuseRules" ref="reuseFormRef">
        <ElFormItem label="选择分镜">
          <ElSelect
            v-model="reuseForm.storyboardId"
            placeholder="请选择要生成的分镜"
            class="w-full"
          >
            <ElOption
              v-for="shot in shotOptions"
              :key="shot.id"
              :label="shot.title || shot.name"
              :value="shot.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="模型">
              <ElSelect v-model="reuseForm.model" placeholder="请选择模型" class="w-full">
                <ElOption label="Seedance 2.0 (标准)" value="doubao-seedance-2-0-260128" />
                <ElOption
                  label="Seedance 2.0 Fast (快速)"
                  value="doubao-seedance-2-0-fast-260128"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分辨率">
              <ElSelect v-model="reuseForm.resolution" placeholder="请选择分辨率" class="w-full">
                <ElOption label="480p" value="480p" />
                <ElOption label="720p" value="720p" />
                <ElOption label="1080p" value="1080p" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="宽高比">
              <ElSelect v-model="reuseForm.ratio" placeholder="请选择宽高比" class="w-full">
                <ElOption label="自适应" value="adaptive" />
                <ElOption label="16:9" value="16:9" />
                <ElOption label="4:3" value="4:3" />
                <ElOption label="1:1" value="1:1" />
                <ElOption label="3:4" value="3:4" />
                <ElOption label="9:16" value="9:16" />
                <ElOption label="21:9" value="21:9" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="时长(秒)">
              <ElInputNumber v-model="reuseForm.duration" :min="4" :max="15" class="w-full" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="备注">
          <ElInput
            v-model="reuseForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可选：添加任务备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="reuseVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="reusing" @click="handleSubmitReuse">
          <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
          提交任务
        </ElButton>
      </template>
    </ElDialog>

    <!-- 预览弹窗 -->
    <ElDialog v-model="previewVisible" title="视频预览" width="800px" align-center destroy-on-close>
      <div class="preview-container flex-cc">
        <div v-if="currentItem" class="text-center">
          <div v-if="currentItem.videoUrl" class="video-player-wrapper">
            <video :src="currentItem.videoUrl" controls class="w-full" style="max-height: 400px" />
          </div>
          <template v-else>
            <ArtSvgIcon icon="ri:video-line" class="text-6xl text-primary mb-4" />
            <div class="font-medium text-lg">{{ currentItem.name || currentItem.id }}</div>
          </template>
          <div class="mt-4">
            <ElTag size="small" type="info">{{ currentItem.resolution }}</ElTag>
            <ElTag size="small" type="info" class="ml-2">{{ currentItem.ratio }}</ElTag>
            <ElTag size="small" type="info" class="ml-2">{{ currentItem.duration }}s</ElTag>
          </div>
        </div>
      </div>
      <template #footer>
        <ElButton @click="previewVisible = false">关闭</ElButton>
        <ElButton type="primary" @click="handleDownload(currentItem)">
          <ArtSvgIcon icon="ri:download-line" class="mr-1" />
          下载
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    fetchGetVideoTaskList,
    fetchGetVideoTaskResult,
    fetchCancelVideoTask,
    fetchSubmitVideoGeneration,
    fetchPreviewVideoGeneration
  } from '@/api/video'
  import { fetchGetStoryboardList } from '@/api/storyboard'

  defineOptions({ name: 'VideoGenHistory' })

  type HistoryItem = Api.Video.VideoTask

  interface ShotOption {
    id: string
    name: string
    title: string
  }

  const route = useRoute()
  const projectId = computed(
    () => (route.params.projectId as string) || (route.query.projectId as string) || ''
  )

  const searchQuery = ref('')
  const resolutionFilter = ref('')
  const reuseVisible = ref(false)
  const previewVisible = ref(false)
  const reuseFormRef = ref<FormInstance>()
  const currentItem = ref<HistoryItem | null>(null)
  const selectedItems = ref<HistoryItem[]>([])
  const reusing = ref(false)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '任务名称', minWidth: 200 },
    { prop: 'params', label: '生成参数', minWidth: 200 },
    { prop: 'completeTime', label: '完成时间', width: 160 },
    { prop: 'fileSize', label: '文件大小', width: 100 },
    { prop: 'operation', label: '操作', width: 240, fixed: 'right' }
  ]

  const reuseForm = reactive({
    storyboardId: '',
    model: 'doubao-seedance-2-0-260128',
    resolution: '720p',
    ratio: 'adaptive',
    duration: 5,
    remark: ''
  })

  const reuseRules: FormRules = {}

  const shotOptions = ref<ShotOption[]>([])

  const loadShotOptions = async () => {
    if (!projectId.value) return
    try {
      const res = await fetchGetStoryboardList(projectId.value)
      shotOptions.value = (res.records || []).map((item: any) => ({
        id: item.id,
        name: item.title || item.name || '',
        title: item.title || item.name || ''
      }))
    } catch {
      shotOptions.value = []
    }
  }

  const historyList = ref<HistoryItem[]>([])
  const loading = ref(false)

  const loadHistoryList = async () => {
    loading.value = true
    try {
      const res = await fetchGetVideoTaskList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchQuery.value || undefined,
        status: 'succeeded',
        projectId: projectId.value || undefined
      })
      if (res) {
        historyList.value = (res.records || []) as HistoryItem[]
        pagination.total = res.total || 0
      }
    } catch {
      ElMessage.error('加载历史记录失败')
    } finally {
      loading.value = false
    }
  }

  const filteredHistory = computed(() => {
    let result = historyList.value
    if (resolutionFilter.value) {
      result = result.filter((item) => item.resolution === resolutionFilter.value)
    }
    return result
  })

  const pagedHistory = computed(() => {
    return filteredHistory.value
  })

  const handleSelectionChange = (selection: HistoryItem[]) => {
    selectedItems.value = selection
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadHistoryList()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadHistoryList()
  }

  const handlePreview = async (row: HistoryItem) => {
    currentItem.value = row
    // 尝试获取视频URL
    try {
      const result = await fetchGetVideoTaskResult(row.id)
      if (result?.videoUrl) {
        currentItem.value = { ...row, videoUrl: result.videoUrl }
      }
    } catch {
      // 使用本地数据
    }
    previewVisible.value = true
  }

  const handleDownload = async (row: HistoryItem | null) => {
    if (!row) return
    try {
      const result = await fetchGetVideoTaskResult(row.id)
      if (result?.videoUrl) {
        window.open(result.videoUrl, '_blank')
        ElMessage.success(`开始下载「${row.name || row.id}」`)
      } else {
        ElMessage.warning('暂无可下载的视频文件')
      }
    } catch {
      ElMessage.error('获取下载链接失败')
    }
  }

  const handleReuse = (row: HistoryItem) => {
    reuseForm.storyboardId = row.storyboardId || ''
    reuseForm.model = row.model || 'doubao-seedance-2-0-260128'
    reuseForm.resolution = row.resolution || '720p'
    reuseForm.ratio = row.ratio || 'adaptive'
    reuseForm.duration = row.duration || 5
    reuseForm.remark = ''
    reuseVisible.value = true
    loadShotOptions()
  }

  const handleSubmitReuse = async () => {
    reusing.value = true
    try {
      // 1. 先调用预览接口获取 previewToken
      const previewParams: Api.Video.VideoPreviewParams = {
        model: reuseForm.model,
        resolution: reuseForm.resolution,
        ratio: reuseForm.ratio,
        duration: reuseForm.duration,
        projectId: projectId.value,
        storyboardId: reuseForm.storyboardId || undefined
      }
      const previewResult = await fetchPreviewVideoGeneration(previewParams)
      const previewToken = previewResult?.previewToken
      if (!previewToken) {
        ElMessage.error('预览确认失败，未获取到 previewToken')
        return
      }

      // 2. 提交生成任务
      await fetchSubmitVideoGeneration({
        ...previewParams,
        previewToken
      })
      ElMessage.success('复用任务已提交')
      reuseVisible.value = false
    } catch {
      ElMessage.error('复用任务提交失败')
    } finally {
      reusing.value = false
    }
  }

  const handleDelete = async (row: HistoryItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除历史记录「${row.name || row.id}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      })
      await fetchCancelVideoTask(row.id)
      await loadHistoryList()
      ElMessage.success('删除成功')
    } catch {
      // 用户取消
    }
  }

  const handleBatchExport = async () => {
    if (selectedItems.value.length === 0) {
      ElMessage.warning('请先选择要导出的记录')
      return
    }
    // 批量获取下载链接
    for (const item of selectedItems.value) {
      try {
        const result = await fetchGetVideoTaskResult(item.id)
        if (result?.videoUrl) {
          window.open(result.videoUrl, '_blank')
        }
      } catch {
        // 跳过失败的
      }
    }
    ElMessage.success(`已选择 ${selectedItems.value.length} 条记录进行批量导出`)
  }

  onMounted(() => {
    loadHistoryList()
  })
</script>

<style lang="scss" scoped>
  .video-gen-history-page {
    height: 100%;
  }

  .history-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 20px;
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
    border-radius: 8px;
  }

  .preview-container {
    min-height: 300px;
    background: var(--el-fill-color-lighter);
    border-radius: var(--custom-radius);
  }

  .video-player-wrapper {
    width: 100%;
  }
</style>
