"""
测试数据工厂

集中生成测试需要的随机数据：
- 名称 / 描述 / 邮箱 / 手机号
- 角色 / 状态 / 标签
"""
from __future__ import annotations

import random
import string
import time
from datetime import datetime, timedelta
from typing import Optional

from faker import Faker

_zh = Faker("zh_CN")


def now_ts() -> int:
    return int(time.time() * 1000)


def random_str(length: int = 6, prefix: str = "") -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=length))
    return f"{prefix}{suffix}"


def random_name(prefix: str = "Test") -> str:
    return f"{prefix}{random_str(5)}"


def random_email(domain: str = "example.com") -> str:
    return f"{random_str(8).lower()}@{domain}"


def random_phone() -> str:
    """生成合法中国手机号。"""
    prefixes = ["138", "139", "150", "151", "152", "158", "159", "186", "188"]
    return random.choice(prefixes) + "".join(random.choices(string.digits, k=8))


def random_password(length: int = 10) -> str:
    """生成符合 8-100 + 字母数字 的密码。"""
    chars = string.ascii_letters + string.digits
    while True:
        pwd = "".join(random.choices(chars, k=length))
        if any(c.isalpha() for c in pwd) and any(c.isdigit() for c in pwd):
            return pwd


def random_chinese_text(min_len: int = 30, max_len: int = 200) -> str:
    """生成中文文本。"""
    return _zh.text(max_nb_chars=random.randint(min_len, max_len))


def random_date_range(days_back: int = 30) -> tuple[str, str]:
    end = datetime.now()
    start = end - timedelta(days=days_back)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


def timestamp_str() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


# ---- 业务数据 ----
def project_name(prefix: str = "项目") -> str:
    return f"{prefix}_{timestamp_str()}"


def script_name(prefix: str = "剧本") -> str:
    return f"{prefix}_{timestamp_str()}"


def storyboard_name(prefix: str = "分镜") -> str:
    return f"{prefix}_{timestamp_str()}"


def team_name(prefix: str = "测试团队") -> str:
    return f"{prefix}_{random_str(4)}"


def asset_name(prefix: str = "资产") -> str:
    return f"{prefix}_{timestamp_str()}"


def task_name(prefix: str = "任务") -> str:
    return f"{prefix}_{timestamp_str()}"


# ---- 唯一性辅助 ----
_unique_counter = {"i": 0}


def unique(prefix: str = "u") -> str:
    """递增唯一值（同一进程内）。"""
    _unique_counter["i"] += 1
    return f"{prefix}_{timestamp_str()}_{_unique_counter['i']}"


def timestamp() -> str:
    """返回当前时间戳字符串（格式：YYYYMMDD_HHMMSS）。"""
    return timestamp_str()


def workflow_name(prefix: str = "工作流") -> str:
    return f"{prefix}_{timestamp_str()}"
