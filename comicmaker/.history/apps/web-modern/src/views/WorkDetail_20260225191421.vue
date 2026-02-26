<template>
  <div class="work-detail-container" v-loading="loading">
    <div v-if="work" class="work-header">
      <el-page-header @back="goBack" :content="work.name">
        <template #extra>
          <el-button type="primary" @click="dialogVisible = true">创建新剧集</el-button>
          <el-button type="info" @click="editWork">编辑作品信息</el-button>
          <el-button type="danger" @click="deleteWork">删除作品</el-button>
        </template>
      </el-page-header>
      <div class="work-desc">{{ work.description || '暂无描述' }}</div>
    </div>

    <div class="episodes-section">
      <h3>剧集列表</h3>
      <el-empty v-if="episodes.length === 0" description="暂无剧集，点击右上方按钮创建" />
      
      <div v-else class="episode-list">
        <el-card 
          v-for="episode in episodes" 
          :key="episode.id" 
          class="episode-card" 
          @click="goToEpisode(episode.id)"
        >
          <div class="episode-content">
            <h4 class="episode-title">{{ episode.name }}</h4>
            <el-tag :type="getStatusType(episode.status)" size="small">
              {{ getStatusText(episode.status) }}
            </el-tag>
          </div>
          <div class="episode-actions">
            <!-- 直接在这个 card 上点击也可以进入，但为了防止误触，提供明确按钮 -->
            <el-button link type="primary" @click.stop="goToEpisode(episode.id)">编辑</el-button>
            <el-button link type="danger" @click.stop="deleteEpisode(episode)">删除</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 创建剧集弹窗 -->
    <el-dialog v-model="dialogVisible" title="创建新剧集" width="30%">
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '请输入名称' }]">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createEpisode" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { API, type Work, type Episode } from '../api/client';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const workId = route.params.id as string;

const loading = ref(false);
const work = ref<Work | null>(null);
const episodes = ref<Episode[]>([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const form = ref({ name: '', description: '' });

const loadData = async () => {
  loading.value = true;
  try {
    const [workRes, episodesRes] = await Promise.all([
      API.getWork(workId),
      API.listEpisodes(workId)
    ]);
    work.value = workRes;
    episodes.value = episodesRes.episodes || [];
  } catch (error: any) {
    ElMessage.error(error.message || '加载详情失败');
  } finally {
    loading.value = false;
  }
};

const goBack = () => router.push('/works');

const editWork = () => {
  // TODO: 实现编辑作品信息的逻辑，或者重用 Works.vue 的弹窗 component
  ElMessage.info('功能开发中');
};

const deleteWork = () => {
   ElMessageBox.confirm('确定要删除作品吗？', '警告', { type: 'warning' })
    .then(async () => {
      await API.deleteWork(workId);
      ElMessage.success('删除成功');
      router.push('/works');
    });
};

const createEpisode = async () => {
  if (!form.value.name) return;
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('description', form.value.description);
    await API.createEpisode(workId, formData);
    ElMessage.success('创建成功');
    dialogVisible.value = false;
    form.value = { name: '', description: '' };
    loadData();
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败');
  } finally {
    submitting.value = false;
  }
};

const deleteEpisode = (ep: Episode) => {
  ElMessageBox.confirm(`确定要删除剧集 "${ep.name}" 吗？`, '警告', { type: 'warning' })
    .then(async () => {
      await API.deleteEpisode(workId, ep.id);
      ElMessage.success('删除成功');
      loadData();
    });
};

const goToEpisode = (episodeId: string) => {
  router.push(`/works/${workId}/episodes/${episodeId}`);
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'draft': '草稿',
    'script_generated': '剧本已生成',
    'storyboard_generated': '分镜已生成',
    'completed': '已完成'
  };
  return map[status] || status || '未知';
};

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    'draft': 'info',
    'script_generated': 'warning',
    'storyboard_generated': 'primary',
    'completed': 'success'
  };
  return map[status] || '';
};

onMounted(() => {
  if (workId) loadData();
});
</script>

<style scoped>
.work-header {
  margin-bottom: 30px;
  background: var(--bg-glass);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
}
.work-desc {
  margin-top: 15px;
  color: var(--text-secondary);
  font-size: 14px;
}
.episodes-section {
  background: var(--bg-glass);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.episode-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 20px;
}
.episode-card {
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
}
.episode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border-color: var(--accent-color);
}
.episode-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.episode-title {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.episode-actions {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  text-align: right;
}
</style>
