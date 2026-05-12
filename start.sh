#!/bin/bash
# 周易v2 — 一键启动脚本

# 加载 Rust 环境
source "$HOME/.cargo/env"

# 启动应用
cd "$(dirname "$0")"
npm run tauri dev
