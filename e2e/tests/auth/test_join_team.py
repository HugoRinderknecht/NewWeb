"""
加入团队页测试

对应路径：/auth/join-team
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.base_page import BasePage


class JoinTeamPage(BasePage):
    PATH = "/auth/join-team"


@pytest.mark.auth
def test_join_team_page_loads(page: Page) -> None:
    """AUTH_JT_001：加入团队页加载。"""
    JoinTeamPage(page).navigate()
    assert "/auth/join-team" in page.url


@pytest.mark.auth
def test_join_team_has_form(page: Page) -> None:
    """AUTH_JT_002：加入团队页有表单元素。"""
    JoinTeamPage(page).navigate()
    has_input = page.locator("input").count() >= 1
    has_button = page.locator("button").count() >= 1
    assert has_input or has_button, "加入团队页应有输入框或按钮"
