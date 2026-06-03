<template>
  <div class="storyboard-batch-edit-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">分镜批量编辑</span>
            <ElTag type="info" size="small">已选中 {{ selectedStoryboards.length }} 个分镜</ElTag>
          </div>
          <ElSpace>
            <ElButton @click="handleClearSelection">
              <ArtSvgIcon icon="ri:close-circle-line" class="mr-1" />
              清空选择
            </ElButton>
            <ElButton
              type="warning"
              :disabled="selectedStoryboards.length === 0"
              @click="handleBatchSubmitReview"
            >
              <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
              批量提交审核
            </ElButton>
            <ElButton
              type="danger"
              :disabled="selectedStoryboards.length === 0"
              @click="handleBatchDelete"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              批量删除
            </ElButton>
            <ElButton
              type="primary"
              :disabled="selectedStoryboards.length === 0"
              @click="handleBatchApply"
            >
              <ArtSvgIcon icon="ri:save-line" class="mr-1" />
              批量应用
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="24">
        <!-- 左侧：选中列表 -->
        <ElCol :span="10" :xs="24">
          <div class="selected-panel">
            <div class="panel-title flex items-center gap-2 mb-4">
              <ArtSvgIcon icon="ri:list-check" />
              <span class="font-medium">已选分镜</span>
              <ElTag size="small" type="primary">{{ selectedStoryboards.length }}</ElTag>
            </div>
            <div class="selected-list">
              <div
                v-for="item in selectedStoryboards"
                :key="item.id"
                class="selected-item"
                :class="{ active: currentEditId === item.id }"
                @click="currentEditId = item.id"
              >
                <div class="item-preview">
                  <img v-if="item.thumbnail" :src="item.thumbnail" class="preview-img" />
                  <div v-else class="preview-placeholder">
                    <ArtSvgIcon icon="ri:image-line" />
                  </div>
                </div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-meta text-xs text-g-400">
                    第 {{ item.episode }} 集 / 镜头 {{ item.shotNumber }}
                  </div>
                  <div class="item-tags">
                    <ElTag
                      v-for="(tag, idx) in item.tags.slice(0, 2)"
                      :key="idx"
                      size="small"
                      type="info"
                      class="mr-1"
                    >
                      {{ tag }}
                    </ElTag>
                  </div>
                </div>
                <ElButton type="danger" link size="small" @click.stop="handleRemoveItem(item)">
                  <ArtSvgIcon icon="ri:close-line" />
                </ElButton>
              </div>
            </div>
          </div>
        </ElCol>

        <!-- 右侧：批量修改表单 -->
        <ElCol :span="14" :xs="24">
          <div class="batch-form-panel">
            <div class="panel-title flex items-center gap-2 mb-4">
              <ArtSvgIcon icon="ri:edit-box-line" />
              <span class="font-medium">批量修改</span>
            </div>

            <ElForm :model="batchForm" label-width="100px" class="batch-form">
              <ElDivider content-position="left">基础信息</ElDivider>

              <ElFormItem label="场景类型">
                <ElSelect
                  v-model="batchForm.sceneType"
                  placeholder="选择场景类型"
                  clearable
                  class="w-full"
                >
                  <ElOption label="室内" value="indoor" />
                  <ElOption label="室外" value="outdoor" />
                  <ElOption label="特效" value="vfx" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="时间">
                <ElSelect
                  v-model="batchForm.timeOfDay"
                  placeholder="选择时间"
                  clearable
                  class="w-full"
                >
                  <ElOption label="白天" value="day" />
                  <ElOption label="夜晚" value="night" />
                  <ElOption label="黄昏" value="dusk" />
                  <ElOption label="黎明" value="dawn" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="镜头类型">
                <ElSelect
                  v-model="batchForm.cameraType"
                  placeholder="选择镜头类型"
                  clearable
                  class="w-full"
                >
                  <ElOption label="特写" value="close-up" />
                  <ElOption label="近景" value="medium" />
                  <ElOption label="全景" value="wide" />
                  <ElOption label="航拍" value="aerial" />
                </ElSelect>
              </ElFormItem>

              <ElDivider content-position="left">标签与状态</ElDivider>

              <ElFormItem label="添加标签">
                <ElSelect
                  v-model="batchForm.addTags"
                  multiple
                  filterable
                  allow-create
                  placeholder="输入或选择标签"
                  class="w-full"
                >
                  <ElOption v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="移除标签">
                <ElSelect
                  v-model="batchForm.removeTags"
                  multiple
                  placeholder="选择要移除的标签"
                  class="w-full"
                >
                  <ElOption v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="审核状态">
                <ElRadioGroup v-model="batchForm.status">
                  <ElRadio value="">不修改</ElRadio>
                  <ElRadio value="pending">待审核</ElRadio>
                  <ElRadio value="approved">已通过</ElRadio>
                  <ElRadio value="rejected">已驳回</ElRadio>
                </ElRadioGroup>
              </ElFormItem>

              <ElDivider content-position="left">备注</ElDivider>

              <ElFormItem label="统一备注">
                <ElInput
                  v-model="batchForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="批量添加备注信息（可选）"
                />
              </ElFormItem>
            </ElForm>

            <!-- 预览区域 -->
            <div v-if="selectedStoryboards.length > 0" class="preview-panel mt-6">
              <div class="preview-title flex items-center gap-2 mb-3">
                <ArtSvgIcon icon="ri:eye-line" />
                <span class="font-medium">修改预览</span>
              </div>
              <ElTable :data="previewList" size="small" border>
                <ElTableColumn prop="name" label="分镜名称" min-width="140" />
                <ElTableColumn label="场景类型" width="100">
                  <template #default>
                    <span v-if="batchForm.sceneType" class="text-primary">
                      {{ sceneTypeLabelMap[batchForm.sceneType as SceneType] }}
                    </span>
                    <span v-else class="text-g-400">-</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="标签变化" min-width="160">
                  <template #default>
                    <div v-if="batchForm.addTags.length > 0 || batchForm.removeTags.length > 0">
                      <ElTag
                        v-for="tag in batchForm.addTags"
                        :key="tag"
                        type="success"
                        size="small"
                        class="mr-1"
                      >
                        +{{ tag }}
                      </ElTag>
                      <ElTag
                        v-for="tag in batchForm.removeTags"
                        :key="tag"
                        type="danger"
                        size="small"
                        class="mr-1"
                      >
                        -{{ tag }}
                      </ElTag>
                    </div>
                    <span v-else class="text-g-400">-</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn label="状态" width="100">
                  <template #default>
                    <ElTag
                      v-if="batchForm.status"
                      :type="getStatusTag(batchForm.status)"
                      size="small"
                    >
                      {{ getStatusLabel(batchForm.status) }}
                    </ElTag>
                    <span v-else class="text-g-400">-</span>
                  </template>
                </ElTableColumn>
              </ElTable>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRoute } from 'vue-router'
  import {
    fetchGetStoryboardList,
    fetchBatchSubmitStoryboardReview,
    fetchBatchDeleteStoryboards,
    fetchUpdateStoryboard
  } from '@/api/storyboard'

  defineOptions({ name: 'StoryboardBatchEdit' })

  const route = useRoute()

  type SceneType = 'indoor' | 'outdoor' | 'vfx'
  type TimeOfDay = 'day' | 'night' | 'dusk' | 'dawn'
  type CameraType = 'close-up' | 'medium' | 'wide' | 'aerial'
  type StatusType = 'pending' | 'approved' | 'rejected'

  interface StoryboardItem {
    id: number
    name: string
    thumbnail: string
    episode: number
    shotNumber: number
    sceneType: SceneType
    timeOfDay: TimeOfDay
    cameraType: CameraType
    tags: string[]
    status: StatusType
    remark: string
  }

  const currentEditId = ref<number | null>(null)

  const batchForm = reactive({
    sceneType: '',
    timeOfDay: '',
    cameraType: '',
    addTags: [] as string[],
    removeTags: [] as string[],
    status: '',
    remark: ''
  })

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    storyboardList.value.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet)
  })

  const sceneTypeLabelMap: Record<SceneType, string> = {
    indoor: '室内',
    outdoor: '室外',
    vfx: '特效'
  }

  const statusTagMap: Record<StatusType, 'warning' | 'success' | 'danger'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }

  const statusLabelMap: Record<StatusType, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }

  const getStatusTag = (status: string) => statusTagMap[status as StatusType] || 'info'
  const getStatusLabel = (status: string) => statusLabelMap[status as StatusType] || status

  const storyboardList = ref<StoryboardItem[]>([])

  const mapStatus = (status: number | string): StatusType => {
    const map: Record<number, StatusType> = {
      1: 'pending',
      2: 'pending',
      3: 'approved',
      4: 'rejected'
    }
    if (typeof status === 'number') return map[status] || 'pending'
    return (status as StatusType) || 'pending'
  }

  const loadStoryboardList = async () => {
    try {
      const projectId = (route.params.projectId as string) || '1'
      const data = await fetchGetStoryboardList(projectId, {
        page: 1,
        pageSize: 100
      })
      if (data) {
        const list = data.records || []
        storyboardList.value = list.map((item: any) => ({
          id: item.id,
          name: item.title ?? item.name ?? '',
          thumbnail: item.thumbnail ?? '',
          episode: item.episodeIndex ?? item.episode ?? 1,
          shotNumber: item.storyboardNo ?? item.shotNumber ?? 1,
          sceneType: item.sceneType ?? 'outdoor',
          timeOfDay: item.timeOfDay ?? 'day',
          cameraType: item.cameraType ?? 'wide',
          tags: item.tags ?? [],
          status: mapStatus(item.status),
          remark: item.remark ?? ''
        })) as StoryboardItem[]
      }
    } catch {
      ElMessage.error('加载分镜列表失败')
    }
  }

  const selectedStoryboards = computed(() => storyboardList.value)

  const previewList = computed(() => {
    return selectedStoryboards.value.slice(0, 5)
  })

  const handleRemoveItem = (item: StoryboardItem) => {
    ElMessageBox.confirm(`确定要从列表中移除「${item.name}」吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      storyboardList.value = storyboardList.value.filter((i) => i.id !== item.id)
      ElMessage.success('已移除')
    })
  }

  const handleClearSelection = () => {
    if (storyboardList.value.length === 0) {
      ElMessage.info('列表已为空')
      return
    }
    ElMessageBox.confirm('确定要清空所有选中的分镜吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      storyboardList.value = []
      ElMessage.success('已清空')
    })
  }

  const handleBatchApply = () => {
    if (selectedStoryboards.value.length === 0) {
      ElMessage.warning('请先选择分镜')
      return
    }

    const hasChanges =
      batchForm.sceneType ||
      batchForm.timeOfDay ||
      batchForm.cameraType ||
      batchForm.addTags.length > 0 ||
      batchForm.removeTags.length > 0 ||
      batchForm.status ||
      batchForm.remark

    if (!hasChanges) {
      ElMessage.warning('请至少设置一项修改内容')
      return
    }

    ElMessageBox.confirm(
      `确定要将修改应用到选中的 ${selectedStoryboards.value.length} 个分镜吗？`,
      '批量应用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    ).then(async () => {
      try {
        const ids = selectedStoryboards.value.map((item) => String(item.id))

        // 如果修改了审核状态为已通过，提交审核
        if (batchForm.status === 'approved') {
          await fetchBatchSubmitStoryboardReview(ids)
        }

        // 逐个更新分镜属性
        const updatePromises = ids.map((id) => {
          const item = storyboardList.value.find((s) => String(s.id) === id)
          if (!item) return Promise.resolve()

          const updateParams: any = {}
          if (batchForm.sceneType) updateParams.title = item.name
          if (batchForm.remark) updateParams.description = batchForm.remark

          // 合并标签变化
          let newTags = [...item.tags]
          if (batchForm.addTags.length > 0) {
            newTags = [...new Set([...newTags, ...batchForm.addTags])]
          }
          if (batchForm.removeTags.length > 0) {
            newTags = newTags.filter((t) => !batchForm.removeTags.includes(t))
          }
          if (JSON.stringify(newTags) !== JSON.stringify(item.tags)) {
            updateParams.tags = newTags
          }

          if (Object.keys(updateParams).length > 0) {
            return fetchUpdateStoryboard(id, updateParams)
          }
          return Promise.resolve()
        })

        await Promise.all(updatePromises)
        await loadStoryboardList()
        ElMessage.success('批量修改已应用')

        batchForm.sceneType = ''
        batchForm.timeOfDay = ''
        batchForm.cameraType = ''
        batchForm.addTags = []
        batchForm.removeTags = []
        batchForm.status = ''
        batchForm.remark = ''
      } catch {
        ElMessage.error('批量操作失败')
      }
    })
  }

  const handleBatchDelete = () => {
    if (selectedStoryboards.value.length === 0) {
      ElMessage.warning('请先选择分镜')
      return
    }
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedStoryboards.value.length} 个分镜吗？此操作不可恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    ).then(async () => {
      try {
        const ids = selectedStoryboards.value.map((item) => String(item.id))
        await fetchBatchDeleteStoryboards(ids)
        storyboardList.value = []
        ElMessage.success('批量删除成功')
      } catch {
        ElMessage.error('批量删除失败')
      }
    })
  }

  const handleBatchSubmitReview = () => {
    if (selectedStoryboards.value.length === 0) {
      ElMessage.warning('请先选择分镜')
      return
    }
    ElMessageBox.confirm(
      `确定要提交选中的 ${selectedStoryboards.value.length} 个分镜进行审核吗？`,
      '批量提交审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        const ids = selectedStoryboards.value.map((item) => String(item.id))
        await fetchBatchSubmitStoryboardReview(ids)
        storyboardList.value.forEach((item) => {
          item.status = 'pending' as StatusType
        })
        ElMessage.success('批量提交审核成功')
      } catch {
        ElMessage.error('批量提交审核失败')
      }
    })
  }

  onMounted(() => {
    loadStoryboardList()
  })
</script>

<style lang="scss" scoped>
  .storyboard-batch-edit-page {
    .selected-panel {
      .selected-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 600px;
        overflow-y: auto;
      }

      .selected-item {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px;
        cursor: pointer;
        background: var(--el-fill-color-lighter);
        border: 2px solid transparent;
        border-radius: var(--custom-radius);
        transition: all 0.2s;

        &:hover {
          background: var(--el-fill-color);
        }

        &.active {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
        }

        .item-preview {
          flex-shrink: 0;
          width: 60px;
          height: 45px;
          overflow: hidden;
          background: var(--el-fill-color-dark);
          border-radius: 6px;

          .preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .preview-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 20px;
            color: var(--el-text-color-secondary);
          }
        }

        .item-info {
          flex: 1;
          min-width: 0;

          .item-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .item-meta {
            margin-top: 2px;
          }

          .item-tags {
            margin-top: 4px;
          }
        }
      }
    }

    .batch-form-panel {
      .batch-form {
        :deep(.el-form-item) {
          margin-bottom: 16px;
        }
      }
    }

    .panel-title {
      font-size: 15px;
      color: var(--el-text-color-primary);
    }

    .preview-panel {
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);
    }
  }
</style>
