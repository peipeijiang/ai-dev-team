<template>
  <el-container class="app-container">
    <el-header class="navbar">
      <div class="nav-container">
        <h1 class="nav-title">ComicMaker</h1>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          :ellipsis="false"
          router
          class="nav-menu"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/materials">素材管理</el-menu-item>
          <el-menu-item index="/works">作品管理</el-menu-item>
          <el-menu-item index="/styles">风格管理</el-menu-item>
          <el-menu-item index="/tools">工具</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.navbar {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-container {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-title {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
  margin: 0 40px 0 0;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  border-bottom: none !important;
}

.main-content {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px;
}

:deep(.el-menu-item) {
  font-size: 14px;
}
</style>
