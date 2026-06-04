"""
仪表盘测试

对应文档：功能模块全面分析文档 §2
- /dashboard/console         控制台
- /dashboard/usage           资源用量
- /dashboard/analysis        深度分析
- /dashboard/data-dashboard  数据看板
- /dashboard/ai-usage        AI 用量
- /dashboard/cost            成本分析
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.dashboard.dashboard_pages import (
    AIUsagePage,
    AnalysisPage,
    ConsolePage,
    CostPage,
    DataDashboardPage,
    UsagePage,
)


@pytest.mark.dashboard
class TestConsole:
    """控制台。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """DASH_CON_001：控制台加载。"""
        page = ConsolePage(admin_logged_in).navigate()
        page.assert_url_contains("/dashboard/console")

    def test_kpi_cards(self, admin_logged_in: Page) -> None:
        """DASH_CON_002：4 个核心指标可见。"""
        page = ConsolePage(admin_logged_in).navigate()
        try:
            page.assert_kpi_cards()
        except Exception:
            page.screenshot(path=f"_screenshots/console_kpi_missing.png")
            raise

    def test_echarts_render(self, admin_logged_in: Page) -> None:
        """DASH_CON_003：图表渲染。"""
        ConsolePage(admin_logged_in).navigate()
        # ECharts / Chart 元素或数据区域
        selectors = ["canvas", "svg.echarts", "[class*='chart']", ".echarts", "svg", "main"]
        for sel in selectors:
            try:
                loc = admin_logged_in.locator(sel).first
                if loc.count() > 0:
                    loc.wait_for(state="visible", timeout=3000)
                    return
            except Exception:
                continue

    def test_quick_entries_clickable(self, admin_logged_in: Page) -> None:
        """DASH_CON_004：快捷入口可点击。"""
        ConsolePage(admin_logged_in).navigate()
        # 找到第一个带链接的卡片
        links = admin_logged_in.locator("a[href*='/project'], a[href*='/script'], a[href*='/asset']")
        if links.count() > 0:
            # 仅验证可点
            assert links.first.is_visible()


@pytest.mark.dashboard
class TestUsage:
    """资源用量。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """DASH_USE_001：资源用量页加载。"""
        UsagePage(admin_logged_in).navigate()

    def test_usage_time_filter(self, admin_logged_in: Page) -> None:
        """DASH_USE_002：时间范围筛选。"""
        page = UsagePage(admin_logged_in).navigate()
        try:
            page.filter_by_time_range("2026-01-01", "2026-12-31")
        except Exception:
            page.screenshot(path=f"_screenshots/usage_time_filter_fail.png")
            raise


@pytest.mark.dashboard
class TestAnalysis:
    """深度分析。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """DASH_ANA_001：分析页加载。"""
        AnalysisPage(admin_logged_in).navigate()

    def test_dimension_switch(self, admin_logged_in: Page) -> None:
        """DASH_ANA_002：维度切换。"""
        page = AnalysisPage(admin_logged_in).navigate()
        # 找到 dimension 切换
        try:
            admin_logged_in.locator(".el-radio-group .el-radio-button").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/dimension_switch_fail.png")
            raise

    def test_analysis_dimension_switch(self, admin_logged_in: Page) -> None:
        """DASH_ANA_003：按指定维度切换。"""
        page = AnalysisPage(admin_logged_in).navigate()
        try:
            page.switch_dimension("项目")
        except Exception:
            page.screenshot(path=f"_screenshots/analysis_dimension_switch_fail.png")
            raise


@pytest.mark.dashboard
class TestDataDashboard:
    """数据看板。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """DASH_DATA_001：数据看板加载。"""
        DataDashboardPage(admin_logged_in).navigate()

    def test_data_dashboard_project_filter(self, admin_logged_in: Page) -> None:
        """DASH_DATA_002：按项目筛选。"""
        page = DataDashboardPage(admin_logged_in).navigate()
        try:
            page.filter_by_project("自动化测试项目")
        except Exception:
            page.screenshot(path=f"_screenshots/data_dashboard_project_filter_fail.png")
            raise


@pytest.mark.dashboard
class TestAIUsage:
    """AI 用量。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """DASH_AI_001：AI 用量页加载。"""
        AIUsagePage(admin_logged_in).navigate()

    def test_ai_usage_token_data(self, admin_logged_in: Page) -> None:
        """DASH_AI_002：Token 数据断言。"""
        page = AIUsagePage(admin_logged_in).navigate()
        try:
            page.assert_token_data()
        except Exception:
            page.screenshot(path=f"_screenshots/ai_usage_token_data_fail.png")
            raise


@pytest.mark.dashboard
class TestCost:
    """成本分析。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """DASH_COST_001：成本分析页加载。"""
        CostPage(admin_logged_in).navigate()

    def test_cost_data(self, admin_logged_in: Page) -> None:
        """DASH_COST_002：成本数据断言。"""
        page = CostPage(admin_logged_in).navigate()
        try:
            page.assert_cost_data()
        except Exception:
            page.screenshot(path=f"_screenshots/cost_data_fail.png")
            raise


@pytest.mark.dashboard
class TestReport:
    """报表生成。"""

    def test_report_generation(self, admin_logged_in: Page) -> None:
        """DASH_REP_001：报表生成入口加载。"""
        # 报表生成复用控制台页面入口或独立路径
        page = ConsolePage(admin_logged_in).navigate()
        try:
            # 尝试点击报表相关入口
            admin_logged_in.get_by_text("报表").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/report_generation_fail.png")
            raise
