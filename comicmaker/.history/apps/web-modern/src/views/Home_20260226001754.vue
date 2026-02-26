<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>Welcome to <span class="gradient-text">MovieMaker AI</span></h1>
        <p class="subtitle">Start creating your next masterpiece with AI-powered tools.</p>
        <div class="cta-group">
          <el-button type="primary" size="large" round class="start-btn" @click="$router.push('/works')">
            <el-icon class="mr-2"><VideoCamera /></el-icon> Start Creating
          </el-button>
          <el-button size="large" round class="doc-btn">
            <el-icon class="mr-2"><Document /></el-icon> Documentation
          </el-button>
        </div>
      </div>
      <div class="welcome-visual">
        <!-- Abstract CSS Art or Illustration -->
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
        </div>
      </div>
    </div>

    <!-- Quick Access Grid -->
    <h3 class="section-title">Quick Access</h3>
    <div class="quick-access-grid">
      <div class="access-card" @click="$router.push('/works')">
        <div class="icon-wrapper blue">
          <el-icon><VideoCamera /></el-icon>
        </div>
        <div class="card-info">
          <h4>Projects</h4>
          <p>Manage your video projects</p>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>

      <div class="access-card" @click="$router.push('/materials')">
        <div class="icon-wrapper green">
          <el-icon><Files /></el-icon>
        </div>
        <div class="card-info">
          <h4>Assets Library</h4>
          <p>Characters, scenes & props</p>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>

      <div class="access-card" @click="$router.push('/styles')">
        <div class="icon-wrapper purple">
          <el-icon><Brush /></el-icon>
        </div>
        <div class="card-info">
          <h4>Styles</h4>
          <p>Define artistic directions</p>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>

      <div class="access-card" @click="$router.push('/tools')">
        <div class="icon-wrapper orange">
          <el-icon><MagicStick /></el-icon>
        </div>
        <div class="card-info">
          <h4>AI Toolbox</h4>
          <p>Generative tools & utilities</p>
        </div>
        <el-icon class="arrow-icon"><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- Recent Activity (Mockup for now) -->
    <h3 class="section-title mt-10">Recent Activity</h3>
    <div class="recent-list">
      <el-empty description="No recent activity found" :image-size="100" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VideoCamera, Files, Brush, MagicStick, ArrowRight, Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard-container {
  padding: 32px 48px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Welcome Section */
.welcome-section {
  background: white;
  border-radius: 24px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  margin-bottom: 48px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.welcome-text h1 {
  font-size: 42px;
  margin: 0 0 16px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--text-primary);
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-color) 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 32px;
  max-width: 500px;
  line-height: 1.6;
}

.cta-group {
  display: flex;
  gap: 16px;
}

.start-btn {
  padding: 24px 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.doc-btn {
  padding: 24px 32px;
  font-size: 16px;
  font-weight: 600;
}

.mr-2 {
  margin-right: 8px;
}

/* Quick Access Grid */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.access-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.access-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent-color);
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}

.icon-wrapper.blue { background: #e0f2fe; color: #0284c7; }
.icon-wrapper.green { background: #dcfce7; color: #16a34a; }
.icon-wrapper.purple { background: #f3e8ff; color: #9333ea; }
.icon-wrapper.orange { background: #ffedd5; color: #ea580c; }

.card-info h4 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.card-info p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.arrow-icon {
  margin-left: auto;
  color: var(--text-tertiary);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.access-card:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
  color: var(--accent-color);
}

.mt-10 {
  margin-top: 40px;
}

.welcome-visual {
  position: absolute;
  right: -50px;
  top: -50px;
  width: 300px;
  height: 300px;
  opacity: 0.1;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
}

.shape-1 {
  width: 200px;
  height: 200px;
  background: var(--accent-color);
  top: 0;
  right: 0;
}

.shape-2 {
  width: 150px;
  height: 150px;
  background: #3b82f6;
  bottom: 0;
  left: 0;
}

/* Response */
@media (max-width: 768px) {
  .welcome-section {
    padding: 32px;
    flex-direction: column;
    text-align: center;
  }
  
  .cta-group {
    justify-content: center;
  }
  
  .dashboard-container {
    padding: 24px;
  }
}
</style>
