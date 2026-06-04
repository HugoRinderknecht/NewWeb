"""
忘记密码页面

路径：/auth/forget-password

UI：
- 邮箱输入
- 发送验证码按钮（60s 倒计时）
- 验证码输入
- 新密码
- 确认新密码
- 重置密码按钮
"""
from __future__ import annotations

from pages.base_page import BasePage
from core.constants import Route


class ForgetPasswordPage(BasePage):
    PATH = Route.FORGET_PASSWORD

    SEL_EMAIL = "input[placeholder*='邮箱']"
    SEL_SEND_CODE = "button:has-text('发送验证码'), button:has-text('获取验证码')"
    SEL_CODE = "input[placeholder*='验证码']"
    SEL_PASSWORD = "input[placeholder*='新密码'], input[type='password']"
    SEL_SUBMIT = "button:has-text('重置密码'), button:has-text('确 认'), button:has-text('确认')"
    SEL_GO_LOGIN = "a:has-text('返回登录'), a:has-text('登录')"

    def enter_email(self, email: str) -> "ForgetPasswordPage":
        self.fill(self.SEL_EMAIL, email)
        return self

    def send_code(self) -> None:
        self.click(self.SEL_SEND_CODE)
        # 倒计时 60s，按钮变为禁用
        import time
        time.sleep(1)

    def enter_code(self, code: str) -> "ForgetPasswordPage":
        self.fill(self.SEL_CODE, code)
        return self

    def enter_new_password(self, pwd: str) -> "ForgetPasswordPage":
        # 第一个 password 输入为新密码
        self.page.locator("input[type='password']").first.fill(pwd)
        return self

    def confirm_new_password(self, pwd: str) -> "ForgetPasswordPage":
        pwd_inputs = self.page.locator("input[type='password']")
        if pwd_inputs.count() >= 2:
            pwd_inputs.nth(1).fill(pwd)
        return self

    def submit(self) -> None:
        self.click(self.SEL_SUBMIT)

    def expect_sent(self) -> None:
        """断言：发送成功提示。"""
        self.page.get_by_text("已发送").first.wait_for(state="visible", timeout=5000)
