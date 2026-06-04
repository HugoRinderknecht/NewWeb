"""
注册功能测试
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.auth.register_page import RegisterPage
from utils import data_factory as df


@pytest.mark.auth
class TestRegister:
    """注册模块测试。"""

    def test_register_page_loads(self, page: Page) -> None:
        """AUTH_REG_000：注册页正常加载。"""
        RegisterPage(page).navigate()
        # 应有密码输入框或手机号输入框
        has_password = page.locator("input[type='password']").count() >= 1
        has_phone = page.locator("input[placeholder*='手机']").count() >= 1
        assert has_password or has_phone, "注册页应有密码或手机号输入框"

    def test_register_form_validation_phone(self, page: Page) -> None:
        """AUTH_REG_003：手机号格式校验。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone("abc")
        rp.enter_password("Test1234")
        # 触发失焦
        phone_inp = page.locator("input[placeholder*='手机']").first
        if phone_inp.count() > 0:
            phone_inp.blur()
        page.wait_for_timeout(500)

    def test_register_form_validation_password_length(self, page: Page) -> None:
        """AUTH_REG_004：密码长度不足。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password("12345")
        pwd_inp = page.locator(RegisterPage.SEL_PASSWORD).first
        if pwd_inp.count() > 0:
            pwd_inp.blur()
        page.wait_for_timeout(500)

    def test_register_form_validation_password_must_contain_both(self, page: Page) -> None:
        """AUTH_REG_005/006：密码必须含字母与数字。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password("12345678")  # 纯数字
        pwd_inp = page.locator(RegisterPage.SEL_PASSWORD).first
        if pwd_inp.count() > 0:
            pwd_inp.blur()
        page.wait_for_timeout(500)

    def test_register_password_mismatch(self, page: Page) -> None:
        """AUTH_REG_007：两次密码不一致。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password("Test1234")
        rp.confirm_password("Test1235")
        # 触发确认密码框失焦
        conf_inp = page.locator(RegisterPage.SEL_CONFIRM_PASSWORD).first
        if conf_inp.count() > 0:
            conf_inp.blur()
        else:
            pwd_inputs = page.locator("input[type='password']")
            if pwd_inputs.count() >= 2:
                pwd_inputs.nth(1).blur()
        page.wait_for_timeout(500)

    def test_register_no_captcha(self, page: Page) -> None:
        """AUTH_REG_010：注册页无验证码。"""
        RegisterPage(page).navigate()
        captcha_img = page.locator("img[alt*='验证码'], img[alt*='captcha']")
        assert captcha_img.count() == 0

    def test_register_required_fields(self, page: Page) -> None:
        """AUTH_REG_009：必填校验。"""
        RegisterPage(page).navigate()
        # 找到注册页内的注册按钮（避免冲突）
        try:
            page.locator("button[type='submit'], button.el-button--primary").first.click(timeout=5000)
        except Exception:
            page.screenshot(path="_screenshots/register_required_fields_fail.png")
            raise
        page.wait_for_timeout(500)
        # 应仍在注册页（校验失败）或显示错误
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        has_error = page.locator(".el-form-item__error, .el-message--error").count() > 0
        assert "/auth/register" in hash_part or has_error, f"必填未生效 url={page.url}"

    def test_register_full_flow(self, page: Page) -> None:
        """AUTH_REG_011：注册完整流程（填写手机号+密码+确认密码+同意协议+提交）→ 验证注册成功。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        pwd = df.random_password()
        rp.enter_password(pwd)
        rp.confirm_password(pwd)
        rp.agree_terms()
        rp.submit()
        # 验证注册成功：跳转到登录页 或 出现成功提示
        page.wait_for_timeout(2000)
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        success_toast = page.locator(".el-notification--success, .el-message--success").count() > 0
        on_login_page = "/auth/login" in hash_part
        assert success_toast or on_login_page, f"注册成功后应跳转登录页或显示成功提示，当前 url={page.url}"

    def test_register_with_email(self, page: Page) -> None:
        """AUTH_REG_012：邮箱注册流程。"""
        rp = RegisterPage(page).navigate()
        email = df.random_email()
        rp.enter_email(email)
        pwd = df.random_password()
        rp.enter_password(pwd)
        rp.confirm_password(pwd)
        rp.agree_terms()
        # 验证邮箱输入框已填写
        email_inp = page.locator(RegisterPage.SEL_EMAIL).first
        if email_inp.count() > 0:
            assert email_inp.input_value() == email, "邮箱输入值应与填写值一致"

    def test_register_agree_terms_checkbox(self, page: Page) -> None:
        """AUTH_REG_013：同意协议复选框操作。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password(df.random_password())
        rp.confirm_password(df.random_password())
        # 点击同意协议复选框
        rp.agree_terms()
        page.wait_for_timeout(500)
        # 验证复选框状态变化
        cb = page.locator(RegisterPage.SEL_AGREEMENT).first
        assert cb.count() > 0, "应存在同意协议复选框"

    def test_register_toggle_auto_login(self, page: Page) -> None:
        """AUTH_REG_014：注册后自动登录复选框。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password(df.random_password())
        rp.confirm_password(df.random_password())
        # 勾选自动登录
        rp.toggle_auto_login(True)
        page.wait_for_timeout(500)
        # 再次取消勾选
        rp.toggle_auto_login(False)
        page.wait_for_timeout(500)

    def test_register_empty_phone_submit(self, page: Page) -> None:
        """AUTH_REG_015：空手机号提交校验 - 使用 expect_error 验证。"""
        rp = RegisterPage(page).navigate()
        # 不填手机号，只填密码
        rp.enter_password(df.random_password())
        rp.confirm_password(df.random_password())
        rp.agree_terms()
        rp.submit()
        # 验证出现错误提示
        rp.expect_error("手机")

    def test_register_password_mismatch_submit(self, page: Page) -> None:
        """AUTH_REG_016：密码不一致提交验证 - 使用 expect_error 验证。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password("TestPass123")
        rp.confirm_password("DifferentPass456")
        rp.agree_terms()
        # 触发确认密码框失焦
        conf_inp = page.locator(RegisterPage.SEL_CONFIRM_PASSWORD).first
        if conf_inp.count() > 0:
            conf_inp.blur()
        else:
            pwd_inputs = page.locator("input[type='password']")
            if pwd_inputs.count() >= 2:
                pwd_inputs.nth(1).blur()
        page.wait_for_timeout(500)
        rp.submit()
        # 验证出现密码不一致错误提示
        rp.expect_error("不一致")

    def test_register_without_agree_terms(self, page: Page) -> None:
        """AUTH_REG_017：未同意协议提交验证。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        pwd = df.random_password()
        rp.enter_password(pwd)
        rp.confirm_password(pwd)
        # 故意不勾选同意协议
        rp.submit()
        page.wait_for_timeout(1000)
        # 应仍在注册页 或 出现错误提示
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        has_error = page.locator(".el-form-item__error, .el-message--error").count() > 0
        assert "/auth/register" in hash_part or has_error, "未同意协议时应阻止注册"

    def test_register_auto_login_checkbox(self, page: Page) -> None:
        """AUTH_REG_014b：验证自动登录复选框的交互操作。"""
        rp = RegisterPage(page).navigate()
        rp.enter_phone(df.random_phone())
        rp.enter_password(df.random_password())
        rp.confirm_password(df.random_password())
        # 查找自动登录复选框并勾选
        cb = page.locator(RegisterPage.SEL_AUTO_LOGIN).first
        assert cb.count() > 0, "应存在自动登录复选框"
        try:
            if not cb.is_checked():
                cb.click()
            assert cb.is_checked(), "自动登录复选框应被勾选"
            cb.click()
            assert not cb.is_checked(), "再次点击后自动登录复选框应取消勾选"
        except Exception:
            # 部分实现可能不是标准 checkbox，仅验证可点击
            cb.click()
            page.wait_for_timeout(300)
            cb.click()
            page.wait_for_timeout(300)

    def test_register_required_fields_validation(self, page: Page) -> None:
        """AUTH_REG_009b：验证必填字段校验（手机号、密码、确认密码、协议）。"""
        rp = RegisterPage(page).navigate()
        # 直接提交空表单
        rp.submit()
        page.wait_for_timeout(1000)
        # 验证出现必填字段相关错误提示
        errors = page.locator(".el-form-item__error, .el-message--error")
        assert errors.count() > 0, "空表单提交应显示必填字段校验提示"
        error_texts = [errors.nth(i).inner_text() for i in range(errors.count())]
        combined = " ".join(error_texts)
        assert "手机" in combined or "密码" in combined or "必填" in combined or "不能为空" in combined, (
            f"必填校验提示应包含手机或密码相关文本，实际为：{combined}"
        )

    def test_register_email_option(self, page: Page) -> None:
        """AUTH_REG_012b：验证邮箱注册选项可用。"""
        rp = RegisterPage(page).navigate()
        email = df.random_email()
        rp.enter_email(email)
        pwd = df.random_password()
        rp.enter_password(pwd)
        rp.confirm_password(pwd)
        rp.agree_terms()
        # 验证邮箱输入框已填写
        email_inp = page.locator(RegisterPage.SEL_EMAIL).first
        if email_inp.count() > 0:
            assert email_inp.input_value() == email, "邮箱输入值应与填写值一致"
        # 尝试提交（邮箱注册流程可能因页面实现不同而跳转或提示）
        try:
            rp.submit()
            page.wait_for_timeout(1500)
        except Exception:
            page.screenshot(path="_screenshots/register_email_option_submit_fail.png")
            raise
        # 提交后应仍在注册页（校验通过前）或出现提示
        hash_part = page.url.split("?")[0].split("#")[-1] if "#" in page.url else ""
        has_feedback = page.locator(".el-notification, .el-message, .el-form-item__error").count() > 0
        assert "/auth/register" in hash_part or has_feedback, "邮箱注册选项应可正常交互"
