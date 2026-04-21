#!/bin/bash

# OpenCode 双窗口自动对话脚本（带记忆功能）
# 用户抛出话题，两个opencode窗口自动循环对话，保留对话历史

set -e

# 配置
PIPE_A_TO_B="/tmp/opencode_pipe_a_to_b"
PIPE_B_TO_A="/tmp/opencode_pipe_b_to_a"
PID_FILE="/tmp/opencode_chat.pid"
LOG_FILE="/tmp/opencode_chat.log"
HISTORY_FILE="/tmp/opencode_chat_history.txt"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}正在停止对话...${NC}"
    
    # 终止所有相关进程
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    # 终止可能残留的进程
    pkill -f "opencode run" 2>/dev/null || true
    
    # 删除管道
    rm -f "$PIPE_A_TO_B" "$PIPE_B_TO_A"
    
    echo -e "${GREEN}清理完成${NC}"
    echo -e "${BLUE}日志保存在: $LOG_FILE${NC}"
    echo -e "${BLUE}历史记录保存在: $HISTORY_FILE${NC}"
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 检查opencode是否安装
check_opencode() {
    if ! command -v opencode &> /dev/null; then
        echo -e "${RED}错误: opencode 未安装${NC}"
        echo "请先安装: curl -fsSL https://opencode.ai/install | bash"
        exit 1
    fi
}

# 创建管道
create_pipes() {
    echo -e "${BLUE}创建通信管道...${NC}"
    rm -f "$PIPE_A_TO_B" "$PIPE_B_TO_A"
    mkfifo "$PIPE_A_TO_B" "$PIPE_B_TO_A"
    chmod 666 "$PIPE_A_TO_B" "$PIPE_B_TO_A"
}

# 初始化日志和历史文件
init_files() {
    echo "=== OpenCode 双窗口自动对话日志 ===" > "$LOG_FILE"
    echo "开始时间: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    # 初始化历史文件
    > "$HISTORY_FILE"
}

# 追加到历史记录
append_history() {
    local role="$1"
    local content="$2"
    echo "${role}: ${content}" >> "$HISTORY_FILE"
}

# 获取最近的对话历史（保留最近10轮对话，约20条消息）
get_recent_history() {
    local max_lines=20
    if [ -f "$HISTORY_FILE" ]; then
        local total_lines=$(wc -l < "$HISTORY_FILE")
        if [ "$total_lines" -gt "$max_lines" ]; then
            tail -n "$max_lines" "$HISTORY_FILE"
        else
            cat "$HISTORY_FILE"
        fi
    fi
}

# 生成回复（带上下文）
generate_reply_with_context() {
    local role="$1"
    local history="$2"
    local msg="$3"
    
    local prompt="你是对话中的${role}。以下是最近的对话历史：
---
${history}
对方刚刚说：${msg}
---
请基于以上对话历史，简要回应对方的最新观点，保持对话连贯性和深度，用1-2句话："
    
    local reply=$(timeout 30 opencode run "$prompt" 2>&1 | \
        grep -v "^\[0m\|^>\|^build\|^xiaomi\|^$\|^INFO\|^Warning" | \
        tail -1)
    
    if [ -z "$reply" ]; then
        reply="让我思考一下这个问题..."
    fi
    
    # 清理回复
    reply=$(echo "$reply" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    echo "$reply"
}

# 启动窗口A（分析者）
start_window_a() {
    local topic="$1"
    echo -e "${GREEN}启动窗口A（分析者）...${NC}"
    
    {
        # 发送初始话题（A记录到历史）
        timestamp=$(date +%T)
        echo "A→B (第1轮): $topic" >> "$LOG_FILE"
        append_history "A" "$topic"
        echo -e "${GREEN}[$timestamp] A → B: $topic${NC}"
        echo "$topic" > "$PIPE_A_TO_B"
        
        local round=2
        while true; do
            # 等待来自B的回复
            if read -r msg < "$PIPE_B_TO_A"; then
                # 获取最近的对话历史作为上下文
                local history=$(get_recent_history)
                
                # 生成回复
                local reply=$(generate_reply_with_context "A（分析者）" "$history" "$msg")
                
                # 记录A的回复到历史（不需要记录B的消息，因为B已经记录过了）
                append_history "A" "$reply"
                timestamp=$(date +%T)
                echo "A→B (第${round}轮): $reply" >> "$LOG_FILE"
                echo -e "${GREEN}[$timestamp] A → B: $reply${NC}"
                echo "$reply" > "$PIPE_A_TO_B"
                round=$((round + 1))
            fi
        done
    } &
    
    echo $! >> "$PID_FILE"
}

# 启动窗口B（评论者）
start_window_b() {
    echo -e "${GREEN}启动窗口B（评论者）...${NC}"
    
    {
        local round=1
        while true; do
            # 等待来自A的消息
            if read -r msg < "$PIPE_A_TO_B"; then
                # 获取最近的对话历史作为上下文
                local history=$(get_recent_history)
                
                # 生成回复
                local reply=$(generate_reply_with_context "B（评论者）" "$history" "$msg")
                
                # 记录B的回复到历史（不需要记录A的消息，因为A已经记录过了）
                append_history "B" "$reply"
                timestamp=$(date +%T)
                echo "B→A (第${round}轮): $reply" >> "$LOG_FILE"
                echo -e "${PURPLE}[$timestamp] B → A: $reply${NC}"
                echo "$reply" > "$PIPE_B_TO_A"
                round=$((round + 1))
            fi
        done
    } &
    
    echo $! >> "$PID_FILE"
}

# 主函数
main() {
    # 检查opencode
    check_opencode
    
    # 获取用户输入的话题
    local default_topic="你好，我是实例A，让我们开始对话吧！"
    echo -e "${CYAN}请输入初始话题（直接回车使用默认话题）:${NC}"
    echo -e "${BLUE}默认话题: $default_topic${NC}"
    read -r user_input
    
    local topic
    if [ -n "$user_input" ]; then
        topic="$user_input"
        echo -e "${GREEN}使用自定义话题: $topic${NC}"
    else
        topic="$default_topic"
        echo -e "${GREEN}使用默认话题: $topic${NC}"
    fi
    
    # 创建管道
    create_pipes
    
    # 初始化文件
    init_files
    
    # 启动窗口B（先启动B，等待A的消息）
    start_window_b
    
    # 等待B准备好
    sleep 1
    
    # 启动窗口A（发送初始话题）
    start_window_a "$topic"
    
    echo -e "${CYAN}对话已启动！${NC}"
    echo -e "${BLUE}按 Ctrl+C 停止对话${NC}"
    echo -e "${BLUE}日志文件: $LOG_FILE${NC}"
    echo -e "${BLUE}历史文件: $HISTORY_FILE${NC}"
    echo ""
    
    # 等待子进程
    wait
}

# 如果直接执行脚本
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi