<template>
  <div class="project-characters-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">角色管理</span>
            <ElTag type="info" size="small">山海经动画</ElTag>
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
              <ElOption label="男" value="male" />
              <ElOption label="女" value="female" />
              <ElOption label="其他" value="other" />
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
                  <div class="text-xs text-g-400">{{ scope.row.code }}</div>
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
          <ElTableColumn prop="role" label="定位" width="120">
            <template #default="scope">
              <ElTag :type="roleTypeMap[scope.row.role as RoleType]" size="small">
                {{ roleLabelMap[scope.row.role as RoleType] }}
              </ElTag>
            </template>
          </ElTableColumn>
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
        <ElFormItem label="角色编码">
          <ElInput v-model="form.code" placeholder="请输入角色编码" disabled />
        </ElFormItem>
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="性别" prop="gender">
              <ElSelect v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <ElOption label="男" value="male" />
                <ElOption label="女" value="female" />
                <ElOption label="其他" value="other" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="年龄" prop="age">
              <ElInputNumber v-model="form.age" :min="0" :max="9999" style="width: 100%" />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="角色定位" prop="role">
          <ElSelect v-model="form.role" placeholder="请选择角色定位" style="width: 100%">
            <ElOption
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
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
        <ElFormItem label="背景故事">
          <ElInput
            v-model="form.background"
            type="textarea"
            :rows="3"
            placeholder="请输入背景故事"
          />
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
              <ElTag :type="roleTypeMap[currentCharacter.role as RoleType]" size="small">
                {{ roleLabelMap[currentCharacter.role as RoleType] }}
              </ElTag>
              <span class="text-sm text-g-400">{{ currentCharacter.age }} 岁</span>
            </ElSpace>
          </div>
        </div>
        <ElDivider />
        <ElDescriptions :column="1" border>
          <ElDescriptionsItem label="角色编码">{{ currentCharacter.code }}</ElDescriptionsItem>
          <ElDescriptionsItem label="性格特点">{{
            currentCharacter.personality
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="外貌特征">{{
            currentCharacter.appearance
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="背景故事">{{
            currentCharacter.background
          }}</ElDescriptionsItem>
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
    fetchGetCharacterList,
    fetchCreateCharacter,
    fetchUpdateCharacter,
    fetchDeleteCharacter
  } from '@/api/character'

  defineOptions({ name: 'ProjectCharacters' })

  type Gender = 'male' | 'female' | 'other'
  type RoleType = 'protagonist' | 'supporting' | 'antagonist' | 'npc'

  interface CharacterItem {
    id: number
    name: string
    code: string
    gender: Gender
    age: number
    personality: string
    role: RoleType
    appearance: string
    background: string
    avatar: string
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
    () => (route.query.id as string) || (route.params.projectId as string) || '1'
  )

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const genderTypeMap: Record<Gender, 'primary' | 'danger' | 'info'> = {
    male: 'primary',
    female: 'danger',
    other: 'info'
  }

  const genderLabelMap: Record<Gender, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }

  const roleTypeMap: Record<RoleType, 'success' | 'primary' | 'danger' | 'info'> = {
    protagonist: 'success',
    supporting: 'primary',
    antagonist: 'danger',
    npc: 'info'
  }

  const roleLabelMap: Record<RoleType, string> = {
    protagonist: '主角',
    supporting: '配角',
    antagonist: '反派',
    npc: 'NPC'
  }

  const roleOptions = [
    { label: '主角', value: 'protagonist' },
    { label: '配角', value: 'supporting' },
    { label: '反派', value: 'antagonist' },
    { label: 'NPC', value: 'npc' }
  ]

  const characterList = ref<CharacterItem[]>([])
  const loading = ref(false)

  const loadCharacterList = async () => {
    loading.value = true
    try {
      const res = await fetchGetCharacterList(projectId.value)
      if (res) {
        const list = Array.isArray(res) ? res : (res as any).records || []
        characterList.value = list.map((item: any) => ({
          id: item.characterId || item.id,
          name: item.name,
          code: item.code || '',
          gender: (item.gender as Gender) || 'other',
          age: item.age || 0,
          personality: item.personality || '',
          role: mapPositioning(item.positioning) as RoleType,
          appearance: item.appearance || '',
          background: item.background || '',
          avatar: item.avatar || ''
        })) as CharacterItem[]
        pagination.total = characterList.value.length
      }
    } catch {
      ElMessage.error('加载角色列表失败')
    } finally {
      loading.value = false
    }
  }

  const mapPositioning = (positioning: string): string => {
    const map: Record<string, string> = {
      主角: 'protagonist',
      女主角: 'protagonist',
      配角: 'supporting',
      反派: 'antagonist',
      其他: 'npc',
      protagonist: 'protagonist',
      supporting: 'supporting',
      antagonist: 'antagonist',
      npc: 'npc'
    }
    return map[positioning] || 'npc'
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '角色信息', minWidth: 220 },
    { prop: 'gender', label: '性别', width: 100 },
    { prop: 'age', label: '年龄', width: 100 },
    { prop: 'personality', label: '性格', minWidth: 160 },
    { prop: 'role', label: '定位', width: 120 },
    { prop: 'appearance', label: '外貌特征', minWidth: 180 },
    { prop: 'operation', label: '操作', width: 200, fixed: 'right' }
  ]

  const filteredCharacters = computed(() => {
    let result = characterList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.personality.toLowerCase().includes(q)
      )
    }

    if (filterGender.value) {
      result = result.filter((item) => item.gender === filterGender.value)
    }

    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return result.slice(start, end)
  })

  watch(filteredCharacters, (list) => {
    pagination.total = list.length
  })

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
    code: '',
    gender: 'male',
    age: 18,
    personality: '',
    role: 'supporting',
    appearance: '',
    background: '',
    avatar: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
    personality: [{ required: true, message: '请输入性格特点', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色定位', trigger: 'change' }]
  }

  const handleCreate = () => {
    isEdit.value = false
    currentId.value = null
    form.name = ''
    form.code = `CHR-${String(characterList.value.length + 1).padStart(3, '0')}`
    form.gender = 'male'
    form.age = 18
    form.personality = ''
    form.role = 'supporting'
    form.appearance = ''
    form.background = ''
    form.avatar = ''
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
            await fetchUpdateCharacter(projectId.value, String(currentId.value), {
              name: form.name!,
              code: form.code,
              gender: form.gender,
              age: form.age,
              personality: form.personality,
              positioning: form.role,
              appearance: form.appearance,
              background: form.background
            })
            ElMessage.success('角色编辑成功')
          } else {
            await fetchCreateCharacter(projectId.value, {
              name: form.name!,
              code: form.code,
              gender: form.gender,
              age: form.age,
              personality: form.personality,
              positioning: form.role,
              appearance: form.appearance,
              background: form.background
            })
            ElMessage.success('角色创建成功')
          }
          dialogVisible.value = false
          await loadCharacterList()
        } catch {
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
        await fetchDeleteCharacter(projectId.value, String(row.id))
        ElMessage.success('删除成功')
        await loadCharacterList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleAvatarChange = (file: any) => {
    form.avatar = URL.createObjectURL(file.raw)
  }

  onMounted(() => {
    loadCharacterList()
  })
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
        border: 1px dashed var(--el-border-color);
        border-radius: 50%;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);

        &:hover {
          border-color: var(--el-color-primary);
        }
      }
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-fill-color-lighter);
    }
  }
</style>
