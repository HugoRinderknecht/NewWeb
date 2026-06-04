"""
统计报表页测试

对应路径：/dashboard/report
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.base_page import BasePage


class ReportPage(BasePage):
    PATH = "/dashboard/report"


@pytest.mark.dashboard
def test_report_page_loads(page: Page) -> None:
    """DASH_RPT_001：统计报表页加载。"""
    ReportPage(page).navigate()
    assert "/dashboard/report" in page.url
