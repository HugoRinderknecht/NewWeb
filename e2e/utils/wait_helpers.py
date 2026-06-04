"""
等待辅助：封装 Element Plus / Vue 常见动态加载场景。
"""
from __future__ import annotations

import re
from typing import Optional

from playwright.sync_api import Page


def wait_for_loading(page: Page, timeout: int = 15000) -> None:
    """等待 Element Plus loading 遮罩消失。"""
    selectors = [
        ".el-loading-mask",
        ".el-overlay",
        ".v-loading",
        ".nprogress-busy",
    ]
    for sel in selectors:
        try:
            page.locator(sel).first.wait_for(state="hidden", timeout=min(2000, timeout))
        except Exception:
            pass


def wait_for_url_match(page: Page, pattern: str, timeout: int = 15000) -> None:
    page.wait_for_url(re.compile(pattern), timeout=timeout)


def wait_for_text(page: Page, text: str, timeout: int = 15000) -> None:
    page.get_by_text(text).first.wait_for(state="visible", timeout=timeout)


def wait_for_tag_visible(page: Page, tag_text: str, timeout: int = 15000) -> None:
    page.locator(".el-tag").filter(has_text=re.compile(re.escape(tag_text))).first.wait_for(
        state="visible", timeout=timeout
    )


def wait_for_dialog_visible(page: Page, timeout: int = 10000) -> None:
    page.locator(".el-dialog__wrapper:visible, .el-dialog:visible").first.wait_for(
        state="visible", timeout=timeout
    )


def wait_for_dialog_closed(page: Page, timeout: int = 10000) -> None:
    page.locator(".el-dialog__wrapper:visible, .el-dialog:visible").first.wait_for(
        state="hidden", timeout=timeout
    )


def wait_for_toast(page: Page, text: Optional[str] = None, timeout: int = 5000) -> str:
    """等待 ElMessage 出现，返回其文本。"""
    for sel in [".el-message", ".el-notification"]:
        loc = page.locator(f"{sel}:visible")
        try:
            loc.first.wait_for(state="visible", timeout=timeout)
            if text:
                return loc.filter(has_text=re.compile(re.escape(text))).first.inner_text()
            return loc.first.inner_text()
        except Exception:
            continue
    return ""
