"""
分镜管理测试

对应文档：功能模块全面分析文档 §5
- /storyboard/design        分镜设计
- /storyboard/scene         场景编排
- /storyboard/preview       分镜预览
- /storyboard/batch-edit    批量编辑
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.storyboard.storyboard_pages import (
    StoryboardBatchEditPage,
    StoryboardDesignPage,
    StoryboardPreviewPage,
    StoryboardScenePage,
)


@pytest.mark.storyboard
class TestStoryboardDesign:
    """分镜设计。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """STORY_DES_001：分镜设计加载。"""
        page = StoryboardDesignPage(admin_logged_in).navigate()
        page.assert_url_contains("/storyboard/design")

    def test_new_storyboard_button(self, admin_logged_in: Page) -> None:
        """STORY_DES_002：新建分镜按钮。"""
        page = StoryboardDesignPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新建分镜')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_new_button_fail.png")
            raise

    def test_ai_assist(self, admin_logged_in: Page) -> None:
        """STORY_DES_003：AI 辅助按钮。"""
        page = StoryboardDesignPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('AI辅助')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_ai_assist_fail.png")
            raise

    def test_submit_review(self, admin_logged_in: Page) -> None:
        """STORY_DES_004：提交审核。"""
        page = StoryboardDesignPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('提交审核')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_submit_review_fail.png")
            raise

    def test_create_storyboard(self, admin_logged_in: Page) -> None:
        """STORY_DES_005：新建分镜。"""
        page = StoryboardDesignPage(admin_logged_in).navigate()
        try:
            page.create_storyboard("测试分镜")
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_create_fail.png")
            raise

    def test_view_history(self, admin_logged_in: Page) -> None:
        """STORY_DES_006：查看版本历史。"""
        page = StoryboardDesignPage(admin_logged_in).navigate()
        try:
            page.view_history()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_view_history_fail.png")
            raise


@pytest.mark.storyboard
class TestStoryboardScene:
    """场景编排。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """STORY_SCN_001：场景编排加载。"""
        page = StoryboardScenePage(admin_logged_in).navigate()
        page.assert_url_contains("/storyboard/scene")

    def test_batch_edit(self, admin_logged_in: Page) -> None:
        """STORY_SCN_002：批量编辑入口。"""
        page = StoryboardScenePage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('批量编辑')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_batch_edit_fail.png")
            raise

    def test_save_arrangement(self, admin_logged_in: Page) -> None:
        """STORY_SCN_003：保存编排。"""
        page = StoryboardScenePage(admin_logged_in).navigate()
        try:
            page.save_arrangement()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_save_arrangement_fail.png")
            raise


@pytest.mark.storyboard
class TestStoryboardPreview:
    """分镜预览。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """STORY_PRV_001：预览页加载。"""
        page = StoryboardPreviewPage(admin_logged_in).navigate()
        page.assert_url_contains("/storyboard/preview")

    def test_view_switch(self, admin_logged_in: Page) -> None:
        """STORY_PRV_002：视图切换。"""
        page = StoryboardPreviewPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("label:has-text('时间线')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_view_switch_fail.png")
            raise


@pytest.mark.storyboard
class TestStoryboardBatchEdit:
    """批量编辑。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """STORY_BAT_001：批量编辑加载。"""
        page = StoryboardBatchEditPage(admin_logged_in).navigate()
        page.assert_url_contains("/storyboard/batch-edit")

    def test_batch_operations(self, admin_logged_in: Page) -> None:
        """STORY_BAT_002：批量应用、删除、提交审核。"""
        page = StoryboardBatchEditPage(admin_logged_in).navigate()
        try:
            page.batch_apply()
            admin_logged_in.wait_for_timeout(500)
            page.batch_delete()
            admin_logged_in.wait_for_timeout(500)
            page.batch_submit_review()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/storyboard_batch_operations_fail.png")
            raise
