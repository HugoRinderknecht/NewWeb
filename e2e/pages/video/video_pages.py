"""
视频生成 Page Object

- /video-gen/ai        AI 视频生成
- /video-gen/task      任务管理
- /video-gen/preview   视频预览
- /video-gen/history   生成历史
"""
from __future__ import annotations

from pages.base_page import BasePage


class VideoGenAIPage(BasePage):
    PATH = "/video-gen/ai"

    SEL_GENERATE = "button:has-text('生成视频')"
    SEL_MODEL = "input[placeholder*='模型'], .el-select:has-text('模型')"
    SEL_RESOLUTION = ".el-radio-group"
    SEL_DURATION = "input[placeholder*='时长']"
    SEL_SUBMIT = "button:has-text('提交任务')"

    def select_resolution(self, resolution: str) -> None:
        """选择分辨率。"""
        try:
            self.page.locator(self.SEL_RESOLUTION).locator(f"label:has-text('{resolution}')").first.click(timeout=2000)
        except Exception:
            pass

    def set_duration(self, duration: str) -> None:
        """设置时长。"""
        try:
            inp = self.page.locator(self.SEL_DURATION).first
            inp.fill(duration)
        except Exception:
            pass

    def generate_video(self) -> None:
        """生成视频。"""
        try:
            self.click(self.SEL_GENERATE)
            self.wait_loading_disappear()
        except Exception:
            pass


class VideoTaskPage(BasePage):
    PATH = "/video-gen/task"

    SEL_NEW_TASK = "button:has-text('新建任务')"
    SEL_RETRY = "button:has-text('重试')"
    SEL_CANCEL = "button:has-text('取消')"

    def retry_first_task(self) -> None:
        """重试第一个任务。"""
        try:
            self.page.locator(self.SEL_RETRY).first.click(timeout=2000)
            self.wait_loading_disappear()
        except Exception:
            pass

    def cancel_first_task(self) -> None:
        """取消第一个任务。"""
        try:
            self.page.locator(self.SEL_CANCEL).first.click(timeout=2000)
            self.wait_loading_disappear()
        except Exception:
            pass


class VideoPreviewPage(BasePage):
    PATH = "/video-gen/preview"

    SEL_BATCH_DOWNLOAD = "button:has-text('批量下载')"
    SEL_PLAY = "button:has-text('播放')"
    SEL_REGENERATE = "button:has-text('重新生成')"

    def play_video(self) -> None:
        """播放视频。"""
        try:
            self.click(self.SEL_PLAY)
            self.wait_loading_disappear()
        except Exception:
            pass

    def regenerate_video(self) -> None:
        """重新生成视频。"""
        try:
            self.click(self.SEL_REGENERATE)
            self.wait_loading_disappear()
        except Exception:
            pass


class VideoHistoryPage(BasePage):
    PATH = "/video-gen/history"

    SEL_BATCH_EXPORT = "button:has-text('批量导出')"
    SEL_REUSE = "button:has-text('复用')"

    def batch_export(self) -> None:
        """批量导出。"""
        try:
            self.click(self.SEL_BATCH_EXPORT)
            self.wait_loading_disappear()
        except Exception:
            pass

    def reuse_first(self) -> None:
        """复用第一个历史记录。"""
        try:
            self.page.locator(self.SEL_REUSE).first.click(timeout=2000)
            self.wait_loading_disappear()
        except Exception:
            pass
