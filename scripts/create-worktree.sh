#!/bin/bash
# AI Agent Worktree Manager
# 基于文章中的架构：创建隔离的 git worktree 给 Agent 使用

set -e

BRANCH_NAME="${1:-}"
REPO_PATH="${2:-.}"

if [ -z "$BRANCH_NAME" ]; then
    echo "用法: ./create-worktree.sh <分支名> [仓库路径]"
    echo "示例: ./create-worktree.sh feat-custom-templates ../my-project"
    exit 1
fi

# 获取仓库根目录
REPO_ROOT="$(cd "$REPO_PATH" && pwd)"
WORKTREE_PATH="$REPO_ROOT/../ai-worktrees/$BRANCH_NAME"

echo "📦 创建 Worktree: $BRANCH_NAME"
echo "   路径: $WORKTREE_PATH"

# 创建隔离的 worktree 目录
mkdir -p "$(dirname "$WORKTREE_PATH")"

# 创建 worktree
cd "$REPO_ROOT"
git worktree add "$WORKTREE_PATH" -b "$BRANCH_NAME"

# 安装依赖
if [ -f "$WORKTREE_PATH/package.json" ]; then
    echo "📥 安装依赖..."
    cd "$WORKTREE_PATH"
    pnpm install 2>/dev/null || npm install
fi

echo "✅ Worktree 创建完成: $WORKTREE_PATH"
echo "   分支: $BRANCH_NAME"

# 输出 JSON 格式的任务信息
cat <<EOF
{
  "branch": "$BRANCH_NAME",
  "worktree": "$WORKTREE_PATH",
  "repo": "$REPO_ROOT"
}
EOF
