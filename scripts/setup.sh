#!/bin/bash

set -e

echo "🚀 AutoFuzz 初始化脚本"
echo "======================"
echo ""

# 1. 检查Node.js
echo "1️⃣ 检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi
echo "✅ Node.js 版本: $(node --version)"

# 2. 检查Python
echo ""
echo "2️⃣ 检查Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python 3.10+"
    exit 1
fi
echo "✅ Python 版本: $(python3 --version)"

# 3. 检查ADB
echo ""
echo "3️⃣ 检查ADB..."
if ! command -v adb &> /dev/null; then
    echo "❌ ADB 未安装，请先安装 Android Platform Tools"
    echo "   下载地址: https://developer.android.com/tools/releases/platform-tools"
    exit 1
fi
echo "✅ ADB 版本: $(adb --version | head -n 1)"

# 4. 安装Node.js依赖
echo ""
echo "4️⃣ 安装Node.js依赖..."
npm install

# 5. 初始化Prisma
echo ""
echo "5️⃣ 初始化数据库..."
npx prisma migrate dev --name init

# 6. 初始化Git submodule
echo ""
echo "6️⃣ 初始化Git submodule..."
if [ ! -d "vendor/Open-AutoGLM" ]; then
    git submodule add https://github.com/zai-org/Open-AutoGLM.git vendor/Open-AutoGLM
else
    git submodule update --init --recursive
fi

# 7. 创建Python虚拟环境
echo ""
echo "7️⃣ 创建Python虚拟环境..."
if [ ! -d "autoglm-env" ]; then
    python3 -m venv autoglm-env
    echo "✅ 虚拟环境创建成功"
else
    echo "✅ 虚拟环境已存在"
fi

# 8. 安装AutoGLM
echo ""
echo "8️⃣ 安装AutoGLM..."
source autoglm-env/bin/activate
pip install -e ./vendor/Open-AutoGLM
deactivate

# 9. 检查环境变量
echo ""
echo "9️⃣ 检查环境变量..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local 文件不存在"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ 已从 .env.example 创建 .env.local"
        echo "⚠️  请编辑 .env.local 文件，填入您的智谱API Key"
    fi
else
    echo "✅ .env.local 文件已存在"
fi

# 10. 完成
echo ""
echo "======================"
echo "✅ 初始化完成！"
echo ""
echo "下一步："
echo "1. 编辑 .env.local 文件，填入您的智谱API Key"
echo "2. 通过USB连接Android手机，启用USB调试"
echo "3. 运行 npm run dev 启动应用"
echo ""
echo "文档："
echo "- 安装指南: docs/安装指南.md"
echo "- 使用说明: docs/使用说明.md"
echo ""
