"""
认证相关 fixture

核心机制：
- _pre_auth_states: session 级 fixture，在第一个测试运行前
  预生成 admin/team_admin/member 三个角色的 storage_state 文件。
- admin_logged_in / team_admin_logged_in / member_logged_in 显式依赖
  _pre_auth_states，确保 state 文件在 context 创建前已存在。
- context fixture（conftest.py）根据 request.fixturenames 自动注入对应的 storage_state。
- admin_page / team_admin_page / member_page 创建独立 BrowserContext（多账号联动用）。
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Browser, BrowserContext, Page

from core.config import get_config
from pages.auth.login_page import LoginPage


def _login_and_wait(page: Page, username: str, password: str) -> None:
    """执行登录并等待页面离开登录页。"""
    lp = LoginPage(page).navigate()
    lp.login(username, password)
    try:
        page.wait_for_url(lambda u: "/auth/login" not in u, timeout=15000)
    except Exception:
        page.wait_for_timeout(3000)


# ============================================================
# Session 级：在第一个测试运行前预生成所有 storage_state
# ============================================================
@pytest.fixture(scope="session")
def _pre_auth_states(browser: Browser) -> None:
    """Session 开始时预生成所有角色的 storage_state 文件。

    这确保在第一个测试的 context fixture 运行时，state 文件已存在，
    避免 fixture 依赖链顺序导致的反复登录问题。
    """
    from pathlib import Path  # noqa: PLC0415

    cfg = get_config()
    state_dir = Path(__file__).resolve().parent.parent / ".auth_state"
    state_dir.mkdir(parents=True, exist_ok=True)

    roles = [
        ("admin", cfg.account.admin_username, cfg.account.admin_password),
        ("team_admin", cfg.account.team_admin_username, cfg.account.team_admin_password),
        ("member", cfg.account.member_username, cfg.account.member_password),
    ]

    for role, username, password in roles:
        state_path = state_dir / f"{role}.json"
        if state_path.exists():
            continue
        ctx = browser.new_context(
            viewport={"width": cfg.browser.viewport_width, "height": cfg.browser.viewport_height},
            locale=cfg.browser.locale,
            timezone_id=cfg.browser.timezone,
        )
        try:
            p = ctx.new_page()
            p.set_default_timeout(cfg.timeout.default_timeout)
            p.set_default_navigation_timeout(cfg.timeout.nav_timeout)
            _login_and_wait(p, username, password)
            ctx.storage_state(path=str(state_path))
            print(f"\n[Auth] 已缓存 {role} 的登录态 -> {state_path}")
        except Exception as e:
            print(f"\n[Auth][WARN] {role} 登录态缓存失败: {e}")
        finally:
            ctx.close()

    yield


# ============================================================
# 单账号 fixture
# 显式依赖 _pre_auth_states 确保 state 文件在 context 创建前已存在。
# context fixture 会根据 fixturenames 自动注入对应的 storage_state。
# ============================================================
@pytest.fixture()
def login_page(page: Page) -> LoginPage:
    return LoginPage(page)


@pytest.fixture()
def admin_logged_in(page: Page, _pre_auth_states: None) -> Page:
    """以 platform_admin 登录后的 Page（复用 session 级 storage_state）。"""
    yield page


@pytest.fixture()
def team_admin_logged_in(page: Page, _pre_auth_states: None) -> Page:
    """以 team_admin 登录后的 Page（复用 session 级 storage_state）。"""
    yield page


@pytest.fixture()
def member_logged_in(page: Page, _pre_auth_states: None) -> Page:
    """以 member 登录后的 Page（复用 session 级 storage_state）。"""
    yield page


# ============================================================
# 多账号联动 fixture（独立 BrowserContext，可在同一测试中并行使用）
# ============================================================
def _create_logged_in_page(browser: Browser, username: str, password: str) -> tuple[BrowserContext, Page]:
    """创建独立 BrowserContext + Page 并完成登录，返回 (context, page)。"""
    cfg = get_config()
    ctx = browser.new_context(
        viewport={"width": cfg.browser.viewport_width, "height": cfg.browser.viewport_height},
        locale=cfg.browser.locale,
        timezone_id=cfg.browser.timezone,
    )
    p = ctx.new_page()
    p.set_default_timeout(cfg.timeout.default_timeout)
    p.set_default_navigation_timeout(cfg.timeout.nav_timeout)
    _login_and_wait(p, username, password)
    return ctx, p


@pytest.fixture()
def admin_page(browser: Browser):
    """platform_admin 独立 Page，用于多账号联动测试。"""
    cfg = get_config()
    ctx, p = _create_logged_in_page(browser, cfg.account.admin_username, cfg.account.admin_password)
    yield p
    ctx.close()


@pytest.fixture()
def team_admin_page(browser: Browser):
    """team_admin 独立 Page，用于多账号联动测试。"""
    cfg = get_config()
    ctx, p = _create_logged_in_page(browser, cfg.account.team_admin_username, cfg.account.team_admin_password)
    yield p
    ctx.close()


@pytest.fixture()
def member_page(browser: Browser):
    """member 独立 Page，用于多账号联动测试。"""
    cfg = get_config()
    ctx, p = _create_logged_in_page(browser, cfg.account.member_username, cfg.account.member_password)
    yield p
    ctx.close()
