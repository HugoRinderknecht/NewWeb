"""
pytest 全局 conftest

负责：
- 日志初始化
- 浏览器 / context / page fixture
- 失败时自动截图 / 视频 / trace
- 报告元数据
- session 级登录态缓存（storage_state），显著加速大批量用例
"""
from __future__ import annotations

import json
import os
import re
import socket
import subprocess
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Generator

import pytest
from playwright.sync_api import (
    Browser,
    BrowserContext,
    Page,
    sync_playwright,
)

from core.config import Config, get_config
from core.logger import setup_logging

# ============================================================
# 路径
# ============================================================
E2E_ROOT = Path(__file__).resolve().parent
REPORTS_ROOT = E2E_ROOT / "reports"
STATE_DIR = E2E_ROOT / ".auth_state"  # storage_state 缓存目录


# ============================================================
# 启动钩子
# ============================================================
def pytest_configure(config: pytest.Config) -> None:
    """pytest 启动时初始化。"""
    # 日志
    setup_logging()

    # 创建产物目录
    cfg = get_config()
    for path in [
        cfg.report.html_report_path,
        cfg.report.allure_results_dir,
        cfg.report.screenshot_dir,
        cfg.report.log_dir,
        cfg.report.video_dir,
        cfg.report.trace_dir,
    ]:
        Path(path).mkdir(parents=True, exist_ok=True)

    # storage_state 缓存目录
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    # 报告元数据
    config._metadata = getattr(config, "_metadata", {}) or {}
    config._metadata.update(
        {
            "项目": "DreamCraft Astra",
            "测试类型": "Python E2E（Playwright + pytest）",
            "执行时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "Python": subprocess.getoutput("python --version").strip(),
            "Base URL": cfg.app.base_url,
        }
    )


def pytest_sessionstart(session: pytest.Session) -> None:
    """会话开始：健康检查前端服务。"""
    cfg = get_config()
    base_url = cfg.app.base_url
    try:
        host = re.sub(r"^https?://", "", base_url).split(":")[0]
        port = re.sub(r"^https?://", "", base_url).split(":")[1] if ":" in re.sub(r"^https?://", "", base_url) else "80"
        with socket.create_connection((host, int(port)), timeout=3):
            print(f"\n[Setup] 前端服务可达: {base_url}")
    except Exception as e:
        print(f"\n[Setup][WARN] 前端服务健康检查失败: {e}")
        print(f"        请确认 {base_url} 已启动 (pnpm dev)")


# ============================================================
# 浏览器 fixture
# ============================================================
@pytest.fixture(scope="session")
def cfg() -> Config:
    """全局配置 fixture。"""
    return get_config()


@pytest.fixture(scope="session")
def playwright_instance() -> Generator[Any, None, None]:
    """session 级 Playwright 实例。"""
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope="session")
def browser(playwright_instance, cfg: Config) -> Generator[Browser, None, None]:
    """session 级浏览器实例。

    按 cfg.browser 决定 chromium / firefox / webkit。
    """
    launch_kwargs: dict[str, Any] = {
        "headless": cfg.browser.headless,
        "slow_mo": cfg.browser.slow_mo,
        "args": ["--no-sandbox", "--disable-dev-shm-usage"],
    }
    if cfg.browser.browser == "chromium":
        b = playwright_instance.chromium.launch(**launch_kwargs)
    elif cfg.browser.browser == "firefox":
        b = playwright_instance.firefox.launch(**launch_kwargs)
    else:
        b = playwright_instance.webkit.launch(**launch_kwargs)
    yield b
    b.close()


# ============================================================
# 上下文 / 页面
#
# 关键优化：
# - 默认不录视频、不开 tracing（开销巨大）；仅在用例失败时
#   通过 pytest_runtest_makereport 重新启动一个带录制的复跑通常不现实，
#   因此这里改为「失败时立刻截图 + 保存 trace.zip（若提前开启）」。
# - 通过环境变量 RECORD_VIDEO=1 / RECORD_TRACE=1 强制开启全程录制。
# ============================================================
def _record_video_enabled(cfg: Config) -> bool:
    return os.getenv("RECORD_VIDEO", "0").strip().lower() in ("1", "true", "yes", "y", "on")


def _record_trace_enabled(cfg: Config) -> bool:
    # 默认开启 trace，但只在失败时保留 zip
    return os.getenv("RECORD_TRACE", "1").strip().lower() in ("1", "true", "yes", "y", "on")


# 角色 -> storage_state 缓存文件名的映射
_AUTH_FIXTURE_TO_ROLE: dict[str, str] = {
    "admin_logged_in": "admin",
    "team_admin_logged_in": "team_admin",
    "member_logged_in": "member",
}


@pytest.fixture()
def context(browser: Browser, cfg: Config, request: pytest.FixtureRequest) -> Generator[BrowserContext, None, None]:
    """用例级 BrowserContext。"""
    test_name = _safe_filename(request.node.name)
    video_dir = Path(cfg.report.video_dir) / test_name

    record_video = _record_video_enabled(cfg)
    record_trace = _record_trace_enabled(cfg)

    if record_video:
        video_dir.mkdir(parents=True, exist_ok=True)

    # 复用登录态（若测试通过 storage_state fixture 设置）
    storage_state = getattr(request, "_test_storage_state", None) or getattr(
        request.node, "_storage_state_path", None
    )

    # 自动推断：根据测试使用的 fixture 名称查找对应的 storage_state
    if not storage_state:
        for fixture_name in request.fixturenames:
            role = _AUTH_FIXTURE_TO_ROLE.get(fixture_name)
            if role:
                candidate = STATE_DIR / f"{role}.json"
                if candidate.exists():
                    storage_state = str(candidate)
                    break

    ctx_kwargs: dict[str, Any] = dict(
        viewport={"width": cfg.browser.viewport_width, "height": cfg.browser.viewport_height},
        locale=cfg.browser.locale,
        timezone_id=cfg.browser.timezone,
    )
    if record_video:
        ctx_kwargs["record_video_dir"] = str(video_dir)
        ctx_kwargs["record_video_size"] = {
            "width": cfg.browser.viewport_width,
            "height": cfg.browser.viewport_height,
        }
    if storage_state and Path(storage_state).exists():
        ctx_kwargs["storage_state"] = str(storage_state)

    ctx = browser.new_context(**ctx_kwargs)

    if record_trace:
        try:
            ctx.tracing.start(screenshots=True, snapshots=True, sources=True)
        except Exception:
            pass

    # 保存 trace 元信息供 makereport 使用
    request.node._ctx_record_trace = record_trace
    request.node._ctx_record_video = record_video

    yield ctx

    # 收尾：trace 仅在失败时保留
    failed = bool(getattr(request.node, "rep_call", None) and request.node.rep_call.failed)
    if record_trace:
        try:
            if failed:
                trace_dir = Path(cfg.report.trace_dir) / test_name
                trace_dir.mkdir(parents=True, exist_ok=True)
                ctx.tracing.stop(path=str(trace_dir / "trace.zip"))
            else:
                ctx.tracing.stop()
        except Exception:
            pass
    ctx.close()

    # 视频清理：通过时删除以节省空间
    if record_video and not failed and video_dir.exists():
        try:
            for f in video_dir.iterdir():
                f.unlink(missing_ok=True)
            video_dir.rmdir()
        except Exception:
            pass


@pytest.fixture()
def page(context: BrowserContext, cfg: Config, request: pytest.FixtureRequest) -> Generator[Page, None, None]:
    """用例级 Page。"""
    p = context.new_page()
    p.set_default_timeout(cfg.timeout.default_timeout)
    p.set_default_navigation_timeout(cfg.timeout.nav_timeout)

    yield p

    # 用例结束：失败时截图
    rep = getattr(request.node, "rep_call", None)
    if rep and rep.failed and cfg.report.screenshot_on_fail:
        _take_screenshot(p, request.node.name)


# ============================================================
# API 辅助 fixture
# ============================================================
@pytest.fixture()
def api_responses(page: Page) -> list[dict[str, Any]]:
    """记录浏览器生命周期内所有 /api/* 响应。"""
    responses: list[dict[str, Any]] = []

    def _on_response(resp):
        url = resp.url
        if "/api/" in url:
            try:
                body = resp.text()
            except Exception:
                body = ""
            responses.append(
                {
                    "url": url,
                    "method": resp.request.method,
                    "status": resp.status,
                    "body": body[:2000],  # 截断
                    "headers": dict(resp.headers),
                }
            )

    page.on("response", _on_response)
    return responses


# ============================================================
# 钩子：失败处理
# ============================================================
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo):
    """捕获每个阶段的结果，挂到 item 上供 fixture 读取。"""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)


def _take_screenshot(page: Page, name: str) -> None:
    cfg = get_config()
    screenshot_dir = Path(cfg.report.screenshot_dir)
    screenshot_dir.mkdir(parents=True, exist_ok=True)
    fname = screenshot_dir / f"{_safe_filename(name)}_{int(time.time() * 1000)}.png"
    try:
        page.screenshot(path=str(fname), full_page=True)
    except Exception:
        pass


def _safe_filename(name: str) -> str:
    return re.sub(r"[^\w\-]+", "_", name)[:80]


# ============================================================
# 自定义 HTML 摘要
# ============================================================
def pytest_terminal_summary(terminalreporter, exitstatus, config):
    """终端输出汇总。"""
    stats = terminalreporter.stats
    passed = len(stats.get("passed", []))
    failed = len(stats.get("failed", []))
    skipped = len(stats.get("skipped", []))
    error = len(stats.get("error", []))
    total = passed + failed + skipped + error

    summary_path = Path(get_config().report.html_report_path).parent / "summary.json"
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary = {
        "total": total,
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "error": error,
        "exit_status": exitstatus,
        "timestamp": datetime.now().isoformat(),
    }
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
