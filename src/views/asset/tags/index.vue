<template>
  <div class="asset-tags-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">资产标签管理</span>
            <ElTag type="info" size="small">按类型分组管理标签</ElTag>
          </div>
          <ElButton type="primary" @click="handleAdd">
            <ArtSvgIcon icon="ri:add-line" class="mr-1" />
            新增标签
          </ElButton>
        </div>
      </template>

      <!-- 标签统计 -->
      <div class="tag-stats mb-6">
        <ElRow :gutter="16">
          <ElCol
            v-for="stat in tagStats"
            :key="stat.type"
            :span="4"
            :xs="12"
            :sm="8"
            :md="6"
            :lg="4"
          >
            <div class="stat-card" :class="stat.type">
              <div class="stat-icon">
                <ArtSvgIcon :icon="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.count }}</div>
                <div class="stat-label">{{ stat.name }}</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </div>

      <!-- 按类型分组的标签列表 -->
      <div class="tag-groups">
        <div v-for="group in tagGroups" :key="group.type" class="tag-group mb-6">
          <div class="group-header flex items-center gap-3 mb-4">
            <div class="group-icon" :class="group.type">
              <ArtSvgIcon :icon="typeIconMap[group.type]" />
            </div>
            <span class="group-name font-medium">{{ typeLabelMap[group.type] }}</span>
            <ElTag type="info" size="small">{{ group.tags.length }} 个标签</ElTag>
            <ElTag type="success" size="small">{{ group.totalUsage }} 次使用</ElTag>
          </div>

          <div class="tag-list">
            <ElTag
              v-for="tag in group.tags"
              :key="tag.id"
              :type="typeTagMap[group.type]"
              size="large"
              class="tag-item"
              closable
              @close="handleDeleteTag(tag)"
              @click="handleEditTag(tag)"
            >
              <ArtSvgIcon icon="ri:price-tag-3-line" class="mr-1" />
              {{ tag.name }}
              <span class="tag-usage">({{ tag.usageCount }})</span>
            </ElTag>
            <ElButton
              type="primary"
              link
              size="small"
              class="add-tag-btn"
              @click="handleAddToGroup(group.type)"
            >
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              添加标签
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- 新增/编辑标签弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      width="480px"
      align-center
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <ElFormItem label="标签名称" prop="name" required>
          <ElInput v-model="form.name" placeholder="请输入标签名称" />
        </ElFormItem>
        <ElFormItem label="所属类型" prop="type" required>
          <ElSelect
            v-model="form.type"
            placeholder="选择标签类型"
            class="w-full"
            :disabled="isEdit"
          >
            <ElOption label="人物" value="character" />
            <ElOption label="服装" value="costume" />
            <ElOption label="场景" value="scene" />
            <ElOption label="道具" value="prop" />
            <ElOption label="音频" value="audio" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="使用统计">
          <ElInputNumber v-model="form.usageCount" :min="0" :disabled="!isEdit" class="w-full" />
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
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchBatchAddTags, fetchBatchRemoveTags } from '@/api/asset'

  defineOptions({ name: 'AssetTags' })

  type TagType = 'character' | 'costume' | 'scene' | 'prop' | 'audio'

  interface TagItem {
    id: number
    name: string
    type: TagType
    usageCount: number
    createTime: string
  }

  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const currentId = ref<number | null>(null)
  const formRef = ref<FormInstance>()

  const typeIconMap: Record<TagType, string> = {
    character: 'ri:user-line',
    costume: 'ri:t-shirt-line',
    scene: 'ri:landscape-line',
    prop: 'ri:box-3-line',
    audio: 'ri:music-2-line'
  }

  const typeTagMap: Record<TagType, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    character: 'primary',
    costume: 'success',
    scene: 'warning',
    prop: 'info',
    audio: 'danger'
  }

  const typeLabelMap: Record<TagType, string> = {
    character: '人物',
    costume: '服装',
    scene: '场景',
    prop: '道具',
    audio: '音频'
  }

  const form = reactive<Partial<TagItem>>({
    name: '',
    type: 'character',
    usageCount: 0
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择标签类型', trigger: 'change' }]
  }

  // TODO: 待对接标签管理API，目前使用空数组初始化
  const tagList = ref<TagItem[]>([])

  const tagGroups = computed(() => {
    const types: TagType[] = ['character', 'costume', 'scene', 'prop', 'audio']
    return types.map((type) => {
      const tags = tagList.value.filter((t) => t.type === type)
      return {
        type,
        tags,
        totalUsage: tags.reduce((sum, t) => sum + t.usageCount, 0)
      }
    })
  })

  const tagStats = computed(() => {
    const types: TagType[] = ['character', 'costume', 'scene', 'prop', 'audio']
    return types.map((type) => {
      const tags = tagList.value.filter((t) => t.type === type)
      return {
        type,
        name: typeLabelMap[type],
        icon: typeIconMap[type],
        count: tags.length
      }
    })
  })

  const handleAdd = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.type = 'character'
    form.usageCount = 0
    dialogVisible.value = true
  }

  const handleAddToGroup = (type: TagType) => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.type = type
    form.usageCount = 0
    dialogVisible.value = true
  }

  const handleEditTag = (tag: TagItem) => {
    isEdit.value = true
    currentId.value = tag.id
    Object.assign(form, tag)
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        const projectId = '1'
        if (isEdit.value && currentId.value) {
          const index = tagList.value.findIndex((i) => i.id === currentId.value)
          if (index !== -1) {
            tagList.value[index] = {
              ...tagList.value[index],
              ...form
            } as TagItem
          }
          ElMessage.success('编辑成功')
        } else {
          try {
            await fetchBatchAddTags(projectId, {
              assetIds: [],
              tags: [form.name!]
            } as any)
          } catch {
            // proceed with local update
          }
          const newItem: TagItem = {
            id: Date.now(),
            name: form.name!,
            type: form.type as TagType,
            usageCount: 0,
            createTime: new Date().toISOString().slice(0, 10)
          }
          tagList.value.push(newItem)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
      }
    })
  }

  const handleDeleteTag = (tag: TagItem) => {
    const projectId = '1'
    const doDelete = async () => {
      try {
        await fetchBatchRemoveTags(projectId, {
          assetIds: [],
          tags: [tag.name]
        } as any)
      } catch {
        // proceed with local removal
      }
      tagList.value = tagList.value.filter((item) => item.id !== tag.id)
      ElMessage.success('删除成功')
    }
    if (tag.usageCount > 0) {
      ElMessageBox.confirm(
        `标签「${tag.name}」已被使用 ${tag.usageCount} 次，删除后相关资产的标签关联将被移除，确定要继续吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        doDelete()
      })
    } else {
      ElMessageBox.confirm(`确定要删除标签「${tag.name}」吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        doDelete()
      })
    }
  }
</script>

<style lang="scss" scoped>
  .asset-tags-page {
    .tag-stats {
      .stat-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);

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

        &.character .stat-icon {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        &.costume .stat-icon {
          background: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }

        &.scene .stat-icon {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }

        &.prop .stat-icon {
          background: var(--el-color-info-light-9);
          color: var(--el-color-info);
        }

        &.audio .stat-icon {
          background: var(--el-color-danger-light-9);
          color: var(--el-color-danger);
        }

        .stat-info {
          .stat-value {
            font-size: 22px;
            font-weight: 600;
            color: var(--el-text-color-primary);
          }

          .stat-label {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 2px;
          }
        }
      }
    }

    .tag-groups {
      .tag-group {
        .group-header {
          .group-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;

            &.character {
              background: var(--el-color-primary-light-9);
              color: var(--el-color-primary);
            }

            &.costume {
              background: var(--el-color-success-light-9);
              color: var(--el-color-success);
            }

            &.scene {
              background: var(--el-color-warning-light-9);
              color: var(--el-color-warning);
            }

            &.prop {
              background: var(--el-color-info-light-9);
              color: var(--el-color-info);
            }

            &.audio {
              background: var(--el-color-danger-light-9);
              color: var(--el-color-danger);
            }
          }

          .group-name {
            font-size: 15px;
            color: var(--el-text-color-primary);
          }
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;

          .tag-item {
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: translateY(-2px);
            }

            .tag-usage {
              margin-left: 4px;
              opacity: 0.7;
              font-size: 12px;
            }
          }

          .add-tag-btn {
            margin-left: 4px;
          }
        }
      }
    }
  }
</style>
