<template>
  <div class="episode-edit-container" v-loading="loading">
    <div class="edit-header">
      <div class="breadcrumb">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/works' }">作品列表</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: `/works/${workId}` }">{{ workName }}</el-breadcrumb-item>
          <el-breadcrumb-item>编辑剧集: {{ episodeName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-actions">
        <el-button @click="saveAll">保存所有更改</el-button>
        <el-button type="primary" @click="handlePreview">预览视频</el-button>
      </div>
    </div>

    <el-row :gutter="20" class="main-content">
      <!-- 左侧：剧本编辑区域 -->
      <el-col :span="8" class="left-panel">
        <el-card class="box-card script-card">
          <template #header>
            <div class="card-header">
              <span>剧本</span>
              <el-button type="primary" link @click="saveScript">保存剧本</el-button>
            </div>
          </template>
          <el-form label-position="top">
             <el-form-item label="剧本内容">
                <el-input
                  v-model="scriptValues.content"
                  type="textarea"
                  :rows="15"
                  placeholder="输入剧本内容..."
                />
             </el-form-item>
             <el-form-item label="预期时长(秒)">
                <el-input-number v-model="scriptValues.duration" :min="1" />
             </el-form-item>
             <el-button type="success" :loading="generatingStoryboard" @click="generateStoryboard" style="width: 100%; margin-top: 10px;">
                生成分镜表
             </el-button>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：分镜列表区域 -->
      <el-col :span="16" class="right-panel">
        <div class="shots-container">
          <div v-if="shots.length === 0" class="empty-shots">
            <el-empty description="暂无分镜，请先编写剧本并生成分镜表" />
          </div>
          <div v-else>
            <el-collapse v-model="activeShotNames">
              <el-collapse-item v-for="(shot, index) in shots" :key="shot.id" :name="shot.id">
                <template #title>
                  <div class="shot-header">
                    <span class="shot-index">镜头 {{ index + 1 }}</span>
                    <span class="shot-desc">{{ shot.description ? shot.description.substring(0, 30) + '...' : '无描述' }}</span>
                    <span class="shot-duration">{{ shot.duration }}s</span>
                  </div>
                </template>
                
                <div class="shot-content">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form label-position="top" size="small">
                                <el-form-item label="画面描述 (Image Prompt)">
                                    <el-input type="textarea" v-model="shot.image_prompt" :rows="3" />
                                </el-form-item>
                                <el-form-item label="视频提示词 (Video Prompt)">
                                    <el-input type="textarea" v-model="shot.video_prompt" :rows="3" />
                                </el-form-item>
                                <el-form-item label="音频提示词 (Audio Prompt)">
                                    <el-input type="textarea" v-model="shot.audio_prompt" :rows="2" />
                                </el-form-item>
                                <el-form-item label="时长">
                                  <el-input-number v-model="shot.duration" :min="1" :max="60" />
                                </el-form-item>
                                <el-button type="primary" size="small" @click="updateShotApi(shot)">更新提示词</el-button>
                            </el-form>
                        </el-col>
                        <el-col :span="12">
                            <div class="media-preview">
                                <div class="image-box">
                                   <el-image 
                                     v-if="shot.image_url" 
                                     :src="shot.image_url" 
                                     fit="contain" 
                                     class="preview-img"
                                     :preview-src-list="[shot.image_url]"
                                   />
                                   <div v-else class="no-media">无图片</div>
                                   <el-button size="small" @click="generateImage(shot)">生成图片</el-button>
                                </div>
                                <div class="video-box">
                                   <video v-if="shot.video_url" :src="shot.video_url" controls class="preview-video"></video>
                                   <div v-else class="no-media">无视频</div>
                                   <el-button size="small" @click="generateVideo(shot)">生成视频</el-button>
                                </div>
                                <div class="audio-box">
                                    <audio v-if="shot.audio_url" :src="shot.audio_url" controls class="preview-audio"></audio>
                                    <div v-else class="no-media">无音频</div>
                                    <el-button size="small" @click="generateAudio(shot)">生成音频</el-button>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>

              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { API, type Episode } from '../api/client';
import { ElMessage } from 'element-plus';

const route = useRoute();
const workId = route.params.workId as string;
const episodeId = route.params.episodeId as string;

const loading = ref(false);
const workName = ref('');
const episodeName = ref('');
const scriptValues = reactive({
    content: '',
    duration: 60
});
const shots = ref<any[]>([]);
const activeShotNames = ref<string[]>([]);
const generatingStoryboard = ref(false);

const loadData = async () => {
    loading.value = true;
    try {
        const work = await API.getWork(workId);
        workName.value = work.name;
        
        const episode: Episode = await API.getEpisode(workId, episodeId);
        episodeName.value = episode.name;

        // Load Script
        try {
            const scriptData = await API.getScript(workId, episodeId);
            if (scriptData) {
                scriptValues.content = scriptData.script || '';
                scriptValues.duration = scriptData.expected_duration || 60;
            }
        } catch (e) {
            console.log('No script found yet');
        }

        // Load Storyboard
        loadStoryboard();

    } catch (e: any) {
        ElMessage.error('Failed to load data: ' + e.message);
    } finally {
        loading.value = false;
    }
};

const loadStoryboard = async () => {
    try {
        const storyboardData = await API.getStoryboard(workId, episodeId);
        if (storyboardData && storyboardData.shots) {
            shots.value = storyboardData.shots.map((shot: any) => ({
                ...shot,
                // Ensure URLs are absolute if needed, or rely on proxy
                image_url: shot.image ? `/data/works/${workId}/episodes/${episodeId}/images/${shot.image}` : '',
                video_url: shot.video ? `/data/works/${workId}/episodes/${episodeId}/videos/${shot.video}` : '',
                audio_url: shot.audio ? `/data/works/${workId}/episodes/${episodeId}/audio/${shot.audio}` : ''
            }));
        }
    } catch (e) {
        console.log('No storyboard found yet');
    }
};

const saveScript = async () => {
    try {
        await API.saveScript(workId, episodeId, scriptValues.content, scriptValues.duration);
        ElMessage.success('Script saved');
    } catch (e: any) {
        ElMessage.error('Failed to save script: ' + e.message);
    }
};

const generateStoryboard = async () => {
    if (!scriptValues.content) return ElMessage.warning('Please enter script content');
    generatingStoryboard.value = true;
    try {
        await saveScript(); // Ensure script is saved first
        const res = await API.generateStoryboard(workId, episodeId, scriptValues.content);
        ElMessage.success('Storyboard generated');
        loadStoryboard();
    } catch (e: any) {
        ElMessage.error('Generation failed: ' + e.message);
    } finally {
        generatingStoryboard.value = false;
    }
};

const updateShotApi = async (shot: any) => {
    try {
        await API.updateShot(workId, episodeId, shot.id, {
            image_prompt: shot.image_prompt,
            video_prompt: shot.video_prompt,
            audio_prompt: shot.audio_prompt,
            duration: shot.duration
        });
        ElMessage.success('Shot updated');
    } catch (e: any) {
        ElMessage.error('Update failed: ' + e.message);
    }
};

const generateImage = async (shot: any) => {
    try {
        ElMessage.info('Generating image...');
        await API.generateImages(workId, episodeId, shot.id, shot.image_prompt);
        // Reload to get new URL
        // Actually, we might need polling or just waiting for response if it returns the path
        // For now, let's reload storyboard to refresh
        setTimeout(loadStoryboard, 2000); 
    } catch (e: any) {
        ElMessage.error('Failed: ' + e.message);
    }
};

const generateVideo = async (shot: any) => {
    try {
        ElMessage.info('Generating video (this may take a while)...');
        await API.generateVideo(workId, episodeId, shot.id, shot.video_prompt);
        setTimeout(loadStoryboard, 5000);
    } catch (e: any) {
        ElMessage.error('Failed: ' + e.message);
    }
};

const generateAudio = async (shot: any) => {
    try {
        ElMessage.info('Generating audio...');
        await API.generateAudio(workId, episodeId, shot.id, shot.audio_prompt || shot.dialogue); // fallback to dialogue
        setTimeout(loadStoryboard, 2000);
    } catch (e: any) {
        ElMessage.error('Failed: ' + e.message);
    }
};

const saveAll = () => {
    // Implement bulk save if needed
    saveScript();
    shots.value.forEach(shot => updateShotApi(shot));
};

const handlePreview = () => {
    ElMessage.info('Preview not implemented in this version yet');
};

onMounted(loadData);
</script>

<style scoped>
.episode-edit-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
}
.edit-header {
    padding: 10px 20px;
    background: #fff;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.main-content {
    flex: 1;
    padding: 20px;
    overflow: hidden;
    height: calc(100vh - 60px); 
}
.left-panel, .right-panel {
    height: 100%;
    overflow-y: auto;
}
.script-card {
    height: 100%;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.shot-header {
    display: flex;
    gap: 15px;
    width: 100%;
    align-items: center;
}
.shot-index { font-weight: bold; }
.shot-desc { color: #666; font-size: 0.9em; flex: 1; }
.shot-content { padding: 10px; }
.media-preview {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.image-box, .video-box, .audio-box {
    border: 1px solid #eee;
    padding: 5px;
    text-align: center;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.preview-img, .preview-video {
    max-width: 100%;
    max-height: 200px;
    margin-bottom: 5px;
}
.no-media {
    color: #ccc;
    margin-bottom: 5px;
}
</style>
