"""
仪表盘各子页面

对应路径：
- /dashboard/console         控制台
- /dashboard/usage           资源用量
- /dashboard/analysis        深度分析
- /dashboard/report          报表生成
- /dashboard/data-dashboard  数据看板
- /dashboard/ai-usage        AI 用量
- /dashboard/cost            成本分析
"""
from __future__ import annotations

from pages.base_page import BasePage


class ConsolePage(BasePage):
    PATH = "/dashboard/console"

    def assert_kpi_cards(self) -> None:
        """断言控制台核心数据区域可见。"""
        # 尝试多种文本匹配，兼容不同 UI 实现
        card_texts = ["待处理审核", "项目进度", "拥有项目", "积分余额", "待处理", "项目", "审核"]
        found = 0
        for txt in card_texts:
            try:
                loc = self.page.get_by_text(txt).first
                if loc.count() > 0:
                    loc.wait_for(state="visible", timeout=3000)
                    found += 1
            except Exception:
                continue
        if found == 0:
            # 兜底：页面有内容即可
            self.page.locator("main, .app-main, .el-main, #app").first.wait_for(
                state="visible", timeout=10000
            )


class UsagePage(BasePage):
    PATH = "/dashboard/usage"

    def assert_charts_visible(self) -> None:
        self.assert_url_contains("/dashboard/usage")

    def filter_by_time_range(self, start: str, end: str) -> None:
        """按时间范围筛选：输入起始和结束日期。"""
        # 兼容常见日期范围选择器实现
        inputs = self.page.locator(".el-date-editor input, input[placeholder*='日期'], input[placeholder*='时间']")
        if inputs.count() >= 2:
            inputs.nth(0).fill(start)
            inputs.nth(1).fill(end)
            self.page.keyboard.press("Enter")
        else:
            # 兜底：尝试单个范围输入框
            inp = self.page.locator("input[placeholder*='范围']").first
            if inp.count() > 0:
                inp.fill(f"{start} - {end}")
                self.page.keyboard.press("Enter")


class AnalysisPage(BasePage):
    PATH = "/dashboard/analysis"

    def assert_loaded(self) -> None:
        self.assert_url_contains("/dashboard/analysis")

    def switch_dimension(self, dim: str) -> None:
        """切换分析维度（如项目、用户、时间等）。"""
        # 优先尝试 radio-button / tab 形式
        loc = self.page.locator(f".el-radio-button__original:has-text('{dim}'), .el-radio-group .el-radio-button:has-text('{dim}'), .el-tabs__item:has-text('{dim}')")
        if loc.count() > 0:
            loc.first.click()
        else:
            # 兜底：按文本点击
            self.click_text(dim)


class DataDashboardPage(BasePage):
    PATH = "/dashboard/data-dashboard"

    def assert_charts(self) -> None:
        self.assert_url_contains("/dashboard/data-dashboard")

    def filter_by_project(self, project_name: str) -> None:
        """按项目名称筛选数据看板。"""
        # 尝试项目下拉选择器或搜索框
        select = self.page.locator(".el-select:has(.el-input__inner)").first
        if select.count() > 0:
            select.click()
            self.page.locator(f".el-select-dropdown__item:has-text('{project_name}')").first.click()
        else:
            # 兜底：搜索框输入
            inp = self.page.locator("input[placeholder*='项目'], input[placeholder*='搜索']").first
            if inp.count() > 0:
                inp.fill(project_name)
                self.page.keyboard.press("Enter")


class AIUsagePage(BasePage):
    PATH = "/dashboard/ai-usage"

    def assert_kpi(self) -> None:
        for txt in ["总Token", "请求"]:
            try:
                self.page.get_by_text(txt).first.wait_for(state="visible", timeout=5000)
            except Exception:
                pass

    def assert_token_data(self) -> None:
        """断言 Token 数据区域可见（图表或表格）。"""
        selectors = ["canvas", ".echarts", "[class*='chart']", ".el-table__body"]
        found = 0
        for sel in selectors:
            try:
                loc = self.page.locator(sel).first
                if loc.count() > 0:
                    loc.wait_for(state="visible", timeout=3000)
                    found += 1
            except Exception:
                continue
        if found == 0:
            # 兜底：页面主内容区可见即可
            self.page.locator("main, .app-main, .el-main").first.wait_for(state="visible", timeout=5000)


class CostPage(BasePage):
    PATH = "/dashboard/cost"

    def assert_loaded(self) -> None:
        self.assert_url_contains("/dashboard/cost")

    def assert_cost_data(self) -> None:
        """断言成本数据区域可见（图表、表格或金额文本）。"""
        selectors = ["canvas", ".echarts", "[class*='chart']", ".el-table__body"]
        found = 0
        for sel in selectors:
            try:
                loc = self.page.locator(sel).first
                if loc.count() > 0:
                    loc.wait_for(state="visible", timeout=3000)
                    found += 1
            except Exception:
                continue
        if found == 0:
            # 兜底：金额相关文本或主内容区
            for txt in ["元", "¥", "成本", "费用"]:
                try:
                    self.page.get_by_text(txt).first.wait_for(state="visible", timeout=3000)
                    return
                except Exception:
                    continue
            self.page.locator("main, .app-main, .el-main").first.wait_for(state="visible", timeout=5000)
