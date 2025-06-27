#!/bin/bash

# CarbonLens 一鍵啟動脚本
# 使用方法: ./start.sh [backend|frontend|all]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查 Node.js 版本
check_node_version() {
    if ! command_exists node; then
        print_message $RED "❌ Node.js 未安装！请安装 Node.js 18.0.0 或更高版本"
        exit 1
    fi
    
    local node_version=$(node -v | sed 's/v//')
    local required_version="18.0.0"
    
    if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
        print_message $RED "❌ Node.js 版本过低！当前版本: $node_version，需要: $required_version 或更高"
        exit 1
    fi
    
    print_message $GREEN "✅ Node.js 版本检查通过: $node_version"
}

# 启动后端服务
start_backend() {
    print_message $BLUE "🚀 启动后端服务..."
    
    cd backend
    
    # 检查是否已经安装依赖
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "📦 安装后端依赖..."
        npm install
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            print_message $YELLOW "⚙️  创建环境变量文件..."
            cp env.example .env
            print_message $YELLOW "请编辑 backend/.env 文件设置必要的环境变量"
        else
            print_message $YELLOW "⚙️  创建默认环境变量文件..."
            cat > .env << EOF
PORT=3001
NODE_ENV=development
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EOF
        fi
    fi
    
    # 启动开发服务器
    print_message $GREEN "🌟 后端服务启动中..."
    npm run dev &
    
    cd ..
    
    # 等待服务启动
    sleep 3
    
    # 检查服务是否启动成功
    if curl -s http://localhost:3001/health > /dev/null; then
        print_message $GREEN "✅ 后端服务已启动: http://localhost:3001"
    else
        print_message $YELLOW "⏳ 后端服务正在启动中..."
    fi
}

# 启动前端服务
start_frontend() {
    print_message $BLUE "🖥️  启动网页前端..."
    
    cd web-frontend
    
    # 检查是否已经安装依赖
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "📦 安装前端依赖..."
        npm install
    fi
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        print_message $YELLOW "⚙️  创建前端环境变量文件..."
        echo "VITE_API_URL=http://localhost:3001/api" > .env
    fi
    
    # 启动开发服务器
    print_message $GREEN "🌟 前端服务启动中..."
    npm run dev &
    
    cd ..
    
    # 等待服务启动
    sleep 3
    
    print_message $GREEN "✅ 网页前端已启动: http://localhost:3000"
}

# 显示帮助信息
show_help() {
    echo "CarbonLens 启动脚本"
    echo ""
    echo "使用方法:"
    echo "  ./start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  backend   只启动后端服务"
    echo "  frontend  只启动网页前端"
    echo "  all       启动所有服务 (默认)"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./start.sh          # 启动所有服务"
    echo "  ./start.sh backend  # 只启动后端"
    echo "  ./start.sh frontend # 只启动前端"
}

# 显示服务状态
show_status() {
    print_message $BLUE "📊 服务状态检查..."
    
    # 检查后端
    if curl -s http://localhost:3001/health > /dev/null; then
        print_message $GREEN "✅ 后端服务: 运行中 (http://localhost:3001)"
    else
        print_message $RED "❌ 后端服务: 未运行"
    fi
    
    # 检查前端
    if curl -s http://localhost:3000 > /dev/null; then
        print_message $GREEN "✅ 网页前端: 运行中 (http://localhost:3000)"
    else
        print_message $RED "❌ 网页前端: 未运行"
    fi
}

# 主函数
main() {
    print_message $GREEN "🌱 CarbonLens 启动脚本"
    print_message $GREEN "=================================="
    
    # 检查 Node.js
    check_node_version
    
    # 根据参数决定启动什么服务
    case "${1:-all}" in
        "backend")
            start_backend
            ;;
        "frontend")
            start_frontend
            ;;
        "all")
            start_backend
            start_frontend
            ;;
        "status")
            show_status
            ;;
        "help")
            show_help
            ;;
        *)
            print_message $RED "❌ 未知选项: $1"
            show_help
            exit 1
            ;;
    esac
    
    # 显示最终状态
    if [ "${1:-all}" != "help" ] && [ "${1:-all}" != "status" ]; then
        echo ""
        print_message $GREEN "🎉 启动完成！"
        print_message $BLUE "=================================="
        print_message $BLUE "📱 移动端应用: npm run start (在项目根目录)"
        print_message $BLUE "🖥️  网页端应用: http://localhost:3000"
        print_message $BLUE "🚀 后端 API: http://localhost:3001"
        print_message $BLUE "📊 健康检查: http://localhost:3001/health"
        print_message $BLUE "=================================="
        print_message $YELLOW "💡 提示: 使用 Ctrl+C 停止服务"
        
        # 等待用户中断
        echo ""
        print_message $YELLOW "按 Ctrl+C 停止所有服务..."
        trap 'print_message $RED "🛑 正在停止服务..."; pkill -f "npm run dev"; exit 0' INT
        
        # 保持脚本运行
        while true; do
            sleep 1
        done
    fi
}

# 运行主函数
main "$@" 