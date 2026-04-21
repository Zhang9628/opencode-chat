#!/bin/bash

# OpenCode 自动对话安装脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}安装 OpenCode 自动对话脚本...${NC}"

# 检查opencode是否安装
if ! command -v opencode &> /dev/null; then
    echo -e "${BLUE}opencode 未安装，正在安装...${NC}"
    curl -fsSL https://opencode.ai/install | bash
fi

# 创建配置文件
CONFIG_FILE="${HOME}/.opencode-chat.conf"
if [ ! -f "$CONFIG_FILE" ]; then
    cat > "$CONFIG_FILE" << 'EOF'
# OpenCode 自动对话配置
PIPE_A_TO_B="/tmp/opencode_pipe_a_to_b"
PIPE_B_TO_A="/tmp/opencode_pipe_b_to_a"
PID_FILE="/tmp/opencode_chat.pid"
LOG_FILE="/tmp/opencode_chat.log"
TIMEOUT=30
INITIAL_MESSAGE="你好，我是实例A，让我们开始对话吧！"
EOF
    echo -e "${GREEN}配置文件已创建: $CONFIG_FILE${NC}"
fi

# 设置脚本权限
chmod +x chat.sh run.sh stop-chat.sh

echo -e "${GREEN}安装完成！${NC}"
echo ""
echo "使用方法:"
echo "  启动对话: ./run.sh"
echo "  停止对话: ./stop-chat.sh"
echo ""
echo "配置文件: $CONFIG_FILE"
echo "日志文件: /tmp/opencode_chat.log"