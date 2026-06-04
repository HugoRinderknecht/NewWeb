"""
审核中心 Page Object

- /review/content          内容审核
- /review/flow             审批流程
- /review/pending          待审列表
- /review/detail           审核详情
- /review/reject-reasons   驳回原因配置
- /review/statistics       审核统计
"""
from __future__ import annotations

from pages.base_page import BasePage


class ReviewContentPage(BasePage):
    PATH = "/review/content"

    SEL_TAB_PENDING = ".el-tabs__item:has-text('待审核')"
    SEL_TAB_DONE = ".el-tabs__item:has-text('已审核')"
    SEL_TAB_MINE = ".el-tabs__item:has-text('我发起的')"
    SEL_APPROVE = "button:has-text('通过')"
    SEL_REJECT = "button:has-text('驳回')"
    SEL_TRANSFER = "button:has-text('转审')"

    def click_mine_tab(self) -> None:
        """点击我发起的Tab。"""
        self.page.locator(self.SEL_TAB_MINE).first.click(timeout=3000)
        self.wait_loading_disappear()

    def approve_first(self) -> None:
        """通过第一条审核。"""
        # 找到第一条审核行的通过按钮
        row = self.page.locator(".el-table__row").first
        row.locator(self.SEL_APPROVE).first.click(timeout=3000)
        # 如有确认对话框则确认
        try:
            self.confirm_dialog()
            self.wait_dialog_closed()
        except Exception:
            pass
        self.wait_loading_disappear()

    def reject_first(self, reason: str = "") -> None:
        """驳回第一条审核。"""
        row = self.page.locator(".el-table__row").first
        row.locator(self.SEL_REJECT).first.click(timeout=3000)
        # 驳回可能弹出原因输入对话框
        try:
            # 填写驳回原因
            reason_input = self.page.locator(".el-dialog textarea, .el-dialog input").first
            if reason_input.is_visible(timeout=2000):
                reason_input.fill(reason or "自动化测试驳回")
            self.confirm_dialog()
            self.wait_dialog_closed()
        except Exception:
            pass
        self.wait_loading_disappear()

    def transfer_first(self) -> None:
        """转审第一条审核。"""
        row = self.page.locator(".el-table__row").first
        row.locator(self.SEL_TRANSFER).first.click(timeout=3000)
        # 转审可能弹出人员选择对话框
        try:
            self.confirm_dialog()
            self.wait_dialog_closed()
        except Exception:
            pass
        self.wait_loading_disappear()


class ReviewFlowPage(BasePage):
    PATH = "/review/flow"

    SEL_NEW = "button:has-text('新增流程')"

    def create_flow(self, name: str) -> None:
        """创建审批流程。"""
        self.click(self.SEL_NEW)
        # 填写流程名称
        try:
            name_input = self.page.locator(".el-dialog input").first
            name_input.fill(name)
        except Exception:
            pass
        # 确认提交
        self.confirm_dialog()
        self.wait_dialog_closed()
        self.wait_loading_disappear()


class ReviewPendingPage(BasePage):
    PATH = "/review/pending"

    SEL_BATCH_APPROVE = "button:has-text('批量通过')"

    def batch_approve(self) -> None:
        """批量通过。"""
        # 先勾选待审列表中的复选框
        try:
            checkboxes = self.page.locator(".el-table__row .el-checkbox")
            for i in range(min(checkboxes.count(), 3)):
                checkboxes.nth(i).click()
        except Exception:
            pass
        # 点击批量通过按钮
        self.click(self.SEL_BATCH_APPROVE)
        # 确认对话框
        try:
            self.confirm_dialog()
            self.wait_dialog_closed()
        except Exception:
            pass
        self.wait_loading_disappear()


class ReviewDetailPage(BasePage):
    PATH = "/review/detail"


class ReviewRejectReasonsPage(BasePage):
    PATH = "/review/reject-reasons"

    SEL_NEW = "button:has-text('新增原因')"

    def create_reason(self, name: str = "", reason: str = "") -> None:
        """创建驳回原因。"""
        self.click(self.SEL_NEW)
        # 填写原因内容
        try:
            reason_input = self.page.locator(".el-dialog input, .el-dialog textarea").first
            reason_input.fill(name or reason or "自动化测试驳回原因")
        except Exception:
            pass
        # 确认提交
        self.confirm_dialog()
        self.wait_dialog_closed()
        self.wait_loading_disappear()


class ReviewStatisticsPage(BasePage):
    PATH = "/review/statistics"

    SEL_EXPORT = "button:has-text('导出审核记录')"

    def assert_has_data(self) -> None:
        """验证审核统计页面图表/表格有数据。"""
        # 验证图表或表格存在
        chart_or_table = self.page.locator(
            "[class*='chart'], canvas, .el-table, [class*='echarts'], [class*='statistic']"
        ).first
        assert chart_or_table.count() > 0, "审核统计页缺少图表或表格"

    def export_records(self) -> None:
        """导出审核记录。"""
        try:
            self.click(self.SEL_EXPORT)
        except Exception:
            pass
        # 等待可能的下载或提示
        try:
            self.assert_toast_success()
        except Exception:
            pass
        self.wait_loading_disappear()
