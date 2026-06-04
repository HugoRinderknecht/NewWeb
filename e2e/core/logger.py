"""
日志模块

使用 loguru 提供：
- 控制台彩色输出
- 文件落盘（按日滚动）
- 异常堆栈完整记录
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Optional

from loguru import logger as _logger

from .config import get_config


def setup_logging(level: str = "INFO") -> None:
    """初始化日志：控制台 + 文件。"""
    cfg = get_config()
    log_dir = Path(cfg.report.log_dir)
    log_dir.mkdir(parents=True, exist_ok=True)

    # 移除默认 sink
    _logger.remove()

    # 控制台
    _logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>",
        level=level,
        colorize=True,
    )

    # 文件（全量）
    _logger.add(
        log_dir / "e2e_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level="DEBUG",
        rotation="00:00",
        retention="7 days",
        encoding="utf-8",
        enqueue=True,
    )

    # 文件（仅 ERROR）
    _logger.add(
        log_dir / "error_{time:YYYY-MM-DD}.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}\n{exception}",
        level="ERROR",
        rotation="00:00",
        retention="30 days",
        encoding="utf-8",
        enqueue=True,
        backtrace=True,
        diagnose=False,
    )


def get_logger(name: Optional[str] = None):
    """获取 logger 实例，可选绑定模块名。"""
    if name:
        return _logger.bind(module=name)
    return _logger


# 默认 logger
logger = get_logger("e2e")
