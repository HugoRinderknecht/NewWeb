<template>
  <div class="storyboard-panel">
    <!-- 工具栏 -->
    <div class="panel-toolbar">
      <ElSpace>
        <ElButton size="small" type="primary" @click="handleAdd">
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          添加分镜
        </ElButton>
        <ElButton size="small" @click="handleAutoLayout">
          <ArtSvgIcon icon="ri:layout-grid-line" class="mr-1" />
          自动排版
        </ElButton>
        <ElButton size="small" :disabled="!selectedItem" @click="handleEdit">
          <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
          编辑
        </ElButton>
        <ElButton
          size="small"
          type="danger"
          :disabled="selectedIds.length === 0 && !selectedItem"
          @click="handleDelete"
        >
          <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
          {{ selectedIds.length > 0 ? `删除 (${selectedIds.length})` : '删除' }}
        </ElButton>
        <ElButton v-if="selectedIds.length > 0" size="small" @click="selectedIds = []">
          <ArtSvgIcon icon="ri:close-line" class="mr-1" />
          取消选择
        </ElButton>
        <ElTooltip content="按住 Ctrl / Cmd 点击可多选分镜">
          <ArtSvgIcon icon="ri:information-line" class="text-g-400 cursor-help" />
        </ElTooltip>
      </ElSpace>
      <ElSpace>
        <ElRadioGroup v-model="viewMode" size="small">
          <ElRadioButton value="grid">网格</ElRadioButton>
          <ElRadioButton value="timeline">时间线</ElRadioButton>
        </ElRadioGroup>
      </ElSpace>
    </div>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="panel-content">
      <VueDraggable
        v-model="localList"
        class="storyboard-grid"
        :animation="200"
        ghost-class="storyboard-ghost"
        chosen-class="storyboard-chosen"
        drag-class="storyboard-drag"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <div
          v-for="item in localList"
          :key="item.id"
          :class="[
            'storyboard-card',
            { active: selectedItem?.id === item.id },
            { selected: selectedIds.includes(item.id) },
            { 'status-draft': item.status === 'draft' },
            { 'status-designing': item.status === 'designing' },
            { 'status-completed': item.status === 'completed' }
          ]"
          @click="handleSelect(item, $event)"
        >
          <div class="card-thumbnail">
            <ElImage v-if="item.thumbnail" :src="item.thumbnail" fit="cover" />
            <div v-else class="thumbnail-placeholder">
              <ArtSvgIcon icon="ri:movie-line" class="text-3xl" />
              <span class="text-xs mt-1">{{ item.code }}</span>
            </div>
            <div class="card-duration">{{ item.duration }}s</div>
            <div class="card-shots">{{ item.shotCount }} 镜</div>
          </div>
          <div class="card-info">
            <div class="card-name">{{ item.name }}</div>
            <div class="card-meta">
              <ElTag :type="getSourceTag(item.source)" size="small">{{
                getSourceLabel(item.source)
              }}</ElTag>
              <ElTag :type="getStatusTag(item.status)" size="small">{{
                getStatusLabel(item.status)
              }}</ElTag>
            </div>
            <div v-if="item.scriptRef" class="card-script-ref">
              <ArtSvgIcon icon="ri:file-text-line" class="text-xs mr-1" />
              <span class="text-xs text-g-400 truncate">{{ item.scriptRef }}</span>
            </div>
          </div>
          <div class="card-order">{{ item.order }}</div>
        </div>
      </VueDraggable>
    </div>

    <!-- 时间线视图 -->
    <div v-else class="panel-content timeline-view">
      <VueDraggable
        v-model="localList"
        class="storyboard-timeline"
        :animation="200"
        ghost-class="storyboard-ghost"
        chosen-class="storyboard-chosen"
        drag-class="storyboard-drag"
        @start="handleDragStart"
        @end="handleDragEnd"
      >
        <div
          v-for="item in localList"
          :key="item.id"
          :class="[
            'timeline-item',
            { active: selectedItem?.id === item.id },
            { selected: selectedIds.includes(item.id) }
          ]"
          :style="{ width: `${getTimelineWidth(item.duration)}px` }"
          @click="handleSelect(item, $event)"
        >
          <div class="timeline-bar" :class="`status-${item.status}`">
            <div class="timeline-thumb">
              <ElImage v-if="item.thumbnail" :src="item.thumbnail" fit="cover" />
              <div v-else class="thumb-placeholder-small">
                <ArtSvgIcon icon="ri:movie-line" />
              </div>
            </div>
            <div class="timeline-info">
              <div class="timeline-name">{{ item.name }}</div>
              <div class="timeline-duration">{{ item.duration }}s</div>
            </div>
          </div>
          <div class="timeline-connector" />
        </div>
      </VueDraggable>
    </div>

    <!-- 详情弹窗 -->
    <ElDialog v-model="dialogVisible" :title="isEdit ? '编辑分镜' : '新建分镜'" width="600px">
      <ElForm :model="form" label-width="90px">
        <ElFormItem label="分镜名称" required>
          <ElInput v-model="form.name" placeholder="请输入分镜名称" />
        </ElFormItem>
        <ElFormItem label="关联场景">
          <ElSelect v-model="form.sceneId" placeholder="请选择关联场景" class="w-full">
            <ElOption
              v-for="scene in sceneOptions"
              :key="scene.id"
              :label="scene.name"
              :value="scene.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="剧本关联">
          <ElInput v-model="form.scriptRef" placeholder="关联剧本内容引用" />
        </ElFormItem>
        <ElFormItem label="时长(秒)">
          <ElSlider v-model="form.duration" :min="1" :max="120" show-input />
        </ElFormItem>
        <ElFormItem label="镜头数">
          <ElInputNumber v-model="form.shotCount" :min="1" :max="50" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="form.description" type="textarea" :rows="3" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { ElMessageBox } from 'element-plus'
  import type { Storyboard } from '@/store/modules/project-data'

  defineOptions({ name: 'ArtStoryboardPanel' })

  const props = defineProps<{
    modelValue: Storyboard[]
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Storyboard[]): void
    (e: 'select', item: Storyboard): void
    (e: 'add', item: Storyboard): void
    (e: 'delete', id: string): void
    (e: 'batchDelete', ids: string[]): void
    (e: 'reorder', list: Storyboard[]): void
  }>()

  // ---------- State ----------
  const localList = ref<Storyboard[]>([...props.modelValue])
  const selectedItem = ref<Storyboard | null>(null)
  const selectedIds = ref<string[]>([])
  const viewMode = ref<'grid' | 'timeline'>('grid')
  const dialogVisible = ref(false)
  const isEdit = ref(false)

  const form = ref<Partial<Storyboard>>({
    name: '',
    sceneId: undefined,
    sceneName: '',
    scriptRef: '',
    duration: 15,
    shotCount: 3,
    description: ''
  })

  const sceneOptions = [
    { id: '1', name: '青丘山' },
    { id: '2', name: '昆仑墟' },
    { id: '3', name: '幽都' },
    { id: '4', name: '不周山' },
    { id: '5', name: '东海之滨' }
  ]

  // ---------- Watch ----------
  watch(
    () => props.modelValue,
    (newVal) => {
      localList.value = [...newVal]
    },
    { deep: true }
  )

  watch(localList, (newVal) => {
    emit('update:modelValue', newVal)
  })

  // ---------- 方法 ----------
  function getSourceTag(source: Storyboard['source']) {
    const map: Record<string, 'primary' | 'success' | 'info'> = {
      script: 'success',
      manual: 'primary',
      ai: 'info'
    }
    return map[source] || 'info'
  }

  function getSourceLabel(source: Storyboard['source']) {
    const map: Record<string, string> = {
      script: '剧本生成',
      manual: '手动创建',
      ai: 'AI辅助'
    }
    return map[source] || source
  }

  function getStatusTag(status: Storyboard['status']) {
    const map: Record<string, 'info' | 'primary' | 'success' | 'warning'> = {
      draft: 'info',
      designing: 'primary',
      completed: 'success',
      archived: 'warning'
    }
    return map[status] || 'info'
  }

  function getStatusLabel(status: Storyboard['status']) {
    const map: Record<string, string> = {
      draft: '草稿',
      designing: '设计中',
      completed: '已完成',
      archived: '已归档'
    }
    return map[status] || status
  }

  function getTimelineWidth(duration: number) {
    // 每秒钟对应 4 像素宽度
    return Math.max(120, duration * 4)
  }

  function handleSelect(item: Storyboard, event?: MouseEvent) {
    const isCtrl = event?.ctrlKey || event?.metaKey
    if (isCtrl) {
      const index = selectedIds.value.indexOf(item.id)
      if (index > -1) {
        selectedIds.value.splice(index, 1)
      } else {
        selectedIds.value.push(item.id)
      }
      selectedItem.value = item
      emit('select', item)
      return
    }
    selectedIds.value = []
    selectedItem.value = item
    emit('select', item)
  }

  function handleDragStart() {
    document.body.style.cursor = 'grabbing'
  }

  function handleDragEnd() {
    document.body.style.cursor = ''
    // 重新计算 order
    localList.value = localList.value.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    emit('reorder', localList.value)
  }

  function handleAdd() {
    isEdit.value = false
    form.value = {
      name: '',
      sceneId: undefined,
      sceneName: '',
      scriptRef: '',
      duration: 15,
      shotCount: 3,
      description: ''
    }
    dialogVisible.value = true
  }

  function handleEdit() {
    if (!selectedItem.value) return
    isEdit.value = true
    form.value = { ...selectedItem.value }
    dialogVisible.value = true
  }

  function handleDelete() {
    if (selectedIds.value.length > 0) {
      ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个分镜吗？`, '删除确认', {
        type: 'warning'
      }).then(() => {
        const ids = [...selectedIds.value]
        localList.value = localList.value.filter((item) => !ids.includes(item.id))
        selectedIds.value = []
        selectedItem.value = null
        emit('batchDelete', ids)
        ElMessage.success(`成功删除 ${ids.length} 个分镜`)
      })
      return
    }
    if (!selectedItem.value) return
    ElMessageBox.confirm(`确定删除分镜「${selectedItem.value.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(() => {
      const id = selectedItem.value!.id
      localList.value = localList.value.filter((item) => item.id !== id)
      selectedItem.value = null
      emit('delete', id)
      ElMessage.success('删除成功')
    })
  }

  function handleSubmit() {
    if (!form.value.name) {
      ElMessage.warning('请输入分镜名称')
      return
    }

    const scene = sceneOptions.find((s) => s.id === form.value.sceneId)
    const now = new Date().toISOString().slice(0, 10)

    if (isEdit.value && selectedItem.value) {
      const index = localList.value.findIndex((item) => item.id === selectedItem.value!.id)
      if (index !== -1) {
        localList.value[index] = {
          ...localList.value[index],
          ...form.value,
          sceneName: scene?.name || localList.value[index].sceneName,
          updateTime: now
        } as Storyboard
      }
      ElMessage.success('编辑成功')
    } else {
      const newId = String(Math.max(...localList.value.map((s) => Number(s.id) || 0), 0) + 1)
      const newItem: Storyboard = {
        id: newId,
        code: `SB-${String(newId).padStart(3, '0')}`,
        name: form.value.name!,
        source: 'manual',
        sceneId: form.value.sceneId || '',
        sceneName: scene?.name || '',
        description: form.value.description || '',
        thumbnail: '',
        shotCount: form.value.shotCount || 3,
        duration: form.value.duration || 15,
        status: 'draft',
        order: localList.value.length + 1,
        projectId: '',
        scriptRef: form.value.scriptRef,
        createTime: now,
        updateTime: now
      }
      localList.value.push(newItem)
      emit('add', newItem)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
  }

  function handleAutoLayout() {
    // 按 order 排序
    localList.value = [...localList.value].sort((a, b) => a.order - b.order)
    // 重新分配 order
    localList.value = localList.value.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    emit('reorder', localList.value)
    ElMessage.success('自动排版完成')
  }
</script>

<style lang="scss" scoped>
  .storyboard-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color);
    border-radius: var(--custom-radius);
    overflow: hidden;
  }

  .panel-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  // 网格视图
  .storyboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .storyboard-card {
    position: relative;
    background: var(--el-bg-color);
    border: 2px solid var(--el-border-color-lighter);
    border-radius: var(--custom-radius);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    &.active {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }

    &.selected {
      border-color: var(--el-color-danger-light-5);
      box-shadow: 0 0 0 2px var(--el-color-danger-light-8);
    }

    &.status-draft {
      border-top: 3px solid var(--el-color-info);
    }

    &.status-designing {
      border-top: 3px solid var(--el-color-primary);
    }

    &.status-completed {
      border-top: 3px solid var(--el-color-success);
    }

    .card-thumbnail {
      position: relative;
      height: 120px;
      background: var(--el-fill-color-lighter);
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .thumbnail-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--el-text-color-secondary);
      }

      .card-duration {
        position: absolute;
        bottom: 4px;
        right: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .card-shots {
        position: absolute;
        top: 4px;
        left: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
      }
    }

    .card-info {
      padding: 10px;

      .card-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .card-meta {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .card-script-ref {
        display: flex;
        align-items: center;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }

    .card-order {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-color-primary);
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      border-radius: 50%;
    }
  }

  // 拖拽样式
  .storyboard-ghost {
    opacity: 0.5;
    background: var(--el-color-primary-light-9);
    border: 2px dashed var(--el-color-primary);
  }

  .storyboard-chosen {
    opacity: 0.8;
  }

  .storyboard-drag {
    opacity: 0.9;
    transform: rotate(2deg);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  // 时间线视图
  .timeline-view {
    overflow-x: auto;
  }

  .storyboard-timeline {
    display: flex;
    align-items: center;
    gap: 0;
    min-width: max-content;
    padding: 20px;
  }

  .timeline-item {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;

    &:hover .timeline-bar {
      border-color: var(--el-color-primary-light-5);
    }

    &.active .timeline-bar {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }

    &.selected .timeline-bar {
      border-color: var(--el-color-danger-light-5);
      box-shadow: 0 0 0 2px var(--el-color-danger-light-8);
    }

    .timeline-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: var(--el-fill-color-lighter);
      border: 2px solid var(--el-border-color-lighter);
      border-radius: var(--custom-radius);
      height: 60px;
      transition: all 0.2s;

      &.status-draft {
        border-left: 3px solid var(--el-color-info);
      }

      &.status-designing {
        border-left: 3px solid var(--el-color-primary);
      }

      &.status-completed {
        border-left: 3px solid var(--el-color-success);
      }

      .timeline-thumb {
        width: 44px;
        height: 44px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        background: var(--el-bg-color);

        .el-image {
          width: 100%;
          height: 100%;
        }

        .thumb-placeholder-small {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--el-text-color-secondary);
        }
      }

      .timeline-info {
        min-width: 0;
        flex: 1;

        .timeline-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-duration {
          font-size: 11px;
          color: var(--el-text-color-secondary);
          margin-top: 2px;
        }
      }
    }

    .timeline-connector {
      position: absolute;
      top: 50%;
      right: -12px;
      width: 12px;
      height: 2px;
      background: var(--el-border-color);
      transform: translateY(-50%);
      z-index: 1;

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid var(--el-border-color);
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }
    }

    &:last-child .timeline-connector {
      display: none;
    }
  }
</style>
