<template>
  <div class="editor-export-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">导出管理</span>
            <ElTag type="info" size="small">{{ filteredExports.length }} 个任务</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索任务名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption label="导出中" value="exporting" />
              <ElOption label="已完成" value="completed" />
              <ElOption label="失败" value="failed" />
            </ElSelect>
            <ElButton type="primary" @click="handleCreateExport">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建导出
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <!-- 状态统计卡片 -->
      <div class="status-stats flex-cb mb-4">
        <div
          v-for="stat in statusStats"
          :key="stat.status"
          class="stat-card"
          :class="{ active: statusFilter === stat.status }"
          @click="handleFilterByStatus(stat.status)"
        >
          <div class="stat-icon" :style="{ background: stat.bgColor, color: stat.color }">
            <ArtSvgIcon :icon="stat.icon" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.count }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <ArtTable
        :data="pagedExports"
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
                <div class="export-icon" :class="(scope.row as ExportItem).status">
                  <ArtSvgIcon :icon="statusIconMap[(scope.row as ExportItem).status]" />
                </div>
                <div>
                  <div class="font-medium">{{ scope.row.name }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.id }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="120">
            <template #default="scope">
              <ElTag :type="statusTagMap[(scope.row as ExportItem).status]" size="small">
                <ArtSvgIcon :icon="statusIconMap[(scope.row as ExportItem).status]" class="mr-1" />
                {{ statusLabelMap[(scope.row as ExportItem).status] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="进度" width="220">
            <template #default="scope">
              <div class="flex items-center gap-2">
                <ElProgress
                  :percentage="scope.row.progress"
                  :status="
                    scope.row.status === 'failed'
                      ? 'exception'
                      : scope.row.status === 'completed'
                        ? 'success'
                        : undefined
                  "
                  :stroke-width="6"
                  class="flex-1"
                />
                <span class="text-xs text-g-400 w-10 text-right">{{ scope.row.progress }}%</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="导出格式" min-width="160">
            <template #default="scope">
              <ElSpace wrap>
                <ElTag size="small" type="info">{{ scope.row.format }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.resolution }}</ElTag>
                <ElTag size="small" type="info">{{ scope.row.codec }}</ElTag>
              </ElSpace>
            </template>
          </ElTableColumn>
          <ElTableColumn label="文件大小" width="100">
            <template #default="scope">
              <span class="text-sm">{{ scope.row.fileSize || '-' }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建时间" width="160">
            <template #default="scope">
              <div class="text-sm">{{ scope.row.createTime }}</div>
              <div class="text-xs text-g-400">{{
                scope.row.estimatedTime ? `预计 ${scope.row.estimatedTime}` : '-'
              }}</div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="scope">
              <ElSpace>
                <ElButton
                  v-if="scope.row.status === 'completed'"
                  type="success"
                  link
                  size="small"
                  @click="handleDownload(scope.row)"
                >
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  下载
                </ElButton>
                <ElButton
                  v-if="scope.row.status === 'failed'"
                  type="warning"
                  link
                  size="small"
                  @click="handleRetry(scope.row)"
                >
                  <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                  重试
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
                  详情
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

    <!-- 新建导出弹窗 -->
    <ElDialog
      v-model="createVisible"
      title="新建导出任务"
      width="700px"
      align-center
      destroy-on-close
    >
      <ElForm :model="createForm" label-width="100px" :rules="createRules" ref="createFormRef">
        <ElFormItem label="任务名称" prop="name" required>
          <ElInput v-model="createForm.name" placeholder="请输入导出任务名称" />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="导出格式">
              <ElSelect v-model="createForm.format" placeholder="请选择格式" class="w-full">
                <ElOption label="MP4" value="MP4" />
                <ElOption label="MOV" value="MOV" />
                <ElOption label="AVI" value="AVI" />
                <ElOption label="MKV" value="MKV" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分辨率">
              <ElSelect v-model="createForm.resolution" placeholder="请选择分辨率" class="w-full">
                <ElOption label="1920x1080 (1080p)" value="1080p" />
                <ElOption label="2560x1440 (2K)" value="2k" />
                <ElOption label="3840x2160 (4K)" value="4k" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="编码器">
              <ElSelect v-model="createForm.codec" placeholder="请选择编码器" class="w-full">
                <ElOption label="H.264" value="H.264" />
                <ElOption label="H.265/HEVC" value="H.265" />
                <ElOption label="ProRes" value="ProRes" />
                <ElOption label="VP9" value="VP9" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="帧率">
              <ElSelect v-model="createForm.fps" placeholder="请选择帧率" class="w-full">
                <ElOption label="24fps" value="24fps" />
                <ElOption label="30fps" value="30fps" />
                <ElOption label="60fps" value="60fps" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="质量">
          <ElRadioGroup v-model="createForm.quality">
            <ElRadio value="high">高（文件较大）</ElRadio>
            <ElRadio value="medium">中（推荐）</ElRadio>
            <ElRadio value="low">低（文件较小）</ElRadio>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem label="包含音频">
          <ElSwitch v-model="createForm.includeAudio" />
        </ElFormItem>
        <ElFormItem label="包含字幕">
          <ElSwitch v-model="createForm.includeSubtitle" />
        </ElFormItem>
        <ElFormItem label="备注">
          <ElInput
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可选：添加任务备注"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="createVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmitCreate">
          <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
          开始导出
        </ElButton>
      </template>
    </ElDialog>

    <!-- 详情弹窗 -->
    <ElDialog v-model="detailVisible" title="导出详情" width="600px" align-center destroy-on-close>
      <ElDescriptions :column="2" border v-if="currentItem">
        <ElDescriptionsItem label="任务ID">{{ currentItem.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="任务名称">{{ currentItem.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="statusTagMap[currentItem.status]" size="small">
            {{ statusLabelMap[currentItem.status] }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="进度">
          <ElProgress :percentage="currentItem.progress" :stroke-width="6" style="width: 120px" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="格式">{{ currentItem.format }}</ElDescriptionsItem>
        <ElDescriptionsItem label="分辨率">{{ currentItem.resolution }}</ElDescriptionsItem>
        <ElDescriptionsItem label="编码器">{{ currentItem.codec }}</ElDescriptionsItem>
        <ElDescriptionsItem label="文件大小">{{ currentItem.fileSize || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间" :span="2">{{
          currentItem.createTime
        }}</ElDescriptionsItem>
        <ElDescriptionsItem label="备注" :span="2">{{
          currentItem.remark || '-'
        }}</ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <ElButton @click="detailVisible = false">关闭</ElButton>
        <ElButton
          v-if="currentItem?.status === 'completed'"
          type="primary"
          @click="handleDownload(currentItem)"
        >
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
  import { fetchGetExportStatus, fetchExportVideo } from '@/api/editor'

  defineOptions({ name: 'EditorExport' })

  type ExportStatus = 'exporting' | 'completed' | 'failed'

  interface ExportItem {
    id: string
    name: string
    status: ExportStatus
    progress: number
    format: string
    resolution: string
    codec: string
    fileSize: string
    createTime: string
    estimatedTime: string
    remark: string
  }

  const searchQuery = ref('')
  const statusFilter = ref<ExportStatus | ''>('')
  const createVisible = ref(false)
  const detailVisible = ref(false)
  const submitting = ref(false)
  const createFormRef = ref<FormInstance>()
  const currentItem = ref<ExportItem | null>(null)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusTagMap: Record<ExportStatus, 'primary' | 'success' | 'danger'> = {
    exporting: 'primary',
    completed: 'success',
    failed: 'danger'
  }

  const statusLabelMap: Record<ExportStatus, string> = {
    exporting: '导出中',
    completed: '已完成',
    failed: '失败'
  }

  const statusIconMap: Record<ExportStatus, string> = {
    exporting: 'ri:loader-4-line',
    completed: 'ri:check-line',
    failed: 'ri:close-line'
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '任务名称', minWidth: 200 },
    { prop: 'status', label: '状态', width: 120 },
    { prop: 'progress', label: '进度', width: 220 },
    { prop: 'format', label: '导出格式', minWidth: 160 },
    { prop: 'fileSize', label: '文件大小', width: 100 },
    { prop: 'createTime', label: '创建时间', width: 160 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const createForm = reactive({
    name: '',
    format: 'MP4',
    resolution: '1080p',
    codec: 'H.264',
    fps: '30fps',
    quality: 'medium',
    includeAudio: true,
    includeSubtitle: false,
    remark: ''
  })

  const createRules: FormRules = {
    name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }]
  }

  const exportList = ref<ExportItem[]>([])

  const loadExportList = async () => {
    try {
      const data = await fetchGetExportStatus('')
      if (data) {
        exportList.value = (Array.isArray(data) ? data : (data as any).records || []).map(
          (item: any) => ({
            id: item.id || '',
            name: item.name || '',
            status: item.status || 'exporting',
            progress: item.progress || 0,
            format: item.format || '',
            resolution: item.resolution || '',
            codec: item.codec || '',
            fileSize: item.fileSize || '',
            createTime: item.createTime || '',
            estimatedTime: item.estimatedTime || '',
            remark: item.remark || ''
          })
        ) as ExportItem[]
      }
    } catch {
      ElMessage.error('加载导出列表失败')
    }
  }

  const statusStats = computed(() => {
    const stats = [
      {
        status: 'exporting' as ExportStatus,
        label: '导出中',
        icon: 'ri:loader-4-line',
        bgColor: '#ecf5ff',
        color: '#409eff'
      },
      {
        status: 'completed' as ExportStatus,
        label: '已完成',
        icon: 'ri:check-line',
        bgColor: '#f0f9eb',
        color: '#67c23a'
      },
      {
        status: 'failed' as ExportStatus,
        label: '失败',
        icon: 'ri:close-line',
        bgColor: '#fef0f0',
        color: '#f56c6c'
      }
    ]
    return stats.map((s) => ({
      ...s,
      count: exportList.value.filter((t) => t.status === s.status).length
    }))
  })

  const filteredExports = computed(() => {
    let result = exportList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
      )
    }
    if (statusFilter.value) {
      result = result.filter((item) => item.status === statusFilter.value)
    }
    return result
  })

  const pagedExports = computed(() => {
    const list = filteredExports.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredExports, (list) => {
    pagination.total = list.length
  })

  const handleSelectionChange = (selection: ExportItem[]) => {
    console.log('选中任务:', selection)
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleFilterByStatus = (status: ExportStatus) => {
    statusFilter.value = statusFilter.value === status ? '' : status
  }

  const handleCreateExport = () => {
    createForm.name = ''
    createForm.format = 'MP4'
    createForm.resolution = '1080p'
    createForm.codec = 'H.264'
    createForm.fps = '30fps'
    createForm.quality = 'medium'
    createForm.includeAudio = true
    createForm.includeSubtitle = false
    createForm.remark = ''
    createVisible.value = true
  }

  const handleSubmitCreate = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          await fetchExportVideo('1', {
            name: createForm.name,
            format: createForm.format,
            resolution: createForm.resolution,
            codec: createForm.codec,
            fps: createForm.fps,
            quality: createForm.quality,
            includeAudio: createForm.includeAudio,
            includeSubtitle: createForm.includeSubtitle,
            remark: createForm.remark
          } as any)
          await loadExportList()
          createVisible.value = false
          ElMessage.success('导出任务已创建')
        } catch {
          ElMessage.error('导出任务创建失败')
        } finally {
          submitting.value = false
        }
      }
    })
  }

  const handleDownload = (row: ExportItem | null) => {
    if (!row) return
    ElMessage.success(`开始下载「${row.name}」`)
  }

  const handleRetry = (row: ExportItem) => {
    ElMessageBox.confirm(`确定要重新导出「${row.name}」吗？`, '重试确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const index = exportList.value.findIndex((t) => t.id === row.id)
      if (index !== -1) {
        exportList.value[index].status = 'exporting'
        exportList.value[index].progress = 0
        exportList.value[index].createTime = new Date().toLocaleString()
        ElMessage.success('任务已重新提交')
      }
    })
  }

  const handleViewDetail = (row: ExportItem) => {
    currentItem.value = row
    detailVisible.value = true
  }

  const handleDelete = (row: ExportItem) => {
    ElMessageBox.confirm(`确定要删除导出任务「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      exportList.value = exportList.value.filter((t) => t.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  onMounted(() => {
    loadExportList()
  })
</script>

<style lang="scss" scoped>
  .editor-export-page {
    height: 100%;
  }

  .status-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;

      &:hover {
        border-color: var(--el-color-primary-light-7);
      }

      &.active {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

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

      .stat-info {
        .stat-value {
          font-size: 22px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: 13px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }
  }

  .export-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;

    &.exporting {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.completed {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }

    &.failed {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }
</style>
