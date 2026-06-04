"""
项目管理测试

对应文档：功能模块全面分析文档 §3
- /project/list          列表（双视图：卡片/表格）
- /project/edit          编辑（7 Tab）
- /project/scripts       剧本管理
- /project/characters    角色管理
- /project/episodes      剧集管理
- /project/member        成员管理
- /project/statistics    项目统计
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.project.project_pages import (
    ProjectCharactersPage,
    ProjectEditPage,
    ProjectEpisodesPage,
    ProjectListPage,
    ProjectMemberPage,
    ProjectScriptsPage,
    ProjectStatisticsPage,
)
from utils import data_factory as df


@pytest.mark.project
class TestProjectList:
    """项目列表。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_001：列表页加载。"""
        page = ProjectListPage(admin_logged_in).navigate()
        page.assert_url_contains("/project/list")

    def test_grid_view_default(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_002：默认卡片视图。"""
        page = ProjectListPage(admin_logged_in).navigate()
        # 卡片或表格应可见
        admin_logged_in.locator(".el-table, [class*='project-card'], [class*='card']").first.wait_for(
            state="visible", timeout=10000
        )

    def test_search_by_name(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_003：按名称搜索。"""
        page = ProjectListPage(admin_logged_in).navigate()
        try:
            page.search("test")
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/project_search_by_name_fail.png")
            raise

    def test_status_filter(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_004：按状态筛选。"""
        page = ProjectListPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-select").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(300)
            admin_logged_in.keyboard.press("Escape")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/project_status_filter_fail.png")
            raise

    def test_open_create_dialog(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_005：点击创建项目打开对话框。"""
        page = ProjectListPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 检查对话框出现
            assert admin_logged_in.locator(".el-dialog").is_visible()
        except Exception:
            page.screenshot(path=f"_screenshots/project_create_dialog_missing.png")
            raise

    def test_create_project_form_validation(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_006：创建项目必填校验。"""
        page = ProjectListPage(admin_logged_in).navigate()
        try:
            page.open_create_dialog()
            # 直接点确定
            admin_logged_in.locator(".el-dialog .el-button--primary").last.click()
            admin_logged_in.wait_for_timeout(500)
            # 仍应停留在对话框
            assert admin_logged_in.locator(".el-dialog").count() > 0
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/project_create_form_validation_fail.png")
            raise

    def test_create_project_success(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_007：成功创建项目。"""
        page = ProjectListPage(admin_logged_in).navigate()
        name = df.project_name()
        try:
            page.create_project(name=name, description="E2E 测试")
        except Exception as e:
            admin_logged_in.screenshot(path=f"_screenshots/create_project_fail_{name}.png")
            raise

    def test_view_switch(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_008：切换卡片/表格视图。"""
        page = ProjectListPage(admin_logged_in).navigate()
        try:
            page.switch_to_list()
            admin_logged_in.wait_for_timeout(500)
            page.switch_to_grid()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/project_view_switch_fail.png")
            raise

    def test_create_and_verify_in_list(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_009：创建项目后验证项目出现在列表中。"""
        page = ProjectListPage(admin_logged_in).navigate()
        name = df.project_name()
        try:
            page.create_project(name=name, description="E2E 验证列表")
            admin_logged_in.wait_for_timeout(1000)
            # 用 has_project 断言项目出现在列表中
            assert page.has_project(name), f"创建的项目 [{name}] 未出现在列表中"
        except Exception as e:
            admin_logged_in.screenshot(path=f"_screenshots/proj_list_009_fail_{name}.png")
            raise

    def test_delete_project(self, admin_logged_in: Page) -> None:
        """PROJ_LIST_010：删除项目（搜索→删除→确认→验证列表不再包含）。"""
        page = ProjectListPage(admin_logged_in).navigate()
        name = df.project_name()
        try:
            # 先创建一个项目
            page.create_project(name=name, description="E2E 待删除")
            admin_logged_in.wait_for_timeout(1000)
            # 删除项目
            page.delete_project(name)
            admin_logged_in.wait_for_timeout(1000)
            # 验证列表不再包含该项目
            assert not page.has_project(name), f"删除后项目 [{name}] 仍出现在列表中"
        except Exception as e:
            admin_logged_in.screenshot(path=f"_screenshots/proj_list_010_fail_{name}.png")
            raise

    def test_create_project_and_verify_in_list(self, admin_logged_in: Page) -> None:
        """创建项目后验证项目出现在列表中。"""
        page = ProjectListPage(admin_logged_in).navigate()
        name = df.project_name()
        try:
            page.create_project(name=name, description="E2E 验证列表")
            admin_logged_in.wait_for_timeout(1000)
            page.assert_project_exists(name)
        except Exception as e:
            admin_logged_in.screenshot(path=f"_screenshots/proj_create_verify_fail_{name}.png")
            raise


@pytest.mark.project
class TestProjectEdit:
    """项目编辑。"""

    def test_loads_via_card_click(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_001：点击卡片进入编辑。"""
        page = ProjectListPage(admin_logged_in).navigate()
        try:
            # 找第一个项目卡片并点击
            card = admin_logged_in.locator("[class*='project-card'], [class*='card']").first
            card.click()
            admin_logged_in.wait_for_url(lambda u: "/project/edit" in u, timeout=10000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/project_loads_via_card_click_fail.png")
            raise

    def test_overview_tab(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_002：概览 Tab。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        page.click_tab("overview")

    def test_script_tab(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_003：剧本 Tab。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        page.click_tab("script")

    def test_storyboard_tab(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_004：分镜 Tab。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        page.click_tab("storyboard")

    def test_member_tab(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_005：成员 Tab。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        page.click_tab("member")

    def test_setting_tab(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_006：设置 Tab。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        page.click_tab("setting")

    def test_edit_name_and_save(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_007：编辑项目名称并保存（navigate到edit→edit_name→save→断言成功提示）。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        new_name = df.project_name()
        try:
            page.edit_name(new_name)
            page.save()
            # 断言成功提示
            page.assert_toast_success()
        except Exception:
            admin_logged_in.screenshot(path="_screenshots/proj_edit_007_fail.png")
            raise

    def test_save_button(self, admin_logged_in: Page) -> None:
        """PROJ_EDIT_008：保存修改按钮测试。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        try:
            # 验证保存按钮存在并可见
            save_btn = admin_logged_in.locator("button:has-text('保存修改')").first
            assert save_btn.is_visible(), "保存修改按钮不可见"
            # 点击保存
            page.save()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path="_screenshots/proj_edit_008_fail.png")
            raise

    def test_edit_project_overview(self, admin_logged_in: Page) -> None:
        """进入编辑页 -> 概览Tab -> 修改名称 -> 保存。"""
        page = ProjectEditPage(admin_logged_in).navigate_to("/project/edit")
        new_name = df.project_name()
        try:
            page.click_tab("overview")
            page.fill_overview(new_name, description="E2E 修改概览")
            page.save_edit()
            page.assert_toast_success()
        except Exception:
            admin_logged_in.screenshot(path="_screenshots/proj_edit_overview_fail.png")
            raise


@pytest.mark.project
class TestProjectSubPages:
    """项目子页面。"""

    def test_scripts_page(self, admin_logged_in: Page) -> None:
        """PROJ_SUB_001：项目剧本页。"""
        ProjectScriptsPage(admin_logged_in).navigate()

    def test_characters_page(self, admin_logged_in: Page) -> None:
        """PROJ_SUB_002：项目角色页。"""
        ProjectCharactersPage(admin_logged_in).navigate()

    def test_episodes_page(self, admin_logged_in: Page) -> None:
        """PROJ_SUB_003：项目剧集页。"""
        ProjectEpisodesPage(admin_logged_in).navigate()

    def test_member_page(self, admin_logged_in: Page) -> None:
        """PROJ_SUB_004：项目成员页。"""
        ProjectMemberPage(admin_logged_in).navigate()

    def test_statistics_page(self, admin_logged_in: Page) -> None:
        """PROJ_SUB_005：项目统计页。"""
        page = ProjectStatisticsPage(admin_logged_in).navigate()
        try:
            page.assert_kpi()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/project_statistics_page_fail.png")
            raise

    def test_statistics_data_validation(self, admin_logged_in: Page) -> None:
        """PROJ_SUB_006：项目统计页数据验证（assert_kpi增加断言）。"""
        page = ProjectStatisticsPage(admin_logged_in).navigate()
        try:
            # 验证 KPI 指标可见
            page.assert_kpi()
            # 验证 KPI 数值和图表/表格
            page.assert_kpi_values()
        except Exception:
            admin_logged_in.screenshot(path="_screenshots/proj_sub_006_fail.png")
            raise

    def test_project_scripts_create(self, admin_logged_in: Page) -> None:
        """项目剧本页创建剧本。"""
        page = ProjectScriptsPage(admin_logged_in).navigate()
        name = df.script_name()
        try:
            page.create_script(name)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/proj_scripts_create_fail_{name}.png")
            raise

    def test_project_characters_create(self, admin_logged_in: Page) -> None:
        """项目角色页创建角色。"""
        page = ProjectCharactersPage(admin_logged_in).navigate()
        name = df.random_name(prefix="角色")
        try:
            page.create_character(name)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/proj_characters_create_fail_{name}.png")
            raise

    def test_project_episodes_create(self, admin_logged_in: Page) -> None:
        """项目剧集页创建剧集。"""
        page = ProjectEpisodesPage(admin_logged_in).navigate()
        name = df.random_name(prefix="剧集")
        try:
            page.create_episode(name)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/proj_episodes_create_fail_{name}.png")
            raise

    def test_project_member_add(self, admin_logged_in: Page) -> None:
        """项目成员页添加成员。"""
        page = ProjectMemberPage(admin_logged_in).navigate()
        try:
            page.add_member("admin")
        except Exception:
            admin_logged_in.screenshot(path="_screenshots/proj_member_add_fail.png")
            raise
