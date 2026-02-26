<template>
  <el-config-provider :locale="zhCn">
    <div class="app-wrapper">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="logo-container">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px;">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <h2>MovieMaker</h2>
            <span>AI Studio</span>
          </div>
        </div>

        <nav class="nav-menu">
          <router-link to="/" class="nav-item">
            <el-icon><House /></el-icon>
            <span>概览 Dashboard</span>
          </router-link>
          <router-link to="/works" class="nav-item">
            <el-icon><VideoCamera /></el-icon>
            <span>项目 Projects</span>
          </router-link>
          <router-link to="/materials" class="nav-item">
            <el-icon><Files /></el-icon>
            <span>素材库 Assets</span>
          </router-link>
          <router-link to="/styles" class="nav-item">
            <el-icon><Brush /></el-icon>
            <span>风格 Styles</span>
          </router-link>
          <router-link to="/tools" class="nav-item">
            <el-icon><MagicStick /></el-icon>
            <span>工具箱 Toolbox</span>
          </router-link>
        </nav>

        <div class="user-profile">
          <el-avatar :size="36" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <div class="user-info">
            <span class="name">Creator</span>
            <span class="status">Pro Plan</span>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <header class="top-bar">
          <div class="page-header">
            <h1 class="page-title">{{ currentPageTitle }}</h1>
            <span class="page-subtitle">Welcome back to studio</span>
          </div>
          <div class="top-actions">
            <el-button circle :icon="Search" class="action-btn" />
            <el-button circle :icon="Bell" class="action-btn" />
            <el-button type="primary" round class="create-btn">
              <el-icon style="margin-right: 6px"><Plus /></el-icon> New Project
            </el-button>
          </div>
        </header>
        
        <div class="content-scroll">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
// @ts-ignore
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { House, Files, VideoCamera, Brush, MagicStick, Search, Bell, Plus } from '@element-plus/icons-vue'

const route = useRoute()

const currentPageTitle = computed(() => {
  const map: Record<string, string> = {
    '/': '概览 Dashboard',
    '/works': '项目 Projects',
    '/materials': '素材库 Assets',
    '/styles': '风格 Styles',
    '/tools': 'AI 工具箱 Toolbox'
  }
  if (route.path.startsWith('/works/')) return '项目详情 Project Detail'
  return map[route.path] || 'MovieMaker AI'
})
</script>

<style scoped>
.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  z-index: 10;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
  padding-left: 8px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--el-color-primary-light-9);
  color: var(--accent-color);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.logo-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.logo-text span {
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 600;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 14px;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  transform: translateX(4px);
}

.nav-item.router-link-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.02));
  border-color: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.05);
}

.nav-item .el-icon {
  font-size: 20px;
}

.user-profile {
  margin-top: auto;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info .name {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.user-info .status {
  color: #10b981;
  font-size: 11px;
  font-weight: 500;
  margin-top: 2px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 40%);
}

.top-bar {
  height: 90px;
  padding: 0 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 5;
}

.page-title {
  font-size: 28px;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.8px;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-secondary) !important;
  width: 42px !important;
  height: 42px !important;
  font-size: 18px !important;
}

.action-btn:hover {
  background: var(--bg-glass) !important;
  transform: translateY(-2px);
  color: var(--accent-color) !important;
  border-color: var(--accent-color) !important;
}

.create-btn {
  background: var(--accent-color) !important;
  border: none !important;
  height: 42px !important;
  padding: 0 24px !important;
  font-weight: 600 !important;
  box-shadow: var(--shadow-md) !important;
  transition: all 0.3s ease !important;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg) !important;
  background: var(--accent-hover) !important;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 0 48px 48px;
}

/* 路由转场动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
}
</style>