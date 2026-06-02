<template>
  <div class="project-edit-page art-full-height">
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
            <ElTable :data="scriptList" style="width: 100%">
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
            <ElTable :data="storyboardList" style="width: 100%">
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
            <ElTable :data="videoList" style="width: 100%">
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
            <ElTable :data="assetList" style="width: 100%">
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

              <!-- 小组配置 -->
              <div class="settings-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:team-line" class="mr-2" />
                  小组配置
                </h3>
                <ElFormItem label="启用声音组">
                  <ElSwitch
                    v-model="settingsForm.enableSoundGroup"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                  <span class="form-tip">开启后，项目将启用独立的声音处理小组</span>
                </ElFormItem>
                <ElFormItem label="声音组成员">
                  <ElSelect
                    v-model="settingsForm.soundMembers"
                    multiple
                    placeholder="请选择声音组成员"
                    style="width: 400px"
                    :disabled="!settingsForm.enableSoundGroup"
                  >
                    <ElOption
                      v-for="item in memberOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </ElSelect>
                </ElFormItem>
              </div>

              <ElDivider />

              <!-- 通用设置 -->
              <div class="settings-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:toggle-line" class="mr-2" />
                  通用设置
                </h3>
                <ElFormItem label="公开项目">
                  <ElSwitch v-model="settingsForm.isPublic" />
                  <span class="form-tip">开启后项目将对团队成员可见</span>
                </ElFormItem>
                <ElFormItem label="开启通知">
                  <ElSwitch v-model="settingsForm.enableNotify" />
                  <span class="form-tip">开启后将接收项目动态通知</span>
                </ElFormItem>
                <ElFormItem label="自动归档">
                  <ElSwitch v-model="settingsForm.autoArchive" />
                  <span class="form-tip">项目完成后自动归档</span>
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
    fetchGetProjectDetail,
    fetchUpdateProject,
    fetchArchiveProject,
    fetchDeleteProject
  } from '@/api/project'

  defineOptions({ name: 'ProjectEdit' })

  type ProjectStatus = 'progress' | 'completed' | 'paused' | 'archived'

  interface ProjectForm {
    id: number
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

  const activeTab = ref('overview')
  const projectFormRef = ref<InstanceType<typeof ProjectFormComponent>>()

  const initProjectForm = () => {
    if (projectFormRef.value) {
      projectFormRef.value.form.name = projectForm.name
      projectFormRef.value.form.description = projectForm.description
      projectFormRef.value.form.type = projectForm.type
      projectFormRef.value.form.manager = projectForm.manager
      projectFormRef.value.form.status = projectForm.status
      projectFormRef.value.form.progress = projectForm.progress
    }
  }

  watch(activeTab, (tab) => {
    if (tab === 'overview') {
      initProjectForm()
    }
  })

  const statusTypeMap: Record<ProjectStatus, any> = {
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

  const projectForm = reactive<ProjectForm>({
    id: Number(route.query.id) || 1,
    name: '',
    description: '',
    type: '',
    manager: '',
    status: 'progress',
    progress: 0,
    memberCount: 0,
    assetCount: 0,
    createTime: '',
    updateTime: ''
  })

  const loadProjectDetail = async () => {
    const projectId = String(route.query.id)
    if (!projectId) return
    try {
      const res = await fetchGetProjectDetail(projectId)
      if (res) {
        projectForm.id = Number(res.id) || projectForm.id
        projectForm.name = res.name || ''
        projectForm.description = res.description || ''
        projectForm.type = (res as any).type || ''
        projectForm.manager = res.ownerName || ''
        projectForm.status = mapApiStatus(res.status)
        projectForm.progress = (res as any).progress || 0
        projectForm.memberCount = res.memberCount || 0
        projectForm.assetCount = (res as any).assetCount || (res as any).storyboardCount || 0
        projectForm.createTime = res.createTime || ''
        projectForm.updateTime = res.updateTime || ''
        initProjectForm()
      }
    } catch (error) {
      console.error('加载项目详情失败:', error)
    }
  }

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

  onMounted(() => {
    loadProjectDetail()
  })

  const scriptList = ref<ScriptItem[]>([
    { id: 1, title: '第一集：神兽现世', author: '张三', version: 'v1.2', updateTime: '2024-06-10' },
    { id: 2, title: '第二集：山海奇遇', author: '李四', version: 'v1.0', updateTime: '2024-06-12' },
    { id: 3, title: '第三集：归途', author: '张三', version: 'v0.9', updateTime: '2024-06-14' }
  ])

  const storyboardList = ref<StoryboardItem[]>([
    { id: 1, name: '开场分镜', scene: '神兽山', status: 'completed', updateTime: '2024-06-08' },
    { id: 2, name: '战斗分镜', scene: '战场', status: 'progress', updateTime: '2024-06-12' },
    { id: 3, name: '结尾分镜', scene: '村庄', status: 'progress', updateTime: '2024-06-14' }
  ])

  const videoList = ref<VideoItem[]>([
    {
      id: 1,
      name: '预告片',
      duration: '01:30',
      resolution: '1920x1080',
      status: 'completed',
      updateTime: '2024-06-10'
    },
    {
      id: 2,
      name: '第一集成片',
      duration: '15:20',
      resolution: '1920x1080',
      status: 'progress',
      updateTime: '2024-06-14'
    }
  ])

  const assetList = ref<AssetItem[]>([
    { id: 1, name: '主角模型', type: '3D模型', size: '15MB', updateTime: '2024-06-10' },
    { id: 2, name: '森林场景', type: '场景', size: '50MB', updateTime: '2024-06-12' },
    { id: 3, name: '战斗音效', type: '音频', size: '5MB', updateTime: '2024-06-14' }
  ])

  const statusOptions = [
    { label: '进行中', value: 'progress' },
    { label: '已完成', value: 'completed' },
    { label: '已暂停', value: 'paused' },
    { label: '已归档', value: 'archived' }
  ]

  const memberOptions = [
    { label: '张小明', value: 'zhangxm' },
    { label: '李小红', value: 'lixh' },
    { label: '王小刚', value: 'wangxg' },
    { label: '赵小美', value: 'zhaoxm' },
    { label: '周小芳', value: 'zhouxf' }
  ]

  const defaultJson = `{
  "render": {
    "resolution": "1920x1080",
    "fps": 24,
    "format": "mp4"
  },
  "ai": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "workflow": {
    "autoAssign": true,
    "notifyOnComplete": true,
    "backupInterval": 3600
  }
}`

  const settingsForm = reactive({
    status: 'progress',
    name: '山海经动画',
    description: '基于山海经神话故事的动画短片项目，讲述少年阿禹的冒险旅程',
    cover: '',
    coverPreview: '',
    reviewStoryboard: true,
    reviewFirstFrame: true,
    reviewVideo: false,
    enableSoundGroup: true,
    soundMembers: ['zhouxf', 'lixh'],
    isPublic: true,
    enableNotify: true,
    autoArchive: false,
    jsonConfig: defaultJson
  })

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
      projectForm.type = form.type
      projectForm.manager = form.manager
      projectForm.status = form.status as ProjectStatus
      projectForm.progress = form.progress
    }
    try {
      await fetchUpdateProject(String(projectForm.id), {
        name: projectForm.name,
        description: projectForm.description
      })
      projectForm.updateTime = new Date().toISOString().slice(0, 10)
      ElMessage.success('保存成功')
    } catch {
      ElMessage.error('保存失败')
    }
  }

  const handleCoverChange = (uploadFile: UploadFile) => {
    const raw = uploadFile.raw
    if (raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        settingsForm.coverPreview = (e.target?.result as string) || ''
        settingsForm.cover = settingsForm.coverPreview
      }
      reader.readAsDataURL(raw)
    }
  }

  const handleArchiveProject = () => {
    ElMessageBox.confirm('确定要归档该项目吗？归档后项目将变为只读状态。', '归档确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchArchiveProject(String(projectForm.id))
        projectForm.status = 'archived'
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
        await fetchDeleteProject(String(projectForm.id))
        ElMessage.success('项目已删除')
        router.push('/project/list')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  // 剧本操作
  const handleAddScript = () => {
    scriptList.value.push({
      id: Date.now(),
      title: '新剧本',
      author: '当前用户',
      version: 'v1.0',
      updateTime: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('剧本添加成功')
  }
  const handleViewScript = (row: ScriptItem) => {
    ElMessage.info(`查看剧本: ${row.title}`)
  }
  const handleDeleteScript = (row: ScriptItem) => {
    ElMessageBox.confirm(`确定要删除剧本「${row.title}」吗？`, '删除确认', {
      type: 'warning'
    }).then(() => {
      scriptList.value = scriptList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  // 分镜操作
  const handleAddStoryboard = () => {
    storyboardList.value.push({
      id: Date.now(),
      name: '新分镜',
      scene: '未命名场景',
      status: 'progress',
      updateTime: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('分镜添加成功')
  }
  const handleViewStoryboard = (row: StoryboardItem) => {
    ElMessage.info(`查看分镜: ${row.name}`)
  }
  const handleDeleteStoryboard = (row: StoryboardItem) => {
    ElMessageBox.confirm(`确定要删除分镜「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(() => {
      storyboardList.value = storyboardList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  // 视频操作
  const handleAddVideo = () => {
    videoList.value.push({
      id: Date.now(),
      name: '新视频',
      duration: '00:00',
      resolution: '1920x1080',
      status: 'progress',
      updateTime: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('视频添加成功')
  }
  const handleViewVideo = (row: VideoItem) => {
    ElMessage.info(`查看视频: ${row.name}`)
  }
  const handleDeleteVideo = (row: VideoItem) => {
    ElMessageBox.confirm(`确定要删除视频「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(() => {
      videoList.value = videoList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  // 资产操作
  const handleAddAsset = () => {
    assetList.value.push({
      id: Date.now(),
      name: '新资产',
      type: '未分类',
      size: '0KB',
      updateTime: new Date().toISOString().slice(0, 10)
    })
    ElMessage.success('资产添加成功')
  }
  const handleViewAsset = (row: AssetItem) => {
    ElMessage.info(`查看资产: ${row.name}`)
  }
  const handleDeleteAsset = (row: AssetItem) => {
    ElMessageBox.confirm(`确定要删除资产「${row.name}」吗？`, '删除确认', {
      type: 'warning'
    }).then(() => {
      assetList.value = assetList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
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
      border: 1px dashed var(--el-border-color);
      border-radius: calc(var(--custom-radius) / 2 + 2px);
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
      width: 200px;
      height: 120px;

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .cover-preview {
    width: 200px;
    height: 120px;
    display: block;
    object-fit: cover;
  }

  .cover-upload-trigger {
    width: 200px;
    height: 120px;
    flex-direction: column;
  }

  .settings-form {
    max-width: 800px;

    .settings-section {
      .section-title {
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 20px;
      }
    }

    .form-tip {
      margin-left: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
