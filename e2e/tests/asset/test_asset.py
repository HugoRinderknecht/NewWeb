"""
资产管理测试

对应文档：功能模块全面分析文档 §9
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

import pytest
from playwright.sync_api import Page

from pages.asset.asset_pages import (
    AssetAIGeneratePage,
    AssetCategoryPage,
    AssetImportPage,
    AssetLibraryPage,
    AssetPreviewPage,
    AssetReusePage,
    AssetTagsPage,
    AssetUploadPage,
)


@pytest.mark.asset
class TestAssetUpload:
    """素材上传。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_UP_001：上传页加载。"""
        page = AssetUploadPage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/upload")

    def test_dropzone_visible(self, admin_logged_in: Page) -> None:
        """ASSET_UP_002：拖拽区可见。"""
        page = AssetUploadPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-upload-dragger, [class*='upload-drag']").first.wait_for(
                state="visible", timeout=5000
            )
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_dropzone_visible_fail.png")
            raise

    def test_clear_list(self, admin_logged_in: Page) -> None:
        """ASSET_UP_003：清空列表按钮。"""
        page = AssetUploadPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('清空列表')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_clear_list_fail.png")
            raise

    def test_start_upload(self, admin_logged_in: Page) -> None:
        """ASSET_UP_004：开始上传按钮。"""
        page = AssetUploadPage(admin_logged_in).navigate()
        try:
            page.start_upload()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_start_upload_fail.png")
            raise


@pytest.mark.asset
class TestAssetCategory:
    """分类管理。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_CAT_001：分类页加载。"""
        page = AssetCategoryPage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/category")

    def test_new_category(self, admin_logged_in: Page) -> None:
        """ASSET_CAT_002：新增分类。"""
        page = AssetCategoryPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新增分类')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_new_category_fail.png")
            raise

    def test_create_category_full_flow(self, admin_logged_in: Page) -> None:
        """ASSET_CAT_003：新增分类完整流程。"""
        page = AssetCategoryPage(admin_logged_in).navigate()
        try:
            page.create_category("自动化测试分类")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_create_category_full_flow_fail.png")
            raise


@pytest.mark.asset
class TestAssetLibrary:
    """资源库。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_LIB_001：资源库加载。"""
        page = AssetLibraryPage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/library")

    def test_upload_button(self, admin_logged_in: Page) -> None:
        """ASSET_LIB_002：上传素材按钮。"""
        page = AssetLibraryPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('上传素材')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_upload_button_fail.png")
            raise

    def test_search(self, admin_logged_in: Page) -> None:
        """ASSET_LIB_003：搜索资产。"""
        page = AssetLibraryPage(admin_logged_in).navigate()
        try:
            page.search("test")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_search_fail.png")
            raise

    def test_batch_operation(self, admin_logged_in: Page) -> None:
        """ASSET_LIB_004：批量操作按钮。"""
        page = AssetLibraryPage(admin_logged_in).navigate()
        try:
            page.batch_operation()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_batch_operation_fail.png")
            raise

    def test_switch_grid_view(self, admin_logged_in: Page) -> None:
        """ASSET_LIB_005：切换到网格视图。"""
        page = AssetLibraryPage(admin_logged_in).navigate()
        try:
            page.switch_to_grid_view()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_switch_grid_view_fail.png")
            raise


@pytest.mark.asset
class TestAssetReuse:
    """素材复用。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_RE_001：复用页加载。"""
        page = AssetReusePage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/reuse")

    def test_create_asset_reference(self, admin_logged_in: Page) -> None:
        """ASSET_RE_002：创建资产引用。"""
        page = AssetReusePage(admin_logged_in).navigate()
        try:
            page.create_asset_reference("自动化测试引用")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_create_reference_fail.png")
            raise


@pytest.mark.asset
class TestAssetTags:
    """标签管理。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_TAG_001：标签页加载。"""
        page = AssetTagsPage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/tags")

    def test_new_tag(self, admin_logged_in: Page) -> None:
        """ASSET_TAG_002：新增标签。"""
        page = AssetTagsPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新增标签')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_new_tag_fail.png")
            raise

    def test_create_tag_full_flow(self, admin_logged_in: Page) -> None:
        """ASSET_TAG_003：新增标签完整流程。"""
        page = AssetTagsPage(admin_logged_in).navigate()
        try:
            page.create_tag("自动化测试标签")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_create_tag_full_flow_fail.png")
            raise


@pytest.mark.asset
class TestAssetImport:
    """资产导入。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_IMP_001：导入页加载。"""
        page = AssetImportPage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/import")

    def test_wizard_steps(self, admin_logged_in: Page) -> None:
        """ASSET_IMP_002：向导步骤。"""
        page = AssetImportPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('下一步')").first.click(timeout=2000)
            admin_logged_in.wait_for_timeout(500)
            admin_logged_in.locator("button:has-text('上一步')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_wizard_steps_fail.png")
            raise

    def test_import_wizard_complete(self, admin_logged_in: Page) -> None:
        """ASSET_IMP_003：完成导入向导。"""
        page = AssetImportPage(admin_logged_in).navigate()
        try:
            page.complete_import_wizard()
        except Exception:
            page.screenshot(path=f"_screenshots/asset_import_wizard_complete_fail.png")
            raise


@pytest.mark.asset
class TestAssetAIGenerate:
    """AI 资产生成。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_AI_001：AI 生成页加载。"""
        page = AssetAIGeneratePage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/ai-generate")

    def test_tab_image(self, admin_logged_in: Page) -> None:
        """ASSET_AI_002：AI 生图 Tab。"""
        page = AssetAIGeneratePage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-tabs__item:has-text('AI生图')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_ai_tab_image_fail.png")
            raise

    def test_generate(self, admin_logged_in: Page) -> None:
        """ASSET_AI_003：开始生成。"""
        page = AssetAIGeneratePage(admin_logged_in).navigate()
        try:
            prompt = admin_logged_in.locator("textarea[placeholder*='提示词']").first
            prompt.fill("测试提示词")
            admin_logged_in.locator("button:has-text('开始生成')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_ai_generate_fail.png")
            raise

    def test_ai_style_tab(self, admin_logged_in: Page) -> None:
        """ASSET_AI_004：风格反推 Tab。"""
        page = AssetAIGeneratePage(admin_logged_in).navigate()
        try:
            page.switch_to_style_tab()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_ai_style_tab_fail.png")
            raise

    def test_ai_history_tab(self, admin_logged_in: Page) -> None:
        """ASSET_AI_005：生成历史 Tab。"""
        page = AssetAIGeneratePage(admin_logged_in).navigate()
        try:
            page.switch_to_history_tab()
        except Exception:
            page.screenshot(path=f"_screenshots/asset_ai_history_tab_fail.png")
            raise

    def test_generate_with_prompt(self, admin_logged_in: Page) -> None:
        """ASSET_AI_006：输入提示词并生成。"""
        page = AssetAIGeneratePage(admin_logged_in).navigate()
        try:
            page.generate_with_prompt("自动化测试提示词")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_generate_with_prompt_fail.png")
            raise


@pytest.mark.asset
class TestAssetPreview:
    """资产预览。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """ASSET_PRV_001：预览页加载。"""
        page = AssetPreviewPage(admin_logged_in).navigate()
        page.assert_url_contains("/asset/preview")

    def test_preview_back_to_library(self, admin_logged_in: Page) -> None:
        """ASSET_PRV_002：返回资源库。"""
        page = AssetPreviewPage(admin_logged_in).navigate()
        try:
            page.back_to_library()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/asset_preview_back_to_library_fail.png")
            raise
