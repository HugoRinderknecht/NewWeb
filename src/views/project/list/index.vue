<template>
  <div class="project-list-page art-full-height">
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <span class="text-lg font-medium">项目列表</span>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索项目名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterStatus" placeholder="状态筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElSelect v-model="filterType" placeholder="类型筛选" clearable style="width: 140px">
              <ElOption
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <ElButton type="primary" @click="handleCreate">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              创建项目
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <div class="flex-cb mb-4">
        <ElSpace>
          <ElRadioGroup v-model="viewMode">
            <ElRadioButton value="card">
              <ArtSvgIcon icon="ri:layout-grid-line" />
            </ElRadioButton>
            <ElRadioButton value="list">
              <ArtSvgIcon icon="ri:list-check" />
            </ElRadioButton>
          </ElRadioGroup>
          <ElDropdown @command="handleBatchCommand">
            <ElButton :disabled="selectedProjects.length === 0">
              批量操作
              <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-1" />
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="archive">批量归档</ElDropdownItem>
                <ElDropdownItem command="restore">批量恢复</ElDropdownItem>
                <ElDropdownItem command="delete" divided>批量删除</ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
        <ElSpace>
          <ElButton link @click="handleSort('name')">
            名称
            <ArtSvgIcon
              :icon="
                sortField === 'name' && sortOrder === 'asc'
                  ? 'ri:arrow-up-line'
                  : 'ri:arrow-down-line'
              "
              class="ml-1"
            />
          </ElButton>
          <ElButton link @click="handleSort('updateTime')">
            更新时间
            <ArtSvgIcon
              :icon="
                sortField === 'updateTime' && sortOrder === 'asc'
                  ? 'ri:arrow-up-line'
                  : 'ri:arrow-down-line'
              "
              class="ml-1"
            />
          </ElButton>
        </ElSpace>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="project-card-grid">
        <ElCard
          v-for="item in pagedList"
          :key="item.id"
          class="project-card"
          shadow="hover"
          @click="handleView(item)"
        >
          <div class="project-card-cover">
            <ElImage :src="item.cover" fit="cover" class="cover-image">
              <template #error>
                <div class="cover-placeholder flex-cc">
                  <ArtSvgIcon icon="ri:image-line" class="text-3xl text-g-400" />
                </div>
              </template>
            </ElImage>
            <ElTag :type="statusTypeMap[item.status]" size="small" class="cover-status">
              {{ statusLabelMap[item.status] }}
            </ElTag>
          </div>
          <div class="project-card-body">
            <h4 class="project-name">{{ item.name }}</h4>
            <p class="project-desc">{{ item.description }}</p>
            <div class="project-meta">
              <ElSpace>
                <span class="meta-item">
                  <ArtSvgIcon icon="ri:user-line" class="text-g-400" />
                  {{ item.manager }}
                </span>
                <span class="meta-item">
                  <ArtSvgIcon icon="ri:folder-line" class="text-g-400" />
                  {{ item.type }}
                </span>
              </ElSpace>
            </div>
            <ElProgress
              :percentage="item.progress"
              :color="item.progressColor"
              :stroke-width="4"
              class="project-progress"
            />
            <div class="project-footer flex-cb">
              <span class="update-time">{{ item.updateTime }}</span>
              <ElSpace>
                <ElButton type="primary" link size="small" @click.stop="handleEdit(item)">
                  编辑
                </ElButton>
                <ElButton type="info" link size="small" @click.stop="handleCopy(item)">
                  复制
                </ElButton>
                <ElButton
                  v-if="item.status !== 'archived'"
                  type="warning"
                  link
                  size="small"
                  @click.stop="handleArchive(item)"
                >
                  归档
                </ElButton>
                <ElButton v-else type="success" link size="small" @click.stop="handleRestore(item)">
                  恢复
                </ElButton>
                <ElButton type="danger" link size="small" @click.stop="handleDelete(item)">
                  删除
                </ElButton>
              </ElSpace>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 列表视图 -->
      <ArtTable
        v-else
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="项目名称" min-width="200">
            <template #default="scope">
              <div class="flex-c">
                <ElImage :src="scope.row.cover" class="size-10 rounded-md mr-3" fit="cover">
                  <template #error>
                    <div class="size-10 rounded-md bg-g-200 flex-cc">
                      <ArtSvgIcon icon="ri:image-line" class="text-g-400" />
                    </div>
                  </template>
                </ElImage>
                <div>
                  <div class="font-medium">{{ scope.row.name }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.description }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="type" label="类型" width="120" />
          <ElTableColumn prop="manager" label="负责人" width="120" />
          <ElTableColumn label="进度" width="180">
            <template #default="scope">
              <ElProgress
                :percentage="scope.row.progress"
                :color="scope.row.progressColor"
                :stroke-width="4"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="100">
            <template #default="scope">
              <ElTag :type="statusTypeMap[scope.row.status as ProjectStatus]" size="small">
                {{ statusLabelMap[scope.row.status as ProjectStatus] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="updateTime" label="更新时间" width="160" sortable />
          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="scope">
              <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                查看
              </ElButton>
              <ElButton type="info" link size="small" @click="handleCopy(scope.row)">
                复制
              </ElButton>
              <ElButton
                v-if="scope.row.status === 'archived'"
                type="success"
                link
                size="small"
                @click="handleRestore(scope.row)"
              >
                恢复
              </ElButton>
              <ElButton
                v-else-if="scope.row.status !== 'archived'"
                type="warning"
                link
                size="small"
                @click="handleArchive(scope.row)"
              >
                归档
              </ElButton>
              <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
                编辑
              </ElButton>
              <ElButton type="danger" link size="small" @click="handleDelete(scope.row)">
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </template>
      </ArtTable>

      <!-- 卡片视图分页 -->
      <div v-if="viewMode === 'card'" class="pagination-wrapper">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[8, 12, 24, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </ElCard>

    <!-- 创建项目弹窗 -->
    <ElDialog
      v-model="createDialogVisible"
      title="创建项目"
      width="720px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
    >
      <ProjectForm ref="createFormRef" :is-create="true" />
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleCreateSubmit">创建项目</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import ProjectForm from '../components/ProjectForm.vue'
  import {
    fetchGetProjectList,
    fetchCreateProject,
    fetchDeleteProject,
    fetchArchiveProject,
    fetchRestoreProject,
    fetchCopyProject
  } from '@/api/project'

  defineOptions({ name: 'ProjectList' })

  type ProjectStatus = 'progress' | 'completed' | 'paused' | 'archived'
  type ProjectType = 'animation' | 'video' | 'audio' | 'storyboard' | 'script'

  interface ProjectItem {
    id: string
    name: string
    description: string
    type: string
    typeValue: ProjectType
    manager: string
    status: ProjectStatus
    progress: number
    progressColor: string
    cover: string
    updateTime: string
    createTime: string
    memberCount: number
    assetCount: number
  }

  const router = useRouter()

  const statusOptions = [
    { label: '进行中', value: 'progress' },
    { label: '已完成', value: 'completed' },
    { label: '已暂停', value: 'paused' },
    { label: '已归档', value: 'archived' }
  ]

  const typeOptions = [
    { label: '动画制作', value: 'animation' },
    { label: '视频制作', value: 'video' },
    { label: '音频制作', value: 'audio' },
    { label: '分镜管理', value: 'storyboard' },
    { label: '剧本管理', value: 'script' }
  ]

  const statusTypeMap: Record<ProjectStatus, 'primary' | 'success' | 'warning' | 'info'> = {
    progress: 'primary',
    completed: 'success',
    paused: 'warning',
    archived: 'info'
  }

  const statusLabelMap: Record<ProjectStatus, string> = {
    progress: '进行中',
    completed: '已完成',
    paused: '已暂停',
    archived: '已归档'
  }

  const typeLabelMap: Record<ProjectType, string> = {
    animation: '动画制作',
    video: '视频制作',
    audio: '音频制作',
    storyboard: '分镜管理',
    script: '剧本管理'
  }

  const searchQuery = ref('')
  const filterStatus = ref<ProjectStatus | ''>('')
  const filterType = ref<ProjectType | ''>('')
  const viewMode = ref<'card' | 'list'>('card')
  const sortField = ref<'name' | 'updateTime'>('updateTime')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  const selectedProjects = ref<ProjectItem[]>([])
  const createDialogVisible = ref(false)
  const createFormRef = ref<InstanceType<typeof ProjectForm>>()
  const projectList = ref<ProjectItem[]>([])
  const loading = ref(false)

  const pagination = reactive({
    current: 1,
    size: 12,
    total: 0
  })

  // 加载项目列表
  const loadProjectList = async () => {
    loading.value = true
    try {
      const res = await fetchGetProjectList({
        current: pagination.current,
        size: pagination.size,
        keyword: searchQuery.value || undefined,
        type: filterType.value || undefined
      } as any)
      if (res) {
        projectList.value = (res.records || []).map((item: any) => ({
          id: item.id,
          name: item.projectName || item.name,
          description: item.description || '',
          type: typeLabelMap[item.type as ProjectType] || item.type || '动画制作',
          typeValue: (item.type as ProjectType) || 'animation',
          manager: item.manager || item.ownerName || '未知',
          status: mapApiStatus(item.status),
          progress: item.progress || 0,
          progressColor: getProgressColor(item.progress || 0),
          cover: item.coverImage || item.coverUrl || item.cover || '',
          updateTime: item.updateTime || item.updatedAt || '',
          createTime: item.createTime || item.createdAt || '',
          memberCount: item.memberCount || 0,
          assetCount: item.assetCount || 0
        }))
        pagination.total = res.total || 0
      }
    } catch (error) {
      console.error('加载项目列表失败:', error)
      ElMessage.error('加载项目列表失败')
    } finally {
      loading.value = false
    }
  }

  // 映射API状态到前端状态
  const mapApiStatus = (status: any): ProjectStatus => {
    const statusMap: Record<string, ProjectStatus> = {
      '0': 'progress',
      '1': 'completed',
      '2': 'paused',
      '3': 'archived',
      progress: 'progress',
      completed: 'completed',
      paused: 'paused',
      archived: 'archived'
    }
    return statusMap[String(status)] || 'progress'
  }

  // 获取进度条颜色
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#67c23a'
    if (progress >= 60) return 'var(--art-primary)'
    return '#e6a23c'
  }

  // 初始化加载
  onMounted(() => {
    loadProjectList()
  })

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '项目名称', minWidth: 200 },
    { prop: 'type', label: '类型', width: 120 },
    { prop: 'manager', label: '负责人', width: 120 },
    { prop: 'progress', label: '进度', width: 180 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'updateTime', label: '更新时间', width: 160, sortable: true },
    { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
  ]

  const filteredList = computed(() => {
    let result = projectList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      )
    }

    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }

    if (filterType.value) {
      result = result.filter((item) => item.typeValue === filterType.value)
    }

    result = [...result].sort((a, b) => {
      if (sortField.value === 'name') {
        return sortOrder.value === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      return sortOrder.value === 'asc'
        ? a.updateTime.localeCompare(b.updateTime)
        : b.updateTime.localeCompare(a.updateTime)
    })

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

  const handleSort = (field: 'name' | 'updateTime') => {
    if (sortField.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortOrder.value = 'desc'
    }
  }

  const handleSelectionChange = (selection: ProjectItem[]) => {
    selectedProjects.value = selection
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadProjectList()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadProjectList()
  }

  const handleCreate = () => {
    createDialogVisible.value = true
    nextTick(() => {
      createFormRef.value?.reset()
    })
  }

  const handleCreateSubmit = async () => {
    const valid = await createFormRef.value?.validate()
    if (!valid) return

    const form = createFormRef.value?.form
    if (!form) return

    try {
      await fetchCreateProject({
        projectName: form.name,
        description: form.description,
        type: form.type,
        manager: form.manager
      })
      ElMessage.success('项目创建成功')
      createDialogVisible.value = false
      createFormRef.value?.reset()
      loadProjectList()
    } catch (error) {
      console.error('创建项目失败:', error)
      ElMessage.error('创建项目失败')
    }
  }

  const handleView = (row: ProjectItem) => {
    router.push(`/project/edit?id=${row.id}`)
  }

  const handleEdit = (row: ProjectItem) => {
    router.push(`/project/edit?id=${row.id}`)
  }

  const handleDelete = (row: ProjectItem) => {
    ElMessageBox.confirm(`确定要删除项目「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteProject(row.id)
        ElMessage.success('删除成功')
        loadProjectList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleBatchCommand = (command: string) => {
    if (selectedProjects.value.length === 0) {
      ElMessage.warning('请先选择项目')
      return
    }
    const names = selectedProjects.value.map((p) => p.name).join('、')
    if (command === 'archive') {
      ElMessageBox.confirm(
        `确定要归档以下 ${selectedProjects.value.length} 个项目吗？\n${names}`,
        '批量归档',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          for (const p of selectedProjects.value) {
            await fetchArchiveProject(p.id)
          }
          ElMessage.success('归档成功')
          loadProjectList()
        } catch {
          ElMessage.error('归档失败')
        }
      })
    } else if (command === 'restore') {
      ElMessageBox.confirm(
        `确定要恢复以下 ${selectedProjects.value.length} 个项目吗？\n${names}`,
        '批量恢复',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).then(async () => {
        try {
          for (const p of selectedProjects.value) {
            await fetchRestoreProject(p.id)
          }
          ElMessage.success('恢复成功')
          loadProjectList()
        } catch {
          ElMessage.error('恢复失败')
        }
      })
    } else if (command === 'delete') {
      ElMessageBox.confirm(
        `确定要删除以下 ${selectedProjects.value.length} 个项目吗？\n${names}`,
        '批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
      ).then(async () => {
        try {
          for (const p of selectedProjects.value) {
            await fetchDeleteProject(p.id)
          }
          ElMessage.success('删除成功')
          loadProjectList()
        } catch {
          ElMessage.error('删除失败')
        }
      })
    }
  }

  const handleCopy = (row: ProjectItem) => {
    ElMessageBox.confirm(`确定要复制项目「${row.name}」吗？`, '复制确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        await fetchCopyProject(row.id, `${row.name} - 副本`)
        ElMessage.success('项目复制成功')
        loadProjectList()
      } catch {
        ElMessage.error('复制失败')
      }
    })
  }

  const handleArchive = (row: ProjectItem) => {
    ElMessageBox.confirm(`确定要归档项目「${row.name}」吗？`, '归档确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchArchiveProject(row.id)
        ElMessage.success('项目已归档')
        loadProjectList()
      } catch {
        ElMessage.error('归档失败')
      }
    })
  }

  const handleRestore = (row: ProjectItem) => {
    ElMessageBox.confirm(`确定要恢复项目「${row.name}」吗？`, '恢复确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        await fetchRestoreProject(row.id)
        ElMessage.success('项目已恢复')
        loadProjectList()
      } catch {
        ElMessage.error('恢复失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .project-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding-bottom: 16px;
  }

  .project-card {
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .project-card-cover {
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
    }

    .cover-status {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }

  .project-card-body {
    padding: 12px;

    .project-name {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--el-text-color-primary);
    }

    .project-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 10px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-meta {
      margin-bottom: 10px;

      .meta-item {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
    }

    .project-progress {
      margin-bottom: 10px;
    }

    .project-footer {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding-top: 16px;
  }
</style>
