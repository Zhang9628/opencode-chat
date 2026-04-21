#!/bin/bash

# 停止自动循环对话脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 管道文件
PIPE_A_TO_B="/tmp/opencode_pipe_a_to_b"
PIPE_B_TO_A="/tmp/opencode_pipe_b_to_a"

# PID文件
PID_FILE="/tmp/opencode_chat.pid"

echo -e "${YELLOW}正在停止opencode自动对话...${NC}"

# 终止进程
if [ -f "$PID_FILE" ]; then
    while read pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${BLUE}终止进程 $pid${NC}"
            kill "$pid" 2>/dev/null || true
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
fi

# 也终止可能残留的opencode run进程
pkill -f "opencode run" 2>/dev/null || true

# 删除管道
rm -f "$PIPE_A_TO_B" "$PIPE_B_TO_A"

echo -e "${GREEN}已停止所有对话进程${NC}"