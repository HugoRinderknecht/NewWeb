/**
 * 测试共享 Mock 数据与工厂函数
 * 提供跨模块复用的 mock 数据、生成器、断言工具
 */
import { vi } from 'vitest'

// ─── 用户 & 认证 Mock ───────────────────────────────────────────────

export const mockUser = {
  id: 'user-001',
  username: '测试用户',
  email: 'test@example.com',
  phone: '13800138000',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
  roles: ['team_admin'],
  status: 1,
  createTime: '2026-01-01T00:00:00Z',
  updateTime: '2026-06-01T00:00:00Z',
}

export const mockLoginResponse = {
  token: 'mock-access-token-abc123',
  refreshToken: 'mock-refresh-token-xyz789',
  tokenType: 'Bearer',
  expiresIn: 3600,
  refreshExpiresIn: 604800,
  userId: mockUser.id,
  username: mockUser.username,
  avatar: mockUser.avatar,
  email: mockUser.email,
}

export const mockPermissions = {
  userId: mockUser.id,
  username: mockUser.username,
  roleGroup: 'team_admin',
  permissions: ['project:read', 'project:write', 'script:read', 'script:write'],
  teamInfo: { teamId: 'team-001', teamName: '测试团队' },
}

// ─── 项目 Mock ──────────────────────────────────────────────────────

export const mockProject = {
  id: 'proj-001',
  projectName: 'AI短剧项目-测试',
  description: '这是一个测试用AI短剧项目',
  status: 1,
  coverUrl: 'https://picsum.photos/seed/proj001/400/300',
  memberCount: 5,
  creatorId: mockUser.id,
  creatorName: mockUser.username,
  teamId: 'team-001',
  createTime: '2026-02-01T00:00:00Z',
  updateTime: '2026-06-01T00:00:00Z',
}

export const mockProjectList = {
  records: [mockProject, { ...mockProject, id: 'proj-002', projectName: '第二个项目', status: 0 }],
  total: 2,
  page: 1,
  pageSize: 10,
}

export const mockProjectDetail = {
  ...mockProject,
  synopsis: '项目简介内容',
  projectType: 'short_drama',
  manager: mockUser.username,
  config: { theme: 'dark', language: 'zh-CN' },
}

export const mockProjectMembers = {
  records: [
    { id: 'm1', userId: 'u1', userName: '张三', role: 'admin', avatar: '', joinTime: '2026-01-01' },
    { id: 'm2', userId: 'u2', userName: '李四', role: 'director', avatar: '', joinTime: '2026-02-01' },
    { id: 'm3', userId: 'u3', userName: '王五', role: 'storyboard', avatar: '', joinTime: '2026-03-01' },
  ],
  total: 3,
}

export const mockReviewConfig = {
  projectId: mockProject.id,
  storyboard: true,
  firstFrame: false,
  video: true,
}

export const mockProjectConfig = {
  projectId: mockProject.id,
  configs: { theme: 'light', autoSave: 'true' },
}

export const mockProjectStatistics = {
  memberCount: 5,
  adminCount: 1,
  episodeCount: 3,
  shotCount: 30,
  totalDuration: 600,
  resourceUsage: { aiCalls: 150, storage: 2048, tokens: 50000 },
}

// ─── 剧本 Mock ─────────────────────────────────────────────────────

export const mockScript = {
  id: 'script-001',
  title: '第一集：神秘的开始',
  description: '故事从一个神秘的夜晚开始...',
  status: 1,
  episodeCount: 1,
  reviewStatus: null,
  authorId: mockUser.id,
  authorName: mockUser.username,
  projectId: mockProject.id,
  wordCount: 5000,
  createTime: '2026-02-15T00:00:00Z',
  updateTime: '2026-06-01T00:00:00Z',
}

export const mockScriptList = {
  records: [mockScript, { ...mockScript, id: 'script-002', title: '第二集：真相', status: 2 }],
  total: 2,
  page: 1,
  pageSize: 10,
}

export const mockScriptDetail = {
  ...mockScript,
  content: '第一集：神秘的开始\n\n场景一：夜晚，古宅\n\n[画面] 月光透过破旧的窗户洒进古宅...\n\n[对白] 主角：（自言自语）这里究竟隐藏着什么秘密？',
  reviewStatus: 1,
  reviewerName: '审核员',
  reviewComment: '内容合规，可通过',
}

export const mockEpisodes = [
  {
    id: 'ep-001',
    episodeName: '第一集：神秘的开始',
    sortOrder: 1,
    content: '故事从一个神秘的夜晚开始，主角踏入古宅...',
    shotCount: 10,
  },
  {
    id: 'ep-002',
    episodeName: '第二集：真相',
    sortOrder: 2,
    content: '随着调查深入，真相逐渐浮出水面...',
    shotCount: 8,
  },
]

export const mockCharacterProfiles: Api.Script.CharacterProfileResult = {
  scriptId: 'script-001',
  profiles: [
    {
      name: '张三',
      identity: '主角',
      verificationStatus: '一致',
      appearance: '身材高大，眼神锐利',
      personality: '冷静果断，富有正义感',
      background: '曾是特种兵出身，退伍后经营一家古董店，实际上暗中调查神秘组织。',
      voiceRef: '低沉有力的男中音',
      appearanceSpan: '第1-5集',
      relations: [
        { role: '李四', relation: '宿敌' },
        { role: '王五', relation: '挚友' },
      ],
    },
    {
      name: '李四',
      identity: '反派',
      verificationStatus: '需复核',
      appearance: '面容阴冷，举止优雅',
      personality: '狡诈残忍，内心扭曲',
      background: '表面是商业精英，实则是神秘组织的高层人物。',
      voiceRef: '阴冷低沉',
      appearanceSpan: '第2-5集',
      relations: [
        { role: '张三', relation: '宿敌' },
      ],
    },
  ],
  workflowRunId: 'wf-char-001',
  duration: 15230,
  tokenUsage: {
    aiProvider: 'deepseek',
    modelName: 'deepseek-v4-flash',
    tokensIn: 500,
    tokensOut: 2000,
    tokensTotal: 2500,
    creditsUsed: 3,
  },
  creditsDeducted: 5,
}

export const mockAiReviewResult = {
  id: 'review-ai-001',
  scriptId: mockScript.id,
  status: 'COMPLETED',
  globalWarning: '检测到少量需要关注的内容，建议人工复核',
  totalViolations: 2,
  highRisk: 0,
  mediumRisk: 1,
  lowRisk: 1,
  violations: [
    {
      id: 'v1',
      position: '第3段',
      type: '暴力恐怖',
      riskLevel: 'medium',
      originalText: '他用刀刺向敌人',
      hitWords: ['刺'],
      status: 'pending',
    },
    {
      id: 'v2',
      position: '第5段',
      type: '其他',
      riskLevel: 'low',
      originalText: '突然传来一阵奇怪的声音',
      hitWords: ['奇怪'],
      status: 'pending',
    },
  ],
  createTime: '2026-06-01T12:00:00Z',
  completeTime: '2026-06-01T12:01:30Z',
}

// ─── 分镜 Mock ─────────────────────────────────────────────────────

export const mockStoryboard = {
  id: 'sb-001',
  name: '第一集-第1集分镜',
  description: '第一集开场的分镜设计',
  source: 'script',
  status: 1,
  projectId: mockProject.id,
  episodeId: 'ep-001',
  thumbnailUrl: 'https://picsum.photos/seed/sb001/320/180',
  shotCount: 10,
  totalDuration: 120,
  creatorName: mockUser.username,
  createTime: '2026-03-01T00:00:00Z',
  updateTime: '2026-06-01T00:00:00Z',
}

export const mockStoryboardList = {
  records: [mockStoryboard, { ...mockStoryboard, id: 'sb-002', name: '第一集-第2集分镜', source: 'manual' }],
  total: 2,
  page: 1,
  pageSize: 10,
}

export const mockShots = [
  {
    id: 'shot-001',
    shotNumber: 'SC-001',
    name: '开场全景',
    shotType: '全景',
    duration: 5,
    scene: '古宅外景',
    timeOfDay: '夜晚',
    atmosphere: '神秘',
    description: '月光下的古宅全景',
    transition: '淡入',
    camera: { aperture: 'f/2.8', iso: 800, colorTemp: 4000 },
  },
  {
    id: 'shot-002',
    shotNumber: 'SC-002',
    name: '主角进门',
    shotType: '中景',
    duration: 3,
    scene: '古宅内景',
    timeOfDay: '夜晚',
    atmosphere: '紧张',
    description: '主角推开古宅大门',
    transition: '切入',
    camera: { aperture: 'f/4', iso: 1600, colorTemp: 3500 },
  },
]

export const mockScenes = [
  {
    id: 'scene-001',
    name: '古宅外景',
    sceneType: '外景',
    background: '破旧的古宅，月光笼罩',
    timeOfDay: '夜晚',
    atmosphere: '神秘',
    shots: mockShots.slice(0, 1),
  },
  {
    id: 'scene-002',
    name: '古宅内景',
    sceneType: '内景',
    background: '阴暗的大厅，布满灰尘',
    timeOfDay: '夜晚',
    atmosphere: '紧张',
    shots: mockShots.slice(1),
  },
]

// ─── 视频生成 Mock ──────────────────────────────────────────────────

export const mockVideoTask = {
  id: 'vt-001',
  taskName: '第一集开场视频生成',
  status: 'succeeded',
  progress: 100,
  model: 'Seedance 2.0',
  resolution: '720p',
  aspectRatio: '16:9',
  duration: 10,
  priority: 5,
  videoUrl: 'https://example.com/video-sample.mp4',
  thumbnailUrl: 'https://picsum.photos/seed/vt001/320/180',
  fileSize: 15728640,
  projectId: mockProject.id,
  storyboardId: mockStoryboard.id,
  createTime: '2026-06-01T10:00:00Z',
  completeTime: '2026-06-01T10:05:00Z',
}

export const mockVideoTaskList = {
  records: [
    mockVideoTask,
    { ...mockVideoTask, id: 'vt-002', taskName: '第二集生成任务', status: 'running', progress: 45 },
    { ...mockVideoTask, id: 'vt-003', taskName: '第三集生成任务', status: 'queued', progress: 0 },
    { ...mockVideoTask, id: 'vt-004', taskName: '失败任务', status: 'failed', progress: 0, error: '生成超时' },
  ],
  total: 4,
  pending: 1,
  running: 1,
  succeeded: 1,
  failed: 1,
}

// ─── 资产管理 Mock ─────────────────────────────────────────────────

export const mockAsset = {
  id: 'asset-001',
  name: '古宅背景图',
  type: 'image',
  category: '场景背景',
  format: 'PNG',
  size: 2097152,
  url: 'https://picsum.photos/seed/asset001/800/600',
  thumbnailUrl: 'https://picsum.photos/seed/asset001/200/150',
  tags: ['古宅', '夜景', '氛围'],
  projectId: mockProject.id,
  source: 'ai_generated',
  reviewStatus: 'approved',
  createTime: '2026-03-15T00:00:00Z',
  updateTime: '2026-06-01T00:00:00Z',
}

export const mockAssetList = {
  records: [
    mockAsset,
    { ...mockAsset, id: 'asset-002', name: '主角立绘', type: 'image', category: '角色原画' },
    { ...mockAsset, id: 'asset-003', name: '背景音乐', type: 'audio', category: '背景音乐', size: 5242880 },
  ],
  total: 3,
}

export const mockAssetCategory = {
  records: [
    { id: 'cat-001', name: '角色原画', code: 'character', type: 'image', assetCount: 12, sort: 1 },
    { id: 'cat-002', name: '场景背景', code: 'scene', type: 'image', assetCount: 8, sort: 2 },
    { id: 'cat-003', name: '背景音乐', code: 'bgm', type: 'audio', assetCount: 5, sort: 3 },
    { id: 'cat-004', name: '音效素材', code: 'sfx', type: 'audio', assetCount: 20, sort: 4 },
  ],
  total: 4,
}

// ─── 审核 Mock ─────────────────────────────────────────────────────

export const mockReviewItem = {
  id: 'review-001',
  contentTitle: '第一集分镜设计',
  contentType: 'design',
  status: 'pending',
  submitterId: mockUser.id,
  submitterName: mockUser.username,
  submitTime: '2026-06-01T09:00:00Z',
  priority: 'high',
  currentReviewerId: 'reviewer-001',
  currentReviewerName: '审核员甲',
  deadline: '2026-06-05T00:00:00Z',
}

export const mockReviewList = {
  records: [
    mockReviewItem,
    { ...mockReviewItem, id: 'review-002', contentTitle: '第二集剧本', status: 'approved', contentType: 'script' },
    { ...mockReviewItem, id: 'review-003', contentTitle: '开场视频', status: 'rejected', contentType: 'video' },
  ],
  total: 3,
  pendingCount: 1,
  approvedCount: 1,
  rejectedCount: 1,
}

// ─── 团队 Mock ─────────────────────────────────────────────────────

export const mockTeam = {
  id: 'team-001',
  teamName: 'Dreamcraft制作组',
  description: '专注于AI短剧制作的团队',
  ownerId: mockUser.id,
  ownerName: mockUser.username,
  memberCount: 8,
  projectCount: 3,
  region: '北京',
  status: 1,
  createTime: '2025-12-01T00:00:00Z',
}

export const mockTeamMember = {
  id: 'tm-001',
  userId: 'u1',
  userName: '张三',
  email: 'zhangsan@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
  role: 'admin',
  department: '导演组',
  joinMethod: 'invite',
  joinTime: '2025-12-01T00:00:00Z',
  status: 1,
}

export const mockTeamMemberList = {
  records: [
    mockTeamMember,
    { ...mockTeamMember, id: 'tm-002', userName: '李四', role: 'director', joinMethod: 'apply' },
    { ...mockTeamMember, id: 'tm-003', userName: '王五', role: 'member', status: 0 },
  ],
  total: 3,
}

export const mockInviteCode = {
  id: 'inv-001',
  code: 'DCA-X7K9-M2LP',
  role: 'member',
  maxUsage: 10,
  usedCount: 3,
  expireTime: '2026-12-31T00:00:00Z',
  status: 1,
  createTime: '2026-01-01T00:00:00Z',
}

export const mockQuota = {
  records: [
    {
      id: 'quota-001',
      targetType: 'team',
      targetId: 'team-001',
      targetName: 'Dreamcraft制作组',
      resourceType: 'ai_calls',
      limit: 1000,
      used: 650,
      unit: '次',
      alertThreshold: 80,
      resetCycle: 'monthly',
      status: 1,
    },
    {
      id: 'quota-002',
      targetType: 'team',
      targetId: 'team-001',
      targetName: 'Dreamcraft制作组',
      resourceType: 'storage',
      limit: 10240,
      used: 8192,
      unit: 'MB',
      alertThreshold: 85,
      resetCycle: 'never',
      status: 1,
    },
  ],
  total: 2,
}

// ─── 积分 Mock ─────────────────────────────────────────────────────

export const mockCreditsBalance = {
  balance: 8500,
  totalEarned: 10000,
  totalConsumed: 1500,
}

export const mockTransactionList = {
  records: [
    {
      id: 'tx-001',
      transactionNo: 'TXN202606010001',
      type: 'consume',
      amount: -500,
      balance: 8500,
      channel: 'AI视频生成',
      remark: '生成视频消耗500积分',
      status: 'success',
      createTime: '2026-06-01T10:00:00Z',
    },
    {
      id: 'tx-002',
      transactionNo: 'TXN202605010001',
      type: 'recharge',
      amount: 5000,
      balance: 9000,
      channel: '在线充值',
      remark: '充值5000积分',
      status: 'success',
      createTime: '2026-05-01T00:00:00Z',
    },
    {
      id: 'tx-003',
      transactionNo: 'TXN202604010001',
      type: 'gift',
      amount: 5000,
      balance: 4000,
      channel: '新手礼包',
      remark: '注册赠送积分',
      status: 'success',
      createTime: '2026-04-01T00:00:00Z',
    },
  ],
  total: 3,
}

export const mockTokenUsage = {
  records: [
    {
      id: 'tu-001',
      projectId: mockProject.id,
      projectName: mockProject.projectName,
      model: 'GPT-4o',
      requestType: 'text',
      inputTokens: 5000,
      outputTokens: 2000,
      totalTokens: 7000,
      cost: 0.14,
      createTime: '2026-06-01T12:00:00Z',
    },
  ],
  total: 1,
  totalTokens: 7000,
  totalRequests: 10,
  totalInputTokens: 50000,
  totalOutputTokens: 20000,
}

// ─── 通知 Mock ─────────────────────────────────────────────────────

export const mockNotification = {
  id: 'notif-001',
  title: '剧本审核已通过',
  content: '您的剧本《第一集》已通过审核，可以进行下一步操作。',
  type: 'review',
  isRead: false,
  isStarred: false,
  senderId: 'system',
  senderName: '系统通知',
  createTime: '2026-06-01T14:00:00Z',
}

export const mockNotificationList = {
  records: [mockNotification, { ...mockNotification, id: 'notif-002', title: '新成员加入', isRead: true }],
  total: 2,
  unreadCount: 1,
}

// ─── AI处理记录 Mock ────────────────────────────────────────────────

export const mockAiProcessRecord = {
  id: 'aipr-001',
  workflowType: 'script_decompose',
  status: 'success',
  inputSummary: '剧本《第一集》拆解为3个分集',
  outputSummary: '成功生成3个分集',
  createTime: '2026-06-01T11:00:00Z',
  completeTime: '2026-06-01T11:02:30Z',
}

export const mockAiProcessList = {
  records: [
    mockAiProcessRecord,
    { ...mockAiProcessRecord, id: 'aipr-002', workflowType: 'storyboard_generate', status: 'processing' },
    { ...mockAiProcessRecord, id: 'aipr-003', workflowType: 'video_generate', status: 'failed', error: '模型调用超时' },
  ],
  total: 3,
}

// ─── 工作流 Mock ────────────────────────────────────────────────────

export const mockWorkflow = {
  id: 'wf-001',
  code: 'script-decompose',
  name: '剧本拆解工作流',
  type: 'text',
  apiKeyConfigured: true,
  status: 1,
  createTime: '2026-01-01T00:00:00Z',
}

export const mockWorkflowList = {
  records: [mockWorkflow, { ...mockWorkflow, id: 'wf-002', code: 'storyboard-generate', name: '分镜生成', type: 'multimodal', apiKeyConfigured: false }],
  total: 2,
}

// ─── 数据历史 Mock ──────────────────────────────────────────────────

export const mockDataHistoryRecord = {
  id: 'hist-001',
  dataType: 'script',
  dataId: mockScript.id,
  operationType: 'UPDATE',
  operatorId: mockUser.id,
  operatorName: mockUser.username,
  changeSummary: '修改剧本内容，添加第3段',
  createTime: '2026-06-01T15:00:00Z',
  beforeData: { title: '第一集', content: '旧内容' },
  afterData: { title: '第一集', content: '旧内容\n新增第3段内容' },
}

// ─── 系统管理 Mock ──────────────────────────────────────────────────

export const mockAdminUser = {
  id: 'admin-001',
  username: '平台管理员',
  email: 'admin@example.com',
  phone: '13900139000',
  sex: 1,
  status: 1,
  createTime: '2025-01-01T00:00:00Z',
}

export const mockAdminDashboard = {
  totalUsers: 1280,
  activeUsers: 856,
  totalTeams: 45,
  totalProjects: 312,
  dailyVisits: 2048,
  dailyAiCalls: 18500,
}

// ─── 通用工厂函数 ───────────────────────────────────────────────────

export function createMockAdapter() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    request: vi.fn(),
  }
}

export function createPaginatedResponse<T>(items: T[], total: number, page = 1, pageSize = 10) {
  return {
    records: items,
    total,
    page,
    pageSize,
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
