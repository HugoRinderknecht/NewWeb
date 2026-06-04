"""
登录页面

对应路径：/auth/login

UI 元素（来自 前端页面UI详细说明 §认证）：
- 账号输入框（用户名/邮箱/手机号）
- 密码输入框
- "记住密码" 复选框
- "登录" 按钮
- "忘记密码？" 链接
- "注册" 链接
- 验证码已禁用（不在页面中）
"""
from __future__ import annotations

from playwright.sync_api import Page

from pages.base_page import BasePage
from core.constants import Route


class LoginPage(BasePage):
    PATH = Route.LOGIN
    TITLE_KEYWORDS = ("登录", "DreamCraft")

    # 选择器
    SEL_ACCOUNT_INPUT = "input[placeholder*='账号'], input[placeholder*='用户名'], input[placeholder*='邮箱'], input[placeholder*='手机']"
    SEL_PASSWORD_INPUT = "input[type='password']"
    SEL_REMEMBER = "input[type='checkbox']"
    SEL_LOGIN_BTN = "button:has-text('登 录'), button:has-text('登录')"
    SEL_FORGOT_LINK = "a:has-text('忘记密码')"
    SEL_REGISTER_LINK = "a:has-text('注 册'), a:has-text('注册')"
    SEL_ERROR_MSG = ".el-form-item__error, .el-message--error"
    SEL_AGREEMENT = "input[type='checkbox']"  # 注册页用

    def enter_account(self, account: str) -> "LoginPage":
        self.fill(self.SEL_ACCOUNT_INPUT, account)
        return self

    def enter_password(self, password: str) -> "LoginPage":
        self.fill(self.SEL_PASSWORD_INPUT, password)
        return self

    def toggle_remember(self, checked: bool = True) -> "LoginPage":
        cb = self.page.locator(self.SEL_REMEMBER).first
        if cb.is_checked() != checked:
            cb.click()
        return self

    def click_login(self) -> None:
        self.click(self.SEL_LOGIN_BTN)

    def login(self, account: str, password: str, remember: bool = False) -> None:
        """完整登录流程。"""
        self.enter_account(account)
        self.enter_password(password)
        if remember:
            self.toggle_remember(True)
        self.click_login()
        # 前端为 hash 路由：登录后通过等业务接口或页面元素判断
        self._wait_login_complete()

    def _wait_login_complete(self, timeout: int = 15000) -> None:
        """等待登录完成：等业务页元素出现 或 URL 离开 login。"""
        # 等待 POST /api/auth/login 后续 /api/auth/me 完成（业务接口表明登录成功）
        try:
            with self.page.expect_response(
                lambda r: "/api/auth/me" in r.url and r.status == 200,
                timeout=timeout,
            ):
                pass
        except Exception:
            pass
        # 再等待页面加载完成
        try:
            self.page.wait_for_load_state("networkidle", timeout=5000)
        except Exception:
            pass

    def expect_login_success(self) -> None:
        """断言：登录成功（hash-aware）。"""
        self._wait_login_complete()

    def expect_login_error(self, hint: str = "") -> None:
        """断言：出现错误提示。"""
        if hint:
            self.page.get_by_text(hint).first.wait_for(state="visible", timeout=5000)
        else:
            self.page.locator(self.SEL_ERROR_MSG).first.wait_for(state="visible", timeout=5000)

    def go_register(self) -> None:
        self.click(self.SEL_REGISTER_LINK)

    def go_forgot(self) -> None:
        self.click(self.SEL_FORGOT_LINK)
