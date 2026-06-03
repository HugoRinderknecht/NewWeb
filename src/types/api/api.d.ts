/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义，与 Api.json (OpenAPI 3.0.1) 对齐
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 业务模块类型（项目、剧本、分镜、资产、审核等）
 * - 全局命名空间声明
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { account: 'admin', password: '12345678' }
 * const response: Api.Auth.LoginResponse = await fetchLogin(params)
 * ```
 *
 * @module types/api/api
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页请求参数 */
    interface PaginationParams {
      page?: number
      pageSize?: number
      current?: number
      size?: number
      total?: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = PaginationParams

    /** 后端分页响应结构 (PageResult) */
    interface PaginatedResponse<T = any> {
      records: T[]
      total: number
      page: number
      pageSize: number
      totalPages: number
      hasNext: boolean
      hasPrevious: boolean
      first: boolean
      last: boolean
      currentSize: number
      empty: boolean
    }

    /** 启用状态 */
    type EnableStatus = 0 | 1

    /** 审核状态VO */
    interface ReviewStatusVO {
      reviewType: string
      targetId: string
      status: number
      statusText: string
    }

    /** 分页配置 */
    interface PaginationConfig {
      current?: number
      size?: number
      total?: number
    }
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 (LoginRequest) */
    interface LoginParams {
      account: string
      password: string
      captchaKey?: string
      captchaCode?: string
    }

    /** 登录/Token响应 (LoginVO) */
    interface LoginResponse {
      token: string
      refreshToken: string
      tokenType: string
      expiresIn: number
      refreshExpiresIn: number
      userId: string
      username: string
      avatar: string
      email: string
    }

    /** 注册参数 (RegisterRequest) */
    interface RegisterParams {
      username?: string
      password: string
      email?: string
      phone?: string
      captchaKey?: string
      captchaCode?: string
      avatar?: string
      autoLogin?: boolean
    }

    /** 注册响应 (RegisterVO) */
    interface RegisterResponse {
      id: string
      username: string
      email: string
      phone: string
      avatar: string
      status: number
      createTime: string
      updateTime: string
      roles: string[]
      token?: string
      refreshToken?: string
      tokenType?: string
      expiresIn?: number
      refreshExpiresIn?: number
    }

    /** 图形验证码响应 (CaptchaVO) */
    interface CaptchaResponse {
      key: string
      image: string
      captchaKey?: string
      captchaImage?: string
    }

    /** 用户信息 (UserVO) */
    interface UserInfo {
      id?: string
      username?: string
      email?: string
      phone?: string
      avatar?: string
      status?: number
      createTime?: string
      updateTime?: string
      roles?: string[]
      buttons?: string[]
      userName?: string
      userId?: string | number
    }

    /** 头像信息 (AvatarVO) */
    interface AvatarInfo {
      userId: string
      avatar: string
      mediaType: string
    }

    /** 权限信息 (PermissionResponseVO) */
    interface PermissionInfo {
      userId: string
      username: string
      roleGroup: string
      roleGroupName: string
      roleLevel: number
      permissions: PermissionDetailVO[]
      teamInfo: TeamInfo
      projectIds: string[]
      projectRoles: Record<string, ProjectRoleInfo>
    }

    /** 权限详情VO */
    interface PermissionDetailVO {
      moduleCode: string
      moduleName: string
      actions: string[]
    }

    /** 团队信息 */
    interface TeamInfo {
      teamId: string
      teamName: string
    }

    /** 项目角色信息 */
    interface ProjectRoleInfo {
      projectId: string
      projectName: string
      role: string
    }

    /** 修改用户信息参数 (UpdateUserRequest) */
    interface UpdateProfileParams {
      username?: string
      email?: string
      phone?: string
    }

    /** 重置密码参数 (PasswordResetRequest) */
    interface ResetPasswordParams {
      email: string
      captchaCode: string
      newPassword: string
    }

    /** 刷新Token参数 (RefreshTokenRequest) */
    interface RefreshTokenParams {
      refreshToken: string
    }

    /** 邮箱验证码参数 (EmailCaptchaRequest) */
    interface EmailCaptchaParams {
      email: string
    }
  }

  /** 项目类型 */
  namespace Project {
    /** 项目列表项 (ProjectVO) */
    interface ProjectListItem {
      id: string
      projectName: string
      description: string
      status: number
      teamId: string
      createdBy: string
      creatorName: string
      coverImage: string
      memberCount: number
      /** 当前用户在该项目中的角色，后端可能不返回 */
      userRole?: string
      createTime: string
    }

    /** 项目搜索参数 */
    interface ProjectSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      status?: number
      teamId?: string
    }

    /** 项目详情 (ProjectDetailVO) */
    interface ProjectDetail extends ProjectListItem {
      adminCount: number
      storyboardCount: number
      completedStoryboardCount?: number
      videoCount: number
      assetCount: number
      updateTime: string
    }

    /** 创建项目参数 (ProjectCreateRequest) */
    interface CreateProjectParams {
      projectName: string
      description?: string
      coverImage?: string
    }

    /** 更新项目参数 (ProjectUpdateRequest) */
    interface UpdateProjectParams {
      projectName?: string
      description?: string
    }

    /** 封面上传响应 (CoverUploadResponse) */
    interface CoverUploadResponse {
      coverUrl: string
    }

    /** 成员搜索参数 */
    interface MemberSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
    }

    /** 项目成员角色枚举 (与 OpenAPI ProjectMemberAddRequest.role.pattern 对齐) */
    type ProjectMemberRole =
      | 'admin'
      | 'director'
      | 'storyboard'
      | 'art'
      | 'video'
      | 'audio'
      | 'edit'

    /** 项目成员VO */
    interface ProjectMemberVO {
      id: string
      userId: string
      userName: string
      avatar: string
      role: ProjectMemberRole
      joinTime: string
      /** 仅前端使用，后端未返回 */
      email?: string
      /** 仅前端使用，后端未返回 */
      status?: 'active' | 'disabled'
    }

    /** 添加成员参数 */
    interface AddMemberParams {
      userId: string
      role: ProjectMemberRole
    }

    /** 更新成员角色参数 */
    interface UpdateMemberRoleParams {
      memberId: string
      role: ProjectMemberRole
    }

    /** 项目配置VO */
    interface ProjectConfigVO {
      projectId: string
      configs: Record<string, string>
    }

    /** 审核门禁配置VO (ProjectReviewConfigVO) */
    interface ReviewConfigVO {
      projectId: string
      /** 分镜审核开关 */
      storyboard: boolean
      /** 首帧图审核开关 */
      firstFrame: boolean
      /** 视频审核开关 */
      video: boolean
    }

    /** 审核门禁配置参数 (ProjectReviewConfigUpdateRequest) */
    interface ReviewConfigParams {
      storyboard?: boolean
      firstFrame?: boolean
      video?: boolean
    }
  }

  /** 剧本类型 */
  namespace Script {
    /** 剧本列表项 (ScriptVO) */
    interface ScriptListItem {
      id: string
      projectId: string
      title: string
      description: string
      content: string
      status: number
      createdBy: string
      creatorName: string
      createTime: string
      updateTime: string
    }

    /** 剧本搜索参数 (ScriptQueryRequest) */
    interface ScriptSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      status?: number
    }

    /** 剧本详情 (ScriptDetailVO) */
    interface ScriptDetail extends ScriptListItem {
      statusText: string
      episodeCount: number
      storyboardCount: number
      reviewStatus: number | null
      reviewStatusText: string
      reviewTaskId: string
      reviewerName: string
      reviewComment: string
      submittedAt: string
      reviewedAt: string
    }

    /** 创建剧本参数 (ScriptCreateRequest) */
    interface CreateScriptParams {
      title: string
      description?: string
      content?: string
      status?: number
    }

    /** 更新剧本参数 (ScriptUpdateRequest) */
    interface UpdateScriptParams {
      title?: string
      description?: string
      content?: string
      status?: number
    }

    /** 剧本审核状态 (ScriptReviewStatusVO) */
    interface ScriptReviewStatusVO {
      scriptId: string
      scriptStatus: number
      scriptStatusText: string
      reviewStatus: number | null
      reviewStatusText: string
      reviewTaskId: string
      reviewType: string
      reviewerId: string
      reviewerName: string
      comment: string
      submittedAt: string
      reviewedAt: string
    }

    /** 审核状态VO (通用) */
    type ReviewStatusVO = Api.Common.ReviewStatusVO

    /** 分集 (EpisodeVO / ScriptEpisodeVO) */
    interface Episode {
      id: string
      projectId: string
      scriptId: string
      episodeName: string
      content: string
      episodeIndex: number
      createTime: string
      updateTime: string
    }

    /** 分集详情 (同 EpisodeVO) */
    type EpisodeDetail = Episode

    /** 创建/更新分集参数 (ScriptEpisodeUpdateRequest) */
    interface EpisodeParams {
      scriptId?: string
      episodeName?: string
      episodeIndex?: number
      content?: string
    }

    /** 拆解结果 (ScriptDecomposeResultVO) */
    interface DecomposeResult {
      scriptId: string
      episodeCount: number
      episodes: Episode[]
      workflowRunId: string
      duration: number
    }

    /** AI处理结果包装 */
    interface AiProcessResult<T> {
      status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
      message: string
      recordId: string
      version: number
      result: T
    }

    /** 违规条目 (ViolationItemVO) */
    interface ViolationItem {
      location: string
      type: string
      level: string
      snippet: string
      hitWord: string
      status: string
    }

    /** 违规审核结果 (ScriptReviewResultVO) */
    interface ReviewResult {
      scriptId: string
      violations: ViolationItem[]
      violationCount: number
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
      markedVersion: string
      cleanVersion: string
      globalWarning: string
    }

    /** 人物小传条目 (CharacterProfileItemVO) */
    interface CharacterProfileItem {
      name: string
      identity: string
      appearance: string
      personality: string
      background: string
      voiceRef: string
      appearanceSpan: string
      verificationStatus: string
      relations: {
        target: string
        relation: string
      }[]
    }

    /** 人物小传结果 (CharacterProfileResultVO) */
    interface CharacterProfileResult {
      scriptId: string
      profiles: CharacterProfileItem[]
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 人物小传 (兼容旧类型) */
    type CharacterProfile = CharacterProfileItem

    /** 提取资产 - 人物 (AssetCharacterVO) */
    interface AssetCharacter {
      assetId: string
      name: string
      level: string
      aliases: string[]
      sourceEpisode: string
    }

    /** 提取资产 - 场景 (AssetSceneVO) */
    interface AssetScene {
      assetId: string
      name: string
      sceneType: string
      sourceEpisode: string
    }

    /** 提取资产 - 道具 (AssetPropVO) */
    interface AssetProp {
      assetId: string
      name: string
      category: string
      firstInteractedBy: string
      interactions: number
    }

    /** 提取资产 - 服装 (AssetCostumeVO) */
    interface AssetCostume {
      assetId: string
      name: string
      character: string
      scene: string
      sourceEpisode: string
    }

    /** 提取资产结果 (AssetExtractResultVO) */
    interface ExtractedAssets {
      scriptId: string
      characters: AssetCharacter[]
      scenes: AssetScene[]
      props: AssetProp[]
      costumes: AssetCostume[]
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 风格配置参数 (StyleConfigRequest) */
    interface StyleConfigParams {
      keywords: string
      refAnalysisId?: string
      force?: boolean
    }

    /** 风格配置 (StyleConfigResultVO) */
    interface StyleConfig {
      id: string
      projectId: string
      artStyle: string
      styleNarrative: string
      materialPreference: string
      colorScheme: string
      lightingRecipe: string
      avoidFeatures: string
      status: string
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 参考图分析参数 (RefAnalysisRequest) */
    interface RefAnalysisParams {
      imageUrls: string[]
      force?: boolean
    }

    /** 参考图分析结果 (RefAnalysisResultVO) */
    interface RefAnalysisResult {
      styleRef: string
      styleRefAvoid: string
      textureLighting: string
      textureLightingAvoid: string
      colorSystem: string
      colorSystemAvoid: string
      styleTagName: string
      styleTagKeywords: string[]
      imageCount: number
      fusionMode: string
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 音色提示词条目 (VoicePromptItem) */
    interface VoicePromptItem {
      role: string
      gender: string
      age: string
      tier: string
      reviewStatus: string
      finalPrompt: string
    }

    /** 音色提示词结果 (VoicePromptResultVO) */
    interface VoicePromptResult {
      scriptId: string
      voicePrompts: VoicePromptItem[]
      distinctivenessCheck: Record<string, unknown>
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 审核后状态 (ScriptPostApprovalStatusVO) */
    interface PostApprovalStatus {
      status: number
      statusText: string
      styleConfigReady: boolean
      assetsReady: boolean
      assetCount: number
      startedAt: string
      estimatedSeconds: number
      elapsedSeconds: number
    }

    /** 命名提示词 (NamedPrompt) */
    interface NamedPrompt {
      assetId: string
      name: string
      prompt: string
    }

    /** 资产提示词结果 (AssetPromptResultVO) */
    interface AssetPromptsResult {
      scriptId: string
      characterPrompts: NamedPrompt[]
      scenePrompts: NamedPrompt[]
      propPrompts: NamedPrompt[]
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 生成图片 (GeneratedImage) */
    interface GeneratedImage {
      assetId: string
      extractAssetId: string
      assetName: string
      imageUrl: string
      status: string
    }

    /** 资产图片结果 (AssetImageResultVO) */
    interface AssetImageResult {
      scriptId: string
      images: GeneratedImage[]
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 资产图片项 (AssetImageVO) */
    interface AssetImageItem {
      assetId: string
      extractAssetId: string
      assetName: string
      assetType: string
      promptText: string
      imageUrl: string
      status: string
      createTime: string
    }

    /** 视频提示词结果 (VideoPromptResultVO) */
    interface VideoPromptResult {
      episodeId: string
      episodeMeta: Record<string, unknown>
      paragraphs: VideoPromptParagraph[]
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
    }

    /** 视频提示词段落 (VideoPromptParagraphVO) */
    interface VideoPromptParagraph {
      index: number
      duration: number
      prompt: string
      characterInfo: string
      sceneElements: string
      assetMap: Record<string, string>
      shots: VideoPromptShot[]
    }

    /** 视频提示词镜头 */
    interface VideoPromptShot {
      shotIndex: number
      prompt: string
      duration: number
      cameraMovement: string
    }
  }

  /** AI处理记录 */
  namespace AiProcess {
    /** AI处理状态查询参数 */
    interface StatusQueryParams {
      type: string
      businessId: string
    }

    /** AI处理记录 */
    interface AiProcessRecord {
      id: string
      type: string
      businessId: string
      status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
      message: string
      version: number
      resultData: Record<string, unknown> | null
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
      createTime: string
      updateTime: string
    }

    /** AI处理历史列表项(不含完整resultData) */
    interface AiProcessHistoryItem {
      id: string
      type: string
      businessId: string
      status: 'PROCESSING' | 'COMPLETED' | 'FAILED'
      message: string
      version: number
      workflowRunId: string
      duration: number
      tokenUsage: number
      creditsDeducted: number
      createTime: string
      updateTime: string
    }
  }

  /** 分镜类型 */
  namespace Storyboard {
    /** 分镜列表项 (StoryboardVO) */
    interface StoryboardListItem {
      id: string
      sceneId: string
      projectId: string
      scriptId: string
      episodeId: string
      batchId: string
      episodeName: string
      episodeIndex: number
      storyboardNo: number
      title: string
      description: string
      prompt: string
      cameraAngle: string
      cameraMovement: string
      durationSeconds: number
      scriptText: string
      soundEffect: string
      backgroundMusic: string
      status: number
      assetCount: number
      imageCount: number
      versionCount: number
      createdBy: string
      creatorName: string
      createTime: string
      updateTime: string
      name?: string
      type?: string
      duration?: number
      focalLength?: string
    }

    /** 分镜搜索参数 */
    interface StoryboardSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      status?: number
      episodeId?: string
      sceneId?: string
    }

    /** 分镜详情 (StoryboardDetailVO) */
    interface StoryboardDetail extends StoryboardListItem {
      projectName: string
      scriptTitle: string
      assets: StoryboardAsset[]
      images: StoryboardImage[]
      recentVersions: StoryboardVersion[]
    }

    /** 创建分镜参数 (StoryboardCreateRequest) */
    interface CreateStoryboardParams {
      episodeId?: string
      sceneId?: string
      title?: string
      description?: string
      prompt?: string
      cameraAngle?: string
      cameraMovement?: string
      durationSeconds?: number
      scriptText?: string
      soundEffect?: string
      backgroundMusic?: string
      scriptId?: string
      name?: string
      source?: string
      status?: number | string
      thumbnail?: string
    }

    /** 更新分镜参数 (StoryboardUpdateRequest) */
    interface UpdateStoryboardParams {
      title?: string
      description?: string
      prompt?: string
      cameraAngle?: string
      cameraMovement?: string
      durationSeconds?: number
      scriptText?: string
      soundEffect?: string
      backgroundMusic?: string
      storyboardNo?: number
      name?: string
      sceneId?: string
      thumbnail?: string
    }

    /** 审核状态VO */
    type ReviewStatusVO = Api.Common.ReviewStatusVO

    /** 分镜版本 */
    interface StoryboardVersion {
      id: string
      version: number
      createTime: string
      operator: string
    }

    /** 分镜配图 */
    interface StoryboardImage {
      id: string
      url: string
      description: string
      sortOrder: number
    }

    /** 添加配图参数 */
    interface AddImageParams {
      url: string
      description?: string
      sortOrder?: number
    }

    /** 分镜资产 */
    interface StoryboardAsset {
      id: string
      storyboardId: string
      assetId: string
      assetName: string
      assetType: string
      thumbnailUrl: string
      createTime: string
    }

    /** 镜头 */
    interface Scene {
      id: string
      name: string
      description: string
      sortOrder: number
      episodeId?: string
      angle?: string
    }

    /** 创建镜头参数 (SceneCreateRequest) */
    interface CreateSceneParams {
      episodeId: string
      name?: string
      description?: string
      angle?: string
      sortOrder?: number
    }

    /** 重排序参数 */
    interface ReorderParams {
      storyboardId: string
      storyboardNo: number
    }

    /** 批量操作参数 */
    interface BatchOperationParams {
      storyboardIds: string[]
      operation: string
      params?: Record<string, unknown>
    }

    /** 重建参数 */
    interface RebuildParams {
      storyboardIds: string[]
      reason?: string
    }

    /** 剧本分镜列表 */
    interface ScriptStoryboards {
      scriptId: string
      scriptName: string
      storyboards: StoryboardListItem[]
    }
  }

  /** 资产类型 */
  namespace Asset {
    /** 资产列表项 (AssetVO) */
    interface AssetListItem {
      id: string
      assetName: string
      assetType: string
      fileType: string
      fileUrl: string
      thumbnailUrl: string
      categoryName: string
      fileSize: number
      usageCount: number
      createdBy: string
      creatorName: string
      status: number
      createTime: string
      updateTime: string
      duplicate: boolean
      existingAssetId: string
      fileHash: string
    }

    /** 资产搜索参数 */
    interface AssetSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      assetType?: string
      categoryName?: string
    }

    /** 资产详情 (AssetDetailVO) */
    interface AssetDetail extends AssetListItem {
      categoryId: string
      description: string
      extraMetadata: string
      tags: string[]
      currentVersion: number
      isPublic: number
    }

    /** 上传资产参数 */
    interface UploadAssetParams {
      file: File
      assetName?: string
      assetType?: string
      categoryName?: string
      category?: string
      tags?: string[]
    }

    /** 更新资产参数 */
    interface UpdateAssetParams {
      assetName?: string
      assetType?: string
      categoryName?: string
      tags?: string[]
      description?: string
    }

    /** 资产版本 */
    interface AssetVersion {
      id: string
      version: number
      fileUrl: string
      createBy: string
      createTime: string
    }

    /** 分片上传初始化参数 */
    interface ChunkInitParams {
      fileName: string
      fileSize: number
      assetName?: string
      assetType?: string
      categoryName?: string
      category?: string
    }

    /** 分片上传初始化响应 */
    interface ChunkInitResponse {
      uploadId: string
      chunkSize: number
      totalChunks: number
    }

    /** 分片上传参数 */
    interface ChunkUploadParams {
      uploadId: string
      chunkNumber: number
      chunk: File
    }

    /** 分片合并参数 */
    interface ChunkCompleteParams {
      uploadId: string
    }

    /** 批量上传参数 */
    interface BatchUploadParams {
      files: File[]
      assetType?: string
      categoryName?: string
    }

    /** 批量标签参数 */
    interface BatchTagParams {
      assetIds: string[]
      tags: string[]
    }

    /** 批量移动参数 */
    interface BatchMoveParams {
      assetIds: string[]
      categoryName: string
    }

    /** AI生成资产参数 */
    interface AiGenerateParams {
      prompt: string
      negativePrompt?: string
      style?: string
      assetType: string
      categoryName?: string
    }

    /** 团队资产搜索参数 */
    interface TeamAssetSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      assetType?: string
      categoryName?: string
    }

    /** 团队资产项 */
    interface TeamAssetItem {
      id: string
      assetName: string
      assetType: string
      categoryName: string
      tags: string[]
      fileSize: number
      fileUrl: string
      thumbnailUrl: string
      teamId: string
      createBy: string
      createTime: string
      updateTime: string
    }

    /** 上传团队资产参数 */
    interface UploadTeamAssetParams {
      file: File
      assetName?: string
      assetType?: string
      tags?: string[]
    }
  }

  /** 角色类型 */
  namespace Character {
    interface CharacterListItem {
      characterId: string
      name: string
      code: string
      gender: string
      age: number
      personality: string
      positioning: string
      appearance: string
      background: string
      avatar: string
      projectId: string
      createTime: string
      updateTime: string
    }

    interface CharacterDetail extends CharacterListItem {
      storyboardIds: string[]
    }

    interface CreateCharacterParams {
      name: string
      code?: string
      gender?: string
      age?: number
      personality?: string
      positioning?: string
      appearance?: string
      background?: string
    }

    type UpdateCharacterParams = Partial<CreateCharacterParams>

    type CharacterListResponse = Common.PaginatedResponse<CharacterListItem>

    interface CharacterSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      gender?: string
      projectId?: string
    }
  }

  /** 团队类型 */
  namespace Team {
    /** 用户团队VO */
    interface UserTeamVO {
      teamId: string
      teamName: string
      teamAvatar: string
      role: string
      memberCount: number
      isCurrent: boolean
    }

    /** 团队列表项 (TeamVO) */
    interface TeamListItem {
      id: string
      teamName: string
      teamCode: string
      description: string
      avatar: string
      memberCount: number
      memberLimit: number
      ownerId: string
      status: number
      createTime: string
    }

    /** 团队详情 (TeamDetailVO) */
    interface TeamDetail {
      id: string
      teamName: string
      teamCode: string
      description: string
      avatar: string
      memberLimit: number
      ownerId: string
      ownerName: string
      memberCount: number
      adminCount: number
      pendingCount: number
      status: number
      createTime: string
      updateTime: string
      name?: string
      email?: string
      website?: string
      region?: string
      projectCount?: number
      teamId?: string
    }

    /** 创建团队参数 (TeamCreateRequest) */
    interface CreateTeamParams {
      teamName: string
      description?: string
      memberLimit?: number
    }

    /** 更新团队参数 (TeamUpdateRequest) */
    interface UpdateTeamParams {
      teamName?: string
      description?: string
      avatar?: string
      email?: string
      website?: string
      region?: string
    }

    /** 加入申请参数 */
    interface JoinApplyParams {
      teamId: string
      reason?: string
    }

    /** 加入申请VO */
    interface JoinApplicationVO {
      id: string
      teamId: string
      teamName: string
      userId: string
      userName: string
      userAvatar: string
      status: 'pending' | 'approved' | 'rejected'
      reason: string
      rejectReason: string
      applyTime: string
      processTime: string
    }

    /** 成员搜索参数 */
    interface MemberSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      role?: string
      status?: string
    }

    /** 团队成员VO（后端标准返回） */
    interface TeamMemberVO {
      id: string
      userId: string
      userName: string
      avatar: string
      role: string
      status: string
      joinTime: string
    }

    /** 团队成员原始数据（兼容多版本API字段差异） */
    interface TeamMemberRawVO {
      id?: string
      memberId?: string
      userId?: string
      userName?: string
      nickname?: string
      email?: string
      avatar?: string
      roleNames?: string[]
      roleName?: string
      role?: string
      department?: string
      joinType?: 'invite' | 'apply'
      joinTime?: string
      status?: number | string
    }

    /** 团队成员展示数据（前端标准化格式） */
    interface TeamMemberDisplayVO {
      id: string
      name: string
      email: string
      avatar: string
      roles: string[]
      department: string
      joinType: 'invite' | 'apply'
      joinTime: string
      status: 'active' | 'pending' | 'disabled'
    }

    /** 更新成员角色参数 (MemberRoleUpdateRequest) */
    interface UpdateMemberRoleParams {
      memberId: string
      role: string
      teamRoleId?: string
    }

    /** 更新成员状态参数 */
    interface UpdateMemberStatusParams {
      memberId: string
      status: string
    }

    /** 成员权限VO */
    interface MemberPermissionVO {
      memberId: string
      permissionCodes: string[]
    }

    /** 团队角色VO */
    interface TeamRoleVO {
      id: string
      name: string
      code: string
      description: string
      memberCount: number
      createTime: string
    }

    /** 创建角色参数 */
    interface CreateRoleParams {
      name: string
      code: string
      description?: string
    }

    /** 更新角色参数 */
    interface UpdateRoleParams {
      name?: string
      code?: string
      description?: string
    }

    /** 团队角色详情VO */
    interface TeamRoleDetailVO extends TeamRoleVO {
      permissionCodes: string[]
    }

    /** 可分配权限VO */
    interface AvailablePermissionVO {
      code: string
      name: string
      category: string
      description: string
    }

    /** 邀请码VO */
    interface InviteCodeVO {
      id: string
      code: string
      createdBy: string
      usedCount: number
      maxUses: number
      expiresAt: string
      createTime: string
    }

    /** 创建邀请码参数 */
    interface CreateInviteCodeParams {
      maxUses?: number
      expiresAt?: string
    }

    /** 申请搜索参数 */
    interface ApplicationSearchParams extends Api.Common.CommonSearchParams {
      status?: string
    }
  }

  /** 审核类型 */
  namespace Review {
    /** 审核任务 (ReviewTaskVO) */
    interface ReviewTask {
      id: string
      storyboardId: string
      reviewType: string
      assetId: string
      projectId: string
      reviewerId: string
      reviewerName: string
      status: number
      comment: string
      createdBy: string
      creatorName: string
      reviewedAt: string
      claimedAt: string
      archivedAt: string
      dispatchedAt: string
      dispatchTarget: string
      createTime: string
    }

    /** 审核搜索参数 */
    interface ReviewSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      reviewType?: string
      status?: number
    }

    /** 审核项 (ReviewItemVO) */
    interface ReviewItem {
      reviewTaskId: string
      reviewType: string
      reviewTypeName: string
      status: number
      statusText: string
      projectId: string
      reviewerId: string
      reviewerName: string
      comment: string
      createdBy: string
      creatorName: string
      reviewedAt: string
      createTime: string
      targetId: string
      targetTitle: string
      targetDescription: string
      targetCoverUrl: string
    }

    /** 审核详情 (ReviewDetailVO) */
    interface ReviewDetail {
      id: string
      storyboardId: string
      reviewType: string
      assetId: string
      storyboardTitle: string
      projectId: string
      projectName: string
      reviewerId: string
      reviewerName: string
      status: number
      statusText: string
      comment: string
      createdBy: string
      creatorName: string
      reviewedAt: string
      claimedAt: string
      archivedAt: string
      dispatchedAt: string
      dispatchTarget: string
      createTime: string
      updateTime: string
    }

    /** 创建审核参数 */
    interface CreateReviewParams {
      reviewType: string
      targetId: string
      projectId?: string
      comment?: string
    }

    /** 审核决策参数 */
    interface DecisionParams {
      taskId?: string
      itemId?: string
      id?: string
      decision: 'approved' | 'rejected' | 'transfer'
      comment?: string
      reason?: string
      rejectReasonId?: number
      targetUser?: string
    }

    /** 批量决策参数 */
    interface BatchDecisionParams {
      taskIds: string[]
      decision: 'approved' | 'rejected' | 'transfer'
      comment?: string
      rejectReasonId?: number
    }

    /** 批量决策结果 */
    interface BatchDecisionResult {
      successCount: number
      failCount: number
      failures: { taskId: string; reason: string }[]
    }

    /** 审核状态VO */
    type ReviewStatusVO = Api.Common.ReviewStatusVO

    /** 审核统计 */
    interface ReviewStatistics {
      total: number
      pending: number
      approved: number
      rejected: number
    }

    /** 导出参数 */
    interface ExportParams {
      startTime?: string
      endTime?: string
      status?: number
    }

    /** 驳回原因 */
    interface RejectReason {
      id: number
      content: string
      category: string
      applicableTypes: string[]
      usageCount: number
      sort: number
      enabled: boolean
      createTime: string
    }

    /** 驳回原因参数 */
    interface RejectReasonParams {
      content: string
      category: string
      applicableTypes: string[]
      sort?: number
      enabled?: boolean
    }

    /** 审核路由配置 */
    interface RouteConfig {
      flows: RouteFlow[]
    }

    /** 审核流程 */
    interface RouteFlow {
      id: number
      name: string
      steps: RouteFlowStep[]
      approverList: RouteFlowApprover[]
      createTime: string
      status: string
      activeStep: number
    }

    /** 流程步骤 */
    interface RouteFlowStep {
      name: string
      approver: string
      time?: string
    }

    /** 流程审批人 */
    interface RouteFlowApprover {
      name: string
      done: boolean
      current: boolean
    }
  }

  /** 视频生成类型 */
  namespace Video {
    /** 视频任务状态 */
    type VideoTaskStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled' | 'expired'

    /** 视频任务 */
    interface VideoTask {
      id: string
      projectId: string
      scriptId?: string
      storyboardId?: string
      episodeId?: string
      name?: string
      status: VideoTaskStatus
      progress: number
      model: string
      prompt?: string
      resolution: string
      ratio: string
      duration: number
      fps?: string
      format?: string
      style?: string
      shots?: number
      priority: number
      submitTime: string
      estimatedTime?: string
      completeTime?: string
      videoUrl?: string
      fileSize?: string
      remark?: string
      previewToken?: string
      createdAt: string
      updatedAt: string
    }

    /** 视频任务搜索参数 */
    interface VideoTaskSearchParams extends Api.Common.CommonSearchParams {
      projectId?: string
      keyword?: string
      status?: string
    }

    /** 视频生成参数 (SeedanceGenerateRequest) */
    interface VideoGenerateParams {
      model?: string
      prompt?: string
      images?: string[]
      videos?: string[]
      audioUrls?: string[]
      resolution?: string
      ratio?: string
      duration?: number
      frames?: number
      seed?: number
      cameraFixed?: boolean
      watermark?: boolean
      generateAudio?: boolean
      priority?: number
      returnLastFrame?: boolean
      serviceTier?: string
      executionExpiresAfter?: number
      callbackUrl?: string
      safetyIdentifier?: string
      projectId: string
      scriptId?: string
      storyboardId?: string
      episodeId?: string
      previewToken: string
    }

    /** 视频预览参数 (同 SeedanceGenerateRequest，但 previewToken 由后端返回) */
    interface VideoPreviewParams {
      model?: string
      prompt?: string
      images?: string[]
      videos?: string[]
      audioUrls?: string[]
      resolution?: string
      ratio?: string
      duration?: number
      frames?: number
      seed?: number
      cameraFixed?: boolean
      watermark?: boolean
      generateAudio?: boolean
      priority?: number
      returnLastFrame?: boolean
      serviceTier?: string
      projectId: string
      scriptId?: string
      storyboardId?: string
      episodeId?: string
    }

    /** 视频预览结果 (SeedancePreviewVO) */
    interface VideoPreviewResult {
      previewToken: string
      videoCount: number
      totalDuration: number
      resolution: string
      model: string
      estimatedCredits: number
      storyboardDetails?: Array<{
        storyboardId: string
        storyboardNo: string
        title: string
        durationSeconds: number
        prompt: string
      }>
    }

    /** 视频提交结果 (SeedanceSubmitVO) */
    interface VideoSubmitResult {
      taskId: string
      status: string
      message?: string
    }

    /** 视频任务结果 (SeedanceResultVO) */
    interface VideoTaskResult {
      videoUrl: string
      duration: number
      size: number
      format: string
      resolution: string
      creditsConsumed: number
    }

    /** 违规检测结果 */
    interface ViolationCheckResult {
      violated: boolean
      reasons: string[]
    }

    /** 修复提示词参数 */
    interface FixPromptParams {
      prompt: string
      suggestion: string
    }

    /** 修复提示词结果 */
    interface FixPromptResult {
      prompt: string
      fixed: boolean
    }
  }

  /** 图片生成类型 */
  namespace Image {
    /** 图片生成参数 */
    interface ImageGenerateParams {
      prompt: string
      negativePrompt?: string
      style?: string
      size?: string
      count?: number
      seed?: string
    }

    /** 图片任务 */
    interface ImageTask {
      taskId: string
      status: 'queued' | 'running' | 'completed' | 'failed'
      progress?: number
      createTime?: string
    }

    /** 图片审核状态 */
    interface ImageReviewStatus {
      status: string
      reason?: string
    }

    /** 图片任务结果 */
    interface ImageTaskResult {
      images: ImageResultItem[]
    }

    /** 图片结果项 */
    interface ImageResultItem {
      url: string
      prompt?: string
      style?: string
      size?: string
    }

    /** 图片模型 */
    interface ImageModel {
      code: string
      name: string
      description?: string
      enabled?: boolean
    }
  }

  /** 工作流类型 */
  namespace Workflow {
    /** 上传结果 */
    interface UploadResult {
      fileId: string
      fileName: string
      fileUrl?: string
    }

    /** 执行结果 */
    interface ExecuteResult {
      taskId: string
      status: string
      outputs?: Record<string, any>
    }

    /** 多模态参数 */
    interface MultimodalParams {
      workflowCode?: string
      prompt?: string
      image?: File
      [key: string]: any
    }

    /** 链式参数 */
    interface ChainParams {
      steps: ChainStep[]
      [key: string]: any
    }

    /** 链式步骤 */
    interface ChainStep {
      workflowCode: string
      params: Record<string, any>
    }

    /** 运行状态 */
    interface RunStatus {
      runId: string
      status: 'queued' | 'running' | 'completed' | 'failed'
      outputs?: Record<string, any>
    }

    /** 风格反推参数 */
    interface StyleInferenceParams {
      image: File
    }

    /** 风格反推结果 */
    interface StyleInferenceResult {
      style: string
      prompt: string
      colors: string[]
      composition: string
      lighting: string
    }

    /** 工作流目录项 */
    interface WorkflowCatalogItem {
      code: string
      name: string
      description?: string
      category?: string
    }
  }

  /** 通知类型 */
  namespace Notification {
    /** 通知搜索参数 */
    interface NotificationSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      type?: string
      status?: string
    }

    /** 通知项 */
    interface NotificationItem {
      id: string
      title: string
      content: string
      type: string
      status: 'read' | 'unread'
      starred: boolean
      sender: string
      senderAvatar: string
      createTime: string
      avatar?: string
    }

    /** 通知偏好设置 */
    interface NotificationPreference {
      emailEnabled: boolean
      browserEnabled: boolean
      types: {
        type: string
        enabled: boolean
      }[]
    }

    /** 免打扰设置 */
    interface DndSettings {
      enabled: boolean
      startTime: string
      endTime: string
      timezone: string
    }

    /** 订阅项 */
    interface SubscriptionItem {
      id: string
      type: string
      name: string
      enabled: boolean
    }

    /** 订阅参数 */
    interface SubscriptionParams {
      type: string
      name: string
    }
  }

  /** 剪辑编辑器类型 */
  namespace Editor {
    /** 剪辑项目搜索参数 */
    interface EditProjectSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      status?: string
    }

    /** 剪辑项目 */
    interface EditProject {
      id: string
      name: string
      description: string
      status: string
      duration: number
      segmentCount: number
      createBy: string
      creatorName: string
      createTime: string
      updateTime: string
      projectId: string
      projectName: string
      editName: string
      resolution: string
      frameRate: number
      durationSeconds: number
      createdBy?: string
    }

    /** 剪辑项目详情 */
    interface EditProjectDetail extends EditProject {
      segments: Segment[]
    }

    /** 创建剪辑项目参数 */
    interface CreateEditProjectParams {
      name?: string
      description?: string
      projectId?: string
      projectName?: string
      editName?: string
      resolution?: string
      frameRate?: number
    }

    /** 更新剪辑项目参数 */
    interface UpdateEditProjectParams {
      name?: string
      description?: string
      editName?: string
      resolution?: string
      frameRate?: number
    }

    /** 片段 */
    interface Segment {
      id: string
      projectId: string
      type: string
      sourceUrl: string
      startTime: number
      endTime: number
      duration: number
      sortOrder: number
      metadata: Record<string, unknown>
    }

    /** 添加片段参数 */
    interface AddSegmentParams {
      type: string
      sourceUrl: string
      startTime: number
      endTime: number
      sortOrder?: number
      metadata?: Record<string, unknown>
    }

    /** 更新片段参数 */
    interface UpdateSegmentParams {
      type?: string
      sourceUrl?: string
      startTime?: number
      endTime?: number
      sortOrder?: number
      metadata?: Record<string, unknown>
    }

    /** 导出参数 */
    interface ExportParams {
      format: string
      resolution: string
      fps: number
      quality?: string
    }

    /** 导出任务 */
    interface ExportTask {
      id: string
      projectId: string
      status: 'queued' | 'processing' | 'completed' | 'failed'
      progress: number
      downloadUrl: string
      createTime: string
      completeTime: string
    }
  }

  /** 积分类型 */
  namespace Points {
    /** 积分信息 */
    interface CreditInfo {
      balance: number
      totalEarned: number
      totalSpent: number
    }

    /** 交易记录 */
    interface TransactionRecord {
      id: string
      type: 'earn' | 'spend'
      amount: number
      balance: number
      description: string
      source: string
      createTime: string
    }

    /** 定价项 */
    interface PricingItem {
      code: string
      name: string
      category: string
      unitPrice: number
      unit: string
      description: string
    }

    /** Token用量统计 */
    interface TokenUsage {
      totalTokens: number
      inputTokens: number
      outputTokens: number
      cost: number
    }

    /** Token用量记录 */
    interface TokenUsageRecord {
      id: string
      model: string
      inputTokens: number
      outputTokens: number
      totalTokens: number
      cost: number
      source: string
      createTime: string
    }
  }

  /** AI处理类型 */
  namespace AiProcess {
    /** 状态查询参数 */
    interface StatusSearchParams {
      scriptId?: string
      episodeId?: string
      processType?: string
    }

    /** 处理状态 */
    interface ProcessStatus {
      scriptId: string
      processType: string
      status: 'pending' | 'running' | 'completed' | 'failed'
      progress: number
      currentStep: string
      message: string
    }

    /** 历史查询参数 */
    interface HistorySearchParams extends Api.Common.CommonSearchParams {
      scriptId?: string
      processType?: string
      status?: string
    }

    /** 处理记录 */
    interface ProcessRecord {
      id: string
      scriptId: string
      processType: string
      status: string
      progress: number
      startTime: string
      endTime: string
      createBy: string
    }

    /** 处理记录详情 */
    interface ProcessRecordDetail extends ProcessRecord {
      params: Record<string, unknown>
      result: Record<string, unknown>
      error: string
      steps: {
        name: string
        status: string
        startTime: string
        endTime: string
        message: string
      }[]
    }
  }

  /** 数据历史类型 */
  namespace DataHistory {
    /** 历史搜索参数 */
    interface HistorySearchParams {
      targetType: string
      targetId: string
    }

    /** 历史版本 */
    interface HistoryVersion {
      id: string
      targetType: string
      targetId: string
      version: number
      summary: string
      operator: string
      createTime: string
    }

    /** 历史版本详情 */
    interface HistoryVersionDetail extends HistoryVersion {
      data: Record<string, unknown>
      diff: {
        field: string
        oldValue: unknown
        newValue: unknown
      }[]
    }

    /** 回退参数 */
    interface RollbackParams {
      historyId: string
      reason?: string
    }
  }

  /** 计费定价类型 */
  namespace Billing {
    /** 定价项 */
    interface BillingItem {
      id: string
      name: string
      code: string
      category: string
      unitPrice: number
      unit: string
      enabled: boolean
      description: string
      createTime: string
      updateTime: string
    }

    /** 创建定价参数 */
    interface CreateBillingParams {
      name: string
      code: string
      category: string
      unitPrice: number
      unit: string
      description?: string
    }

    /** 定价详情 */
    interface BillingDetail extends BillingItem {
      history: BillingHistoryItem[]
    }

    /** 更新定价参数 */
    interface UpdateBillingParams {
      name?: string
      unitPrice?: number
      unit?: string
      description?: string
    }

    interface BillingHistoryItem {
      id: string
      billingId: string
      field: string
      oldValue: unknown
      newValue: unknown
      operator: string
      createTime: string
    }

    interface BillingSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      category?: string
      enabled?: boolean
    }

    interface ToggleBillingParams {
      enabled: boolean
    }
  }

  /** 统计类型 */
  namespace Statistics {
    interface DashboardData {
      totalProjects: number
      activeProjects: number
      totalVideos: number
      totalStoryboards: number
      totalAssets: number
      creditsBalance: number
      creditsBalanceChange: string
      activeUsers: {
        values: number[]
        labels: string[]
      }
      totalUsers: string
      totalVisits: string
      dailyVisits: string
      weeklyChange: string
      pendingReviews: number
      pendingReviewsChange: string
      projectProgress: number
      projectProgressChange: string
      ownedProjects: number
      ownedProjectsChange: string
    }

    interface RealtimeData {
      activeUsers: number
      runningTasks: number
      todayVideos: number
      todayAssets: number
      data: {
        activities: {
          username: string
          action: string
          target: string
        }[]
      }
    }

    interface TrendParams {
      eventType: string
      startDate?: string
      endDate?: string
      granularity?: 'day' | 'week' | 'month'
      metrics?: string[]
    }

    interface TrendData {
      dates: string[]
      metrics: {
        name: string
        values: number[]
      }[]
      data: {
        values: number[]
        labels: string[]
      }
    }

    interface CreditsData {
      balance: number
      totalEarned: number
      totalSpent: number
      recentTransactions: {
        date: string
        amount: number
        type: string
      }[]
    }

    interface AlertItem {
      id: string
      type: string
      level: 'info' | 'warning' | 'error' | 'critical'
      message: string
      createTime: string
    }

    interface TeamRankingItem {
      teamId: string
      teamName: string
      score: number
      rank: number
      projectCount: number
      videoCount: number
    }

    interface TeamWorkload {
      teamId: string
      totalTasks: number
      completedTasks: number
      inProgressTasks: number
      overdueTasks: number
    }

    interface UserContributionItem {
      userId: string
      userName: string
      avatar: string
      contributionScore: number
      taskCount: number
      assetCount: number
    }

    interface UserActivityItem {
      userId: string
      userName: string
      avatar: string
      activeDays: number
      lastActiveTime: string
    }

    interface ProjectCompletion {
      teamId: string
      totalProjects: number
      completedProjects: number
      completionRate: number
    }

    interface ScheduledReportItem {
      id: string
      name: string
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
      enabled: boolean
      lastRunTime: string
      createTime: string
    }

    interface CreateScheduledReportParams {
      name: string
      frequency: 'daily' | 'weekly' | 'monthly'
      recipients: string[]
      enabled?: boolean
    }

    interface UpdateScheduledReportParams {
      name?: string
      frequency?: 'daily' | 'weekly' | 'monthly'
      recipients?: string[]
      enabled?: boolean
    }

    interface CustomReportParams {
      name: string
      startDate: string
      endDate: string
      metrics: string[]
      dimensions: string[]
    }

    interface ExportParams {
      format: string
      type?: string
      range?: string | [Date, Date] | null
      dimensions?: string[]
      startDate?: string
      endDate?: string
    }

    interface ProjectVideoStats {
      projectId: string
      totalVideos: number
      completedVideos: number
      failedVideos: number
      totalDuration: number
    }

    interface ProjectUsage {
      projectId: string
      totalCredits: number
      totalTokens: number
      totalAiCalls: number
    }

    interface ProjectUsageDetailParams extends Api.Common.CommonSearchParams {
      startDate?: string
      endDate?: string
      category?: string
    }

    interface ProjectUsageDetail {
      records: {
        date: string
        category: string
        credits: number
        tokens: number
        aiCalls: number
      }[]
    }

    interface ProjectStoryboardStats {
      projectId: string
      totalStoryboards: number
      completedStoryboards: number
      inProgressStoryboards: number
    }

    interface ProjectResources {
      projectId: string
      storageUsed: number
      bandwidthUsed: number
      computeUsed: number
    }

    interface ProjectAiUsage {
      projectId: string
      totalCalls: number
      totalTokens: number
      totalCost: number
      byModel: {
        model: string
        calls: number
        tokens: number
        cost: number
      }[]
    }

    interface StatisticsSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      startDate?: string
      endDate?: string
    }

    interface ProjectAnalysisItem {
      projectId: string
      projectName: string
      totalVideos: number
      totalStoryboards: number
      totalAssets: number
      completionRate: number
    }

    interface UserActivityRankItem {
      userId: string
      userName: string
      avatar: string
      activeDays: number
      contributionScore: number
      lastActiveTime: string
    }
  }

  /** 剧本资产类型 */
  namespace ScriptAsset {
    /** 创意资产列表项 (CreativeAssetVO) */
    interface ScriptAssetListItem {
      id: string
      projectId: string
      scriptId: string
      scriptTitle: string
      episodeId: string
      paragraphId: string
      shotId: string
      assetName: string
      assetType: string
      assetSubtype: string
      description: string
      referenceUrl: string
      payload: string
      extraMetadata: Record<string, unknown>
      parentAssetId: string
      rootExtractId: string
      libraryAssetId: string
      storyboardId: string
      tags: string[]
      reviewStatus: string
      status: string
      source: string
      version: number
      createTime: string
      updateTime: string
    }

    /** 创意资产详情 (同 CreativeAssetVO) */
    type ScriptAssetDetail = ScriptAssetListItem

    /** 创建创意资产参数 (CreativeAssetCreateRequest) */
    interface CreateScriptAssetParams {
      scriptId?: string
      assetName: string
      assetType?: string
      description?: string
      referenceUrl?: string
      extraData?: string
      tags?: string[]
      parentAssetId?: string
      libraryAssetId?: string
      sortOrder?: number
      assetLevel?: string
      assetAliases?: string[]
      assetCategory?: string
      assetOwner?: string
      assetCharacterRef?: string
      assetSceneRef?: string
      assetSceneType?: string
    }

    /** 更新创意资产参数 (CreativeAssetUpdateRequest) */
    interface UpdateScriptAssetParams {
      assetName?: string
      assetType?: string
      description?: string
      referenceUrl?: string
      extraData?: string
      tags?: string[]
      reviewStatus?: string
      parentAssetId?: string
      libraryAssetId?: string
      sortOrder?: number
      assetLevel?: string
      assetAliases?: string[]
      assetCategory?: string
      assetOwner?: string
      assetCharacterRef?: string
      assetSceneRef?: string
      assetSceneType?: string
    }

    /** 创意资产搜索参数 (CreativeAssetQueryRequest) */
    interface ScriptAssetSearchParams extends Api.Common.CommonSearchParams {
      scriptId?: string
      assetType?: string
      assetSubtype?: string
      source?: string
      reviewStatus?: string
      keyword?: string
    }

    /** 批量创建创意资产项 */
    interface BatchCreateScriptAssetItem {
      scriptId?: string
      assetName: string
      assetType?: string
      description?: string
      referenceUrl?: string
      extraData?: string
      tags?: string[]
      parentAssetId?: string
      libraryAssetId?: string
      sortOrder?: number
      assetLevel?: string
      assetAliases?: string[]
      assetCategory?: string
      assetOwner?: string
      assetCharacterRef?: string
      assetSceneRef?: string
      assetSceneType?: string
    }

    /** 生成资产提示词参数 (AssetPromptRequest) */
    interface GenerateAssetPromptsParams {
      assetExtractId?: string
      force?: boolean
    }

    /** 生成资产图片参数 (AssetImageGenRequest) */
    interface GenerateAssetImagesParams {
      assetPromptIds: string[]
      referenceImageUrls?: string[]
      force?: boolean
      sync?: boolean
      model?: string
      size?: string
      resolution?: string
    }

    /** 审核资产图片参数 (ImageReviewRequest) */
    interface ReviewAssetImagesParams {
      assetImageIds: string[]
      force?: boolean
    }

    /** 上传图片结果 */
    interface UploadImageResult {
      url: string
    }
  }

  /** 工作流管理类型 */
  namespace WorkflowManage {
    interface WorkflowManageListItem {
      id: string
      name: string
      code: string
      description: string
      category: string
      apiUrl: string
      enabled: boolean
      status: string
      createTime: string
      updateTime: string
    }

    interface WorkflowManageDetail extends WorkflowManageListItem {
      apiKey: string
      params: Record<string, unknown>
      headers: Record<string, string>
    }

    interface CreateWorkflowManageParams {
      name: string
      code: string
      description?: string
      category?: string
      apiUrl: string
      apiKey?: string
    }

    interface UpdateWorkflowManageParams {
      name?: string
      code?: string
      description?: string
      category?: string
      apiUrl?: string
      apiKey?: string
    }

    interface ToggleWorkflowStatusParams {
      enabled: boolean
    }

    interface TestConnectionParams {
      workflowCode?: string
      apiEndpoint?: string
      apiUrl?: string
      apiKey?: string
    }

    interface TestConnectionResult {
      connected: boolean
      latency: number
      message?: string
    }

    interface WorkflowManageSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      category?: string
      enabled?: boolean
    }
  }

  /** 视频模型管理类型 */
  namespace VideoModel {
    interface VideoModelListItem {
      modelId: string
      name: string
      code: string
      provider: string
      apiUrl: string
      resolution: string
      fps: string
      format: string
      enabled: boolean
      description: string
      createTime: string
      updateTime: string
    }

    interface VideoModelDetail extends VideoModelListItem {
      apiKey: string
      defaultParams: Record<string, unknown>
    }

    interface CreateVideoModelParams {
      name: string
      code: string
      provider: string
      apiUrl: string
      apiKey?: string
      resolution?: string
      fps?: string
      format?: string
      description?: string
    }

    interface UpdateVideoModelParams {
      name?: string
      code?: string
      provider?: string
      apiUrl?: string
      apiKey?: string
      resolution?: string
      fps?: string
      format?: string
      description?: string
    }

    interface ToggleVideoModelStatusParams {
      enabled: boolean
    }

    interface VideoModelSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      provider?: string
      enabled?: boolean
    }
  }

  /** 系统配置类型 */
  namespace SystemConfig {
    interface ConfigListItem {
      id: string
      key: string
      value: string
      group: string
      description: string
      enabled: boolean
      createTime: string
      updateTime: string
    }

    interface ConfigDetail extends ConfigListItem {
      valueType: string
      options: string[]
    }

    interface CreateConfigParams {
      key: string
      value: string
      group?: string
      description?: string
    }

    interface UpdateConfigParams {
      value?: string
      group?: string
      description?: string
    }

    interface ConfigSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      group?: string
    }

    interface AuditLogItem {
      id: string
      configKey: string
      oldValue: string
      newValue: string
      operator: string
      createTime: string
    }

    interface WebhookListItem {
      id: string
      name: string
      url: string
      events: string[]
      secret: string
      enabled: boolean
      projectId: string
      createTime: string
      updateTime: string
    }

    interface CreateWebhookParams {
      name: string
      url: string
      events: string[]
      secret?: string
    }

    interface UpdateWebhookParams {
      name?: string
      url?: string
      events?: string[]
      secret?: string
      enabled?: boolean
    }

    interface WebhookTestResult {
      success: boolean
      statusCode: number
      responseTime: number
      message?: string
    }
  }

  /** 平台管理类型 */
  namespace PlatformAdmin {
    interface AdminTeamListItem {
      teamId: string
      teamName: string
      teamAvatar: string
      description: string
      ownerId: string
      ownerName: string
      memberCount: number
      status: string
      createTime: string
      updateTime: string
    }

    interface AdminTeamDetail extends AdminTeamListItem {
      projectCount: number
      storageUsed: number
    }

    interface CreateAdminTeamParams {
      teamName: string
      description?: string
      ownerUserId?: string
    }

    interface UpdateAdminTeamParams {
      teamName?: string
      description?: string
    }

    interface AdminTeamSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      status?: string
    }

    interface SetTeamStatusParams {
      status: string
    }

    interface TransferOwnerParams {
      newOwnerId: string
    }

    interface AdminMemberListItem {
      id: string
      userId: string
      userName: string
      avatar: string
      role: string
      status: string
      joinTime: string
    }

    /** 管理员团队成员展示数据（前端标准化格式） */
    interface AdminMemberDisplayVO {
      userId: string
      username: string
      role: string
      joinTime: string
    }

    interface AdminMemberSearchParams extends Api.Common.CommonSearchParams {
      keyword?: string
      role?: string
      status?: string
    }

    interface UpdateMemberStatusParams {
      status: string
      reason?: string
    }

    interface AdminInviteCodeItem {
      id: string
      code: string
      createdBy: string
      usedCount: number
      maxUses: number
      expiresAt: string
      createTime: string
    }

    interface AdminInviteCodeSearchParams extends Api.Common.CommonSearchParams {
      status?: string
    }

    interface CreateAdminInviteCodeParams {
      maxUses?: number
      expiresAt?: string
    }

    interface AdminApplicationItem {
      id: string
      teamId: string
      teamName: string
      userId: string
      userName: string
      userAvatar: string
      status: string
      reason: string
      applyTime: string
      processTime: string
    }

    interface AdminApplicationSearchParams extends Api.Common.CommonSearchParams {
      status?: string
    }

    interface RejectApplicationParams {
      reason?: string
    }
  }

  /** 系统管理类型（兼容旧代码） */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >

    /** 管理员用户搜索参数 */
    interface AdminUserSearchParams {
      page?: number
      pageSize?: number
      current?: number
      size?: number
      keyword?: string
      status?: number | string
      userName?: string
      userGender?: string
      userPhone?: string
      userEmail?: string
    }

    /** 管理员用户项 */
    interface AdminUserItem {
      id: number
      userName: string
      nickName: string
      email: string
      userEmail: string
      phone: string
      userPhone: string
      avatar: string
      status: number | string
      userGender: string
      roles: string[]
      userRoles: string[]
      createTime: string
      updateTime: string
      createBy?: string
      updateBy?: string
    }
  }
}
