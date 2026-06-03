<template>
  <div class="script-profiles-page art-full-height">
    <ElCard class="art-table-card h-full">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-4">
            <span class="text-lg font-medium">人物小传</span>
            <ProjectSwitcher
              v-model="currentProjectId"
              :project-list="projectList"
              @change="handleProjectChange"
              @refresh="handleProjectRefresh"
            />
            <ElSelect
              v-model="currentScriptId"
              placeholder="选择剧本"
              clearable
              style="width: 220px"
              @change="handleScriptChange"
            >
              <ElOption
                v-for="script in scriptOptions"
                :key="script.id"
                :label="script.title"
                :value="script.id"
              />
            </ElSelect>
          </div>
          <ElSpace>
            <ElInput
              v-model="searchQuery"
              placeholder="搜索人物名称"
              clearable
              style="width: 220px"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
              </template>
            </ElInput>
            <ElButton type="primary" @click="handleGenerate">
              <ArtSvgIcon icon="ri:ai-generate" class="mr-1" />
              AI生成小传
            </ElButton>
          </ElSpace>
        </div>
      </template>

      <ElRow :gutter="16" class="h-full">
        <!-- 左栏：人物列表 -->
        <ElCol :span="7">
          <div class="profile-list">
            <div class="list-header flex-cb mb-4">
              <span class="font-medium">人物列表</span>
              <span class="text-xs text-g-400">共 {{ profileList.length }} 人</span>
            </div>
            <div v-if="filteredProfiles.length > 0" class="profile-items">
              <div
                v-for="item in filteredProfiles"
                :key="item.name"
                class="profile-item"
                :class="{ active: currentProfile?.name === item.name }"
                @click="handleProfileSelect(item)"
              >
                <div class="flex-c">
                  <ElAvatar :size="44" class="mr-3">
                    <ArtSvgIcon icon="ri:user-line" />
                  </ElAvatar>
                  <div class="profile-info">
                    <div class="flex items-center gap-2">
                      <span class="font-medium">{{ item.name }}</span>
                      <ElTag :type="verificationTagType(item.verificationStatus)" size="small">
                        {{ verificationLabel(item.verificationStatus) }}
                      </ElTag>
                    </div>
                    <div class="text-xs text-g-400 mt-1">{{ item.identity }}</div>
                  </div>
                </div>
              </div>
            </div>
            <ElEmpty v-else description="暂无人物数据" />
          </div>
        </ElCol>

        <!-- 右栏：人物详情 -->
        <ElCol :span="17">
          <div v-if="currentProfile" class="profile-detail">
            <ElTabs v-model="activeTab" type="border-card">
              <ElTabPane label="基本信息" name="basic">
                <ElDescriptions :column="2" border>
                  <ElDescriptionsItem label="姓名">{{ currentProfile.name }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="身份">{{
                    currentProfile.identity
                  }}</ElDescriptionsItem>
                  <ElDescriptionsItem label="外貌特征" :span="2">
                    {{ currentProfile.appearance || '暂无描述' }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="性格特点" :span="2">
                    {{ currentProfile.personality || '暂无描述' }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="语音参考">
                    {{ currentProfile.voiceRef || '暂无' }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="出场范围">
                    {{ currentProfile.appearanceSpan || '暂无' }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="验证状态">
                    <ElTag
                      :type="verificationTagType(currentProfile.verificationStatus)"
                      size="small"
                    >
                      {{ verificationLabel(currentProfile.verificationStatus) }}
                    </ElTag>
                  </ElDescriptionsItem>
                </ElDescriptions>
              </ElTabPane>

              <ElTabPane label="背景故事" name="background">
                <div class="info-section">
                  <h3 class="section-title">
                    <ArtSvgIcon icon="ri:book-open-line" class="mr-2" />
                    人物背景
                  </h3>
                  <ElInput
                    :model-value="currentProfile.background"
                    type="textarea"
                    :rows="12"
                    readonly
                    resize="vertical"
                  />
                </div>
              </ElTabPane>

              <ElTabPane label="关系网络" name="relations">
                <div
                  v-if="currentProfile.relations && currentProfile.relations.length > 0"
                  class="relation-list"
                >
                  <div
                    v-for="(relation, index) in currentProfile.relations"
                    :key="index"
                    class="relation-item flex-cb"
                  >
                    <div class="flex-c">
                      <ElAvatar :size="40">
                        <ArtSvgIcon icon="ri:user-line" />
                      </ElAvatar>
                      <div class="ml-3">
                        <div class="font-medium">{{ relation.target }}</div>
                      </div>
                    </div>
                    <ElTag type="primary" size="small">{{ relation.relation }}</ElTag>
                  </div>
                </div>
                <ElEmpty v-else description="暂无关系数据" />
              </ElTabPane>
            </ElTabs>
          </div>
          <ElEmpty v-else description="请选择左侧人物查看详情" />
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import {
    fetchGetScriptList,
    fetchGenerateCharacterProfiles,
    fetchGetCharacterProfiles,
    fetchGetScriptEpisodes
  } from '@/api/script'
  import ProjectSwitcher from '@/components/ProjectSwitcher/index.vue'

  defineOptions({ name: 'ScriptProfiles' })

  // ==================== 类型定义 ====================
  interface CharacterProfileItem {
    name: string
    identity: string
    appearance: string
    personality: string
    background: string
    voiceRef: string
    appearanceSpan: string
    verificationStatus: string
    relations: { target: string; relation: string }[]
  }

  // CharacterProfileResult 和 AiProcessResult 已迁移至 Api.Script 类型定义

  interface ScriptOption {
    id: string
    title: string
  }

  interface EpisodeOption {
    id: string
    episodeName: string
  }

  // ==================== Store ====================
  const scriptProjectStore = useScriptProjectStore()
  const { currentProjectId, projectList } = storeToRefs(scriptProjectStore)

  // ==================== 响应式状态 ====================
  const currentScriptId = ref('')
  const scriptOptions = ref<ScriptOption[]>([])
  const searchQuery = ref('')
  const profileList = ref<CharacterProfileItem[]>([])
  const currentProfile = ref<CharacterProfileItem | null>(null)
  const activeTab = ref('basic')

  // ==================== 验证状态映射 ====================
  const verificationTagType = (status: string): 'success' | 'warning' | 'info' => {
    const map: Record<string, 'success' | 'warning' | 'info'> = {
      verified: 'success',
      pending: 'warning',
      unverified: 'info'
    }
    return map[status] || 'info'
  }

  const verificationLabel = (status: string): string => {
    const map: Record<string, string> = {
      verified: '已验证',
      pending: '待验证',
      unverified: '未验证'
    }
    return map[status] || '未验证'
  }

  // ==================== 计算属性 ====================
  const filteredProfiles = computed(() => {
    if (!searchQuery.value) return profileList.value
    const q = searchQuery.value.toLowerCase()
    return profileList.value.filter(
      (item) => item.name.toLowerCase().includes(q) || item.identity.toLowerCase().includes(q)
    )
  })

  // ==================== 数据加载 ====================
  const loadScriptList = async (projectId: string) => {
    if (!projectId) {
      scriptOptions.value = []
      return
    }
    try {
      const res = await fetchGetScriptList(projectId)
      const arr = res?.records || []
      scriptOptions.value = arr.map((s: Api.Script.ScriptListItem) => ({
        id: String(s.id),
        title: s.title ?? '未命名剧本'
      }))
      let sid = scriptProjectStore.currentScriptId
      if (!sid && scriptOptions.value.length > 0) {
        sid = scriptOptions.value[0].id
      }
      if (sid) {
        currentScriptId.value = sid
        scriptProjectStore.setCurrentScript(sid)
        await loadProfiles(sid)
      }
    } catch {
      scriptOptions.value = []
    }
  }

  const loadProfiles = async (scriptId: string) => {
    if (!scriptId) {
      profileList.value = []
      currentProfile.value = null
      activeTab.value = 'basic'
      return
    }
    try {
      const res = await fetchGetCharacterProfiles(scriptId)
      const result = res as Api.Script.CharacterProfileResult | null
      const profiles = result?.profiles ?? []
      if (profiles.length > 0) {
        profileList.value = profiles.map((p: Api.Script.CharacterProfileItem) => ({
          name: p.name ?? '',
          identity: p.identity ?? '',
          appearance: p.appearance ?? '',
          personality: p.personality ?? '',
          background: p.background ?? '',
          voiceRef: p.voiceRef ?? '',
          appearanceSpan: p.appearanceSpan ?? '',
          verificationStatus: p.verificationStatus ?? 'unverified',
          relations: (p.relations ?? []).map((r: { target: string; relation: string }) => ({
            target: r.target ?? '',
            relation: r.relation ?? ''
          }))
        })) as CharacterProfileItem[]
        currentProfile.value = profileList.value[0] || null
        activeTab.value = 'basic'
      } else {
        profileList.value = []
        currentProfile.value = null
        activeTab.value = 'basic'
      }
    } catch {
      profileList.value = []
      currentProfile.value = null
      activeTab.value = 'basic'
    }
  }

  // ==================== 事件处理 ====================
  const handleProjectChange = (projectId: string) => {
    scriptProjectStore.setCurrentProject(projectId)
    currentScriptId.value = ''
    profileList.value = []
    currentProfile.value = null
    activeTab.value = 'basic'
    loadScriptList(projectId)
  }

  const handleProjectRefresh = () => {
    loadScriptList(currentProjectId.value)
    ElMessage.success('数据已刷新')
  }

  const handleScriptChange = (scriptId: string) => {
    scriptProjectStore.setCurrentScript(scriptId)
    loadProfiles(scriptId)
  }

  const handleProfileSelect = (item: CharacterProfileItem) => {
    currentProfile.value = item
    activeTab.value = 'basic'
  }

  const handleGenerate = async () => {
    if (!currentScriptId.value) {
      ElMessage.warning('请先选择剧本')
      return
    }
    try {
      // 获取分集列表供用户选择
      let episodeOptions: EpisodeOption[] = []
      try {
        const res = await fetchGetScriptEpisodes(currentProjectId.value, currentScriptId.value)
        const arr = res ?? []
        episodeOptions = arr.map((ep: Api.Script.Episode) => ({
          id: String(ep.id),
          episodeName: ep.episodeName ?? ''
        }))
      } catch {
        // 获取分集失败不影响主流程
      }

      const hasEpisodes = episodeOptions.length > 0
      const episodeHint = hasEpisodes
        ? `\n\n可选择指定分集（可选，不选则处理全部）：\n${episodeOptions.map((ep) => `• ${ep.episodeName}`).join('\n')}`
        : ''

      await ElMessageBox.confirm(`将调用AI生成人物小传，是否继续？${episodeHint}`, 'AI生成确认', {
        confirmButtonText: '确定生成',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      })
    } catch {
      return
    }

    try {
      ElMessage.info('AI人物小传生成中，请稍候...')
      const res = await fetchGenerateCharacterProfiles(
        currentProjectId.value,
        currentScriptId.value
      )
      if (res?.status === 'PROCESSING') {
        ElMessage.success('AI生成任务已提交，请稍后刷新查看结果')
      } else {
        ElMessage.success('人物小传生成完成')
        await loadProfiles(currentScriptId.value)
      }
    } catch {
      ElMessage.error('人物小传生成失败')
    }
  }

  // ==================== 初始化 ====================
  onMounted(() => {
    loadScriptList(currentProjectId.value)
  })
</script>

<style lang="scss" scoped>
  .script-profiles-page {
    .profile-list {
      height: calc(100vh - 240px);
      padding-right: 8px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--el-text-color-secondary);
      }

      .list-header {
        padding-bottom: 12px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .profile-items {
        .profile-item {
          padding: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          border: 1px solid var(--el-border-color-lighter);
          border-radius: var(--custom-radius);
          transition: all 0.2s;

          &.active {
            background: var(--el-color-primary-light-9);
            border-left: 3px solid var(--el-color-primary);
          }

          &:hover {
            border-color: var(--el-color-primary-light-5);
          }

          .profile-info {
            flex: 1;
            min-width: 0;
          }
        }
      }
    }

    .profile-detail {
      height: calc(100vh - 240px);
      padding: 0 16px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--el-text-color-secondary);
      }
    }

    .info-section {
      .section-title {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .relation-list {
      .relation-item {
        padding: 12px;
        margin-bottom: 12px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
      }
    }
  }
</style>
