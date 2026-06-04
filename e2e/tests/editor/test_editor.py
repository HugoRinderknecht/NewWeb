"""
剪辑工作台测试

对应文档：功能模块全面分析文档 §7
- /editor/edit-manage   剪辑管理
- /editor/timeline      时间线
- /editor/export        导出管理
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.editor.editor_pages import (
    EditorExportPage,
    EditorManagePage,
    EditorTimelinePage,
)


@pytest.mark.editor
class TestEditorManage:
    """剪辑管理。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """EDIT_MGT_001：剪辑管理加载。"""
        page = EditorManagePage(admin_logged_in).navigate()
        page.assert_url_contains("/editor/edit-manage")

    def test_new_edit(self, admin_logged_in: Page) -> None:
        """EDIT_MGT_002：新建剪辑。"""
        page = EditorManagePage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新建剪辑')").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/new_edit_fail.png")
            raise

    def test_export_edit(self, admin_logged_in: Page) -> None:
        """EDIT_MGT_003：导出剪辑。"""
        page = EditorManagePage(admin_logged_in).navigate()
        try:
            page.export_edit()
        except Exception:
            page.screenshot(path=f"_screenshots/export_edit_fail.png")
            raise


@pytest.mark.editor
class TestEditorTimeline:
    """时间线。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """EDIT_TL_001：时间线加载。"""
        page = EditorTimelinePage(admin_logged_in).navigate()
        page.assert_url_contains("/editor/timeline")

    def test_add_track(self, admin_logged_in: Page) -> None:
        """EDIT_TL_002：添加轨道。"""
        page = EditorTimelinePage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('添加轨道')").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/add_track_fail.png")
            raise

    def test_export_video(self, admin_logged_in: Page) -> None:
        """EDIT_TL_003：导出视频。"""
        page = EditorTimelinePage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('导出视频')").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/export_video_fail.png")
            raise

    def test_undo_redo(self, admin_logged_in: Page) -> None:
        """EDIT_TL_004：撤销与重做。"""
        page = EditorTimelinePage(admin_logged_in).navigate()
        try:
            page.undo()
            page.redo()
        except Exception:
            page.screenshot(path=f"_screenshots/undo_redo_fail.png")
            raise


@pytest.mark.editor
class TestEditorExport:
    """导出管理。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """EDIT_EXP_001：导出管理加载。"""
        page = EditorExportPage(admin_logged_in).navigate()
        page.assert_url_contains("/editor/export")

    def test_new_export(self, admin_logged_in: Page) -> None:
        """EDIT_EXP_002：新建导出。"""
        page = EditorExportPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新建导出')").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/new_export_fail.png")
            raise

    def test_download_and_retry(self, admin_logged_in: Page) -> None:
        """EDIT_EXP_003：下载与重试。"""
        page = EditorExportPage(admin_logged_in).navigate()
        try:
            page.download_first()
        except Exception:
            page.screenshot(path=f"_screenshots/download_first_fail.png")
            raise
        try:
            page.retry_first()
        except Exception:
            page.screenshot(path=f"_screenshots/retry_first_fail.png")
            raise
