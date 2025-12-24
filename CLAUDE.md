# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 中文语言要求
1. 交流过程中请一定使用中文
2. 文档一定使用中文撰写，并存放在docs目录下
3. 注释一定使用中文撰写

## 项目概述

AutoFuzz 是一个 AI 驱动的手机应用 Fuzz 测试平台，用于自动生成 UI 交互测试用例、执行 Fuzz 测试、崩溃检测和实时监控。

## 常用命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint

# 数据库操作
npx prisma generate       # 生成 Prisma 客户端
npx prisma db push        # 推送 Schema 到数据库
npx prisma studio         # 数据库可视化工具

# 初始化项目（首次运行）
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

## 技术架构

```
前端层    → Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
后端层    → Next.js API Routes
数据层    → SQLite + Prisma ORM
AI层      → 智谱AI GLM-4 (通过 OpenAI 兼容 API)
Fuzz层    → Open-AutoGLM (Python 虚拟环境)
通信层    → Server-Sent Events (SSE)
```

## 核心模块

| 模块 | 路径 | 职责 |
|------|------|------|
| TestCaseGenerator | `src/lib/ai.ts` | 使用智谱 AI 生成测试用例 |
| AutoGLMFuzzer | `src/lib/autoglm.ts` | 封装 AutoGLM 执行 Fuzz 动作 |
| ADBMonitor | `src/lib/adb.ts` | ADB 操作和崩溃检测 |
| FuzzTaskRunner | `src/lib/fuzz-runner.ts` | 核心执行器，协调所有模块 |
| StreamManager | `src/lib/stream.ts` | 管理 SSE 实时推送 |

## API Routes

- `GET/POST /api/tasks` - 任务列表和创建
- `GET/DELETE /api/tasks/[id]` - 任务详情和删除
- `POST /api/tasks/[id]/start` - 启动测试
- `POST /api/tasks/[id]/stop` - 停止测试
- `GET /api/tasks/[id]/stream` - SSE 实时流
- `GET /api/stats` - 统计数据
- `GET /api/devices/check` - 检查设备连接

## 数据库模型关系

```
FuzzTask (任务主表)
├── TestExecution[] (一对多: 测试执行记录)
├── CrashReport[] (一对多: 崩溃报告)
└── TestResult? (一对一: 测试结果汇总)
```

Schema 位于 `prisma/schema.prisma`

## 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   └── (dashboard)/       # 仪表板路由组
├── components/
│   ├── ui/                # shadcn/ui 组件
│   └── flow/              # 流程可视化组件
├── lib/                   # 核心业务逻辑
├── hooks/                 # React Hooks
└── types/                 # TypeScript 类型定义
```

## 环境变量

复制 `.env.example` 到 `.env` 并配置：
- `DATABASE_URL` - SQLite 数据库路径
- `ZHIPU_API_KEY` - 智谱 AI API 密钥
- `AUTOGLM_BASE_URL` - AutoGLM API 地址
- `AUTOGLM_MODEL` - AutoGLM 模型名称

## 路径别名

项目配置了 `@/*` 指向 `./src/*`，在导入时使用：
```typescript
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
```

## SSE 事件类型

实时推送使用以下事件类型：
- `task_started` / `task_completed` / `task_failed`
- `generating_test_cases` / `test_cases_generated`
- `test_case_started` / `action_completed`
- `crash_detected`

## 崩溃检测规则

ADBMonitor (`src/lib/adb.ts`) 检测以下崩溃类型：
1. Native 崩溃 - "FATAL EXCEPTION" + 堆栈跟踪
2. Java 异常 - "AndroidRuntime" 异常
3. ANR - "ANR" 关键字
4. 进程死亡 - 通过 `pidof` 检查
