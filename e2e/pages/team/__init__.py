"""团队管理页面包。"""
from __future__ import annotations

from pages.base_page import BasePage
from utils import data_factory as df


class TeamListPage(BasePage):
    PATH = "/team/list"

    SEL_CREATE_BTN = "button:has-text('创建团队')"
    SEL_SEARCH = "input[placeholder*='搜索'], input[placeholder*='团队']"

    def search(self, keyword: str) -> None:
        """搜索团队。"""
        self.fill(self.SEL_SEARCH, keyword)
        self.page.locator(self.SEL_SEARCH).press("Enter")
        self.wait_loading_disappear()

    def open_create_dialog(self) -> None:
        self.click(self.SEL_CREATE_BTN)
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def fill_create_form(self, name: str, description: str = "") -> None:
        """在创建团队对话框中填写表单。"""
        name_input = self.page.locator(".el-dialog input").first
        name_input.fill(name)
        ta = self.page.locator(".el-dialog textarea").first
        if ta.count() > 0:
            ta.fill(description or f"自动化测试团队 {name}")

    def submit_create(self) -> None:
        self.confirm_dialog()
        self.wait_dialog_closed()

    def create_team(self, name: str | None = None, description: str = "") -> str:
        """完整创建流程，返回团队名。"""
        name = name or df.team_name()
        self.open_create_dialog()
        self.fill_create_form(name, description)
        self.submit_create()
        return name


class TeamMembersPage(BasePage):
    PATH = "/team/members"

    SEL_INVITE = "button:has-text('邀请成员')"
    SEL_BATCH_REMOVE = "button:has-text('批量移除')"
    SEL_TABLE_ROWS = ".el-table__body-wrapper .el-table__row"

    def open_invite_dialog(self) -> None:
        """打开邀请成员对话框。"""
        self.click(self.SEL_INVITE)
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def get_member_row_count(self) -> int:
        """获取成员列表行数。"""
        self.wait_loading_disappear()
        return self.page.locator(self.SEL_TABLE_ROWS).count()

    def open_edit_role_dialog(self, member_name: str) -> None:
        """打开指定成员的角色编辑对话框。"""
        row = self.page.locator(self.SEL_TABLE_ROWS).filter(has_text=member_name).first
        row.locator("button:has-text('编辑'), button:has-text('角色'), button:has-text('修改')").first.click(
            timeout=3000
        )
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def invite_member_by_username(self, username: str) -> None:
        """通过用户名邀请成员：打开邀请对话框→输入用户名→提交。"""
        self.open_invite_dialog()
        dialog = self.page.locator(".el-dialog")
        # 在对话框中查找输入框并填写用户名
        username_input = dialog.locator("input").first
        username_input.fill(username)
        self.confirm_dialog()
        self.wait_dialog_closed()

    def assign_role_tags(self, tag_names: list[str]) -> None:
        """在角色编辑对话框中分配角色标签。"""
        dialog = self.page.locator(".el-dialog")
        for tag_name in tag_names:
            # 尝试勾选 checkbox 或点击 tag
            checkbox = dialog.locator(f".el-checkbox:has-text('{tag_name}')").first
            tag_loc = dialog.locator(f".el-tag:has-text('{tag_name}'), .el-check-tag:has-text('{tag_name}')").first
            try:
                if checkbox.count() > 0 and not checkbox.locator("input").is_checked():
                    checkbox.click()
                elif tag_loc.count() > 0:
                    tag_loc.click()
            except Exception:
                pass
        self.confirm_dialog()
        self.wait_dialog_closed()


class TeamRolesPage(BasePage):
    PATH = "/team/roles"

    SEL_CREATE = "button:has-text('创建角色')"
    SEL_TABLE_ROWS = ".el-table__body-wrapper .el-table__row"

    def open_create_dialog(self) -> None:
        """打开创建角色对话框。"""
        self.click(self.SEL_CREATE)
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def fill_create_form(self, name: str, description: str = "") -> None:
        """填写创建角色表单。"""
        name_input = self.page.locator(".el-dialog input").first
        name_input.fill(name)
        ta = self.page.locator(".el-dialog textarea").first
        if ta.count() > 0:
            ta.fill(description or f"自动化测试角色 {name}")

    def submit_create(self) -> None:
        self.confirm_dialog()
        self.wait_dialog_closed()

    def create_role(self, name: str | None = None, description: str = "") -> str:
        """完整创建角色流程，返回角色名。"""
        name = name or df.random_name(prefix="角色")
        self.open_create_dialog()
        self.fill_create_form(name, description)
        self.submit_create()
        return name

    def get_role_row_count(self) -> int:
        """获取角色列表行数。"""
        self.wait_loading_disappear()
        return self.page.locator(self.SEL_TABLE_ROWS).count()


class TeamInviteCodesPage(BasePage):
    PATH = "/team/invite-codes"

    SEL_GENERATE = "button:has-text('生成邀请码')"
    SEL_TABLE_ROWS = ".el-table__body-wrapper .el-table__row"

    def open_generate_dialog(self) -> None:
        """打开放行邀请码对话框。"""
        self.click(self.SEL_GENERATE)
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def generate_invite_code(self) -> str:
        """生成邀请码并返回码值。"""
        self.open_generate_dialog()
        self.confirm_dialog()
        self.wait_dialog_closed()
        self.wait_loading_disappear()
        # 获取表格第一行的邀请码
        try:
            code_cell = self.page.locator(f"{self.SEL_TABLE_ROWS} td").first
            code_cell.wait_for(state="visible", timeout=5000)
            return code_cell.inner_text().strip()
        except Exception:
            self.screenshot("invite_code_not_found")
            return ""

    def get_first_invite_code(self) -> str:
        """获取列表中第一个邀请码。"""
        self.wait_loading_disappear()
        try:
            code_cell = self.page.locator(f"{self.SEL_TABLE_ROWS} td").first
            code_cell.wait_for(state="visible", timeout=5000)
            return code_cell.inner_text().strip()
        except Exception:
            return ""

    def copy_first_code(self) -> str:
        """复制第一个邀请码，返回复制的码值。"""
        self.wait_loading_disappear()
        code = self.get_first_invite_code()
        if code:
            # 查找第一个复制按钮
            try:
                row = self.page.locator(self.SEL_TABLE_ROWS).first
                copy_btn = row.locator("button:has-text('复制'), .el-button:has-text('复制'), [class*='copy']").first
                if copy_btn.count() > 0:
                    copy_btn.click(timeout=3000)
                    self.page.wait_for_timeout(500)
            except Exception:
                self.screenshot("copy_code_btn_not_found")
        return code


class TeamApplicationsPage(BasePage):
    PATH = "/team/applications"

    SEL_TAB_PENDING = ".el-tabs__item:has-text('待审批')"
    SEL_TAB_HISTORY = ".el-tabs__item:has-text('历史记录')"
    SEL_TABLE_ROWS = ".el-table__body-wrapper .el-table__row"

    def click_pending_tab(self) -> None:
        """切换到待审批 Tab。"""
        self.page.locator(self.SEL_TAB_PENDING).first.click()

    def click_history_tab(self) -> None:
        """点击历史记录 Tab。"""
        self.page.locator(self.SEL_TAB_HISTORY).first.click()
        self.wait_loading_disappear()

    def approve_first_application(self) -> None:
        """审批通过第一条申请。"""
        self.click_pending_tab()
        self.wait_loading_disappear()
        row = self.page.locator(self.SEL_TABLE_ROWS).first
        try:
            row.locator("button:has-text('通过'), button:has-text('同意'), button:has-text('审批')").first.click(
                timeout=3000
            )
            self.page.wait_for_timeout(1000)
        except Exception:
            self.screenshot("approve_application_failed")


class TeamQuotaPage(BasePage):
    PATH = "/team/quota"

    SEL_NEW = "button:has-text('新增配额规则')"

    def open_new_rule_dialog(self) -> None:
        """点击新增配额规则按钮→等待对话框。"""
        self.click(self.SEL_NEW)
        self.get_dialog().wait_for(state="visible", timeout=5000)


class TeamSettingsPage(BasePage):
    PATH = "/team/settings"
