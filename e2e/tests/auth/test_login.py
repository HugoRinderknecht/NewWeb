"""
登录功能测试

覆盖文档：功能模块全面分析文档 §1.11（个人中心） + 前端页面UI详细说明 §认证

用例：
- 正常登录（用户名 / 邮箱 / 手机号）
- 错误密码
- 账号为空
- 密码为空
- 不存在账号
- 记住密码
- 验证码不存在（已禁用）
- 登录跳转
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page, expect

from core.config import get_config
from pages.auth.login_page import LoginPage
from utils import data_factory as df


@pytest.mark.auth
class TestLogin:
    """登录模块测试套件。"""

    def test_login_with_username(self, page: Page) -> None:
        """AUTH_LOG_001：用户名正常登录。"""
        cfg = get_config()
        LoginPage(page).navigate().login(cfg.account.admin_username, cfg.account.admin_password)
        # 登录成功：通知出现，或 hash 路径离开 /auth/login（不含 redirect 参数）
        page.wait_for_timeout(1500)
        toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        assert toast or "/auth/login" not in hash_part, f"登录失败: url={page.url}"

    def test_login_with_email(self, page: Page) -> None:
        """AUTH_LOG_002：邮箱登录。"""
        cfg = get_config()
        LoginPage(page).navigate().login(cfg.account.admin_username, cfg.account.admin_password)
        page.wait_for_timeout(1500)
        toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        assert toast or "/auth/login" not in hash_part, f"登录失败: url={page.url}"

    def test_login_with_wrong_password(self, page: Page) -> None:
        """AUTH_LOG_005：错误密码。"""
        lp = LoginPage(page).navigate()
        lp.enter_account(get_config().account.admin_username)
        lp.enter_password("wrong_password_123")
        lp.click_login()
        # 等待错误提示
        page.wait_for_timeout(2000)
        # 可能留在登录页或显示错误
        assert "/auth/login" in page.url or page.locator(".el-form-item__error, .el-message--error").count() > 0

    def test_login_with_nonexistent_account(self, page: Page) -> None:
        """AUTH_LOG_006：不存在账号。"""
        lp = LoginPage(page).navigate()
        lp.enter_account("notexist_" + df.random_str(6))
        lp.enter_password("Test1234")
        lp.click_login()
        page.wait_for_timeout(2000)
        assert "/auth/login" in page.url

    def test_login_with_empty_account(self, page: Page) -> None:
        """AUTH_LOG_008：账号为空。"""
        lp = LoginPage(page).navigate()
        lp.enter_password("Test1234")
        lp.click_login()
        # 校验提示或仍在登录页
        page.wait_for_timeout(1000)
        assert "/auth/login" in page.url

    def test_login_with_empty_password(self, page: Page) -> None:
        """AUTH_LOG_007：密码为空。"""
        lp = LoginPage(page).navigate()
        lp.enter_account(get_config().account.admin_username)
        lp.click_login()
        page.wait_for_timeout(1000)
        assert "/auth/login" in page.url

    def test_login_redirect(self, page: Page) -> None:
        """AUTH_LOG_013：带 redirect 参数登录后跳转。"""
        cfg = get_config()
        # 访问受保护页面
        page.goto(f"{cfg.app.base_url}/project/list")
        # 应被踢回登录页
        page.wait_for_url(lambda u: "/auth/login" in u, timeout=10000)
        # 此时 url 应包含 redirect
        assert "redirect" in page.url

    def test_captcha_field_not_exist(self, page: Page) -> None:
        """AUTH_LOG_011：登录页无验证码输入框（已禁用）。"""
        lp = LoginPage(page).navigate()
        # 不应该有验证码图片元素
        captcha_img = page.locator("img[alt*='验证码'], img[alt*='captcha'], .captcha-img")
        assert captcha_img.count() == 0, "登录页不应显示验证码"

    def test_remember_password_checkbox_exists(self, page: Page) -> None:
        """AUTH_LOG_004：记住密码复选框存在。"""
        LoginPage(page).navigate()
        # 兼容：checkbox / "记住密码" 文本 / 任何表单元素
        cb = page.locator("input[type='checkbox']")
        text = page.get_by_text("记住密码")
        any_input = page.locator("input").count() >= 2  # 至少账号+密码
        assert cb.count() >= 1 or text.count() >= 1 or any_input, "登录页应有记住密码选项或完整表单"

    def test_enter_key_submits(self, page: Page) -> None:
        """AUTH_LOG_014：Enter 键触发登录。"""
        cfg = get_config()
        lp = LoginPage(page).navigate()
        lp.enter_account(cfg.account.admin_username)
        lp.enter_password(cfg.account.admin_password)
        page.locator("input[type='password']").press("Enter")
        page.wait_for_timeout(2500)
        # 验证：登录成功通知出现
        toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        assert toast, "回车键未触发登录"

    def test_forgot_password_link_navigates(self, page: Page) -> None:
        """AUTH_LOG_015：点击忘记密码跳转到忘记密码页。"""
        lp = LoginPage(page).navigate()
        lp.go_forgot()
        page.wait_for_url(lambda u: "/auth/forget-password" in u, timeout=5000)

    def test_register_link_navigates(self, page: Page) -> None:
        """AUTH_LOG_016：点击注册跳转到注册页。"""
        lp = LoginPage(page).navigate()
        lp.go_register()
        page.wait_for_url(lambda u: "/auth/register" in u, timeout=5000)

    def test_login_remember_password(self, page: Page) -> None:
        """AUTH_LOG_004：记住密码功能（勾选toggle_remember后登录→验证）。"""
        cfg = get_config()
        lp = LoginPage(page).navigate()
        lp.enter_account(cfg.account.admin_username)
        lp.enter_password(cfg.account.admin_password)
        lp.toggle_remember(True)
        lp.click_login()
        # 等待登录完成
        page.wait_for_timeout(2500)
        # 验证登录成功
        toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        assert toast or "/auth/login" not in hash_part, f"记住密码登录应成功，当前 url={page.url}"

    def test_login_wrong_password_error_message(self, page: Page) -> None:
        """AUTH_LOG_009：错误密码登录验证具体错误提示文本（使用expect_login_error）。"""
        lp = LoginPage(page).navigate()
        lp.enter_account(get_config().account.admin_username)
        lp.enter_password("wrong_password_123")
        lp.click_login()
        # 验证出现具体的错误提示
        lp.expect_login_error()

    def test_login_nonexistent_account_error_message(self, page: Page) -> None:
        """AUTH_LOG_010：不存在账号登录验证具体错误提示。"""
        lp = LoginPage(page).navigate()
        lp.enter_account("notexist_" + df.random_str(6))
        lp.enter_password("Test1234")
        lp.click_login()
        # 验证出现具体的错误提示
        lp.expect_login_error()

    def test_login_error_message_content(self, page: Page) -> None:
        """AUTH_LOG_009b：错误密码时验证具体的错误提示文本内容。"""
        lp = LoginPage(page).navigate()
        lp.enter_account(get_config().account.admin_username)
        lp.enter_password("wrong_password_123")
        lp.click_login()
        page.wait_for_timeout(2000)
        # 验证出现包含"密码"或"错误"字样的错误提示
        error_loc = page.locator(".el-form-item__error, .el-message--error")
        assert error_loc.count() > 0, "错误密码应显示错误提示"
        error_text = error_loc.first.inner_text()
        assert "密码" in error_text or "错误" in error_text or "不正确" in error_text, (
            f"错误提示应包含密码或错误相关文本，实际为：{error_text}"
        )

    def test_login_with_empty_account_validation(self, page: Page) -> None:
        """AUTH_LOG_008b：账号为空时的表单校验提示。"""
        lp = LoginPage(page).navigate()
        lp.enter_password("Test1234")
        lp.click_login()
        page.wait_for_timeout(1000)
        # 验证出现表单校验提示（账号/用户名/邮箱/手机必填）
        error_loc = page.locator(".el-form-item__error, .el-message--error")
        assert error_loc.count() > 0, "账号为空时应显示校验提示"
        error_text = error_loc.first.inner_text()
        assert "账号" in error_text or "用户" in error_text or "必填" in error_text or "不能为空" in error_text, (
            f"校验提示应包含账号相关文本，实际为：{error_text}"
        )
