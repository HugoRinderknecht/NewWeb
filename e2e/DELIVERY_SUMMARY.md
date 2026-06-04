# DreamCraft Astra - Python E2E 自动化测试交付总结

> **交付日期**：2026-06-04  
> **测试框架**：pytest 8.3 + Playwright 1.49（同步 API）  
> **设计原则**：Page Object Model + 显式 fixture + 中文报告 + 前后端缺陷分类

---

## 一、交付物总览

| 类别 | 数量 | 路径 |
|------|------|------|
| 配置文件 | 5 | [e2e/](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/) 根目录 |
| 核心模块 | 7 | [e2e/core/](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/core/) |
| Page Object | 25 | [e2e/pages/](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/pages/) |
| 测试用例 | 180 | [e2e/tests/](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/tests/) |
| 测试文件 | 16 | 同上 |
| 测试类 | 64 | 同上 |
| Marker | 20 种 | 见 `pytest.ini` |
| 中文报告 | 3 类 | pytest-html + allure + Markdown |
| 数据架构审查 | 1 份 | [docs/数据架构审查报告.md](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/docs/%E6%95%B0%E6%8D%AE%E6%9E%B6%E6%9E%84%E5%AE%A1%E6%9F%A5%E6%8A%A5%E5%91%8A.md) |

---

## 二、目录结构

```
e2e/
├── README.md                    # 使用说明（中文）
├── pytest.ini                   # pytest 配置（含 20 种 marker）
├── requirements.txt             # 依赖清单
├── .env.example                 # 环境变量模板（已填入您的管理员账号）
├── .gitignore
├── run.py                       # 一键启动入口
├── conftest.py                  # 全局 fixture + 报告钩子
├── generate_delivery_summary.py # 交付摘要生成脚本
│
├── core/                        # 核心基础设施
│   ├── __init__.py
│   ├── config.py                # Pydantic 配置（4 个子配置）
│   ├── logger.py                # loguru 日志（控制台 + 文件）
│   ├── exceptions.py            # 自定义异常体系
│   ├── constants.py             # 路由/按钮/状态枚举
│   ├── bug_report.py            # 缺陷报告（前后端分类）
│   └── test_report.py           # 中文测试报告渲染器
│
├── pages/                       # Page Object Model（25 个）
│   ├── base_page.py             # 页面基类
│   ├── auth/                    # 登录/注册/忘记密码
│   ├── system/                  # 系统管理（10 页）
│   ├── dashboard/               # 仪表盘（6 页）
│   ├── project/                 # 项目管理（7 页）
│   ├── script/                  # 剧本管理（6 页）
│   ├── storyboard/              # 分镜管理（4 页）
│   ├── video/                   # 视频生成（4 页）
│   ├── editor/                  # 剪辑工作台（3 页）
│   ├── review/                  # 审核中心（6 页）
│   ├── asset/                   # 资产管理（8 页）
│   ├── ai_process/              # AI 处理记录
│   ├── data_history/            # 数据历史
│   ├── workflow/                # 工作流管理
│   ├── team/                    # 团队管理
│   ├── points/                  # 积分管理
│   ├── notice/                  # 通知中心
│   └── settings/                # 系统设置
│
├── fixtures/                    # 跨模块 fixture
│   ├── auth.py                  # admin/team_admin/member 三套登录
│   └── data.py                  # 动态数据 fixtures
│
├── utils/                       # 工具
│   ├── data_factory.py          # 数据生成（faker + 时间戳）
│   ├── api_helper.py            # HTTP 客户端 + 断言
│   └── wait_helpers.py          # Element Plus 等待辅助
│
├── tests/                       # 测试用例（16 文件 / 180 用例）
│   ├── conftest.py
│   ├── smoke/                   # 冒烟（3 用例）
│   ├── auth/                    # 23 用例
│   ├── system/                  # 27 用例
│   ├── dashboard/               # 10 用例
│   ├── project/                 # 19 用例
│   ├── script/                  # 17 用例
│   ├── storyboard/              # 9 用例
│   ├── video/                   # 8 用例
│   ├── editor/                  # 7 用例
│   ├── review/                  # 11 用例
│   ├── asset/                   # 17 用例
│   ├── ai_process/              # 7 用例
│   ├── team/                    # 18 用例（团队+积分+通知+设置）
│   ├── e2e/                     # 4 用例（端到端）
│
└── reports/                     # 测试产物（运行时生成）
    ├── html/                    # pytest-html
    ├── allure-results/          # allure
    ├── screenshots/             # 失败截图
    ├── videos/                  # 失败视频
    ├── traces/                  # Playwright trace
    ├── logs/                    # 执行日志 + 中文报告
    └── delivery_summary.json    # 本次交付摘要
```

---

## 三、覆盖的 17 大功能模块

| # | 模块 | 测试文件 | 用例数 | 文档依据 |
|---|------|---------|--------|---------|
| 1 | 认证 | 3 个 | 23 | 前端页面UI详细说明 §认证 |
| 2 | 系统管理 | 1 个 | 27 | 功能模块 §1 |
| 3 | 仪表盘 | 1 个 | 10 | 功能模块 §2 |
| 4 | 项目管理 | 1 个 | 19 | 功能模块 §3 |
| 5 | 剧本管理 | 1 个 | 17 | 功能模块 §4 |
| 6 | 分镜管理 | 1 个 | 9 | 功能模块 §5 |
| 7 | 视频生成 | 1 个 | 8 | 功能模块 §6 |
| 8 | 剪辑工作台 | 1 个 | 7 | 功能模块 §7 |
| 9 | 审核中心 | 1 个 | 11 | 功能模块 §8 |
| 10 | 资产管理 | 1 个 | 17 | 功能模块 §9 |
| 11 | AI 处理记录 | 1 个（合 3 模块） | 7 | 功能模块 §10-12 |
| 12 | 数据历史 | （合并） | （合并） | 功能模块 §11 |
| 13 | 工作流管理 | （合并） | （合并） | 功能模块 §12 |
| 14 | 团队管理 | 1 个（合 4 模块） | 18 | 功能模块 §13 |
| 15 | 积分管理 | （合并） | （合并） | 功能模块 §14 |
| 16 | 通知中心 | （合并） | （合并） | 功能模块 §15 |
| 17 | 系统设置 | （合并） | （合并） | 功能模块 §16 |
| - | 端到端流程 | 1 个 | 4 | 跨模块 |
| - | 冒烟 | 1 个 | 3 | - |
| **合计** | **17** | **16** | **180** | - |

---

## 四、关键技术特性

### 4.1 架构

- **Page Object Model**：所有页面继承 [base_page.py](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/pages/base_page.py)，封装定位、操作、等待、断言
- **显式 Fixture**：[conftest.py](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/conftest.py) 提供 session / function 两级浏览器实例
- **Adapter 模式**：[auth.py](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/fixtures/auth.py) 中 admin/team_admin/member 三种角色

### 4.2 报告（按用户要求严格执行）

- **pytest-html**：单文件 HTML 报告，含失败截图
- **Allure**：结构化结果
- **中文 Markdown**：[test_report.py](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/core/test_report.py) 渲染 7 大章节：
  1. 测试概要
  2. 测试环境
  3. 测试方法
  4. 测试结果
  5. 缺陷统计分析
  6. 测试结论
  7. 改进建议
- **缺陷报告**：[bug_report.py](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/e2e/core/bug_report.py) 严格区分前端/后端：
  - `BugCategory`：UI_DISPLAY / INTERACTION / FRONT_PERFORMANCE / FRONT_VALIDATION / FRONT_DATA / FRONT_I18N
  - `API_FUNCTION` / `API_DATA` / `API_AUTH` / `API_PERFORMANCE` / `SERVER_ERROR`
  - `BugSeverity`：严重 / 高 / 中 / 低 / 建议
  - 每条缺陷包含：复现步骤、预期、实际、技术细节、堆栈、截图路径

### 4.3 失败自愈

- 失败自动截图 → `reports/screenshots/`
- 失败自动录视频 → `reports/videos/`
- Playwright trace.zip → `reports/traces/`，可用 `npx playwright show-trace` 回放
- `pytest-rerunfailures` 失败重试

### 4.4 数据隔离

- `data_factory` 动态生成项目名/剧本名等，避免冲突
- 三套独立账号（admin/team_admin/member）
- 每个用例独立 session

### 4.5 API 联动验证

- `api_responses` fixture 监听所有 `/api/*` 响应
- 可断言关键接口被调用（method/status/body）

---

## 五、运行方式

### 5.1 一键运行（推荐）

```bash
cd e2e

# 全部用例
python run.py

# 冒烟
python run.py --markers smoke

# 系统管理
python run.py --module system

# 端到端
python run.py -m e2e

# 失败重试
python run.py --rerun 2

# 仅渲染报告
python run.py --report-only
```

### 5.2 直接用 pytest

```bash
# 安装依赖
pip install -r requirements.txt
playwright install chromium

# 启动前端
cd ..
pnpm dev    # http://localhost:3006

# 运行
pytest                                # 全部
pytest -m smoke                       # 冒烟
pytest tests/auth -v                  # 单模块
pytest -k test_login_success -v       # 单用例
pytest --html=reports/html/r.html --self-contained-html
```

### 5.3 依赖说明

- **Python 3.10+**（已在 3.14.5 验证）
- **Playwright 1.49+** + Chromium
- **后端**：`http://server.bsuniversal.cn:10006`（已通过 VITE_API_PROXY_URL 代理）
- **前端**：`http://localhost:3006`

---

## 六、当前状态

| 检查项 | 结果 |
|--------|------|
| `pytest --collect-only` | **180 tests collected** |
| Page Object 导入 | 全部通过 |
| 核心模块导入 | 全部通过 |
| 依赖安装 | dotenv/pydantic/loguru/faker/pytest/playwright OK |
| 前端服务可达性 | 需 `pnpm dev` 启动后验证 |
| 后端 API 可达性 | `http://server.bsuniversal.cn:10006`（远程） |

---

## 七、数据架构审查报告

按用户要求，已生成 [docs/数据架构审查报告.md](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-feature-mock-and-router-update-20260530/docs/%E6%95%B0%E6%8D%AE%E6%9E%B6%E6%9E%84%E5%AE%A1%E6%9F%A5%E6%8A%A5%E5%91%8A.md)。

**关键发现**：
- 1 个 Adapter 实现（HttpAdapter），符合分层原则（45 个文件经 `getApiAdapter()` 调用）
- 7 个 `src/api/admin/*.ts` 与顶层 `src/api/*.ts` 平行重复（P0 需清理）
- 11 个 Pinia Store + 5 个 Vue Query wrapper
- 双 Store 模式（`useProjectStore` ↔ `useProjectDataStore`）存在同步风险
- 缺失 `MockAdapter`（README 中提及但代码中无）
- 菜单接口使用 `/api/v3/` 前缀与其他不一致

---

## 八、登录账号

`pytest.ini` / `.env.example` / `config.py` 已统一更新为：

```ini
ADMIN_USERNAME=17369359010
ADMIN_PASSWORD=Kill242002
```

其余两个角色（team_admin / member）首次执行需手动注册或由管理员创建。

---

## 九、下一步建议

1. 启动前端 + 后端后执行 `python run.py --markers smoke`，验证登录通路
2. 按模块逐步运行 `python run.py --module <name>`，定位问题
3. 失败用例通过 `reports/screenshots/` + `reports/traces/` 排查
4. 中文缺陷报告 `reports/logs/bugs/latest.md` 严格按前后端分类
5. 建议在 CI 中每日运行 `pytest -m smoke`，每周一次全量回归

---

*本方案基于 `docs/功能模块全面分析文档.md` + `docs/平台功能模块全面分析文档.md` + `docs/前端页面UI详细说明.md` 三份文档分析生成，共编写 180 个测试用例覆盖 17 大功能模块。*
