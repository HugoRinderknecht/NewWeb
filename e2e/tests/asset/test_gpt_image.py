"""
GPT 图片生成子模块测试

对应路径：
- /asset/image-generate
- /asset/image-tasks
- /asset/image-models
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.base_page import BasePage


class AssetImageGeneratePage(BasePage):
    PATH = "/asset/image-generate"


class AssetImageTasksPage(BasePage):
    PATH = "/asset/image-tasks"


class AssetImageModelsPage(BasePage):
    PATH = "/asset/image-models"


@pytest.mark.asset
def test_image_generate_page_loads(page: Page) -> None:
    """ASSET_IMG_001：AI 生图页加载。"""
    AssetImageGeneratePage(page).navigate()
    assert "/asset/image-generate" in page.url


@pytest.mark.asset
def test_image_tasks_page_loads(page: Page) -> None:
    """ASSET_IMG_002：生图任务页加载。"""
    AssetImageTasksPage(page).navigate()
    assert "/asset/image-tasks" in page.url


@pytest.mark.asset
def test_image_models_page_loads(page: Page) -> None:
    """ASSET_IMG_003：生图模型页加载。"""
    AssetImageModelsPage(page).navigate()
    assert "/asset/image-models" in page.url
