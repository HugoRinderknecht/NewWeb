"""通知中心页面包。"""
from pages.base_page import BasePage


class NoticeSitePage(BasePage):
    PATH = "/notice/site"

    SEL_READ_ALL = "text=全部已读"


class NoticeRemindPage(BasePage):
    PATH = "/notice/remind"

    SEL_SAVE = "button:has-text('保存设置')"
