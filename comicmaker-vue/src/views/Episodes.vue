<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <div>
          <el-button text @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="page-title">剧集列表</span>
        </div>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建剧集
        </el-button>
      </div>

      <div v-loading="loading" class="episodes-content">
        <div v-if="episodes.length" class="episodes-grid">
          <div
            v-for="episode in episodes"
            :key="episode.id"
            class="episode-card"
            @click="goToDetail(episode.id)"
          >
            <div class="episode-cover">
              <img v-if="episode.cover" :src="episode.cover" alt="封面" />
              <div v-else class="episode-cover-placeholder">
                <el-icon :size="32" color="#c0c4cc"><Files /></el-icon>
              </div>
            </div>
            <div class="episode-info">
              <h3 class="episode-title">{{ episode.name }}</h3>
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
                    <el-dropdown-item @click="goToDetail(episode.id)">查看详情</el-dropdown-item>
                    <el-dropdown-item @click="goToEdit(episode.id)">编辑</el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(episode)" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" class="empty-state">
          <el-icon :size="48"><Files /></el-icon>
          <p>暂无剧集</p>
          <el-button type="primary" @click="handleCreate">创建第一个剧集</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Files, MoreFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const episodes = ref<any[]>([])
const workId = ref(route.params.workId || route.query.workId || '')

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadEpisodes = async () => {
  loading.value = true
  try {
    // 模拟数据
    episodes.value = [
      {
        id: '1',
        name: '第一集 开始的相遇',
        description: '主角与反派的第一次相遇，故事由此展开...',
        cover: '',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '第二集 秘密的线索',
        description: '主角发现了隐藏在背后的秘密...',
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

const goBack = () => {
  router.back()
}

const goToDetail = (id: string) => {
  router.push(`/episodes/${id}`)
}

const goToEdit = (id: string) => {
  router.push(`/episodes/${id}/edit`)
}

const handleCreate = () => {
  router.push(`/episodes/new?workId=${workId.value}`)
}

const handleDelete = async (episode: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除剧集「${episode.name}」吗？`,
      '删除确认',
      { type: 'warning' }
    )
    ElMessage.success('删除成功')
    loadEpisodes()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadEpisodes()
})
</script>

<style scoped>
.page-title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.episodes-content {
  min-height: 300px;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.episode-card {
  position: relative;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.episode-cover {
  width: 100px;
  height: 70px;
  border-radius: 6px;
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
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
