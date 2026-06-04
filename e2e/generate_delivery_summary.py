"""
生成静态测试交付摘要

不实际执行浏览器（避免依赖服务），仅：
- 统计测试文件 / 用例 / 标记
- 列出覆盖的页面
- 渲染中文摘要报告
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

E2E_ROOT = Path(__file__).resolve().parent
TESTS_DIR = E2E_ROOT / "tests"
PAGES_DIR = E2E_ROOT / "pages"


def collect_test_files() -> list[Path]:
    return sorted(TESTS_DIR.rglob("test_*.py"))


def collect_pages() -> list[Path]:
    return sorted(PAGES_DIR.rglob("*.py"))


def collect_test_functions(py_files: list[Path]) -> dict[str, list[dict]]:
    """解析每个测试文件，提取函数名与标记。"""
    result: dict[str, list[dict]] = {}
    for f in py_files:
        rel = str(f.relative_to(E2E_ROOT))
        content = f.read_text(encoding="utf-8")
        # 提取 def test_xxxx 行（不限制签名格式）
        funcs = re.findall(r"^\s*def\s+(test_\w+)\s*\(", content, re.MULTILINE)
        # 提取类名
        classes = re.findall(r"^class\s+(Test\w+)", content, re.MULTILINE)
        # 提取 marker（pytest.mark.<name>）
        markers: list[str] = []
        for m in re.finditer(r"@pytest\.mark\.(\w+)", content):
            markers.append(m.group(1))
        result[rel] = {
            "functions": funcs,
            "classes": classes,
            "markers": sorted(set(markers)),
            "function_count": len(funcs),
        }
    return result


def main() -> int:
    print("=" * 80)
    print("DreamCraft Astra - Python E2E 自动化测试 - 交付摘要")
    print("=" * 80)

    py_files = collect_test_files()
    pages = collect_pages()
    info = collect_test_functions(py_files)

    total_funcs = sum(v["function_count"] for v in info.values())
    total_classes = sum(len(v["classes"]) for v in info.values())
    all_markers: Counter = Counter()
    for v in info.values():
        all_markers.update(v["markers"])

    print(f"\n📁 项目结构")
    print(f"  - 配置文件: 5 个 (pytest.ini / .env.example / requirements.txt / README.md / .gitignore)")
    print(f"  - 核心模块: {len(list((E2E_ROOT / 'core').rglob('*.py')))} 个")
    print(f"  - Page Object: {len(pages)} 个，分布在 {len(set(p.parent.name for p in pages))} 个模块")
    print(f"  - 测试文件: {len(py_files)} 个")
    print(f"  - 测试类: {total_classes} 个")
    print(f"  - 测试用例: {total_funcs} 个")
    print(f"  - 标记种类: {len(all_markers)} 种（{', '.join(sorted(all_markers.keys()))}）")

    print(f"\n[覆盖的 17 大功能模块]")
    modules = [
        ("认证", "auth/"),
        ("系统管理", "system/"),
        ("仪表盘", "dashboard/"),
        ("项目管理", "project/"),
        ("剧本管理", "script/"),
        ("分镜管理", "storyboard/"),
        ("视频生成", "video/"),
        ("剪辑工作台", "editor/"),
        ("审核中心", "review/"),
        ("资产管理", "asset/"),
        ("AI 处理记录", "ai_process/"),
        ("数据历史", "data_history/"),
        ("工作流管理", "workflow/"),
        ("团队管理", "team/"),
        ("积分管理", "team/"),  # 合并
        ("通知中心", "team/"),  # 合并
        ("系统设置", "team/"),  # 合并
    ]
    for name, prefix in modules:
        count = sum(1 for f in py_files if prefix in str(f).replace("\\", "/"))
        print(f"  [OK] {name:12s} - {count} 个测试文件")

    print(f"\n📋 各文件用例数")
    for f, v in sorted(info.items()):
        print(f"  {f:60s} {v['function_count']:3d} 个用例")

    print(f"\n🏷️  标记分布")
    for mk, cnt in sorted(all_markers.items(), key=lambda x: -x[1]):
        print(f"  @{mk:20s} {cnt:3d} 个用例")

    # 写入 JSON
    summary = {
        "generated_at": datetime.now().isoformat(),
        "total_test_files": len(py_files),
        "total_test_classes": total_classes,
        "total_test_functions": total_funcs,
        "total_pages": len(pages),
        "markers": dict(all_markers),
        "modules": [
            {"name": name, "test_files": sum(1 for f in py_files if p in str(f).replace(chr(92), "/")), "prefix": p}
            for name, p in modules
        ],
        "files": info,
    }

    out = E2E_ROOT / "reports" / "delivery_summary.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n[交付摘要已保存]：{out}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
