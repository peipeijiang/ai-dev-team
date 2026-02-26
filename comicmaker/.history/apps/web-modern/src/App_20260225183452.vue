<template>
  <el-config-provider :locale="zhCn">
    <div class="app-wrapper">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="logo-container">
          <div class="logo-icon">M</div>
          <div class="logo-text">
            <h2>MovieMaker</h2>
            <span>AI Studio</span>
          </div>
        </div>

        <nav class="nav-menu">
          <router-link to="/" class="nav-item" active-class="active">
            <el-icon><House /></el-icon>
            <span>概览</span>
          </router-link>
          <router-link to="/works" class="nav-item" active-class="active">
            <el-icon><VideoCamera /></el-icon>
            <span>项目</span>
          </router-link>
          <router-link to="/materials" class="nav-item" active-class="active">
            <el-icon><Files /></el-icon>
            <span>素材库</span>
          </router-link>
          <router-link to="/styles" class="nav-item" active-class="active">
            <el-icon><Brush /></el-icon>
            <span>风格</span>
          </router-link>
          <router-link to="/tools" class="nav-item" active-class="active">
            <el-icon><MagicStick /></el-icon>
            <span>工具箱</span>
          </router-link>
        </nav>

        <div class="user-profile">
          <div class="avatar">U</div>
          <div class="user-info">
            <span class="name">Creator</span>
            <span class="status">Pro Plan</span>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <header class="top-bar">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <div class="top-actions">
            <el-button circle :icon="Search" class="action-btn" />
            <el-button circle :icon="Bell" class="action-btn" />
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
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { House, Files, VideoCamera, Brush, MagicStick, Search, Bell } from '@element-plus/icons-vue'

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
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 24px;
  z-index: 10;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  padding: 0 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 20px;
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
}

.logo-text h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.logo-text span {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
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
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.05));
  color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
}

.nav-item .el-icon {
  font-size: 20px;
}

.user-profile {
  margin-top: auto;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border-color);
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info .name {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.user-info .status {
  color: var(--accent-color);
  font-size: 11px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.top-bar {
  height: 80px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  z-index: 5;
}

.page-title {
  font-size: 24px;
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.5px;
}

.action-btn {
  background: transparent !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: var(--accent-color) !important;
  color: var(--accent-color) !important;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 40px 40px;
}

/* 路由转场动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>