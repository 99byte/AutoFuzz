# AutoFuzz

AI驱动的手机应用Fuzz测试平台

![AutoFuzz](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📖 简介

# AutoFuzz

基于 AI 大模型驱动的鸿蒙应用自动化 Fuzz 测试平台。

## 特性

- **智能生成测试用例**: 利用 OpenAI/GLM-4 等大模型分析应用描述，生成多样化的 UI 交互场景。
- **鸿蒙原生支持**: 原生集成 HDC (HarmonyOS Device Connector)，支持 HAP应用管理与 uinput 模拟操作。
- **实时监控与可视化**:
  - 实时流程画布 (React Flow) 展示测试步骤。
  - 实时日志终端。
  - 实时崩溃检测 (检测 JS Crash, CPP Crash, App Freeze)。
- **详细报告**: 完整的测试报告，包含截图、堆栈跟踪、执行日志，支持导出。

## 前置要求

- Node.js 18+
- HarmonyOS SDK / Command Line Tools (需要 `hdc` 命令在 PATH 中)
- 连接的鸿蒙设备或模拟器 (需开启开发者模式和 USB 调试)
- Python 3.10+ (可选，用于高级 AI 代理功能)
- Android手机（启用开发者模式和USB调试）

### 安装

```bash
# 1. 克隆项目
git clone <repository-url>
cd AutoFuzz

# 2. 运行初始化脚本
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入智谱API Key

# 4. 连接手机
# 确保手机已启用USB调试
adb devices

# 5. 启动应用
npm run dev
```

访问 http://localhost:3000

### 获取智谱API Key

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录
3. 创建API Key
4. 将API Key填入 `.env.local` 文件

## 📚 文档

- [安装指南](./docs/安装指南.md) - 详细的安装步骤
- [使用说明](./docs/使用说明.md) - 如何使用AutoFuzz
- [开发文档](./docs/开发文档.md) - 开发者文档

## 🎯 功能特性

### 核心功能

- 🤖 AI生成UI Fuzz测试用例
- 📱 支持Android应用Fuzz测试
- 🔍 实时崩溃检测（Native崩溃、Java异常、ANR）
- 📊 实时进度监控
- 💾 自动保存测试结果
- 📝 自动生成崩溃报告

### 技术架构

```
前端层: Next.js + TypeScript + TailwindCSS + shadcn/ui
后端层: Next.js API Routes
数据层: SQLite + Prisma ORM
AI层: 智谱AI GLM-4
Fuzz层: Open-AutoGLM (Python）
通信层: Server-Sent Events (SSE）
```

## 📂 项目结构

```
autofuzz/
├── src/
│   ├── app/              # Next.js页面
│   ├── components/       # React组件
│   ├── lib/            # 核心库
│   ├── hooks/          # React Hooks
│   └── types/         # TypeScript类型
├── scripts/           # 脚本
├── vendor/            # 外部依赖
│   └── Open-AutoGLM/ # Git Submodule
├── prisma/           # 数据库配置
└── docs/             # 文档
```

## 🔧 配置

### 环境变量

```env
DATABASE_URL="file:./prisma/dev.db"
ZHIPU_API_KEY="your-zhipu-api-key"
GLM_MODEL="glm-4"
AUTOGLM_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AUTOGLM_MODEL="autoglm-phone"
```

### ADB配置

确保手机已启用：
- 开发者模式
- USB调试
- USB调试（安全设置）

## 📝 使用示例

### 1. 创建Fuzz任务

```typescript
POST /api/tasks
{
  "name": "微信压力测试",
  "targetApp": "com.tencent.mm",
  "appDescription": "微信是一款社交通讯应用",
  "testConfig": {
    "testDepth": 10,
    "focusAreas": ["聊天", "朋友圈", "支付"]
  }
}
```

### 2. 启动测试

```typescript
POST /api/tasks/{id}/start
```

### 3. 监控进度

```typescript
GET /api/tasks/{id}/stream
```

返回SSE流：
```
data: {"type":"test_case_started","index":1,"total":10}

data: {"type":"action_completed","testCase":1,"action":1,"success":true}

data: {"type":"crash_detected","crash":{...}}
```

## 🧪 测试

```bash
# 运行单元测试
npm test

# 手动测试
npm run dev
# 访问 http://localhost:3000
```

## 🐛 故障排除

### 问题：ADB连接失败

```bash
# 重启ADB服务
adb kill-server
adb start-server

# 检查设备
adb devices
```

### 问题：AutoGLM导入失败

```bash
source autoglm-env/bin/activate
pip install -e ./vendor/Open-AutoGLM
```

### 问题：智谱API调用失败

检查：
1. API Key是否正确
2. 网络连接是否正常
3. 账号是否有足够配额

更多问题请参考 [使用说明](./docs/使用说明.md) 的故障排除章节。

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发流程

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加新功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

本项目基于以下开源项目：

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Open-AutoGLM](https://github.com/zai-org/Open-AutoGLM)
- [智谱AI](https://open.bigmodel.cn/)

## 📞 联系方式

如有问题，请提交Issue或联系维护者。

---

**Made with ❤️ for better mobile app testing**
