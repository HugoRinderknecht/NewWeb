"""
分镜管理 Page Object

- /storyboard/design        分镜设计
- /storyboard/scene         场景编排
- /storyboard/preview       分镜预览
- /storyboard/batch-edit    批量编辑
"""
from __future__ import annotations

from pages.base_page import BasePage


class StoryboardDesignPage(BasePage):
    PATH = "/storyboard/design"

    SEL_NEW = "button:has-text('新建分镜')"
    SEL_AI_ASSIST = "button:has-text('AI辅助')"
    SEL_SUBMIT_REVIEW = "button:has-text('提交审核')"
    SEL_HISTORY = "button:has-text('版本历史')"

    def create_storyboard(self, name: str) -> None:
        """新建分镜。"""
        try:
            self.click(self.SEL_NEW)
            dialog = self.get_dialog()
            dialog.wait_for(state="visible", timeout=5000)
            inp = dialog.locator("input").first
            inp.fill(name)
            dialog.locator("button:has-text('确定'), button:has-text('确认')").first.click(timeout=2000)
            self.wait_loading_disappear()
        except Exception:
            pass

    def view_history(self) -> None:
        """查看版本历史。"""
        try:
            self.click(self.SEL_HISTORY)
            self.get_dialog().wait_for(state="visible", timeout=5000)
        except Exception:
            pass


class StoryboardScenePage(BasePage):
    PATH = "/storyboard/scene"

    SEL_BATCH_EDIT = "button:has-text('批量编辑')"
    SEL_SAVE = "button:has-text('保存编排')"

    def save_arrangement(self) -> None:
        """保存编排。"""
        try:
            self.click(self.SEL_SAVE)
            self.wait_loading_disappear()
        except Exception:
            pass


class StoryboardPreviewPage(BasePage):
    PATH = "/storyboard/preview"

    SEL_VIEW_STORYBOARD = "input[value='storyboard'], label:has-text('故事板')"
    SEL_VIEW_SLIDE = "label:has-text('幻灯片')"
    SEL_VIEW_TIMELINE = "label:has-text('时间线')"


class StoryboardBatchEditPage(BasePage):
    PATH = "/storyboard/batch-edit"

    SEL_APPLY = "button:has-text('批量应用')"
    SEL_DELETE = "button:has-text('批量删除')"
    SEL_SUBMIT = "button:has-text('批量提交审核')"

    def batch_apply(self) -> None:
        """批量应用。"""
        try:
            self.click(self.SEL_APPLY)
            self.wait_loading_disappear()
        except Exception:
            pass

    def batch_delete(self) -> None:
        """批量删除。"""
        try:
            self.click(self.SEL_DELETE)
            self.wait_loading_disappear()
        except Exception:
            pass

    def batch_submit_review(self) -> None:
        """批量提交审核。"""
        try:
            self.click(self.SEL_SUBMIT)
            self.wait_loading_disappear()
        except Exception:
            pass
