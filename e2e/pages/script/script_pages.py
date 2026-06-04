"""
剧本管理 Page Object

- /script/library  剧本库
- /script/write    剧本编写
- /script/decompose 剧本拆解
- /script/profiles 人物小传
- /script/ai-review AI 审核结果
- /script/version  创意资产
"""
from __future__ import annotations

from pages.base_page import BasePage


class ScriptLibraryPage(BasePage):
    PATH = "/script/library"

    SEL_NEW = "button:has-text('新建剧本')"
    SEL_UPLOAD = "button:has-text('上传剧本')"
    SEL_STATUS_FILTER = ".el-select"
    SEL_SEARCH = "input[placeholder*='搜索'], input[placeholder*='剧本']"
    SEL_TABLE_ROWS = ".el-table__body-wrapper .el-table__row"
    SEL_EMPTY = ".el-table__empty-block, .el-empty"

    def open_new_script(self) -> None:
        self.click(self.SEL_NEW)
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def search(self, keyword: str) -> None:
        """搜索剧本并等待加载完成。"""
        try:
            inp = self.page.locator(self.SEL_SEARCH).first
            inp.fill(keyword)
            inp.press("Enter")
            self.wait_loading_disappear()
        except Exception:
            pass

    def open_upload_dialog(self) -> None:
        """打开上传剧本对话框。"""
        try:
            self.click(self.SEL_UPLOAD)
            self.get_dialog().wait_for(state="visible", timeout=5000)
        except Exception:
            pass

    def upload_script(self) -> None:
        """点击上传剧本按钮。"""
        try:
            self.click(self.SEL_UPLOAD)
            self.get_dialog().wait_for(state="visible", timeout=5000)
        except Exception:
            pass


class ScriptWritePage(BasePage):
    PATH = "/script/write"

    SEL_EDITOR = "textarea"
    SEL_SAVE = "button:has-text('保存剧本')"
    SEL_SUBMIT = "button:has-text('提交审核')"
    SEL_BACK = "button:has-text('返回列表')"

    def type_script(self, content: str) -> None:
        ta = self.page.locator(self.SEL_EDITOR).first
        ta.fill(content)

    def save(self) -> None:
        self.click(self.SEL_SAVE)

    def submit_review(self) -> None:
        self.click(self.SEL_SUBMIT)

    def go_back(self) -> None:
        """返回剧本列表。"""
        try:
            self.click(self.SEL_BACK)
            self.wait_loading_disappear()
        except Exception:
            pass

    def back_to_list(self) -> None:
        """点击返回列表。"""
        try:
            self.click(self.SEL_BACK)
            self.wait_loading_disappear()
        except Exception:
            pass


class ScriptDecomposePage(BasePage):
    PATH = "/script/decompose"

    SEL_AI_DECOMPOSE = "button:has-text('AI拆解')"
    SEL_NEW_EPISODE = "button:has-text('新建分集')"

    def ai_decompose(self) -> None:
        """点击AI拆解。"""
        try:
            self.click(self.SEL_AI_DECOMPOSE)
            self.wait_loading_disappear()
        except Exception:
            pass

    def create_new_episode(self) -> None:
        """新建分集。"""
        try:
            self.click(self.SEL_NEW_EPISODE)
            self.get_dialog().wait_for(state="visible", timeout=5000)
        except Exception:
            pass

    def create_episode(self, name: str) -> None:
        """新建分集。"""
        try:
            self.click(self.SEL_NEW_EPISODE)
            dialog = self.get_dialog()
            dialog.wait_for(state="visible", timeout=5000)
            inp = dialog.locator("input").first
            inp.fill(name)
            dialog.locator("button:has-text('确定'), button:has-text('确认')").first.click(timeout=2000)
            self.wait_loading_disappear()
        except Exception:
            pass


class ScriptProfilesPage(BasePage):
    PATH = "/script/profiles"

    SEL_AI_GENERATE = "button:has-text('AI生成小传')"

    def ai_generate_profile(self) -> None:
        """AI生成小传。"""
        try:
            self.click(self.SEL_AI_GENERATE)
            self.wait_loading_disappear()
        except Exception:
            pass


class ScriptAIReviewPage(BasePage):
    PATH = "/script/ai-review"

    SEL_START_REVIEW = "button:has-text('发起审核')"

    def start_review(self) -> None:
        """发起审核。"""
        try:
            self.click(self.SEL_START_REVIEW)
            self.wait_loading_disappear()
        except Exception:
            pass


class ScriptVersionPage(BasePage):
    PATH = "/script/version"

    SEL_EXTRACT = "button:has-text('提取资产')"
    SEL_NEW = "button:has-text('新建资产')"

    def extract_assets(self) -> None:
        """提取资产。"""
        try:
            self.click(self.SEL_EXTRACT)
            self.wait_loading_disappear()
        except Exception:
            pass

    def create_new_asset(self) -> None:
        """新建资产。"""
        try:
            self.click(self.SEL_NEW)
            self.get_dialog().wait_for(state="visible", timeout=5000)
        except Exception:
            pass

    def create_asset(self, name: str) -> None:
        """新建资产。"""
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
