"""系统设置页面包。"""
from pages.base_page import BasePage


class SettingsAccountPage(BasePage):
    PATH = "/settings/account"

    SEL_CHANGE_PASSWORD = "button:has-text('修改密码')"


class SettingsSystemPage(BasePage):
    PATH = "/settings/system"

    SEL_SAVE = "button:has-text('保存参数')"


class SettingsSecurityPage(BasePage):
    PATH = "/settings/security"

    SEL_CHANGE_PASSWORD = "button:has-text('修改密码')"
    SEL_BIND_PHONE = "button:has-text('绑定')"


class SettingsDangerPage(BasePage):
    PATH = "/settings/danger"

    SEL_EXPORT_PROJECTS = "button:has-text('导出'):near(:text('项目数据'))"
    SEL_CLEAR_CACHE = "button:has-text('清除缓存')"
    SEL_LOGOUT_ALL = "button:has-text('退出所有')"
    SEL_DELETE_ACCOUNT = "button:has-text('注销账号')"
