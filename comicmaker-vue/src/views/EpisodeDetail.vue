<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <div>
          <el-button text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
        <div class="btn-group">
          <el-button @click="goBack">返回</el-button>
          <el-button type="primary" @click="goToEdit">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>

      <div v-loading="loading" class="episode-detail">
        <div class="detail-header">
          <div class="detail-cover">
            <img v-if="episode.cover" :src="episode.cover" alt="封面" />
            <div v-else class="cover-placeholder">
              <el-icon :size="48" color="#c0c4cc"><Files /></el-icon>
            </div>
          </div>
          <div class="detail-info">
            <h1 class="detail-title">{{ episode.name }}</h1>
            <div class="detail-meta">
              <p><strong>创建时间：</strong>{{ formatDate(episode.created_at) }}</p>
              <p><strong>更新时间：</strong>{{ formatDate(episode.updated_at) }}</p>
            </div>
            <div class="detail-desc">
              <strong>剧集描述：</strong>
              <p>{{ episode.description || '暂无描述' }}</p>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="storyboard-section">
          <div class="section-header">
            <h3 class="section-title">分镜内容</h3>
            <el-button type="primary" size="small" @click="handleAddScene">
              <el-icon><Plus /></el-icon>
              添加分镜
            </el-button>
          </div>

          <div v-if="scenes.length" class="scenes-list">
            <div v-for="(scene, index) in scenes" :key="scene.id" class="scene-card">
              <div class="scene-number">{{ index + 1 }}</div>
              <div class="scene-content">
                <div class="scene-image">
                  <img v-if="scene.image" :src="scene.image" alt="分镜图" />
                  <div v-else class="image-placeholder">
                    <el-icon :size="24" color="#c0c4cc"><Picture /></el-icon>
                  </div>
                </div>
                <div class="scene-text">
                  <p><strong>画面描述：</strong>{{ scene.description || '暂无' }}</p>
                  <p><strong>对话/文案：</strong>{{ scene.dialogue || '暂无' }}</p>
                </div>
              </div>
              <div class="scene-actions">
                <el-button text size="small" @click="handleEditScene(scene)">编辑</el-button>
                <el-button text size="small" type="danger" @click="handleDeleteScene(scene)">删除</el-button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-icon :size="48"><Files /></el-icon>
            <p>暂无分镜内容</p>
            <el-button type="primary" @click="handleAddScene">添加第一个分镜</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Files, Plus, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const episode = ref<any>({})
const scenes = ref<any[]>([])

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadEpisode = async () => {
  loading.value = true
  try {
    const episodeId = route.params.id as string
    // 模拟数据
    episode.value = {
      id: episodeId,
      name: '第一集 开始的相遇',
      description: '主角与反派的第一次相遇，故事由此展开...',
      cover: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    scenes.value = [
      {
        id: '1',
        description: '城市街道夜景，灯光闪烁',
        dialogue: '（内心独白）这就是我生活的城市...',
        image: ''
      }
    ]
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToEdit = () => {
  router.push(`/episodes/${route.params.id}/edit`)
}

const handleAddScene = () => {
  ElMessage.info('添加分镜功能开发中')
}

const handleEditScene = (scene: any) => {
  ElMessage.info('编辑分镜功能开发中')
}

const handleDeleteScene = async (scene: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分镜吗？', '删除确认', { type: 'warning' })
    ElMessage.success('删除成功')
    loadEpisode()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadEpisode()
})
</script>

<style scoped>
.episode-detail {
  min-height: 400px;
}

.detail-header {
  display: flex;
  gap: 24px;
}

.detail-cover {
  width: 200px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f2f5;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-info {
  flex: 1;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.detail-meta {
  color: #606266;
  font-size: 14px;
  line-height: 2;
  margin-bottom: 16px;
}

.detail-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
}

.detail-desc p {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.scenes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scene-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.scene-number {
  width: 32px;
  height: 32px;
  background: #409eff;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.scene-content {
  flex: 1;
  display: flex;
  gap: 16px;
}

.scene-image {
  width: 120px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  background: #e4e7ed;
  flex-shrink: 0;
}

.scene-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.scene-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
