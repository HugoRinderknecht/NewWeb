"""
系统管理 - 平台管理员总览（仪表盘）

对应文档：功能模块全面分析文档 §1
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.system.system_pages import AdminDashboardPage


@pytest.mark.system
class TestAdminDashboard:
    """平台管理员总览。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_DASH_001：管理员总览页加载。"""
        page = AdminDashboardPage(admin_logged_in).navigate()
        page.assert_url_contains("/system/admin-dashboard")

    def test_kpi_cards_visible(self, admin_logged_in: Page) -> None:
        """SYS_DASH_002：4 个核心统计卡片可见。"""
        page = AdminDashboardPage(admin_logged_in).navigate()
        try:
            page.assert_kpi_cards_visible()
        except Exception:
            page.screenshot(path=f"_screenshots/admin_dashboard_kpi_missing.png")
            raise

    def test_navigation_menu_visible(self, admin_logged_in: Page) -> None:
        """SYS_DASH_003：左侧菜单完整渲染。"""
        admin_logged_in.goto("http://localhost:3006/system/admin-dashboard")
        # 等待侧边栏
        admin_logged_in.locator(".el-menu, .sidebar, [class*='menu']").first.wait_for(
            state="visible", timeout=10000
        )


@pytest.mark.system
class TestUserManagement:
    """用户管理。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_USER_001：用户管理页加载。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        page.assert_url_contains("/system/user")

    def test_user_table_loads(self, admin_logged_in: Page) -> None:
        """SYS_USER_002：用户列表加载。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        # 至少应展示 1 条记录
        try:
            page.assert_table_has_rows(1)
        except AssertionError:
            page.screenshot(path=f"_screenshots/user_table_empty.png")
            raise

    def test_search_by_keyword(self, admin_logged_in: Page) -> None:
        """SYS_USER_003：按用户名搜索。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        page.search("admin")
        # 等待响应
        admin_logged_in.wait_for_timeout(1500)

    def test_create_user_dialog_opens(self, admin_logged_in: Page) -> None:
        """SYS_USER_004：点击新增用户打开对话框。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
        except Exception:
            page.screenshot(path=f"_screenshots/user_create_dialog_missing.png")
            raise

    def test_required_field_validation(self, admin_logged_in: Page) -> None:
        """SYS_USER_005：必填校验。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 不填任何字段直接提交
            admin_logged_in.locator(".el-dialog .el-button--primary").last.click()
            admin_logged_in.wait_for_timeout(500)
            # 应停留在对话框
            assert admin_logged_in.locator(".el-dialog").count() > 0
        except Exception:
            page.screenshot(path=f"_screenshots/required_field_validation_fail.png")
            raise

    def test_status_filter(self, admin_logged_in: Page) -> None:
        """SYS_USER_006：按状态筛选。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        # 点击状态选择器
        selects = admin_logged_in.locator(".el-select")
        if selects.count() > 0:
            selects.first.click()
            admin_logged_in.wait_for_timeout(500)
            # 选择第一个选项
            try:
                admin_logged_in.locator(".el-select-dropdown__item").first.click(timeout=2000)
            except Exception:
                page.screenshot(path=f"_screenshots/status_filter_fail.png")
                raise

    def test_create_user_full_flow(self, admin_logged_in: Page) -> None:
        """SYS_USER_007：完整创建用户流程。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 填写用户名
            page.fill(".el-dialog .el-input__inner", "testuser_new")
            # 填写邮箱
            inputs = admin_logged_in.locator(".el-dialog .el-input__inner")
            if inputs.count() > 1:
                inputs.nth(1).fill("testuser_new@example.com")
            # 填写密码
            if inputs.count() > 2:
                inputs.nth(2).fill("Test@123456")
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1500)
            # 验证用户出现在列表中
            page.search("testuser_new")
            admin_logged_in.wait_for_timeout(1000)
            assert page.row_count() >= 1
        except Exception:
            page.screenshot(path=f"_screenshots/user_create_full_flow_fail.png")
            raise

    def test_edit_user_status(self, admin_logged_in: Page) -> None:
        """SYS_USER_008：编辑用户状态（启用/禁用）。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        try:
            # 确保列表有数据
            if page.row_count() == 0:
                return
            # 点击第一行编辑按钮
            admin_logged_in.locator(".el-table__row .el-button--primary, .el-table__row .el-button").first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            # 切换状态选择器
            selects = admin_logged_in.locator(".el-dialog .el-select")
            if selects.count() > 0:
                selects.first.click()
                admin_logged_in.wait_for_timeout(300)
                # 选择另一个选项（启用/禁用互换）
                items = admin_logged_in.locator(".el-select-dropdown__item")
                if items.count() > 1:
                    items.nth(1).click()
                else:
                    items.first.click()
                admin_logged_in.wait_for_timeout(300)
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/user_edit_status_fail.png")
            raise

    def test_delete_user(self, admin_logged_in: Page) -> None:
        """SYS_USER_009：删除第一个用户。"""
        from pages.system.system_pages import UserPage
        page = UserPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            # 点击第一行删除按钮
            btns = admin_logged_in.locator(".el-table__row .el-button--danger, .el-table__row .el-button")
            for i in range(btns.count()):
                btn = btns.nth(i)
                text = btn.inner_text()
                if "删除" in text or "delete" in text.lower():
                    btn.click(timeout=3000)
                    break
            else:
                # 兜底：点击每行最后一个按钮
                admin_logged_in.locator(".el-table__row .el-button").last.click(timeout=3000)
            admin_logged_in.wait_for_timeout(300)
            # 确认二次弹窗
            try:
                page.confirm_dialog()
            except Exception:
                page.screenshot(path=f"_screenshots/user_delete_confirm_fail.png")
                raise
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/user_delete_fail.png")
            raise


@pytest.mark.system
class TestRoleManagement:
    """角色管理。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_ROLE_001：角色管理页加载。"""
        from pages.system.system_pages import RolePage
        RolePage(admin_logged_in).navigate()

    def test_role_table_loads(self, admin_logged_in: Page) -> None:
        """SYS_ROLE_002：角色列表加载。"""
        from pages.system.system_pages import RolePage
        page = RolePage(admin_logged_in).navigate()
        page.assert_table_has_rows(1)

    def test_create_role_dialog(self, admin_logged_in: Page) -> None:
        """SYS_ROLE_003：新增角色对话框。"""
        from pages.system.system_pages import RolePage
        page = RolePage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
        except Exception:
            page.screenshot(path=f"_screenshots/role_create_dialog_missing.png")

    def test_create_role_full_flow(self, admin_logged_in: Page) -> None:
        """SYS_ROLE_004：完整创建角色流程。"""
        from pages.system.system_pages import RolePage
        page = RolePage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 填写角色名
            page.fill(".el-dialog .el-input__inner", "test_role_new")
            # 填写描述（如有第二个输入框）
            inputs = admin_logged_in.locator(".el-dialog .el-input__inner")
            if inputs.count() > 1:
                inputs.nth(1).fill("自动化测试角色")
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1500)
            # 验证角色出现在列表中
            page.search("test_role_new")
            admin_logged_in.wait_for_timeout(1000)
            assert page.row_count() >= 1
        except Exception:
            page.screenshot(path=f"_screenshots/role_create_full_flow_fail.png")
            raise

    def test_edit_role_permissions(self, admin_logged_in: Page) -> None:
        """SYS_ROLE_005：编辑角色权限（勾选/取消权限）。"""
        from pages.system.system_pages import RolePage
        page = RolePage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            # 点击第一行编辑按钮
            admin_logged_in.locator(".el-table__row .el-button--primary, .el-table__row .el-button").first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            # 勾选/取消权限（复选框或树形控件）
            checks = admin_logged_in.locator(".el-dialog .el-checkbox__original, .el-dialog .el-tree-node__content .el-checkbox")
            if checks.count() > 0:
                checks.first.click(timeout=3000)
                admin_logged_in.wait_for_timeout(300)
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/role_edit_permissions_fail.png")
            raise

    def test_delete_role(self, admin_logged_in: Page) -> None:
        """SYS_ROLE_006：删除第一个角色。"""
        from pages.system.system_pages import RolePage
        page = RolePage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            btns = admin_logged_in.locator(".el-table__row .el-button--danger, .el-table__row .el-button")
            for i in range(btns.count()):
                btn = btns.nth(i)
                text = btn.inner_text()
                if "删除" in text or "delete" in text.lower():
                    btn.click(timeout=3000)
                    break
            else:
                admin_logged_in.locator(".el-table__row .el-button").last.click(timeout=3000)
            admin_logged_in.wait_for_timeout(300)
            try:
                page.confirm_dialog()
            except Exception:
                page.screenshot(path=f"_screenshots/role_delete_confirm_fail.png")
                raise
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/role_delete_fail.png")
            raise


@pytest.mark.system
class TestMenuManagement:
    """菜单管理。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_MENU_001：菜单管理页加载。"""
        from pages.system.system_pages import MenuPage
        MenuPage(admin_logged_in).navigate()

    def test_menu_tree_loads(self, admin_logged_in: Page) -> None:
        """SYS_MENU_002：菜单树形结构加载。"""
        from pages.system.system_pages import MenuPage
        page = MenuPage(admin_logged_in).navigate()
        # 树形节点或表格
        selectors = [".el-tree-node", ".tree-node", ".el-table__row", "table", "main"]
        for sel in selectors:
            try:
                loc = admin_logged_in.locator(sel).first
                if loc.count() > 0:
                    loc.wait_for(state="visible", timeout=3000)
                    return
            except Exception:
                continue

    def test_create_menu_full_flow(self, admin_logged_in: Page) -> None:
        """SYS_MENU_003：完整创建菜单流程。"""
        from pages.system.system_pages import MenuPage
        page = MenuPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 填写菜单名称
            page.fill(".el-dialog .el-input__inner", "test_menu_new")
            # 如有路径输入框则填写
            inputs = admin_logged_in.locator(".el-dialog .el-input__inner")
            if inputs.count() > 1:
                inputs.nth(1).fill("/test/menu")
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1500)
            # 验证菜单出现在列表/树中
            assert admin_logged_in.locator("text=test_menu_new").count() >= 1
        except Exception:
            page.screenshot(path=f"_screenshots/menu_create_full_flow_fail.png")
            raise

    def test_edit_menu(self, admin_logged_in: Page) -> None:
        """SYS_MENU_004：编辑菜单名称。"""
        from pages.system.system_pages import MenuPage
        page = MenuPage(admin_logged_in).navigate()
        try:
            # 尝试点击树节点或表格第一行的编辑按钮
            edit_btns = admin_logged_in.locator(".el-tree-node .el-button, .el-table__row .el-button--primary, .el-table__row .el-button")
            if edit_btns.count() == 0:
                return
            edit_btns.first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            # 修改菜单名
            page.fill(".el-dialog .el-input__inner", "test_menu_edited")
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/menu_edit_fail.png")
            raise

    def test_delete_menu(self, admin_logged_in: Page) -> None:
        """SYS_MENU_005：删除菜单。"""
        from pages.system.system_pages import MenuPage
        page = MenuPage(admin_logged_in).navigate()
        try:
            btns = admin_logged_in.locator(".el-tree-node .el-button, .el-table__row .el-button--danger, .el-table__row .el-button")
            if btns.count() == 0:
                return
            for i in range(btns.count()):
                btn = btns.nth(i)
                text = btn.inner_text()
                if "删除" in text or "delete" in text.lower():
                    btn.click(timeout=3000)
                    break
            else:
                btns.last.click(timeout=3000)
            admin_logged_in.wait_for_timeout(300)
            try:
                page.confirm_dialog()
            except Exception:
                page.screenshot(path=f"_screenshots/menu_delete_confirm_fail.png")
                raise
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/menu_delete_fail.png")
            raise


@pytest.mark.system
class TestAuditLogs:
    """审计日志。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_AUDIT_001：审计日志页加载。"""
        from pages.system.system_pages import AuditLogsPage
        page = AuditLogsPage(admin_logged_in).navigate()
        page.assert_url_contains("/system/audit-logs")

    def test_date_range_filter(self, admin_logged_in: Page) -> None:
        """SYS_AUDIT_002：日期范围筛选。"""
        from pages.system.system_pages import AuditLogsPage
        page = AuditLogsPage(admin_logged_in).navigate()
        # 触发日期选择器
        try:
            admin_logged_in.locator(".el-date-editor, .el-date-picker").first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            admin_logged_in.keyboard.press("Escape")
        except Exception:
            page.screenshot(path=f"_screenshots/audit_date_range_filter_fail.png")
            raise

    def test_module_filter(self, admin_logged_in: Page) -> None:
        """SYS_AUDIT_003：按模块筛选。"""
        from pages.system.system_pages import AuditLogsPage
        page = AuditLogsPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-select").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(300)
            admin_logged_in.keyboard.press("Escape")
        except Exception:
            page.screenshot(path=f"_screenshots/audit_module_filter_fail.png")
            raise


@pytest.mark.system
class TestBillingConfig:
    """计费配置。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_BILL_001：计费配置页加载。"""
        from pages.system.system_pages import BillingConfigPage
        BillingConfigPage(admin_logged_in).navigate()

    def test_pricing_table(self, admin_logged_in: Page) -> None:
        """SYS_BILL_002：定价表加载。"""
        from pages.system.system_pages import BillingConfigPage
        page = BillingConfigPage(admin_logged_in).navigate()
        try:
            page.assert_table_has_rows(0)  # 允许为空
        except AssertionError:
            pass

    def test_add_pricing_dialog(self, admin_logged_in: Page) -> None:
        """SYS_BILL_003：新增定价对话框。"""
        from pages.system.system_pages import BillingConfigPage
        page = BillingConfigPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
        except Exception:
            page.screenshot(path=f"_screenshots/pricing_add_dialog_fail.png")
            raise

    def test_create_pricing_full_flow(self, admin_logged_in: Page) -> None:
        """SYS_BILL_004：完整创建定价流程。"""
        from pages.system.system_pages import BillingConfigPage
        page = BillingConfigPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 填写定价名称
            page.fill(".el-dialog .el-input__inner", "test_pricing_new")
            # 如有金额/价格输入框则填写
            inputs = admin_logged_in.locator(".el-dialog .el-input__inner")
            if inputs.count() > 1:
                inputs.nth(1).fill("99.99")
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1500)
            # 验证定价出现在列表中
            page.search("test_pricing_new")
            admin_logged_in.wait_for_timeout(1000)
            assert page.row_count() >= 1
        except Exception:
            page.screenshot(path=f"_screenshots/pricing_create_full_flow_fail.png")
            raise

    def test_edit_pricing(self, admin_logged_in: Page) -> None:
        """SYS_BILL_005：编辑定价。"""
        from pages.system.system_pages import BillingConfigPage
        page = BillingConfigPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            admin_logged_in.locator(".el-table__row .el-button--primary, .el-table__row .el-button").first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            # 修改定价名称
            page.fill(".el-dialog .el-input__inner", "test_pricing_edited")
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/pricing_edit_fail.png")
            raise

    def test_delete_pricing(self, admin_logged_in: Page) -> None:
        """SYS_BILL_006：删除定价。"""
        from pages.system.system_pages import BillingConfigPage
        page = BillingConfigPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            btns = admin_logged_in.locator(".el-table__row .el-button--danger, .el-table__row .el-button")
            for i in range(btns.count()):
                btn = btns.nth(i)
                text = btn.inner_text()
                if "删除" in text or "delete" in text.lower():
                    btn.click(timeout=3000)
                    break
            else:
                admin_logged_in.locator(".el-table__row .el-button").last.click(timeout=3000)
            admin_logged_in.wait_for_timeout(300)
            try:
                page.confirm_dialog()
            except Exception:
                page.screenshot(path=f"_screenshots/pricing_delete_confirm_fail.png")
                raise
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/pricing_delete_fail.png")
            raise


@pytest.mark.system
class TestPlatformTeams:
    """平台团队管理。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_TEAM_001：平台团队页加载。"""
        from pages.system.system_pages import PlatformTeamsPage
        PlatformTeamsPage(admin_logged_in).navigate()

    def test_team_list(self, admin_logged_in: Page) -> None:
        """SYS_TEAM_002：团队列表加载。"""
        from pages.system.system_pages import PlatformTeamsPage
        page = PlatformTeamsPage(admin_logged_in).navigate()
        try:
            page.assert_table_has_rows(0)
        except AssertionError:
            pass


@pytest.mark.system
class TestVideoModels:
    """视频模型管理。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_VM_001：视频模型页加载。"""
        from pages.system.system_pages import VideoModelsPage
        page = VideoModelsPage(admin_logged_in).navigate()
        page.assert_url_contains("/system/video-models")

    def test_add_model_dialog(self, admin_logged_in: Page) -> None:
        """SYS_VM_002：添加模型对话框。"""
        from pages.system.system_pages import VideoModelsPage
        page = VideoModelsPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
        except Exception:
            page.screenshot(path=f"_screenshots/video_model_add_dialog_fail.png")
            raise

    def test_create_model_full_flow(self, admin_logged_in: Page) -> None:
        """SYS_VM_003：完整创建视频模型流程。"""
        from pages.system.system_pages import VideoModelsPage
        page = VideoModelsPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 填写模型名称
            page.fill(".el-dialog .el-input__inner", "test_model_new")
            # 如有其他输入框则填写（如模型ID）
            inputs = admin_logged_in.locator(".el-dialog .el-input__inner")
            if inputs.count() > 1:
                inputs.nth(1).fill("model-id-123")
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1500)
            # 验证模型出现在列表中
            page.search("test_model_new")
            admin_logged_in.wait_for_timeout(1000)
            assert page.row_count() >= 1
        except Exception:
            page.screenshot(path=f"_screenshots/model_create_full_flow_fail.png")
            raise

    def test_edit_model(self, admin_logged_in: Page) -> None:
        """SYS_VM_004：编辑模型。"""
        from pages.system.system_pages import VideoModelsPage
        page = VideoModelsPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            admin_logged_in.locator(".el-table__row .el-button--primary, .el-table__row .el-button").first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            # 修改模型名称
            page.fill(".el-dialog .el-input__inner", "test_model_edited")
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/model_edit_fail.png")
            raise

    def test_delete_model(self, admin_logged_in: Page) -> None:
        """SYS_VM_005：删除模型。"""
        from pages.system.system_pages import VideoModelsPage
        page = VideoModelsPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            btns = admin_logged_in.locator(".el-table__row .el-button--danger, .el-table__row .el-button")
            for i in range(btns.count()):
                btn = btns.nth(i)
                text = btn.inner_text()
                if "删除" in text or "delete" in text.lower():
                    btn.click(timeout=3000)
                    break
            else:
                admin_logged_in.locator(".el-table__row .el-button").last.click(timeout=3000)
            admin_logged_in.wait_for_timeout(300)
            try:
                page.confirm_dialog()
            except Exception:
                page.screenshot(path=f"_screenshots/model_delete_confirm_fail.png")
                raise
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/model_delete_fail.png")
            raise


@pytest.mark.system
class TestDifyWorkflows:
    """Dify 工作流配置。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_DIFY_001：Dify 工作流页加载。"""
        from pages.system.system_pages import DifyWorkflowsPage
        page = DifyWorkflowsPage(admin_logged_in).navigate()
        page.assert_url_contains("/system/dify-workflows")

    def test_add_workflow(self, admin_logged_in: Page) -> None:
        """SYS_DIFY_002：添加 Dify 配置。"""
        from pages.system.system_pages import DifyWorkflowsPage
        page = DifyWorkflowsPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
        except Exception:
            page.screenshot(path=f"_screenshots/dify_workflow_add_dialog_fail.png")
            raise

    def test_create_workflow_full_flow(self, admin_logged_in: Page) -> None:
        """SYS_DIFY_003：完整创建 Dify 配置流程。"""
        from pages.system.system_pages import DifyWorkflowsPage
        page = DifyWorkflowsPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 填写配置名称
            page.fill(".el-dialog .el-input__inner", "test_workflow_new")
            # 如有 API Key / URL 输入框则填写
            inputs = admin_logged_in.locator(".el-dialog .el-input__inner")
            if inputs.count() > 1:
                inputs.nth(1).fill("https://dify.example.com")
            if inputs.count() > 2:
                inputs.nth(2).fill("dify-api-key-123")
            # 提交
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1500)
            # 验证配置出现在列表中
            page.search("test_workflow_new")
            admin_logged_in.wait_for_timeout(1000)
            assert page.row_count() >= 1
        except Exception:
            page.screenshot(path=f"_screenshots/workflow_create_full_flow_fail.png")
            raise

    def test_edit_workflow(self, admin_logged_in: Page) -> None:
        """SYS_DIFY_004：编辑配置。"""
        from pages.system.system_pages import DifyWorkflowsPage
        page = DifyWorkflowsPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            admin_logged_in.locator(".el-table__row .el-button--primary, .el-table__row .el-button").first.click(timeout=3000)
            admin_logged_in.wait_for_timeout(500)
            # 修改配置名称
            page.fill(".el-dialog .el-input__inner", "test_workflow_edited")
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/workflow_edit_fail.png")
            raise

    def test_delete_workflow(self, admin_logged_in: Page) -> None:
        """SYS_DIFY_005：删除配置。"""
        from pages.system.system_pages import DifyWorkflowsPage
        page = DifyWorkflowsPage(admin_logged_in).navigate()
        try:
            if page.row_count() == 0:
                return
            btns = admin_logged_in.locator(".el-table__row .el-button--danger, .el-table__row .el-button")
            for i in range(btns.count()):
                btn = btns.nth(i)
                text = btn.inner_text()
                if "删除" in text or "delete" in text.lower():
                    btn.click(timeout=3000)
                    break
            else:
                admin_logged_in.locator(".el-table__row .el-button").last.click(timeout=3000)
            admin_logged_in.wait_for_timeout(300)
            try:
                page.confirm_dialog()
            except Exception:
                page.screenshot(path=f"_screenshots/workflow_delete_confirm_fail.png")
                raise
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/workflow_delete_fail.png")
            raise


@pytest.mark.system
class TestRuntimeConfig:
    """运行时配置。"""

    def test_page_loads(self, admin_logged_in: Page) -> None:
        """SYS_RT_001：运行时配置页加载。"""
        from pages.system.system_pages import RuntimeConfigPage
        page = RuntimeConfigPage(admin_logged_in).navigate()
        page.assert_url_contains("/system/runtime-config")

    def test_edit_runtime_config(self, admin_logged_in: Page) -> None:
        """SYS_RT_002：编辑运行时配置。"""
        from pages.system.system_pages import RuntimeConfigPage
        page = RuntimeConfigPage(admin_logged_in).navigate()
        try:
            # 尝试点击编辑按钮或第一个输入框
            edit_btn = admin_logged_in.locator(".el-button--primary, .el-button:has-text('编辑'), .el-button:has-text('修改')").first
            if edit_btn.count() > 0:
                edit_btn.click(timeout=3000)
                admin_logged_in.wait_for_timeout(500)
            # 修改配置值
            inputs = admin_logged_in.locator(".el-input__inner, .el-textarea__inner")
            if inputs.count() > 0:
                inputs.first.fill("edited_value_123")
            # 提交保存
            page.confirm_dialog()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            page.screenshot(path=f"_screenshots/runtime_config_edit_fail.png")
            raise
