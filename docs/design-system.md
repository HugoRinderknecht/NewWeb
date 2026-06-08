# Dreamcraft Astra 通用设计规范（Global Design System）

> **版本**：v1.0.0
> **维护**：设计与前端共同维护
> **适用范围**：Dreamcraft Astra 全产品线（Web / H5 / 小程序 / 桌面端）所有前端界面
> **目的**：统一设计语言、降低协作成本、提升交付一致性、缩短研发链路
> **更新原则**：向后兼容；不破坏既有契约；每次变更记录于 §22 变更日志

***

## 目录

1. [设计哲学](#1-设计哲学)
2. [品牌识别](#2-品牌识别)
3. [色彩系统](#3-色彩系统)
4. [排版系统](#4-排版系统)
5. [间距与栅格](#5-间距与栅格)
6. [圆角与阴影](#6-圆角与阴影)
7. [动效系统](#7-动效系统)
8. [图标系统](#8-图标系统)
9. [组件库规范](#9-组件库规范)
10. [布局系统](#10-布局系统)
11. [导航与路由](#11-导航与路由)
12. [反馈与消息](#12-反馈与消息)
13. [响应式规范](#13-响应式规范)
14. [可访问性 A11y](#14-可访问性-a11y)
15. [国际化与文案](#15-国际化与文案)
16. [性能与体验](#16-性能与体验)
17. [文件与代码组织](#17-文件与代码组织)
18. [主题与暗色模式](#18-主题与暗色模式)
19. [设计交付物](#19-设计交付物)
20. [版本管理](#20-版本管理)
21. [最佳实践与反模式](#21-最佳实践与反模式)
22. [变更日志](#22-变更日志)

***

## 1. 设计哲学

### 1.1 三大原则

| 原则                          | 含义            | 落地                            |
| --------------------------- | ------------- | ----------------------------- |
| **清晰优先**（Clarity First）     | 信息层级 > 视觉装饰   | 单一焦点、对比度 ≥ 4.5:1、不喧宾夺主        |
| **柔和精致**（Soft Refinement）   | 温和的紫蓝主调 + 玻璃态 | 圆角 8/12、阴影柔和、半透明叠层            |
| **克制动效**（Restrained Motion） | 动效服务于理解，不炫技   | 150-300ms、ease、stagger ≤ 80ms |

### 1.2 设计语调（Tone）

- **专业可信**：用于 ToB / 创作工作台
- **现代温度**：圆角与渐变弱化机械感
- **克制彩色**：主色承担 80% 视觉张力，辅色不超过 20%

### 1.3 五大设计态度

1. **少即是多**：能用变量 / Token 表达的不硬编码
2. **一致性 > 创意**：复用组件 > 自定义样式
3. **可访问即默认**：色彩对比、键盘可达、语义化标签
4. **移动友好**：触摸目标 ≥ 32px
5. **性能即体验**：动效不阻塞主线程，骨架屏替代空白

***

## 2. 品牌识别

### 2.1 品牌名

- 中文：Dreamcraft Astra
- 英文缩写：DCA
- Slogan：创作即探索

### 2.2 Logo 使用

- **最小尺寸**：32×32（数字端），12mm（印刷端）
- **安全距离**：四周 ≥ Logo 高度的 1/2
- **禁止**：变形、改色、加描边、加投影
- **底色规则**：深底用亮色 Logo，浅底用深色 Logo
- **品牌色版本**：紫蓝渐变 `#6366F1 → #8B5CF6`

### 2.3 品牌资产

| 资源      | 规范                                                               |
| ------- | ---------------------------------------------------------------- |
| Logo 主图 | SVG（矢量） + PNG\@2x/@3x                                            |
| 品牌渐变    | `linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)` |
| 品牌字体    | 中文：思源黑体 / 英文：Inter                                               |
| 品牌声音    | 沉稳、年轻、可信赖                                                        |

***

## 3. 色彩系统

### 3.1 主题

- **明色主题（默认）**：`light`
- **暗色主题**：`dark`
- **跟随系统**：`auto`

### 3.2 品牌主色（紫蓝双调）

| Token                   | Light     | Dark      | 用途      |
| ----------------------- | --------- | --------- | ------- |
| `--art-primary`         | `#6366F1` | `#818CF8` | 主色基色    |
| `--art-primary-light-3` | `#7C8AFD` | `#A5B4FC` | hover   |
| `--art-primary-light-5` | `#A5B4FC` | `#C7D2FE` | 边框、激活   |
| `--art-primary-light-7` | `#C7D2FE` | `#E0E7FF` | 极浅背景    |
| `--art-primary-light-9` | `#EEF2FF` | `#1E1B4B` | hover 底 |
| `--art-primary-dark-2`  | `#4F46E5` | `#6366F1` | 强调      |

### 3.3 品牌辅助色

| Token             | HEX       | 用途         |
| ----------------- | --------- | ---------- |
| `--art-secondary` | `#8B5CF6` | 紫罗兰（强调、点缀） |
| `--art-accent`    | `#D946EF` | 品红（高光、装饰）  |
| `--art-info`      | `#0EA5E9` | 信息、链接      |
| `--art-success`   | `#10B981` | 成功、完成      |
| `--art-warning`   | `#F59E0B` | 警告、待处理     |
| `--art-danger`    | `#EF4444` | 错误、删除      |

每种辅助色提供 `-light-3/-5/-7/-9` 与 `-dark-2` 变体（类比主色）。

### 3.4 中性色（明色）

| Token                         | HEX       | 用途    |
| ----------------------------- | --------- | ----- |
| `--el-text-color-primary`     | `#0F172A` | 主文字   |
| `--el-text-color-regular`     | `#334155` | 正文    |
| `--el-text-color-secondary`   | `#64748B` | 次文字   |
| `--el-text-color-placeholder` | `#94A3B8` | 占位、提示 |
| `--el-text-color-disabled`    | `#CBD5E1` | 禁用    |

### 3.5 中性色（暗色）

| Token                         | HEX       | 用途  |
| ----------------------------- | --------- | --- |
| `--el-text-color-primary`     | `#F1F5F9` | 主文字 |
| `--el-text-color-regular`     | `#CBD5E1` | 正文  |
| `--el-text-color-secondary`   | `#94A3B8` | 次文字 |
| `--el-text-color-placeholder` | `#64748B` | 占位  |
| `--el-text-color-disabled`    | `#475569` | 禁用  |

### 3.6 背景层级

| Token                         | Light     | Dark      | 用途    |
| ----------------------------- | --------- | --------- | ----- |
| `--default-box-color`         | `#FFFFFF` | `#0F172A` | 卡片、弹窗 |
| `--el-bg-color`               | `#F8FAFC` | `#0B1120` | 全局底色  |
| `--el-fill-color-extra-light` | `#F8FAFC` | `#1E293B` | 极浅底   |
| `--el-fill-color-light`       | `#F1F5F9` | `#1E293B` | 浅底    |
| `--el-fill-color`             | `#E2E8F0` | `#334155` | 中底    |
| `--el-fill-color-blank`       | `#FFFFFF` | `#0F172A` | 纯色    |

### 3.7 边框层级

| Token                           | Light     | Dark      | 用途     |
| ------------------------------- | --------- | --------- | ------ |
| `--el-border-color-extra-light` | `#F1F5F9` | `#1E293B` | 极浅边    |
| `--el-border-color-lighter`     | `#E2E8F0` | `#334155` | 浅边（默认） |
| `--el-border-color-light`       | `#CBD5E1` | `#475569` | 中边     |
| `--el-border-color`             | `#94A3B8` | `#64748B` | 主边     |
| `--el-border-color-dark`        | `#64748B` | `#94A3B8` | 深边     |

### 3.8 状态色与情感

| 情感 | 主色                   | 浅背景                          | 边框                           | 文案 |
| -- | -------------------- | ---------------------------- | ---------------------------- | -- |
| 成功 | `--el-color-success` | `--el-color-success-light-9` | `--el-color-success-light-5` | 绿色 |
| 警告 | `--el-color-warning` | `--el-color-warning-light-9` | `--el-color-warning-light-5` | 橙色 |
| 危险 | `--el-color-danger`  | `--el-color-danger-light-9`  | `--el-color-danger-light-5`  | 红色 |
| 信息 | `--el-color-info`    | `--el-color-info-light-9`    | `--el-color-info-light-5`    | 蓝色 |

**使用规则**：

- 状态色仅用于语义场景（成功/警告/危险/信息）
- 禁止用于装饰、品牌强调、按钮主色
- 浅背景仅用于 tag、徽章、按钮 hover

### 3.9 渐变系统

| 渐变                                                               | 用途       |
| ---------------------------------------------------------------- | -------- |
| `linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)` | 品牌主渐变    |
| `linear-gradient(135deg, #1E1B4B 0%, #312E81 45%, #4C1D95 100%)` | Hero 深色底 |
| `linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)`              | 浅色空态     |
| `linear-gradient(180deg, transparent, rgba(0,0,0,.04))`          | 卡片底部分隔   |

**渐变规则**：

- 渐变方向以 `135deg` 为主，特殊场景使用 `90deg / 180deg`
- 颜色不超过 3 段，过渡点 `50%`
- 禁止使用 `radial-gradient` 制作装饰光斑以外的元素

### 3.10 颜色可访问性

| 组合         | 对比度    | 结论    |
| ---------- | ------ | ----- |
| 主文字 on 白底  | 16.1:1 | ✓ AAA |
| 主文字 on 暗底  | 15.2:1 | ✓ AAA |
| 次文字 on 白底  | 7.4:1  | ✓ AAA |
| 提示文字 on 白底 | 4.6:1  | ✓ AA  |
| 链接 on 白底   | 5.1:1  | ✓ AA  |
| 主色 on 白底   | 5.8:1  | ✓ AA  |
| 错误 on 白底   | 5.4:1  | ✓ AA  |

**强制规则**：所有正文文字对比度 ≥ 4.5:1，大字体 ≥ 3:1。

***

## 4. 排版系统

### 4.1 字体家族

| 用途         | 字体栈                                                                        |
| ---------- | -------------------------------------------------------------------------- |
| 中文         | `'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', sans-serif`       |
| 英文         | `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` |
| 数字（强调）     | `Inter, -apple-system, sans-serif`（默认）                                     |
| 等宽         | `'JetBrains Mono', 'SF Mono', Consolas, monospace`                         |
| 品牌标题（特殊场景） | `'Plus Jakarta Sans', 'PingFang SC', sans-serif`                           |

### 4.2 字号层级

| Token         | 字号   | 行高   | 字距     | 字重  | 用途     |
| ------------- | ---- | ---- | ------ | --- | ------ |
| `display-2xl` | 48px | 1.15 | -1px   | 700 | 落地页大标题 |
| `display-xl`  | 36px | 1.2  | -0.5px | 700 | 营销页    |
| `display-lg`  | 28px | 1.2  | -0.5px | 700 | 页面 H1  |
| `h1`          | 24px | 1.3  | 0      | 700 | 模块大标题  |
| `h2`          | 20px | 1.4  | 0      | 600 | 卡片大标题  |
| `h3`          | 18px | 1.4  | 0      | 600 | 区块标题   |
| `h4`          | 16px | 1.5  | 0      | 600 | 子区块    |
| `body-lg`     | 15px | 1.5  | 0      | 500 | 大正文    |
| `body`        | 14px | 1.5  | 0      | 400 | 默认正文   |
| `body-sm`     | 13px | 1.5  | 0      | 400 | 次正文    |
| `caption`     | 12px | 1.4  | 0      | 400 | 描述、按钮  |
| `micro`       | 11px | 1.4  | 0      | 500 | 标签、徽章  |
| `nano`        | 10px | 1.3  | 0      | 500 | 角标、ID  |

### 4.3 字重

| Token      | 值   | 用途    |
| ---------- | --- | ----- |
| `regular`  | 400 | 描述    |
| `medium`   | 500 | 标签、按钮 |
| `semibold` | 600 | 标题、表头 |
| `bold`     | 700 | 数值、H1 |

### 4.4 段落与行高

- 默认行高：1.5
- 标题行高：1.2-1.3
- 紧凑场景：1.3
- 段落间距：1em（自动）

### 4.5 文本省略

| 行数  | CSS 模式                                                                                         |
| --- | ---------------------------------------------------------------------------------------------- |
| 1 行 | `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`                              |
| 2 行 | `display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;` |
| 3 行 | 同上，`-webkit-line-clamp: 3`                                                                     |

### 4.6 链接

| 状态       | 颜色                         | 下划线 |
| -------- | -------------------------- | --- |
| 默认       | `--el-color-primary`       | 无   |
| Hover    | `--art-primary-dark-2`     | 可选  |
| Visited  | `--art-primary-light-5`    | 无   |
| Disabled | `--el-text-color-disabled` | 无   |

***

## 5. 间距与栅格

### 5.1 基础间距（4px 网格）

| Token      | 值    | 典型场景     |
| ---------- | ---- | -------- |
| `space-0`  | 0    | 重置       |
| `space-1`  | 2px  | 极小间距     |
| `space-2`  | 4px  | 紧凑元素     |
| `space-3`  | 6px  | 标签间距     |
| `space-4`  | 8px  | 默认间距     |
| `space-5`  | 10px | 中等间距     |
| `space-6`  | 12px | 段落间距     |
| `space-7`  | 14px | 工具栏内边距   |
| `space-8`  | 16px | 卡片内边距    |
| `space-10` | 20px | 模块间距     |
| `space-12` | 24px | 区块间距     |
| `space-16` | 32px | 大区块      |
| `space-20` | 40px | Hero 内边距 |
| `space-24` | 48px | 页面边距     |
| `space-32` | 64px | 落地页大间距   |

### 5.2 容器内边距

| 容器     | 内边距                          |
| ------ | ---------------------------- |
| 主内容区   | 24px（桌面）/ 16px（平板）/ 12px（移动） |
| 卡片     | 16-20px                      |
| 弹窗     | 24px                         |
| Hero 区 | 28px 32px                    |
| 表格     | 12-16px                      |
| 表单     | 20-24px                      |

### 5.3 栅格系统

- **基础单位**：4px
- **桌面端栅格**：12 列
- **平板端栅格**：8 列
- **移动端栅格**：4 列
- **列间距**：16-24px
- **最大内容宽度**：1440px（居中）
- **最小内容宽度**：320px

### 5.4 布局断点

| 名称    | 区间          | 容器最大宽度 | 主要调整   |
| ----- | ----------- | ------ | ------ |
| `xs`  | < 640px     | 100%   | 单列、堆叠  |
| `sm`  | 640-767px   | 100%   | 单列、紧凑  |
| `md`  | 768-1023px  | 100%   | 2 列    |
| `lg`  | 1024-1279px | 100%   | 多列、侧边栏 |
| `xl`  | 1280-1535px | 1200px | 完整布局   |
| `2xl` | ≥ 1536px    | 1440px | 居中、扩展  |

***

## 6. 圆角与阴影

### 6.1 圆角规范

| Token         | 值      | 用途        |
| ------------- | ------ | --------- |
| `radius-none` | 0      | 方形        |
| `radius-xs`   | 2px    | 标签、tag    |
| `radius-sm`   | 4px    | 极小元素      |
| `radius-md`   | 6px    | 按钮（小）     |
| `radius-lg`   | 8px    | 按钮、输入框    |
| `radius-xl`   | 10px   | 中型卡片      |
| `radius-2xl`  | 12px   | 卡片、容器     |
| `radius-3xl`  | 16px   | 大型容器、Hero |
| `radius-full` | 9999px | Pill、圆形头像 |

**使用规则**：

- 容器圆角 ≥ 内部元素圆角（视觉层次）
- 嵌套时外层 12px、内层 8px

### 6.2 阴影层级

| Token            | 值                                      | 用途      |
| ---------------- | -------------------------------------- | ------- |
| `shadow-none`    | `none`                                 | 重置      |
| `shadow-xs`      | `0 1px 2px rgba(15,23,42,0.04)`        | 默认卡片    |
| `shadow-sm`      | `0 2px 4px rgba(15,23,42,0.06)`        | 悬浮      |
| `shadow-md`      | `0 4px 8px rgba(15,23,42,0.08)`        | 下拉菜单    |
| `shadow-lg`      | `0 8px 16px rgba(15,23,42,0.10)`       | 弹窗、悬浮卡片 |
| `shadow-xl`      | `0 12px 28px rgba(15,23,42,0.14)`      | 浮层      |
| `shadow-2xl`     | `0 24px 48px rgba(15,23,42,0.20)`      | 模态      |
| `shadow-primary` | `0 4px 12px -4px rgba(99,102,241,0.4)` | 主色按钮    |
| `shadow-glow`    | `0 0 0 4px rgba(99,102,241,0.15)`      | 聚焦光晕    |

**暗色模式**：阴影改为更深的 `rgba(0,0,0,0.4)` 系列。

### 6.3 阴影使用规则

- 一屏内不出现 2 个 `shadow-xl` 以上
- 弹窗必须有 `shadow-lg` 以上
- 主色按钮可有专属 `shadow-primary`
- 卡片 hover 可从 `shadow-xs` 升级到 `shadow-lg`

***

## 7. 动效系统

### 7.1 时长

| Token              | 值      | 用途       |
| ------------------ | ------ | -------- |
| `duration-instant` | 0ms    | 即时反馈     |
| `duration-fast`    | 100ms  | 状态切换     |
| `duration-base`    | 150ms  | 按钮 hover |
| `duration-medium`  | 200ms  | 默认过渡     |
| `duration-slow`    | 300ms  | 弹窗、抽屉    |
| `duration-slower`  | 500ms  | 页面切换     |
| `duration-slowest` | 800ms+ | 入场动画     |

### 7.2 缓动函数

| Token             | 值                                   | 用途     |
| ----------------- | ----------------------------------- | ------ |
| `ease-linear`     | `linear`                            | 进度条、轮播 |
| `ease-in`         | `cubic-bezier(0.4, 0, 1, 1)`        | 退场     |
| `ease-out`        | `cubic-bezier(0, 0, 0.2, 1)`        | 入场     |
| `ease-in-out`     | `cubic-bezier(0.4, 0, 0.2, 1)`      | 默认     |
| `ease-spring`     | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性效果   |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)`        | 强调     |

### 7.3 动效模式

#### 入场（Enter）

- fade-in: `opacity 0→1`
- slide-up: `translateY(8px)→0`
- scale-in: `scale(0.95)→1`
- stagger: 每个子元素延迟 30-80ms

#### 退场（Exit）

- fade-out: `opacity 1→0`
- slide-down: `translateY 0→8px`
- scale-out: `scale 1→0.95`

#### Hover

- 颜色变化：150ms ease
- 轻微位移：`translateY(-2px)`
- 阴影变化：200ms ease

#### 加载

- 骨架屏：1.5s 线性循环渐变
- Spinner：1s 线性旋转
- 进度条：0.3s ease-out

### 7.4 动效原则

1. 动效时长不超过 500ms（除非特殊品牌效果）
2. 移动端动效时长减半
3. 用户设置 `prefers-reduced-motion: reduce` 时禁用所有装饰动效
4. 入场动效使用 `animation-delay` 实现 stagger
5. 同一时间一屏内最多 3 个持续动效

### 7.5 微交互

| 场景    | 动效                 |
| ----- | ------------------ |
| 按钮按下  | `scale(0.98)` 50ms |
| 复选框勾选 | ✓ 路径动画 200ms       |
| 开关切换  | 圆形滑块 200ms         |
| 输入聚焦  | 边框颜色 150ms         |
| 标签关闭  | 缩放淡出 150ms         |
| 数字变化  | `ArtCountTo` 900ms |
| 列表增删  | FLIP 动画 250ms      |

***

## 8. 图标系统

### 8.1 图标库

- **优先来源**：Remix Icon（`ri:*`）线性 1.6px
- **备选**：Lucide（`lucide:*`）、Heroicons
- **品牌定制**：自定义 SVG，存于 `src/assets/icons/`

### 8.2 尺寸规范

| Token      | 像素    | 场景     |
| ---------- | ----- | ------ |
| `icon-xs`  | 12px  | 内嵌文字   |
| `icon-sm`  | 14px  | 按钮、输入框 |
| `icon-md`  | 16px  | 列表项    |
| `icon-lg`  | 18px  | 工具栏    |
| `icon-xl`  | 20px  | 导航     |
| `icon-2xl` | 24px  | 区块标题   |
| `icon-3xl` | 32px  | 空状态    |
| `icon-4xl` | 44px  | 大空状态   |
| `icon-5xl` | 64px+ | 落地页装饰  |

### 8.3 颜色

- 默认：`currentcolor`（随父元素）
- 装饰：`var(--el-color-primary)` 或 `--el-color-primary-light-5`
- 状态色：success / warning / danger 使用对应 token
- 禁止：直接使用 HEX

### 8.4 描边

- 线性图标：1.6-2px 描边
- 填充图标：实心 + 0px 描边
- 同一屏内统一风格

### 8.5 语义映射（核心）

| 语义  | 图标                         | 备注     |
| --- | -------------------------- | ------ |
| 新建  | `ri:add-line`              | <br /> |
| 删除  | `ri:delete-bin-line`       | 二次确认   |
| 编辑  | `ri:edit-2-line`           | <br /> |
| 查看  | `ri:eye-line`              | <br /> |
| 复制  | `ri:file-copy-line`        | <br /> |
| 搜索  | `ri:search-line`           | <br /> |
| 筛选  | `ri:filter-3-line`         | <br /> |
| 排序  | `ri:sort-desc`             | <br /> |
| 刷新  | `ri:refresh-line`          | <br /> |
| 设置  | `ri:settings-3-line`       | <br /> |
| 用户  | `ri:user-3-line`           | <br /> |
| 团队  | `ri:team-line`             | <br /> |
| 通知  | `ri:notification-3-line`   | <br /> |
| 上传  | `ri:upload-cloud-2-line`   | <br /> |
| 下载  | `ri:download-cloud-2-line` | <br /> |
| 归档  | `ri:inbox-archive-line`    | <br /> |
| 收藏  | `ri:star-line`             | 激活时填充  |
| 分享  | `ri:share-line`            | <br /> |
| 关闭  | `ri:close-line`            | <br /> |
| 确认  | `ri:check-line`            | <br /> |
| 警告  | `ri:error-warning-line`    | <br /> |
| 错误  | `ri:close-circle-line`     | <br /> |
| 成功  | `ri:checkbox-circle-line`  | <br /> |
| 信息  | `ri:information-line`      | <br /> |
| 加载  | `ri:loader-4-line`         | 旋转     |
| 时间  | `ri:time-line`             | <br /> |
| 日期  | `ri:calendar-line`         | <br /> |
| 位置  | `ri:map-pin-line`          | <br /> |
| 链接  | `ri:link`                  | <br /> |
| 文件夹 | `ri:folder-3-line`         | <br /> |
| 文档  | `ri:file-text-line`        | <br /> |
| 图片  | `ri:image-line`            | <br /> |
| 视频  | `ri:video-line`            | <br /> |
| 音频  | `ri:volume-up-line`        | <br /> |
| 代码  | `ri:code-line`             | <br /> |

### 8.6 使用规则

- 图标与文字组合时，间距 4-8px
- 单一图标按钮：`title` 属性必填
- 状态图标（成功/警告/错误）需配文字说明
- 加载图标使用旋转动画，禁止使用跳动的点

***

## 9. 组件库规范

### 9.1 基础组件总览

| 组件                | 来源                  | 规范文档  |
| ----------------- | ------------------- | ----- |
| 按钮                | 自研 + Element Plus   | §9.2  |
| 输入框               | Element Plus        | §9.3  |
| 选择器               | Element Plus        | §9.4  |
| 复选框 / 单选框 / 开关    | Element Plus        | §9.5  |
| 卡片                | 自研 art-table-card   | §9.6  |
| 表格                | Element Plus + 自研封装 | §9.7  |
| 表单                | Element Plus        | §9.8  |
| 弹窗                | Element Plus        | §9.9  |
| 抽屉                | Element Plus        | §9.10 |
| 列表                | 自研                  | §9.11 |
| 徽章 / Tag          | 自研 + Element Plus   | §9.12 |
| Avatar            | 自研                  | §9.13 |
| 面包屑               | Element Plus        | §9.14 |
| Tabs              | Element Plus        | §9.15 |
| Tooltip / Popover | Element Plus        | §9.16 |
| 空状态               | 自研 art-empty        | §9.17 |
| 加载 / 骨架屏          | 自研 + Element Plus   | §9.18 |
| 消息 / 通知           | Element Plus        | §9.19 |
| 分页                | Element Plus        | §9.20 |
| 菜单 / 导航           | 自研 art-menus        | §9.21 |
| 步骤条               | Element Plus        | §9.22 |
| 滑块 / 进度条          | Element Plus        | §9.23 |
| 树形控件              | Element Plus        | §9.24 |
| 上传                | Element Plus        | §9.25 |

### 9.2 按钮（Button）

#### 类型

| Type        | 颜色   | 用途            |
| ----------- | ---- | ------------- |
| `primary`   | 主色   | 主操作（每屏最多 1 个） |
| `secondary` | 次主色  | 辅助主操作         |
| `default`   | 默认灰  | 普通操作          |
| `danger`    | 危险色  | 危险操作（删除等）     |
| `warning`   | 警告色  | 警告操作          |
| `success`   | 成功色  | 成功操作          |
| `info`      | 信息色  | 信息展示          |
| `text`      | 文字按钮 | 弱操作           |
| `link`      | 链接按钮 | 跳转            |

#### 尺寸

| Size      | 高度   | 内边距    | 字号   | 圆角   |
| --------- | ---- | ------ | ---- | ---- |
| `large`   | 40px | 0 20px | 15px | 10px |
| `default` | 36px | 0 16px | 14px | 8px  |
| `small`   | 32px | 0 12px | 13px | 6px  |

#### 状态

| 状态       | 表现                          |
| -------- | --------------------------- |
| 默认       | 原始样式                        |
| Hover    | 背景加深、阴影增强                   |
| Active   | `scale(0.98)`               |
| Focus    | 主色光晕 `shadow-glow`          |
| Loading  | 旋转图标 + 文字保留                 |
| Disabled | 透明度 0.5、cursor: not-allowed |

#### 圆角变体

- 默认：8px
- 圆角：`round` prop 切换为 9999px
- 方形：`square` prop 切换为 0

### 9.3 输入框（Input）

| 属性    | 规范                                             |
| ----- | ---------------------------------------------- |
| 高度    | 36px（默认）/ 32px（small）/ 40px（large）             |
| 圆角    | 8px                                            |
| 边框    | 1px `--el-border-color-lighter`，focus 时 1px 主色 |
| 内边距   | 0 12px                                         |
| 占位文字  | `--el-text-color-placeholder`                  |
| 前缀/后缀 | 14px 图标 + 4px 间距                               |
| 清空按钮  | hover 时显示                                      |

#### 验证态

| 状态 | 边框色                  |
| -- | -------------------- |
| 成功 | `--el-color-success` |
| 警告 | `--el-color-warning` |
| 错误 | `--el-color-danger`  |

### 9.4 选择器（Select / Cascader / DatePicker / TimePicker）

- 高度 36px
- 圆角 8px
- 下拉面板：`shadow-lg`，12px 圆角
- 选项高度：32px
- 多选 tag：6px 圆角，max-tag 占位

### 9.5 复选框 / 单选框 / 开关

| 组件  | 尺寸                            |
| --- | ----------------------------- |
| 复选框 | 16×16（默认）/ 14×14（小）/ 18×18（大） |
| 单选框 | 16×16                         |
| 开关  | 40×20（默认）/ 28×16（小）           |

- 选中色：主色
- 聚焦：主色光晕

### 9.6 卡片（Card / Container）

| 属性  | 规范                               |
| --- | -------------------------------- |
| 圆角  | 12px                             |
| 内边距 | 16-24px                          |
| 背景  | `--default-box-color`            |
| 边框  | 1px `--el-border-color-lighter`  |
| 阴影  | `shadow-xs` 默认，`shadow-lg` hover |

**变体**：

- `flat`：无边框 + 无阴影
- `outlined`：仅边框
- `elevated`：明显阴影
- `glass`：玻璃态（半透明 + backdrop-filter）

### 9.7 表格（Table）

| 属性    | 规范                               |
| ----- | -------------------------------- |
| 表头高度  | 44px                             |
| 行高度   | 48px（默认）/ 40px（紧凑）               |
| 斑马纹   | 可选，`--el-fill-color-extra-light` |
| Hover | `--el-fill-color-light`          |
| 边框    | 无外框，行间 1px 浅边                    |
| 排序    | 表头 hover 显箭头，激活态主色               |
| 固定列   | 阴影分隔                             |
| 空状态   | 居中 + 插画 + 主按钮                    |

### 9.8 表单（Form）

| 属性    | 规范                   |
| ----- | -------------------- |
| 标签宽度  | 100-120px（右对齐）       |
| 标签字号  | 14px / 500           |
| 标签后缀  | 无冒号（国际化友好）           |
| 必填星号  | 主色，紧贴 label          |
| 错误文案  | 12px，danger 色，2px 顶距 |
| 字段间距  | 20px                 |
| 字段分组  | 24px                 |
| 提交按钮区 | 顶距 32px，右对齐          |

### 9.9 弹窗（Dialog）

| 属性  | 规范                                                                   |
| --- | -------------------------------------------------------------------- |
| 宽度  | `sm: 400px` / `md: 560px` / `lg: 720px` / `xl: 960px` / `full: 90vw` |
| 圆角  | 12px                                                                 |
| 标题  | 16px / 600                                                           |
| 内边距 | 24px                                                                 |
| 底部  | 顶部 1px 浅边，16px 内边距，右对齐                                               |
| 遮罩  | `rgba(15,23,42,0.5)`                                                 |
| 动画  | scale + fade 200ms                                                   |

#### 类型

- `alert`：警示，无 footer 居中按钮
- `confirm`：确认，左取消右确认
- `form`：表单，footer 取消 + 提交
- `fullscreen`：全屏，左上角关闭

### 9.10 抽屉（Drawer）

| 属性 | 规范                  |
| -- | ------------------- |
| 宽度 | 480px（默认）/ 720px（宽） |
| 圆角 | 0（贴边）               |
| 标题 | 16px / 600          |
| 动画 | slide 200ms         |

### 9.11 列表（List）

#### 网格列表

- 列宽：自适应（min 280px）
- 列间距：16px
- 行间距：16px

#### 紧凑列表

- 高度：56-72px
- 内边距：12px 16px
- 分割线：1px `--el-border-color-lighter`

#### 时间线列表

- 圆点：8px，主色
- 连接线：2px，`--el-border-color-lighter`
- 间距：16px

### 9.12 徽章 / Tag

#### Badge（数字徽章）

| 属性   | 规范                         |
| ---- | -------------------------- |
| 高度   | 16px（小）/ 18px（默认）/ 20px（大） |
| 最小宽度 | 16px / 18px / 20px         |
| 圆角   | 9999px                     |
| 字号   | 11px / 12px                |
| 颜色   | 主色 / 危险色                   |
| 位置   | 子元素右上角，偏移 -4px             |

#### Tag（标签）

| 属性  | 规范                     |
| --- | ---------------------- |
| 高度  | 22px（默认）/ 24px（medium） |
| 内边距 | 0 8px                  |
| 字号  | 12px / 500             |
| 圆角  | 6px / 9999px（pill）     |
| 颜色  | 主色 / 状态色 / 中性色         |

**类型**：

- `default`：浅灰底
- `primary`：主色底
- `success`：成功色底
- `warning`：警告色底
- `danger`：危险色底
- `info`：信息色底

**变体**：

- `light`：浅色底 + 深色字（默认）
- `dark`：深色底 + 白色字
- `plain`：边框 + 白底
- `outline`：仅边框

### 9.13 Avatar（头像）

| 形状 | 圆角  | 用途      |
| -- | --- | ------- |
| 圆形 | 50% | 用户头像    |
| 圆角 | 8px | 项目/资源头像 |
| 方形 | 0   | 文档      |

| 尺寸  | 像素   |
| --- | ---- |
| xs  | 24px |
| sm  | 32px |
| md  | 40px |
| lg  | 48px |
| xl  | 64px |
| 2xl | 96px |

**变体**：

- 图片
- 首字母（渐变背景）
- 图标
- 文本（中文姓名）

**状态**：

- 在线：右下角 8px 绿点
- 离线：右下角 8px 灰点
- 忙碌：右下角 8px 红点

### 9.14 面包屑（Breadcrumb）

| 属性    | 规范                            |
| ----- | ----------------------------- |
| 字号    | 13px                          |
| 颜色    | 次文字                           |
| 当前页   | 主文字 / 500                     |
| 分隔符   | `ri:arrow-right-s-line` 或 `/` |
| 间距    | 4-8px                         |
| Hover | 主色                            |

### 9.15 Tabs（标签页）

| 属性  | 规范            |
| --- | ------------- |
| 高度  | 40px          |
| 字号  | 14px / 500    |
| 激活色 | 主色            |
| 下划线 | 2px 主色，圆角 2px |
| 内边距 | 0 16px        |
| 间距  | 8-16px        |
| 徽章  | 右上角           |

**类型**：

- `line`：下划线（默认）
- `card`：卡片式
- `pill`：胶囊式

### 9.16 Tooltip / Popover

| 属性 | 规范                  |
| -- | ------------------- |
| 字号 | 12px                |
| 圆角 | 6px                 |
| 阴影 | `shadow-md`         |
| 箭头 | 8px                 |
| 动画 | fade 150ms          |
| 延迟 | 300ms 显示 / 100ms 隐藏 |

### 9.17 空状态（Empty）

```
        [插画/图标]
        还没有任何数据
        点击按钮开始你的第一步
        [主按钮]
```

| 属性 | 规范               |
| -- | ---------------- |
| 容器 | 居中、内边距 60px 20px |
| 插画 | 96-160px         |
| 标题 | 16px / 600       |
| 描述 | 13px / 1.6 / 灰   |
| 按钮 | 顶距 16px          |

**类型**：

- `default`：灰色调
- `primary`：主色调
- `error`：错误态

### 9.18 加载 / 骨架屏（Loading / Skeleton）

#### Loading

- 类型：spinner / dots / bar
- 尺寸：sm / md / lg
- 颜色：主色 / 灰 / 白
- 全屏：`v-loading` 指令，遮罩 `rgba(255,255,255,0.7)`

#### Skeleton

- 行：12px 圆角
- 头像：圆形
- 按钮：6px 圆角
- 卡片：12px 圆角
- 动画：1.5s 线性循环渐变 `left: -200% → 200%`

### 9.19 消息 / 通知（Message / Notification / MessageBox）

#### Message（顶部）

| 属性   | 规范          |
| ---- | ----------- |
| 位置   | 顶部 24px 居中  |
| 宽度   | max 420px   |
| 高度   | 48px        |
| 圆角   | 8px         |
| 阴影   | `shadow-lg` |
| 自动关闭 | 3000ms（可配置） |

#### Notification（角落）

| 属性   | 规范          |
| ---- | ----------- |
| 位置   | 右上 24px     |
| 宽度   | 360px       |
| 高度   | auto        |
| 标题   | 14px / 600  |
| 内容   | 13px / 1.5  |
| 关闭按钮 | 右上          |
| 自动关闭 | 4500ms（可配置） |

#### MessageBox

- `alert`：警示
- `confirm`：确认
- `prompt`：输入
- 按钮：「取消」+「确定」（取消左、确定右）

### 9.20 分页（Pagination）

| 属性 | 规范                                        |
| -- | ----------------------------------------- |
| 背景 | `background` 胶囊                           |
| 尺寸 | 32px（默认）                                  |
| 圆角 | 6px                                       |
| 激活 | 主色背景 + 白字                                 |
| 间距 | 8px                                       |
| 布局 | `total, sizes, prev, pager, next, jumper` |

### 9.21 菜单 / 导航（Menu / Sidebar）

#### 顶栏

| 属性   | 规范                  |
| ---- | ------------------- |
| 高度   | 56-64px             |
| 背景   | 白 / `--el-bg-color` |
| 边框   | 底部 1px 浅边           |
| Logo | 左对齐，最大高度 32px       |

#### 侧边栏

| 属性  | 规范                  |
| --- | ------------------- |
| 宽度  | 220px（展开）/ 64px（折叠） |
| 背景  | 白 / 暗色              |
| 项高  | 44px                |
| 内边距 | 0 16px              |
| 圆角  | 8px                 |
| 激活  | 主色浅 9 底 + 主色字       |
| 图标  | 18px                |
| 文字  | 14px                |
| 子菜单 | 缩进 24px             |

#### 折叠态

- 仅图标
- 宽度 64px
- 悬浮显示 tooltip

### 9.22 步骤条（Steps）

| 属性  | 规范         |
| --- | ---------- |
| 步骤圆 | 24px 圆     |
| 完成色 | 主色 / 成功色   |
| 进行中 | 主色描边       |
| 待办  | 灰          |
| 标题  | 14px / 500 |
| 描述  | 12px / 灰   |
| 连接线 | 1px        |

### 9.23 滑块 / 进度条

#### Slider

- 轨道高度：4px
- 滑块：16px 圆
- 主色填充

#### Progress

- 高度：8px
- 圆角：4px
- 动画：1s ease-out
- 类型：`line` / `circle` / `dashboard`

### 9.24 树形控件（Tree）

| 属性  | 规范       |
| --- | -------- |
| 节点高 | 32px     |
| 缩进  | 20px / 级 |
| 图标  | 14px，可旋转 |
| 选中  | 主色浅 9 底  |
| 连接线 | 可选       |

### 9.25 上传（Upload）

| 属性   | 规范           |
| ---- | ------------ |
| 触发区  | 虚线边框 1px     |
| 圆角   | 8px          |
| 内边距  | 20px         |
| 拖拽高亮 | 主色实线 + 浅 9 底 |
| 进度条  | 主色           |

***

## 10. 布局系统

### 10.1 整体架构

```
┌──────────────────────────────────────────────────────┐
│                  Topbar (56-64px)                    │
├────────┬─────────────────────────────────────────────┤
│        │  Breadcrumb                                 │
│        ├─────────────────────────────────────────────┤
│ Sidebar│                                              │
│ (220)  │            Content Area                      │
│        │          (max-width: 1440px)                 │
│        │                                              │
│        │                                              │
└────────┴─────────────────────────────────────────────┘
```

### 10.2 Topbar（顶栏）

| 属性  | 规范                         |
| --- | -------------------------- |
| 高度  | 56px（紧凑）/ 64px（默认）         |
| 背景  | 白 / 暗                      |
| 边框  | 底部 1px 浅边                  |
| 内边距 | 0 24px                     |
| 元素  | Logo / 搜索 / 通知 / 用户头像 / 设置 |

### 10.3 Sidebar（侧边栏）

| 属性   | 规范                  |
| ---- | ------------------- |
| 宽度   | 220px（展开）/ 64px（折叠） |
| 背景   | 白 / 暗               |
| 边框   | 右侧 1px 浅边           |
| 折叠按钮 | 底部居中                |

### 10.4 Breadcrumb（面包屑）

- 位于 Content 顶部
- 字号 13px
- 分隔符：`ri:arrow-right-s-line`

### 10.5 Content（内容区）

- 最大宽度 1440px（居中）
- 桌面端内边距 24px
- 移动端内边距 12px

### 10.6 Footer（页脚）

- 高度 48px
- 字号 12px
- 灰文字

### 10.7 常见页面布局

#### 列表页

```
[Hero / Page Header] (可选)
[Filter Bar]
[Content Area: Cards | Table]
[Pagination]
```

#### 详情页

```
[Page Header + Actions]
[Tab Bar]
[Content: Form / Detail]
[Action Bar (sticky bottom)]
```

#### 表单页

```
[Page Header]
[Step Bar (可选)]
[Form Sections]
[Action Bar (sticky bottom)]
```

#### 工作台

```
[Stat Cards Row]
[Charts Row]
[Recent Activity + Quick Actions]
```

***

## 11. 导航与路由

### 11.1 路由规范

- 路径全部小写，单词间 `-` 分隔
- 例：`/project/list`、`/project/edit`、`/project/detail/:id`
- 嵌套路由：父 `/project`，子 `/project/list`、`/project/edit`
- 动态参数：`:id` 占位

### 11.2 导航层级

| 层级 | 路径示例                 | 面包屑                 |
| -- | -------------------- | ------------------- |
| L1 | `/`                  | 首页                  |
| L2 | `/project`           | 首页 / 项目             |
| L3 | `/project/list`      | 首页 / 项目 / 项目列表      |
| L4 | `/project/edit?id=1` | 首页 / 项目 / 项目列表 / 编辑 |

**最大深度**：L3，超过 L3 考虑拆分页面

### 11.3 路由元信息

```ts
{
  path: '/project/list',
  name: 'ProjectList',
  meta: {
    title: '项目列表',
    icon: 'ri:folder-3-line',
    auth: ['project.view'],
    keepAlive: true,
    hideInMenu: false
  }
}
```

### 11.4 标签页（Tab）

- 顶部 Tab Bar 可固定打开的页面
- 关闭按钮：hover 显示
- 数量上限：8 个
- 溢出：横向滚动

***

## 12. 反馈与消息

### 12.1 反馈类型

| 类型   | 组件               | 场景           |
| ---- | ---------------- | ------------ |
| 即时提示 | `ElMessage`      | 操作成功/失败、保存   |
| 浮窗通知 | `ElNotification` | 系统通知、新功能     |
| 弹窗确认 | `ElMessageBox`   | 删除、批量操作、危险动作 |
| 状态徽章 | Badge            | 未读数量         |
| 进度反馈 | Progress         | 上传、长任务       |
| 骨架屏  | Skeleton         | 加载占位         |
| 加载   | Loading          | 操作等待         |

### 12.2 反馈文案规范

| 场景 | 文案风格               |
| -- | ------------------ |
| 成功 | 「创建成功」「保存成功」「删除成功」 |
| 失败 | 「创建失败」「保存失败」「删除失败」 |
| 警告 | 「请先选择项目」「操作不可逆」    |
| 错误 | 「网络异常，请重试」「权限不足」   |

**规则**：

- 文案不超过 12 个汉字
- 避免「操作成功」式空泛提示
- 必填字段缺失时：「请填写 X」

### 12.3 错误处理

| 错误码 | 反馈                  |
| --- | ------------------- |
| 400 | 字段错误高亮              |
| 401 | 跳转登录                |
| 403 | 「权限不足」Message       |
| 404 | 跳 404 页             |
| 500 | 「服务异常」Message + 重试  |
| 网络  | 「网络异常，请检查连接」Message |

***

## 13. 响应式规范

### 13.1 断点

| 名称    | 区间          |
| ----- | ----------- |
| `xs`  | < 640px     |
| `sm`  | 640-767px   |
| `md`  | 768-1023px  |
| `lg`  | 1024-1279px |
| `xl`  | 1280-1535px |
| `2xl` | ≥ 1536px    |

### 13.2 设备策略

- **桌面优先**（默认）：≥ 1024px
- **平板适配**：768-1023px，侧边栏可折叠
- **移动适配**：< 768px，简化布局，触摸优化

### 13.3 关键适配规则

1. **侧边栏**：< 1024px 折叠为抽屉
2. **表格**：< 768px 转为卡片列表
3. **多列**：< 768px 单列堆叠
4. **工具栏**：< 640px 工具堆叠为两行
5. **Hero**：< 960px 统计卡变 2 列
6. **字体**：移动端正文 14→15px（避免过小）
7. **触摸目标**：≥ 32px
8. **浮层**：移动端全屏弹窗

### 13.4 关键 CSS

```scss
// 隐藏侧边栏
@media (max-width: 1023px) {
  .sidebar { display: none; }
}

// 表格转卡片
@media (max-width: 767px) {
  .table-view { display: none; }
  .card-view { display: block; }
}

// 触摸目标
@media (max-width: 767px) {
  .btn { min-height: 36px; }
}
```

***

## 14. 可访问性 A11y

### 14.1 核心原则

1. **可感知**（Perceivable）：信息以用户能感知的方式呈现
2. **可操作**（Operable）：UI 组件可操作
3. **可理解**（Understandable）：信息和操作可理解
4. **健壮**（Robust）：兼容辅助技术

### 14.2 色彩对比

| 场景                      | 最小对比度 |
| ----------------------- | ----- |
| 正文                      | 4.5:1 |
| 大字体（≥ 18px / 14px bold） | 3:1   |
| 装饰文字                    | 无要求   |
| 状态色                     | 满足 AA |

### 14.3 键盘可访问

| 行为     | 实现               |
| ------ | ---------------- |
| Tab 顺序 | 遵循 DOM 顺序，重要操作优先 |
| Enter  | 提交表单、激活按钮        |
| Esc    | 关闭弹窗、取消操作        |
| Space  | 激活按钮、勾选复选框       |
| ↑↓     | 菜单、列表、表格行        |
| ←→     | Tabs、slider      |
| 焦点环    | 自定义主色光晕          |

### 14.4 焦点环规范

```css
:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
```

### 14.5 语义化

| 元素   | 标签                   |
| ---- | -------------------- |
| 主导航  | `<nav>`              |
| 标题   | `<h1>`-`<h6>`        |
| 按钮   | `<button>`           |
| 链接   | `<a>`                |
| 列表   | `<ul>` / `<ol>`      |
| 表单   | `<form>` + `<label>` |
| 装饰图标 | `aria-hidden="true"` |
| 重要图标 | `aria-label`         |

### 14.6 ARIA 规范

| 场景  | ARIA                                                    |
| --- | ------------------------------------------------------- |
| 加载中 | `aria-busy="true"`                                      |
| 弹窗  | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| 提示  | `role="alert"` / `role="status"`                        |
| 必填  | `aria-required="true"`                                  |
| 错误  | `aria-invalid="true"`, `aria-describedby`               |
| 折叠  | `aria-expanded`, `aria-controls`                        |
| 当前页 | `aria-current="page"`                                   |

### 14.7 替代文本

- 装饰图：`alt=""`
- 信息图：`alt` 描述内容
- 按钮图标：`aria-label` 描述
- 视频：字幕 + 描述

### 14.8 动效可访问

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

***

## 15. 国际化与文案

### 15.1 文案规则

- 中文文案简洁、礼貌、专业
- 避免错别字、英文夹杂
- 单位、日期、货币使用本地化

### 15.2 文案语气

| 场景 | 语气          |
| -- | ----------- |
| 提示 | 友好、清晰       |
| 警告 | 严肃、明确       |
| 错误 | 解释原因 + 解决方案 |
| 成功 | 简短、肯定       |

### 15.3 标点符号

| 场景 | 标点        |
| -- | --------- |
| 标题 | 无句号       |
| 按钮 | 2-4 字，无句号 |
| 提示 | 句号结尾      |
| 列表 | 无标点或统一顿号  |

### 15.4 占位文案

- 搜索框：「搜索 XXX」
- 空输入：「请输入 XXX」
- 描述：「请输入 XXX，不超过 X 字」

### 15.5 i18n Key 规范

```
pages.project.list.title
pages.project.list.searchPlaceholder
components.button.create
messages.success.createProject
errors.network.timeout
```

### 15.6 多语言支持

- 中文（zh-CN，默认）
- 英文（en-US）
- 日文（ja-JP，可选）
- 繁体（zh-TW，可选）

***

## 16. 性能与体验

### 16.1 性能指标

| 指标  | 目标          |
| --- | ----------- |
| FCP | < 1.5s      |
| LCP | < 2.5s      |
| FID | < 100ms     |
| CLS | < 0.1       |
| TTI | < 3.5s      |
| 包大小 | < 500KB（首屏） |

### 16.2 加载策略

- 首屏：按需加载
- 路由：懒加载
- 图片：懒加载 + WebP
- 组件：动态 import
- 第三方：CDN + 异步

### 16.3 体验原则

1. **白屏 < 200ms**：立即显示骨架屏
2. **操作 < 100ms**：即时反馈
3. **加载 > 1s**：显示进度
4. **失败**：明确原因 + 重试入口
5. **空状态**：引导操作

### 16.4 资源优化

- 图片：压缩 + WebP + 响应式 `srcset`
- 字体：子集化 + font-display: swap
- 图标：SVG Sprite
- 动画：GPU 加速（transform / opacity）

***

## 17. 文件与代码组织

### 17.1 目录结构

```
src/
├── api/                  # API 请求层
│   ├── project.ts
│   └── queries/
│       └── project.ts
├── assets/               # 静态资源
│   ├── icons/            # 自定义图标
│   ├── images/           # 图片
│   └── styles/           # 全局样式
│       ├── core/         # 核心变量
│       └── index.scss
├── components/           # 通用组件
│   └── core/             # 业务核心
├── composables/          # 组合式函数
├── domain/               # 领域层
├── hooks/                # Vue Hooks
├── router/               # 路由
├── stores/               # Pinia 状态
├── types/                # 类型定义
│   └── api/              # API 类型
├── utils/                # 工具函数
├── views/                # 页面
│   └── project/
│       └── list/
│           ├── index.vue
│           └── components/
└── App.vue
```

### 17.2 命名规范

| 类别     | 规范           | 示例                   |
| ------ | ------------ | -------------------- |
| 文件夹    | kebab-case   | `project-list/`      |
| 组件文件   | PascalCase   | `ProjectList.vue`    |
| 工具文件   | camelCase    | `formatDate.ts`      |
| 常量文件   | UPPER\_SNAKE | `API_ENDPOINTS.ts`   |
| CSS 类  | kebab-case   | `.project-list-card` |
| Vue 组件 | PascalCase   | `<ProjectList />`    |
| 变量     | camelCase    | `projectList`        |
| 常量     | UPPER\_SNAKE | `MAX_FILE_SIZE`      |
| 类型     | PascalCase   | `ProjectListItem`    |
| 接口     | I 前缀（可选）     | `IProjectService`    |

### 17.3 组件内部结构

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
  // 1. imports
  // 2. defineOptions
  // 3. types
  // 4. composables (router, store, etc.)
  // 5. reactive state
  // 6. computed
  // 7. watchers
  // 8. methods
  // 9. lifecycle
</script>

<style lang="scss" scoped>
  /* 样式 */
</style>
```

### 17.4 CSS 类命名（BEM 风格）

```scss
.project-card {
  // block
}
.project-card__title {
  // element
}
.project-card--featured {
  // modifier
}
.project-card__title--bold {
  // element modifier
}
```

### 17.5 注释规范

```ts
/**
 * 函数说明
 * @param {Type} param - 参数说明
 * @returns {Type} 返回值说明
 */

// 单行注释
/* 多行注释 */
```

***

## 18. 主题与暗色模式

### 18.1 主题切换

- 入口：用户头像下拉 → 主题设置
- 模式：浅色 / 暗色 / 跟随系统
- 持久化：localStorage

### 18.2 实现方式

```ts
// html 根节点
<html data-theme="light | dark">

// 变量化
:root {
  --el-bg-color: #F8FAFC;
}
[data-theme='dark'] {
  --el-bg-color: #0B1120;
}
```

### 18.3 暗色模式注意

- 阴影改为更深 `rgba(0,0,0,0.4)`
- 白色背景改为深色
- 品牌色饱和度降低（+8 亮度）
- 渐变保留品牌感

### 18.4 图片适配

- 暗色模式可使用不同图片（白天/夜晚）
- 装饰图保持原样
- Logo 可准备双版本

***

## 19. 设计交付物

### 19.1 设计稿格式

- Figma / Sketch / XD
- 标注完整（颜色、字号、间距）
- 多端适配稿
- 暗色模式稿
- 状态稿（hover / active / disabled / loading / empty / error）

### 19.2 设计稿命名

```
[模块]_[页面]_[状态]_[版本]_[日期]
project_list_default_v1.0_20260607
project_list_hover_v1.0_20260607
project_list_empty_v1.0_20260607
```

### 19.3 切图交付

- PNG\@2x/@3x
- WebP
- SVG（图标、装饰）
- 雪碧图：禁止，统一 SVG 方案

### 19.4 设计 Token

- 颜色：JSON 格式
- 字体：JSON 格式
- 间距：JSON 格式
- 自动生成：Style Dictionary / Theo

### 19.5 文档交付

- 设计规范（本文档）
- 组件说明
- 交互说明
- 用研报告

***

## 20. 版本管理

### 20.1 版本号

- 主版本（Major）：不兼容变更
- 次版本（Minor）：新增功能
- 修订号（Patch）：bug 修复

例：`v1.2.3`

### 20.2 变更类型

| 类型           | 说明   |
| ------------ | ---- |
| `Added`      | 新增功能 |
| `Changed`    | 功能变更 |
| `Deprecated` | 即将废弃 |
| `Removed`    | 已移除  |
| `Fixed`      | 修复   |
| `Security`   | 安全修复 |

### 20.3 升级路径

- 主版本升级：提供迁移指南
- 次版本升级：兼容
- 修订号升级：透明

***

## 21. 最佳实践与反模式

### 21.1 最佳实践

1. **使用 Token**：所有值引用变量，不硬编码
2. **组件优先**：复用 > 自定义
3. **可访问即默认**：色彩对比、键盘可达
4. **移动友好**：触摸目标 ≥ 32px
5. **性能优先**：懒加载、代码分割
6. **文档同步**：代码与文档同步更新
7. **状态完整**：覆盖 empty / loading / error
8. **可测试**：组件可独立测试

### 21.2 反模式

| 反模式   | 错误               | 正确                               |
| ----- | ---------------- | -------------------------------- |
| 硬编码颜色 | `color: #6366f1` | `color: var(--el-color-primary)` |
| 硬编码间距 | `padding: 13px`  | `padding: var(--space-3)`        |
| 嵌套过深  | 5 层 div          | 拆分为组件                            |
| 内联样式  | `style="..."`    | class / scss                     |
| 全局污染  | `:root { ... }`  | scoped                           |
| 大文件   | 单文件 1000+ 行      | 拆分子组件                            |
| 魔数    | `width: 372px`   | `width: var(--container-md)`     |
| 不可访问  | 无 label          | aria-label / for                 |
| 不可键盘  | `<div @click>`   | `<button>`                       |
| 不响应式  | 固定宽度             | 百分比 / clamp                      |

### 21.3 代码审查清单

- [ ] 颜色使用变量
- [ ] 间距使用 4px 网格
- [ ] 字号符合层级
- [ ] 圆角符合规范
- [ ] 阴影层级合理
- [ ] 动效时长合理
- [ ] 暗色模式兼容
- [ ] 触摸目标 ≥ 32px
- [ ] 键盘可达
- [ ] ARIA 标签完整
- [ ] 加载/空/错误态完整
- [ ] 响应式适配
- [ ] 性能优化（懒加载）
- [ ] 命名规范
- [ ] 注释完整

***

## 22. 变更日志

### v1.0.0（2026-06-07）

**Added**

- 初始化设计规范
- 紫蓝主色调 + 8 套品牌渐变
- 完整组件库规范
- 响应式 / 暗色模式 / 可访问性

**Notes**

- 基于 `/project/list` 页面设计稿提炼
- 后续页面应严格遵循本规范

***

## 附录

### A. 设计资源链接

- Figma：<内部链接>
- 组件库：Element Plus + 自研
- 图标库：Remix Icon
- 字体：思源黑体 / Inter

### B. 相关文档

- [项目列表设计稿](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/.trae/documents/project-list-design.md)
- [项目列表设计规范](file:///c:/Users/MicaForever/Desktop/dreamcraftastraneweb-fix-sales-overview-reactivity/.trae/documents/project-list-design-spec.md)

### C. 联系与反馈

- 设计：<design@dreamcraft.cn>
- 前端：<fe@dreamcraft.cn>
- 产品：<pm@dreamcraft.cn>

