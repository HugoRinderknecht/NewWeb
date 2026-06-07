/**
 * Query Key Factory
 *
 * 集中管理所有业务域的 query key，参考 TanStack Query 官方推荐的 key factory 模式。
 * 每个业务域提供 all() 方法用于宽泛失效，以及细粒度方法对应各 query 文件中的 queryKey 使用模式。
 */

export const scriptKeys = {
  all: () => ['scripts'] as const,
  lists: () => ['scripts', 'list'] as const,
  list: (projectId: unknown, params?: unknown) => ['scripts', 'list', projectId, params] as const,
  listByProject: (projectId: string) => ['scripts', 'list', projectId] as const,
  details: () => ['scripts', 'detail'] as const,
  detail: (scriptId: unknown) => ['scripts', 'detail', scriptId] as const,
  reviewStatus: (scriptId: unknown) => ['scripts', 'review-status', scriptId] as const,
  postApproval: (scriptId: unknown) => ['scripts', 'post-approval', scriptId] as const,
  episodes: (projectId: unknown) => ['scripts', 'episodes', projectId] as const,
  scriptEpisodes: (projectId: unknown, scriptId: unknown) => ['scripts', 'script-episodes', projectId, scriptId] as const,
  episode: (projectId: unknown, scriptId: unknown, episodeId: unknown) =>
    ['scripts', 'episode', projectId, scriptId, episodeId] as const,
  episodeById: (episodeId: string) => ['scripts', 'episode', episodeId] as const,
  characterProfiles: (projectId: unknown, scriptId: unknown) =>
    ['scripts', 'character-profiles', projectId, scriptId] as const,
  extractedAssets: (projectId: unknown, scriptId: unknown) =>
    ['scripts', 'extracted-assets', projectId, scriptId] as const,
  styleConfig: (projectId: unknown, scriptId: unknown) => ['scripts', 'style-config', projectId, scriptId] as const,
  refAnalysis: (projectId: unknown, scriptId: unknown) => ['scripts', 'ref-analysis', projectId, scriptId] as const,
  voicePrompts: (projectId: unknown, scriptId: unknown) => ['scripts', 'voice-prompts', projectId, scriptId] as const,
  assetPrompts: (projectId: unknown, scriptId: unknown) => ['scripts', 'asset-prompts', projectId, scriptId] as const,
  assetImages: (projectId: unknown, scriptId: unknown) => ['scripts', 'asset-images', projectId, scriptId] as const,
  videoPrompts: (projectId: unknown, episodeId: unknown) => ['scripts', 'video-prompts', projectId, episodeId] as const,
}

export const aiProcessKeys = {
  all: () => ['ai-process'] as const,
  status: (params?: Partial<Api.AiProcess.StatusQueryParams>) =>
    ['ai-process', 'status', params?.projectId, params?.type, params?.businessId] as const,
  history: (params?: Partial<Api.AiProcess.HistoryQueryParams>) =>
    ['ai-process', 'history', params?.projectId, params?.type, params?.businessId, params?.status] as const,
  detail: (recordId: unknown) => ['ai-process', 'detail', recordId] as const,
}

export const notificationKeys = {
  all: () => ['notifications'] as const,
  lists: () => ['notifications', 'list'] as const,
  list: (params?: unknown) => ['notifications', 'list', params] as const,
  details: () => ['notifications', 'detail'] as const,
  detail: (id: unknown) => ['notifications', 'detail', id] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
  starred: (params?: unknown) => ['notifications', 'starred', params] as const,
  search: (keyword: unknown, params?: unknown) => ['notifications', 'search', keyword, params] as const,
  preference: () => ['notifications', 'preference'] as const,
  dnd: () => ['notifications', 'dnd'] as const,
  subscriptions: () => ['notifications', 'subscriptions'] as const,
}

export const editorKeys = {
  all: () => ['editor'] as const,
  lists: () => ['editor', 'list'] as const,
  list: (params?: unknown) => ['editor', 'list', params] as const,
  details: () => ['editor', 'detail'] as const,
  detail: (projectId: unknown) => ['editor', 'detail', projectId] as const,
  exportStatus: (taskId: unknown) => ['editor', 'export-status', taskId] as const,
  exportStatuses: () => ['editor', 'export-status'] as const,
}

export const dataHistoryKeys = {
  all: () => ['data-history'] as const,
  lists: () => ['data-history', 'list'] as const,
  list: (params?: unknown) => ['data-history', 'list', params] as const,
  details: () => ['data-history', 'detail'] as const,
  detail: (historyId: unknown) => ['data-history', 'detail', historyId] as const,
}

export const imageKeys = {
  all: () => ['image'] as const,
  models: () => ['image', 'models'] as const,
  modelDetail: (modelCode: unknown) => ['image', 'model-detail', modelCode] as const,
  taskStatus: (taskId: unknown) => ['image', 'task-status', taskId] as const,
  taskStatuses: () => ['image', 'task-status'] as const,
  taskResult: (taskId: unknown) => ['image', 'task-result', taskId] as const,
  taskResults: () => ['image', 'task-result'] as const,
}

export const projectKeys = {
  all: () => ['projects'] as const,
  lists: () => ['projects', 'list'] as const,
  list: (params: unknown) => ['projects', 'list', params] as const,
  details: () => ['projects', 'detail'] as const,
  detail: (projectId: unknown) => ['projects', 'detail', projectId] as const,
  members: (projectId: unknown, params?: unknown) => ['projects', 'members', projectId, params] as const,
  membersByProject: (projectId: string) => ['projects', 'members', projectId] as const,
  config: (projectId: unknown) => ['projects', 'config', projectId] as const,
  reviewConfig: (projectId: unknown) => ['projects', 'review-config', projectId] as const,
  statistics: (projectId: unknown) => ['projects', 'statistics', projectId] as const,
  episodes: (projectId: unknown) => ['projects', 'episodes', projectId] as const,
}

export const storyboardKeys = {
  all: () => ['storyboard'] as const,
  lists: () => ['storyboard', 'list'] as const,
  list: (projectId: unknown, params?: unknown) => ['storyboard', 'list', projectId, params] as const,
  listByProject: (projectId: string) => ['storyboard', 'list', projectId] as const,
  details: () => ['storyboard', 'detail'] as const,
  detail: (storyboardId: unknown) => ['storyboard', 'detail', storyboardId] as const,
  reviewStatus: (storyboardId: unknown) => ['storyboard', 'review-status', storyboardId] as const,
  versions: (storyboardId: unknown) => ['storyboard', 'versions', storyboardId] as const,
  images: (storyboardId: unknown) => ['storyboard', 'images', storyboardId] as const,
  assets: (storyboardId: unknown) => ['storyboard', 'assets', storyboardId] as const,
  scenes: (episodeId: unknown) => ['storyboard', 'scenes', episodeId] as const,
  scriptStoryboards: (projectId: unknown, scriptId: unknown) => ['storyboard', 'script-storyboards', projectId, scriptId] as const,
  boards: (projectId: unknown) => ['storyboard', 'boards', projectId] as const,
}

export const teamKeys = {
  all: () => ['teams'] as const,
  myTeams: () => ['teams', 'my-teams'] as const,
  details: () => ['teams', 'detail'] as const,
  detail: (teamId: unknown) => ['teams', 'detail', teamId] as const,
  myApplications: () => ['teams', 'my-applications'] as const,
  myPermissions: () => ['teams', 'my-permissions'] as const,
  members: (teamId: unknown, params?: unknown) => ['teams', 'members', teamId, params] as const,
  membersByTeam: (teamId: string) => ['teams', 'members', teamId] as const,
  memberPermissions: (teamId: unknown, memberId: unknown) => ['teams', 'member-permissions', teamId, memberId] as const,
  roles: (teamId: unknown) => ['teams', 'roles', teamId] as const,
  rolePermissions: (teamId: unknown, roleId: unknown) => ['teams', 'role-permissions', teamId, roleId] as const,
  availablePermissions: (teamId: unknown) => ['teams', 'available-permissions', teamId] as const,
  inviteCodes: (teamId: unknown, params?: unknown) => ['teams', 'invite-codes', teamId, params] as const,
  inviteCodesByTeam: (teamId: string) => ['teams', 'invite-codes', teamId] as const,
  applications: (teamId: unknown, params?: unknown) => ['teams', 'applications', teamId, params] as const,
  applicationsByTeam: (teamId: string) => ['teams', 'applications', teamId] as const,
}

export const videoKeys = {
  all: () => ['video'] as const,
  tasks: (params?: unknown) => ['video', 'tasks', params] as const,
  taskLists: () => ['video', 'tasks'] as const,
  detail: (taskId: unknown) => ['video', 'detail', taskId] as const,
  result: (taskId: unknown, params?: unknown) => ['video', 'result', taskId, params] as const,
}

export const workflowKeys = {
  all: () => ['workflow'] as const,
  catalog: () => ['workflow', 'catalog'] as const,
  runStatus: (workflowCode: unknown, runId: unknown) => ['workflow', 'run-status', workflowCode, runId] as const,
  runStatuses: () => ['workflow', 'run-status'] as const,
}

export const statisticsKeys = {
  all: () => ['statistics'] as const,
  dashboard: (teamId?: unknown) => ['statistics', 'dashboard', teamId] as const,
  realtime: () => ['statistics', 'realtime'] as const,
  trends: (teamId: unknown, params: unknown) => ['statistics', 'trends', teamId, params] as const,
  platformTrends: (params?: unknown) => ['statistics', 'platform-trends', params] as const,
  credits: () => ['statistics', 'credits'] as const,
  myCredits: () => ['statistics', 'my-credits'] as const,
  alerts: () => ['statistics', 'alerts'] as const,
  teamRanking: () => ['statistics', 'team-ranking'] as const,
  teamWorkload: (teamId: unknown) => ['statistics', 'team-workload', teamId] as const,
  userContribution: (teamId: unknown) => ['statistics', 'user-contribution', teamId] as const,
  userActivity: (teamId: unknown) => ['statistics', 'user-activity', teamId] as const,
  projectCompletion: (teamId: unknown) => ['statistics', 'project-completion', teamId] as const,
  projectAnalysis: () => ['statistics', 'project-analysis'] as const,
  userActivityRank: () => ['statistics', 'user-activity-rank'] as const,
  projectUsage: (projectId: unknown) => ['statistics', 'project-usage', projectId] as const,
  projectUsageDetail: (projectId: unknown, params?: unknown) => ['statistics', 'project-usage-detail', projectId, params] as const,
  projectVideoStats: (projectId: unknown) => ['statistics', 'project-video-stats', projectId] as const,
  projectStoryboardStats: (projectId: unknown) => ['statistics', 'project-storyboard-stats', projectId] as const,
  projectResources: (projectId: unknown) => ['statistics', 'project-resources', projectId] as const,
  projectAiUsage: (projectId: unknown) => ['statistics', 'project-ai-usage', projectId] as const,
  creditTransactions: (params?: unknown) => ['statistics', 'credit-transactions', params] as const,
  tokenUsageRecords: (params?: unknown) => ['statistics', 'token-usage-records', params] as const,
  scheduledReports: (teamId: unknown) => ['statistics', 'scheduled-reports', teamId] as const,
}

export const reviewKeys = {
  all: () => ['reviews'] as const,
  lists: () => ['reviews', 'list'] as const,
  list: (params?: unknown) => ['reviews', 'list', params] as const,
  items: (params?: unknown) => ['reviews', 'items', params] as const,
  details: () => ['reviews', 'detail'] as const,
  detail: (id: unknown) => ['reviews', 'detail', id] as const,
  status: (reviewType: unknown, targetId: unknown) => ['reviews', 'status', reviewType, targetId] as const,
  pendingCount: () => ['reviews', 'pending-count'] as const,
  mySubmissions: (params?: unknown) => ['reviews', 'my-submissions', params] as const,
  statistics: (projectId: unknown, params?: unknown) => ['reviews', 'statistics', projectId, params] as const,
  rejectReasons: (projectId: unknown) => ['reviews', 'reject-reasons', projectId] as const,
  routeConfig: (projectId: unknown) => ['reviews', 'route-config', projectId] as const,
}

export const pointsKeys = {
  all: () => ['points'] as const,
  transactions: (params?: unknown) => ['points', 'transactions', params] as const,
  projectCredits: (projectId: unknown) => ['points', 'project-credits', projectId] as const,
  pricing: () => ['points', 'pricing'] as const,
  tokenUsage: () => ['points', 'token-usage'] as const,
  tokenRecords: (params?: unknown) => ['points', 'token-records', params] as const,
  projectToken: (projectId: unknown) => ['points', 'project-token', projectId] as const,
  teamToken: (teamId: unknown) => ['points', 'team-token', teamId] as const,
}

export const characterKeys = {
  all: () => ['characters'] as const,
  lists: () => ['characters', 'list'] as const,
  list: (projectId: unknown) => ['characters', 'list', projectId] as const,
  details: () => ['characters', 'detail'] as const,
  detail: (projectId: unknown, characterId: unknown) => ['characters', 'detail', projectId, characterId] as const,
}

export const authKeys = {
  all: () => ['auth'] as const,
  userInfo: () => ['auth', 'user-info'] as const,
  avatar: (userId: unknown) => ['auth', 'avatar', userId] as const,
  permissions: (teamId?: unknown) => ['auth', 'permissions', teamId] as const,
  captcha: () => ['auth', 'captcha'] as const,
}

export const assetKeys = {
  all: () => ['assets'] as const,
  lists: () => ['assets', 'list'] as const,
  list: (projectId: unknown, params?: unknown) => ['assets', 'list', projectId, params] as const,
  listByProject: (projectId: string) => ['assets', 'list', projectId] as const,
  details: () => ['assets', 'detail'] as const,
  detail: (projectId: unknown, assetId: unknown) => ['assets', 'detail', projectId, assetId] as const,
  versions: (projectId: unknown, assetId: unknown) => ['assets', 'versions', projectId, assetId] as const,
  referenceImages: (projectId: unknown) => ['assets', 'reference-images', projectId] as const,
  teamList: (teamId: unknown, params?: unknown) => ['assets', 'team-list', teamId, params] as const,
  teamCategories: (teamId: unknown) => ['assets', 'team-categories', teamId] as const,
}

export const scriptAssetKeys = {
  all: () => ['script-assets'] as const,
  lists: () => ['script-assets', 'list'] as const,
  list: (projectId: unknown, params?: unknown) => ['script-assets', 'list', projectId, params] as const,
  details: () => ['script-assets', 'detail'] as const,
  detail: (assetId: unknown) => ['script-assets', 'detail', assetId] as const,
}
