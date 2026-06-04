"""
异常页面测试

对应路径：
- /exception/403
- /exception/404
- /exception/500
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.base_page import BasePage


class Exception403Page(BasePage):
    PATH = "/exception/403"

    SEL_BACK_HOME = "button:has-text('返回首页')"


class Exception404Page(BasePage):
    PATH = "/exception/404"

    SEL_BACK_HOME = "button:has-text('返回首页')"


class Exception500Page(BasePage):
    PATH = "/exception/500"

    SEL_BACK_HOME = "button:has-text('返回首页')"


@pytest.mark.ui_only
def test_403_page_loads(page: Page) -> None:
    """EXC_403_001：403 错误页加载。"""
    Exception403Page(page).navigate()
    assert "/exception/403" in page.url


@pytest.mark.ui_only
def test_404_page_loads(page: Page) -> None:
    """EXC_404_001：404 错误页加载。"""
    Exception404Page(page).navigate()
    assert "/exception/404" in page.url


@pytest.mark.ui_only
def test_500_page_loads(page: Page) -> None:
    """EXC_500_001：500 错误页加载。"""
    Exception500Page(page).navigate()
    assert "/exception/500" in page.url


@pytest.mark.ui_only
def test_404_page_content(page: Page) -> None:
    """EXC_404_002：验证 404 页面内容（错误码、提示信息）。"""
    exc_page = Exception404Page(page)
    exc_page.navigate()
    exc_page.assert_text_visible("404")
    exc_page.assert_text_visible("抱歉，您访问的页面不存在")


@pytest.mark.ui_only
def test_404_back_to_home(page: Page) -> None:
    """EXC_404_003：验证返回首页按钮。"""
    exc_page = Exception404Page(page)
    exc_page.navigate()
    exc_page.assert_element_visible(exc_page.SEL_BACK_HOME)
    exc_page.click(exc_page.SEL_BACK_HOME)
    exc_page.wait_loading_disappear()
    assert "/exception/404" not in page.url


@pytest.mark.ui_only
def test_403_page_content(page: Page) -> None:
    """EXC_403_002：验证 403 页面内容。"""
    exc_page = Exception403Page(page)
    exc_page.navigate()
    exc_page.assert_text_visible("403")
    exc_page.assert_text_visible("抱歉，您没有权限访问该页面")


@pytest.mark.ui_only
def test_500_page_content(page: Page) -> None:
    """EXC_500_002：验证 500 页面内容。"""
    exc_page = Exception500Page(page)
    exc_page.navigate()
    exc_page.assert_text_visible("500")
    exc_page.assert_text_visible("抱歉，服务器出错了")


@pytest.mark.ui_only
def test_navigate_to_nonexistent_path(page: Page) -> None:
    """EXC_404_004：从正常页面导航到不存在路径。"""
    exc_page = Exception404Page(page)
    exc_page.navigate()
    exc_page.assert_text_visible("404")
    # 点击返回首页后再访问一个不存在的路径
    exc_page.click(exc_page.SEL_BACK_HOME)
    exc_page.wait_loading_disappear()
    page.goto(exc_page._abs_url("/nonexistent-path-12345"))
    page.wait_for_load_state("domcontentloaded")
    # 预期被路由拦截到 404 页面
    assert "/exception/404" in page.url or "404" in page.content()
