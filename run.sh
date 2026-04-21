#!/bin/bash

# 简单的启动脚本

cd "$(dirname "$0")"
exec ./chat-memory.sh "$@"