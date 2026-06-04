"""
AI 处理记录 / 数据历史 / 工作流管理测试
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.ai_process import (
    AIProcessPage,
    AIProcessHistoryPage,
    AIProcessStatusPage,
    DataHistoryPage,
    WorkflowPage,
    WorkflowDirectoryPage,
)
from utils import data_factory as df


@pytest.mark.ai_process
class TestAIProcess:
    """AI 处理记录。"""

    def test_history_page_loads(self, admin_logged_in: Page) -> None:
        """AIP_HIS_001：处理历史页加载。"""
        admin_logged_in.goto("http://localhost:3006/ai-process/history")
        admin_logged_in.wait_for_url(lambda u: "/ai-process/history" in u, timeout=10000)

    def test_status_page_loads(self, admin_logged_in: Page) -> None:
        """AIP_STA_001：处理状态页加载。"""
        admin_logged_in.goto("http://localhost:3006/ai-process/status")
        admin_logged_in.wait_for_url(lambda u: "/ai-process/status" in u, timeout=10000)

    def test_ai_process_records(self, admin_logged_in: Page) -> None:
        """AIP_REC_001：验证 AI 处理记录列表可见。"""
        page = AIProcessPage(admin_logged_in)
        page.navigate()
        page.assert_records_visible()

    def test_ai_process_retry(self, admin_logged_in: Page) -> None:
        """AIP_RET_001：验证重试按钮可点击。"""
        page = AIProcessPage(admin_logged_in)
        page.navigate()
        page.assert_element_visible(page.SEL_RETRY)


@pytest.mark.data_history
class TestDataHistory:
    """数据历史。"""

    def test_records_page_loads(self, admin_logged_in: Page) -> None:
        """DH_REC_001：数据历史记录页加载。"""
        admin_logged_in.goto("http://localhost:3006/data-history/records")
        admin_logged_in.wait_for_url(lambda u: "/data-history/records" in u, timeout=10000)

    def test_rollback_page_loads(self, admin_logged_in: Page) -> None:
        """DH_RB_001：版本回退页加载。"""
        admin_logged_in.goto("http://localhost:3006/data-history/rollback")
        admin_logged_in.wait_for_url(lambda u: "/data-history/rollback" in u, timeout=10000)

    def test_data_history_list(self, admin_logged_in: Page) -> None:
        """DH_LST_001：验证数据历史列表可见。"""
        page = DataHistoryPage(admin_logged_in)
        page.navigate()
        page.assert_history_list()

    def test_data_history_version_compare(self, admin_logged_in: Page) -> None:
        """DH_CMP_001：验证版本对比功能。"""
        page = DataHistoryPage(admin_logged_in)
        page.navigate()
        page.assert_element_visible(page.SEL_COMPARE)


@pytest.mark.workflow
class TestWorkflow:
    """工作流管理。"""

    def test_list_page_loads(self, admin_logged_in: Page) -> None:
        """WF_LST_001：工作流列表加载。"""
        admin_logged_in.goto("http://localhost:3006/workflow/list")
        admin_logged_in.wait_for_url(lambda u: "/workflow/list" in u, timeout=10000)

    def test_execute_page_loads(self, admin_logged_in: Page) -> None:
        """WF_EXE_001：工作流执行加载。"""
        admin_logged_in.goto("http://localhost:3006/workflow/execute")
        admin_logged_in.wait_for_url(lambda u: "/workflow/execute" in u, timeout=10000)

    def test_catalog_page_loads(self, admin_logged_in: Page) -> None:
        """WF_CAT_001：工作流目录加载。"""
        admin_logged_in.goto("http://localhost:3006/workflow/catalog")
        admin_logged_in.wait_for_url(lambda u: "/workflow/catalog" in u, timeout=10000)

    def test_workflow_create(self, admin_logged_in: Page) -> None:
        """WF_CRT_001：创建工作流。"""
        page = WorkflowPage(admin_logged_in)
        page.navigate()
        name = df.workflow_name() if hasattr(df, "workflow_name") else f"wf_{df.timestamp_str()}"
        page.create_workflow(name)
        page.assert_text_visible(name)

    def test_workflow_edit(self, admin_logged_in: Page) -> None:
        """WF_EDT_001：编辑工作流。"""
        page = WorkflowPage(admin_logged_in)
        page.navigate()
        page.edit_first_workflow()
        page.assert_toast_success()

    def test_workflow_delete(self, admin_logged_in: Page) -> None:
        """WF_DEL_001：删除工作流。"""
        page = WorkflowPage(admin_logged_in)
        page.navigate()
        page.delete_first_workflow()
        page.assert_toast_success()

    def test_workflow_directory(self, admin_logged_in: Page) -> None:
        """WF_DIR_001：工作流目录浏览。"""
        page = WorkflowDirectoryPage(admin_logged_in)
        page.navigate()
        page.assert_directory_tree()
