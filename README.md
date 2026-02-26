# AI Dev Team - 智能开发团队

基于 [OpenClaw + Claude Code 超强教程](https://mp.weixin.qq.com/s/gtxM1f3JmfXqDuxGIa3-ng) 搭建的双层 AI 开发架构。

## 架构概述

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw (编排层)                         │
│  • 持有业务上下文                                            │
│  • 选择合适的 Agent                                          │
│  • 监控任务进度                                              │
│  • 失败后调整策略                                            │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │   Codex     │   │ Claude Code │   │   Gemini    │
   │  (主力)     │   │  (速度型)   │   │  (设计型)   │
   │ 后端/复杂bug│   │  前端/git   │   │  UI设计     │
   └─────────────┘   └─────────────┘   └─────────────┘
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/peipeijiang/ai-dev-team.git
cd ai-dev-team
```

### 2. 配置模型

项目使用 MiniMax M2.1（已配置）。如需其他模型，编辑 `config/agent-config.json`。

### 3. 创建任务

```bash
# 创建 worktree 并启动 Agent
./scripts/create-worktree.sh feat-new-feature
./scripts/launch-agent.sh feat-new-feature claude minimax-m2.1
```

### 4. 监控任务

```bash
# 手动检查
./scripts/monitor-agents.sh

# 或设置 cron 任务（每10分钟）
*/10 * * * * /path/to/scripts/monitor-agents.sh
```

## 核心脚本

| 脚本 | 用途 |
|------|------|
| `scripts/create-worktree.sh` | 创建隔离的 git worktree |
| `scripts/launch-agent.sh` | 启动 AI Agent |
| `scripts/monitor-agents.sh` | 监控所有 Agent 状态 |

## 工作流程

1. **需求 → 拆解** - OpenClaw 理解需求，拆解成具体任务
2. **创建 Worktree** - 为每个任务创建隔离的分支环境
3. **启动 Agent** - 根据任务类型选择合适的 Agent
4. **自动监控** - 定期检查任务进度和 CI 状态
5. **自动 Review** - 多个 Agent 审查 PR
6. **人工确认** - 收到通知后人工 review 并合并

## 与 OpenClaw 集成

在 OpenClaw 中加载此配置：

```bash
# 告诉 OpenClaw 你的需求
"帮我实现用户认证功能"
```

OpenClaw 会自动：
1. 读取业务上下文
2. 创建 worktree
3. 启动 Agent
4. 监控进度
5. 完成后通知你

## 成本参考

| 使用程度 | 月成本 |
|----------|--------|
| 新手起步 | ~$20/月 |
| 重度使用 | ~$190/月 |

## 参考

- 原文：[OpenClaw + Claude Code 超强教程](https://mp.weixin.qq.com/s/gtxM1f3JmfXqDuxGIa3-ng)
- 作者：Datawhale
