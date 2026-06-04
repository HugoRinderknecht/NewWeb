"""
配置加载模块

职责：
- 从 .env 文件或环境变量读取配置
- 使用 Pydantic 校验与类型转换
- 提供全局单例 Config 对象
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Literal, Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field

# 项目根目录：e2e 的父目录
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
E2E_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = E2E_ROOT / ".env"

# 加载 .env（如存在）
if ENV_FILE.exists():
    load_dotenv(ENV_FILE, override=False)


def _bool(v: str | bool | None, default: bool = False) -> bool:
    if isinstance(v, bool):
        return v
    if v is None:
        return default
    return str(v).strip().lower() in ("1", "true", "yes", "y", "on")


class BrowserConfig(BaseModel):
    """浏览器相关配置。"""

    headless: bool = Field(default=True, description="是否无头模式")
    browser: Literal["chromium", "firefox", "webkit"] = Field(default="chromium")
    slow_mo: int = Field(default=0, description="放慢操作毫秒数")
    viewport_width: int = Field(default=1280)
    viewport_height: int = Field(default=800)
    locale: str = Field(default="zh-CN")
    timezone: str = Field(default="Asia/Shanghai")
    record_video: bool = Field(default=False, description="录制所有用例视频")
    record_trace: bool = Field(default=False, description="生成 trace.zip")


class AccountConfig(BaseModel):
    """测试账号配置。"""

    admin_username: str = "17369359010"
    admin_password: str = "Kill242002"
    team_admin_username: str = "team_admin"
    team_admin_password: str = "Test1234"
    member_username: str = "member"
    member_password: str = "Test1234"


class TimeoutConfig(BaseModel):
    """超时配置（毫秒）。"""

    default_timeout: int = 15000
    nav_timeout: int = 30000
    action_timeout: int = 10000


class ReportConfig(BaseModel):
    """报告与产物路径。"""

    html_report_path: str = "reports/html"
    allure_results_dir: str = "reports/allure-results"
    screenshot_dir: str = "reports/screenshots"
    log_dir: str = "reports/logs"
    video_dir: str = "reports/videos"
    trace_dir: str = "reports/traces"

    retry_failed: int = Field(default=0, description="失败重试次数（默认关闭，开启会拖慢失败用例）")
    screenshot_on_fail: bool = True
    video_on_fail: bool = False  # 默认关闭录像，开销大；如需开启用 RECORD_VIDEO=1
    trace_on_fail: bool = True   # 默认仅在失败时保留 trace.zip


class AppConfig(BaseModel):
    """应用入口。

    ⚠️ 前端使用 vue-router hash 模式，访问路径需带 /#/ 前缀。
    base_url 仅为协议+域名+端口，不含路径。
    """

    base_url: str = "http://localhost:3006"
    login_url: str = "http://localhost:3006/#/auth/login"
    api_base_url: str = "http://server.bsuniversal.cn:10006"


class Config(BaseModel):
    """全局配置。"""

    app: AppConfig = Field(default_factory=AppConfig)
    browser: BrowserConfig = Field(default_factory=BrowserConfig)
    account: AccountConfig = Field(default_factory=AccountConfig)
    timeout: TimeoutConfig = Field(default_factory=TimeoutConfig)
    report: ReportConfig = Field(default_factory=ReportConfig)

    @classmethod
    def load(cls) -> "Config":
        """从环境变量构造配置。"""
        return cls(
            app=AppConfig(
                base_url=os.getenv("BASE_URL", "http://localhost:3006"),
                login_url=os.getenv("LOGIN_URL", "http://localhost:3006/auth/login"),
                api_base_url=os.getenv("API_BASE_URL", "http://server.bsuniversal.cn:10006"),
            ),
            browser=BrowserConfig(
                headless=_bool(os.getenv("HEADLESS"), True),
                browser=os.getenv("BROWSER", "chromium"),  # type: ignore[arg-type]
                slow_mo=int(os.getenv("SLOW_MO", "0")),
                viewport_width=int(os.getenv("VIEWPORT_WIDTH", "1280")),
                viewport_height=int(os.getenv("VIEWPORT_HEIGHT", "800")),
                locale=os.getenv("LOCALE", "zh-CN"),
                timezone=os.getenv("TIMEZONE", "Asia/Shanghai"),
            ),
            account=AccountConfig(
                admin_username=os.getenv("ADMIN_USERNAME", "17369359010"),
                admin_password=os.getenv("ADMIN_PASSWORD", "Kill242002"),
                team_admin_username=os.getenv("TEAM_ADMIN_USERNAME", "team_admin"),
                team_admin_password=os.getenv("TEAM_ADMIN_PASSWORD", "Test1234"),
                member_username=os.getenv("MEMBER_USERNAME", "member"),
                member_password=os.getenv("MEMBER_PASSWORD", "Test1234"),
            ),
            timeout=TimeoutConfig(
                default_timeout=int(os.getenv("DEFAULT_TIMEOUT", "15000")),
                nav_timeout=int(os.getenv("NAV_TIMEOUT", "30000")),
                action_timeout=int(os.getenv("ACTION_TIMEOUT", "10000")),
            ),
            report=ReportConfig(
                html_report_path=os.getenv("HTML_REPORT_PATH", "reports/html"),
                allure_results_dir=os.getenv("ALLURE_RESULTS_DIR", "reports/allure-results"),
                screenshot_dir=os.getenv("SCREENSHOT_DIR", "reports/screenshots"),
                log_dir=os.getenv("LOG_DIR", "reports/logs"),
                video_dir=os.getenv("VIDEO_DIR", "reports/videos"),
                trace_dir=os.getenv("TRACE_DIR", "reports/traces"),
                retry_failed=int(os.getenv("RETRY_FAILED", "0")),
                screenshot_on_fail=_bool(os.getenv("SCREENSHOT_ON_FAIL"), True),
                video_on_fail=_bool(os.getenv("VIDEO_ON_FAIL"), False),
                trace_on_fail=_bool(os.getenv("TRACE_ON_FAIL"), True),
            ),
        )


# 全局单例
_config: Optional[Config] = None


def get_config() -> Config:
    """获取全局配置单例。"""
    global _config
    if _config is None:
        _config = Config.load()
    return _config
