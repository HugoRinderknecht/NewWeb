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
            <ElButton
              type="primary"
              :loading="generateRecordId !== ''"
              :disabled="generateRecordId !== ''"
              @click="handleGenerate"
            >
              <ArtSvgIcon icon="ri:ai-generate" class="mr-1" />
              {{ generateRecordId !== '' ? 'AI小传生成中...' : 'AI生成小传' }}
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
            <div v-if="characterProfilesQuery.isLoading.value" class="py-6 text-center">
              <ElIcon class="is-loading"><i class="ri:loader-4-line" /></ElIcon>
              <span class="ml-2 text-g-400">人物小传加载中...</span>
            </div>
            <div
              v-else-if="characterProfilesQuery.isError.value"
              class="py-6 text-center text-g-400"
            >
              <ElEmpty
                :description="`人物小传加载失败：${
                  (characterProfilesQuery.error.value as Error)?.message || '未知错误'
                }`"
              />
              <ElButton type="primary" link @click="characterProfilesQuery.refetch()">
                重新加载
              </ElButton>
            </div>
            <div v-else-if="filteredProfiles.length > 0" class="profile-items">
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
    useScriptList,
    useCharacterProfiles,
    useProjectEpisodes,
    useGenerateCharacterProfiles,
    useProjectList,
    useAiProcessStatus
  } from '@/api/queries'
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
  const { currentProjectId } = storeToRefs(scriptProjectStore)

  // ==================== 响应式状态 ====================
  const currentScriptId = ref('')
  const searchQuery = ref('')
  const currentProfile = ref<CharacterProfileItem | null>(null)
  const activeTab = ref('basic')
  /** AI 生成记录 ID，非空时触发状态轮询 */
  const generateRecordId = ref('')

  // ==================== Vue Query Hooks ====================
  // 与其他页面保持一致：scriptId 使用 computed 包装，确保 queryKey 响应式更新
  const scriptListQuery = useScriptList(currentProjectId)
  const characterProfilesQuery = useCharacterProfiles(
    computed(() => currentScriptId.value || undefined)
  )
  const episodesQuery = useProjectEpisodes(currentProjectId)
  const generateMutation = useGenerateCharacterProfiles()
  /**
   * AI 处理状态轮询（统一数据层）：
   * 当用户提交生成后，按 scriptId 轮询处理状态，
   * 完成时自动失效人物小传缓存并停止轮询。
   */
  const aiStatusQuery = useAiProcessStatus(
    computed<Api.AiProcess.StatusQueryParams | undefined>(() =>
      generateRecordId.value && currentScriptId.value
        ? {
            type: 'CHARACTER_PROFILE',
            businessId: currentScriptId.value
          }
        : undefined
    )
  )

  // ==================== 统一数据层：项目列表 ====================
  // store 中已废弃的 projectList 不再使用，改走 useProjectList Vue Query Hook
  const projectListQuery = useProjectList({
    current: 1,
    size: 100
  } as Api.Project.ProjectSearchParams)
  const projectList = computed(() => {
    const records = projectListQuery.data.value?.records || []
    return records.map((p) => ({
      id: p.id,
      name: p.projectName,
      scriptCount: undefined
    }))
  })

  // ==================== 验证状态映射 ====================
  const verificationTagType = (status: string): 'success' | 'warning' | 'info' => {
    const map: Record<string, 'success' | 'warning' | 'info'> = {
      一致: 'success',
      需复核: 'warning',
      // 兼容英文值
      verified: 'success',
      pending: 'warning',
      unverified: 'info'
    }
    return map[status] || 'info'
  }

  const verificationLabel = (status: string): string => {
    const map: Record<string, string> = {
      一致: '已验证',
      需复核: '待复核',
      // 兼容英文值
      verified: '已验证',
      pending: '待验证',
      unverified: '未验证'
    }
    return map[status] || '未验证'
  }

  // ==================== 计算属性 ====================
  const scriptOptions = computed<ScriptOption[]>(() => {
    const res = scriptListQuery.data.value
    if (!res) return []
    const arr = res.records || []
    return arr.map((s: Api.Script.ScriptListItem) => ({
      id: String(s.id),
      title: s.title ?? '未命名剧本'
    }))
  })

  const profileList = computed<CharacterProfileItem[]>(() => {
    const res = characterProfilesQuery.data.value as any
    if (!res) return []

    // 兼容三种响应结构：
    // 1. 直接的 CharacterProfileResult：{ scriptId, profiles, ... }
    // 2. 包装在 AiProcessResult 中：{ status, result: { scriptId, profiles, ... } }
    // 3. data 直接是 CharacterProfileItem[] 数组（后端文档 description 形态）
    let rawList: any[] = []
    if (Array.isArray(res)) {
      rawList = res
    } else if (res && typeof res === 'object') {
      if (res.result && typeof res.result === 'object') {
        // AiProcessResult 包装
        rawList = Array.isArray(res.result.profiles)
          ? res.result.profiles
          : Array.isArray(res.result)
            ? res.result
            : []
      } else if (Array.isArray(res.profiles)) {
        rawList = res.profiles
      }
    }
    if (rawList.length === 0) return []

    return rawList.map((p: any) => ({
      name: p.name ?? p.姓名 ?? '',
      identity: p.identity ?? p.身份 ?? '',
      appearance: p.appearance ?? p.外貌 ?? '',
      personality: p.personality ?? p.性格 ?? '',
      background: p.background ?? p.背景 ?? '',
      voiceRef: p.voiceRef ?? p.音色参考 ?? '',
      appearanceSpan: p.appearanceSpan ?? p.出场跨度 ?? '',
      verificationStatus: p.verificationStatus ?? p.验证状态 ?? '',
      relations: (p.relations ?? p.人物关系 ?? []).map((r: any) => ({
        target: r.role ?? r.target ?? r.角色 ?? '',
        relation: r.relation ?? r.关系 ?? ''
      }))
    })) as CharacterProfileItem[]
  })

  const filteredProfiles = computed(() => {
    if (!searchQuery.value) return profileList.value
    const q = searchQuery.value.toLowerCase()
    return profileList.value.filter(
      (item) => item.name.toLowerCase().includes(q) || item.identity.toLowerCase().includes(q)
    )
  })

  // ==================== 自动选择剧本 ====================
  watch(scriptOptions, (options) => {
    if (options.length === 0) return
    const idsInCurrentProject = new Set(options.map((s) => s.id))
    let sid = ''
    if (
      scriptProjectStore.currentScriptId &&
      idsInCurrentProject.has(scriptProjectStore.currentScriptId)
    ) {
      sid = scriptProjectStore.currentScriptId
    } else if (options.length > 0) {
      sid = options[0].id
    }
    if (sid && sid !== currentScriptId.value) {
      currentScriptId.value = sid
      scriptProjectStore.setCurrentScript(sid)
    }
  })

  // ==================== 自动选择人物 ====================
  watch(profileList, (list) => {
    if (list.length > 0) {
      currentProfile.value = list[0]
    } else {
      currentProfile.value = null
    }
    activeTab.value = 'basic'
  })

  // ==================== 事件处理 ====================
  const handleProjectChange = (projectId: string) => {
    scriptProjectStore.setCurrentProject(projectId)
  }

  const handleProjectRefresh = () => {
    scriptListQuery.refetch()
    ElMessage.success('数据已刷新')
  }

  const handleScriptChange = (scriptId: string) => {
    scriptProjectStore.setCurrentScript(scriptId)
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
      const episodeData = episodesQuery.data.value
      const episodeOptions: EpisodeOption[] = (episodeData ?? []).map((ep: Api.Script.Episode) => ({
        id: String(ep.id),
        episodeName: ep.episodeName ?? ''
      }))

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
      const res = await generateMutation.mutateAsync({
        projectId: currentProjectId.value,
        scriptId: currentScriptId.value
      })
      if (res?.status === 'PROCESSING') {
        ElMessage.success('AI生成任务已提交，正在轮询进度...')
        // 触发统一数据层的 useAiProcessStatus 轮询（recordId 不为空即启用）
        generateRecordId.value = res?.recordId || `pending-${Date.now()}`
      } else {
        ElMessage.success('人物小传生成完成')
        // 已有 useGenerateCharacterProfiles 失效缓存，这里仅显式刷新一次
        await characterProfilesQuery.refetch()
      }
    } catch {
      ElMessage.error('人物小传生成失败')
    }
  }

  // ==================== AI 处理进度监听 ====================
  // 仅依赖统一数据层 useAiProcessStatus 的轮询结果，避免手动 setInterval
  watch(
    () => aiStatusQuery.data.value,
    (status) => {
      if (!generateRecordId.value || !status) return
      const record = status as Api.AiProcess.AiProcessRecord
      if (record.status === 'COMPLETED') {
        generateRecordId.value = ''
        ElMessage.success('人物小传生成完成')
        characterProfilesQuery.refetch()
      } else if (record.status === 'FAILED') {
        generateRecordId.value = ''
        ElMessage.error(record.message || '人物小传生成失败')
      }
    }
  )

  // ==================== 监听项目切换 ====================
  watch(currentProjectId, (newId) => {
    if (newId) {
      currentScriptId.value = ''
      scriptProjectStore.setCurrentScript('')
      currentProfile.value = null
      activeTab.value = 'basic'
      // 项目切换时停止旧的轮询
      generateRecordId.value = ''
    }
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
