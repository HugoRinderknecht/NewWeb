<template>
  <div class="editor-edit-manage-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剪辑管理</span>
            <ElTag type="info" size="small">{{ filteredProjects.length }} 个项目</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索剪辑名称 / 项目名称"
              clearable
              style="width: 240px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption label="草稿" value="draft" />
              <ElOption label="处理中" value="processing" />
              <ElOption label="已完成" value="completed" />
              <ElOption label="导出中" value="exporting" />
              <ElOption label="已导出" value="exported" />
            </ElSelect>
            <ElButton type="primary" @click="handleCreateProject">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建剪辑
            </ElButton>
          </ElSpace>
        </div>
      </template>

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
        :data="pagedProjects"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="剪辑名称" min-width="220">
            <template #default="scope">
              <div class="flex items-center gap-3">
                <div class="edit-icon" :class="(scope.row as EditProjectVO).status">
                  <ArtSvgIcon icon="ri:scissors-cut-line" />
                </div>
                <div>
                  <div class="font-medium">{{ (scope.row as EditProjectVO).editName }}</div>
                  <div class="text-xs text-g-400">
                    {{ (scope.row as EditProjectVO).projectName }}
                  </div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="120">
            <template #default="scope">
              <ElTag :type="statusTagMap[(scope.row as EditProjectVO).status]" size="small">
                <ArtSvgIcon
                  :icon="statusIconMap[(scope.row as EditProjectVO).status]"
                  class="mr-1"
                />
                {{ statusLabelMap[(scope.row as EditProjectVO).status] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="分辨率" width="120">
            <template #default="scope">
              <ElTag size="small" type="info">{{ (scope.row as EditProjectVO).resolution }}</ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="帧率" width="80">
            <template #default="scope">
              <span class="text-sm">{{ (scope.row as EditProjectVO).frameRate }}fps</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="时长" width="100">
            <template #default="scope">
              <span class="text-sm">{{
                formatSeconds((scope.row as EditProjectVO).durationSeconds)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="片段数" width="80" align="center">
            <template #default="scope">
              <span class="text-sm">{{ (scope.row as EditProjectVO).segmentCount }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="创建者" width="100">
            <template #default="scope">
              <span class="text-sm">{{ (scope.row as EditProjectVO).creatorName }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="更新时间" width="160" sortable>
            <template #default="scope">
              <span class="text-sm">{{
                formatDateTime((scope.row as EditProjectVO).updateTime)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="scope">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleViewDetail(scope.row)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  详情
                </ElButton>
                <ElButton type="warning" link size="small" @click="handleEditProject(scope.row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="success" link size="small" @click="handleExport(scope.row)">
                  <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                  导出
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

    <!-- 详情弹窗 -->
    <ElDialog
      v-model="detailVisible"
      title="剪辑项目详情"
      width="860px"
      align-center
      destroy-on-close
    >
      <div v-if="currentProject" class="detail-content">
        <ElDescriptions :column="2" border class="mb-4">
          <ElDescriptionsItem label="剪辑ID">{{ currentProject.id }}</ElDescriptionsItem>
          <ElDescriptionsItem label="所属项目">{{ currentProject.projectName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="剪辑名称">{{ currentProject.editName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="描述">{{
            currentProject.description || '-'
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="statusTagMap[currentProject.status]" size="small">
              {{ statusLabelMap[currentProject.status] }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="分辨率">{{ currentProject.resolution }}</ElDescriptionsItem>
          <ElDescriptionsItem label="帧率">{{ currentProject.frameRate }}fps</ElDescriptionsItem>
          <ElDescriptionsItem label="总时长">{{
            formatSeconds(currentProject.durationSeconds)
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建者">{{ currentProject.creatorName }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{
            formatDateTime(currentProject.createTime)
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间" :span="2">{{
            formatDateTime(currentProject.updateTime)
          }}</ElDescriptionsItem>
        </ElDescriptions>

        <div class="segment-header flex items-center justify-between mb-3">
          <span class="font-medium">片段列表</span>
          <ElTag type="info" size="small">{{ segmentList.length }} 个片段</ElTag>
        </div>

        <ElTable :data="segmentList" border stripe size="small" max-height="320">
          <ElTableColumn type="index" label="#" width="50" />
          <ElTableColumn label="资源类型" width="100">
            <template #default="{ row }">
              <ElTag :type="assetTypeTagMap[(row as EditSegmentVO).assetType]" size="small">
                {{ assetTypeLabelMap[(row as EditSegmentVO).assetType] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="资源URL" min-width="200">
            <template #default="{ row }">
              <span class="text-xs truncate block max-w-[200px]">{{ row.assetUrl }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="开始时间" width="90">
            <template #default="{ row }">{{ formatSeconds(row.startTime) }}</template>
          </ElTableColumn>
          <ElTableColumn label="结束时间" width="90">
            <template #default="{ row }">{{ formatSeconds(row.endTime) }}</template>
          </ElTableColumn>
          <ElTableColumn label="时长" width="80">
            <template #default="{ row }">{{ formatSeconds(row.duration) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="transition" label="转场" width="90">
            <template #default="{ row }">
              <ElTag v-if="row.transition" size="small" type="warning">{{ row.transition }}</ElTag>
              <span v-else class="text-xs text-g-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="音量" width="80">
            <template #default="{ row }">{{ row.volume }}</template>
          </ElTableColumn>
          <ElTableColumn label="速度" width="70">
            <template #default="{ row }">{{ row.speed }}x</template>
          </ElTableColumn>
        </ElTable>
      </div>
      <template #footer>
        <ElButton @click="detailVisible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <!-- 新建/编辑弹窗 -->
    <ElDialog
      v-model="formVisible"
      :title="isEdit ? '编辑剪辑项目' : '新建剪辑项目'"
      width="600px"
      align-center
      destroy-on-close
    >
      <ElForm :model="editForm" label-width="90px" :rules="formRules" ref="editFormRef">
        <ElFormItem label="所属项目" prop="projectId" required>
          <ElSelect v-model="editForm.projectId" placeholder="请选择所属项目" class="w-full">
            <ElOption label="山海经动画" value="proj-001" />
            <ElOption label="品牌宣传片" value="proj-002" />
            <ElOption label="产品发布视频" value="proj-003" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="剪辑名称" prop="editName" required>
          <ElInput v-model="editForm.editName" placeholder="请输入剪辑名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述（可选）"
          />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="分辨率">
              <ElSelect v-model="editForm.resolution" placeholder="选择分辨率" class="w-full">
                <ElOption label="1920x1080 (1080p)" value="1920x1080" />
                <ElOption label="2560x1440 (2K)" value="2560x1440" />
                <ElOption label="3840x2160 (4K)" value="3840x2160" />
                <ElOption label="1280x720 (720p)" value="1280x720" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="帧率">
              <ElSelect v-model="editForm.frameRate" placeholder="选择帧率" class="w-full">
                <ElOption label="24fps" :value="24" />
                <ElOption label="30fps" :value="30" />
                <ElOption label="60fps" :value="60" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
      <template #footer>
        <ElButton @click="formVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="handleSubmitForm">
          {{ isEdit ? '保存' : '创建' }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    fetchGetEditProjectList,
    fetchGetEditProjectDetail,
    fetchCreateEditProject,
    fetchUpdateEditProject,
    fetchDeleteEditProject
  } from '@/api/editor'

  defineOptions({ name: 'EditorEditManage' })

  type EditStatus = 'draft' | 'processing' | 'completed' | 'exporting' | 'exported'
  type AssetType = 'image' | 'video' | 'audio'

  interface EditProjectVO {
    id: string
    projectId: string
    projectName: string
    editName: string
    description: string
    status: EditStatus
    resolution: string
    frameRate: number
    durationSeconds: number
    segmentCount: number
    createdBy: string
    creatorName: string
    createTime: string
    updateTime: string
    segments?: EditSegmentVO[]
  }

  interface EditSegmentVO {
    id: string
    editProjectId: string
    storyboardId: string
    assetId: string
    assetUrl: string
    assetType: AssetType
    startTime: number
    endTime: number
    duration: number
    orderIndex: number
    transition: string
    volume: number
    speed: number
    filters: string[]
    createTime: string
  }

  const searchQuery = ref('')
  const statusFilter = ref<EditStatus | ''>('')
  const detailVisible = ref(false)
  const formVisible = ref(false)
  const isEdit = ref(false)
  const submitting = ref(false)
  const editFormRef = ref<FormInstance>()
  const currentProject = ref<EditProjectVO | null>(null)

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusTagMap: Record<EditStatus, 'info' | 'primary' | 'success' | 'warning' | 'danger'> = {
    draft: 'info',
    processing: 'primary',
    completed: 'success',
    exporting: 'warning',
    exported: 'danger'
  }

  const statusLabelMap: Record<EditStatus, string> = {
    draft: '草稿',
    processing: '处理中',
    completed: '已完成',
    exporting: '导出中',
    exported: '已导出'
  }

  const statusIconMap: Record<EditStatus, string> = {
    draft: 'ri:draft-line',
    processing: 'ri:loader-4-line',
    completed: 'ri:check-line',
    exporting: 'ri:upload-cloud-line',
    exported: 'ri:download-line'
  }

  const assetTypeTagMap: Record<AssetType, 'primary' | 'success' | 'warning'> = {
    image: 'primary',
    video: 'success',
    audio: 'warning'
  }

  const assetTypeLabelMap: Record<AssetType, string> = {
    image: '图片',
    video: '视频',
    audio: '音频'
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'editName', label: '剪辑名称', minWidth: 220 },
    { prop: 'status', label: '状态', width: 120 },
    { prop: 'resolution', label: '分辨率', width: 120 },
    { prop: 'frameRate', label: '帧率', width: 80 },
    { prop: 'durationSeconds', label: '时长', width: 100 },
    { prop: 'segmentCount', label: '片段数', width: 80 },
    { prop: 'creatorName', label: '创建者', width: 100 },
    { prop: 'updateTime', label: '更新时间', width: 160 },
    { prop: 'operation', label: '操作', width: 220, fixed: 'right' }
  ]

  const editForm = reactive({
    id: '',
    projectId: '',
    editName: '',
    description: '',
    resolution: '1920x1080',
    frameRate: 30
  })

  const formRules: FormRules = {
    projectId: [{ required: true, message: '请选择所属项目', trigger: 'change' }],
    editName: [{ required: true, message: '请输入剪辑名称', trigger: 'blur' }]
  }

  const projectList = ref<EditProjectVO[]>([])
  const loading = ref(false)

  const loadProjectList = async () => {
    loading.value = true
    try {
      const res = await fetchGetEditProjectList()
      if (res && res.records) {
        projectList.value = res.records as EditProjectVO[]
        pagination.total = res.total || res.records.length
      }
    } catch {
      ElMessage.error('加载剪辑项目列表失败')
    } finally {
      loading.value = false
    }
  }

  const segmentList = computed<EditSegmentVO[]>(() => {
    if (!currentProject.value) return []
    return currentProject.value.segments || []
  })

  const statusStats = computed(() => {
    const stats = [
      {
        status: 'draft' as EditStatus,
        label: '草稿',
        icon: 'ri:draft-line',
        bgColor: '#f4f4f5',
        color: '#909399'
      },
      {
        status: 'processing' as EditStatus,
        label: '处理中',
        icon: 'ri:loader-4-line',
        bgColor: '#ecf5ff',
        color: '#409eff'
      },
      {
        status: 'completed' as EditStatus,
        label: '已完成',
        icon: 'ri:check-line',
        bgColor: '#f0f9eb',
        color: '#67c23a'
      },
      {
        status: 'exporting' as EditStatus,
        label: '导出中',
        icon: 'ri:upload-cloud-line',
        bgColor: '#fdf6ec',
        color: '#e6a23c'
      },
      {
        status: 'exported' as EditStatus,
        label: '已导出',
        icon: 'ri:download-line',
        bgColor: '#fef0f0',
        color: '#f56c6c'
      }
    ]
    return stats.map((s) => ({
      ...s,
      count: projectList.value.filter((p) => p.status === s.status).length
    }))
  })

  const filteredProjects = computed(() => {
    let result = projectList.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.editName.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.creatorName.toLowerCase().includes(q)
      )
    }
    if (statusFilter.value) {
      result = result.filter((item) => item.status === statusFilter.value)
    }
    return result
  })

  const pagedProjects = computed(() => {
    const list = filteredProjects.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  watch(filteredProjects, (list) => {
    pagination.total = list.length
  })

  const formatSeconds = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0')
    return `${m}:${s}`
  }

  const formatDateTime = (iso: string): string => {
    if (!iso) return '-'
    const d = new Date(iso)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  const handleSelectionChange = (selection: EditProjectVO[]) => {
    console.log('选中项目:', selection)
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const handleFilterByStatus = (status: EditStatus) => {
    statusFilter.value = statusFilter.value === status ? '' : status
  }

  const handleCreateProject = () => {
    isEdit.value = false
    editForm.id = ''
    editForm.projectId = ''
    editForm.editName = ''
    editForm.description = ''
    editForm.resolution = '1920x1080'
    editForm.frameRate = 30
    formVisible.value = true
  }

  const handleEditProject = (row: EditProjectVO) => {
    isEdit.value = true
    editForm.id = row.id
    editForm.projectId = row.projectId
    editForm.editName = row.editName
    editForm.description = row.description
    editForm.resolution = row.resolution
    editForm.frameRate = row.frameRate
    formVisible.value = true
  }

  const handleSubmitForm = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        submitting.value = true
        try {
          if (isEdit.value) {
            await fetchUpdateEditProject(editForm.id, {
              editName: editForm.editName,
              description: editForm.description,
              resolution: editForm.resolution,
              frameRate: editForm.frameRate
            })
            ElMessage.success('剪辑项目已更新')
          } else {
            const projectNames: Record<string, string> = {
              'proj-001': '山海经动画',
              'proj-002': '品牌宣传片',
              'proj-003': '产品发布视频'
            }
            await fetchCreateEditProject({
              projectId: editForm.projectId,
              projectName: projectNames[editForm.projectId] || '',
              editName: editForm.editName,
              description: editForm.description,
              resolution: editForm.resolution,
              frameRate: editForm.frameRate
            })
            ElMessage.success('剪辑项目已创建')
          }
          await loadProjectList()
          formVisible.value = false
        } catch {
          ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
        } finally {
          submitting.value = false
        }
      }
    })
  }

  const detailLoading = ref(false)

  const handleViewDetail = async (row: EditProjectVO) => {
    detailLoading.value = true
    try {
      const detail = await fetchGetEditProjectDetail(row.id)
      if (detail) {
        currentProject.value = {
          ...row,
          ...detail,
          segments: (detail as any).segments || []
        } as EditProjectVO
      } else {
        currentProject.value = row
      }
    } catch {
      currentProject.value = row
    } finally {
      detailLoading.value = false
    }
    detailVisible.value = true
  }

  const handleDelete = async (row: EditProjectVO) => {
    try {
      await ElMessageBox.confirm(`确定要删除剪辑项目「${row.editName}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteEditProject(row.id)
      ElMessage.success('删除成功')
      await loadProjectList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  const handleExport = (row: EditProjectVO) => {
    ElMessageBox.confirm(`确定要导出剪辑项目「${row.editName}」吗？`, '导出确认', {
      confirmButtonText: '确定导出',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      ElMessage.success('导出任务已提交')
    })
  }

  onMounted(() => {
    loadProjectList()
  })
</script>

<style lang="scss" scoped>
  .editor-edit-manage-page {
    height: 100%;
  }

  .status-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
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

  .edit-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;

    &.draft {
      background: var(--el-fill-color-lighter);
      color: var(--el-text-color-secondary);
    }

    &.processing {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.completed {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }

    &.exporting {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }

    &.exported {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }
</style>
