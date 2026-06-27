---
name: ghostcut-ui-redesign
description: GhostCut 前端 UI 改造 — 从终端开发者风格改为现代产品风格，匹配原型图设计
metadata:
  type: project
---

# GhostCut UI 改造设计文档

## 1. 概述

将 GhostCut 的 UI 从 VS Code 终端/开发者风格全面改造为现代简洁的产品风格，严格参照原型图 `gemini-code-1782048208336.html` 的设计语言。同时保留暗色模式（重新适配）、主题切换、全部现有功能。

## 2. 改动范围

### 2.1 删除功能：终端彩蛋（已完成）

- **原因**：用户明确要求移除
- **涉及文件**：
  - `index.js` — 移除 3 条终端 API 路由 + 对应 import
  - `src/handler.js` — 移除 `checkTerminalAuth`、`terminalAuth`、`terminalStats`、`terminalCleanup` 四个函数 + 对应 import
  - `src/html.js` — 移除终端 CSS (~100行)、`TERMINAL_OVERLAY` 常量、`TERMINAL_SCRIPT` 常量、homePage() 中的引用
  - `src/lib.js` — 移除死代码 `signToken`、`verifyToken`（终端独用，已无引用）

### 2.2 改造 UI：全部页面（已实现代码，待审批）

#### 2.2.1 首页 `homePage()`

| 方面 | 旧设计 | 新设计 |
|------|--------|--------|
| 整体布局 | VS Code 窗口框架（红/黄/绿圆点标题栏 + 左右分栏 + 底部状态栏） | 居中白色圆角卡片（border-radius: 20px）, 无窗口框架 |
| 背景 | 纯白/灰 | `#F4F7F9` + 微妙点阵背景 |
| 品牌 | "~/share" 标题 | "GhostCut" + tagline "临时 · 匿名 · 安全传递" |
| 字体 | Sarasa Mono SC / SF Mono (等宽) | Inter + 系统 sans-serif |
| 主色 | 黑/灰/绿 | `#2563EB` 蓝色系 |
| Tab 标签 | `text.log` / `file.bin` | `分享文本` / `分享文件` |
| 有效期组件 | 药丸 pills（30m/1h/6h/12h 点击选择） | `<select>` 下拉菜单（30分钟/1小时/6小时/12小时） |
| 密码标签 | `--pass` | `访问密码（可选）` |
| 按钮 | 黑色小字 `CREATE` | 蓝色全宽圆角 `生成分享链接` |
| 结果区 | 绿色框 + copy 小按钮 | 绿色勾 + 蓝色链接框 + 图标式 copy 按钮 + ⚠ 温馨提示 |
| 状态栏 | 底栏显示 origin / dark-light / v1.0.0 / UTF-8 | 底部纤细 footer：v1.0.0 + ☀/☾ 主题切换 |
| 侧栏 | 右侧 about 面板（技术参数） | 已移除 |

#### 2.2.2 密码页 `passwordPromptPage()`

| 方面 | 旧设计 | 新设计 |
|------|--------|--------|
| 风格 | 终端 palette 卡片 + `~/.lock` 水印 | 白卡 + 锁图标 + `此内容已加密` 标题 |
| 输入 | `❯` prompt + input | 密码输入框 + `解密查看` 按钮 |
| 错误提示 | 行内错误文字 | 红色 `.pass-error` 提示 |
| 功能逻辑 | 不变 | 不变 |

#### 2.2.3 内容展示页 `renderShareContent()`

| 方面 | 旧设计 | 新设计 |
|------|--------|--------|
| 布局 | 窗口框架 + 内部 content | GhostCut 品牌头 + 白色卡片 |
| 文字展示 | 等宽 content-box | 等宽 content-box（保持） |
| 文件列表 | 等宽文件项 + 箭头下载 | 圆角文件卡片 + 蓝色 `下载` 按钮 |
| 倒计时 | warning-box 倒计时 | warning-box 倒计时（保持） |
| 主题切换 | statusbar 中的 dark-light | footer 中的 ☀/☾ |

#### 2.2.4 错误页 `errorPage()`

- 去掉窗口框架，改为白卡 + 红色错误图标 + 简洁信息 + `← 返回首页` 链接

### 2.3 颜色系统

**浅色模式**（严格按原型图）：
```
--bg-body: #F4F7F9
--bg-card: #FFFFFF
--primary: #2563EB
--primary-hover: #1D4ED8
--text-primary: #1F2937
--text-secondary: #6B7280
--border-color: #E5E7EB
```

**暗色模式**（适配版）：
```
--bg-body: #0B1121
--bg-card: #1E293B
--primary: #3B82F6
--primary-hover: #2563EB
--text-primary: #F1F5F9
--text-secondary: #94A3B8
--border-color: #334155
```

### 2.4 保留的完整功能清单

- [x] 文本分享（textarea + 字符计数 0/10000）
- [x] 文件分享（拖拽/点击选择 + 文件列表 + 移除）
- [x] 有效期选择（30m / 1h / 6h / 12h）
- [x] 密码保护
- [x] 进度条（文件上传百分比）
- [x] 分享链接生成 + 复制
- [x] 密码验证 + 解密查看
- [x] 文件/文本内容展示
- [x] 销毁倒计时
- [x] 错误页面
- [x] 浅色/暗色切换

## 3. 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `index.js` | 修改 | 删除 3 行 import + 3 段 terminal 路由 |
| `src/handler.js` | 修改 | 删除 4 个函数 + 2 个 import |
| `src/lib.js` | 修改 | 删除 2 个导出函数（`signToken`, `verifyToken`） |
| `src/html.js` | 重写 | 完整重写 THEME CSS + 全部页面 HTML 结构，保留 JS 逻辑；提取公共 SVG ICONS、THEME_TOGGLE_HTML、cardFooter()；移除 emoji；增强响应式（3 级断点） |
| `docs/superpowers/specs/2026-06-21-ghostcut-ui-redesign-design.md` | 新建 | 本文档 |

## 4. 未改动的内容

- 所有 API 接口（`/api/share`, `/api/check/`, `/api/retrieve/`, `/s/`）
- 后端 handler 逻辑（`createShare`, `checkKey`, `retrieveShare`）
- KV / R2 数据模型
- 频率限制
- `src/lib.js` 中的工具函数（`generateKey`, `hashPassword`, `json`, `notFound`, `badRequest`, 等）
