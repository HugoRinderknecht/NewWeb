<template>
  <div class="script-library-page art-full-height">
    <!-- ==================== 列表模式 ==================== -->
    <template v-if="pageMode === 'list'">
      <ElCard class="art-table-card h-full">
        <template #header>
          <div class="flex-cb">
            <div class="flex items-center gap-4">
              <span class="text-lg font-medium">剧本管理</span>
              <ElTag type="primary" size="small">
                <ArtSvgIcon icon="ri:folder-3-line" class="mr-1" />
                {{ currentProject?.name }}
              </ElTag>
              <ElTag type="info" size="small">{{ filteredEpisodes.length }} 集</ElTag>
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
              <ElSelect
                v-model="filterStatus"
                placeholder="状态筛选"
                clearable
                style="width: 140px"
              >
                <ElOption
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
              <ScriptUpload
                button-text="导入剧本"
                button-type="info"
                dialog-title="导入剧本到项目"
                accept-types=".doc,.docx,.pdf,.txt,.fountain"
                @success="handleImportEpisode"
              />
              <ElButton type="primary" @click="handleCreate">
                <ArtSvgIcon icon="ri:add-line" class="mr-1" />
                新建剧本
              </ElButton>
            </ElSpace>
          </div>
        </template>

        <!-- 项目切换栏 -->
        <div class="project-switch-bar mb-6">
          <div class="flex items-center gap-3">
            <span class="switch-label">
              <ArtSvgIcon icon="ri:stack-line" class="mr-1" />
              切换短剧项目
            </span>
            <ElSelect
              v-model="currentProjectIdProxy"
              placeholder="选择短剧项目"
              style="width: 260px"
              @change="handleProjectChange"
            >
              <ElOption
                v-for="project in projectList"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              >
                <div class="flex items-center gap-2">
                  <ArtSvgIcon icon="ri:folder-3-line" class="text-g-400" />
                  <span>{{ project.name }}</span>
                  <ElTag type="info" size="small" class="ml-auto"
                    >{{ project.episodeCount }} 集</ElTag
                  >
                </div>
              </ElOption>
            </ElSelect>
            <ElButton text size="small" @click="handleRefresh">
              <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
              刷新
            </ElButton>
          </div>
        </div>

        <!-- 项目信息卡片 -->
        <div class="project-info-card mb-6">
          <div class="flex items-center gap-4">
            <div class="project-icon">
              <ArtSvgIcon icon="ri:film-line" />
            </div>
            <div class="project-detail">
              <h3 class="font-medium text-base">{{ currentProject?.name }}</h3>
              <p class="text-sm text-g-400 mt-1">{{ currentProject?.description }}</p>
            </div>
            <div class="project-stats ml-auto flex items-center gap-6">
              <div class="stat-item">
                <div class="stat-value">{{ filteredEpisodes.length }}</div>
                <div class="stat-label">总集数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ writingCount }}</div>
                <div class="stat-label">创作中</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ reviewCount }}</div>
                <div class="stat-label">审核中</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ completedCount }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 视图切换 -->
        <div class="view-switcher flex-cb mb-4">
          <ElRadioGroup v-model="viewMode" size="small">
            <ElRadioButton label="card">
              <ArtSvgIcon icon="ri:layout-grid-line" class="mr-1" />
              卡片
            </ElRadioButton>
            <ElRadioButton label="list">
              <ArtSvgIcon icon="ri:list-check" class="mr-1" />
              列表
            </ElRadioButton>
          </ElRadioGroup>
          <ElSpace>
            <span class="text-sm text-g-400">共 {{ pagination.total }} 集</span>
          </ElSpace>
        </div>

        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" v-loading="loading" class="scrollable-content">
          <div class="episode-card-grid">
            <ElCard
              v-for="episode in pagedEpisodes"
              :key="episode.id"
              class="episode-card"
              shadow="hover"
              @click="handleView(episode)"
            >
              <div class="episode-card-header">
                <div class="episode-number">第 {{ episode.number }} 集</div>
                <ElTag :type="statusTypeMap[episode.status]" size="small">
                  {{ statusLabelMap[episode.status] }}
                </ElTag>
              </div>
              <h4 class="episode-title font-medium">{{ episode.name }}</h4>
              <p class="episode-desc">{{ episode.description }}</p>
              <div class="episode-meta">
                <ElSpace>
                  <span class="text-xs text-g-400">
                    <ArtSvgIcon icon="ri:file-text-line" class="mr-1" />
                    {{ episode.wordCount }} 字
                  </span>
                  <span class="text-xs text-g-400">
                    <ArtSvgIcon icon="ri:time-line" class="mr-1" />
                    {{ episode.duration }} 分钟
                  </span>
                </ElSpace>
              </div>
              <div class="episode-footer">
                <ElSpace>
                  <ElAvatar :size="24" :src="episode.authorAvatar">
                    <ArtSvgIcon icon="ri:user-line" />
                  </ElAvatar>
                  <span class="text-xs text-g-400">{{ episode.author }}</span>
                </ElSpace>
                <span class="text-xs text-g-400">{{ episode.updateTime }}</span>
              </div>
              <div class="episode-actions">
                <ElButton type="primary" link size="small" @click.stop="handleEdit(episode)">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                  编辑
                </ElButton>
                <ElButton type="primary" link size="small" @click.stop="handleView(episode)">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  查看
                </ElButton>
                <ElButton type="danger" link size="small" @click.stop="handleDelete(episode)">
                  <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                  删除
                </ElButton>
              </div>
            </ElCard>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else v-loading="loading" class="scrollable-content">
          <ElTable :data="pagedEpisodes" style="width: 100%">
            <ElTableColumn label="集数" width="100">
              <template #default="{ row }">
                <div class="flex items-center gap-3">
                  <div class="episode-table-number">第 {{ row.number }} 集</div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="剧本名称" min-width="200">
              <template #default="{ row }">
                <div>
                  <div class="font-medium">{{ row.name }}</div>
                  <div class="text-xs text-g-400">{{ row.code }}</div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="状态" width="120">
              <template #default="{ row }">
                <ElTag :type="statusTypeMap[row.status]" size="small">
                  {{ statusLabelMap[row.status] }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="wordCount" label="字数" width="120">
              <template #default="{ row }">
                <span class="text-g-400">{{ row.wordCount.toLocaleString() }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="duration" label="时长" width="100">
              <template #default="{ row }">
                <span class="text-g-400">{{ row.duration }} 分钟</span>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="author" label="作者" width="140" />
            <ElTableColumn prop="updateTime" label="更新时间" width="160" sortable />
            <ElTableColumn label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <ElSpace>
                  <ElButton type="primary" link size="small" @click="handleView(row)">
                    <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                    查看
                  </ElButton>
                  <ElButton type="primary" link size="small" @click="handleEdit(row)">
                    <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
                    编辑
                  </ElButton>
                  <ElButton type="danger" link size="small" @click="handleDelete(row)">
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                    删除
                  </ElButton>
                </ElSpace>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[12, 24, 48, 96]"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </ElCard>
    </template>

    <!-- ==================== 编辑器模式 ==================== -->
    <template v-if="pageMode === 'editor'">
      <ElCard class="art-table-card h-full">
        <template #header>
          <div class="flex-cb">
            <div class="flex items-center gap-4">
              <ElButton text @click="switchToList">
                <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                返回列表
              </ElButton>
              <span class="text-lg font-medium">剧本编辑</span>
              <ElTag v-if="saveStatus === 'saved'" type="success" size="small">
                <ArtSvgIcon icon="ri:check-line" class="mr-1" />
                已保存
              </ElTag>
              <ElTag v-else-if="saveStatus === 'saving'" type="warning" size="small">
                <ArtSvgIcon icon="ri:loader-4-line" class="mr-1 animate-spin" />
                保存中...
              </ElTag>
              <ElTag v-else type="info" size="small">未保存</ElTag>
            </div>
            <ElSpace>
              <ScriptUpload
                button-text="导入剧本"
                button-type="info"
                dialog-title="导入剧本文件"
                @success="handleImportScript"
              />
              <ElButton @click="switchToVersion">
                <ArtSvgIcon icon="ri:history-line" class="mr-1" />
                版本管理
              </ElButton>
              <ElButton type="primary" @click="handleSave">
                <ArtSvgIcon icon="ri:save-line" class="mr-1" />
                保存剧本
              </ElButton>
            </ElSpace>
          </div>
        </template>

        <div class="script-editor-container">
          <!-- 左侧剧本信息 -->
          <div class="script-sidebar">
            <ElForm :model="editorForm" label-position="top" class="script-info-form">
              <ElFormItem label="剧本标题" required>
                <ElInput v-model="editorForm.title" placeholder="请输入剧本标题" />
              </ElFormItem>
              <ElFormItem label="剧本类型">
                <ElSelect v-model="editorForm.type" placeholder="请选择剧本类型" class="w-full">
                  <ElOption label="动画剧本" value="animation" />
                  <ElOption label="影视剧本" value="film" />
                  <ElOption label="广告剧本" value="ad" />
                  <ElOption label="短剧剧本" value="short" />
                  <ElOption label="舞台剧剧本" value="stage" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="关联项目">
                <ElSelect
                  v-model="editorForm.projectId"
                  placeholder="请选择关联项目"
                  class="w-full"
                >
                  <ElOption
                    v-for="project in projectOptions"
                    :key="project.id"
                    :label="project.name"
                    :value="project.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="标签">
                <ElSelect
                  v-model="editorForm.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="请输入标签"
                  class="w-full"
                >
                  <ElOption label="悬疑" value="suspense" />
                  <ElOption label="喜剧" value="comedy" />
                  <ElOption label="科幻" value="scifi" />
                  <ElOption label="爱情" value="romance" />
                  <ElOption label="动作" value="action" />
                  <ElOption label="奇幻" value="fantasy" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="剧本简介">
                <ElInput
                  v-model="editorForm.summary"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入剧本简介"
                />
              </ElFormItem>
              <ElFormItem label="创建时间">
                <ElInput v-model="editorForm.createTime" disabled />
              </ElFormItem>
              <ElFormItem label="最后修改">
                <ElInput v-model="editorForm.updateTime" disabled />
              </ElFormItem>
            </ElForm>

            <!-- 关联资产 -->
            <div class="script-assets mt-4">
              <div class="flex-cb mb-3">
                <span class="text-sm font-medium">关联资产</span>
                <ElButton type="primary" link size="small" @click="handleManageAssets">
                  管理
                </ElButton>
              </div>
              <ElSpace wrap>
                <ElTag
                  v-for="asset in relatedAssets"
                  :key="asset.id"
                  :type="assetTypeMap[asset.type]"
                  size="small"
                  closable
                  @close="handleRemoveAsset(asset)"
                >
                  {{ asset.name }}
                </ElTag>
              </ElSpace>
            </div>
          </div>

          <!-- 右侧编辑器 -->
          <div class="script-editor-main">
            <div class="editor-toolbar">
              <ElSpace>
                <ElTooltip content="前往AI辅助创作页面">
                  <ElButton size="small" type="primary" @click="handleGoToAi">
                    <ArtSvgIcon icon="ri:sparkling-line" class="mr-1" />
                    AI助手
                  </ElButton>
                </ElTooltip>
              </ElSpace>
              <ElSpace>
                <ElButton size="small" text @click="handleFormat">
                  <ArtSvgIcon icon="ri:align-left" class="mr-1" />
                  格式化
                </ElButton>
                <ElButton size="small" text @click="handlePreview">
                  <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                  预览
                </ElButton>
              </ElSpace>
            </div>

            <div class="editor-content">
              <ElInput
                v-model="editorForm.content"
                type="textarea"
                :rows="24"
                placeholder="在此输入剧本内容...&#10;支持标准剧本格式：&#10;场景标题&#10;角色名&#10;（动作描述）&#10;对白内容"
                class="script-textarea"
                resize="none"
              />
            </div>

            <div class="editor-status">
              <ElSpace>
                <span class="text-xs text-g-400">字数: {{ wordCount }}</span>
                <span class="text-xs text-g-400">行数: {{ lineCount }}</span>
                <span class="text-xs text-g-400">预计时长: {{ estimatedDuration }}</span>
              </ElSpace>
            </div>
          </div>
        </div>
      </ElCard>
    </template>

    <!-- ==================== 版本管理模式 ==================== -->
    <template v-if="pageMode === 'version'">
      <ElCard class="art-table-card">
        <template #header>
          <div class="flex-cb">
            <div class="flex items-center gap-4">
              <ElButton text @click="switchToEditor">
                <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                返回编辑
              </ElButton>
              <ElButton text @click="switchToList">
                <ArtSvgIcon icon="ri:list-check" class="mr-1" />
                返回列表
              </ElButton>
              <span class="text-lg font-medium">版本管理</span>
              <ElTag type="info" size="small">剧本：《{{ currentVersionScriptName }}》</ElTag>
            </div>
            <ElSpace>
              <ElInput
                v-model="versionSearchQuery"
                placeholder="搜索版本"
                clearable
                style="width: 220px"
              >
                <template #prefix>
                  <ArtSvgIcon icon="ri:search-line" class="text-g-400" />
                </template>
              </ElInput>
              <ElSelect
                v-model="versionFilterType"
                placeholder="版本类型"
                clearable
                style="width: 140px"
              >
                <ElOption label="自动保存" value="auto" />
                <ElOption label="手动保存" value="manual" />
                <ElOption label="里程碑" value="milestone" />
              </ElSelect>
              <ScriptUpload
                button-text="导入版本"
                button-type="info"
                dialog-title="导入剧本版本"
                accept-types=".doc,.docx,.pdf,.txt,.fountain"
                @success="handleImportVersion"
              />
              <ElButton type="primary" @click="handleCreateMilestone">
                <ArtSvgIcon icon="ri:bookmark-line" class="mr-1" />
                标记里程碑
              </ElButton>
            </ElSpace>
          </div>
        </template>

        <div class="scrollable-content">
          <ElTable
            :data="versionFilteredList"
            style="width: 100%"
            v-loading="versionLoading"
            @selection-change="handleVersionSelectionChange"
          >
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn label="版本号" width="120">
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <ElTag v-if="row.isMilestone" type="warning" size="small">
                    <ArtSvgIcon icon="ri:bookmark-3-fill" />
                  </ElTag>
                  <span class="font-medium">{{ row.version }}</span>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="title" label="版本标题" min-width="180">
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <span>{{ row.title }}</span>
                  <ElTag v-if="row.isCurrent" type="success" size="small">当前</ElTag>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="author" label="作者" width="120" />
            <ElTableColumn prop="wordCount" label="字数" width="100">
              <template #default="{ row }">
                <span class="text-g-400">{{ row.wordCount.toLocaleString() }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn label="变更内容" min-width="200">
              <template #default="{ row }">
                <ElTooltip :content="row.changes" placement="top">
                  <span class="truncate block max-w-xs">{{ row.changes }}</span>
                </ElTooltip>
              </template>
            </ElTableColumn>
            <ElTableColumn label="类型" width="100">
              <template #default="{ row }">
                <ElTag :type="versionTypeMap[row.type as VersionType]" size="small">
                  {{ versionLabelMap[row.type as VersionType] }}
                </ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="time" label="更新时间" width="160" sortable />
            <ElTableColumn label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <ElSpace>
                  <ElButton type="primary" link size="small" @click="handleVersionView(row)">
                    <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                    查看
                  </ElButton>
                  <ElButton type="primary" link size="small" @click="handleVersionCompare(row)">
                    <ArtSvgIcon icon="ri:git-pull-request-line" class="mr-1" />
                    对比
                  </ElButton>
                  <ElButton
                    v-if="!row.isCurrent"
                    type="warning"
                    link
                    size="small"
                    @click="handleVersionRollback(row)"
                  >
                    <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                    回滚
                  </ElButton>
                  <ElButton type="danger" link size="small" @click="handleVersionDelete(row)">
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                    删除
                  </ElButton>
                </ElSpace>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div class="pagination-wrapper">
          <ElPagination
            v-model:current-page="versionPagination.current"
            v-model:page-size="versionPagination.size"
            :total="versionPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
          />
        </div>
      </ElCard>
    </template>

    <!-- ==================== 查看剧本详情弹窗 ==================== -->
    <ElDialog
      v-model="viewDialogVisible"
      title="剧本详情"
      width="900px"
      align-center
      destroy-on-close
      class="episode-detail-dialog"
    >
      <div v-if="currentEpisode" class="episode-detail">
        <div class="detail-header flex items-center gap-4 mb-6">
          <div class="detail-icon">
            <ArtSvgIcon icon="ri:movie-line" />
          </div>
          <div class="detail-info">
            <h3 class="text-lg font-medium"
              >第 {{ currentEpisode.number }} 集：{{ currentEpisode.name }}</h3
            >
            <ElSpace class="mt-2">
              <ElTag :type="statusTypeMap[currentEpisode.status]" size="small">
                {{ statusLabelMap[currentEpisode.status] }}
              </ElTag>
              <span class="text-sm text-g-400">{{ currentEpisode.code }}</span>
            </ElSpace>
          </div>
          <ElButton type="primary" class="ml-auto" @click="handleGoToEdit(currentEpisode)">
            <ArtSvgIcon icon="ri:edit-line" class="mr-1" />
            去编辑
          </ElButton>
          <ElButton
            v-if="currentEpisode.status === 'draft' || currentEpisode.status === 'writing'"
            type="warning"
            @click="handleSubmitScriptReview(currentEpisode)"
          >
            <ArtSvgIcon icon="ri:send-plane-line" class="mr-1" />
            提交审核
          </ElButton>
          <ElButton
            v-if="currentEpisode.status === 'review'"
            type="info"
            @click="handleWithdrawScriptReview(currentEpisode)"
          >
            <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />
            撤回审核
          </ElButton>
        </div>
        <ElDescriptions :column="2" border class="mb-6">
          <ElDescriptionsItem label="作者">{{ currentEpisode.author }}</ElDescriptionsItem>
          <ElDescriptionsItem label="字数"
            >{{ currentEpisode.wordCount.toLocaleString() }} 字</ElDescriptionsItem
          >
          <ElDescriptionsItem label="预计时长"
            >{{ currentEpisode.duration }} 分钟</ElDescriptionsItem
          >
          <ElDescriptionsItem label="状态">
            <ElTag :type="statusTypeMap[currentEpisode.status]" size="small">
              {{ statusLabelMap[currentEpisode.status] }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="剧情简介" :span="2">{{
            currentEpisode.description
          }}</ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">{{ currentEpisode.createTime }}</ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">{{ currentEpisode.updateTime }}</ElDescriptionsItem>
        </ElDescriptions>

        <!-- 剧本内容预览 -->
        <div class="script-content-section">
          <div class="section-title flex items-center gap-2 mb-4">
            <ArtSvgIcon icon="ri:file-text-line" />
            <span class="font-medium">剧本内容</span>
            <ElTag v-if="currentEpisode.content" type="info" size="small">
              {{ currentEpisode.content.length }} 字
            </ElTag>
            <ElTag v-else type="warning" size="small">暂无内容</ElTag>
          </div>
          <div v-if="currentEpisode.content" class="script-content-preview">
            <pre>{{ currentEpisode.content }}</pre>
          </div>
          <ElEmpty v-else description="该剧本暂无内容" />
        </div>
      </div>
    </ElDialog>

    <!-- ==================== 编辑器 - 关联资产弹窗 ==================== -->
    <ElDialog v-model="assetDialogVisible" title="关联资产" width="600px">
      <ElTabs v-model="assetTab">
        <ElTabPane label="角色" name="character">
          <ElTable :data="characterLibrary" @selection-change="handleAssetSelectionChange">
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn prop="name" label="角色名称" />
            <ElTableColumn prop="description" label="简介" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
        <ElTabPane label="场景" name="scene">
          <ElTable :data="sceneLibrary" @selection-change="handleAssetSelectionChange">
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn prop="name" label="场景名称" />
            <ElTableColumn prop="description" label="简介" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
        <ElTabPane label="道具" name="prop">
          <ElTable :data="propLibrary" @selection-change="handleAssetSelectionChange">
            <ElTableColumn type="selection" width="55" />
            <ElTableColumn prop="name" label="道具名称" />
            <ElTableColumn prop="description" label="简介" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
      </ElTabs>
      <template #footer>
        <ElButton @click="assetDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmAssets">确定</ElButton>
      </template>
    </ElDialog>

    <!-- ==================== 编辑器 - 预览弹窗 ==================== -->
    <ElDialog v-model="previewVisible" title="剧本预览" width="800px">
      <div class="script-preview">
        <h2 class="preview-title">{{ editorForm.title }}</h2>
        <div class="preview-meta">
          <ElSpace>
            <ElTag>{{ typeLabelMap[editorForm.type] || editorForm.type }}</ElTag>
            <span class="text-sm text-g-400">{{ editorForm.updateTime }}</span>
          </ElSpace>
        </div>
        <pre class="preview-content">{{ editorForm.content }}</pre>
      </div>
    </ElDialog>

    <!-- ==================== 版本 - 查看版本弹窗 ==================== -->
    <ElDialog v-model="versionViewDialogVisible" title="版本详情" width="800px">
      <div v-if="currentVersion" class="version-detail">
        <div class="flex-cb mb-4">
          <div>
            <h3 class="text-lg font-medium">{{ currentVersion.title }}</h3>
            <p class="text-sm text-g-400 mt-1">
              {{ currentVersion.version }} · {{ currentVersion.author }} · {{ currentVersion.time }}
            </p>
          </div>
          <ElTag :type="versionTypeMap[currentVersion.type]" size="small">
            {{ versionLabelMap[currentVersion.type] }}
          </ElTag>
        </div>
        <ElDivider />
        <pre class="version-content">{{ currentVersion.content }}</pre>
      </div>
    </ElDialog>

    <!-- ==================== 版本 - 对比弹窗 ==================== -->
    <ElDialog v-model="compareDialogVisible" title="版本对比" width="900px">
      <div v-if="compareVersions" class="version-compare">
        <div class="compare-header flex-cb mb-4">
          <div class="compare-left">
            <span class="font-medium">{{ compareVersions.old.version }}</span>
            <span class="text-sm text-g-400 ml-2">{{ compareVersions.old.time }}</span>
          </div>
          <ArtSvgIcon icon="ri:arrow-right-line" class="text-g-400" />
          <div class="compare-right">
            <span class="font-medium">{{ compareVersions.new.version }}</span>
            <span class="text-sm text-g-400 ml-2">{{ compareVersions.new.time }}</span>
          </div>
        </div>
        <div class="compare-body">
          <div class="compare-panel">
            <div class="panel-header">旧版本</div>
            <pre class="panel-content">{{ compareVersions.old.content }}</pre>
          </div>
          <div class="compare-panel">
            <div class="panel-header">新版本</div>
            <pre class="panel-content">{{ compareVersions.new.content }}</pre>
          </div>
        </div>
      </div>
    </ElDialog>

    <!-- ==================== 版本 - 标记里程碑弹窗 ==================== -->
    <ElDialog v-model="milestoneDialogVisible" title="标记里程碑" width="500px">
      <ElForm :model="milestoneForm" label-width="100px">
        <ElFormItem label="版本标题" required>
          <ElInput v-model="milestoneForm.title" placeholder="请输入里程碑标题" />
        </ElFormItem>
        <ElFormItem label="版本描述">
          <ElInput
            v-model="milestoneForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入版本描述"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="milestoneDialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleConfirmMilestone">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { useScriptProjectStore } from '@/store/modules/script-project'
  import {
    fetchGetProjectEpisodes,
    fetchGetScriptDetail,
    fetchUpdateScript,
    fetchDeleteScript,
    fetchSubmitScriptReview,
    fetchWithdrawScriptReview
  } from '@/api/script'
  import { fetchGetProjectAssets } from '@/api/asset'
  import { fetchGetCharacterList } from '@/api/character'

  defineOptions({ name: 'ScriptLibrary' })

  const router = useRouter()
  const projectStore = useScriptProjectStore()

  // ==================== 页面模式 ====================
  type PageMode = 'list' | 'editor' | 'version'
  const pageMode = ref<PageMode>('list')

  // ==================== 通用类型 ====================
  type EpisodeStatus = 'draft' | 'writing' | 'review' | 'completed'
  type ScriptType = 'animation' | 'film' | 'ad' | 'short' | 'stage'
  type AssetType = 'character' | 'scene' | 'prop'
  type SaveStatus = 'unsaved' | 'saving' | 'saved'
  type VersionType = 'auto' | 'manual' | 'milestone'

  interface ProjectItem {
    id: string
    name: string
    description: string
    episodeCount: number
  }

  interface EpisodeItem {
    id: string
    number: number
    name: string
    code: string
    projectId: string
    status: EpisodeStatus
    duration: number
    wordCount: number
    author: string
    authorAvatar: string
    description: string
    content?: string
    updateTime: string
    createTime: string
  }

  interface AssetItem {
    id: string
    name: string
    type: AssetType
    description: string
  }

  interface ScriptForm {
    title: string
    type: ScriptType | ''
    projectId: string | ''
    tags: string[]
    summary: string
    content: string
    createTime: string
    updateTime: string
  }

  interface VersionItem {
    id: string
    version: string
    title: string
    author: string
    wordCount: number
    changes: string
    type: VersionType
    time: string
    isCurrent: boolean
    isMilestone: boolean
    content: string
  }

  interface ComparePair {
    old: VersionItem
    new: VersionItem
  }

  // ==================== 项目数据 ====================
  const projectList = computed<ProjectItem[]>(() => projectStore.projectList)
  const projectOptions = computed(() => projectStore.projectOptions)

  const currentProjectId = computed(() => projectStore.currentProjectId)
  const currentProjectIdProxy = computed({
    get: () => currentProjectId.value,
    set: (val: string) => projectStore.setCurrentProject(val)
  })
  const currentProject = computed(() =>
    projectList.value.find((p) => p.id === currentProjectId.value)
  )

  // ==================== 列表模式数据 ====================
  const searchQuery = ref('')
  const filterStatus = ref<EpisodeStatus | ''>('')
  const viewMode = ref<'card' | 'list'>('card')
  const loading = ref(false)
  const viewDialogVisible = ref(false)
  const currentEpisode = ref<EpisodeItem | null>(null)

  const pagination = reactive({
    current: 1,
    size: 12,
    total: 0
  })

  const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '创作中', value: 'writing' },
    { label: '审核中', value: 'review' },
    { label: '已完成', value: 'completed' }
  ]

  const statusTypeMap: Record<string, 'info' | 'primary' | 'warning' | 'success'> = {
    draft: 'info',
    writing: 'primary',
    review: 'warning',
    completed: 'success'
  }

  const statusLabelMap: Record<string, string> = {
    draft: '草稿',
    writing: '创作中',
    review: '审核中',
    completed: '已完成'
  }

  const episodeList = ref<EpisodeItem[]>([])

  const filteredEpisodes = computed(() => {
    let result = episodeList.value

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

    return result
  })

  const pagedEpisodes = computed(() => {
    const list = filteredEpisodes.value
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return list.slice(start, end)
  })

  const writingCount = computed(
    () => filteredEpisodes.value.filter((i) => i.status === 'writing').length
  )
  const reviewCount = computed(
    () => filteredEpisodes.value.filter((i) => i.status === 'review').length
  )
  const completedCount = computed(
    () => filteredEpisodes.value.filter((i) => i.status === 'completed').length
  )

  watch(filteredEpisodes, (list) => {
    pagination.total = list.length
  })

  // 加载项目剧本数据
  const loadProjectEpisodes = async (projectId: string) => {
    loading.value = true
    try {
      const res = await fetchGetProjectEpisodes(String(projectId))
      episodeList.value = (res || []).map((ep: any) => ({
        id: ep.id,
        number: ep.episodeNumber ?? ep.number ?? 0,
        name: ep.title ?? ep.name ?? '',
        code: ep.code ?? `EP-${String(ep.episodeNumber ?? ep.number ?? 0).padStart(3, '0')}`,
        projectId: String(ep.projectId ?? projectId),
        status: ep.status ?? 'draft',
        duration: ep.duration ?? 0,
        wordCount: ep.wordCount ?? 0,
        author: ep.author ?? ep.creatorName ?? '',
        authorAvatar: ep.authorAvatar ?? '',
        description: ep.description ?? ep.summary ?? '',
        content: ep.content ?? '',
        updateTime: ep.updateTime ?? ep.updatedAt ?? '',
        createTime: ep.createTime ?? ep.createdAt ?? ''
      }))
      pagination.current = 1
      ElMessage.success(`已切换到短剧「${currentProject.value?.name}」`)
      // 同时加载资产和角色数据
      loadProjectAssets(projectId)
      loadProjectCharacters(projectId)
    } catch {
      episodeList.value = []
      ElMessage.error('加载剧本数据失败')
    } finally {
      loading.value = false
    }
  }

  // 项目切换
  const handleProjectChange = (projectId: string) => {
    projectStore.setCurrentProject(projectId)
    loadProjectEpisodes(projectId)
  }

  // 刷新
  const handleRefresh = () => {
    loadProjectEpisodes(currentProjectId.value)
  }

  // 初始化加载
  onMounted(() => {
    loadProjectEpisodes(currentProjectId.value)
  })

  // ==================== 列表模式操作 ====================
  const handleCreate = () => {
    // 切换到编辑器模式，新建空白剧本
    currentEditingScript.value = null
    editorForm.title = ''
    editorForm.type = 'short'
    editorForm.projectId = currentProjectId.value
    editorForm.tags = []
    editorForm.summary = ''
    editorForm.content = ''
    editorForm.createTime = new Date().toLocaleString()
    editorForm.updateTime = new Date().toLocaleString()
    saveStatus.value = 'unsaved'
    pageMode.value = 'editor'
  }

  const generateCode = () => {
    const prefix = 'EP'
    const count = episodeList.value.length + 1
    return `${prefix}-${String(count).padStart(3, '0')}`
  }

  const handleEdit = (row: EpisodeItem) => {
    // 切换到编辑器模式，加载该剧本数据
    currentEditingScript.value = row
    editorForm.title = `第${row.number}集：${row.name}`
    editorForm.type = 'short'
    editorForm.projectId = row.projectId
    editorForm.tags = []
    editorForm.summary = row.description
    editorForm.content = row.content || ''
    editorForm.createTime = row.createTime
    editorForm.updateTime = row.updateTime
    saveStatus.value = 'saved'
    pageMode.value = 'editor'
  }

  const handleView = (row: EpisodeItem) => {
    currentEpisode.value = row
    viewDialogVisible.value = true
  }

  const handleGoToEdit = (row: EpisodeItem) => {
    viewDialogVisible.value = false
    // 跳转到剧本编辑页面，携带剧本信息
    handleEdit(row)
  }

  const handleDelete = (row: EpisodeItem) => {
    ElMessageBox.confirm(`确定要删除第 ${row.number} 集「${row.name}」吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchDeleteScript(String(row.id))
        episodeList.value = episodeList.value.filter((item) => item.id !== row.id)
        projectStore.updateEpisodeCount(currentProjectId.value, -1)
        ElMessage.success('删除成功')
      } catch {
        ElMessage.error('删除失败')
      }
    })
  }

  const handleImportEpisode = (data: { file: File; name: string; content?: string }) => {
    ElMessage.success(`剧本文件「${data.name}」导入成功`)
    const newEpisode: EpisodeItem = {
      id: String(Date.now()),
      number: episodeList.value.length + 1,
      name: data.name.replace(/\.[^/.]+$/, ''),
      code: generateCode(),
      projectId: currentProjectId.value,
      status: 'draft',
      duration: 15,
      wordCount: data.content?.length || 0,
      author: '当前用户',
      authorAvatar: '',
      description: '从文件导入的剧本',
      content: data.content || '',
      createTime: new Date().toISOString().slice(0, 10),
      updateTime: new Date().toISOString().slice(0, 10)
    }
    episodeList.value.unshift(newEpisode)
    projectStore.updateEpisodeCount(currentProjectId.value, 1)
    ElMessage.success('剧本导入完成')
  }

  // ==================== 编辑器模式数据 ====================
  const currentEditingScript = ref<EpisodeItem | null>(null)
  const saveStatus = ref<SaveStatus>('saved')
  const assetDialogVisible = ref(false)
  const assetTab = ref<AssetType>('character')
  const previewVisible = ref(false)
  const selectedAssets = ref<AssetItem[]>([])

  const typeLabelMap: Record<string, string> = {
    animation: '动画剧本',
    film: '影视剧本',
    ad: '广告剧本',
    short: '短剧剧本',
    stage: '舞台剧剧本'
  }

  const assetTypeMap: Record<AssetType, 'primary' | 'success' | 'warning'> = {
    character: 'primary',
    scene: 'success',
    prop: 'warning'
  }

  const editorForm = reactive<ScriptForm>({
    title: '',
    type: 'short',
    projectId: '1',
    tags: [],
    summary: '',
    content: '',
    createTime: '',
    updateTime: ''
  })

  const relatedAssets = ref<AssetItem[]>([])

  const characterLibrary = ref<AssetItem[]>([])

  const sceneLibrary = ref<AssetItem[]>([])

  const propLibrary = ref<AssetItem[]>([])

  // 加载项目资产数据
  const loadProjectAssets = async (projectId: string) => {
    try {
      const res = await fetchGetProjectAssets(String(projectId))
      const items = res?.records || []
      const mapped = (items as any[]).map((a: any) => ({
        id: a.id,
        name: a.assetName ?? a.name ?? '',
        type: (a.assetType ?? a.category ?? 'prop') as AssetType,
        description: a.description ?? ''
      }))
      relatedAssets.value = mapped
      characterLibrary.value = mapped.filter((i) => i.type === 'character')
      sceneLibrary.value = mapped.filter((i) => i.type === 'scene')
      propLibrary.value = mapped.filter((i) => i.type === 'prop')
    } catch {
      relatedAssets.value = []
      characterLibrary.value = []
      sceneLibrary.value = []
      propLibrary.value = []
    }
  }

  // 加载项目角色数据
  const loadProjectCharacters = async (projectId: string) => {
    try {
      const res = await fetchGetCharacterList(String(projectId))
      const items = res || []
      characterLibrary.value = (items as any[]).map((c: any) => ({
        id: c.id,
        name: c.name ?? c.characterName ?? '',
        type: 'character' as AssetType,
        description: c.description ?? c.profile ?? ''
      }))
    } catch {
      characterLibrary.value = []
    }
  }

  const wordCount = computed(() => {
    return editorForm.content.replace(/\s/g, '').length
  })

  const lineCount = computed(() => {
    return editorForm.content.split('\n').length
  })

  const estimatedDuration = computed(() => {
    const minutes = Math.ceil(wordCount.value / 200)
    return `${minutes} 分钟`
  })

  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  watch(
    () => editorForm.content,
    () => {
      saveStatus.value = 'unsaved'
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
      autoSaveTimer = setTimeout(() => {
        handleAutoSave()
      }, 30000)
    }
  )

  const handleAutoSave = async () => {
    if (!currentEditingScript.value) return
    saveStatus.value = 'saving'
    try {
      await fetchUpdateScript(String(currentEditingScript.value.id), {
        title: editorForm.title,
        content: editorForm.content,
        summary: editorForm.summary
      } as any)
      editorForm.updateTime = new Date().toLocaleString()
      saveStatus.value = 'saved'
    } catch {
      saveStatus.value = 'unsaved'
      ElMessage.error('自动保存失败')
    }
  }

  // ==================== 编辑器模式操作 ====================
  const handleSave = async () => {
    if (!editorForm.title) {
      ElMessage.warning('请输入剧本标题')
      return
    }
    saveStatus.value = 'saving'
    try {
      if (currentEditingScript.value) {
        // 更新已有剧本
        await fetchUpdateScript(String(currentEditingScript.value.id), {
          title: editorForm.title,
          content: editorForm.content,
          summary: editorForm.summary,
          type: editorForm.type || undefined,
          tags: editorForm.tags
        } as any)
        editorForm.updateTime = new Date().toLocaleString()
        // 更新列表中对应剧本的数据
        const index = episodeList.value.findIndex((i) => i.id === currentEditingScript.value!.id)
        if (index !== -1) {
          episodeList.value[index] = {
            ...episodeList.value[index],
            name: editorForm.title,
            description: editorForm.summary,
            content: editorForm.content,
            wordCount: wordCount.value,
            duration: Math.ceil(wordCount.value / 200),
            updateTime: new Date().toISOString().slice(0, 10)
          } as EpisodeItem
        }
      } else {
        // 新建剧本，添加到列表
        const newEpisode: EpisodeItem = {
          id: String(Date.now()),
          number: episodeList.value.length + 1,
          name: editorForm.title,
          code: generateCode(),
          projectId: currentProjectId.value,
          status: 'writing',
          duration: Math.ceil(wordCount.value / 200),
          wordCount: wordCount.value,
          author: '当前用户',
          authorAvatar: '',
          description: editorForm.summary,
          content: editorForm.content,
          createTime: new Date().toISOString().slice(0, 10),
          updateTime: new Date().toISOString().slice(0, 10)
        }
        episodeList.value.unshift(newEpisode)
        currentEditingScript.value = newEpisode
        projectStore.updateEpisodeCount(currentProjectId.value, 1)
      }
      saveStatus.value = 'saved'
      ElMessage.success('保存成功')
    } catch {
      saveStatus.value = 'unsaved'
      ElMessage.error('保存失败')
    }
  }

  const handleManageAssets = () => {
    assetDialogVisible.value = true
  }

  const handleRemoveAsset = (asset: AssetItem) => {
    relatedAssets.value = relatedAssets.value.filter((item) => item.id !== asset.id)
    ElMessage.success(`已移除 ${asset.name}`)
  }

  const handleAssetSelectionChange = (selection: AssetItem[]) => {
    selectedAssets.value = selection
  }

  const handleConfirmAssets = () => {
    const newAssets = selectedAssets.value.filter(
      (item) => !relatedAssets.value.some((a) => a.id === item.id)
    )
    relatedAssets.value.push(...newAssets)
    assetDialogVisible.value = false
    ElMessage.success(`成功关联 ${newAssets.length} 个资产`)
  }

  const handleFormat = () => {
    const lines = editorForm.content.split('\n').filter((line) => line.trim())
    editorForm.content = lines.join('\n\n')
    ElMessage.success('格式化完成')
  }

  const handlePreview = () => {
    previewVisible.value = true
  }

  const handleImportScript = (data: { file: File; name: string; content?: string }) => {
    if (data.content) {
      editorForm.content = data.content
    }
    editorForm.title = data.name
    saveStatus.value = 'unsaved'
    ElMessage.success(`剧本「${data.name}」导入成功`)
  }

  const handleGoToAi = () => {
    router.push({ name: 'ScriptAi' })
  }

  const handleSubmitScriptReview = (row: EpisodeItem) => {
    ElMessageBox.confirm(`确定要提交第 ${row.number} 集「${row.name}」进行审核吗？`, '提交审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        await fetchSubmitScriptReview(String(row.id))
        row.status = 'review'
        ElMessage.success('已提交审核')
      } catch {
        ElMessage.error('提交审核失败')
      }
    })
  }

  const handleWithdrawScriptReview = (row: EpisodeItem) => {
    ElMessageBox.confirm(`确定要撤回第 ${row.number} 集「${row.name}」的审核吗？`, '撤回审核', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      try {
        await fetchWithdrawScriptReview(String(row.id))
        row.status = 'writing'
        ElMessage.success('已撤回审核')
      } catch {
        ElMessage.error('撤回审核失败')
      }
    })
  }

  // ==================== 版本管理模式数据 ====================
  const versionSearchQuery = ref('')
  const versionFilterType = ref<VersionType | ''>('')
  const versionLoading = ref(false)
  const versionViewDialogVisible = ref(false)
  const compareDialogVisible = ref(false)
  const milestoneDialogVisible = ref(false)
  const currentVersion = ref<VersionItem | null>(null)
  const compareVersions = ref<ComparePair | null>(null)
  const selectedVersions = ref<VersionItem[]>([])

  const versionPagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const versionTypeMap: Record<VersionType, 'info' | 'success' | 'warning'> = {
    auto: 'info',
    manual: 'success',
    milestone: 'warning'
  }

  const versionLabelMap: Record<VersionType, string> = {
    auto: '自动保存',
    manual: '手动保存',
    milestone: '里程碑'
  }

  const milestoneForm = reactive({
    title: '',
    description: ''
  })

  const currentVersionScriptName = ref('')

  const versionList = ref<VersionItem[]>([])

  const loadProjectVersions = async (projectId: string) => {
    versionLoading.value = true
    try {
      const res = await fetchGetScriptDetail(String(projectId))
      if (res) {
        const versions = (res as any).versions || []
        versionList.value = versions.map((v: any) => ({
          id: v.id,
          version: v.version ?? '',
          title: v.title ?? '',
          author: v.author ?? v.creatorName ?? '',
          wordCount: v.wordCount ?? 0,
          changes: v.changes ?? v.changeLog ?? '',
          type: v.type ?? 'manual',
          time: v.time ?? v.createdAt ?? '',
          isCurrent: v.isCurrent ?? false,
          isMilestone: v.isMilestone ?? false,
          content: v.content ?? ''
        }))
        currentVersionScriptName.value = (res as any).title ?? (res as any).name ?? '未知剧本'
      } else {
        versionList.value = []
        currentVersionScriptName.value = '无剧本'
      }
      versionPagination.current = 1
    } catch {
      versionList.value = []
      currentVersionScriptName.value = '无剧本'
      ElMessage.error('加载版本数据失败')
    } finally {
      versionLoading.value = false
    }
  }

  const versionFilteredList = computed(() => {
    let result = versionList.value

    if (versionSearchQuery.value) {
      const q = versionSearchQuery.value.toLowerCase()
      result = result.filter(
        (item) =>
          item.version.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      )
    }

    if (versionFilterType.value) {
      result = result.filter((item) => item.type === versionFilterType.value)
    }

    return result
  })

  watch(versionFilteredList, (list) => {
    versionPagination.total = list.length
  })

  // ==================== 版本管理模式操作 ====================
  const handleVersionSelectionChange = (selection: VersionItem[]) => {
    selectedVersions.value = selection
  }

  const handleVersionView = (row: VersionItem) => {
    currentVersion.value = row
    versionViewDialogVisible.value = true
  }

  const handleVersionCompare = (row: VersionItem) => {
    const currentIndex = versionList.value.findIndex((item) => item.id === row.id)
    const oldVersion = versionList.value[currentIndex + 1]
    if (oldVersion) {
      compareVersions.value = {
        old: oldVersion,
        new: row
      }
      compareDialogVisible.value = true
    } else {
      ElMessage.warning('没有更早的版本可以对比')
    }
  }

  const handleVersionRollback = (row: VersionItem) => {
    ElMessageBox.confirm(`确定要回滚到 ${row.version} 吗？当前未保存的内容将丢失。`, '回滚确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      versionList.value.forEach((item) => {
        item.isCurrent = item.id === row.id
      })
      ElMessage.success(`已回滚到 ${row.version}`)
    })
  }

  const handleVersionDelete = (row: VersionItem) => {
    if (row.isCurrent) {
      ElMessage.warning('不能删除当前版本')
      return
    }
    ElMessageBox.confirm(`确定要删除 ${row.version} 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      versionList.value = versionList.value.filter((item) => item.id !== row.id)
      ElMessage.success('删除成功')
    })
  }

  const handleImportVersion = (data: { file: File; name: string; content?: string }) => {
    ElMessage.success(`版本文件「${data.name}」导入成功`)
    const newVersion: VersionItem = {
      id: String(Date.now()),
      version: `v1.${versionList.value.length}`,
      title: `导入：${data.name.replace(/\.[^/.]+$/, '')}`,
      author: '当前用户',
      wordCount: data.content?.length || 0,
      changes: '从文件导入的版本',
      type: 'manual',
      time: new Date().toLocaleString(),
      isCurrent: false,
      isMilestone: false,
      content: data.content || ''
    }
    versionList.value.unshift(newVersion)
    ElMessage.success('版本导入完成')
  }

  const handleCreateMilestone = () => {
    milestoneForm.title = ''
    milestoneForm.description = ''
    milestoneDialogVisible.value = true
  }

  const handleConfirmMilestone = () => {
    if (!milestoneForm.title) {
      ElMessage.warning('请输入里程碑标题')
      return
    }
    const newVersion: VersionItem = {
      id: String(Date.now()),
      version: `v1.${versionList.value.length + 1}`,
      title: milestoneForm.title,
      author: '当前用户',
      wordCount: 3250,
      changes: milestoneForm.description || '标记为里程碑版本',
      type: 'milestone',
      time: new Date().toLocaleString(),
      isCurrent: false,
      isMilestone: true,
      content: ''
    }
    versionList.value.unshift(newVersion)
    milestoneDialogVisible.value = false
    ElMessage.success('里程碑标记成功')
  }

  // ==================== 页面模式切换 ====================
  const switchToList = () => {
    pageMode.value = 'list'
  }

  const switchToEditor = () => {
    pageMode.value = 'editor'
  }

  const switchToVersion = () => {
    // 加载当前项目的版本数据
    loadProjectVersions(currentProjectId.value)
    // 如果有当前编辑的剧本，更新版本页的剧本名称
    if (currentEditingScript.value) {
      currentVersionScriptName.value = `第${currentEditingScript.value.number}集：${currentEditingScript.value.name}`
    }
    pageMode.value = 'version'
  }

  // ==================== 生命周期 ====================
  onBeforeUnmount(() => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer)
  })
</script>

<style lang="scss" scoped>
  .script-library-page {
    .project-switch-bar {
      padding: 12px 16px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .switch-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;
      }
    }

    .project-info-card {
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: var(--custom-radius);

      .project-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
      }

      .project-detail {
        h3 {
          font-size: 16px;
        }
      }

      .project-stats {
        .stat-item {
          text-align: center;
          padding: 0 12px;
          border-right: 1px solid var(--el-border-color-lighter);

          &:last-child {
            border-right: none;
          }

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

    .view-switcher {
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .scrollable-content {
      max-height: calc(100vh - 380px);
      overflow-y: auto;
      padding-right: 8px;

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

    .episode-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      padding-bottom: 16px;
    }

    .episode-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--el-box-shadow-light);
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .episode-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .episode-number {
          font-size: 13px;
          font-weight: 600;
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
          padding: 4px 10px;
          border-radius: 20px;
        }
      }

      .episode-title {
        font-size: 15px;
        margin-bottom: 8px;
      }

      .episode-desc {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        line-height: 1.5;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 40px;
      }

      .episode-meta {
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .episode-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .episode-actions {
        display: flex;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }

    .episode-table-number {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-block;
    }

    .episode-detail {
      .detail-header {
        padding-bottom: 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        .detail-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          flex-shrink: 0;
        }
      }

      .script-content-section {
        .section-title {
          font-size: 15px;
          color: var(--el-text-color-primary);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .script-content-preview {
          max-height: 400px;
          overflow-y: auto;
          padding: 16px;
          background: var(--el-fill-color-lighter);
          border-radius: var(--custom-radius);

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

          pre {
            margin: 0;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.8;
            color: var(--el-text-color-primary);
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: center;
      padding-top: 16px;
    }

    // ==================== 编辑器模式样式 ====================
    .script-editor-container {
      display: flex;
      gap: 20px;
      height: calc(100vh - 240px);
      min-height: 500px;
    }

    .script-sidebar {
      width: 280px;
      flex-shrink: 0;
      overflow-y: auto;
      padding-right: 8px;

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

      .script-info-form {
        :deep(.el-form-item) {
          margin-bottom: 16px;
        }
      }
    }

    .script-editor-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: var(--custom-radius);
      overflow: hidden;
    }

    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: var(--el-fill-color-lighter);
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .editor-content {
      flex: 1;
      overflow: hidden;

      .script-textarea {
        height: 100%;

        :deep(.el-textarea__inner) {
          height: 100% !important;
          border: none;
          border-radius: 0;
          font-family: 'Courier New', monospace;
          line-height: 1.8;
          padding: 16px;
        }
      }
    }

    .editor-status {
      padding: 8px 16px;
      background: var(--el-fill-color-lighter);
      border-top: 1px solid var(--el-border-color-lighter);
    }

    .script-preview {
      .preview-title {
        font-size: 20px;
        font-weight: 600;
        text-align: center;
        margin-bottom: 12px;
      }

      .preview-meta {
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .preview-content {
        white-space: pre-wrap;
        line-height: 1.8;
        font-family: 'Courier New', monospace;
        font-size: 14px;
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    // ==================== 版本管理模式样式 ====================
    .version-detail {
      .version-content {
        white-space: pre-wrap;
        line-height: 1.8;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        background: var(--el-fill-color-lighter);
        padding: 16px;
        border-radius: var(--custom-radius);
        max-height: 500px;
        overflow-y: auto;
      }
    }

    .version-compare {
      .compare-header {
        padding: 12px 16px;
        background: var(--el-fill-color-lighter);
        border-radius: var(--custom-radius);
      }

      .compare-body {
        display: flex;
        gap: 16px;
        height: 500px;
      }

      .compare-panel {
        flex: 1;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: var(--custom-radius);
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .panel-header {
          padding: 10px 16px;
          background: var(--el-fill-color-lighter);
          font-weight: 500;
          font-size: 14px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .panel-content {
          flex: 1;
          padding: 16px;
          white-space: pre-wrap;
          line-height: 1.8;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          overflow-y: auto;
          margin: 0;
        }
      }
    }

    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
