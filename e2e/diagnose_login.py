"""
一次性诊断脚本：抓取登录页结构与登录后的响应
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from playwright.sync_api import sync_playwright

from core.config import get_config

OUT = Path(__file__).resolve().parent / "reports" / "diagnose"
OUT.mkdir(parents=True, exist_ok=True)


def main() -> int:
    cfg = get_config()
    api_calls: list[dict] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = ctx.new_page()

        def _on_resp(r):
            if "/api/" in r.url:
                try:
                    body = r.text()[:1000]
                except Exception:
                    body = ""
                api_calls.append({
                    "url": r.url,
                    "method": r.request.method,
                    "status": r.status,
                    "body": body,
                })

        page.on("response", _on_resp)

        # 1. 打开首页
        page.goto(cfg.app.base_url, wait_until="networkidle", timeout=30000)
        time.sleep(1.5)
        print(f"[1] 首页 URL = {page.url}")
        print(f"[1] 首页 title = {page.title()}")
        page.screenshot(path=str(OUT / "1_index.png"), full_page=True)

        # 2. 显式去 login（hash）
        page.goto(f"{cfg.app.base_url}/#/auth/login", wait_until="networkidle", timeout=30000)
        time.sleep(1.5)
        print(f"[2] login URL = {page.url}")
        page.screenshot(path=str(OUT / "2_login.png"), full_page=True)

        # 3. 抓取所有输入框 / 按钮
        inputs = page.locator("input").all()
        print(f"[3] 输入框总数 = {len(inputs)}")
        for i, inp in enumerate(inputs):
            try:
                ph = inp.get_attribute("placeholder") or ""
                tp = inp.get_attribute("type") or ""
                nm = inp.get_attribute("name") or ""
                print(f"     input[{i}] type={tp} name={nm} placeholder={ph!r}")
            except Exception as e:
                print(f"     input[{i}] err={e}")

        buttons = page.locator("button").all()
        print(f"[3] 按钮总数 = {len(buttons)}")
        for i, b in enumerate(buttons):
            try:
                txt = b.inner_text().strip()[:30]
                print(f"     button[{i}] text={txt!r}")
            except Exception:
                pass

        # 4. 填入账号并点击登录
        cfg = get_config()
        print(f"[4] 使用账号: {cfg.account.admin_username}")
        try:
            # 第一个非密码输入框 = 账号
            non_pwd_inputs = page.locator("input:not([type='password']):not([type='checkbox'])")
            n = non_pwd_inputs.count()
            print(f"[4] 非密码非复选输入框数: {n}")
            if n > 0:
                non_pwd_inputs.first.fill(cfg.account.admin_username)
            # 密码
            page.locator("input[type='password']").first.fill(cfg.account.admin_password)
            page.screenshot(path=str(OUT / "3_filled.png"), full_page=True)

            # 点登录
            login_btn = page.get_by_role("button", name="登 录").or_(page.get_by_role("button", name="登录"))
            if login_btn.count() == 0:
                login_btn = page.locator("button[type='submit']")
            print(f"[4] 登录按钮数: {login_btn.count()}")
            login_btn.first.click()
            time.sleep(5)
            print(f"[4] 点击后 URL = {page.url}")
            page.screenshot(path=str(OUT / "4_after_login.png"), full_page=True)
        except Exception as e:
            print(f"[4][ERR] {e}")
            page.screenshot(path=str(OUT / "4_error.png"), full_page=True)

        # 5. 保存所有 API 调用
        api_log = OUT / "api_calls.json"
        api_log.write_text(json.dumps(api_calls, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[5] 共 {len(api_calls)} 个 API 调用，已保存到 {api_log}")
        for c in api_calls[-20:]:
            print(f"     {c['method']:6s} {c['status']:3d} {c['url']}")

        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
