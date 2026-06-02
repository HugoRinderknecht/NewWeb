<template>
  <div class="project-scripts-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本管理</span>
            <ElTag type="info" size="small">山海经动画</ElTag>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索剧本名称"
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
            <ElButton type="primary" @click="handleCreate">
              <ArtSvgIcon icon="ri:add-line" class="mr-1" />
              新建剧本
            </ElButton>
            <ElButton @click="handleUpload">
              <ArtSvgIcon icon="ri:upload-line" class="mr-1" />
              上传剧本
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ArtTable
        :data="filteredScripts"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #default>
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn label="剧本名称" min-width="200">
            <template #default="scope">
              <div class="flex-c">
                <div class="script-icon">
                  <ArtSvgIcon icon="ri:file-text-line" />
                </div>
                <div>
                  <div class="font-medium">{{ scope.row.name }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.code }}</div>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="状态" width="120">
            <template #default="scope">
              <ElTag :type="statusTypeMap[scope.row.status as ScriptStatus]" size="small">
                {{ statusLabelMap[scope.row.status as ScriptStatus] }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="episodeCount" label="集数" width="100">
            <template #default="scope">
              <ElTag v-if="scope.row.episodeCount > 0" type="info" size="small">
                {{ scope.row.episodeCount }} 集
              </ElTag>
              <span v-else class="text-g-400">-</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="wordCount" label="字数" width="120" />
          <ElTableColumn prop="author" label="作者" width="140" />
          <ElTableColumn prop="updateTime" label="更新时间" width="160" sortable />
          <ElTableColumn label="操作" width="220" fixed="right">
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

    <!-- 新建剧本弹窗 -->
    <ElDialog
      v-model="createDialogVisible"
      title="新建剧本"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <ElFormItem label="剧本名称" prop="name">
          <ElInput v-model="createForm.name" placeholder="请输入剧本名称" />
        </ElFormItem>
        <ElFormItem label="剧本编码">
          <ElInput v-model="createForm.code" placeholder="请输入剧本编码" disabled />
        </ElFormItem>
        <ElFormItem label="作者" prop="author">
          <ElInput v-model="createForm.author" placeholder="请输入作者名称" />
        </ElFormItem>
        <ElFormItem label="剧本简介">
          <ElInput
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入剧本简介"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleCreateSubmit">确定</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 上传剧本弹窗 -->
    <ElDialog
      v-model="uploadDialogVisible"
      title="上传剧本"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
        <ElFormItem label="剧本名称" prop="name">
          <ElInput v-model="uploadForm.name" placeholder="请输入剧本名称" />
        </ElFormItem>
        <ElFormItem label="上传文件" prop="file">
          <ElUpload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".doc,.docx,.pdf,.txt"
          >
            <div class="el-upload__text">
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="text-3xl text-g-400 mb-2" />
              <div>将文件拖到此处，或<em>点击上传</em></div>
            </div>
            <template #tip>
              <div class="el-upload__tip">支持 .doc, .docx, .pdf, .txt 格式</div>
            </template>
          </ElUpload>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="uploadDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleUploadSubmit">上传</ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 编辑剧本弹窗 -->
    <ElDialog
      v-model="editDialogVisible"
      title="编辑剧本"
      width="560px"
      align-center
      destroy-on-close
    >
      <ElForm ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <ElFormItem label="剧本名称" prop="name">
          <ElInput v-model="editForm.name" placeholder="请输入剧本名称" />
        </ElFormItem>
        <ElFormItem label="作者" prop="author">
          <ElInput v-model="editForm.author" placeholder="请输入作者名称" />
        </ElFormItem>
        <ElFormItem label="状态">
          <ElSelect v-model="editForm.status" placeholder="请选择状态" style="width: 100%">
            <ElOption
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="剧本简介">
          <ElInput
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入剧本简介"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="editDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEditSubmit">保存</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ColumnOption } from '@/types/component'
  import {
    fetchGetScriptList,
    fetchCreateScript,
    fetchUpdateScript,
    fetchDeleteScript
  } from '@/api/script'
  import { useRoute } from 'vue-router'
  import { ref, reactive, computed, watch, onMounted } from 'vue'

  defineOptions({ name: 'ProjectScripts' })

  const route = useRoute()

  type ScriptStatus = 'draft' | 'writing' | 'review' | 'completed'

  interface ScriptItem {
    id: number
    name: string
    code: string
    status: ScriptStatus
    episodeCount: number
    wordCount: string
    author: string
    description: string
    updateTime: string
    createTime: string
  }

  const searchQuery = ref('')
  const filterStatus = ref<ScriptStatus | ''>('')
  const selectedScripts = ref<ScriptItem[]>([])
  const createDialogVisible = ref(false)
  const uploadDialogVisible = ref(false)
  const editDialogVisible = ref(false)

  const createFormRef = ref<FormInstance>()
  const uploadFormRef = ref<FormInstance>()
  const editFormRef = ref<FormInstance>()

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '创作中', value: 'writing' },
    { label: '审核中', value: 'review' },
    { label: '已完成', value: 'completed' }
  ]

  const statusTypeMap: Record<ScriptStatus, 'info' | 'primary' | 'warning' | 'success'> = {
    draft: 'info',
    writing: 'primary',
    review: 'warning',
    completed: 'success'
  }

  const statusLabelMap: Record<ScriptStatus, string> = {
    draft: '草稿',
    writing: '创作中',
    review: '审核中',
    completed: '已完成'
  }

  const scriptList = ref<ScriptItem[]>([])

  const loadScriptList = async () => {
    try {
      const projectId = (route.params.projectId as string) || '1'
      const res = await fetchGetScriptList(projectId)
      if (res) {
        const list = Array.isArray(res) ? res : res.records || []
        scriptList.value = list.map((item: any) => ({
          id: item.id,
          name: item.name || '',
          code: item.code || '',
          status: item.status || 'draft',
          episodeCount: item.episodeCount || 0,
          wordCount: item.wordCount || '0',
          author: item.author || '',
          description: item.description || '',
          updateTime: item.updateTime || '',
          createTime: item.createTime || ''
        })) as ScriptItem[]
        pagination.total = scriptList.value.length
      }
    } catch {
      ElMessage.error('加载剧本列表失败')
    }
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'name', label: '剧本名称', minWidth: 200 },
    { prop: 'status', label: '状态', width: 120 },
    { prop: 'episodeCount', label: '集数', width: 100 },
    { prop: 'wordCount', label: '字数', width: 120 },
    { prop: 'author', label: '作者', width: 140 },
    { prop: 'updateTime', label: '更新时间', width: 160, sortable: true },
    { prop: 'operation', label: '操作', width: 220, fixed: 'right' }
  ]

  const filteredScripts = computed(() => {
    let result = scriptList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      )
    }

    if (filterStatus.value) {
      result = result.filter((item) => item.status === filterStatus.value)
    }

    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return result.slice(start, end)
  })

  watch(filteredScripts, (list) => {
    pagination.total = list.length
  })

  const handleSelectionChange = (selection: ScriptItem[]) => {
    selectedScripts.value = selection
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  // 新建剧本
  const createForm = reactive({
    name: '',
    code: '',
    author: '',
    description: ''
  })

  const createRules: FormRules = {
    name: [{ required: true, message: '请输入剧本名称', trigger: 'blur' }],
    author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }]
  }

  const handleCreate = () => {
    createForm.name = ''
    createForm.code = `SCR-${String(scriptList.value.length + 1).padStart(3, '0')}`
    createForm.author = ''
    createForm.description = ''
    createDialogVisible.value = true
  }

  const handleCreateSubmit = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const projectId = (route.params.projectId as string) || '1'
          await fetchCreateScript(projectId, {
            name: createForm.name,
            code: createForm.code,
            author: createForm.author,
            description: createForm.description
          })
          ElMessage.success('剧本创建成功')
          createDialogVisible.value = false
          await loadScriptList()
        } catch {
          ElMessage.error('剧本创建失败')
        }
      }
    })
  }

  // 上传剧本
  const uploadForm = reactive({
    name: '',
    file: null as File | null
  })

  const uploadRules: FormRules = {
    name: [{ required: true, message: '请输入剧本名称', trigger: 'blur' }],
    file: [{ required: true, message: '请上传文件', trigger: 'change' }]
  }

  const handleUpload = () => {
    uploadForm.name = ''
    uploadForm.file = null
    uploadDialogVisible.value = true
  }

  const handleFileChange = (file: any) => {
    uploadForm.file = file.raw
  }

  const handleUploadSubmit = async () => {
    if (!uploadFormRef.value) return
    await uploadFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const projectId = (route.params.projectId as string) || '1'
          await fetchCreateScript(projectId, {
            name: uploadForm.name,
            code: `SCR-${String(scriptList.value.length + 1).padStart(3, '0')}`,
            author: '当前用户',
            description: '从文件导入'
          })
          ElMessage.success('剧本上传成功')
          uploadDialogVisible.value = false
          await loadScriptList()
        } catch {
          ElMessage.error('剧本上传失败')
        }
      }
    })
  }

  // 编辑剧本
  const editForm = reactive({
    id: 0,
    name: '',
    author: '',
    status: 'draft' as ScriptStatus,
    description: ''
  })

  const editRules: FormRules = {
    name: [{ required: true, message: '请输入剧本名称', trigger: 'blur' }],
    author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }]
  }

  const handleEdit = (row: ScriptItem) => {
    Object.assign(editForm, {
      id: row.id,
      name: row.name,
      author: row.author,
      status: row.status,
      description: row.description
    })
    editDialogVisible.value = true
  }

  const handleEditSubmit = async () => {
    if (!editFormRef.value) return
    await editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          await fetchUpdateScript(String(editForm.id), {
            name: editForm.name,
            author: editForm.author,
            status: editForm.status,
            description: editForm.description
          })
          ElMessage.success('剧本信息已更新')
          editDialogVisible.value = false
          await loadScriptList()
        } catch {
          ElMessage.error('剧本更新失败')
        }
      }
    })
  }

  const handleView = (row: ScriptItem) => {
    ElMessage.info(`查看剧本「${row.name}」`)
  }

  const handleDelete = (row: ScriptItem) => {
    ElMessageBox.confirm(`确定要删除剧本「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteScript(String(row.id))
        ElMessage.success('删除成功')
        await loadScriptList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  onMounted(() => {
    loadScriptList()
  })
</script>

<style lang="scss" scoped>
  .project-scripts-page {
    .script-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      margin-right: 12px;
    }
  }
</style>
