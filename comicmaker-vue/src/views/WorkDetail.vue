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
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑作品
        </el-button>
      </div>

      <div v-loading="loading" class="work-detail">
        <div class="detail-header">
          <div class="detail-cover">
            <img v-if="work.cover" :src="work.cover" alt="封面" />
            <div v-else class="cover-placeholder">
              <el-icon :size="48" color="#c0c4cc"><Picture /></el-icon>
            </div>
          </div>
          <div class="detail-info">
            <h1 class="detail-title">{{ work.name }}</h1>
            <div class="detail-meta">
              <p><strong>创建时间：</strong>{{ formatDate(work.created_at) }}</p>
              <p><strong>更新时间：</strong>{{ formatDate(work.updated_at) }}</p>
              <p><strong>剧集数量：</strong>{{ episodes.length }} 集</p>
            </div>
            <div class="detail-desc">
              <strong>作品描述：</strong>
              <p>{{ work.description || '暂无描述' }}</p>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="episodes-section">
          <div class="section-header">
            <h3 class="section-title">剧集列表</h3>
            <el-button type="primary" @click="handleAddEpisode">
              <el-icon><Plus /></el-icon>
              新建剧集
            </el-button>
          </div>

          <div v-if="episodes.length" class="episodes-list">
            <div
              v-for="episode in episodes"
              :key="episode.id"
              class="episode-card"
              @click="goToEpisode(episode.id)"
            >
              <div class="episode-cover">
                <img v-if="episode.cover" :src="episode.cover" alt="封面" />
                <div v-else class="episode-cover-placeholder">
                  <el-icon :size="32" color="#c0c4cc"><Files /></el-icon>
                </div>
              </div>
              <div class="episode-info">
                <h4 class="episode-title">{{ episode.name }}</h4>
                <p class="episode-desc">{{ episode.description || '暂无描述' }}</p>
                <div class="episode-meta">
                  <span>创建于 {{ formatDate(episode.created_at) }}</span>
                </div>
              </div>
              <div class="episode-actions" @click.stop>
                <el-dropdown trigger="click">
                  <el-button text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="goToEpisode(episode.id)">查看</el-dropdown-item>
                      <el-dropdown-item @click="goToEpisodeEdit(episode.id)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="handleDeleteEpisode(episode)" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon :size="48"><Files /></el-icon>
            <p>暂无剧集</p>
            <el-button type="primary" @click="handleAddEpisode">创建第一个剧集</el-button>
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
import { ArrowLeft, Edit, Picture, Plus, Files, MoreFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const work = ref<any>({})
const episodes = ref<any[]>([])

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const goBack = () => {
  router.push('/works')
}

const loadWork = async () => {
  loading.value = true
  try {
    const workId = route.params.id as string
    // 模拟数据
    work.value = {
      id: workId,
      name: '我的漫画作品',
      description: '这是一个测试作品的描述内容',
      cover: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    episodes.value = [
      {
        id: '1',
        name: '第一集',
        description: '第一集的描述',
        cover: '',
        created_at: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  ElMessage.info('编辑功能开发中')
}

const handleAddEpisode = () => {
  router.push(`/episodes/new?workId=${route.params.id}`)
}

const goToEpisode = (id: string) => {
  router.push(`/episodes/${id}`)
}

const goToEpisodeEdit = (id: string) => {
  router.push(`/episodes/${id}/edit`)
}

const handleDeleteEpisode = async (episode: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除剧集「${episode.name}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    ElMessage.success('删除成功')
    loadWork()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadWork()
})
</script>

<style scoped>
.work-detail {
  min-height: 400px;
}

.detail-header {
  display: flex;
  gap: 24px;
}

.detail-cover {
  width: 200px;
  height: 280px;
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

.episodes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.episode-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.episode-card:hover {
  background: #f0f2f5;
}

.episode-cover {
  width: 100px;
  height: 70px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #e4e7ed;
}

.episode-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.episode-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.episode-info {
  flex: 1;
  min-width: 0;
}

.episode-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.episode-desc {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.episode-meta {
  font-size: 12px;
  color: #c0c4cc;
}

.episode-actions {
  flex-shrink: 0;
}
</style>
