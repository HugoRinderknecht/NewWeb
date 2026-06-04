"""数据历史页面包。"""
from pages.base_page import BasePage


class DataHistoryRecordsPage(BasePage):
    PATH = "/data-history/records"


class DataHistoryRollbackPage(BasePage):
    PATH = "/data-history/rollback"

    SEL_QUERY = "button:has-text('查询版本')"
    SEL_CONFIRM_ROLLBACK = "button:has-text('确认回退')"
