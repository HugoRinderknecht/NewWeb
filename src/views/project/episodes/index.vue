<template>
  <div class="project-episodes-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">集数管理</span>
            <ElTag type="info" size="small">山海经·异兽录</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索集数名称"
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
            <ElButton type="primary" @click="handleCreateEpisode">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建集数
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="16" class="h-full">
        <!-- 集数列表 -->
        <ElCol :span="8">
          <div class="episode-list">
            <div class="list-header flex-cb mb-4">
              <span class="font-medium">集数列表</span>
              <span class="text-xs text-g-400">共 {{ episodeList.length }} 集</span>
            </div>
            <VueDraggable
              v-model="episodeList"
              class="episode-draggable-list"
              :animation="200"
              ghost-class="episode-ghost"
              chosen-class="episode-chosen"
              @end="handleEpisodeReorder"
            >
              <div
                v-for="ep in filteredEpisodes"
                :key="ep.id"
                :class="['episode-item', { active: currentEpisode?.id === ep.id }]"
                @click="handleEpisodeSelect(ep)"
              >
                <div class="episode-info">
                  <ElTag size="small" type="primary">第{{ ep.number }}集</ElTag>
                  <span class="episode-name">{{ ep.name }}</span>
                  <ElTag :type="statusTypeMap[ep.status as EpisodeStatus]" size="small">
                    {{ statusLabelMap[ep.status as EpisodeStatus] }}
                  </ElTag>
                </div>
                <div class="episode-actions">
                  <ElButton type="primary" link size="small" @click.stop="handleEditEpisode(ep)">
                    <ArtSvgIcon icon="ri:edit-line" />
                  </ElButton>
                  <ElButton type="danger" link size="small" @click.stop="handleDeleteEpisode(ep)">
                    <ArtSvgIcon icon="ri:delete-bin-line" />
                  </ElButton>
                </div>
              </div>
            </VueDraggable>
          </div>
        </ElCol>

        <!-- 镜头列表 -->
        <ElCol :span="16">
          <div class="shot-list">
            <div class="list-header flex-cb mb-4">
              <div class="flex items-center gap-4">
                <span class="font-medium">
                  {{
                    currentEpisode
                      ? `第${currentEpisode.number}集：${currentEpisode.name}`
                      : '请选择集数'
                  }}
                </span>
                <ElTag v-if="currentEpisode" type="info" size="small">
                  {{ currentEpisode.shotCount }} 个镜头
                </ElTag>
              </div>
              <ElButton v-if="currentEpisode" type="primary" size="small" @click="handleCreateShot">
                <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                新建镜头
              </ElButton>
              <ElButton
                v-if="currentEpisode"
                type="danger"
                size="small"
                :disabled="selectedShotIds.length === 0"
                @click="handleDeleteShotAction"
              >
                <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                {{ selectedShotIds.length > 0 ? `删除 (${selectedShotIds.length})` : '删除' }}
              </ElButton>
              <ElButton
                v-if="currentEpisode && selectedShotIds.length > 0"
                size="small"
                @click="selectedShotIds = []"
              >
                <ArtSvgIcon icon="ri:close-line" class="mr-1" />
                取消选择
              </ElButton>
              <ElTooltip content="按住 Ctrl / Cmd 点击可多选镜头">
                <ArtSvgIcon icon="ri:information-line" class="text-g-400 cursor-help" />
              </ElTooltip>
              <ElButton
                v-if="currentEpisode"
                type="success"
                size="small"
                @click="handleGoToStoryboard"
              >
                <ArtSvgIcon icon="ri:layout-masonry-line" class="mr-1" />
                查看分镜
              </ElButton>
            </div>

            <VueDraggable
              v-if="currentEpisode"
              v-model="currentEpisodeShots"
              class="shot-draggable-list"
              :animation="200"
              ghost-class="shot-ghost"
              chosen-class="shot-chosen"
              @end="handleShotReorder"
            >
              <div
                v-for="shot in currentEpisodeShots"
                :key="shot.id"
                :class="['shot-item', { selected: selectedShotIds.includes(shot.id) }]"
                @click="handleShotSelect(shot, $event)"
              >
                <div class="shot-main">
                  <div class="shot-icon">
                    <ArtSvgIcon icon="ri:movie-line" />
                  </div>
                  <div class="shot-content">
                    <div class="shot-header">
                      <span class="shot-code">{{ shot.code }}</span>
                      <ElTag :type="shotStatusTypeMap[shot.status as ShotStatus]" size="small">
                        {{ shotStatusLabelMap[shot.status as ShotStatus] }}
                      </ElTag>
                    </div>
                    <div class="shot-desc text-g-400">{{ shot.description }}</div>
                  </div>
                </div>
                <div class="shot-meta">
                  <span class="text-g-400">{{ shot.duration }}s</span>
                  <span class="text-g-400">{{ shot.updateTime }}</span>
                </div>
                <div class="shot-actions">
                  <ElButton type="primary" link size="small" @click="handleEditShot(shot)">
                    <ArtSvgIcon icon="ri:edit-line" />
                  </ElButton>
                  <ElButton type="danger" link size="small" @click="handleDeleteShot(shot)">
                    <ArtSvgIcon icon="ri:delete-bin-line" />
                  </ElButton>
                </div>
              </div>
            </VueDraggable>

            <ElEmpty v-else description="请选择左侧集数查看镜头" />
          </div>
        </ElCol>
      </ElRow>
    </ElCard>

    <!-- 新建/编辑集数弹窗 -->
    <ElDialog
      v-model="episodeDialogVisible"
      :title="isEditEpisode ? '编辑集数' : '新建集数'"
      width="520px"
      align-center
      destroy-on-close
    >
      <ElForm ref="episodeFormRef" :model="episodeForm" :rules="episodeRules" label-width="100px">
        <ElFormItem label="集数" prop="number">
          <ElInputNumber v-model="episodeForm.number" :min="1" :max="999" />
        </ElFormItem>
        <ElFormItem label="集数名称" prop="name">
          <ElInput v-model="episodeForm.name" placeholder="请输入集数名称" />
        </ElFormItem>
        <ElFormItem label="简介">
          <ElInput
            v-model="episodeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入集数简介"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="episodeDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEpisodeSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 新建/编辑镜头弹窗 -->
    <ElDialog
      v-model="shotDialogVisible"
      :title="isEditShot ? '编辑镜头' : '新建镜头'"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="shotFormRef" :model="shotForm" :rules="shotRules" label-width="100px">
        <ElFormItem label="镜头编号" prop="code">
          <ElInput v-model="shotForm.code" placeholder="请输入镜头编号，如 SC-001" />
        </ElFormItem>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="shotForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入镜头描述"
          />
        </ElFormItem>
        <ElFormItem label="时长(秒)" prop="duration">
          <ElInputNumber v-model="shotForm.duration" :min="1" :max="300" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="shotForm.status" placeholder="请选择状态" style="width: 100%">
            <ElOption
              v-for="item in shotStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="shotDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleShotSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { VueDraggable } from 'vue-draggable-plus'
  import { useRouter } from 'vue-router'
  import {
    fetchGetProjectEpisodes,
    fetchCreateEpisode,
    fetchUpdateEpisode,
    fetchDeleteEpisode
  } from '@/api/script'

  defineOptions({ name: 'ProjectEpisodes' })

  const router = useRouter()
  const route = useRoute()

  type EpisodeStatus = 'pending' | 'progress' | 'completed'
  type ShotStatus = 'pending' | 'storyboard' | 'firstframe' | 'video' | 'completed'

  interface EpisodeItem {
    id: number
    number: number
    name: string
    description: string
    status: EpisodeStatus
    shotCount: number
    updateTime: string
  }

  interface ShotItem {
    id: number
    episodeId: number
    code: string
    description: string
    duration: number
    status: ShotStatus
    updateTime: string
  }

  const searchQuery = ref('')
  const filterStatus = ref<EpisodeStatus | ''>('')
  const currentEpisode = ref<EpisodeItem | null>(null)
  const shotLoading = ref(false)
  const episodeDialogVisible = ref(false)
  const shotDialogVisible = ref(false)
  const isEditShot = ref(false)
  const isEditEpisode = ref(false)
  const currentShotId = ref<number | null>(null)
  const currentEditEpisodeId = ref<number | null>(null)
  const selectedShotIds = ref<number[]>([])

  const episodeFormRef = ref<FormInstance>()
  const shotFormRef = ref<FormInstance>()

  const statusOptions = [
    { label: '待开始', value: 'pending' },
    { label: '进行中', value: 'progress' },
    { label: '已完成', value: 'completed' }
  ]

  const shotStatusOptions = [
    { label: '待开始', value: 'pending' },
    { label: '分镜中', value: 'storyboard' },
    { label: '首帧图', value: 'firstframe' },
    { label: '视频中', value: 'video' },
    { label: '已完成', value: 'completed' }
  ]

  const statusTypeMap: Record<EpisodeStatus, 'info' | 'primary' | 'success'> = {
    pending: 'info',
    progress: 'primary',
    completed: 'success'
  }

  const statusLabelMap: Record<EpisodeStatus, string> = {
    pending: '待开始',
    progress: '进行中',
    completed: '已完成'
  }

  const shotStatusTypeMap: Record<ShotStatus, 'info' | 'warning' | 'primary' | 'success'> = {
    pending: 'info',
    storyboard: 'warning',
    firstframe: 'primary',
    video: 'primary',
    completed: 'success'
  }

  const shotStatusLabelMap: Record<ShotStatus, string> = {
    pending: '待开始',
    storyboard: '分镜中',
    firstframe: '首帧图',
    video: '视频中',
    completed: '已完成'
  }

  const episodeList = ref<EpisodeItem[]>([])

  const shotList = ref<ShotItem[]>([])

  const loadEpisodeList = async () => {
    const projectId = (route.query.id as string) || (route.params.projectId as string) || '1'
    try {
      const data = await fetchGetProjectEpisodes(projectId)
      if (data) {
        const list = Array.isArray(data) ? data : (data as any).records || []
        episodeList.value = list.map((item: any) => ({
          id: Number(item.id) || 0,
          number: item.episodeNumber || item.number || 0,
          name: item.title || item.name || '',
          description: item.synopsis || item.description || '',
          status: mapEpisodeStatus(item.status),
          shotCount: item.shotCount || 0,
          updateTime: item.updateTime || ''
        })) as EpisodeItem[]
      }
    } catch {
      episodeList.value = []
    }
  }

  const mapEpisodeStatus = (status: string): EpisodeStatus => {
    const map: Record<string, EpisodeStatus> = {
      completed: 'completed',
      writing: 'progress',
      draft: 'pending',
      progress: 'progress',
      pending: 'pending'
    }
    return map[status] || 'pending'
  }

  const filteredEpisodes = computed(() => {
    let result = episodeList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      )
    }

    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }

    return result
  })

  const currentEpisodeShots = computed({
    get: () => {
      if (!currentEpisode.value) return []
      return shotList.value.filter((item) => item.episodeId === currentEpisode.value!.id)
    },
    set: (val) => {
      if (!currentEpisode.value) return
      const otherShots = shotList.value.filter(
        (item) => item.episodeId !== currentEpisode.value!.id
      )
      shotList.value = [...otherShots, ...val]
    }
  })

  const handleEpisodeSelect = (row: EpisodeItem) => {
    if (!row) return
    shotLoading.value = true
    currentEpisode.value = row
    setTimeout(() => {
      shotLoading.value = false
    }, 300)
  }

  const handleEpisodeReorder = () => {
    // 重新分配集数序号
    episodeList.value = episodeList.value.map((item, index) => ({
      ...item,
      number: index + 1
    }))
    ElMessage.success('集数顺序已更新')
  }

  const handleShotReorder = () => {
    ElMessage.success('镜头顺序已更新')
  }

  // 新建集数
  const episodeForm = reactive({
    number: 1,
    name: '',
    description: ''
  })

  const episodeRules: FormRules = {
    number: [{ required: true, message: '请输入集数', trigger: 'blur' }],
    name: [{ required: true, message: '请输入集数名称', trigger: 'blur' }]
  }

  const handleCreateEpisode = () => {
    isEditEpisode.value = false
    currentEditEpisodeId.value = null
    episodeForm.number = episodeList.value.length + 1
    episodeForm.name = ''
    episodeForm.description = ''
    episodeDialogVisible.value = true
  }

  const handleEditEpisode = (row: EpisodeItem) => {
    isEditEpisode.value = true
    currentEditEpisodeId.value = row.id
    episodeForm.number = row.number
    episodeForm.name = row.name
    episodeForm.description = row.description
    episodeDialogVisible.value = true
  }

  const handleDeleteEpisode = (row: EpisodeItem) => {
    ElMessageBox.confirm(`确定要删除第${row.number}集「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        const projectId = (route.query.id as string) || (route.params.projectId as string) || '1'
        await fetchDeleteEpisode(projectId, String(row.id))
        if (currentEpisode.value?.id === row.id) {
          currentEpisode.value = null
        }
        ElMessage.success('删除成功')
        await loadEpisodeList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleEpisodeSubmit = async () => {
    if (!episodeFormRef.value) return
    await episodeFormRef.value.validate(async (valid) => {
      if (valid) {
        const projectId = (route.query.id as string) || (route.params.projectId as string) || '1'
        try {
          if (isEditEpisode.value && currentEditEpisodeId.value) {
            await fetchUpdateEpisode(projectId, String(currentEditEpisodeId.value), {
              title: episodeForm.name,
              synopsis: episodeForm.description,
              episodeNumber: episodeForm.number
            })
            ElMessage.success('集数编辑成功')
          } else {
            await fetchCreateEpisode(projectId, {
              title: episodeForm.name,
              synopsis: episodeForm.description,
              episodeNumber: episodeForm.number
            })
            ElMessage.success('集数创建成功')
          }
          episodeDialogVisible.value = false
          await loadEpisodeList()
        } catch {
          ElMessage.error(isEditEpisode.value ? '集数编辑失败' : '集数创建失败')
        }
      }
    })
  }

  // 镜头管理
  const shotForm = reactive({
    code: '',
    description: '',
    duration: 5,
    status: 'pending' as ShotStatus
  })

  const shotRules: FormRules = {
    code: [{ required: true, message: '请输入镜头编号', trigger: 'blur' }],
    description: [{ required: true, message: '请输入镜头描述', trigger: 'blur' }],
    duration: [{ required: true, message: '请输入时长', trigger: 'blur' }]
  }

  const handleCreateShot = () => {
    isEditShot.value = false
    currentShotId.value = null
    shotForm.code = `SC-${String(shotList.value.filter((s) => s.episodeId === currentEpisode.value?.id).length + 1).padStart(3, '0')}`
    shotForm.description = ''
    shotForm.duration = 5
    shotForm.status = 'pending'
    shotDialogVisible.value = true
  }

  const handleEditShot = (row: ShotItem) => {
    isEditShot.value = true
    currentShotId.value = row.id
    Object.assign(shotForm, row)
    shotDialogVisible.value = true
  }

  const handleShotSubmit = async () => {
    if (!shotFormRef.value) return
    await shotFormRef.value.validate((valid) => {
      if (valid) {
        if (isEditShot.value && currentShotId.value) {
          const index = shotList.value.findIndex((i) => i.id === currentShotId.value)
          if (index !== -1) {
            shotList.value[index] = {
              ...shotList.value[index],
              ...shotForm,
              updateTime: new Date().toISOString().slice(0, 10)
            }
          }
          ElMessage.success('镜头编辑成功')
        } else {
          const newShot: ShotItem = {
            id: Date.now(),
            episodeId: currentEpisode.value!.id,
            code: shotForm.code,
            description: shotForm.description,
            duration: shotForm.duration,
            status: shotForm.status,
            updateTime: new Date().toISOString().slice(0, 10)
          }
          shotList.value.push(newShot)
          const episode = episodeList.value.find((e) => e.id === currentEpisode.value!.id)
          if (episode) episode.shotCount++
          ElMessage.success('镜头创建成功')
        }
        shotDialogVisible.value = false
      }
    })
  }

  const handleDeleteShot = (row: ShotItem) => {
    ElMessageBox.confirm(`确定要删除镜头「${row.code}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      shotList.value = shotList.value.filter((item) => item.id !== row.id)
      selectedShotIds.value = selectedShotIds.value.filter((id) => id !== row.id)
      const episode = episodeList.value.find((e) => e.id === row.episodeId)
      if (episode) episode.shotCount--
      ElMessage.success('删除成功')
    })
  }

  const handleShotSelect = (shot: ShotItem, event?: MouseEvent) => {
    const isCtrl = event?.ctrlKey || event?.metaKey
    if (isCtrl) {
      const index = selectedShotIds.value.indexOf(shot.id)
      if (index > -1) {
        selectedShotIds.value.splice(index, 1)
      } else {
        selectedShotIds.value.push(shot.id)
      }
      return
    }
    selectedShotIds.value = []
  }

  const handleDeleteShotAction = () => {
    if (selectedShotIds.value.length > 0) {
      ElMessageBox.confirm(
        `确定删除选中的 ${selectedShotIds.value.length} 个镜头吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const ids = [...selectedShotIds.value]
        const deletedCount = ids.length
        shotList.value = shotList.value.filter((item) => !ids.includes(item.id))
        selectedShotIds.value = []
        const episode = episodeList.value.find((e) => e.id === currentEpisode.value?.id)
        if (episode) episode.shotCount -= deletedCount
        ElMessage.success(`成功删除 ${deletedCount} 个镜头`)
      })
      return
    }
    ElMessage.warning('请先选中要删除的镜头，按住 Ctrl / Cmd 可多选')
  }

  const handleGoToStoryboard = () => {
    if (!currentEpisode.value) return
    router.push({
      path: '/storyboard/design',
      query: { episodeId: currentEpisode.value.id }
    })
  }

  onMounted(() => {
    loadEpisodeList()
  })
</script>

<style lang="scss" scoped>
  .project-episodes-page {
    .episode-list,
    .shot-list {
      height: 100%;
      overflow: auto;
    }

    .list-header {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .shot-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
      margin-right: 8px;
    }

    .episode-draggable-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .episode-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--custom-radius);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary-light-5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      &.active {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      .episode-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;

        .episode-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .episode-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .episode-actions {
        opacity: 1;
      }
    }

    .episode-ghost {
      opacity: 0.5;
      background: var(--el-color-primary-light-9);
      border: 2px dashed var(--el-color-primary);
    }

    .episode-chosen {
      opacity: 0.8;
    }

    .shot-draggable-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shot-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--custom-radius);
      transition: all 0.2s;

      &:hover {
        border-color: var(--el-color-primary-light-5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      &.selected {
        border-color: var(--el-color-danger-light-5);
        box-shadow: 0 0 0 2px var(--el-color-danger-light-8);
      }

      .shot-main {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;

        .shot-content {
          flex: 1;
          min-width: 0;

          .shot-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 4px;

            .shot-code {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
            }
          }

          .shot-desc {
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .shot-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        margin: 0 16px;
        font-size: 13px;
      }

      .shot-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .shot-actions {
        opacity: 1;
      }
    }

    .shot-ghost {
      opacity: 0.5;
      background: var(--el-color-success-light-9);
      border: 2px dashed var(--el-color-success);
    }

    .shot-chosen {
      opacity: 0.8;
    }
  }
</style>
