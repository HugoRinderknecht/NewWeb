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
            <ElSelect v-model="styleFilter" placeholder="风格筛选" clearable style="width: 140px">
              <ElOption label="写实风格" value="写实风格" />
              <ElOption label="卡通风格" value="卡通风格" />
              <ElOption label="3D动画" value="3D动画" />
              <ElOption label="水墨风格" value="水墨风格" />
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
                  <div class="font-medium">{{ scope.row.name }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.id }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="生成参数" min-width="200">
            <template #default="scope">
              <ElSpace wrap>
                <ElTag size="small" type="info">{{ scope.row.style }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.resolution }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.fps }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.format }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.shots }}个镜头</ElTag>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn label="完成时间" width="160">
            <template #default="scope">
              <div class="text-sm">{{ scope.row.completeTime }}</div>
              <div class="text-xs text-g-400">耗时 {{ scope.row.duration }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="文件大小" width="100">
            <template #default="scope">
              <span class="text-sm">{{ scope.row.fileSize }}</span>
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
        <ElFormItem label="新任务名称" prop="name" required>
          <ElInput v-model="reuseForm.name" placeholder="请输入新任务名称" />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="视频风格">
              <ElSelect v-model="reuseForm.style" placeholder="请选择风格" class="w-full">
                <ElOption label="写实风格" value="写实风格" />
                <ElOption label="卡通风格" value="卡通风格" />
                <ElOption label="3D动画" value="3D动画" />
                <ElOption label="水墨风格" value="水墨风格" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分辨率">
              <ElSelect v-model="reuseForm.resolution" placeholder="请选择分辨率" class="w-full">
                <ElOption label="1920x1080 (1080p)" value="1080p" />
                <ElOption label="2560x1440 (2K)" value="2k" />
                <ElOption label="3840x2160 (4K)" value="4k" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="帧率">
              <ElSelect v-model="reuseForm.fps" placeholder="请选择帧率" class="w-full">
                <ElOption label="24fps" value="24fps" />
                <ElOption label="30fps" value="30fps" />
                <ElOption label="60fps" value="60fps" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="视频格式">
              <ElSelect v-model="reuseForm.format" placeholder="请选择格式" class="w-full">
                <ElOption label="MP4" value="MP4" />
                <ElOption label="MOV" value="MOV" />
                <ElOption label="AVI" value="AVI" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="选择分镜">
          <ElSelect
            v-model="reuseForm.shots"
            multiple
            placeholder="请选择要生成的分镜"
            class="w-full"
          >
            <ElOption
              v-for="shot in shotOptions"
              :key="shot.id"
              :label="shot.name"
              :value="shot.id"
            />
          </ElSelect>
        </ElFormItem>
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
        <ElButton type="primary" @click="handleSubmitReuse">
          <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
          提交任务
        </ElButton>
      </template>
    </ElDialog>

    <!-- 预览弹窗 -->
    <ElDialog v-model="previewVisible" title="视频预览" width="800px" align-center destroy-on-close>
      <div class="preview-container flex-cc">
        <div v-if="currentItem" class="text-center">
          <ArtSvgIcon icon="ri:video-line" class="text-6xl text-primary mb-4" />
          <div class="font-medium text-lg">{{ currentItem.name }}</div>
          <div class="text-g-400 mt-2">{{ currentItem.id }}</div>
          <div class="mt-4">
            <ElTag size="small" type="info">{{ currentItem.style }}</ElTag>
            <ElTag size="small" type="info" class="ml-2">{{ currentItem.resolution }}</ElTag>
            <ElTag size="small" type="info" class="ml-2">{{ currentItem.format }}</ElTag>
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
  import { fetchGetVideoTaskList } from '@/api/video'

  defineOptions({ name: 'VideoGenHistory' })

  interface HistoryItem {
    id: string
    name: string
    style: string
    resolution: string
    fps: string
    format: string
    shots: number
    completeTime: string
    duration: string
    fileSize: string
    remark: string
  }

  interface ShotOption {
    id: number
    name: string
  }

  const searchQuery = ref('')
  const styleFilter = ref('')
  const reuseVisible = ref(false)
  const previewVisible = ref(false)
  const reuseFormRef = ref<FormInstance>()
  const currentItem = ref<HistoryItem | null>(null)
  const selectedItems = ref<HistoryItem[]>([])

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
    name: '',
    style: '写实风格',
    resolution: '1080p',
    fps: '24fps',
    format: 'MP4',
    shots: [] as number[],
    remark: ''
  })

  const reuseRules: FormRules = {
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
  }

  const shotOptions: ShotOption[] = [
    { id: 1, name: '山巅全景' },
    { id: 2, name: '主角面部特写' },
    { id: 3, name: '山腰近景' },
    { id: 4, name: '九尾狐全景' },
    { id: 5, name: '对话过肩' },
    { id: 6, name: '大特写·眼睛' }
  ]

  const historyList = ref<HistoryItem[]>([])
  const loading = ref(false)

  const loadHistoryList = async () => {
    loading.value = true
    try {
      const res = await fetchGetVideoTaskList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchQuery.value || undefined,
        status: 'completed'
      })
      if (res) {
        const list = Array.isArray(res) ? res : res.records || []
        historyList.value = list.map((item: any) => ({
          id: item.id,
          name: item.name,
          style: item.style || '',
          resolution: item.resolution || '',
          fps: item.fps || '',
          format: item.format || '',
          shots: item.shots || 0,
          completeTime: item.completeTime || item.submitTime || '',
          duration: item.duration || '',
          fileSize: item.fileSize || '',
          remark: item.remark || ''
        }))
        pagination.total = (res as any).total || list.length
      }
    } catch {
      ElMessage.error('加载历史记录失败')
    } finally {
      loading.value = false
    }
  }

  const filteredHistory = computed(() => {
    let result = historyList.value
    if (styleFilter.value) {
      result = result.filter((item) => item.style === styleFilter.value)
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
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handlePreview = (row: HistoryItem) => {
    currentItem.value = row
    previewVisible.value = true
  }

  const handleDownload = (row: HistoryItem | null) => {
    if (!row) return
    ElMessage.success(`开始下载「${row.name}」`)
  }

  const handleReuse = (row: HistoryItem) => {
    reuseForm.name = `${row.name}_复用`
    reuseForm.style = row.style
    reuseForm.resolution = row.resolution
    reuseForm.fps = row.fps
    reuseForm.format = row.format
    reuseForm.shots = []
    reuseForm.remark = ''
    reuseVisible.value = true
  }

  const handleSubmitReuse = async () => {
    if (!reuseFormRef.value) return
    await reuseFormRef.value.validate((valid) => {
      if (valid) {
        ElMessage.success('复用任务已提交')
        reuseVisible.value = false
      }
    })
  }

  const handleDelete = (row: HistoryItem) => {
    ElMessageBox.confirm(`确定要删除历史记录「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      historyList.value = historyList.value.filter((t) => t.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  const handleBatchExport = () => {
    if (selectedItems.value.length === 0) {
      ElMessage.warning('请先选择要导出的记录')
      return
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
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  .preview-container {
    min-height: 300px;
    background: var(--el-fill-color-lighter);
    border-radius: var(--custom-radius);
  }
</style>
