"""
自定义异常体系

所有测试相关异常继承自 E2EBaseError，便于上层统一捕获。
"""
from __future__ import annotations


class E2EBaseError(Exception):
    """所有 e2e 异常的基类。"""


class LoginError(E2EBaseError):
    """登录失败。"""


class NavigationError(E2EBaseError):
    """页面导航失败。"""


class ElementNotFoundError(E2EBaseError):
    """元素未找到。"""


class AssertionFailedError(E2EBaseError):
    """业务断言失败（区别于原生 AssertionError，方便分类）。"""


class APIError(E2EBaseError):
    """后端 API 调用错误。"""


class PermissionDeniedError(E2EBaseError):
    """权限不足。"""


class TimeoutE2EError(E2EBaseError):
    """操作超时。"""
