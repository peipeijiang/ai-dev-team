#!/bin/bash
# AI Agent Launcher
# 基于文章架构：用 tmux 启动 Agent 在后台运行

set -e

TASK_NAME="${1:-}"
AGENT_TYPE="${2:-claude}"  # claude, codex, gemini
MODEL="${3:-minimax-m2.1}"

if [ -z "$TASK_NAME" ]; then
    echo "用法: ./launch-agent.sh <任务名> [agent类型] [模型]"
    echo "示例: ./launch-agent.sh feat-custom-templates clause minimax-m2.1"
    exit 1
fi

SESSION_NAME="agent-$TASK_NAME"
WORKTREE_PATH="../ai-worktrees/$TASK_NAME"

# 检查 worktree 是否存在
if [ ! -d "$WORKTREE_PATH" ]; then
    echo "❌ Worktree 不存在: $WORKTREE_PATH"
    echo "   请先运行: ./create-worktree.sh $TASK_NAME"
    exit 1
fi

echo "🚀 启动 Agent: $TASK_NAME"
echo "   类型: $AGENT_TYPE"
echo "   模型: $MODEL"
echo "   会话: $SESSION_NAME"

# 检查 tmux 会话是否已存在
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "⚠️  会话已存在，附加到现有会话"
    tmux attach -t "$SESSION_NAME"
    exit 0
fi

# 创建新的 tmux 会话
cd "$WORKTREE_PATH"

# 根据 Agent 类型构建启动命令
case "$AGENT_TYPE" in
    claude)
        CMD="claude --print '$TASK_NAME: 开始执行任务，请根据上下文完成开发任务'"
        ;;
    codex)
        CMD="codex '$TASK_NAME: 开始执行任务'"
        ;;
    gemini)
        CMD="gemini '$TASK_NAME: 开始执行任务'"
        ;;
    *)
        CMD="echo '未知 Agent 类型: $AGENT_TYPE'"
        ;;
esac

# 启动 tmux 会话
tmux new-session -d -s "$SESSION_NAME" -c "$WORKTREE_PATH" "$CMD"

# 记录任务信息到 JSON
TASK_JSON=$(cat <<EOF
{
  "id": "$TASK_NAME",
  "tmuxSession": "$SESSION_NAME",
  "agent": "$AGENT_TYPE",
  "model": "$MODEL",
  "worktree": "$WORKTREE_PATH",
  "branch": "$TASK_NAME",
  "startedAt": $(date +%s000),
  "status": "running",
  "notifyOnComplete": true
}
EOF
)

# 保存任务记录
mkdir -p ../tasks
echo "$TASK_JSON" > "../tasks/$TASK_NAME.json"

echo "✅ Agent 已启动"
echo "   会话名: $SESSION_NAME"
echo "   查看日志: tmux attach -t $SESSION_NAME"
echo "   发送指令: tmux send-keys -t $SESSION_NAME '你的指令' Enter"
