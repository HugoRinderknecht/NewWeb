"""
审核中心测试

对应文档：功能模块全面分析文档 §8
- /review/content          内容审核
- /review/flow             审批流程
- /review/pending          待审列表
- /review/detail           审核详情
- /review/reject-reasons   驳回原因配置
- /review/statistics       审核统计
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.review.review_pages import (
    ReviewContentPage,
    ReviewDetailPage,
    ReviewFlowPage,
    ReviewPendingPage,
    ReviewRejectReasonsPage,
    ReviewStatisticsPage,
)


@pytest.mark.review
class TestReviewContent:
    """内容审核。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """REV_CON_001：内容审核加载。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        page.assert_url_contains("/review/content")

    def test_pending_tab(self, admin_logged_in: Page) -> None:
        """REV_CON_002：待审核 Tab。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-tabs__item:has-text('待审核')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_pending_tab_fail.png")
            raise

    def test_done_tab(self, admin_logged_in: Page) -> None:
        """REV_CON_003：已审核 Tab。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator(".el-tabs__item:has-text('已审核')").first.click(timeout=2000)
        except Exception:
            page.screenshot(path=f"_screenshots/review_done_tab_fail.png")
            raise

    def test_mine_tab(self, admin_logged_in: Page) -> None:
        """REV_CON_004：我发起的 Tab。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        try:
            page.click_mine_tab()
        except Exception:
            page.screenshot(path=f"_screenshots/review_mine_tab_fail.png")
            raise

    def test_approve_first_item(self, admin_logged_in: Page) -> None:
        """REV_CON_005：通过第一条审核项。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        try:
            page.approve_first()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_approve_first_fail.png")
            raise

    def test_reject_first_item(self, admin_logged_in: Page) -> None:
        """REV_CON_006：驳回第一条审核项。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        try:
            page.reject_first(reason="自动化测试驳回")
        except Exception:
            page.screenshot(path=f"_screenshots/review_reject_first_item_fail.png")
            raise

    def test_transfer_first_item(self, admin_logged_in: Page) -> None:
        """REV_CON_007：转审第一条审核项。"""
        page = ReviewContentPage(admin_logged_in).navigate()
        try:
            page.transfer_first()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_transfer_first_fail.png")
            raise


@pytest.mark.review
class TestReviewFlow:
    """审批流程。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """REV_FLOW_001：流程管理加载。"""
        page = ReviewFlowPage(admin_logged_in).navigate()
        page.assert_url_contains("/review/flow")

    def test_new_flow(self, admin_logged_in: Page) -> None:
        """REV_FLOW_002：新增流程。"""
        page = ReviewFlowPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新增流程')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_new_flow_fail.png")
            raise


@pytest.mark.review
class TestReviewPending:
    """待审列表。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """REV_PEN_001：待审列表加载。"""
        page = ReviewPendingPage(admin_logged_in).navigate()
        page.assert_url_contains("/review/pending")

    def test_batch_approve(self, admin_logged_in: Page) -> None:
        """REV_PEN_002：批量通过。"""
        page = ReviewPendingPage(admin_logged_in).navigate()
        try:
            page.batch_approve()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_batch_approve_fail.png")
            raise


@pytest.mark.review
class TestReviewDetail:
    """审核详情。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """REV_DET_001：审核详情加载。"""
        page = ReviewDetailPage(admin_logged_in).navigate()
        page.assert_url_contains("/review/detail")


@pytest.mark.review
class TestReviewRejectReasons:
    """驳回原因。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """REV_RJ_001：驳回原因页加载。"""
        page = ReviewRejectReasonsPage(admin_logged_in).navigate()
        page.assert_url_contains("/review/reject-reasons")

    def test_new_reason(self, admin_logged_in: Page) -> None:
        """REV_RJ_002：新增原因。"""
        page = ReviewRejectReasonsPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('新增原因')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_new_reason_fail.png")
            raise

    def test_create_reject_reason(self, admin_logged_in: Page) -> None:
        """REV_RJ_003：创建驳回原因（完整流程）。"""
        page = ReviewRejectReasonsPage(admin_logged_in).navigate()
        try:
            page.create_reason(name="自动化测试驳回原因")
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_create_reject_reason_fail.png")
            raise


@pytest.mark.review
class TestReviewStatistics:
    """审核统计。"""

    def test_loads(self, admin_logged_in: Page) -> None:
        """REV_STA_001：审核统计加载。"""
        page = ReviewStatisticsPage(admin_logged_in).navigate()
        page.assert_url_contains("/review/statistics")

    def test_export(self, admin_logged_in: Page) -> None:
        """REV_STA_002：导出审核记录。"""
        page = ReviewStatisticsPage(admin_logged_in).navigate()
        try:
            admin_logged_in.locator("button:has-text('导出审核记录')").first.click(timeout=2000)
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_export_fail.png")
            raise

    def test_export_statistics(self, admin_logged_in: Page) -> None:
        """REV_STA_003：导出审核统计。"""
        page = ReviewStatisticsPage(admin_logged_in).navigate()
        try:
            page.export_records()
        except Exception:
            admin_logged_in.screenshot(path=f"_screenshots/review_export_statistics_fail.png")
            raise
