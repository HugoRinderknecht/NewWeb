"""工作流管理页面包。"""
from pages.base_page import BasePage


class WorkflowListPage(BasePage):
    PATH = "/workflow/list"

    SEL_NEW = "button:has-text('添加工作流')"
    SEL_TEST = "button:has-text('测试连接')"


class WorkflowExecutePage(BasePage):
    PATH = "/workflow/execute"

    SEL_NEXT = "button:has-text('下一步')"
    SEL_START = "button:has-text('开始执行')"
    SEL_AGAIN = "button:has-text('再次执行')"


class WorkflowCatalogPage(BasePage):
    PATH = "/workflow/catalog"
