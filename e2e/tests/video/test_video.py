"""
视频生成测试

对应文档：功能模块全面分析文档 §6
- /video-gen/ai        AI 视频生成
- /video-gen/task      任务管理
- /video-gen/preview   视频预览
- /video-gen/history   生成历史
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.video.video_pages import (
    VideoGenAIPage,
    VideoHistoryPage,
    VideoPreviewPage,
    VideoTaskPage,
)


@pytest.mark.video
class TestVideoGenAI:
    """AI 视频生成。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """VID_AI_001：AI 生成页加载。"""
        page = VideoGenAIPage(admin_logged_in).navigate()
        page.assert_url_contains("/video-gen/ai")

    def test_form_visible(self, admin_logged_in: Page) -> None:
        """VID_AI_002：生成表单可见。"""
        page = VideoGenAIPage(admin_logged_in).navigate()
        # 至少有表单
        admin_logged_in.locator("form, .el-form, .form").first.wait_for(
            state="visible", timeout=10000
        )

    def test_model_selector(self, admin_logged_in: Page) -> None:
        """VID_AI_003：模型选择器。"""
        page = VideoGenAIPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-select").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(500)
            admin_logged_in.keyboard.press("Escape")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_model_selector_fail.png")
            raise

    def test_submit_task(self, admin_logged_in: Page) -> None:
        """VID_AI_004：提交生成任务。"""
        page = VideoGenAIPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('提交任务'), button:has-text('生成视频')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_submit_task_fail.png")
            raise

    def test_set_resolution_and_duration(self, admin_logged_in: Page) -> None:
        """VID_AI_005：设置分辨率和时长。"""
        page = VideoGenAIPage(admin_logged_in).navigate()
        try:
            page.select_resolution("1080P")
            page.set_duration("10")
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_set_resolution_duration_fail.png")
            raise

    def test_generate_video(self, admin_logged_in: Page) -> None:
        """VID_AI_006：生成视频。"""
        page = VideoGenAIPage(admin_logged_in).navigate()
        try:
            page.generate_video()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_generate_video_fail.png")
            raise


@pytest.mark.video
class TestVideoTask:
    """任务管理。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """VID_TASK_001：任务管理加载。"""
        page = VideoTaskPage(admin_logged_in).navigate()
        page.assert_url_contains("/video-gen/task")

    def test_status_filter(self, admin_logged_in: Page) -> None:
        """VID_TASK_002：状态筛选。"""
        page = VideoTaskPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-select").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(300)
            admin_logged_in.keyboard.press("Escape")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_task_status_filter_fail.png")
            raise

    def test_retry_and_cancel_task(self, admin_logged_in: Page) -> None:
        """VID_TASK_003：重试和取消任务。"""
        page = VideoTaskPage(admin_logged_in).navigate()
        try:
            page.retry_first_task()
            admin_logged_in.wait_for_timeout(500)
            page.cancel_first_task()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_retry_cancel_task_fail.png")
            raise


@pytest.mark.video
class TestVideoPreview:
    """视频预览。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """VID_PRV_001：预览页加载。"""
        page = VideoPreviewPage(admin_logged_in).navigate()
        page.assert_url_contains("/video-gen/preview")

    def test_play_and_regenerate(self, admin_logged_in: Page) -> None:
        """VID_PRV_002：播放和重新生成。"""
        page = VideoPreviewPage(admin_logged_in).navigate()
        try:
            page.play_video()
            admin_logged_in.wait_for_timeout(500)
            page.regenerate_video()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            page.screenshot(path=f"_screenshots/video_play_and_regenerate_fail.png")
            raise


@pytest.mark.video
class TestVideoHistory:
    """生成历史。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """VID_HIS_001：历史页加载。"""
        page = VideoHistoryPage(admin_logged_in).navigate()
        page.assert_url_contains("/video-gen/history")

    def test_batch_export_and_reuse(self, admin_logged_in: Page) -> None:
        """VID_HIS_002：批量导出和复用。"""
        page = VideoHistoryPage(admin_logged_in).navigate()
        try:
            page.batch_export()
            admin_logged_in.wait_for_timeout(500)
            page.reuse_first()
            admin_logged_in.wait_for_timeout(500)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/video_batch_export_reuse_fail.png")
            raise
