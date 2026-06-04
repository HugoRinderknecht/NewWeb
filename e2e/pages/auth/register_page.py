"""
注册页面

路径：/auth/register

UI 元素：
- 手机号 / 邮箱 / 密码 / 确认密码
- 同意协议复选框
- 注册按钮
- "注册后自动登录" 复选框
"""
from __future__ import annotations

from pages.base_page import BasePage
from core.constants import Route


class RegisterPage(BasePage):
    PATH = Route.REGISTER

    SEL_PHONE = "input[placeholder*='手机']"
    SEL_EMAIL = "input[placeholder*='邮箱']"
    SEL_PASSWORD = "input[placeholder*='密码']:not([placeholder*='确认']):not([placeholder*='再次'])"
    SEL_AGREEMENT = ".el-checkbox"
    SEL_AUTO_LOGIN = ".el-checkbox:has-text('自动登录')"
    SEL_CONFIRM_PASSWORD = "input[placeholder*='确认密码'], input[placeholder*='再次'], input[placeholder*='重复']"
    SEL_REGISTER_BTN = "button:has-text('注 册'), button:has-text('注册')"
    SEL_GO_LOGIN = "a:has-text('登录')"

    def enter_phone(self, phone: str) -> "RegisterPage":
        self.fill(self.SEL_PHONE, phone)
        return self

    def enter_email(self, email: str) -> "RegisterPage":
        self.fill(self.SEL_EMAIL, email)
        return self

    def enter_password(self, password: str) -> "RegisterPage":
        self.fill(self.SEL_PASSWORD, password)
        return self

    def confirm_password(self, password: str) -> "RegisterPage":
        # 确认密码框
        conf = self.page.locator(self.SEL_CONFIRM_PASSWORD).first
        if conf.count() > 0:
            conf.fill(password)
        else:
            # 兜底：第二个 password 输入框
            pwds = self.page.locator("input[type='password']")
            if pwds.count() >= 2:
                pwds.nth(1).fill(password)
        return self

    def agree_terms(self) -> "RegisterPage":
        self.page.locator(self.SEL_AGREEMENT).first.click()
        return self

    def toggle_auto_login(self, on: bool = True) -> "RegisterPage":
        cb = self.page.get_by_text("自动登录").first
        cb.click()
        return self

    def submit(self) -> None:
        self.click(self.SEL_REGISTER_BTN)

    def expect_error(self, hint: str) -> None:
        self.page.get_by_text(hint).first.wait_for(state="visible", timeout=5000)
