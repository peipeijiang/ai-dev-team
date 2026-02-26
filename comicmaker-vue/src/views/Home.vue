<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">欢迎使用 ComicMaker</h2>
      </div>
      <div class="home-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-card">
              <el-icon class="stat-icon" :size="32" color="#409eff"><Collection /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.works }}</div>
                <div class="stat-label">作品数量</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <el-icon class="stat-icon" :size="32" color="#67c23a"><Files /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.episodes }}</div>
                <div class="stat-label">剧集数量</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <el-icon class="stat-icon" :size="32" color="#e6a23c"><Picture /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.materials }}</div>
                <div class="stat-label">素材数量</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <el-icon class="stat-icon" :size="32" color="#f56c6c"><Brush /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.styles }}</div>
                <div class="stat-label">风格数量</div>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="quick-actions">
          <h3 class="section-title">快速开始</h3>
          <div class="action-grid">
            <router-link to="/works" class="action-item">
              <el-icon :size="28"><FolderOpened /></el-icon>
              <span>作品管理</span>
            </router-link>
            <router-link to="/materials" class="action-item">
              <el-icon :size="28"><Picture /></el-icon>
              <span>素材管理</span>
            </router-link>
            <router-link to="/styles" class="action-item">
              <el-icon :size="28"><Brush /></el-icon>
              <span>风格管理</span>
            </router-link>
            <router-link to="/tools" class="action-item">
              <el-icon :size="28"><Tools /></el-icon>
              <span>AI 工具</span>
            </router-link>
          </div>
        </div>

        <el-divider />

        <div class="recent-works">
          <h3 class="section-title">最近作品</h3>
          <div v-if="recentWorks.length" class="grid-list">
            <div
              v-for="work in recentWorks"
              :key="work.id"
              class="grid-item"
              @click="goToWork(work.id)"
            >
              <img
                v-if="work.cover"
                :src="work.cover"
                class="grid-item-cover"
                alt="封面"
              />
              <div v-else class="grid-item-cover">
                <el-icon :size="48" color="#c0c4cc"><Picture /></el-icon>
              </div>
              <div class="grid-item-content">
                <div class="grid-item-title">{{ work.name }}</div>
                <div class="grid-item-meta">
                  <span>{{ work.episode_count || 0 }} 集</span>
                  <span>{{ formatDate(work.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><FolderOpened /></el-icon>
            <p>暂无作品，点击上方按钮创建第一个作品</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Collection, Files, Picture, Brush, FolderOpened, Tools } from '@element-plus/icons-vue'

const router = useRouter()

const stats = ref({
  works: 0,
  episodes: 0,
  materials: 0,
  styles: 0
})

const recentWorks = ref<any[]>([])

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const goToWork = (id: string) => {
  router.push(`/works/${id}`)
}

onMounted(async () => {
  // 模拟加载数据
  stats.value = {
    works: 5,
    episodes: 12,
    materials: 48,
    styles: 8
  }
  recentWorks.value = []
})
</script>

<style scoped>
.home-content {
  padding: 20px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.quick-actions {
  padding: 20px 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f5f7fa;
  border-radius: 8px;
  text-decoration: none;
  color: #606266;
  transition: all 0.3s ease;
}

.action-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.action-item span {
  font-size: 14px;
}

.recent-works {
  padding: 20px 0;
}
</style>
