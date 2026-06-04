"""
资产管理 Page Object

- /asset/upload          素材上传
- /asset/category        分类管理
- /asset/library         资源库
- /asset/reuse           素材复用
- /asset/tags            标签管理
- /asset/import          资产导入
- /asset/ai-generate     AI 资产生成
- /asset/preview         资产预览
"""
from __future__ import annotations

from pages.base_page import BasePage


class AssetUploadPage(BasePage):
    PATH = "/asset/upload"

    SEL_CLEAR = "button:has-text('清空列表')"
    SEL_START = "button:has-text('开始上传')"
    SEL_DROPZONE = ".el-upload-dragger, [class*='upload-drag']"

    def start_upload(self) -> None:
        """点击开始上传按钮。"""
        self.click(self.SEL_START)


class AssetCategoryPage(BasePage):
    PATH = "/asset/category"

    SEL_NEW = "button:has-text('新增分类')"

    def create_category(self, name: str) -> None:
        """新增分类完整流程：点击新增 -> 输入名称 -> 确认。"""
        self.click(self.SEL_NEW)
        # 等待对话框出现并输入分类名称
        dialog = self.get_dialog()
        dialog.locator("input").first.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()


class AssetLibraryPage(BasePage):
    PATH = "/asset/library"

    SEL_UPLOAD = "button:has-text('上传素材')"
    SEL_BATCH = "button:has-text('批量操作')"
    SEL_VIEW_GRID = "[class*='grid'], [class*='card']"
    SEL_SEARCH = "input[placeholder*='搜索'], input[placeholder*='资产'], input[placeholder*='素材']"

    def search(self, keyword: str) -> None:
        """搜索资产。"""
        try:
            inp = self.page.locator(self.SEL_SEARCH).first
            inp.fill(keyword)
            inp.press("Enter")
            self.wait_loading_disappear()
        except Exception:
            pass

    def batch_operation(self) -> None:
        """点击批量操作按钮。"""
        self.click(self.SEL_BATCH)

    def switch_to_grid_view(self) -> None:
        """切换到网格/卡片视图。"""
        self.click(self.SEL_VIEW_GRID)


class AssetReusePage(BasePage):
    PATH = "/asset/reuse"

    SEL_CREATE = "button:has-text('创建资产引用')"

    def create_asset_reference(self, name: str) -> None:
        """创建资产引用：点击创建 -> 输入名称 -> 确认。"""
        self.click(self.SEL_CREATE)
        dialog = self.get_dialog()
        dialog.locator("input").first.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()


class AssetTagsPage(BasePage):
    PATH = "/asset/tags"

    SEL_NEW = "button:has-text('新增标签')"

    def create_tag(self, name: str) -> None:
        """新增标签完整流程：点击新增 -> 输入名称 -> 确认。"""
        self.click(self.SEL_NEW)
        dialog = self.get_dialog()
        dialog.locator("input").first.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()


class AssetImportPage(BasePage):
    PATH = "/asset/import"

    SEL_NEXT = "button:has-text('下一步')"
    SEL_PREV = "button:has-text('上一步')"
    SEL_START_IMPORT = "button:has-text('开始导入')"
    SEL_FINISH = "button:has-text('完成')"

    def complete_import_wizard(self) -> None:
        """完成导入向导：下一步 -> 开始导入 -> 完成。"""
        self.click(self.SEL_NEXT)
        self.click(self.SEL_START_IMPORT)
        self.click(self.SEL_FINISH)


class AssetAIGeneratePage(BasePage):
    PATH = "/asset/ai-generate"

    SEL_TAB_IMAGE = ".el-tabs__item:has-text('AI生图')"
    SEL_TAB_STYLE = ".el-tabs__item:has-text('风格反推')"
    SEL_TAB_HISTORY = ".el-tabs__item:has-text('生成历史')"
    SEL_PROMPT = "textarea[placeholder*='提示词']"
    SEL_GENERATE = "button:has-text('开始生成')"

    def switch_to_style_tab(self) -> None:
        """切换到风格反推 Tab。"""
        self.click(self.SEL_TAB_STYLE)

    def switch_to_history_tab(self) -> None:
        """切换到生成历史 Tab。"""
        self.click(self.SEL_TAB_HISTORY)

    def generate_with_prompt(self, prompt: str) -> None:
        """输入提示词并点击开始生成。"""
        self.fill(self.SEL_PROMPT, prompt)
        self.click(self.SEL_GENERATE)


class AssetPreviewPage(BasePage):
    PATH = "/asset/preview"

    SEL_BACK = "button:has-text('返回资源库')"

    def back_to_library(self) -> None:
        """点击返回资源库按钮。"""
        self.click(self.SEL_BACK)
