<template>
  <div class="project-scripts-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">剧本管理</span>
            <ElTag v-if="projectName" type="info" size="small">{{ projectName }}</ElTag>
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
                  <div class="font-medium">{{ scope.row.title }}</div>
                  <div class="text-xs text-g-400">{{ scope.row.description }}</div>
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
        <ElFormItem label="剧本名称" prop="title">
          <ElInput
            v-model="createForm.title"
            placeholder="请输入剧本名称"
            maxlength="200"
            show-word-limit
          />
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
        <ElFormItem label="剧本名称" prop="title">
          <ElInput
            v-model="editForm.title"
            placeholder="请输入剧本名称"
            maxlength="200"
            show-word-limit
          />
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
  import { useRoute, useRouter } from 'vue-router'
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import { logger } from '@/utils/logger'

  defineOptions({ name: 'ProjectScripts' })

  const route = useRoute()
  const router = useRouter()

  /** 1=草稿, 2=待审核, 3=已通过, 4=已驳回 */
  type ScriptStatus = 1 | 2 | 3 | 4

  interface ScriptItem {
    id: number
    title: string
    description: string
    content: string
    status: ScriptStatus
    episodeCount: number
    author: string
    updateTime: string
    createTime: string
  }

  const searchQuery = ref('')
  const filterStatus = ref<ScriptStatus | ''>('')
  const projectName = ref('')
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
    { label: '草稿', value: 1 },
    { label: '待审核', value: 2 },
    { label: '已通过', value: 3 },
    { label: '已驳回', value: 4 }
  ]

  const statusTypeMap: Record<ScriptStatus, 'info' | 'warning' | 'success' | 'danger'> = {
    1: 'info',
    2: 'warning',
    3: 'success',
    4: 'danger'
  }

  const statusLabelMap: Record<ScriptStatus, string> = {
    1: '草稿',
    2: '待审核',
    3: '已通过',
    4: '已驳回'
  }

  const scriptList = ref<ScriptItem[]>([])

  const loadScriptList = async () => {
    try {
      const projectId = (route.params.projectId as string) || (route.query.id as string) || ''
      logger.apiRequest('Scripts', 'fetchGetScriptList', projectId)
      const res = await fetchGetScriptList(projectId)
      if (res) {
        const list = Array.isArray(res) ? res : res.records || []
        scriptList.value = list.map((item: any) => ({
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          content: item.content || '',
          status: item.status ?? 1,
          episodeCount: item.episodeCount || 0,
          author: item.author || '',
          updateTime: item.updateTime || '',
          createTime: item.createTime || ''
        })) as ScriptItem[]
        pagination.total = scriptList.value.length
        logger.apiSuccess('Scripts', 'fetchGetScriptList', `加载 ${scriptList.value.length} 条剧本`)
      }
    } catch (err) {
      logger.apiError('Scripts', 'fetchGetScriptList', err)
      ElMessage.error('加载剧本列表失败')
    }
  }

  const columns: ColumnOption[] = [
    { type: 'selection' },
    { prop: 'title', label: '剧本名称', minWidth: 200 },
    { prop: 'status', label: '状态', width: 120 },
    { prop: 'episodeCount', label: '集数', width: 100 },
    { prop: 'author', label: '作者', width: 140 },
    { prop: 'updateTime', label: '更新时间', width: 160, sortable: true },
    { prop: 'operation', label: '操作', width: 220, fixed: 'right' }
  ]

  const filteredScripts = computed(() => {
    let result = scriptList.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (item) => item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
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
    title: '',
    description: ''
  })

  const createRules: FormRules = {
    title: [{ required: true, message: '请输入剧本名称', trigger: 'blur' }]
  }

  const handleCreate = () => {
    logger.info('Scripts', 'handleCreate', '打开新建剧本弹窗')
    createForm.title = ''
    createForm.description = ''
    createDialogVisible.value = true
  }

  const handleCreateSubmit = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const projectId = (route.params.projectId as string) || (route.query.id as string) || ''
          logger.apiRequest('Scripts', 'fetchCreateScript', { projectId, title: createForm.title })
          await fetchCreateScript(projectId, {
            title: createForm.title,
            description: createForm.description
          })
          logger.apiSuccess('Scripts', 'fetchCreateScript', `剧本创建成功：${createForm.title}`)
          ElMessage.success('剧本创建成功')
          createDialogVisible.value = false
          await loadScriptList()
        } catch (err) {
          logger.apiError('Scripts', 'fetchCreateScript', err)
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
    logger.info('Scripts', 'handleUpload', '打开上传剧本弹窗')
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
          const projectId = (route.params.projectId as string) || (route.query.id as string) || ''
          logger.apiRequest('Scripts', 'fetchCreateScript(上传)', {
            projectId,
            name: uploadForm.name
          })
          await fetchCreateScript(projectId, {
            title: uploadForm.name,
            description: '从文件导入'
          })
          logger.apiSuccess(
            'Scripts',
            'fetchCreateScript(上传)',
            `剧本上传成功：${uploadForm.name}`
          )
          ElMessage.success('剧本上传成功')
          uploadDialogVisible.value = false
          await loadScriptList()
        } catch (err) {
          logger.apiError('Scripts', 'fetchCreateScript(上传)', err)
          ElMessage.error('剧本上传失败')
        }
      }
    })
  }

  // 编辑剧本
  const editForm = reactive({
    id: 0,
    title: '',
    status: 1 as ScriptStatus,
    description: ''
  })

  const editRules: FormRules = {
    title: [{ required: true, message: '请输入剧本名称', trigger: 'blur' }]
  }

  const handleEdit = (row: ScriptItem) => {
    logger.info('Scripts', 'handleEdit', `编辑剧本：${row.title}`)
    Object.assign(editForm, {
      id: row.id,
      title: row.title,
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
          logger.apiRequest('Scripts', 'fetchUpdateScript', {
            id: editForm.id,
            title: editForm.title
          })
          await fetchUpdateScript(String(editForm.id), {
            title: editForm.title,
            status: editForm.status,
            description: editForm.description
          })
          logger.apiSuccess('Scripts', 'fetchUpdateScript', `剧本更新成功：${editForm.title}`)
          ElMessage.success('剧本信息已更新')
          editDialogVisible.value = false
          await loadScriptList()
        } catch (err) {
          logger.apiError('Scripts', 'fetchUpdateScript', err)
          ElMessage.error('剧本更新失败')
        }
      }
    })
  }

  const handleView = (row: ScriptItem) => {
    logger.info('Scripts', 'handleView', `查看剧本：${row.title}`)
    const projectId = (route.params.projectId as string) || (route.query.id as string) || ''
    router.push({ name: 'ScriptDetail', params: { projectId, scriptId: String(row.id) } })
  }

  const handleDelete = (row: ScriptItem) => {
    logger.info('Scripts', 'handleDelete', `请求删除剧本：${row.title}`)
    ElMessageBox.confirm(`确定要删除剧本「${row.title}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        logger.apiRequest('Scripts', 'fetchDeleteScript', { id: row.id })
        await fetchDeleteScript(String(row.id))
        logger.apiSuccess('Scripts', 'fetchDeleteScript', `剧本已删除：${row.title}`)
        ElMessage.success('删除成功')
        await loadScriptList()
      } catch (err) {
        logger.apiError('Scripts', 'fetchDeleteScript', err)
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
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      margin-right: 12px;
      font-size: 20px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-radius: 8px;
    }
  }
</style>
