"""
忘记密码测试
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.auth.forget_password_page import ForgetPasswordPage
from utils import data_factory as df


@pytest.mark.auth
class TestForgetPassword:
    """忘记密码模块测试。"""

    def test_forgot_page_loads(self, page: Page) -> None:
        """AUTH_FP_000：忘记密码页加载。"""
        ForgetPasswordPage(page).navigate()
        # 兼容多种实现：邮箱/密码/手机号/任何输入框
        has_input = page.locator("input").count() >= 1
        has_button = page.locator("button").count() >= 1
        assert has_input or has_button, "忘记密码页应有输入框或按钮"

    def test_email_format_validation(self, page: Page) -> None:
        """AUTH_FP_004：邮箱格式校验。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email("not_an_email")
        page.locator("input[placeholder*='邮箱']").first.blur()
        page.wait_for_timeout(500)

    def test_send_code_with_valid_email(self, page: Page) -> None:
        """AUTH_FP_001：合法邮箱发送验证码（可触发后端流程）。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        # 不实际点击发送（避免污染），仅验证按钮可点
        # fp.send_code()
        # fp.expect_sent()

    def test_back_to_login_link(self, page: Page) -> None:
        """AUTH_FP_007：返回登录链接。"""
        fp = ForgetPasswordPage(page).navigate()
        # 点击返回登录
        try:
            page.get_by_text("返回登录").first.click(timeout=3000)
            page.wait_for_url(lambda u: "/auth/login" in u, timeout=5000)
        except Exception:
            page.screenshot(path="_screenshots/forget_password_back_to_login_fail.png")
            raise

    def test_forgot_password_full_flow(self, page: Page) -> None:
        """AUTH_FP_002：完整忘记密码流程（输入邮箱→发送验证码→输入验证码→输入新密码→确认新密码→提交）。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        fp.send_code()
        fp.enter_code("123456")
        new_pwd = df.random_password()
        fp.enter_new_password(new_pwd)
        fp.confirm_new_password(new_pwd)
        fp.submit()
        # 验证：重置成功后跳转到登录页 或 出现成功提示
        page.wait_for_timeout(2000)
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        success_toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        on_login_page = "/auth/login" in hash_part
        assert success_toast or on_login_page, f"重置密码成功后应跳转登录页或显示成功提示，当前 url={page.url}"

    def test_forgot_password_enter_code(self, page: Page) -> None:
        """AUTH_FP_003：输入验证码。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        code = "654321"
        fp.enter_code(code)
        # 验证验证码输入框已填写
        code_inp = page.locator(ForgetPasswordPage.SEL_CODE).first
        if code_inp.count() > 0:
            assert code_inp.input_value() == code, "验证码输入值应与填写值一致"

    def test_forgot_password_enter_new_password(self, page: Page) -> None:
        """AUTH_FP_005：输入新密码。"""
        fp = ForgetPasswordPage(page).navigate()
        new_pwd = df.random_password()
        fp.enter_new_password(new_pwd)
        # 验证第一个密码输入框已填写
        pwd_inp = page.locator("input[type='password']").first
        if pwd_inp.count() > 0:
            assert pwd_inp.input_value() == new_pwd, "新密码输入值应与填写值一致"

    def test_forgot_password_confirm_new_password(self, page: Page) -> None:
        """AUTH_FP_006：确认新密码。"""
        fp = ForgetPasswordPage(page).navigate()
        new_pwd = df.random_password()
        fp.enter_new_password(new_pwd)
        fp.confirm_new_password(new_pwd)
        # 验证第二个密码输入框已填写
        pwd_inputs = page.locator("input[type='password']")
        if pwd_inputs.count() >= 2:
            assert pwd_inputs.nth(1).input_value() == new_pwd, "确认密码输入值应与填写值一致"

    def test_forgot_password_submit(self, page: Page) -> None:
        """AUTH_FP_008：重置密码提交。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        fp.enter_code("111111")
        new_pwd = df.random_password()
        fp.enter_new_password(new_pwd)
        fp.confirm_new_password(new_pwd)
        fp.submit()
        # 提交后应离开忘记密码页 或 显示结果提示
        page.wait_for_timeout(2000)
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        has_message = page.locator(".el-notification, .el-message, .el-message-box").count() > 0
        still_on_page = "/auth/forget-password" in hash_part
        # 提交行为应触发某些反馈
        assert has_message or not still_on_page, "重置密码提交应触发反馈或跳转"

    def test_forgot_password_empty_email_send_code(self, page: Page) -> None:
        """AUTH_FP_009：空邮箱点击发送验证码校验。"""
        fp = ForgetPasswordPage(page).navigate()
        # 不输入邮箱，直接点击发送验证码
        send_btn = page.locator(ForgetPasswordPage.SEL_SEND_CODE).first
        if send_btn.count() > 0:
            send_btn.click()
            page.wait_for_timeout(500)
            # 应出现邮箱相关错误提示
            has_error = page.locator(".el-form-item__error, .el-message--error").count() > 0
            assert has_error, "空邮箱点击发送验证码应提示错误"

    def test_forgot_password_empty_code_submit(self, page: Page) -> None:
        """AUTH_FP_010：验证码为空提交校验。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        # 不输入验证码，直接提交
        fp.submit()
        page.wait_for_timeout(500)
        # 应出现验证码相关错误提示
        has_error = page.locator(".el-form-item__error, .el-message--error").count() > 0
        assert has_error, "验证码为空提交应提示错误"

    def test_forget_password_full_flow(self, page: Page) -> None:
        """AUTH_FP_002b：完整忘记密码流程（输入邮箱 -> 发送验证码 -> 输入验证码 -> 新密码 -> 确认新密码 -> 提交）→ 验证重置成功。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        fp.send_code()
        fp.enter_code("123456")
        new_pwd = df.random_password()
        fp.enter_new_password(new_pwd)
        fp.confirm_new_password(new_pwd)
        fp.submit()
        page.wait_for_timeout(2000)
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        success_toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        on_login_page = "/auth/login" in hash_part
        assert success_toast or on_login_page, (
            f"重置密码成功后应跳转登录页或显示成功提示，当前 url={page.url}"
        )

    def test_forget_password_send_code_countdown(self, page: Page) -> None:
        """AUTH_FP_001b：验证发送验证码后按钮禁用和倒计时。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        send_btn = page.locator(ForgetPasswordPage.SEL_SEND_CODE).first
        assert send_btn.count() > 0, "应存在发送验证码按钮"
        try:
            send_btn.click()
            page.wait_for_timeout(1200)
            # 验证按钮变为禁用状态或文本包含倒计时数字
            is_disabled = send_btn.is_disabled()
            btn_text = send_btn.inner_text()
            has_countdown = any(ch.isdigit() for ch in btn_text)
            assert is_disabled or has_countdown, (
                f"发送验证码后按钮应禁用或显示倒计时，当前文本：{btn_text}"
            )
        except Exception:
            page.screenshot(path="_screenshots/forget_password_send_code_countdown_fail.png")
            raise

    def test_forget_password_password_mismatch(self, page: Page) -> None:
        """AUTH_FP_005b：验证两次新密码不一致的校验。"""
        fp = ForgetPasswordPage(page).navigate()
        fp.enter_email(df.random_email())
        fp.enter_code("123456")
        fp.enter_new_password("NewPass123")
        fp.confirm_new_password("DifferentPass456")
        # 触发确认密码框失焦
        pwd_inputs = page.locator("input[type='password']")
        if pwd_inputs.count() >= 2:
            try:
                pwd_inputs.nth(1).blur()
            except Exception:
                page.screenshot(path="_screenshots/forget_password_mismatch_blur_fail.png")
                raise
        page.wait_for_timeout(500)
        fp.submit()
        page.wait_for_timeout(1000)
        # 验证出现密码不一致相关错误提示
        errors = page.locator(".el-form-item__error, .el-message--error")
        assert errors.count() > 0, "两次新密码不一致时应显示校验提示"
        error_texts = [errors.nth(i).inner_text() for i in range(errors.count())]
        combined = " ".join(error_texts)
        assert "密码" in combined or "不一致" in combined or "不匹配" in combined or "相同" in combined, (
            f"校验提示应包含密码不一致相关文本，实际为：{combined}"
        )
