"""AI 处理记录页面包。"""
from pages.base_page import BasePage


class AIProcessHistoryPage(BasePage):
    PATH = "/ai-process/history"

    SEL_QUERY = "button:has-text('查询')"
    SEL_RESET = "button:has-text('重置')"


class AIProcessStatusPage(BasePage):
    PATH = "/ai-process/status"

    SEL_REFRESH = "button:has-text('刷新状态')"


class AIProcessPage(BasePage):
    PATH = "/ai-process"

    SEL_RETRY = "button:has-text('重试')"
    SEL_RECORDS = ".el-table__row, [class*='record-item']"

    def assert_records_visible(self) -> None:
        """验证 AI 处理记录列表可见。"""
        self.assert_element_visible(".el-table__body-wrapper .el-table__row")


class DataHistoryPage(BasePage):
    PATH = "/data-history"

    SEL_HISTORY_LIST = ".el-table__row, [class*='history-item']"
    SEL_COMPARE = "button:has-text('版本对比')"

    def assert_history_list(self) -> None:
        """验证数据历史列表可见。"""
        self.assert_element_visible(".el-table__body-wrapper .el-table__row")


class WorkflowPage(BasePage):
    PATH = "/workflow"

    SEL_NEW = "button:has-text('添加工作流'), button:has-text('新建工作流')"
    SEL_EDIT = "button:has-text('编辑')"
    SEL_DELETE = "button:has-text('删除')"
    SEL_CONFIRM = ".el-dialog__footer .el-button--primary"

    def create_workflow(self, name: str) -> None:
        """创建工作流。"""
        self.click(self.SEL_NEW)
        self.get_dialog().wait_for(state="visible", timeout=5000)
        name_input = self.page.locator(".el-dialog input").first
        name_input.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()
        self.wait_loading_disappear()

    def edit_first_workflow(self) -> None:
        """编辑第一个工作流。"""
        row = self.page.locator(".el-table__row").first
        row.locator(self.SEL_EDIT).first.click(timeout=3000)
        self.get_dialog().wait_for(state="visible", timeout=5000)
        self.confirm_dialog()
        self.wait_dialog_closed()
        self.wait_loading_disappear()

    def delete_first_workflow(self) -> None:
        """删除第一个工作流。"""
        row = self.page.locator(".el-table__row").first
        row.locator(self.SEL_DELETE).first.click(timeout=3000)
        self.confirm_dialog()
        self.wait_dialog_closed()
        self.wait_loading_disappear()


class WorkflowDirectoryPage(BasePage):
    PATH = "/workflow/directory"

    SEL_TREE = ".el-tree, [class*='directory-tree']"

    def assert_directory_tree(self) -> None:
        """验证工作流目录树可见。"""
        self.assert_element_visible(self.SEL_TREE)
