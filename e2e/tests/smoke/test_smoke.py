"""
冒烟测试：登录 → 控制台 → 关键模块可达

执行：pytest -m smoke
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from core.config import get_config
from pages.auth.login_page import LoginPage


@pytest.mark.smoke
@pytest.mark.critical
def test_login_to_console(page: Page) -> None:
    """平台管理员登录 → 进入控制台。"""
    cfg = get_config()
    LoginPage(page).navigate().login(cfg.account.admin_username, cfg.account.admin_password)
    page.wait_for_timeout(2000)
    # 验证登录成功（出现成功 toast）
    success_toast = page.locator(".el-notification--success, .el-message--success").count() > 0
    # 主动访问控制台（hash 路由）
    page.goto(f"{cfg.app.base_url}/#/dashboard/console", wait_until="networkidle", timeout=15000)
    page.wait_for_timeout(2500)
    # 校验：URL 进入 dashboard 或 业务页存在
    url_ok = "dashboard" in page.url.lower() or "console" in page.url.lower()
    assert success_toast or url_ok, f"登录失败 URL={page.url}"


@pytest.mark.smoke
@pytest.mark.critical
def test_login_success_admin(page: Page) -> None:
    """管理员账号登录成功（验证业务接口被调用）。"""
    cfg = get_config()
    api_logs: list[dict] = []
    page.on("response", lambda r: api_logs.append({"url": r.url, "status": r.status}) if "/api/" in r.url else None)
    LoginPage(page).navigate().login(cfg.account.admin_username, cfg.account.admin_password)
    page.wait_for_timeout(2000)
    # 应有 POST /api/auth/login 成功 + /api/auth/me 成功
    login_ok = any("/api/auth/login" in r["url"] and r["status"] == 200 for r in api_logs)
    me_ok = any("/api/auth/me" in r["url"] and r["status"] == 200 for r in api_logs)
    assert login_ok, f"登录接口未成功调用: {[r for r in api_logs if 'auth' in r['url']]}"
    assert me_ok, f"用户信息接口未成功调用"


@pytest.mark.smoke
def test_login_page_renders(page: Page) -> None:
    """登录页正常渲染。"""
    lp = LoginPage(page).navigate()
    # 验证 URL 正确
    assert "/auth/login" in page.url
    # 页面应有可见内容（等待渲染完成）
    page.wait_for_timeout(1000)
    title = page.title()
    assert "Dreamcraft" in title or "登录" in title or "Login" in title, f"登录页标题异常: {title}"
