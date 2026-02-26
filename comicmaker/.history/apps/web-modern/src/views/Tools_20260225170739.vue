<template>
  <div class="tools-container">
    <el-container style="height: calc(100vh - 80px);">
      <!-- 左侧工具列表 -->
      <el-aside width="250px" class="tools-sidebar">
        <div class="sidebar-header">AI 工具箱</div>
        <el-menu :default-active="currentToolId" @select="handleToolSelect" class="tool-menu">
          <el-menu-item v-for="tool in TOOLS" :key="tool.id" :index="tool.id">
            <template #title>
              <span class="tool-icon">{{ tool.icon }}</span>
              <span>{{ tool.name }}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 中间主区域 -->
      <el-main class="tools-main" v-loading="loading">
        <div v-if="!currentToolId" class="empty-state">
          <el-empty description="请从左侧选择一个工具开始使用" />
        </div>

        <div v-else class="tool-content">
          <div class="tool-header">
            <h3>{{ currentToolName }}</h3>
            <p>{{ currentToolDesc }}</p>
          </div>

          <!-- 表单区域 -->
          <el-card class="tool-form-card" v-if="!result && !isProcessing">
            <el-form :model="formData" label-position="top" ref="formRef">
              <template v-for="field in currentToolFields" :key="field.name">
                
                <!-- 文本域 -->
                <el-form-item v-if="field.type === 'textarea'" :label="field.label" :required="field.required">
                  <el-input 
                    v-model="formData[field.name]" 
                    type="textarea" 
                    :rows="4" 
                    :placeholder="field.placeholder || '请输入...'" 
                  />
                </el-form-item>

                <!-- 下拉框 -->
                <el-form-item v-else-if="field.type === 'select'" :label="field.label" :required="field.required">
                  <el-select v-model="formData[field.name]" placeholder="请选择">
                    <el-option 
                      v-for="opt in field.options" 
                      :key="opt" 
                      :label="opt" 
                      :value="opt" 
                    />
                  </el-select>
                </el-form-item>

                <!-- 数字输入 -->
                <el-form-item v-else-if="field.type === 'number'" :label="field.label" :required="field.required">
                  <el-input-number 
                    v-model="formData[field.name]" 
                    :min="field.min" 
                    :max="field.max" 
                  />
                </el-form-item>

                <!-- 文件上传 -->
                <el-form-item v-else-if="field.type === 'file'" :label="field.label" :required="field.required">
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :limit="field.multiple ? (field.maxCount || 10) : 1"
                    :multiple="field.multiple"
                    :on-change="(file, fileList) => handleFileChange(field.name, file, fileList)"
                    :on-remove="(file, fileList) => handleFileRemove(field.name, file, fileList)"
                    list-type="picture-card"
                    :file-list="fileLists[field.name] || []"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </el-form-item>

                <!-- 复选框 -->
                <el-form-item v-else-if="field.type === 'checkbox'">
                  <el-checkbox v-model="formData[field.name]">{{ field.label }}</el-checkbox>
                </el-form-item>

              </template>

              <el-form-item>
                <el-button type="primary" @click="submitTask" :loading="isProcessing" style="width: 100%;">开始生成</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 任务进度 -->
          <el-card v-if="isProcessing" class="status-card">
            <el-progress type="circle" :percentage="progress" :status="progressStatus" />
            <div class="status-text">{{ statusMessage }}</div>
            <el-button v-if="taskFailed" type="danger" @click="resetForm">重试</el-button>
          </el-card>

          <!-- 结果展示 -->
          <div v-if="result" class="result-area">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>生成结果</span>
                  <el-button type="text" @click="resetForm">返回编辑</el-button>
                </div>
              </template>
              
              <!-- 文本结果 -->
              <div v-if="result.text" class="result-text">
                <pre>{{ result.text }}</pre>
              </div>

              <!-- 图片结果 -->
              <div v-if="result.image_url" class="result-media">
                <el-image 
                  :src="result.image_url" 
                  fit="contain" 
                  :preview-src-list="[result.image_url]" 
                />
              </div>

              <!-- 视频结果 -->
              <div v-if="result.video_url" class="result-media">
                <video :src="result.video_url" controls style="max-width: 100%;"></video>
              </div>
              
              <!-- 音频结果 -->
              <div v-if="result.audio_url" class="result-media">
                <audio :src="result.audio_url" controls></audio>
              </div>

              <!-- 调试或复杂JSON -->
              <div v-if="result.raw" class="result-json">
                <el-collapse>
                  <el-collapse-item title="完整数据">
                    <pre>{{ JSON.stringify(result.raw, null, 2) }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </el-card>
          </div>
        </div>
      </el-main>

      <!-- 右侧历史记录 -->
      <el-aside width="300px" class="history-sidebar">
        <div class="sidebar-header">
          <span>历史记录</span>
          <el-button type="text" size="small" @click="loadHistory">刷新</el-button>
        </div>
        <div class="history-list">
          <el-empty v-if="historyList.length === 0" description="暂无历史" image-size="60" />
          <el-card 
            v-for="item in historyList" 
            :key="item.record_id" 
            class="history-card" 
            shadow="hover"
            @click="viewHistory(item)"
          >
            <div class="history-item-header">
              <span class="history-tool-name">{{ getToolName(item.tool_type) }}</span>
              <span class="history-date">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="history-preview">
                <!-- 简单预览逻辑 -->
                <div v-if="item.output && (item.output.image_path || item.output.url)" class="preview-thumb">
                    <el-image :src="getAssetUrl(item.output.url || item.output.image_path)" fit="cover" class="thumb-img" />
                </div>
                <div v-else-if="item.input && item.input.prompt" class="preview-text">
                    {{ item.input.prompt.substring(0, 50) }}...
                </div>
            </div>
            <div class="history-actions">
                <el-tag size="small" :type="item.status === 'success' ? 'success' : 'danger'">{{ item.status }}</el-tag>
            </div>
          </el-card>
        </div>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { API } from '../api/client';
import { ElMessage, type UploadFile, type UploadFiles } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// --- 常量定义 (Ported from tools.js) ---
const TOOLS = [
    { id: 'generate_script', name: '生成剧本', description: '根据文本描述生成详细剧本文本', icon: '📝' },
    { id: 'generate_single_shot_storyboard', name: '生成单镜头分镜脚本', description: '根据剧本文本、预期时长和关联素材生成单镜头分镜脚本', icon: '🎬' },
    { id: 'generate_shot_prompts', name: '生成分镜提示词', description: '根据关联素材、分镜描述和预期时长生成5个提示词', icon: '📝' },
    { id: 'image_to_description', name: '图生描述', description: '根据图片生成描述文本', icon: '🖼️' },
    { id: 'image_to_style_description', name: '图生风格描述', description: '根据图片生成风格描述文本', icon: '🎨' },
    { id: 'text_to_image', name: '文生图', description: '根据文字描述生成图片', icon: '🎨' },
    { id: 'image_to_image', name: '图生图', description: '根据参考图片和文字描述生成图片', icon: '🖼️' },
    { id: 'vidu_ref_image_to_video', name: 'vidu参考生视频', description: '使用 vidu 模型根据参考图片和文字描述生成视频', icon: '🎞️' },
    { id: 'sora_image_to_video', name: 'sora生视频', description: '使用 sora 模型根据图片和文字描述生成视频', icon: '🎬' },
    { id: 'wan_image_to_video', name: 'wan图生视频', description: '使用 wan 模型根据图片和文字描述生成视频', icon: '🎥' },
    { id: 'keyframe_to_video', name: '首尾帧生视频', description: '根据首尾帧图片和文字描述生成视频', icon: '🎬' },
    { id: 'text_to_audio', name: '生音频', description: '根据文字描述生成音频', icon: '🔊' }
];

const TOOL_FIELDS: any = {
    generate_script: [
        { name: 'description', label: '文本描述', type: 'textarea', required: true }
    ],
    generate_single_shot_storyboard: [
        { name: 'script', label: '剧本文本', type: 'textarea', required: true },
        { name: 'expected_duration', label: '预期时长（秒）', type: 'number', min: 1, max: 600, default: 60, required: true },
        { name: 'shot_duration', label: '单镜头预计时间（秒）', type: 'select', options: ['1', '2', '3', '4', '5', '6'], default: '5', required: true }
    ],
    image_to_description: [
        { name: 'image', label: '上传图片', type: 'file', accept: 'image/*', required: true },
        { name: 'material_type', label: '类型', type: 'select', options: ['人物', '场景', '道具', '其他'], required: true }
    ],
    image_to_style_description: [
        { name: 'image', label: '上传图片', type: 'file', accept: 'image/*', required: true },
        { name: 'description', label: '额外描述（可选）', type: 'textarea', required: false }
    ],
    text_to_image: [
        { name: 'prompt', label: '文字描述', type: 'textarea', required: true },
        { name: 'material_type', label: '类型', type: 'select', options: ['人物', '场景', '道具', '其他'], required: true },
        { name: 'model', label: '模型', type: 'select', options: ['seedream4.5', 'wan2.6', 'nanopro'], default: 'seedream4.5', required: true },
        { name: 'aspect_ratio', label: '比例', type: 'select', options: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '16:9', required: true },
        { name: 'resolution', label: '分辨率', type: 'select', options: ['1k', '2k'], default: '1k', required: true }
    ],
    image_to_image: [
        { name: 'prompt', label: '文字描述', type: 'textarea', required: true },
        { name: 'images', label: '上传图片（可多张）', type: 'file', accept: 'image/*', multiple: true, required: true },
        { name: 'model', label: '模型', type: 'select', options: ['seedream4.5', 'wan2.6', 'nanopro'], default: 'seedream4.5', required: true },
        { name: 'aspect_ratio', label: '比例', type: 'select', options: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '16:9', required: true },
        { name: 'resolution', label: '分辨率', type: 'select', options: ['1k', '2k'], default: '1k', required: true }
    ],
    vidu_ref_image_to_video: [
        { name: 'prompt', label: '文字描述', type: 'textarea', required: true },
        { name: 'images', label: '上传图片（最多7张）', type: 'file', accept: 'image/*', multiple: true, required: true },
        { name: 'aspect_ratio', label: '比例', type: 'select', options: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '16:9', required: true },
        { name: 'resolution', label: '分辨率', type: 'select', options: ['540p', '720p', '1080p'], default: '720p', required: true },
        { name: 'duration', label: '时长（秒）', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], default: '5', required: true }
    ],
    sora_image_to_video: [
        { name: 'prompt', label: '文字描述', type: 'textarea', required: true },
        { name: 'image', label: '上传图片', type: 'file', accept: 'image/*', required: true },
        { name: 'duration', label: '时长', type: 'select', options: ['4', '8', '12'], default: '4', required: true }
    ],
    wan_image_to_video: [
        { name: 'prompt', label: '文字描述', type: 'textarea', required: true },
        { name: 'image', label: '上传图片', type: 'file', accept: 'image/*', required: true },
        { name: 'model', label: '模型版本', type: 'select', options: ['wan2.5', 'wan2.6'], default: 'wan2.6', required: true },
        { name: 'resolution', label: '分辨率', type: 'select', options: ['480p', '720p', '1080p'], default: '720p', required: true },
        { name: 'duration', label: '时长（秒）', type: 'select', options: ['3', '4', '5', '6', '7', '8', '9', '10'], default: '5', required: true },
        { name: 'shot_type', label: '镜头类型', type: 'select', options: ['single', 'multi'], default: 'single', required: false },
        { name: 'enable_audio', label: '生成音频', type: 'checkbox', default: false }
    ],
    keyframe_to_video: [
        { name: 'start_frame', label: '首帧图片', type: 'file', accept: 'image/*', required: true },
        { name: 'end_frame', label: '尾帧图片', type: 'file', accept: 'image/*', required: true },
        { name: 'prompt', label: '文字描述', type: 'textarea', required: true },
        { name: 'aspect_ratio', label: '分辨率', type: 'select', options: ['9:16', '16:9', '4:3', '3:4'], required: true },
        { name: 'duration', label: '时长（秒）', type: 'number', min: 1, max: 60, required: true }
    ],
    text_to_audio: [
        { name: 'text', label: '文字描述', type: 'textarea', required: true },
        { name: 'duration', label: '时长（秒）', type: 'number', min: 1, max: 60, required: true }
    ],
    generate_shot_prompts: [
        { name: 'shot_description', label: '分镜描述', type: 'textarea', required: true },
        { name: 'duration', label: '预期时长（秒）', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], default: '5', required: true }
    ]
};

// --- State ---
const loading = ref(false);
const currentToolId = ref('');
const formData = reactive<any>({});
const fileLists = reactive<Record<string, UploadFile[]>>({});

const isProcessing = ref(false);
const progress = ref(0);
const statusMessage = ref('');
const taskFailed = ref(false);
const result = ref<any>(null);

const historyList = ref<any[]>([]);
let pollTimer: any = null;

// --- Computeds ---
const currentToolName = computed(() => {
    return TOOLS.find(t => t.id === currentToolId.value)?.name || '';
});
const currentToolDesc = computed(() => {
    return TOOLS.find(t => t.id === currentToolId.value)?.description || '';
});
const currentToolFields = computed(() => {
    return TOOL_FIELDS[currentToolId.value] || [];
});
const progressStatus = computed(() => {
    if (taskFailed.value) return 'exception';
    if (progress.value === 100) return 'success';
    return '';
});

// --- Methods ---
const handleToolSelect = (index: string) => {
    currentToolId.value = index;
    resetForm();
    initFormData();
};

const initFormData = () => {
    // Reset formData
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.keys(fileLists).forEach(key => delete fileLists[key]);

    // Set defaults
    currentToolFields.value.forEach((field: any) => {
        if (field.default !== undefined) {
            formData[field.name] = field.default;
        } else {
            formData[field.name] = ''; // default empty
        }
        if (field.type === 'file') {
            fileLists[field.name] = [];
            formData[field.name] = null; // file fields need explicit null
        }
    });
};

const handleFileChange = (fieldName: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    fileLists[fieldName] = uploadFiles as UploadFile[];
    // For single file, just take the raw file
    // For multiple, we handle it in submit
    formData[fieldName] = uploadFiles; // Store the array reference
};

const handleFileRemove = (fieldName: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    fileLists[fieldName] = uploadFiles as UploadFile[];
    formData[fieldName] = uploadFiles;
};

const submitTask = async () => {
    isProcessing.value = true;
    progress.value = 0;
    statusMessage.value = '提交任务中...';
    taskFailed.value = false;
    result.value = null;

    try {
        const payload = new FormData();
        
        // Append all fields
        for (const field of currentToolFields.value) {
            const val = formData[field.name];
            
            if (field.type === 'file') {
                const files = fileLists[field.name];
                if (files && files.length > 0) {
                    if (field.multiple) {
                        files.forEach((f: any) => {
                            // 注意：后端可能期望同一个 key 多次 append
                            payload.append(field.name, f.raw);
                        });
                    } else {
                         payload.append(field.name, files[0].raw as Blob);
                    }
                }
            } else {
                if (val !== null && val !== undefined) {
                    payload.append(field.name, val);
                }
            }
        }

        const res = await API.createToolTask(currentToolId.value, payload);
        const taskId = res.task_id;
        
        // Start polling
        startPolling(taskId);
    } catch (e: any) {
        ElMessage.error(e.message || '任务创建失败');
        isProcessing.value = false;
    }
};

const startPolling = (taskId: string) => {
    let pollCount = 0;
    const maxPolls = 300; // 10 mins

    const poll = async () => {
        if (pollCount > maxPolls) {
            statusMessage.value = '任务超时';
            taskFailed.value = true;
            return;
        }

        try {
            const status = await API.getTaskStatus(taskId);
            
            if (status.status === 'pending' || status.status === 'processing') {
                progress.value = Math.min(95, progress.value + 5);
                statusMessage.value = '正在处理中...';
                pollTimer = setTimeout(poll, 2000);
            } else if (status.status === 'success') {
                progress.value = 100;
                statusMessage.value = '任务完成';
                const res = await API.getTaskResult(taskId);
                processResult(res);
                isProcessing.value = false; // Stop loading view
                loadHistory(); // Refresh history
            } else {
                statusMessage.value = `任务失败: ${status.error || '未知错误'}`;
                taskFailed.value = true;
            }
        } catch (e) {
            console.error(e);
            pollTimer = setTimeout(poll, 3000); // Retry on network error
        }
        pollCount++;
    };

    poll();
};

const processResult = (res: any) => {
    // Adapt result for display
    const out: any = { raw: res.output };
    
    if (res.output.text) out.text = res.output.text;
    if (res.output.description) out.text = res.output.description;
    
    // Normalizing media URLs
    if (res.output.image_path) out.image_url = getAssetUrl(res.output.image_path);
    if (res.output.url) {
        // Guess type from URL or context?
        // simple heuristic
        if (res.output.url.match(/\.(jpg|png|jpeg|webp)$/i)) out.image_url = getAssetUrl(res.output.url);
        else if (res.output.url.match(/\.(mp4|mov)$/i)) out.video_url = getAssetUrl(res.output.url);
        else if (res.output.url.match(/\.(mp3|wav)$/i)) out.audio_url = getAssetUrl(res.output.url);
    }
    
    // Explicit fields
    if (res.output.video_url) out.video_url = getAssetUrl(res.output.video_url);
    if (res.output.video_path) out.video_url = getAssetUrl(res.output.video_path);
    if (res.output.audio_path) out.audio_url = getAssetUrl(res.output.audio_path);

    result.value = out;
};

const getAssetUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Assume backend proxy at /api is for API, but static files might need check
    // Original code used `http://localhost:8000${url}`
    // With vite proxy, we might need a specific prefix or just direct path if it's relative
    return path.startsWith('/') ? path : `/${path}`;
};

const resetForm = () => {
    isProcessing.value = false;
    result.value = null;
    taskFailed.value = false;
    progress.value = 0;
};

const loadHistory = async () => {
    try {
        const res = await API.listHistory();
        historyList.value = res.records || [];
    } catch (e) {
        console.error(e);
    }
};

const viewHistory = (item: any) => {
    // When clicking history, load it as result?
    // Or just show details. For now let's reuse result view logic
    processResult({ output: item.output });
};

const getToolName = (id: string) => {
    return TOOLS.find(t => t.id === id)?.name || id;
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
};

onMounted(() => {
    loadHistory();
});

onUnmounted(() => {
    if (pollTimer) clearTimeout(pollTimer);
});

</script>

<style scoped>
.tools-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.tools-sidebar, .history-sidebar {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  border-left: 1px solid #e6e6e6; /* for history sidebar */
  overflow-y: auto;
}

.sidebar-header {
  padding: 15px;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-menu {
  border-right: none;
}

.tool-icon {
  margin-right: 10px;
  font-size: 18px;
}

.tools-main {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
}

.tool-header h3 {
  margin-top: 0;
}
.tool-header p {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.tool-form-card {
  max-width: 800px;
  margin: 0 auto;
}

.status-card {
  max-width: 600px;
  margin: 20px auto;
  text-align: center;
  padding: 40px;
}
.status-text {
  margin-top: 20px;
  color: #666;
}

.result-area {
  margin-top: 30px;
}

.result-text pre {
  background: #f4f4f5;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-media {
  margin-top: 20px;
  text-align: center;
}
.result-media img, .result-media video {
  max-width: 100%;
  max-height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.history-card {
  margin: 10px;
  cursor: pointer;
}
.history-item-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}
.history-tool-name {
  font-weight: bold;
  color: #333;
}
.history-preview {
  margin: 5px 0;
}
.thumb-img {
  width: 100%;
  height: 100px;
  border-radius: 4px;
}
.preview-text {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
