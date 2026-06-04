"""
页面对象基类 BasePage

提供：
- 通用元素定位 / 操作封装
- 等待 / 断言辅助
- 截图 / 日志
- 路由跳转

所有具体页面应继承本类。
"""
from __future__ import annotations

import re
import time
from pathlib import Path
from typing import Any, Callable, Optional, Sequence

from playwright.sync_api import (
    ElementHandle,
    FrameLocator,
    Locator,
    Page,
    Response,
    expect,
)

from core.config import get_config
from core.exceptions import ElementNotFoundError, NavigationError
from core.logger import get_logger

logger = get_logger("page")


class BasePage:
    """所有 Page Object 的基类。"""

    # 子类可覆盖
    PATH: str = "/"  # 路由
    PATH_ALIASES: tuple[str, ...] = ()  # 兼容旧路由
    TITLE_KEYWORDS: tuple[str, ...] = ()  # 页面标题应包含的关键字（用于断言到达）

    def __init__(self, page: Page):
        self.page = page
        self.cfg = get_config()
        self._log = logger

    # ============================================================
    # 导航
    # ============================================================
    def navigate(self, path: Optional[str] = None, wait_until: str = "domcontentloaded") -> "BasePage":
        """导航到本页（默认相对 base_url）。

        ⚠️ 默认使用 `domcontentloaded` 而非 `networkidle`。
        Vue 应用常带轮询/长连接，networkidle 经常等到超时上限，严重拖慢用例。
        若用例确实需要等所有请求完成，请显式传 `wait_until="networkidle"`。
        """
        target = path or self.PATH
        url = self._abs_url(target)
        self._log.info(f"[Nav] {self.__class__.__name__} -> {url}")
        try:
            self.page.goto(url, wait_until=wait_until, timeout=self.cfg.timeout.nav_timeout)
        except Exception as e:
            raise NavigationError(f"导航到 {url} 失败: {e}") from e
        return self

    def navigate_to(self, abs_or_path: str, wait_until: str = "domcontentloaded") -> "BasePage":
        """显式指定路径导航。"""
        return self.navigate(abs_or_path, wait_until=wait_until)

    def refresh(self) -> "BasePage":
        """刷新当前页。"""
        self.page.reload(wait_until="domcontentloaded", timeout=self.cfg.timeout.nav_timeout)
        return self

    def go_back(self) -> "BasePage":
        self.page.go_back(wait_until="domcontentloaded")
        return self

    def wait_url(self, pattern: str, timeout: Optional[int] = None) -> "BasePage":
        """等待 URL 匹配 pattern（regex）。"""
        self.page.wait_for_url(re.compile(pattern), timeout=timeout or self.cfg.timeout.nav_timeout)
        return self

    # ============================================================
    # 元素定位
    # ============================================================
    def locator(self, selector: str, **kwargs) -> Locator:
        return self.page.locator(selector, **kwargs)

    def get_by_text(self, text: str, exact: bool = False) -> Locator:
        return self.page.get_by_text(text, exact=exact)

    def get_by_role(self, role: str, name: Optional[str] = None, **kwargs) -> Locator:
        return self.page.get_by_role(role, name=name, **kwargs)

    def get_by_placeholder(self, placeholder: str, exact: bool = False) -> Locator:
        return self.page.get_by_placeholder(placeholder, exact=exact)

    def get_by_label(self, label: str) -> Locator:
        return self.page.get_by_label(label)

    def get_by_test_id(self, test_id: str) -> Locator:
        """通过 data-testid 定位（推荐）。"""
        return self.page.get_by_test_id(test_id)

    # ============================================================
    # 通用操作
    # ============================================================
    def click(self, selector: str, *, timeout: Optional[int] = None, force: bool = False) -> None:
        """点击元素。"""
        loc = self.page.locator(selector)
        try:
            loc.click(timeout=timeout, force=force)
        except Exception as e:
            raise ElementNotFoundError(f"点击失败 {selector}: {e}") from e

    def click_text(self, text: str, exact: bool = True) -> None:
        """按文本点击。"""
        loc = self.page.get_by_text(text, exact=exact).first
        loc.click(timeout=self.cfg.timeout.action_timeout)

    def fill(self, selector: str, value: str, *, timeout: Optional[int] = None) -> None:
        """填充输入框（先清空）。"""
        loc = self.page.locator(selector)
        loc.fill("", timeout=timeout)
        loc.fill(value, timeout=timeout)

    def type(self, selector: str, value: str, delay: int = 30) -> None:
        """逐字输入（适合有按键监听的输入框）。"""
        loc = self.page.locator(selector)
        loc.click()
        loc.press_sequentially(value, delay=delay)

    def select_option(self, selector: str, value: str | list[str]) -> None:
        self.page.locator(selector).select_option(value)

    def check(self, selector: str) -> None:
        self.page.locator(selector).check()

    def uncheck(self, selector: str) -> None:
        self.page.locator(selector).uncheck()

    def hover(self, selector: str) -> None:
        self.page.locator(selector).hover()

    def press(self, key: str) -> None:
        self.page.keyboard.press(key)

    # ============================================================
    # 等待
    # ============================================================
    def wait_visible(self, selector: str, timeout: Optional[int] = None) -> Locator:
        """等待元素可见并返回。"""
        loc = self.page.locator(selector)
        loc.wait_for(state="visible", timeout=timeout or self.cfg.timeout.default_timeout)
        return loc

    def wait_hidden(self, selector: str, timeout: Optional[int] = None) -> None:
        self.page.locator(selector).wait_for(state="hidden", timeout=timeout or self.cfg.timeout.default_timeout)

    def wait_text(self, text: str, timeout: Optional[int] = None) -> None:
        """等待页面出现指定文本。"""
        self.page.get_by_text(text).first.wait_for(
            state="visible", timeout=timeout or self.cfg.timeout.default_timeout
        )

    def wait_loading_disappear(self, timeout: Optional[int] = None) -> None:
        """等待 v-loading / 遮罩消失。

        优化：先用 count() 即时判断遮罩是否存在，存在再等其隐藏；
        避免对不存在的 selector 串行等待 5s × N，造成无谓的几十秒空等。
        """
        wait_ms = timeout or 3000
        for sel in (".el-loading-mask", ".el-overlay", ".v-loading"):
            try:
                loc = self.page.locator(sel).first
                if loc.count() == 0:
                    continue
                loc.wait_for(state="hidden", timeout=wait_ms)
            except Exception:
                # 单个 selector 失败不影响整体
                continue

    def sleep(self, seconds: float) -> None:
        time.sleep(seconds)

    # ============================================================
    # 断言
    # ============================================================
    def assert_url_contains(self, fragment: str) -> None:
        expect(self.page).to_have_url(re.compile(re.escape(fragment)))

    def assert_title_contains(self, keyword: str) -> None:
        expect(self.page).to_have_title(re.compile(re.escape(keyword)))

    def assert_text_visible(self, text: str) -> None:
        expect(self.page.get_by_text(text).first).to_be_visible()

    def assert_text_not_visible(self, text: str) -> None:
        expect(self.page.get_by_text(text).first).not_to_be_visible()

    def assert_element_visible(self, selector: str) -> None:
        expect(self.page.locator(selector).first).to_be_visible()

    def assert_element_count(self, selector: str, count: int) -> None:
        expect(self.page.locator(selector)).to_have_count(count)

    def assert_toast_success(self, text: Optional[str] = None) -> None:
        """断言 ElMessage 成功提示。"""
        for sel in [".el-message--success", ".el-notification--success"]:
            try:
                if text:
                    expect(self.page.locator(sel).filter(has_text=text).first).to_be_visible(timeout=5000)
                else:
                    expect(self.page.locator(sel).first).to_be_visible(timeout=5000)
                return
            except Exception:
                continue

    # ============================================================
    # 对话框
    # ============================================================
    def get_dialog(self) -> Locator:
        return self.page.locator(".el-dialog").first

    def confirm_dialog(self) -> None:
        """点击当前对话框的「确定」按钮。"""
        for text in ["确 定", "确定", "确 认", "确认"]:
            loc = self.page.get_by_role("button", name=text).first
            if loc.count() > 0:
                loc.click()
                return
        # 兜底：footer 末位主按钮
        self.page.locator(".el-dialog__footer .el-button--primary").last.click()

    def cancel_dialog(self) -> None:
        """点击当前对话框的「取消」按钮。"""
        for text in ["取 消", "取消"]:
            loc = self.page.get_by_role("button", name=text).first
            if loc.count() > 0:
                loc.click()
                return
        self.page.locator(".el-dialog__footer .el-button").last.click()

    def close_dialog(self) -> None:
        """关闭当前对话框（X 按钮）。"""
        try:
            self.page.locator(".el-dialog__close").first.click()
        except Exception:
            pass

    def wait_dialog_closed(self, timeout: Optional[int] = None) -> None:
        try:
            self.page.locator(".el-dialog__wrapper").first.wait_for(
                state="hidden", timeout=timeout or self.cfg.timeout.default_timeout
            )
        except Exception:
            pass

    # ============================================================
    # 表格操作
    # ============================================================
    def table_row_count(self, table_selector: str = ".el-table__body-wrapper .el-table__row") -> int:
        return self.page.locator(table_selector).count()

    def table_cell_text(self, row: int, col: int, table_selector: str = ".el-table__body") -> str:
        loc = self.page.locator(f"{table_selector} tbody tr").nth(row).locator("td").nth(col)
        return loc.inner_text().strip()

    def search_by_keyword(self, keyword: str, placeholder: str = "搜索") -> None:
        """在搜索框中输入关键词并回车。"""
        inp = self.page.get_by_placeholder(re.compile(re.escape(placeholder))).first
        inp.fill(keyword)
        inp.press("Enter")
        self.wait_loading_disappear()

    # ============================================================
    # 截图
    # ============================================================
    def screenshot(self, name: str, full_page: bool = True) -> Path:
        """保存截图到 reports/screenshots。"""
        out_dir = Path(self.cfg.report.screenshot_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        path = out_dir / f"{self.__class__.__name__}_{name}_{int(time.time() * 1000)}.png"
        self.page.screenshot(path=str(path), full_page=full_page)
        return path

    # ============================================================
    # 辅助
    # ============================================================
    def _abs_url(self, path: str) -> str:
        """生成绝对 URL（相对 base_url）。

        ⚠️ 前端使用 hash 路由（vue-router hash 模式），
        路径必须带 /#/ 前缀，否则会触发 history 模式 404 -> 自动回落到登录。
        """
        if path.startswith("http://") or path.startswith("https://"):
            return path
        base = self.cfg.app.base_url.rstrip("/")
        clean = path.lstrip("/")
        # 已经是 hash 形式则不重复添加
        if path.startswith("#/") or "/#/" in path:
            return f"{base}/{clean.lstrip('/')}"
        return f"{base}/#/{clean}"

    def is_logged_in(self) -> bool:
        """判断当前是否处于已登录态（hash-aware）。"""
        url = self.page.url
        hash_part = url.split("#")[-1] if "#" in url else url
        return "/auth/login" not in hash_part and "/auth/register" not in hash_part
