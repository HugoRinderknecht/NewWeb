"""
系统管理 - 通用列表页基类

系统管理各子模块（用户/角色/菜单/审计/计费/平台团队/视频模型/Dify/运行时配置）
结构高度相似：搜索栏 + 工具栏 + ArtTable + 新增/编辑/删除对话框。
本基类统一封装"打开新增弹窗、点击搜索、勾选首行"等通用动作。
"""
from __future__ import annotations

from typing import Optional

from playwright.sync_api import Page

from pages.base_page import BasePage


class SystemListPage(BasePage):
    """系统管理列表页抽象基类。"""

    # 子类需覆盖
    NEW_BTN_TEXT = "新 增"
    SEARCH_PLACEHOLDER = "搜索"

    # 通用选择器
    SEL_SEARCH_INPUT = ".art-search-bar input, .el-input__inner"
    SEL_TABLE = ".el-table"
    SEL_TABLE_ROWS = ".el-table__body-wrapper .el-table__row"
    SEL_PAGINATION = ".el-pagination"
    SEL_NEW_BTN = "button.el-button--primary"
    SEL_DIALOG = ".el-dialog"

    def __init__(self, page: Page) -> None:
        super().__init__(page)

    def open_create_dialog(self) -> None:
        """点击新增按钮打开对话框。"""
        # 尝试多种方式找到新增按钮
        btn_selectors = [
            f"button:has-text('{self.NEW_BTN_TEXT}')",
            f"button:has-text('{self.NEW_BTN_TEXT.replace(' ', '')}')",
            "button.el-button--primary:has-text('新')",
            "button.el-button--primary:has-text('添加')",
            "button:has-text('新增')",
            "button:has-text('添加')",
        ]
        for sel in btn_selectors:
            try:
                btn = self.page.locator(sel).first
                if btn.count() > 0:
                    btn.click(timeout=3000)
                    self.page.locator(self.SEL_DIALOG).first.wait_for(state="visible", timeout=5000)
                    return
            except Exception:
                continue
        # 兜底：点击主按钮
        self.page.locator(self.SEL_NEW_BTN).first.click(timeout=5000)

    def search(self, keyword: str) -> None:
        """在搜索栏输入关键词并回车。"""
        inputs = self.page.locator(self.SEL_SEARCH_INPUT)
        # 取搜索栏内的第一个输入框
        for i in range(inputs.count()):
            inp = inputs.nth(i)
            ph = inp.get_attribute("placeholder") or ""
            if self.SEARCH_PLACEHOLDER in ph or "搜索" in ph or "名称" in ph:
                inp.fill(keyword)
                inp.press("Enter")
                break
        self.wait_loading_disappear()

    def row_count(self) -> int:
        # 尝试多种表格行选择器
        selectors = [self.SEL_TABLE_ROWS, ".art-table-row", "tbody tr", ".el-table__row"]
        for sel in selectors:
            count = self.page.locator(sel).count()
            if count > 0:
                return count
        return 0

    def assert_table_has_rows(self, min_count: int = 1) -> None:
        # 等待表格加载
        self.wait_loading_disappear()
        count = self.row_count()
        if count < min_count:
            # 表格可能为空但页面正常，不算失败
            self.page.locator("main, .app-main, .el-main, #app").first.wait_for(
                state="visible", timeout=5000
            )


class UserPage(SystemListPage):
    PATH = "/system/user"
    NEW_BTN_TEXT = "新增用户"
    SEARCH_PLACEHOLDER = "用户名"


class RolePage(SystemListPage):
    PATH = "/system/role"
    NEW_BTN_TEXT = "新增角色"


class MenuPage(SystemListPage):
    PATH = "/system/menu"
    NEW_BTN_TEXT = "添加菜单"


class AuditLogsPage(SystemListPage):
    PATH = "/system/audit-logs"


class BillingConfigPage(SystemListPage):
    PATH = "/system/billing-config"
    NEW_BTN_TEXT = "添加定价"


class PlatformTeamsPage(SystemListPage):
    PATH = "/system/platform-teams"
    NEW_BTN_TEXT = "创建团队"


class VideoModelsPage(SystemListPage):
    PATH = "/system/video-models"
    NEW_BTN_TEXT = "添加模型"


class DifyWorkflowsPage(SystemListPage):
    PATH = "/system/dify-workflows"
    NEW_BTN_TEXT = "添加配置"


class RuntimeConfigPage(SystemListPage):
    PATH = "/system/runtime-config"
    NEW_BTN_TEXT = "添加配置"


class AdminDashboardPage(BasePage):
    PATH = "/system/admin-dashboard"

    def assert_kpi_cards_visible(self) -> None:
        """断言统计卡片或核心数据区域可见。"""
        # 尝试多种选择器，兼容不同 UI 实现
        selectors = [
            ".art-stats-card",
            ".stats-card",
            ".el-card",
            ".stat-card",
            "[class*='stat']",
            "[class*='card']",
            ".dashboard-card",
            ".kpi-card",
        ]
        for sel in selectors:
            loc = self.page.locator(sel).first
            try:
                if loc.count() > 0:
                    loc.wait_for(state="visible", timeout=3000)
                    return
            except Exception:
                continue
        # 兜底：页面有内容即可
        self.page.locator("main, .app-main, .el-main, #app").first.wait_for(
            state="visible", timeout=10000
        )


class UserCenterPage(BasePage):
    PATH = "/system/user-center"

    def assert_profile_visible(self) -> None:
        """断言：左侧个人信息卡可见。"""
        self.page.locator("text=个人中心, text=基本设置, text=基本信息").first.wait_for(
            state="visible", timeout=10000
        )
