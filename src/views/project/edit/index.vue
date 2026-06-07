<template>
  <div class="project-edit-page art-full-height">
    <!-- 无项目ID时的提示弹窗 -->
    <ElDialog
      v-model="showNoProjectDialog"
      title="操作提示"
      width="480px"
      align-center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      class="no-project-dialog"
    >
      <div class="no-project-content">
        <div class="no-project-icon">
          <ArtSvgIcon icon="ri:information-line" class="text-4xl text-primary" />
        </div>
        <h3 class="no-project-title">请通过项目列表进入编辑</h3>
        <p class="no-project-desc">
          您当前未选择具体项目。请返回项目列表界面，找到并点击对应项目行中的「编辑」按钮，即可进入项目编辑流程。
        </p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton type="primary" @click="handleGoToList">
            <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
            前往项目列表
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex-c">
            <ElButton link @click="handleBack">
              <ArtSvgIcon icon="ri:arrow-left-line" />
            </ElButton>
            <span class="text-lg font-medium ml-2">项目详情</span>
          </div>
          <ElSpace>
            <ElButton @click="handleSave" type="primary">
              <ArtSvgIcon icon="ri:save-line" class="mr-1" />
              保存修改
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElTabs v-model="activeTab" type="border-card" class="project-tabs">
        <!-- 概览 -->
        <ElTabPane label="概览" name="overview">
          <div class="tab-content">
            <ElRow :gutter="24">
              <ElCol :xs="24" :md="16">
                <ProjectFormComponent ref="projectFormRef" :is-create="false" />
              </ElCol>
              <ElCol :xs="24" :md="8">
                <div class="project-stats art-card p-4">
                  <h4 class="text-base font-medium mb-4">项目统计</h4>
                  <div class="stat-item flex-cb mb-3">
                    <span class="text-g-400">成员数</span>
                    <span class="font-medium">{{ projectForm.memberCount }} 人</span>
                  </div>
                  <div class="stat-item flex-cb mb-3">
                    <span class="text-g-400">资产数</span>
                    <span class="font-medium">{{ projectForm.assetCount }} 个</span>
                  </div>
                  <div class="stat-item flex-cb mb-3">
                    <span class="text-g-400">创建时间</span>
                    <span class="font-medium">{{ projectForm.createTime }}</span>
                  </div>
                  <div class="stat-item flex-cb mb-3">
                    <span class="text-g-400">更新时间</span>
                    <span class="font-medium">{{ projectForm.updateTime }}</span>
                  </div>
                  <ElDivider />
                  <div class="stat-item flex-cb">
                    <span class="text-g-400">当前状态</span>
                    <ElTag :type="statusTypeMap[projectForm.status]" size="small">
                      {{ statusLabelMap[projectForm.status] }}
                    </ElTag>
                  </div>
                </div>
              </ElCol>
            </ElRow>
          </div>
        </ElTabPane>

        <!-- 剧本 -->
        <ElTabPane label="剧本" name="script">
          <div class="tab-content">
            <div class="flex-cb mb-4">
              <span class="text-base font-medium">剧本列表</span>
              <ElButton type="primary" size="small" @click="handleAddScript">
                <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                添加剧本
              </ElButton>
            </div>
            <ElTable v-loading="scriptLoading" :data="scriptList" style="width: 100%">
              <ElTableColumn prop="title" label="剧本标题" min-width="180" />
              <ElTableColumn prop="author" label="作者" width="120" />
              <ElTableColumn prop="version" label="版本" width="100" />
              <ElTableColumn prop="updateTime" label="更新时间" width="160" />
              <ElTableColumn label="操作" width="150" fixed="right">
                <template #default="scope">
                  <ElButton type="primary" link size="small" @click="handleViewScript(scope.row)"
                    >查看</ElButton
                  >
                  <ElButton type="danger" link size="small" @click="handleDeleteScript(scope.row)"
                    >删除</ElButton
                  >
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>

        <!-- 分镜 -->
        <ElTabPane label="分镜" name="storyboard">
          <div class="tab-content">
            <div class="flex-cb mb-4">
              <span class="text-base font-medium">分镜列表</span>
              <ElButton type="primary" size="small" @click="handleAddStoryboard">
                <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                添加分镜
              </ElButton>
            </div>
            <ElTable v-loading="storyboardLoading" :data="storyboardList" style="width: 100%">
              <ElTableColumn prop="name" label="分镜名称" min-width="180" />
              <ElTableColumn prop="scene" label="场景" width="120" />
              <ElTableColumn prop="status" label="状态" width="100">
                <template #default="scope">
                  <ElTag
                    :type="scope.row.status === 'completed' ? 'success' : 'primary'"
                    size="small"
                  >
                    {{ scope.row.status === 'completed' ? '已完成' : '绘制中' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="updateTime" label="更新时间" width="160" />
              <ElTableColumn label="操作" width="150" fixed="right">
                <template #default="scope">
                  <ElButton
                    type="primary"
                    link
                    size="small"
                    @click="handleViewStoryboard(scope.row)"
                    >查看</ElButton
                  >
                  <ElButton
                    type="danger"
                    link
                    size="small"
                    @click="handleDeleteStoryboard(scope.row)"
                    >删除</ElButton
                  >
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>

        <!-- 视频 -->
        <ElTabPane label="视频" name="video">
          <div class="tab-content">
            <div class="flex-cb mb-4">
              <span class="text-base font-medium">视频列表</span>
              <ElButton type="primary" size="small" @click="handleAddVideo">
                <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                添加视频
              </ElButton>
            </div>
            <ElTable v-loading="videoLoading" :data="videoList" style="width: 100%">
              <ElTableColumn prop="name" label="视频名称" min-width="180" />
              <ElTableColumn prop="duration" label="时长" width="100" />
              <ElTableColumn prop="resolution" label="分辨率" width="120" />
              <ElTableColumn prop="status" label="状态" width="100">
                <template #default="scope">
                  <ElTag
                    :type="scope.row.status === 'completed' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ scope.row.status === 'completed' ? '已完成' : '处理中' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="updateTime" label="更新时间" width="160" />
              <ElTableColumn label="操作" width="150" fixed="right">
                <template #default="scope">
                  <ElButton type="primary" link size="small" @click="handleViewVideo(scope.row)"
                    >查看</ElButton
                  >
                  <ElButton type="danger" link size="small" @click="handleDeleteVideo(scope.row)"
                    >删除</ElButton
                  >
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>

        <!-- 资产 -->
        <ElTabPane label="资产" name="asset">
          <div class="tab-content">
            <div class="flex-cb mb-4">
              <span class="text-base font-medium">资产列表</span>
              <ElButton type="primary" size="small" @click="handleAddAsset">
                <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                添加资产
              </ElButton>
            </div>
            <ElTable v-loading="assetLoading" :data="assetList" style="width: 100%">
              <ElTableColumn prop="name" label="资产名称" min-width="180" />
              <ElTableColumn prop="type" label="类型" width="120" />
              <ElTableColumn prop="size" label="大小" width="100" />
              <ElTableColumn prop="updateTime" label="更新时间" width="160" />
              <ElTableColumn label="操作" width="150" fixed="right">
                <template #default="scope">
                  <ElButton type="primary" link size="small" @click="handleViewAsset(scope.row)"
                    >查看</ElButton
                  >
                  <ElButton type="danger" link size="small" @click="handleDeleteAsset(scope.row)"
                    >删除</ElButton
                  >
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </ElTabPane>

        <!-- 成员 -->
        <ElTabPane label="成员" name="member">
          <div class="tab-content">
            <ProjectMember />
          </div>
        </ElTabPane>

        <!-- 设置 -->
        <ElTabPane label="设置" name="settings">
          <div class="tab-content">
            <ElForm :model="settingsForm" label-width="140px" class="settings-form">
              <!-- 基础配置 -->
              <div class="settings-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:settings-3-line" class="mr-2" />
                  基础配置
                </h3>
                <ElFormItem label="项目状态">
                  <ElSelect
                    v-model="settingsForm.status"
                    placeholder="请选择项目状态"
                    style="width: 200px"
                  >
                    <ElOption
                      v-for="item in statusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
                <ElFormItem label="项目名称">
                  <ElInput
                    v-model="settingsForm.name"
                    placeholder="请输入项目名称"
                    style="width: 400px"
                  />
                </ElFormItem>
                <ElFormItem label="项目描述">
                  <ElInput
                    v-model="settingsForm.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入项目描述"
                    style="width: 400px"
                  />
                </ElFormItem>
                <ElFormItem label="项目封面">
                  <ElUpload
                    class="cover-uploader"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleCoverChange"
                  >
                    <ElImage
                      v-if="settingsForm.coverPreview"
                      :src="settingsForm.coverPreview"
                      class="cover-preview"
                      fit="cover"
                    />
                    <div v-else class="cover-upload-trigger flex-cc">
                      <ArtSvgIcon icon="ri:add-line" class="text-2xl text-g-400" />
                      <span class="text-g-400 mt-1">上传封面</span>
                    </div>
                  </ElUpload>
                </ElFormItem>
              </div>

              <ElDivider />

              <!-- 审核门禁 -->
              <div class="settings-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:shield-check-line" class="mr-2" />
                  审核门禁
                </h3>
                <ElFormItem label="分镜审核">
                  <ElSwitch
                    v-model="settingsForm.reviewStoryboard"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-tip">开启后，分镜需要审核通过才能进入下一流程</span>
                </ElFormItem>
                <ElFormItem label="首帧图审核">
                  <ElSwitch
                    v-model="settingsForm.reviewFirstFrame"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-tip">开启后，首帧图需要审核通过才能生成视频</span>
                </ElFormItem>
                <ElFormItem label="视频审核">
                  <ElSwitch
                    v-model="settingsForm.reviewVideo"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-tip">开启后，生成视频需要审核通过才能导出</span>
                </ElFormItem>
              </div>

              <ElDivider />

              <!-- JSON配置 -->
              <div class="settings-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:code-box-line" class="mr-2" />
                  项目配置（JSON）
                </h3>
                <ElFormItem label="配置项">
                  <ElInput
                    v-model="settingsForm.jsonConfig"
                    type="textarea"
                    :rows="10"
                    placeholder="请输入JSON格式配置"
                    style="width: 600px"
                  />
                </ElFormItem>
                <ElFormItem>
                  <ElButton type="primary" plain @click="handleFormatJson">
                    <ArtSvgIcon icon="ri:brush-line" class="mr-1" />
                    格式化JSON
                  </ElButton>
                  <ElButton @click="handleResetJson">
                    <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                    重置默认
                  </ElButton>
                </ElFormItem>
              </div>

              <ElDivider />

              <!-- 危险操作 -->
              <div class="settings-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:alert-line" class="mr-2" />
                  危险操作
                </h3>
                <ElFormItem>
                  <ElButton type="danger" plain @click="handleArchiveProject">
                    <ArtSvgIcon icon="ri:archive-line" class="mr-1" />
                    归档项目
                  </ElButton>
                  <ElButton type="danger" @click="handleDeleteProject">
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                    删除项目
                  </ElButton>
                </ElFormItem>
              </div>
            </ElForm>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import ProjectMember from '../member/index.vue'
  import ProjectFormComponent from '../components/ProjectForm.vue'
  import {
    useProjectDetail,
    useProjectConfig,
    useReviewConfig,
    useUpdateProject,
    useUpdateProjectConfig,
    useUpdateReviewConfig,
    useUploadProjectCover,
    useDeleteProject,
    useArchiveProject,
    useProjectMembers
  } from '@/api/queries/project'
  import { useScriptList, useDeleteScript } from '@/api/queries/script'
  import { useStoryboardList, useDeleteStoryboard } from '@/api/queries/storyboard'
  import { useVideoTaskList } from '@/api/queries/video'
  import { useAssetList, useDeleteAsset } from '@/api/queries/asset'
  import { logger } from '@/utils/logger'

  defineOptions({ name: 'ProjectEdit' })

  type ProjectStatus = 0 | 1 | 2 | 3

  interface ProjectForm {
    id: string
    name: string
    description: string
    type: string
    manager: string
    status: ProjectStatus
    progress: number
    memberCount: number
    assetCount: number
    createTime: string
    updateTime: string
  }

  interface ScriptItem {
    id: number
    title: string
    author: string
    version: string
    updateTime: string
  }

  interface StoryboardItem {
    id: number
    name: string
    scene: string
    status: string
    updateTime: string
  }

  interface VideoItem {
    id: number
    name: string
    duration: string
    resolution: string
    status: string
    updateTime: string
  }

  interface AssetItem {
    id: number
    name: string
    type: string
    size: string
    updateTime: string
  }

  const router = useRouter()
  const route = useRoute()

  const projectId = ref(String(route.query.id || ''))
  const showNoProjectDialog = ref(false)

  // 检查是否从项目列表进入：如果没有有效的项目ID，提示用户通过项目列表进入编辑
  onMounted(() => {
    if (!route.query.id) {
      showNoProjectDialog.value = true
    }
  })

  const handleGoToList = () => {
    showNoProjectDialog.value = false
    router.push('/project/list')
  }

  // Vue-query: 项目详情
  const { data: projectDetail } = useProjectDetail(computed(() => projectId.value || undefined))
  // Vue-query: 项目配置
  const { data: projectConfig } = useProjectConfig(computed(() => projectId.value || undefined))
  // Vue-query: 审核配置
  const { data: reviewConfig } = useReviewConfig(computed(() => projectId.value || undefined))

  // Vue-query: 剧本列表
  const { data: scriptListResult, isLoading: scriptLoading } = useScriptList(projectId)
  // Vue-query: 分镜列表
  const { data: storyboardListResult, isLoading: storyboardLoading } = useStoryboardList(projectId)
  // Vue-query: 视频列表
  const { data: videoListResult, isLoading: videoLoading } = useVideoTaskList(
    computed(() => ({ projectId: projectId.value || undefined }))
  )
  // Vue-query: 资产列表
  const { data: assetListResult, isLoading: assetLoading } = useAssetList(projectId)
  // Vue-query: 项目成员
  const { data: memberListResult } = useProjectMembers(projectId, undefined)

  // Mutations
  const updateProjectMutation = useUpdateProject()
  const updateProjectConfigMutation = useUpdateProjectConfig()
  const updateReviewConfigMutation = useUpdateReviewConfig()
  const uploadCoverMutation = useUploadProjectCover()
  const deleteProjectMutation = useDeleteProject()
  const archiveProjectMutation = useArchiveProject()
  const deleteScriptMutation = useDeleteScript()
  const deleteStoryboardMutation = useDeleteStoryboard()
  const deleteVideoMutation = useDeleteAsset()
  const deleteAssetMutation = useDeleteAsset()

  const activeTab = ref('overview')
  const projectFormRef = ref<InstanceType<typeof ProjectFormComponent>>()

  const initProjectForm = () => {
    if (projectFormRef.value) {
      projectFormRef.value.form.name = projectForm.name
      projectFormRef.value.form.description = projectForm.description
    }
  }

  watch(activeTab, (tab) => {
    if (tab === 'overview') {
      initProjectForm()
    }
  })

  const statusTypeMap: Record<ProjectStatus, 'info' | 'primary' | 'success' | 'warning'> = {
    0: 'info',
    1: 'primary',
    2: 'success',
    3: 'warning'
  }

  const statusLabelMap: Record<ProjectStatus, string> = {
    0: '草稿',
    1: '进行中',
    2: '已完成',
    3: '已归档'
  }

  const mapApiStatus = (status: number): ProjectStatus => {
    if ([0, 1, 2, 3].includes(status)) return status as ProjectStatus
    return 0
  }

  const projectForm = reactive<ProjectForm>({
    id: String(route.query.id || ''),
    name: '',
    description: '',
    type: '',
    manager: '',
    status: 0,
    progress: 0,
    memberCount: 0,
    assetCount: 0,
    createTime: '',
    updateTime: ''
  })

  const defaultJson = JSON.stringify(
    {
      camera_types: 'default',
      crane_modes: 'default',
      ai_switches: 'on',
      video_spec: '1080p',
      fps: '24',
      output_formats: 'mp4',
      aspect_ratio: '16:9',
      resolution: '1920x1080',
      template_id: ''
    },
    null,
    2
  )

  const settingsForm = reactive({
    status: 0 as ProjectStatus,
    name: '',
    description: '',
    cover: '',
    coverPreview: '',
    reviewStoryboard: true,
    reviewFirstFrame: true,
    reviewVideo: false,
    jsonConfig: defaultJson
  })

  // 封面是否已被用户修改但尚未通过"保存修改"持久化到项目，避免详情查询失效刷新时覆盖未保存的预览
  const coverDirty = ref(false)

  // 监听项目详情数据，自动映射到表单
  watch(
    projectDetail,
    (res) => {
      if (res) {
        logger.info('ProjectEdit', '项目详情加载完成')
        projectForm.id = res.id != null ? String(res.id) : projectForm.id
        projectForm.name = res.projectName || ''
        projectForm.description = res.description || ''
        projectForm.type = ''
        projectForm.manager = res.creatorName || ''
        projectForm.status = mapApiStatus(res.status)
        projectForm.progress = 0
        projectForm.memberCount = res.memberCount || 0
        projectForm.assetCount = res.assetCount || res.storyboardCount || 0
        projectForm.createTime = res.createTime || ''
        projectForm.updateTime = res.updateTime || ''
        // 同步设置表单
        settingsForm.name = res.projectName || ''
        settingsForm.description = res.description || ''
        settingsForm.status = mapApiStatus(res.status)
        // 仅当用户未在本地修改过封面时，才用详情数据覆盖预览，避免上传成功后被覆盖
        if (!coverDirty.value) {
          settingsForm.coverPreview = res.coverImage || ''
        }
        initProjectForm()
      }
    },
    { immediate: true }
  )

  // 监听项目配置数据
  watch(
    projectConfig,
    (config) => {
      if (config) {
        logger.info('ProjectEdit', '项目配置加载完成')
        const configs = config.configs || {}
        if (typeof configs === 'object' && Object.keys(configs).length > 0) {
          settingsForm.jsonConfig = JSON.stringify(configs, null, 2)
        }
      }
    },
    { immediate: true }
  )

  // 监听审核配置数据
  watch(
    reviewConfig,
    (config) => {
      if (config) {
        logger.info('ProjectEdit', '审核配置加载完成')
        settingsForm.reviewStoryboard = config.storyboard ?? true
        settingsForm.reviewFirstFrame = config.firstFrame ?? true
        settingsForm.reviewVideo = config.video ?? false
      }
    },
    { immediate: true }
  )

  const scriptList = computed<ScriptItem[]>(() =>
    (scriptListResult.value?.records ?? []).map((item: any) => ({
      id: Number(item.id) || 0,
      title: item.title || item.name || '',
      author: item.author || '',
      version: item.version || 'v1.0',
      updateTime: item.updateTime || ''
    }))
  )

  const storyboardList = computed<StoryboardItem[]>(() =>
    (storyboardListResult.value?.records ?? []).map((item: any) => ({
      id: Number(item.id) || 0,
      name: item.name || item.title || '',
      scene: item.sceneName || item.scene || '',
      status: mapStoryboardStatus(item.status),
      updateTime: item.updateTime || ''
    }))
  )

  const videoList = computed<VideoItem[]>(() =>
    (videoListResult.value?.records ?? []).map((item: any) => ({
      id: Number(item.id) || 0,
      name: item.name || item.taskName || '',
      duration: item.duration || '00:00',
      resolution: item.resolution || '1920x1080',
      status: mapVideoStatus(item.status),
      updateTime: item.updateTime || item.createdAt || ''
    }))
  )

  const assetList = computed<AssetItem[]>(() =>
    (assetListResult.value?.records ?? []).map((item: any) => ({
      id: Number(item.id) || 0,
      name: item.assetName || item.name || '',
      type: item.assetType || item.type || '',
      size: item.fileSize ? formatFileSize(item.fileSize) : item.size || '',
      updateTime: item.updateTime || ''
    }))
  )

  const memberOptions = computed<{ label: string; value: string }[]>(() =>
    (memberListResult.value?.records ?? []).map((item: any) => ({
      label: item.userName || item.name || item.nickname || '',
      value: String(item.userId || item.id || '')
    }))
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + 'B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
  }

  const mapStoryboardStatus = (status: any): string => {
    const map: Record<string, string> = {
      completed: 'completed',
      approved: 'completed',
      progress: 'progress',
      drawing: 'progress',
      draft: 'progress'
    }
    return map[String(status)] || 'progress'
  }

  const mapVideoStatus = (status: any): string => {
    const map: Record<string, string> = {
      completed: 'completed',
      success: 'completed',
      processing: 'progress',
      pending: 'progress',
      progress: 'progress',
      failed: 'progress'
    }
    return map[String(status)] || 'progress'
  }

  const statusOptions = [
    { label: '草稿', value: 0 },
    { label: '进行中', value: 1 },
    { label: '已完成', value: 2 },
    { label: '已归档', value: 3 }
  ]

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(settingsForm.jsonConfig)
      settingsForm.jsonConfig = JSON.stringify(parsed, null, 2)
      ElMessage.success('JSON格式化成功')
    } catch {
      ElMessage.error('JSON格式错误，请检查')
    }
  }

  const handleResetJson = () => {
    settingsForm.jsonConfig = defaultJson
    ElMessage.success('已重置为默认配置')
  }

  const handleBack = () => {
    router.back()
  }

  const handleSave = async () => {
    const valid = await projectFormRef.value?.validate()
    if (!valid) return

    const form = projectFormRef.value?.form
    if (form) {
      projectForm.name = form.name
      projectForm.description = form.description
    }
    try {
      await updateProjectMutation.mutateAsync({
        projectId: projectForm.id,
        params: {
          projectName: projectForm.name,
          description: projectForm.description,
          coverImage: settingsForm.coverPreview || undefined
        }
      })
      logger.info('ProjectEdit', '项目信息保存成功')
      // 保存项目配置（Map<String,String> 全量替换）
      try {
        let configData: Record<string, string> = {}
        try {
          configData = JSON.parse(settingsForm.jsonConfig)
        } catch {
          // JSON格式无效，使用空配置
        }
        await updateProjectConfigMutation.mutateAsync({
          projectId: projectForm.id,
          configs: configData
        })
        logger.info('ProjectEdit', '项目配置保存成功')
      } catch {
        logger.warn('ProjectEdit', '项目配置保存失败')
        // 配置保存失败不阻断主流程
      }
      // 保存审核配置
      try {
        await updateReviewConfigMutation.mutateAsync({
          projectId: projectForm.id,
          params: {
            storyboard: settingsForm.reviewStoryboard,
            firstFrame: settingsForm.reviewFirstFrame,
            video: settingsForm.reviewVideo
          }
        })
        logger.info('ProjectEdit', '审核配置保存成功')
      } catch {
        logger.warn('ProjectEdit', '审核配置保存失败')
        // 审核配置保存失败不阻断主流程
      }
      projectForm.updateTime = new Date().toISOString().slice(0, 10)
      // 已成功持久化，允许后续详情刷新覆盖
      coverDirty.value = false
      ElMessage.success('保存成功')
    } catch {
      logger.error('ProjectEdit', '项目保存失败')
      ElMessage.error('保存失败')
    }
  }

  const handleCoverChange = async (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (!raw) return
    // 先显示本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      settingsForm.coverPreview = (e.target?.result as string) || ''
    }
    reader.readAsDataURL(raw)
    // 上传到服务器
    const pid = projectForm.id
    if (pid) {
      try {
        const res = await uploadCoverMutation.mutateAsync({
          projectId: pid,
          file: raw
        })
        if (res && res.coverUrl) {
          settingsForm.coverPreview = res.coverUrl
          // 标记封面已被本地修改，等"保存修改"提交后才同步详情
          coverDirty.value = true
        }
        logger.info('ProjectEdit', '封面上传成功')
        ElMessage.success('封面上传成功')
      } catch {
        logger.error('ProjectEdit', '封面上传失败')
        ElMessage.error('封面上传失败')
      }
    }
  }

  const handleArchiveProject = () => {
    ElMessageBox.confirm('确定要归档该项目吗？归档后项目将变为只读状态。', '归档确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await archiveProjectMutation.mutateAsync(projectForm.id)
        projectForm.status = 3
        settingsForm.status = 3
        ElMessage.success('项目已归档')
      } catch {
        ElMessage.error('归档失败')
      }
    })
  }

  const handleDeleteProject = () => {
    ElMessageBox.confirm('确定要删除该项目吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      try {
        await deleteProjectMutation.mutateAsync(projectForm.id)
        ElMessage.success('项目已删除')
        router.push('/project/list')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 剧本操作
  const handleAddScript = () => {
    router.push(`/script/manage?projectId=${route.query.id}&action=create`)
  }
  const handleViewScript = (row: ScriptItem) => {
    router.push(`/script/library?id=${row.id}`)
  }
  const handleDeleteScript = (row: ScriptItem) => {
    ElMessageBox.confirm(`确定要删除剧本「${row.title}」吗？`, '删除确认', {
      type: 'warning'
    }).then(async () => {
      try {
        await deleteScriptMutation.mutateAsync({ scriptId: String(row.id) })
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 分镜操作
  const handleAddStoryboard = () => {
    router.push(`/storyboard/design?projectId=${route.query.id}&action=create`)
  }
  const handleViewStoryboard = (row: StoryboardItem) => {
    router.push(`/storyboard/design?id=${row.id}`)
  }
  const handleDeleteStoryboard = (row: StoryboardItem) => {
    ElMessageBox.confirm(`确定要删除分镜「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(async () => {
      try {
        await deleteStoryboardMutation.mutateAsync({ storyboardId: String(row.id), projectId: projectId.value })
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 视频操作
  const handleAddVideo = () => {
    router.push(`/video/generate?projectId=${route.query.id}`)
  }
  const handleViewVideo = (row: VideoItem) => {
    router.push(`/video/task?id=${row.id}`)
  }
  const handleDeleteVideo = (row: VideoItem) => {
    ElMessageBox.confirm(`确定要删除视频「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(async () => {
      try {
        await deleteAssetMutation.mutateAsync({ projectId: projectId.value, assetId: String(row.id) })
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 资产操作
  const handleAddAsset = () => {
    router.push(`/asset/manage?projectId=${route.query.id}&action=upload`)
  }
  const handleViewAsset = (row: AssetItem) => {
    router.push(`/asset/detail?id=${row.id}&projectId=${route.query.id}`)
  }
  const handleDeleteAsset = (row: AssetItem) => {
    ElMessageBox.confirm(`确定要删除资产「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(async () => {
      try {
        await deleteAssetMutation.mutateAsync({ projectId: projectId.value, assetId: String(row.id) })
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }
</script>

<style lang="scss" scoped>
  .project-tabs {
    :deep(.el-tabs__content) {
      padding: 0;
      overflow: auto;
    }
  }

  .tab-content {
    padding: 20px;
  }

  .project-stats {
    .stat-item {
      font-size: 14px;
    }
  }

  .cover-uploader {
    :deep(.el-upload) {
      position: relative;
      width: 200px;
      height: 120px;
      overflow: hidden;
      cursor: pointer;
      border: 1px dashed var(--el-border-color);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .cover-preview {
    display: block;
    width: 200px;
    height: 120px;
    object-fit: cover;
  }

  .cover-upload-trigger {
    flex-direction: column;
    width: 200px;
    height: 120px;
  }

  .settings-form {
    max-width: 800px;

    .settings-section {
      .section-title {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .form-tip {
      margin-left: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  // 无项目ID提示弹窗样式
  .no-project-dialog {
    :deep(.el-dialog__header) {
      text-align: center;
      padding-bottom: 0;
    }

    :deep(.el-dialog__body) {
      padding: 24px 32px 8px;
    }

    :deep(.el-dialog__footer) {
      padding: 16px 32px 24px;
      border-top: none;
    }
  }

  .no-project-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8px 0;

    .no-project-icon {
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--el-color-primary-light-9);
      border-radius: 50%;
      margin-bottom: 16px;
    }

    .no-project-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 12px;
    }

    .no-project-desc {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      line-height: 1.6;
      margin: 0;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    width: 100%;
  }
</style>
