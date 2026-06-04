"""
一键启动脚本

用法：
    python run.py                  # 全量
    python run.py --markers smoke  # 仅冒烟
    python run.py -m e2e           # 端到端
    python run.py --module system  # 系统管理
    python run.py --report-only    # 仅渲染报告
    python run.py -k test_login    # 按关键字
    python run.py --headless=false # 有头浏览器（调试）

报告：
    reports/html/report.html      pytest-html
    reports/logs/test_report_*.md 中文测试报告
    reports/logs/bugs/latest.md   缺陷报告
    reports/screenshots/*.png     失败截图
"""
from __future__ import annotations

import argparse
import json
import shlex
import subprocess
import sys
from datetime import datetime
from pathlib import Path

E2E_ROOT = Path(__file__).resolve().parent
REPORTS_DIR = E2E_ROOT / "reports"
SUMMARY_PATH = REPORTS_DIR / "summary.json"


def build_pytest_cmd(args: argparse.Namespace) -> list[str]:
    """组装 pytest 命令。"""
    cmd = [sys.executable, "-m", "pytest"]

    # 标记筛选
    if args.markers:
        cmd += ["-m", args.markers]

    # 关键字
    if args.keyword:
        cmd += ["-k", args.keyword]

    # 模块目录
    if args.module:
        cmd += [f"tests/{args.module}"]

    # 并发
    if args.workers and args.workers > 1:
        cmd += ["-n", str(args.workers)]

    # 浏览器
    env_overrides: list[str] = []
    if args.headless is not None:
        env_overrides.append(f"HEADLESS={'true' if args.headless else 'false'}")

    # 报告
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    html_path = REPORTS_DIR / "html" / f"report_{ts}.html"
    html_path.parent.mkdir(parents=True, exist_ok=True)
    cmd += [
        "--html", str(html_path),
        "--self-contained-html",
        "--junitxml", str(REPORTS_DIR / f"junit_{ts}.xml"),
    ]

    if not args.no_allure:
        allure_dir = REPORTS_DIR / "allure-results"
        allure_dir.mkdir(parents=True, exist_ok=True)
        cmd += ["--alluredir", str(allure_dir)]

    if args.verbose:
        cmd += ["-v"]

    if args.exitfirst:
        cmd += ["-x"]

    if args.rerun:
        cmd += [f"--reruns", str(args.rerun)]

    return cmd, env_overrides


def render_chinese_report() -> Path:
    """读取 summary.json 渲染中文测试报告。"""
    from core.test_report import render_test_report, save_test_report

    if not SUMMARY_PATH.exists():
        print(f"[WARN] summary.json 不存在：{SUMMARY_PATH}")
        return Path()

    suite_stats = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    content = render_test_report(
        title="DreamCraft Astra 自动化测试报告",
        suite_stats=suite_stats,
    )
    return save_test_report(content)


def main() -> int:
    parser = argparse.ArgumentParser(description="DreamCraft Astra E2E 自动化测试启动")
    parser.add_argument("-m", "--markers", help="pytest marker 表达式（如 smoke / e2e / system or dashboard）")
    parser.add_argument("-k", "--keyword", help="按用例名关键字过滤")
    parser.add_argument("--module", help="指定模块子目录（tests/<module>）")
    parser.add_argument("-n", "--workers", type=int, default=1, help="并发 worker 数")
    parser.add_argument("--headless", type=lambda s: s.lower() in ("1", "true", "yes"), default=None, help="HEADLESS=true/false")
    parser.add_argument("--rerun", type=int, default=0, help="失败重试次数")
    parser.add_argument("--exitfirst", "-x", action="store_true", help="首次失败即停止")
    parser.add_argument("--verbose", "-v", action="store_true", help="详细输出")
    parser.add_argument("--no-allure", action="store_true", help="不生成 allure 报告")
    parser.add_argument("--report-only", action="store_true", help="仅渲染中文报告")
    args = parser.parse_args()

    if args.report_only:
        path = render_chinese_report()
        print(f"[报告] 已生成：{path}")
        return 0

    cmd, env_overrides = build_pytest_cmd(args)
    print(f"\n[Run] {' '.join(shlex.quote(c) for c in cmd)}\n")

    # 透传环境变量
    import os
    env = os.environ.copy()
    for kv in env_overrides:
        k, v = kv.split("=", 1)
        env[k] = v

    result = subprocess.run(cmd, cwd=str(E2E_ROOT), env=env)

    # 渲染中文报告
    if SUMMARY_PATH.exists():
        report_path = render_chinese_report()
        print(f"\n[报告] 中文报告：{report_path}")
        summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
        print(
            f"[汇总] total={summary['total']} passed={summary['passed']} "
            f"failed={summary['failed']} skipped={summary['skipped']} error={summary['error']}"
        )

    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
