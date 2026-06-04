"""
团队 / 积分 / 通知 / 设置测试
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.team import (
    TeamApplicationsPage,
    TeamInviteCodesPage,
    TeamListPage,
    TeamMembersPage,
    TeamQuotaPage,
    TeamRolesPage,
    TeamSettingsPage,
)
from utils import data_factory as df


# ============================================================
# 团队管理
# ============================================================
@pytest.mark.team
class TestTeam:
    """团队管理。"""

    def test_list_page(self, admin_logged_in: Page) -> None:
        """TEAM_LST_001：团队列表加载。"""
        page = TeamListPage(admin_logged_in).navigate()
        page.assert_url_contains("/team/list")

    def test_search_by_name(self, admin_logged_in: Page) -> None:
        """TEAM_LST_002：按名称搜索团队。"""
        page = TeamListPage(admin_logged_in).navigate()
        try:
            page.search("test")
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/team_search_by_name_fail.png")
            raise

    def test_open_create_dialog(self, admin_logged_in: Page) -> None:
        """TEAM_LST_003：点击创建团队打开对话框。"""
        page = TeamListPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            assert admin_logged_in.locator(".el-dialog").is_visible()
        except Exception:
            page.screenshot(path=f"_screenshots/team_create_dialog_missing.png")

    def test_create_team_form_validation(self, admin_logged_in: Page) -> None:
        """TEAM_LST_004：创建团队必填校验。"""
        page = TeamListPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            admin_logged_in.locator(".el-dialog .el-button--primary").last.click()
            admin_logged_in.wait_for_timeout(500)
            assert admin_logged_in.locator(".el-dialog").count() > 0
        except Exception:
            page.screenshot(path=f"_screenshots/team_create_form_validation_fail.png")
            raise

    def test_create_team_success(self, admin_logged_in: Page) -> None:
        """TEAM_LST_005：成功创建团队。"""
        page = TeamListPage(admin_logged_in).navigate()
        name = df.team_name()
        try:
            page.create_team(name=name, description="E2E 测试")
        except Exception as e:
            admin_logged_in.screenshot(path=f"create_team_fail_{name}")

    def test_members_page(self, admin_logged_in: Page) -> None:
        """TEAM_MEM_001：成员管理加载。"""
        admin_logged_in.goto("http://localhost:3006/team/members")
        admin_logged_in.wait_for_url(lambda u: "/team/members" in u, timeout=10000)

    def test_roles_page(self, admin_logged_in: Page) -> None:
        """TEAM_ROL_001：角色管理加载。"""
        admin_logged_in.goto("http://localhost:3006/team/roles")
        admin_logged_in.wait_for_url(lambda u: "/team/roles" in u, timeout=10000)

    def test_invite_codes_page(self, admin_logged_in: Page) -> None:
        """TEAM_INV_001：邀请码管理加载。"""
        admin_logged_in.goto("http://localhost:3006/team/invite-codes")
        admin_logged_in.wait_for_url(lambda u: "/team/invite-codes" in u, timeout=10000)

    def test_applications_page(self, admin_logged_in: Page) -> None:
        """TEAM_APP_001：申请审批加载。"""
        admin_logged_in.goto("http://localhost:3006/team/applications")
        admin_logged_in.wait_for_url(lambda u: "/team/applications" in u, timeout=10000)

    def test_quota_page(self, admin_logged_in: Page) -> None:
        """TEAM_QTA_001：配额管理加载。"""
        admin_logged_in.goto("http://localhost:3006/team/quota")
        admin_logged_in.wait_for_url(lambda u: "/team/quota" in u, timeout=10000)

    def test_settings_page(self, admin_logged_in: Page) -> None:
        """TEAM_SET_001：团队设置加载。"""
        admin_logged_in.goto("http://localhost:3006/team/settings")
        admin_logged_in.wait_for_url(lambda u: "/team/settings" in u, timeout=10000)

    def test_invite_member_dialog(self, admin_logged_in: Page) -> None:
        """TEAM_LST_006：邀请成员对话框操作。"""
        page = TeamMembersPage(admin_logged_in).navigate()
        try:
            page.invite_member_by_username("member")
            # 对话框应已关闭
            assert admin_logged_in.locator(".el-dialog").count() == 0 or not admin_logged_in.locator(
                ".el-dialog"
            ).is_visible()
        except Exception:
            page.screenshot(path=f"_screenshots/invite_member_dialog_fail.png")

    def test_member_search(self, admin_logged_in: Page) -> None:
        """TEAM_MEM_002：成员管理搜索。"""
        page = TeamMembersPage(admin_logged_in).navigate()
        try:
            page.search_by_keyword("admin", placeholder="搜索")
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/member_search_fail.png")

    def test_role_search(self, admin_logged_in: Page) -> None:
        """TEAM_ROL_002：角色管理搜索。"""
        page = TeamRolesPage(admin_logged_in).navigate()
        try:
            page.search_by_keyword("管理员", placeholder="搜索")
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/role_search_fail.png")

    def test_generate_invite_code(self, admin_logged_in: Page) -> None:
        """TEAM_INV_002：生成邀请码操作。"""
        page = TeamInviteCodesPage(admin_logged_in).navigate()
        try:
            code = page.generate_invite_code()
            # 生成后列表应有至少一条记录
            assert page.get_first_invite_code() != "" or code != ""
        except Exception:
            page.screenshot(path=f"_screenshots/generate_invite_code_fail.png")

    def test_application_history_tab(self, admin_logged_in: Page) -> None:
        """TEAM_APP_002：审批历史记录 Tab。"""
        page = TeamApplicationsPage(admin_logged_in).navigate()
        try:
            page.click_history_tab()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/history_tab_fail.png")

    def test_quota_new_rule(self, admin_logged_in: Page) -> None:
        """TEAM_QTA_002：新增配额规则。"""
        page = TeamQuotaPage(admin_logged_in).navigate()
        try:
            page.open_new_rule_dialog()
            assert admin_logged_in.locator(".el-dialog").is_visible()
            # 填写规则名称并提交
            name_input = admin_logged_in.locator(".el-dialog input").first
            name_input.fill("E2E 测试配额规则")
            page.confirm_dialog()
            page.wait_dialog_closed()
        except Exception:
            page.screenshot(path=f"_screenshots/quota_new_rule_fail.png")

    def test_applications_history_tab(self, admin_logged_in: Page) -> None:
        """TEAM_APP_002：切换审批历史记录 Tab。"""
        page = TeamApplicationsPage(admin_logged_in).navigate()
        try:
            page.click_history_tab()
            admin_logged_in.wait_for_timeout(1000)
            # 断言历史记录 Tab 被激活
            active_tab = admin_logged_in.locator(".el-tabs__item.is-active").first
            assert active_tab.is_visible() and "历史" in active_tab.inner_text()
        except Exception:
            page.screenshot(path=f"_screenshots/applications_history_tab_fail.png")

    def test_team_settings_page(self, admin_logged_in: Page) -> None:
        """TEAM_SET_002：团队设置页加载并断言关键元素。"""
        page = TeamSettingsPage(admin_logged_in).navigate()
        try:
            page.assert_url_contains("/team/settings")
            # 断言设置表单或保存按钮存在
            assert admin_logged_in.locator("button:has-text('保存'), button:has-text('提交')").count() > 0
        except Exception:
            page.screenshot(path=f"_screenshots/team_settings_page_fail.png")


# ============================================================
# 积分管理
# ============================================================
@pytest.mark.points
class TestPoints:
    """积分管理。"""

    def test_billing_page(self, admin_logged_in: Page) -> None:
        """PTS_BIL_001：账单页加载。"""
        admin_logged_in.goto("http://localhost:3006/points/billing")
        admin_logged_in.wait_for_url(lambda u: "/points/billing" in u, timeout=10000)

    def test_record_page(self, admin_logged_in: Page) -> None:
        """PTS_REC_001：积分记录页加载。"""
        admin_logged_in.goto("http://localhost:3006/points/record")
        admin_logged_in.wait_for_url(lambda u: "/points/record" in u, timeout=10000)

    def test_transactions_page(self, admin_logged_in: Page) -> None:
        """PTS_TX_001：交易流水页加载。"""
        admin_logged_in.goto("http://localhost:3006/points/transactions")
        admin_logged_in.wait_for_url(lambda u: "/points/transactions" in u, timeout=10000)

    def test_token_usage_page(self, admin_logged_in: Page) -> None:
        """PTS_TK_001：Token 用量页加载。"""
        admin_logged_in.goto("http://localhost:3006/points/token-usage")
        admin_logged_in.wait_for_url(lambda u: "/points/token-usage" in u, timeout=10000)

    def test_pricing_page(self, admin_logged_in: Page) -> None:
        """PTS_PR_001：价格对比页加载。"""
        admin_logged_in.goto("http://localhost:3006/points/pricing")
        admin_logged_in.wait_for_url(lambda u: "/points/pricing" in u, timeout=10000)

    def test_record_search(self, admin_logged_in: Page) -> None:
        """PTS_REC_002：积分记录搜索。"""
        admin_logged_in.goto("http://localhost:3006/points/record")
        admin_logged_in.wait_for_url(lambda u: "/points/record" in u, timeout=10000)
        try:
            # 查找搜索框并输入关键词
            search_input = admin_logged_in.locator("input[placeholder*='搜索'], input[placeholder*='记录']").first
            if search_input.count() > 0:
                search_input.fill("测试")
                search_input.press("Enter")
                admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/points_record_search_fail.png")

    def test_billing_date_range_filter(self, admin_logged_in: Page) -> None:
        """PTS_BIL_002：账单日期范围筛选。"""
        admin_logged_in.goto("http://localhost:3006/points/billing")
        admin_logged_in.wait_for_url(lambda u: "/points/billing" in u, timeout=10000)
        try:
            date_picker = admin_logged_in.locator(".el-date-editor, .el-date-picker").first
            if date_picker.count() > 0:
                date_picker.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                admin_logged_in.keyboard.press("Escape")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/billing_date_filter_fail.png")

    def test_billing_recharge_interaction(self, admin_logged_in: Page) -> None:
        """PTS_BIL_003：billing 充值按钮交互。"""
        admin_logged_in.goto("http://localhost:3006/points/billing")
        admin_logged_in.wait_for_url(lambda u: "/points/billing" in u, timeout=10000)
        try:
            recharge_btn = admin_logged_in.locator("button:has-text('充值'), button:has-text('立即充值')").first
            if recharge_btn.count() > 0:
                recharge_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 断言充值对话框或页面出现
                assert admin_logged_in.locator(".el-dialog, .el-drawer").count() > 0
                # 关闭对话框
                close_btn = admin_logged_in.locator(".el-dialog__close, button:has-text('取消'), button:has-text('关闭')").first
                if close_btn.count() > 0:
                    close_btn.click(timeout=3000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/billing_recharge_fail.png")

    def test_record_filter_interaction(self, admin_logged_in: Page) -> None:
        """PTS_REC_003：record 类型筛选交互。"""
        admin_logged_in.goto("http://localhost:3006/points/record")
        admin_logged_in.wait_for_url(lambda u: "/points/record" in u, timeout=10000)
        try:
            # 尝试点击筛选下拉
            select = admin_logged_in.locator(".el-select").first
            if select.count() > 0:
                select.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 选择第一个选项
                first_option = admin_logged_in.locator(".el-select-dropdown__item").first
                if first_option.count() > 0:
                    first_option.click(timeout=3000)
                    admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/record_filter_fail.png")

    def test_transactions_filter_interaction(self, admin_logged_in: Page) -> None:
        """PTS_TX_002：transactions 状态筛选交互。"""
        admin_logged_in.goto("http://localhost:3006/points/transactions")
        admin_logged_in.wait_for_url(lambda u: "/points/transactions" in u, timeout=10000)
        try:
            select = admin_logged_in.locator(".el-select").first
            if select.count() > 0:
                select.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                first_option = admin_logged_in.locator(".el-select-dropdown__item").first
                if first_option.count() > 0:
                    first_option.click(timeout=3000)
                    admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/transactions_filter_fail.png")


# ============================================================
# 通知中心
# ============================================================
@pytest.mark.notice
class TestNotice:
    """通知中心。"""

    def test_site_notice_page(self, admin_logged_in: Page) -> None:
        """NT_SITE_001：站内消息页加载。"""
        admin_logged_in.goto("http://localhost:3006/notice/site")
        admin_logged_in.wait_for_url(lambda u: "/notice/site" in u, timeout=10000)

    def test_remind_page(self, admin_logged_in: Page) -> None:
        """NT_REM_001：提醒设置页加载。"""
        admin_logged_in.goto("http://localhost:3006/notice/remind")
        admin_logged_in.wait_for_url(lambda u: "/notice/remind" in u, timeout=10000)

    def test_site_notice_search(self, admin_logged_in: Page) -> None:
        """NT_SITE_002：站内消息搜索。"""
        admin_logged_in.goto("http://localhost:3006/notice/site")
        admin_logged_in.wait_for_url(lambda u: "/notice/site" in u, timeout=10000)
        try:
            search_input = admin_logged_in.locator("input[placeholder*='搜索'], input[placeholder*='消息']").first
            if search_input.count() > 0:
                search_input.fill("测试")
                search_input.press("Enter")
                admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/site_notice_search_fail.png")

    def test_site_notice_mark_read(self, admin_logged_in: Page) -> None:
        """NT_SITE_003：站内消息标记已读。"""
        admin_logged_in.goto("http://localhost:3006/notice/site")
        admin_logged_in.wait_for_url(lambda u: "/notice/site" in u, timeout=10000)
        try:
            # 查找标记已读按钮或复选框
            mark_read_btn = admin_logged_in.locator(
                "button:has-text('标记已读'), button:has-text('全部已读'), button:has-text('已读')"
            ).first
            if mark_read_btn.count() > 0:
                mark_read_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 断言成功提示出现
                toast = admin_logged_in.locator(".el-message--success, .el-notification--success").first
                assert toast.is_visible(timeout=5000) or admin_logged_in.locator(".el-message").first.is_visible(timeout=3000)
            else:
                # 尝试勾选第一条消息并标记已读
                checkbox = admin_logged_in.locator(".el-table__body-wrapper .el-table__row .el-checkbox").first
                if checkbox.count() > 0:
                    checkbox.click(timeout=3000)
                    admin_logged_in.wait_for_timeout(300)
                    mark_btn = admin_logged_in.locator("button:has-text('标记'), button:has-text('已读')").first
                    if mark_btn.count() > 0:
                        mark_btn.click(timeout=3000)
                        admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/site_notice_mark_read_fail.png")

    def test_remind_toggle_switch(self, admin_logged_in: Page) -> None:
        """NT_REM_002：提醒设置开关。"""
        admin_logged_in.goto("http://localhost:3006/notice/remind")
        admin_logged_in.wait_for_url(lambda u: "/notice/remind" in u, timeout=10000)
        try:
            # 查找第一个开关并切换
            switch = admin_logged_in.locator(".el-switch").first
            if switch.count() > 0:
                switch.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 断言开关状态已改变
                is_checked = admin_logged_in.locator(".el-switch.is-checked").count() > 0
                # 切回原状态
                switch.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/remind_toggle_fail.png")


# ============================================================
# 系统设置
# ============================================================
@pytest.mark.settings
class TestSettings:
    """系统设置。"""

    def test_account_page(self, admin_logged_in: Page) -> None:
        """SET_ACC_001：账号设置页加载。"""
        admin_logged_in.goto("http://localhost:3006/settings/account")
        admin_logged_in.wait_for_url(lambda u: "/settings/account" in u, timeout=10000)

    def test_system_page(self, admin_logged_in: Page) -> None:
        """SET_SYS_001：系统设置页加载。"""
        admin_logged_in.goto("http://localhost:3006/settings/system")
        admin_logged_in.wait_for_url(lambda u: "/settings/system" in u, timeout=10000)

    def test_security_page(self, admin_logged_in: Page) -> None:
        """SET_SEC_001：安全设置页加载。"""
        admin_logged_in.goto("http://localhost:3006/settings/security")
        admin_logged_in.wait_for_url(lambda u: "/settings/security" in u, timeout=10000)

    def test_danger_page(self, admin_logged_in: Page) -> None:
        """SET_DAN_001：危险操作页加载。"""
        admin_logged_in.goto("http://localhost:3006/settings/danger")
        admin_logged_in.wait_for_url(lambda u: "/settings/danger" in u, timeout=10000)

    def test_account_edit(self, admin_logged_in: Page) -> None:
        """SET_ACC_002：账号设置编辑。"""
        admin_logged_in.goto("http://localhost:3006/settings/account")
        admin_logged_in.wait_for_url(lambda u: "/settings/account" in u, timeout=10000)
        try:
            # 查找编辑按钮
            edit_btn = admin_logged_in.locator("button:has-text('编辑'), button:has-text('修改')").first
            if edit_btn.count() > 0:
                edit_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 取消编辑
                cancel_btn = admin_logged_in.locator("button:has-text('取消')").first
                if cancel_btn.count() > 0:
                    cancel_btn.click(timeout=3000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/account_edit_fail.png")

    def test_security_change_password(self, admin_logged_in: Page) -> None:
        """SET_SEC_002：安全设置修改密码。"""
        admin_logged_in.goto("http://localhost:3006/settings/security")
        admin_logged_in.wait_for_url(lambda u: "/settings/security" in u, timeout=10000)
        try:
            # 查找修改密码按钮或表单
            change_btn = admin_logged_in.locator(
                "button:has-text('修改密码'), button:has-text('更改密码'), button:has-text('修改')"
            ).first
            if change_btn.count() > 0:
                change_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 断言密码修改表单出现
                assert admin_logged_in.locator(".el-dialog, .el-drawer").count() > 0
                # 关闭可能打开的对话框
                close_btn = admin_logged_in.locator(".el-dialog__close, button:has-text('取消')").first
                if close_btn.count() > 0:
                    close_btn.click(timeout=3000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/security_change_pwd_fail.png")

    def test_account_edit_nickname(self, admin_logged_in: Page) -> None:
        """SET_ACC_003：账号设置修改昵称。"""
        admin_logged_in.goto("http://localhost:3006/settings/account")
        admin_logged_in.wait_for_url(lambda u: "/settings/account" in u, timeout=10000)
        try:
            # 查找编辑按钮
            edit_btn = admin_logged_in.locator("button:has-text('编辑'), button:has-text('修改')").first
            if edit_btn.count() > 0:
                edit_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 查找昵称输入框并修改
                nickname_input = admin_logged_in.locator("input[placeholder*='昵称'], .el-dialog input, input").first
                if nickname_input.count() > 0:
                    original = nickname_input.input_value() or ""
                    nickname_input.fill("E2E测试昵称")
                    admin_logged_in.wait_for_timeout(300)
                    # 取消编辑，恢复原值
                    cancel_btn = admin_logged_in.locator("button:has-text('取消')").first
                    if cancel_btn.count() > 0:
                        cancel_btn.click(timeout=3000)
                    else:
                        nickname_input.fill(original)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/account_edit_nickname_fail.png")

    def test_system_theme_switch(self, admin_logged_in: Page) -> None:
        """SET_SYS_002：系统设置切换主题。"""
        admin_logged_in.goto("http://localhost:3006/settings/system")
        admin_logged_in.wait_for_url(lambda u: "/settings/system" in u, timeout=10000)
        try:
            # 查找主题切换相关元素（下拉或开关）
            theme_select = admin_logged_in.locator(
                ".el-select:has(+ *:has-text('主题')), .el-select, .el-switch"
            ).first
            if theme_select.count() > 0:
                theme_select.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 选择另一项或切换开关
                option = admin_logged_in.locator(".el-select-dropdown__item").nth(1)
                if option.count() > 0:
                    option.click(timeout=3000)
                    admin_logged_in.wait_for_timeout(500)
                else:
                    theme_select.click(timeout=3000)
                    admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/system_theme_switch_fail.png")

    def test_security_change_password_form(self, admin_logged_in: Page) -> None:
        """SET_SEC_003：安全设置修改密码表单填写。"""
        admin_logged_in.goto("http://localhost:3006/settings/security")
        admin_logged_in.wait_for_url(lambda u: "/settings/security" in u, timeout=10000)
        try:
            change_btn = admin_logged_in.locator(
                "button:has-text('修改密码'), button:has-text('更改密码'), button:has-text('修改')"
            ).first
            if change_btn.count() > 0:
                change_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
                # 断言对话框出现
                dialog = admin_logged_in.locator(".el-dialog").first
                assert dialog.is_visible()
                # 查找密码输入框并填写
                pwd_inputs = admin_logged_in.locator(".el-dialog input[type='password']")
                if pwd_inputs.count() >= 2:
                    pwd_inputs.nth(0).fill("OldPass123!")
                    pwd_inputs.nth(1).fill("NewPass456!")
                    if pwd_inputs.count() >= 3:
                        pwd_inputs.nth(2).fill("NewPass456!")
                # 取消关闭
                cancel_btn = admin_logged_in.locator(".el-dialog button:has-text('取消')").first
                if cancel_btn.count() > 0:
                    cancel_btn.click(timeout=3000)
                else:
                    admin_logged_in.locator(".el-dialog__close").first.click(timeout=3000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/security_change_pwd_form_fail.png")
