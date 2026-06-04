# DreamCraft Astra - Python E2E 自动化测试

> 基于 `pytest` + `Playwright` 的端到端 UI 自动化测试方案，覆盖三份分析文档描述的全部 17 个功能模块。

## 📁 目录结构

```
e2e/
├── conftest.py                  # 全局 pytest 配置与 fixtures
├── pytest.ini                   # pytest 行为配置
├── requirements.txt             # 依赖清单
├── .env.example                 # 环境变量模板
├── run.py                       # 一键启动入口
│
├── core/                        # 核心基础设施
│   ├── __init__.py
│   ├── config.py                # 配置加载（pydantic）
│   ├── logger.py                # 日志（loguru）
│   ├── constants.py             # 全局常量（路由、按钮文本等）
│   └── exceptions.py            # 自定义异常
│
├── pages/                       # 页面对象（Page Object Model）
│   ├── __init__.py
│   ├── base_page.py             # 页面基类
│   ├── auth/
│   │   ├── login_page.py
│   │   ├── register_page.py
│   │   └── forget_password_page.py
│   ├── system/
│   │   ├── admin_dashboard_page.py
│   │   ├── user_page.py
│   │   ├── role_page.py
│   │   ├── menu_page.py
│   │   ├── audit_logs_page.py
│   │   ├── billing_config_page.py
│   │   ├── platform_teams_page.py
│   │   ├── video_models_page.py
│   │   ├── dify_workflows_page.py
│   │   └── runtime_config_page.py
│   ├── dashboard/
│   │   ├── console_page.py
│   │   ├── usage_page.py
│   │   ├── analysis_page.py
│   │   ├── data_dashboard_page.py
│   │   ├── ai_usage_page.py
│   │   └── cost_page.py
│   ├── project/                 # 项目管理
│   ├── script/                  # 剧本管理
│   ├── storyboard/              # 分镜管理
│   ├── video/                   # 视频生成
│   ├── editor/                  # 剪辑工作台
│   ├── review/                  # 审核中心
│   ├── asset/                   # 资产管理
│   ├── ai_process/              # AI 处理记录
│   ├── data_history/            # 数据历史
│   ├── workflow/                # 工作流管理
│   ├── team/                    # 团队管理
│   ├── points/                  # 积分管理
│   ├── notice/                  # 通知中心
│   └── settings/                # 系统设置
│
├── fixtures/                    # 可复用 fixtures
│   ├── __init__.py
│   ├── browser.py
│   ├── page.py
│   ├── auth.py
│   └── data.py
│
├── utils/                       # 工具方法
│   ├── __init__.py
│   ├── screenshot.py
│   ├── wait_helpers.py
│   ├── api_helper.py            # HTTP 辅助
│   └── data_factory.py
│
├── tests/                       # 测试用例
│   ├── conftest.py              # 用例级 fixture
│   ├── smoke/                   # 冒烟用例（核心路径）
│   ├── auth/
│   ├── system/
│   ├── dashboard/
│   ├── project/
│   ├── script/
│   ├── storyboard/
│   ├── video/
│   ├── editor/
│   ├── review/
│   ├── asset/
│   ├── ai_process/
│   ├── data_history/
│   ├── workflow/
│   ├── team/
│   ├── points/
│   ├── notice/
│   ├── settings/
│   └── e2e/                     # 跨模块端到端流程
│
└── reports/                     # 测试产物（运行时生成）
    ├── html/                    # pytest-html
    ├── allure-results/          # allure
    ├── screenshots/             # 失败截图
    ├── videos/                  # 失败视频
    ├── traces/                  # Playwright trace
    └── logs/                    # 执行日志
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd e2e
python -m venv venv
# Windows
venv\Scripts\activate
# Linux / macOS
# source venv/bin/activate

pip install -r requirements.txt
playwright install chromium     # 安装浏览器（首次）
playwright install-deps         # 安装系统依赖（Linux 需要）
```

### 2. 配置环境

```bash
cp .env.example .env
# 编辑 .env 修改 BASE_URL / 账号密码
```

### 3. 启动被测应用

```bash
# 在项目根目录
pnpm install
pnpm dev                         # http://localhost:3006
```

### 4. 运行测试

```bash
# 全部用例
pytest

# 仅冒烟用例
pytest -m smoke

# 特定模块
pytest tests/system -v
pytest tests/project -v

# 端到端流程
pytest tests/e2e -v

# 指定用例
pytest tests/auth/test_login.py::TestLogin::test_login_success -v

# 生成 HTML 报告
pytest --html=reports/html/report.html --self-contained-html

# 并发执行（4 worker）
pytest -n 4

# 失败自动重试
pytest --reruns 2 --reruns-delay 3
```

### 5. 一键运行（推荐）

```bash
# 默认全量运行
python run.py

# 指定标记
python run.py --markers smoke
python run.py --markers "system or dashboard"
python run.py --markers e2e

# 仅生成报告
python run.py --report-only
```

## 📊 测试报告

| 报告类型 | 路径 | 说明 |
|---------|------|------|
| HTML | `reports/html/report.html` | pytest-html 单文件报告，含失败截图 |
| Allure | `reports/allure-results/` | allure-pytest 结构化结果 |
| 截图 | `reports/screenshots/` | 每个失败用例自动截图 |
| 视频 | `reports/videos/` | 用例执行视频回放 |
| Trace | `reports/traces/` | Playwright trace.zip，可用 `npx playwright show-trace` 打开 |
| 日志 | `reports/logs/` | 详细执行日志 |

## 🏷️ 用例标记

| 标记 | 范围 |
|------|------|
| `@pytest.mark.smoke` | 核心冒烟：登录 + 1 个主流程 |
| `@pytest.mark.critical` | 关键业务（必须通过） |
| `@pytest.mark.e2e` | 跨模块端到端流程 |
| `@pytest.mark.<module>` | 各功能模块 |
| `@pytest.mark.slow` | 慢用例（>10s） |
| `@pytest.mark.network` | 依赖网络 |
| `@pytest.mark.ui_only` | 仅 UI 验证 |
| `@pytest.mark.api_verify` | UI + API 双重验证 |

## 📐 设计原则

1. **Page Object Model**：每个页面一个类，元素与业务分离
2. **Fixture 复用**：登录 / 浏览器 / 测试数据在 `conftest.py` 集中管理
3. **失败自愈**：网络抖动、动态加载通过 `wait_for` / 重试解决
4. **可读性优先**：用例名以业务语言描述（`test_login_with_invalid_password_shows_error`）
5. **数据隔离**：每个用例独立数据集，通过 `data_factory` 动态生成
6. **多角色覆盖**：每模块同时验证 `platform_admin` / `team_admin` / `member`

## 📚 参考文档

- `docs/功能模块全面分析文档.md` - 模块功能描述
- `docs/平台功能模块全面分析文档.md` - 平台特性补充
- `docs/前端页面UI详细说明.md` - UI 元素与交互细节

## 🛠 故障排查

| 现象 | 排查 |
|------|------|
| `playwright._impl._errors.Error: Executable doesn't exist` | 执行 `playwright install chromium` |
| 登录后跳转 404 | 检查后端 API `VITE_API_PROXY_URL` 是否可达 |
| Element timeout | 调高 `DEFAULT_TIMEOUT` 或检查 `v-loading` 是否阻塞 |
| 中文乱码 | 已设置 `LOCALE=zh-CN` `TIMEZONE=Asia/Shanghai` |
| 视频未生成 | `playwright install` 时浏览器需带视频编解码器 |

## 📈 覆盖率目标

- ✅ 17 大功能模块主流程 100% 覆盖
- ✅ P0 用例 100% 通过
- ✅ 异常路径至少 1 个用例 / 关键功能
- ✅ 跨模块 E2E 流程 1 套（注册 → 主业务）
