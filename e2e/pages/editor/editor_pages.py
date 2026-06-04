"""
剪辑工作台 Page Object

- /editor/edit-manage   剪辑管理
- /editor/timeline      时间线
- /editor/export        导出管理
"""
from __future__ import annotations

from pages.base_page import BasePage


class EditorManagePage(BasePage):
    PATH = "/editor/edit-manage"

    SEL_NEW = "button:has-text('新建剪辑')"
    SEL_EXPORT = "button:has-text('导出')"

    def export_edit(self) -> None:
        """点击导出按钮。"""
        self.click(self.SEL_EXPORT)


class EditorTimelinePage(BasePage):
    PATH = "/editor/timeline"

    SEL_EXPORT = "button:has-text('导出视频')"
    SEL_UNDO = "button:has-text('撤销')"
    SEL_REDO = "button:has-text('重做')"
    SEL_ADD_TRACK = "button:has-text('添加轨道')"

    def undo(self) -> None:
        """点击撤销按钮。"""
        self.click(self.SEL_UNDO)

    def redo(self) -> None:
        """点击重做按钮。"""
        self.click(self.SEL_REDO)


class EditorExportPage(BasePage):
    PATH = "/editor/export"

    SEL_NEW = "button:has-text('新建导出')"
    SEL_DOWNLOAD = "button:has-text('下载')"
    SEL_RETRY = "button:has-text('重试')"

    def download_first(self) -> None:
        """点击第一个下载按钮。"""
        self.page.locator(self.SEL_DOWNLOAD).first.click()

    def retry_first(self) -> None:
        """点击第一个重试按钮。"""
        self.page.locator(self.SEL_RETRY).first.click()
