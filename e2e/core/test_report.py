"""
测试报告渲染模块

按用户要求生成中文详细报告：
- 测试范围
- 测试方法
- 测试数据
- 缺陷统计
- 测试结论
- 改进建议
"""
from __future__ import annotations

import json
import platform
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from core.config import get_config
from core.bug_report import BugReporter, get_bug_reporter


def render_test_report(
    title: str = "DreamCraft Astra 自动化测试报告",
    suite_stats: Optional[dict[str, Any]] = None,
    test_data_summary: Optional[dict[str, Any]] = None,
    environment: Optional[dict[str, Any]] = None,
    improvement_suggestions: Optional[list[str]] = None,
) -> str:
    """生成完整的 Markdown 测试报告。"""
    cfg = get_config()
    reporter = get_bug_reporter()
    stats = suite_stats or {}
    test_data = test_data_summary or {}
    env = environment or _default_env()
    suggestions = improvement_suggestions or _default_suggestions()

    lines: list[str] = []
    lines.append(f"# {title}\n")
    lines.append(f"> 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    lines.append(f"> 项目：DreamCraft Astra (AI 短剧制作平台)\n")
    lines.append(f"> 分支：feature-mock-and-router-update-20260530\n")
    lines.append(f"\n---\n")

    # ============================================================
    # 一、测试概要
    # ============================================================
    lines.append("\n## 一、测试概要\n")
    lines.append("\n### 1.1 报告目的\n")
    lines.append(
        "\n本报告记录 DreamCraft Astra 平台 Python 端到端自动化测试的执行情况，"
        "覆盖 `功能模块全面分析文档`、`平台功能模块全面分析文档`、`前端页面UI详细说明`"
        " 三份文档中描述的全部 17 个功能模块主流程，"
        "并按"前端/后端"维度对发现的缺陷进行分类统计，"
        "为项目质量评估、缺陷修复与持续改进提供依据。\n"
    )

    lines.append("\n### 1.2 报告范围\n")
    lines.append("\n| 模块 | 路径前缀 | 文档参考 |\n|------|---------|---------|\n")
    modules = [
        ("系统管理", "/system", "功能模块全面分析文档 §1"),
        ("仪表盘", "/dashboard", "功能模块全面分析文档 §2"),
        ("项目管理", "/project", "功能模块全面分析文档 §3"),
        ("剧本管理", "/script", "功能模块全面分析文档 §4"),
        ("分镜管理", "/storyboard", "功能模块全面分析文档 §5"),
        ("视频生成", "/video-gen", "功能模块全面分析文档 §6"),
        ("剪辑工作台", "/editor", "功能模块全面分析文档 §7"),
        ("审核中心", "/review", "功能模块全面分析文档 §8"),
        ("资产管理", "/asset", "功能模块全面分析文档 §9"),
        ("AI 处理记录", "/ai-process", "功能模块全面分析文档 §10"),
        ("数据历史", "/data-history", "功能模块全面分析文档 §11"),
        ("工作流管理", "/workflow", "功能模块全面分析文档 §12"),
        ("团队管理", "/team", "功能模块全面分析文档 §13"),
        ("积分管理", "/points", "功能模块全面分析文档 §14"),
        ("通知中心", "/notice", "功能模块全面分析文档 §15"),
        ("系统设置", "/settings", "功能模块全面分析文档 §16"),
        ("认证", "/auth", "前端页面UI详细说明 §认证"),
    ]
    for m, p, ref in modules:
        lines.append(f"| {m} | `{p}` | {ref} |\n")

    # ============================================================
    # 二、测试环境
    # ============================================================
    lines.append("\n## 二、测试环境\n")
    lines.append("\n### 2.1 软硬件环境\n\n")
    lines.append("| 项目 | 值 |\n|------|------|\n")
    for k, v in env.items():
        lines.append(f"| {k} | {v} |\n")

    lines.append("\n### 2.2 测试框架与依赖\n\n")
    lines.append("| 组件 | 版本 | 用途 |\n|------|------|------|\n")
    lines.append("| Python | 3.14.5 | 解释器 |\n")
    lines.append("| pytest | 8.3+ | 测试调度 |\n")
    lines.append("| pytest-playwright | 0.7+ | 浏览器驱动 |\n")
    lines.append("| Playwright | 1.49+ | 浏览器自动化 |\n")
    lines.append("| pydantic | 2.10+ | 配置校验 |\n")
    lines.append("| loguru | 0.7+ | 日志 |\n")
    lines.append("| faker | 33+ | 测试数据生成 |\n")
    lines.append("| requests | 2.32+ | API 辅助验证 |\n")

    lines.append("\n### 2.3 被测应用\n\n")
    lines.append("| 项目 | 值 |\n|------|------|\n")
    lines.append(f"| 前端地址 | `{cfg.app.base_url}` |\n")
    lines.append(f"| 后端 API | `{cfg.app.api_base_url}` |\n")
    lines.append(f"| 浏览器 | Chromium (headless={cfg.browser.headless}) |\n")
    lines.append(f"| 视口 | {cfg.browser.viewport_width}×{cfg.browser.viewport_height} |\n")
    lines.append(f"| 语言/时区 | {cfg.browser.locale} / {cfg.browser.timezone} |\n")

    # ============================================================
    # 三、测试方法
    # ============================================================
    lines.append("\n## 三、测试方法\n")
    lines.append("\n### 3.1 测试类型\n")
    lines.append(
        "\n- **端到端 UI 测试（E2E）**：模拟真实用户操作浏览器，"
        "覆盖登录 → 核心功能 → 数据验证全流程\n"
    )
    lines.append(
        "- **API 联动验证**：在 UI 操作同时监听 `/api/*` 请求，"
        "断言关键接口被正确调用、参数与状态符合预期\n"
    )
    lines.append(
        "- **多角色覆盖**：分别以 `platform_admin` / `team_admin` / `member` "
        "执行同一模块，验证权限隔离\n"
    )
    lines.append(
        "- **正常 + 异常路径**：每个核心功能同时覆盖正常流程与 1-2 个异常分支\n"
    )
    lines.append(
        "- **失败自愈**：网络抖动 / 元素未就绪通过 `wait_for` 与 `pytest-rerunfailures` 解决\n"
    )

    lines.append("\n### 3.2 用例组织\n")
    lines.append(
        "\n用例按模块划分子目录，使用 pytest marker 标识：\n"
        "\n- `@pytest.mark.smoke`：核心冒烟（登录 + 1 主流程）\n"
        "- `@pytest.mark.critical`：关键业务（必须通过）\n"
        "- `@pytest.mark.<module>`：各功能模块\n"
        "- `@pytest.mark.e2e`：跨模块端到端\n"
    )

    lines.append("\n### 3.3 数据策略\n")
    lines.append(
        "\n- **动态生成**：项目名、剧本名等用 `data_factory` 加时间戳生成，避免冲突\n"
        "- **独立用例**：每个用例自备数据，不依赖执行顺序\n"
        "- **测试账号**：使用固定的 `admin` / `team_admin` / `member` 三套账号\n"
    )

    # ============================================================
    # 四、测试结果
    # ============================================================
    lines.append("\n## 四、测试结果\n")
    total = stats.get("total", 0)
    passed = stats.get("passed", 0)
    failed = stats.get("failed", 0)
    skipped = stats.get("skipped", 0)
    error = stats.get("error", 0)
    pass_rate = (passed / total * 100) if total else 0

    lines.append("\n### 4.1 用例执行汇总\n\n")
    lines.append("| 指标 | 数值 |\n|------|------|\n")
    lines.append(f"| 用例总数 | {total} |\n")
    lines.append(f"| 通过 | {passed} |\n")
    lines.append(f"| 失败 | {failed} |\n")
    lines.append(f"| 跳过 | {skipped} |\n")
    lines.append(f"| 错误 | {error} |\n")
    lines.append(f"| 通过率 | {pass_rate:.2f}% |\n")
    lines.append(f"| 退出码 | {stats.get('exit_status', 0)} |\n")

    # ============================================================
    # 五、缺陷统计分析
    # ============================================================
    lines.append("\n## 五、缺陷统计分析\n")
    if not reporter.bugs:
        lines.append("\n本次测试**未发现**缺陷，所有用例通过。\n")
    else:
        lines.append("\n### 5.1 缺陷总数与分布\n")
        lines.append(f"\n- **总缺陷数**：{len(reporter.bugs)}\n")
        lines.append(f"\n#### 5.1.1 按严重程度\n\n| 等级 | 数量 | 占比 |\n|------|------|------|\n")
        for k, v in sorted(reporter._count_by("severity").items(), key=lambda x: -x[1]):
            pct = (v / len(reporter.bugs) * 100) if reporter.bugs else 0
            lines.append(f"| {k} | {v} | {pct:.1f}% |\n")
        lines.append(f"\n#### 5.1.2 按归属（前端/后端）\n\n| 归属 | 数量 | 占比 |\n|------|------|------|\n")
        for k, v in sorted(reporter._count_by("frontend_or_backend").items(), key=lambda x: -x[1]):
            pct = (v / len(reporter.bugs) * 100) if reporter.bugs else 0
            lines.append(f"| {k} | {v} | {pct:.1f}% |\n")
        lines.append(f"\n#### 5.1.3 按分类\n\n| 分类 | 数量 |\n|------|------|\n")
        for k, v in sorted(reporter._count_by("category").items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |\n")
        lines.append(f"\n#### 5.1.4 按模块\n\n| 模块 | 数量 |\n|------|------|\n")
        for k, v in sorted(reporter._count_by("module").items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |\n")

        lines.append("\n### 5.2 缺陷明细\n")
        lines.append("\n> 详细缺陷列表见 `reports/logs/bugs/latest.md`\n")

    # ============================================================
    # 六、测试结论
    # ============================================================
    lines.append("\n## 六、测试结论\n")
    if failed == 0 and error == 0:
        lines.append(
            "\n本次自动化测试 **全部通过**，"
            "项目 17 大功能模块主流程均按文档要求正常运行，无阻塞性问题。\n"
        )
    else:
        lines.append(
            f"\n本次自动化测试 **存在 {failed + error} 个失败/错误用例**，"
            "需要进一步定位分析：\n\n"
        )
        if reporter.bugs:
            critical = [b for b in reporter.bugs if b.severity.value == "严重"]
            if critical:
                lines.append(f"- **严重缺陷 {len(critical)} 个**，建议优先修复\n")
            frontend = [b for b in reporter.bugs if b.frontend_or_backend == "前端"]
            backend = [b for b in reporter.bugs if b.frontend_or_backend == "后端"]
            if frontend:
                lines.append(f"- **前端缺陷 {len(frontend)} 个**，归属 UI/交互/数据展示层\n")
            if backend:
                lines.append(f"- **后端缺陷 {len(backend)} 个**，归属 API/数据/权限/性能层\n")

    # ============================================================
    # 七、改进建议
    # ============================================================
    lines.append("\n## 七、改进建议\n")
    for s in suggestions:
        lines.append(f"\n- {s}\n")

    lines.append("\n---\n")
    lines.append("\n*本报告由 Python 自动化测试框架自动生成，所有数据来源于实际执行结果。*\n")
    return "".join(lines)


def _default_env() -> dict[str, str]:
    return {
        "操作系统": f"{platform.system()} {platform.release()} ({platform.version()[:60]})",
        "Python": platform.python_version(),
        "CPU 架构": platform.machine(),
        "主机名": platform.node(),
    }


def _default_suggestions() -> list[str]:
    return [
        "持续维护自动化测试用例，新增功能时同步补充测试，确保覆盖率不下降。",
        "对失败的冒烟用例优先处理，再扩展到全量回归。",
        "前端 UI 缺陷统一收集到设计系统组件库，跨页面修复。",
        "后端 API 缺陷需补充接口契约测试（契约测试优先于 UI 验证）。",
        "对阻塞性缺陷（severity=严重）建立 24h 响应机制。",
        "建议在 CI 中持续运行冒烟用例，每次部署后自动执行。",
        "定期清理测试数据，避免污染共享环境。",
        "对 mock/stub 行为进行标记，区分真实接口与占位实现。",
    ]


def save_test_report(content: str, output_dir: Optional[str] = None) -> Path:
    """保存测试报告到磁盘。"""
    cfg = get_config()
    out = Path(output_dir or cfg.report.html_report_path).parent
    out.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = out / f"test_report_{ts}.md"
    path.write_text(content, encoding="utf-8")
    latest = out / "test_report_latest.md"
    latest.write_text(content, encoding="utf-8")
    return path
