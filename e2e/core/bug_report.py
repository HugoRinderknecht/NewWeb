"""
缺陷报告模块

按用户要求：
- 严格区分前端 / 后端 问题
- 提供技术细节与复现步骤
- 输出结构化报告（JSON + Markdown）
"""
from __future__ import annotations

import json
import time
import traceback
from dataclasses import asdict, dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Optional

from core.config import get_config
from core.logger import get_logger

logger = get_logger("bug_report")


class BugCategory(str, Enum):
    """缺陷分类：严格区分前后端。"""
    # 前端
    UI_DISPLAY = "前端-UI展示"          # 界面错位、样式异常、颜色错误
    INTERACTION = "前端-交互逻辑"       # 按钮无响应、流程跳转错
    FRONT_PERFORMANCE = "前端-性能"     # 加载慢、卡顿
    FRONT_VALIDATION = "前端-表单校验"  # 必填未校验、格式未限制
    FRONT_DATA = "前端-数据展示"        # 列表/卡片渲染异常
    FRONT_I18N = "前端-国际化"          # 文案错误、乱码
    # 后端
    API_FUNCTION = "后端-API功能"       # 接口报错、参数错
    API_DATA = "后端-数据处理"          # 数据错误、状态不一致
    API_AUTH = "后端-鉴权权限"          # 401/403、越权访问
    API_PERFORMANCE = "后端-性能"       # 慢响应、超时
    SERVER_ERROR = "后端-服务器错误"    # 500、异常堆栈
    # 通用
    ENV = "环境配置"
    DATA_FIXTURE = "测试数据"


class BugSeverity(str, Enum):
    CRITICAL = "严重"  # 阻塞流程
    HIGH = "高"        # 主功能异常
    MEDIUM = "中"      # 次要功能
    LOW = "低"         # 体验问题
    SUGGESTION = "建议"


@dataclass
class BugReport:
    """单条缺陷报告。"""

    id: str  # BUG-20260604-001
    title: str
    category: BugCategory
    severity: BugSeverity
    module: str  # 所属模块
    page_or_api: str  # 页面 URL 或 接口路径

    # 详情
    description: str
    steps_to_reproduce: list[str]
    expected: str
    actual: str
    technical_detail: str  # 错误堆栈 / 接口响应 / 截图路径
    frontend_or_backend: str  # "前端" / "后端" / "前后端"

    # 元数据
    test_case_id: str
    tester: str = "AI Testing Agent"
    detected_at: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    screenshot_path: Optional[str] = None
    video_path: Optional[str] = None
    trace_path: Optional[str] = None
    extra: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = asdict(self)
        d["category"] = self.category.value
        d["severity"] = self.severity.value
        return d


class BugReporter:
    """缺陷收集器。"""

    def __init__(self, output_dir: Optional[str] = None) -> None:
        cfg = get_config()
        self.output_dir = Path(output_dir or cfg.report.log_dir) / "bugs"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.bugs: list[BugReport] = []
        self._counter = 0

    def _next_id(self) -> str:
        self._counter += 1
        return f"BUG-{datetime.now().strftime('%Y%m%d')}-{self._counter:03d}"

    def report(
        self,
        title: str,
        category: BugCategory,
        severity: BugSeverity,
        module: str,
        page_or_api: str,
        description: str,
        steps_to_reproduce: list[str],
        expected: str,
        actual: str,
        technical_detail: str = "",
        test_case_id: str = "",
        screenshot_path: Optional[str] = None,
        traceback_str: str = "",
    ) -> BugReport:
        """登记一条缺陷。"""
        # 推断前后端
        if category.value.startswith("前端"):
            fb = "前端"
        elif category.value.startswith("后端"):
            fb = "后端"
        else:
            fb = "环境/数据"

        if not technical_detail and traceback_str:
            technical_detail = traceback_str

        bug = BugReport(
            id=self._next_id(),
            title=title,
            category=category,
            severity=severity,
            module=module,
            page_or_api=page_or_api,
            description=description,
            steps_to_reproduce=steps_to_reproduce,
            expected=expected,
            actual=actual,
            technical_detail=technical_detail,
            frontend_or_backend=fb,
            test_case_id=test_case_id,
            screenshot_path=screenshot_path,
        )
        self.bugs.append(bug)
        logger.error(f"[Bug] {bug.id} [{severity.value}] {category.value} - {title}")
        return bug

    def report_from_exception(
        self,
        exc: BaseException,
        test_case_id: str = "",
        module: str = "未知",
        page_or_api: str = "",
        expected: str = "",
        steps: Optional[list[str]] = None,
        category: BugCategory = BugCategory.UI_DISPLAY,
        severity: BugSeverity = BugSeverity.MEDIUM,
    ) -> Optional[BugReport]:
        """从异常对象推断生成报告。"""
        tb = traceback.format_exception(type(exc), exc, exc.__traceback__)
        tb_text = "".join(tb)
        return self.report(
            title=f"{type(exc).__name__}: {str(exc)[:80]}",
            category=category,
            severity=severity,
            module=module,
            page_or_api=page_or_api or "未知",
            description=f"测试执行过程中抛出异常：{exc}",
            steps_to_reproduce=steps or ["复现步骤：参见对应测试用例"],
            expected=expected or "用例按预期通过",
            actual=f"实际抛出 {type(exc).__name__}: {exc}",
            technical_detail=tb_text,
            test_case_id=test_case_id,
        )

    # ============================================================
    # 输出
    # ============================================================
    def save(self) -> Path:
        """落盘 JSON + Markdown 报告。"""
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_path = self.output_dir / f"bugs_{ts}.json"
        md_path = self.output_dir / f"bugs_{ts}.md"
        latest = self.output_dir / "latest.json"
        latest_md = self.output_dir / "latest.md"

        # JSON
        data = {
            "generated_at": datetime.now().isoformat(),
            "total": len(self.bugs),
            "by_category": self._count_by("category"),
            "by_severity": self._count_by("severity"),
            "by_module": self._count_by("module"),
            "by_frontend_or_backend": self._count_by("frontend_or_backend"),
            "bugs": [b.to_dict() for b in self.bugs],
        }
        json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        latest.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

        # Markdown
        md_path.write_text(self.render_markdown(), encoding="utf-8")
        latest_md.write_text(self.render_markdown(), encoding="utf-8")

        logger.info(f"[Bug] 报告已保存：{md_path}")
        return md_path

    def _count_by(self, key: str) -> dict[str, int]:
        result: dict[str, int] = {}
        for b in self.bugs:
            v = getattr(b, key)
            v = v.value if isinstance(v, Enum) else v
            result[v] = result.get(v, 0) + 1
        return result

    def render_markdown(self) -> str:
        """渲染 Markdown 报告。"""
        lines: list[str] = []
        lines.append("# 自动化测试缺陷报告\n")
        lines.append(f"> 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        lines.append(f"\n## 一、缺陷统计概览\n")
        lines.append(f"\n- **总缺陷数**：{len(self.bugs)}\n")
        lines.append(f"\n### 1.1 按严重程度\n\n| 等级 | 数量 |\n|------|------|\n")
        for k, v in sorted(self._count_by("severity").items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |\n")
        lines.append(f"\n### 1.2 按归属（前端/后端）\n\n| 归属 | 数量 |\n|------|------|\n")
        for k, v in sorted(self._count_by("frontend_or_backend").items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |\n")
        lines.append(f"\n### 1.3 按缺陷分类\n\n| 分类 | 数量 |\n|------|------|\n")
        for k, v in sorted(self._count_by("category").items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |\n")
        lines.append(f"\n### 1.4 按模块\n\n| 模块 | 数量 |\n|------|------|\n")
        for k, v in sorted(self._count_by("module").items(), key=lambda x: -x[1]):
            lines.append(f"| {k} | {v} |\n")

        lines.append("\n## 二、缺陷明细\n")
        for b in self.bugs:
            lines.append(f"\n### {b.id} - {b.title}\n")
            lines.append(f"\n| 字段 | 内容 |\n|------|------|\n")
            lines.append(f"| 严重程度 | {b.severity.value} |\n")
            lines.append(f"| 分类 | {b.category.value} |\n")
            lines.append(f"| 归属 | **{b.frontend_or_backend}** |\n")
            lines.append(f"| 模块 | {b.module} |\n")
            lines.append(f"| 页面/接口 | `{b.page_or_api}` |\n")
            lines.append(f"| 用例 ID | {b.test_case_id} |\n")
            lines.append(f"| 发现时间 | {b.detected_at} |\n")
            lines.append(f"| 测试人员 | {b.tester} |\n")
            if b.screenshot_path:
                lines.append(f"| 截图 | `{b.screenshot_path}` |\n")
            lines.append(f"\n**问题描述**：\n\n{b.description}\n")
            lines.append(f"\n**复现步骤**：\n\n")
            for i, s in enumerate(b.steps_to_reproduce, 1):
                lines.append(f"{i}. {s}\n")
            lines.append(f"\n**预期结果**：{b.expected}\n")
            lines.append(f"\n**实际结果**：{b.actual}\n")
            if b.technical_detail:
                lines.append(f"\n**技术细节**：\n\n```\n{b.technical_detail[:3000]}\n```\n")

        return "".join(lines)


# 全局 reporter
_global_reporter: Optional[BugReporter] = None


def get_bug_reporter() -> BugReporter:
    global _global_reporter
    if _global_reporter is None:
        _global_reporter = BugReporter()
    return _global_reporter
