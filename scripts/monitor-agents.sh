#!/bin/bash
# AI Agent Monitor
# 基于文章架构：每10分钟检查所有 Agent 状态

TASKS_DIR="$(dirname "$0")/../tasks"
NOTIFY_SCRIPT="$(dirname "$0")/notify.sh"

echo "🔍 检查 Agent 状态..."

# 检查是否有任务记录
if [ ! -d "$TASKS_DIR" ] || [ -z "$(ls -A "$TASKS_DIR" 2>/dev/null)" ]; then
    echo "📭 没有运行中的任务"
    exit 0
fi

FAILED_TASKS=()
RUNNING_TASKS=()

for task_file in "$TASKS_DIR"/*.json; do
    [ -f "$task_file" ] || continue
    
    # 解析 JSON
    TASK_ID=$(basename "$task_file" .json)
    SESSION_NAME=$(jq -r '.tmuxSession // empty' "$task_file" 2>/dev/null)
    STATUS=$(jq -r '.status // empty' "$task_file" 2>/dev/null)
    
    if [ "$STATUS" != "running" ]; then
        continue
    fi
    
    # 检查 tmux 会话是否还活着
    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        RUNNING_TASKS+=("$TASK_ID")
        
        # 检查是否有新提交（通过检查 git 状态）
        WORKTREE=$(jq -r '.worktree // empty' "$task_file" 2>/dev/null)
        if [ -d "$WORKTREE/.git" ]; then
            COMMITS=$(cd "$WORKTREE" && git log --oneline origin/main..HEAD 2>/dev/null | wc -l)
            if [ "$COMMITS" -gt 0 ]; then
                echo "   📝 $TASK_ID: $COMMITS 个新提交"
            fi
        fi
    else
        # 会话已结束
        echo "   ❌ $TASK_ID: 会话已结束"
        
        # 检查是否有 PR
        if [ -d "$WORKTREE/.git" ]; then
            if git pr list 2>/dev/null | grep -q "$TASK_ID"; then
                echo "   ✅ $TASK_ID: PR 已创建"
                jq '.status = "pr_created"' "$task_file" > "$task_file.tmp" && mv "$task_file.tmp" "$task_file"
            else
                # 没有 PR，可能是失败了
                FAILED_TASKS+=("$TASK_ID")
                jq '.status = "failed"' "$task_file" > "$task_file.tmp" && mv "$task_file.tmp" "$task_file"
            fi
        fi
    fi
done

echo ""
echo "📊 状态汇总"
echo "   运行中: ${#RUNNING_TASKS[@]} 个"
echo "   失败: ${#FAILED_TASKS[@]} 个"

# 如果有失败的任务，发送通知
if [ ${#FAILED_TASKS[@]} -gt 0 ]; then
    echo "⚠️  有任务失败，需要人工介入"
    # 可以在这里调用通知脚本
    # if [ -f "$NOTIFY_SCRIPT" ]; then
    #     "$NOTIFY_SCRIPT" "任务失败: ${FAILED_TASKS[*]}"
    # fi
fi
