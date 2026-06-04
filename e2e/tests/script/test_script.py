"""
剧本管理测试

对应文档：功能模块全面分析文档 §4
- /script/library    剧本库
- /script/write      剧本编写
- /script/decompose  剧本拆解
- /script/profiles   人物小传
- /script/ai-review  AI 审核
- /script/version    创意资产
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.script.script_pages import (
    ScriptAIReviewPage,
    ScriptDecomposePage,
    ScriptLibraryPage,
    ScriptProfilesPage,
    ScriptVersionPage,
    ScriptWritePage,
)


@pytest.mark.script
class TestScriptLibrary:
    """剧本库。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_001：剧本库加载。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        page.assert_url_contains("/script/library")

    def test_new_script_button(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_002：新建剧本按钮。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        try:
            page.open_new_script()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_new_script_button_fail.png")
            raise

    def test_search(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_003：搜索剧本。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        try:
            page.search("test")
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_search_fail.png")
            raise

    def test_status_filter(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_004：按状态筛选。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-select").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(300)
            admin_logged_in.keyboard.press("Escape")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_status_filter_fail.png")
            raise

    def test_upload_dialog(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_005：上传剧本对话框。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        try:
            page.open_upload_dialog()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_upload_dialog_fail.png")
            raise

    def test_upload_script_button(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_007：点击上传剧本按钮。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        try:
            page.upload_script()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_upload_script_button_fail.png")
            raise

    def test_search_verify(self, admin_logged_in: Page) -> None:
        """SCRIPT_LIB_006：搜索剧本验证结果。"""
        page = ScriptLibraryPage(admin_logged_in).navigate()
        page.search("测试剧本")
        admin_logged_in.wait_for_timeout(1500)
        # 断言表格有结果或显示空状态
        has_rows = page.table_row_count(ScriptLibraryPage.SEL_TABLE_ROWS) > 0
        has_empty = admin_logged_in.locator(ScriptLibraryPage.SEL_EMPTY).count() > 0
        assert has_rows or has_empty, "搜索后应显示表格结果或空状态"


@pytest.mark.script
class TestScriptWrite:
    """剧本编写。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_001：编写页加载。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        page.assert_url_contains("/script/write")

    def test_editor_visible(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_002：编辑器可见。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        admin_logged_in.locator("textarea, [contenteditable='true']").first.wait_for(
            state="visible", timeout=10000
        )

    def test_type_content(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_003：输入内容。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        try:
            page.type_script("第一场：测试剧本内容...")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_type_content_fail.png")
            raise

    def test_save(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_004：保存剧本。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        try:
            page.type_script("测试保存")
            page.save()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_save_fail.png")
            raise

    def test_submit_review(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_005：提交审核。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        try:
            page.submit_review()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_submit_review_fail.png")
            raise

    def test_go_back(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_006：返回列表。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        try:
            page.go_back()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_go_back_fail.png")
            raise

    def test_write_and_back_to_list(self, admin_logged_in: Page) -> None:
        """SCRIPT_W_007：编写后返回列表。"""
        page = ScriptWritePage(admin_logged_in).navigate()
        try:
            page.type_script("测试编写后返回")
            page.back_to_list()
            admin_logged_in.wait_for_timeout(1000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_write_and_back_to_list_fail.png")
            raise


@pytest.mark.script
class TestScriptDecompose:
    """剧本拆解。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """SCRIPT_DEC_001：拆解页加载。"""
        page = ScriptDecomposePage(admin_logged_in).navigate()
        page.assert_url_contains("/script/decompose")

    def test_ai_decompose_button(self, admin_logged_in: Page) -> None:
        """SCRIPT_DEC_002：AI 拆解按钮。"""
        page = ScriptDecomposePage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('AI拆解')").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            page.screenshot(path=f"_screenshots/script_ai_decompose_button_fail.png")
            raise

    def test_create_new_episode(self, admin_logged_in: Page) -> None:
        """SCRIPT_DEC_003：新建分集操作。"""
        page = ScriptDecomposePage(admin_logged_in).navigate()
        try:
            page.create_new_episode()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_create_new_episode_fail.png")
            raise

    def test_ai_decompose(self, admin_logged_in: Page) -> None:
        """SCRIPT_DEC_004：AI拆解。"""
        page = ScriptDecomposePage(admin_logged_in).navigate()
        try:
            page.ai_decompose()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_ai_decompose_fail.png")
            raise

    def test_create_episode(self, admin_logged_in: Page) -> None:
        """SCRIPT_DEC_005：新建分集（带名称）。"""
        page = ScriptDecomposePage(admin_logged_in).navigate()
        try:
            page.create_episode("第一集")
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_create_episode_fail.png")
            raise


@pytest.mark.script
class TestScriptProfiles:
    """人物小传。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """SCRIPT_PR_001：小传页加载。"""
        ScriptProfilesPage(admin_logged_in).navigate()

    def test_ai_generate(self, admin_logged_in: Page) -> None:
        """SCRIPT_PR_002：AI 生成小传。"""
        page = ScriptProfilesPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('AI生成小传')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_ai_generate_profile_fail.png")
            raise

    def test_ai_generate_profile(self, admin_logged_in: Page) -> None:
        """SCRIPT_PR_004：AI生成小传（页面对象方法）。"""
        page = ScriptProfilesPage(admin_logged_in).navigate()
        try:
            page.ai_generate_profile()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_ai_generate_profile_method_fail.png")
            raise

    def test_profiles_content(self, admin_logged_in: Page) -> None:
        """SCRIPT_PR_003：人物小传列表内容验证。"""
        page = ScriptProfilesPage(admin_logged_in).navigate()
        admin_logged_in.wait_for_timeout(1000)
        # 断言页面有表格内容或空状态
        has_rows = page.table_row_count() > 0
        has_empty = admin_logged_in.locator(".el-table__empty-block, .el-empty").count() > 0
        assert has_rows or has_empty, "人物小传列表应显示内容或空状态"


@pytest.mark.script
class TestScriptAIReview:
    """AI 审核。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """SCRIPT_AR_001：审核页加载。"""
        ScriptAIReviewPage(admin_logged_in).navigate()

    def test_start_review(self, admin_logged_in: Page) -> None:
        """SCRIPT_AR_002：发起审核。"""
        page = ScriptAIReviewPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('发起审核')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_start_review_fail.png")
            raise

    def test_start_review_page_object(self, admin_logged_in: Page) -> None:
        """SCRIPT_AR_003：发起审核（页面对象方法）。"""
        page = ScriptAIReviewPage(admin_logged_in).navigate()
        try:
            page.start_review()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_start_review_page_object_fail.png")
            raise


@pytest.mark.script
class TestScriptVersion:
    """创意资产。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """SCRIPT_V_001：创意资产页加载。"""
        page = ScriptVersionPage(admin_logged_in).navigate()
        page.assert_url_contains("/script/version")

    def test_extract_assets(self, admin_logged_in: Page) -> None:
        """SCRIPT_V_002：提取资产。"""
        page = ScriptVersionPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('提取资产')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_extract_assets_fail.png")
            raise

    def test_create_new_asset(self, admin_logged_in: Page) -> None:
        """SCRIPT_V_003：新建资产操作。"""
        page = ScriptVersionPage(admin_logged_in).navigate()
        try:
            page.create_new_asset()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_create_new_asset_fail.png")
            raise

    def test_extract_and_create_asset(self, admin_logged_in: Page) -> None:
        """SCRIPT_V_004：提取资产并新建资产。"""
        page = ScriptVersionPage(admin_logged_in).navigate()
        try:
            page.extract_assets()
            admin_logged_in.wait_for_timeout(500)
            page.create_asset("测试资产")
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/script_extract_and_create_asset_fail.png")
            raise
