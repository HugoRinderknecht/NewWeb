<template>
  <div class="project-characters-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">角色管理</span>
            <ElTag type="info" size="small">{{ projectDetail?.projectName || '角色管理' }}</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索角色名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElSelect v-model="filterGender" placeholder="性别筛选" clearable style="width: 120px">
              <ElOption label="男" value="男" />
              <ElOption label="女" value="女" />
              <ElOption label="其他" value="其他" />
            </ElSelect>
            <ElButton type="primary" @click="handleCreate">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建角色
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ArtTable
        :data="filteredCharacters"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="角色信息" min-width="220">
            <template #default="scope">
              <div class="flex-c">
                <ElAvatar :size="44" :src="scope.row.avatar" class="mr-3">
                  <ArtSvgIcon icon="ri:user-line" />
                </ElAvatar>
                <div>
                  <div class="font-medium">{{ scope.row.name }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="性别" width="100">
            <template #default="scope">
              <ElTag :type="genderTypeMap[scope.row.gender as Gender]" size="small">
                {{ genderLabelMap[scope.row.gender as Gender] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="age" label="年龄" width="100">
            <template #default="scope">
              <span class="text-g-400">{{ scope.row.age }} 岁</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="personality" label="性格" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="voice" label="声音" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="appearance" label="外貌特征" min-width="180" show-overflow-tooltip />
          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="scope">
              <ElSpace>
                <ElButton type="primary" link size="small" @click="handleView(scope.row)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  查看
                </ElButton>
                <ElButton type="primary" link size="small" @click="handleEdit(scope.row)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
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

    <!-- 新建/编辑角色弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新建角色'"
      width="600px"
      align-center
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <ElFormItem label="角色名称" prop="name">
          <ElInput v-model="form.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="性别" prop="gender">
              <ElSelect v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <ElOption label="男" value="男" />
                <ElOption label="女" value="女" />
                <ElOption label="其他" value="其他" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="年龄" prop="age">
              <ElInputNumber v-model="form.age" :min="0" :max="9999" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="性格特点" prop="personality">
          <ElInput
            v-model="form.personality"
            type="textarea"
            :rows="2"
            placeholder="请输入性格特点"
          />
        </ElFormItem>
        <ElFormItem label="外貌特征">
          <ElInput
            v-model="form.appearance"
            type="textarea"
            :rows="2"
            placeholder="请输入外貌特征"
          />
        </ElFormItem>
        <ElFormItem label="声音">
          <ElInput v-model="form.voice" type="textarea" :rows="2" placeholder="请输入声音描述" />
        </ElFormItem>
        <ElFormItem label="角色头像">
          <ElUpload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
          >
            <ElAvatar v-if="form.avatar" :size="80" :src="form.avatar" />
            <div v-else class="avatar-placeholder">
              <ArtSvgIcon icon="ri:user-add-line" class="text-2xl text-g-400" />
            </div>
          </ElUpload>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 查看角色详情弹窗 -->
    <ElDialog
      v-model="viewDialogVisible"
      title="角色详情"
      width="600px"
      align-center
      destroy-on-close
    >
      <div v-if="currentCharacter" class="character-detail">
        <div class="detail-header flex-c">
          <ElAvatar :size="80" :src="currentCharacter.avatar">
            <ArtSvgIcon icon="ri:user-line" class="text-2xl" />
          </ElAvatar>
          <div class="detail-info ml-4">
            <h3 class="text-lg font-medium">{{ currentCharacter.name }}</h3>
            <ElSpace class="mt-2">
              <ElTag :type="genderTypeMap[currentCharacter.gender as Gender]" size="small">
                {{ genderLabelMap[currentCharacter.gender as Gender] }}
              </ElTag>
              <span class="text-sm text-g-400">{{ currentCharacter.age }} 岁</span>
            </ElSpace>
          </div>
        </div>
        <ElDivider />
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="性格特点">{{
            currentCharacter.personality
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="外貌特征">{{
            currentCharacter.appearance
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="声音">{{ currentCharacter.voice }}</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    useCharacterList,
    useCreateCharacter,
    useUpdateCharacter,
    useDeleteCharacter
  } from '@/api/queries'
  import { useProjectDetail } from '@/api/queries/project'
  import { logger } from '@/utils/logger'

  defineOptions({ name: 'ProjectCharacters' })

  const MODULE = 'characters'

  type Gender = '男' | '女' | '其他'

  interface CharacterItem {
    id: number
    name: string
    gender: Gender
    age: number
    personality: string
    appearance: string
    voice: string
    avatar: string
    background: string
  }

  const searchQuery = ref('')
  const filterGender = ref<Gender | ''>('')
  const dialogVisible = ref(false)
  const viewDialogVisible = ref(false)
  const isEdit = ref(false)
  const currentId = ref<number | null>(null)
  const currentCharacter = ref<CharacterItem | null>(null)
  const formRef = ref<FormInstance>()
  const route = useRoute()

  const projectId = computed(
    () => (route.query.id as string) || (route.params.projectId as string) || ''
  )

  const { data: projectDetail } = useProjectDetail(computed(() => projectId.value || undefined))

  // Vue-query: 角色列表
  const { data: characterListData, isLoading } = useCharacterList(projectId)
  const characterList = computed(() =>
    (characterListData.value ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      gender: (item.gender as Gender) || '其他',
      age: item.age || 0,
      personality: item.personality || '',
      appearance: item.appearance || '',
      voice: item.voice || '',
      avatar: item.avatar || '',
      background: item.background || ''
    }))
  )

  // Mutations
  const createMutation = useCreateCharacter()
  const updateMutation = useUpdateCharacter()
  const deleteMutation = useDeleteCharacter()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const loading = isLoading

  const genderTypeMap: Record<Gender, 'primary' | 'danger' | 'info'> = {
    男: 'primary',
    女: 'danger',
    其他: 'info'
  }

  const genderLabelMap: Record<Gender, string> = {
    男: '男',
    女: '女',
    其他: '其他'
  }

  const filteredCharacters = computed(() => {
    let result = characterList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.name.toLowerCase().includes(q) || item.personality.toLowerCase().includes(q)
      )
    }

    if (filterGender.value) {
      result = result.filter((item) => item.gender === filterGender.value)
    }

    return result
  })

  watch(
    () => filteredCharacters.value.length,
    (len) => {
      pagination.total = len
    }
  )

  const handleSelectionChange = (selection: CharacterItem[]) => {
    console.log('selected:', selection)
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const form = reactive<Partial<CharacterItem>>({
    name: '',
    gender: '男',
    age: 18,
    personality: '',
    appearance: '',
    voice: '',
    avatar: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
    personality: [{ required: true, message: '请输入性格特点', trigger: 'blur' }]
  }

  const handleCreate = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.gender = '男'
    form.age = 18
    form.personality = ''
    form.appearance = ''
    form.voice = ''
    form.avatar = ''
    form.background = ''
    dialogVisible.value = true
  }

  const handleEdit = (row: CharacterItem) => {
    isEdit.value = true
    currentId.value = row.id
    Object.assign(form, row)
    dialogVisible.value = true
  }

  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (isEdit.value && currentId.value) {
            await updateMutation.mutateAsync({
              projectId: projectId.value,
              characterId: String(currentId.value),
              data: {
                name: form.name,
                gender: form.gender,
                age: form.age,
                personality: form.personality,
                appearance: form.appearance,
                background: form.background
              }
            })
            ElMessage.success('角色编辑成功')
          } else {
            await createMutation.mutateAsync({
              projectId: projectId.value,
              data: {
                name: form.name!,
                gender: form.gender,
                age: form.age,
                personality: form.personality,
                appearance: form.appearance,
                background: form.background
              }
            })
            ElMessage.success('角色创建成功')
          }
          dialogVisible.value = false
        } catch (err) {
          logger.apiError(
            MODULE,
            isEdit.value ? 'useUpdateCharacter' : 'useCreateCharacter',
            err
          )
          ElMessage.error(isEdit.value ? '角色编辑失败' : '角色创建失败')
        }
      }
    })
  }

  const handleView = (row: CharacterItem) => {
    currentCharacter.value = row
    viewDialogVisible.value = true
  }

  const handleDelete = (row: CharacterItem) => {
    ElMessageBox.confirm(`确定要删除角色「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await deleteMutation.mutateAsync({ projectId: projectId.value, characterId: String(row.id) })
        ElMessage.success('删除成功')
      } catch (err) {
        logger.apiError(MODULE, 'useDeleteCharacter', err)
        ElMessage.error('删除失败')
      }
    })
  }

  const handleAvatarChange = (file: any) => {
    form.avatar = URL.createObjectURL(file.raw)
  }
</script>

<style lang="scss" scoped>
  .project-characters-page {
    .character-detail {
      .detail-header {
        margin-bottom: 16px;
      }
    }

    .avatar-uploader {
      :deep(.el-upload) {
        position: relative;
        overflow: hidden;
        cursor: pointer;
        border: 1px dashed var(--el-border-color);
        border-radius: 50%;
        transition: var(--el-transition-duration-fast);

        &:hover {
          border-color: var(--el-color-primary);
        }
      }
    }

    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: var(--el-fill-color-lighter);
    }
  }
</style>
