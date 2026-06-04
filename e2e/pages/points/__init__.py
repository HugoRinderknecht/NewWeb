"""积分管理页面包。"""
from pages.base_page import BasePage


class PointsBillingPage(BasePage):
    PATH = "/points/billing"


class PointsRecordPage(BasePage):
    PATH = "/points/record"


class PointsTransactionsPage(BasePage):
    PATH = "/points/transactions"

    SEL_EXPORT = "button:has-text('导出')"


class PointsTokenUsagePage(BasePage):
    PATH = "/points/token-usage"


class PointsPricingPage(BasePage):
    PATH = "/points/pricing"

    SEL_COMPARE = "button:has-text('价格对比')"
