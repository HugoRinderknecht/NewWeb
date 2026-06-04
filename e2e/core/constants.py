"""
全局常量

集中维护：
- 路由路径
- 通用按钮文本（中英文）
- 模块标识
- 状态枚举文本
"""
from __future__ import annotations

# ============================================================
# 路由路径
# ============================================================
class Route:
    # 认证
    LOGIN = "/auth/login"
    REGISTER = "/auth/register"
    FORGET_PASSWORD = "/auth/forget-password"

    # 系统管理
    ADMIN_DASHBOARD = "/system/admin-dashboard"
    USER = "/system/user"
    ROLE = "/system/role"
    MENU = "/system/menu"
    AUDIT_LOGS = "/system/audit-logs"
    BILLING_CONFIG = "/system/billing-config"
    PLATFORM_TEAMS = "/system/platform-teams"
    VIDEO_MODELS = "/system/video-models"
    DIFY_WORKFLOWS = "/system/dify-workflows"
    RUNTIME_CONFIG = "/system/runtime-config"
    USER_CENTER = "/system/user-center"
    TEAM_CREATE = "/system/team-create"
    TEAM_INVITE = "/system/team-invite"
    TEAM_PERMISSION = "/system/team-permission"

    # 仪表盘
    DASHBOARD_CONSOLE = "/dashboard/console"
    DASHBOARD_USAGE = "/dashboard/usage"
    DASHBOARD_ANALYSIS = "/dashboard/analysis"
    DASHBOARD_REPORT = "/dashboard/report"
    DASHBOARD_DATA = "/dashboard/data-dashboard"
    DASHBOARD_AI_USAGE = "/dashboard/ai-usage"
    DASHBOARD_COST = "/dashboard/cost"

    # 项目管理
    PROJECT_LIST = "/project/list"
    PROJECT_EDIT = "/project/edit"
    PROJECT_SCRIPTS = "/project/scripts"
    PROJECT_CHARACTERS = "/project/characters"
    PROJECT_EPISODES = "/project/episodes"
    PROJECT_MEMBER = "/project/member"
    PROJECT_STATISTICS = "/project/statistics"

    # 剧本管理
    SCRIPT_LIBRARY = "/script/library"
    SCRIPT_WRITE = "/script/write"
    SCRIPT_DECOMPOSE = "/script/decompose"
    SCRIPT_PROFILES = "/script/profiles"
    SCRIPT_AI_REVIEW = "/script/ai-review"
    SCRIPT_VERSION = "/script/version"

    # 分镜管理
    STORYBOARD_DESIGN = "/storyboard/design"
    STORYBOARD_SCENE = "/storyboard/scene"
    STORYBOARD_PREVIEW = "/storyboard/preview"
    STORYBOARD_BATCH_EDIT = "/storyboard/batch-edit"

    # 视频生成
    VIDEO_GEN_AI = "/video-gen/ai"
    VIDEO_GEN_TASK = "/video-gen/task"
    VIDEO_GEN_PREVIEW = "/video-gen/preview"
    VIDEO_GEN_HISTORY = "/video-gen/history"

    # 剪辑工作台
    EDITOR_MANAGE = "/editor/edit-manage"
    EDITOR_TIMELINE = "/editor/timeline"
    EDITOR_EXPORT = "/editor/export"

    # 审核中心
    REVIEW_CONTENT = "/review/content"
    REVIEW_FLOW = "/review/flow"
    REVIEW_PENDING = "/review/pending"
    REVIEW_DETAIL = "/review/detail"
    REVIEW_REJECT_REASONS = "/review/reject-reasons"
    REVIEW_STATISTICS = "/review/statistics"

    # 资产管理
    ASSET_UPLOAD = "/asset/upload"
    ASSET_CATEGORY = "/asset/category"
    ASSET_LIBRARY = "/asset/library"
    ASSET_REUSE = "/asset/reuse"
    ASSET_TAGS = "/asset/tags"
    ASSET_IMPORT = "/asset/import"
    ASSET_AI_GENERATE = "/asset/ai-generate"
    ASSET_PREVIEW = "/asset/preview"

    # AI 处理记录
    AI_PROCESS_HISTORY = "/ai-process/history"
    AI_PROCESS_STATUS = "/ai-process/status"

    # 数据历史
    DATA_HISTORY_RECORDS = "/data-history/records"
    DATA_HISTORY_ROLLBACK = "/data-history/rollback"

    # 工作流管理
    WORKFLOW_LIST = "/workflow/list"
    WORKFLOW_EXECUTE = "/workflow/execute"
    WORKFLOW_CATALOG = "/workflow/catalog"

    # 团队管理
    TEAM_LIST = "/team/list"
    TEAM_MEMBERS = "/team/members"
    TEAM_ROLES = "/team/roles"
    TEAM_INVITE_CODES = "/team/invite-codes"
    TEAM_APPLICATIONS = "/team/applications"
    TEAM_QUOTA = "/team/quota"
    TEAM_SETTINGS = "/team/settings"

    # 积分管理
    POINTS_BILLING = "/points/billing"
    POINTS_RECORD = "/points/record"
    POINTS_TRANSACTIONS = "/points/transactions"
    POINTS_TOKEN_USAGE = "/points/token-usage"
    POINTS_PRICING = "/points/pricing"

    # 通知中心
    NOTICE_SITE = "/notice/site"
    NOTICE_REMIND = "/notice/remind"

    # 系统设置
    SETTINGS_ACCOUNT = "/settings/account"
    SETTINGS_SYSTEM = "/settings/system"
    SETTINGS_SECURITY = "/settings/security"
    SETTINGS_DANGER = "/settings/danger"


# ============================================================
# 通用按钮 / 文案
# ============================================================
class Text:
    # 通用
    CONFIRM = "确 定"
    CANCEL = "取 消"
    SUBMIT = "提 交"
    SAVE = "保 存"
    DELETE = "删 除"
    EDIT = "编 辑"
    ADD = "新 增"
    NEW = "新 建"
    SEARCH = "搜 索"
    RESET = "重 置"
    EXPORT = "导 出"
    IMPORT = "导 入"
    UPLOAD = "上 传"
    DOWNLOAD = "下 载"
    REFRESH = "刷 新"
    BACK = "返 回"
    NEXT = "下 一 步"
    PREV = "上 一 步"
    CLOSE = "关 闭"

    # 登录
    LOGIN = "登 录"
    LOGOUT = "退 出"
    REGISTER = "注 册"
    FORGET_PASSWORD = "忘记密码"
    REMEMBER_ME = "记住密码"

    # 项目
    CREATE_PROJECT = "创建项目"
    BATCH_ARCHIVE = "批量归档"
    BATCH_RESTORE = "批量恢复"
    BATCH_DELETE = "批量删除"

    # 状态标签
    SUCCESS = "成功"
    FAILED = "失败"
    PROCESSING = "处理中"
    PENDING = "待审核"
    APPROVED = "已通过"
    REJECTED = "已驳回"


# ============================================================
# 状态枚举（来自文档）
# ============================================================
class ProjectStatus:
    DRAFT = 0  # 草稿
    IN_PROGRESS = 1  # 进行中
    COMPLETED = 2  # 已完成
    ARCHIVED = 3  # 已归档


class ScriptReviewStatus:
    NOT_SUBMITTED = None  # 未提交
    PENDING = 1  # 待审核
    APPROVED = 2  # 已通过
    REJECTED = 3  # 已驳回
    WITHDRAWN = 4  # 已撤回


class VideoTaskStatus:
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


# ============================================================
# 角色（来自 docs）
# ============================================================
class Role:
    PLATFORM_ADMIN = "platform_admin"
    TEAM_ADMIN = "team_admin"
    TEAM_MEMBER = "team_member"
    MEMBER = "member"


# ============================================================
# 默认等待 / 重试
# ============================================================
WAIT_SHORT = 1  # 1s
WAIT_MEDIUM = 2  # 2s
WAIT_LONG = 5  # 5s
