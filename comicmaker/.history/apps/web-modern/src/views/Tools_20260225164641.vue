<template>
  <div class="tools-container">
    <h2>AI 工具箱</h2>
    <div class="coming-soon">
      <el-empty description="工具箱功能迁移中..." />
      <p>目前请使用旧版 web 界面访问完整工具功能。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 暂时占位，因为工具箱逻辑非常复杂，可以分阶段迁移
// 或者如果用户需要，我可以把 tools.js 的逻辑搬过来
</script>

<style scoped>
.tools-container { padding: 20px; }
.coming-soon { text-align: center; padding: 50px; }
</style>
