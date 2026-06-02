import { MockMethod } from 'vite-plugin-mock'

export default [
  { url: '/api/statistics/dashboard', method: 'get', response: () => ({ code: 200, message: 'success', data: { totalProjects: 12, activeProjects: 5, totalVideos: 34, totalStoryboards: 156, totalAssets: 423, creditsBalance: 5000, creditsBalanceChange: '+200', activeUsers: { values: [10, 15, 12, 18, 20, 16, 22], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }, totalUsers: '128', totalVisits: '3,456', dailyVisits: '234', weeklyChange: '+12%', pendingReviews: 8, pendingReviewsChange: '-3', projectProgress: 65, projectProgressChange: '+5%', ownedProjects: 5, ownedProjectsChange: '+1' }, timestamp: Date.now() }) },
  { url: '/api/statistics/realtime', method: 'get', response: () => ({ code: 200, message: 'success', data: { activeUsers: 15, runningTasks: 3, todayVideos: 5, todayAssets: 12, data: { activities: [] } }, timestamp: Date.now() }) },
  { url: '/api/statistics/trends', method: 'get', response: () => ({ code: 200, message: 'success', data: { dates: [], metrics: [], data: { values: [], labels: [] } }, timestamp: Date.now() }) },
  { url: '/api/statistics/credits', method: 'get', response: () => ({ code: 200, message: 'success', data: { balance: 5000, totalEarned: 10000, totalSpent: 5000, recentTransactions: [] }, timestamp: Date.now() }) },
  { url: '/api/statistics/alerts', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/statistics/teams/ranking', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/workload', method: 'get', response: () => ({ code: 200, message: 'success', data: { teamId: '', totalTasks: 0, completedTasks: 0, inProgressTasks: 0, overdueTasks: 0 }, timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/users/contribution', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/users/activity', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/projects/completion', method: 'get', response: () => ({ code: 200, message: 'success', data: { teamId: '', totalProjects: 0, completedProjects: 0, completionRate: 0 }, timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/reports/scheduled', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/reports/scheduled', method: 'post', response: () => ({ code: 200, message: '创建成功', data: { id: 'report-' + Date.now() }, timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/reports/scheduled/:id', method: 'put', response: () => ({ code: 200, message: '更新成功', data: null, timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/reports/scheduled/:id', method: 'delete', response: () => ({ code: 200, message: '删除成功', data: null, timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/reports/custom', method: 'post', response: () => ({ code: 200, message: '报表生成成功', data: null, timestamp: Date.now() }) },
  { url: '/api/statistics/teams/:teamId/export', method: 'post', response: () => ({ code: 200, message: '导出成功', data: null, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/:projectId/videos', method: 'get', response: () => ({ code: 200, message: 'success', data: { projectId: '', totalVideos: 0, completedVideos: 0, failedVideos: 0, totalDuration: 0 }, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/:projectId/usage', method: 'get', response: () => ({ code: 200, message: 'success', data: { projectId: '', totalCredits: 0, totalTokens: 0, totalAiCalls: 0 }, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/:projectId/usage/detail', method: 'get', response: () => ({ code: 200, message: 'success', data: { records: [] }, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/:projectId/storyboards', method: 'get', response: () => ({ code: 200, message: 'success', data: { projectId: '', totalStoryboards: 0, completedStoryboards: 0, inProgressStoryboards: 0 }, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/:projectId/resources', method: 'get', response: () => ({ code: 200, message: 'success', data: { projectId: '', storageUsed: 0, bandwidthUsed: 0, computeUsed: 0 }, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/:projectId/ai-usage', method: 'get', response: () => ({ code: 200, message: 'success', data: { projectId: '', totalCalls: 0, totalTokens: 0, totalCost: 0, byModel: [] }, timestamp: Date.now() }) },
  { url: '/api/statistics/projects/analysis', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) },
  { url: '/api/statistics/users/activity-rank', method: 'get', response: () => ({ code: 200, message: 'success', data: [], timestamp: Date.now() }) }
] as MockMethod[]
