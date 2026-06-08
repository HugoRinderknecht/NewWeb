// Project queries
export {
  useProjectList,
  useProjectDetail,
  useProjectMembers,
  useProjectConfig,
  useReviewConfig,
  useProjectStatistics,
  useProjectEpisodes,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useArchiveProject,
  useUnarchiveProject,
  useRestoreProject,
  useUpdateProjectStatus,
  useCopyProject,
  useUploadProjectCover,
  useAddProjectMember,
  useUpdateProjectMemberRole,
  useRemoveProjectMember,
  useUpdateProjectConfig,
  useUpdateReviewConfig
} from './project'

// Statistics queries
export {
  useStatsDashboard,
  useStatsRealtime,
  useStatsTrends,
  useStatsCredits,
  useMyCredits,
  useStatsAlerts,
  useStatsTeamRanking,
  useTeamWorkload,
  useUserContribution,
  useUserActivity,
  useProjectCompletion,
  useProjectAnalysis,
  useUserActivityRank,
  useProjectUsage,
  useProjectUsageDetail,
  useProjectVideoStats,
  useProjectStoryboardStats,
  useProjectResources,
  useProjectAiUsage,
  useScheduledReports,
  useCreateScheduledReport,
  useUpdateScheduledReport,
  useDeleteScheduledReport,
  useCreateCustomReport,
  useExportReport
} from './statistics'

// Storyboard queries
export {
  useStoryboardList,
  useStoryboardDetail,
  useCreateStoryboard,
  useUpdateStoryboard,
  useDeleteStoryboard,
  useBatchDeleteStoryboards,
  useSubmitStoryboardReview,
  useBatchSubmitStoryboardReview,
  useWithdrawStoryboardReview,
  useStoryboardVersions,
  useRollbackStoryboardVersion,
  useStoryboardImages,
  useSceneList,
  useCreateScene,
  // useUpdateScene,  // 已删除：文档 §5.2 未定义 Scene PUT 端点
  // useDeleteScene,  // 已删除：文档 §5.2 未定义 Scene DELETE 端点
  useReorderStoryboards,
  useDecomposeStoryboard,
  useRebuildStoryboard,
  useScriptStoryboards
} from './storyboard'

// Script queries
export {
  useScriptList,
  useScriptDetail,
  useScriptReviewStatus,
  usePostApprovalStatus,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
  useSubmitScriptReview,
  useWithdrawScriptReview,
  useEpisodeDetail,
  useScriptEpisodes,
  useDecomposeScript,
  useCreateEpisode,
  useUpdateEpisode,
  useDeleteEpisode,
  useGenerateCharacterProfiles,
  useCharacterProfiles,
  useExtractAssets,
  useExtractedAssets,
  useReviewScriptContent,
  useGenerateStyleConfig,
  useStyleConfig,
  useRefAnalysis,
  useRefAnalysisResult,
  useGenerateVoicePrompts,
  useVoicePrompts,
  useGenerateAssetPrompts,
  useAssetPrompts,
  useGenerateAssetImages,
  useAssetImages,
  useReviewAssetImages,
  useGenerateVideoPrompts,
  useVideoPrompts
} from './script'

// Asset queries
export {
  useAssetList,
  useAssetDetail,
  useAssetVersions,
  useUploadAsset,
  useUpdateAsset,
  useDeleteAsset,
  useBatchDeleteAssets,
  useRollbackAsset,
  useBatchAddTags,
  useBatchRemoveTags,
  useBatchMoveCategory,
  useAiGenerateAsset,
  useImportFromTeam,
  useImportFromProject,
  useReferenceImages,
  useUploadReferenceImage,
  useDeleteReferenceImage,
  useTeamAssetList,
  useTeamAssetCategories
} from './asset'

// Review queries
export {
  useReviewList,
  useReviewItems,
  useReviewDetail,
  useReviewStatus,
  usePendingReviewCount,
  useMySubmissions,
  useReviewStatistics,
  useRejectReasons,
  useReviewRouteConfig,
  useCreateReview,
  useClaimReview,
  useReviewDecision,
  useBatchReviewDecision,
  useWithdrawReview,
  useArchiveReview,
  useDispatchReview,
  useAddRejectReason,
  useDeleteRejectReason,
  useUpdateReviewRouteConfig
} from './review'

// Team queries
export {
  useMyTeams,
  useTeamDetail,
  useMyApplications,
  useMyPermissions,
  useUpdateTeam,
  useSwitchTeam,
  useApplyJoinTeam,
  useJoinByCode,
  useLeaveTeam,
  useTeamMembers,
  useMemberPermissions,
  useImportMembers,
  useUpdateMemberRole,
  useUpdateMemberStatus,
  useRemoveMember,
  useSetMemberPermissions,
  useTransferOwnership,
  useTeamRoles,
  useRolePermissions,
  useAvailablePermissions,
  useCreateTeamRole,
  useUpdateTeamRole,
  useDeleteTeamRole,
  useSetRolePermissions,
  useInviteCodes,
  useCreateInviteCode,
  useRevokeInviteCode,
  useJoinApplications,
  useApproveApplication,
  useRejectApplication
} from './team'

// Video queries
export {
  useVideoTaskList,
  useVideoTaskDetail,
  useVideoTaskResult,
  usePreviewVideoGeneration,
  useSubmitVideoGeneration,
  useCancelVideoTask
} from './video'

// Notification queries
export {
  useNotificationList,
  useNotificationDetail,
  useUnreadCount,
  useStarredNotifications,
  useSearchNotifications,
  useNotificationPreference,
  useDndSettings,
  useSubscriptions,
  useMarkAsRead,
  useMarkAsUnread,
  useMarkAllAsRead,
  useBatchMarkAsRead,
  useDeleteNotification,
  useBatchDeleteNotifications,
  useClearReadNotifications,
  useStarNotification,
  useUpdateNotificationPreference,
  useUpdateDndSettings,
  useAddSubscription,
  useCancelSubscription
} from './notification'

// Points queries (积分/配额)
export {
  useProjectCredits,
  usePricingList,
  useMyTokenUsage,
  useTokenUsageRecords,
  useCreditTransactionList,
  useProjectTokenUsage,
  useTeamTokenUsage
} from './points'

// AI Process queries
export { useAiProcessStatus, useAiProcessHistory, useAiProcessDetail } from './ai-process'

// Workflow queries
export {
  useWorkflowCatalog,
  useWorkflowRunStatus,
  useExecuteWorkflow,
  useStopWorkflow,
  useMultimodalExecute,
  useExecuteWorkflowChain,
  useStyleInference,
  useWorkflowStream,
  useMultimodalStream
} from './workflow'

// Auth queries
export {
  useCurrentUser,
  useAvatar,
  usePermissions,
  useCaptcha,
  useUpdateProfile,
  useUploadAvatar
} from './auth'

// Character queries
export {
  useCharacterList,
  useCharacterDetail,
  useCreateCharacter,
  useUpdateCharacter,
  useDeleteCharacter
} from './character'

// Editor queries (剪辑/导出)
export {
  useEditProjectList,
  useEditProjectDetail,
  useExportStatus,
  useCreateEditProject,
  useUpdateEditProject,
  useDeleteEditProject,
  useExportVideo,
  useReorderSegments,
  useAddSegment,
  useDeleteSegment,
  useUpdateSegment
} from './editor'

// Image queries (GPT 图片)
export {
  useImageModels,
  useImageModelDetail,
  useImageTaskStatus,
  useImageTaskResult,
  useSubmitImageGeneration
} from './image'

// Data history queries
export { useDataHistoryList, useDataHistoryDetail, useRollbackDataHistory } from './data-history'

// Billing queries
export {
  useBillingList,
  useBillingDetail,
  useCreateBilling,
  useUpdateBilling,
  useToggleBilling,
  useBillingHistory
} from './billing'

// Video model queries
export {
  useVideoModelList,
  useCreateVideoModel,
  useUpdateVideoModel,
  useDeleteVideoModel,
  useToggleVideoModelStatus
} from './video-model'

// System manage queries
export {
  useAdminUserList,
  useAdminUserDetail,
  useUpdateUserStatus,
  useAdminRoleList,
  useCreateRole,
  useUpdateRole,
  useDeleteRole
} from './system-manage'

// Platform admin queries
export {
  useAdminTeamList,
  useAdminTeamDetail,
  useCreateAdminTeam,
  useUpdateAdminTeam,
  useDeleteAdminTeam,
  useSetAdminTeamStatus,
  useTransferAdminTeamOwner,
  useAdminTeamMembers,
  useAdminInviteCodes,
  useCreateAdminInviteCode,
  useAdminApplications,
  useApproveAdminApplication,
  useRejectAdminApplication,
  useUpdateAdminMemberStatus,
  useRevokeAdminInviteCode
} from './platform-admin'

// System config queries
export {
  useConfigList,
  useConfigByKey,
  useConfigByGroup,
  useCreateConfig,
  useUpdateConfig,
  useDeleteConfig,
  useConfigAuditLog,
  useRefreshConfigCache,
  useWebhookList,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook
} from './system-config'

// Workflow manage queries
export {
  useWorkflowList,
  useWorkflowDetail,
  useCreateWorkflow,
  useUpdateWorkflow,
  useDeleteWorkflow,
  useToggleWorkflowStatus,
  useTestWorkflowConnection,
  useTestAllWorkflowConnections
} from './workflow-manage'

// Script asset queries
export {
  useScriptAssetList,
  useScriptAssetDetail,
  useCreateScriptAsset,
  useBatchCreateScriptAssets,
  useUpdateScriptAsset,
  useDeleteScriptAsset,
  useUploadScriptAssetImage
} from './script-asset'

// Script asset keys
export { scriptAssetKeys } from './keys'
