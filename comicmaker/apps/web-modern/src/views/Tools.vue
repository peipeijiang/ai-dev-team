<template>
  <div class="common-layout tools-page">
    <div class="tools-container">
      <!-- Left Sidebar: Tool List -->
      <aside class="tools-sidebar">
        <div class="sidebar-header">
          <h2>AI Workbench</h2>
        </div>
        <el-scrollbar>
          <div class="tool-list">
            <div 
              v-for="tool in TOOLS" 
              :key="tool.id" 
              class="tool-item" 
              :class="{ active: currentToolId === tool.id }"
              @click="handleToolSelect(tool.id)"
            >
              <span class="tool-icon">{{ tool.icon }}</span>
              <div class="tool-info">
                <span class="tool-name">{{ tool.name }}</span>
                <span class="tool-desc" :title="tool.description">{{ tool.description }}</span>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </aside>

      <!-- Main Workspace -->
      <main class="tools-workspace">
        <!-- Empty State -->
        <div v-if="!currentToolId" class="empty-state">
          <div class="empty-content glass-panel">
            <el-icon :size="64" class="empty-icon"><VideoPlay /></el-icon>
            <h3>Select a tool to start creating</h3>
            <p>Choose from our suite of AI generation models on the left</p>
          </div>
        </div>

        <!-- Tool Content -->
        <div v-else class="workspace-content">
          <!-- Configuration Panel -->
          <div class="config-panel glass-panel">
            <div class="panel-header">
              <div class="header-left">
                <h3>{{ currentToolName }}</h3>
                <el-tag size="small" effect="plain" class="ml-2">{{ currentToolDesc }}</el-tag>
              </div>
              <el-button type="primary" link @click="toggleHistory">
                <el-icon class="mr-1"><Clock /></el-icon> History
              </el-button>
            </div>

            <div class="form-scroll-area">
              <el-form label-position="top" :model="formData" class="tool-form" @submit.prevent>
                <template v-for="field in currentToolFields" :key="field.name">
                  <el-form-item 
                    v-if="shouldShowField(field)" 
                    :label="field.label" 
                    :required="field.required"
                    class="custom-form-item"
                  >
                    <!-- Textarea -->
                    <el-input 
                      v-if="field.type === 'textarea'"
                      v-model="formData[field.name]"
                      type="textarea"
                      :rows="4"
                      resize="vertical"
                      :placeholder="field.placeholder || 'Enter content...'"
                    />

                    <!-- Select -->
                    <el-select 
                      v-else-if="field.type === 'select'" 
                      v-model="formData[field.name]" 
                      class="full-width"
                      placeholder="Select option"
                    >
                      <el-option 
                        v-for="opt in field.options" 
                        :key="opt" 
                        :label="opt" 
                        :value="opt" 
                      />
                    </el-select>

                    <!-- Number -->
                    <el-input-number 
                      v-else-if="field.type === 'number'"
                      v-model="formData[field.name]"
                      :min="field.min"
                      :max="field.max"
                      controls-position="right"
                      class="full-width"
                    />

                    <!-- Checkbox -->
                    <el-checkbox 
                      v-else-if="field.type === 'checkbox'"
                      v-model="formData[field.name]"
                      border
                      class="full-width"
                    >
                      {{ field.label }}
                    </el-checkbox>

                    <!-- File Upload -->
                    <div v-else-if="field.type === 'file'" class="upload-wrapper">
                      <el-upload
                        class="upload-area"
                        drag
                        action="#"
                        :auto-upload="false"
                        :on-change="(file, files) => handleFileChange(field.name, file, files)"
                        :on-remove="(file, files) => handleFileRemove(field.name, file, files)"
                        :multiple="field.multiple"
                        :limit="field.limit || (field.multiple ? 10 : 1)"
                        :file-list="fileLists[field.name]"
                        list-type="picture-card"
                      >
                        <el-icon class="el-icon--upload"><Plus /></el-icon>
                        <div class="el-upload__text">Drop file or <em>click</em></div>
                      </el-upload>
                      
                      <div class="asset-selector-link">
                        <el-button size="small" type="primary" plain @click="openMaterialSelector(field.name, field.multiple)">
                          <el-icon class="mr-1"><Picture /></el-icon> Select from Library
                        </el-button>
                      </div>
                    </div>
                  </el-form-item>
                </template>

                <!-- Extra Material Sections -->
                <div v-if="currentToolId === 'generate_shot_prompts'" class="extra-material-section">
                  <h4>Reference Materials (Optional)</h4>
                  <div class="material-selection-box">
                    <div class="material-list-header">
                      <span>Related Assets</span>
                      <el-button size="small" type="primary" link @click="openMaterialSelectorForList('shot_prompts_materials')">
                        <el-icon><Plus /></el-icon> Add
                      </el-button>
                    </div>
                    <div class="material-tags-container">
                      <transition-group name="list">
                        <div v-for="item in extraMaterials.shot_prompts_materials" :key="item.id" class="material-tag-item">
                          <el-image :src="getAssetUrl(item.cover_image)" fit="cover" class="tag-img" />
                          <span class="tag-name">{{ item.name }}</span>
                          <el-icon class="remove-icon" @click="removeMaterialFromList('shot_prompts_materials', item.id)"><Close /></el-icon>
                        </div>
                      </transition-group>
                      <div v-if="extraMaterials.shot_prompts_materials.length === 0" class="empty-tags">
                        No materials selected
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="currentToolId === 'generate_single_shot_storyboard'" class="extra-material-section">
                  <div class="material-group">
                    <div class="group-header">
                      <h4>Characters (Optional)</h4>
                      <el-button size="small" type="primary" link @click="openMaterialSelectorForList('storyboard_characters', 'character')">
                        <el-icon><Plus /></el-icon> Add
                      </el-button>
                    </div>
                    <div class="material-tags-container">
                      <div v-for="item in extraMaterials.storyboard_characters" :key="item.id" class="material-tag-item">
                        <el-image :src="getAssetUrl(item.cover_image)" fit="cover" class="tag-img" />
                        <span class="tag-name">{{ item.name }}</span>
                        <el-icon class="remove-icon" @click="removeMaterialFromList('storyboard_characters', item.id)"><Close /></el-icon>
                      </div>
                      <div v-if="extraMaterials.storyboard_characters.length === 0" class="empty-tags">None</div>
                    </div>
                  </div>

                  <div class="material-group">
                    <div class="group-header">
                      <h4>Scenes (Optional)</h4>
                      <el-button size="small" type="primary" link @click="openMaterialSelectorForList('storyboard_scenes', 'scene')">
                        <el-icon><Plus /></el-icon> Add
                      </el-button>
                    </div>
                    <div class="material-tags-container">
                      <div v-for="item in extraMaterials.storyboard_scenes" :key="item.id" class="material-tag-item">
                        <el-image :src="getAssetUrl(item.cover_image)" fit="cover" class="tag-img" />
                        <span class="tag-name">{{ item.name }}</span>
                        <el-icon class="remove-icon" @click="removeMaterialFromList('storyboard_scenes', item.id)"><Close /></el-icon>
                      </div>
                      <div v-if="extraMaterials.storyboard_scenes.length === 0" class="empty-tags">None</div>
                    </div>
                  </div>

                  <div class="material-group">
                    <div class="group-header">
                      <h4>Props (Optional)</h4>
                      <el-button size="small" type="primary" link @click="openMaterialSelectorForList('storyboard_props', 'prop')">
                        <el-icon><Plus /></el-icon> Add
                      </el-button>
                    </div>
                    <div class="material-tags-container">
                      <div v-for="item in extraMaterials.storyboard_props" :key="item.id" class="material-tag-item">
                        <el-image :src="getAssetUrl(item.cover_image)" fit="cover" class="tag-img" />
                        <span class="tag-name">{{ item.name }}</span>
                        <el-icon class="remove-icon" @click="removeMaterialFromList('storyboard_props', item.id)"><Close /></el-icon>
                      </div>
                      <div v-if="extraMaterials.storyboard_props.length === 0" class="empty-tags">None</div>
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <el-button type="primary" size="large" @click="submitTask" :loading="isProcessing" class="submit-btn" round>
                    {{ isProcessing ? 'Processing...' : 'Generate Content' }}
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>

          <!-- Result Panel -->
          <div class="result-panel glass-panel">
            <div class="panel-header">
              <h3>Output Result</h3>
              <div class="status-indicator">
                <el-tag v-if="isProcessing" type="warning" effect="dark">Running</el-tag>
                <el-tag v-else-if="result" type="success" effect="dark">Success</el-tag>
                <el-tag v-else-if="taskFailed" type="danger" effect="dark">Failed</el-tag>
                <el-progress 
                  v-if="isProcessing" 
                  :percentage="progress" 
                  :status="taskFailed ? 'exception' : ''"
                  :stroke-width="6"
                  style="width: 120px; margin-left: 15px;"
                />
              </div>
            </div>

            <div class="output-content">
              <!-- Loading -->
              <div v-if="isProcessing && !result" class="processing-state">
                <div class="loading-animation"></div>
                <p class="status-msg">{{ statusMessage }}</p>
              </div>

              <!-- Empty -->
              <div v-else-if="!result && !isProcessing" class="empty-output">
                <el-empty description="Output will appear here" :image-size="120" />
              </div>

              <!-- Result Display -->
              <div v-else-if="result" class="result-display">
                
                <!-- Special: Shot Prompts Result -->
                <div v-if="result.tool_type === 'generate_shot_prompts'" class="shot-prompts-result">
                  <template v-if="result.parsedPrompts">
                    <div class="prompt-box" v-for="(val, key) in result.parsedPrompts" :key="key">
                      <div class="box-header">
                        <span class="label">{{ formatPromptLabel(key) }}</span>
                        <el-button size="small" link @click="copyText(val)">Copy</el-button>
                      </div>
                      <div class="box-content">{{ val || 'N/A' }}</div>
                    </div>
                  </template>
                  <div v-else class="text-preview">
                    <div class="text-content">{{ result.text }}</div>
                  </div>
                </div>

                <!-- Special: Single Shot Storyboard Result -->
                <div v-else-if="result.tool_type === 'generate_single_shot_storyboard'" class="storyboard-result">
                   <div v-if="result.parsedStoryboard">
                      <div v-if="result.parsedStoryboard.related_materials.length" class="sb-section">
                         <h5>Related Materials:</h5>
                         <div class="tag-list">
                           <el-tag v-for="m in result.parsedStoryboard.related_materials" :key="m" size="small">{{ m }}</el-tag>
                         </div>
                      </div>
                      <div class="sb-shots">
                        <div v-for="(shot, idx) in result.parsedStoryboard.shots" :key="idx" class="sb-shot-card">
                           <div class="shot-header">
                             <span class="shot-num">Shot {{ shot.number }}</span>
                             <span class="shot-dur">{{ shot.duration }}s</span>
                           </div>
                           <p class="shot-desc">{{ shot.description }}</p>
                           <div v-if="shot.related_materials.length" class="shot-mats">
                             <span class="label">Materials:</span>
                             <el-tag v-for="m in shot.related_materials" :key="m" size="small" type="info">{{ m }}</el-tag>
                           </div>
                        </div>
                      </div>
                   </div>
                   <div v-else class="text-preview">
                    <div class="text-content">{{ result.text }}</div>
                  </div>
                </div>

                <!-- General Media Results -->
                <div v-else class="general-result">
                    <div v-if="result.image_url" class="media-preview">
                        <div class="preview-header">Generated Image</div>
                        <el-image 
                            :src="result.image_url" 
                            :preview-src-list="[result.image_url]"
                            fit="contain"
                            class="result-img"
                        />
                        <div class="media-actions">
                            <a :href="result.image_url" download target="_blank">
                                <el-button type="primary" plain size="small">Download Image</el-button>
                            </a>
                        </div>
                    </div>

                    <div v-if="result.video_url" class="media-preview">
                        <div class="preview-header">Generated Video</div>
                        <video controls :src="result.video_url" class="result-video"></video>
                        <div class="media-actions">
                            <a :href="result.video_url" download target="_blank">
                                <el-button type="primary" plain size="small">Download Video</el-button>
                            </a>
                        </div>
                    </div>

                    <div v-if="result.audio_url" class="media-preview">
                        <div class="preview-header">Generated Audio</div>
                        <audio controls :src="result.audio_url" class="result-audio"></audio>
                        <div class="media-actions">
                            <a :href="result.audio_url" download target="_blank">
                                <el-button type="primary" plain size="small">Download Audio</el-button>
                            </a>
                        </div>
                    </div>

                    <div v-if="result.text && !result.parsedPrompts && !result.parsedStoryboard" class="text-preview">
                        <div class="preview-header">Generated Text</div>
                        <div class="text-content">{{ result.text }}</div>
                        <el-button size="small" @click="copyText(result.text)" class="mt-2">Copy Text</el-button>
                    </div>
                </div>

                <!-- Raw JSON Toggle -->
                <div class="debug-toggle">
                    <el-button link size="small" type="info" @click="showRaw = !showRaw">
                        {{ showRaw ? 'Hide Raw Output' : 'Show Raw Output' }}
                    </el-button>
                    <pre v-if="showRaw" class="raw-json">{{ result.raw }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- History Drawer -->
      <el-drawer
        v-model="showHistory"
        title="Task History"
        direction="rtl"
        size="380px"
        class="history-drawer"
      >
        <div class="history-list">
          <div 
            v-for="item in historyList" 
            :key="item.id" 
            class="history-item"
            @click="viewHistory(item)"
          >
            <div class="history-main">
              <span class="history-tool">{{ getToolName(item.tool_type || item.tool) }}</span>
              <span class="history-time">{{ formatDate(item.created_at) }}</span>
            </div>
            <el-tag size="small" :type="item.status === 'success' ? 'success' : 'danger'" effect="light">
              {{ item.status || 'Success' }}
            </el-tag>
          </div>
          <el-empty v-if="historyList.length === 0" description="No history found" />
        </div>
      </el-drawer>

      <!-- Material Selector Modal -->
      <MaterialSelector
        v-model="showMaterialSelector"
        :type="selectorType"
        @select="handleMaterialSelected"
      />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { API } from '../api/client';
import { ElMessage, type UploadFile, type UploadFiles, type UploadUserFile } from 'element-plus';
import { Plus, Clock, VideoPlay, Picture, Close, Link } from '@element-plus/icons-vue';
import MaterialSelector from '../components/MaterialSelector.vue';

// --- Tool Definitions (Matching Legacy) ---
const TOOLS = [
    { id: 'generate_script', name: '生成剧本', description: '根据文本描述生成详细剧本文本', icon: '📝' },
    { id: 'generate_single_shot_storyboard', name: '生成单镜头分镜', description: '根据剧本文本、预期时长和关联素材生成单镜头分镜脚本', icon: '🎬' },
    { id: 'generate_shot_prompts', name: '生成分镜提示词', description: '根据关联素材、分镜描述和预期时长生成5个提示词', icon: '💡' },
    { id: 'image_to_description', name: '图生描述', description: '根据图片生成描述文本', icon: '🖼️' },
    { id: 'image_to_style_description', name: '图生风格描述', description: '根据图片生成风格描述文本', icon: '🎨' },
    { id: 'text_to_image', name: '文生图', description: '根据文字描述生成图片', icon: '✨' },
    { id: 'image_to_image', name: '图生图', description: '根据参考图片和文字描述生成图片', icon: '🔄' },
    { id: 'vidu_ref_image_to_video', name: 'Vidu参考生视频', description: '使用 vidu 模型根据参考图片和文字描述生成视频', icon: '🎞️' },
    { id: 'sora_image_to_video', name: 'Sora生视频', description: '使用 sora 模型根据图片和文字描述生成视频', icon: '🎥' },
    { id: 'wan_image_to_video', name: 'Wan图生视频', description: '使用 wan 模型根据图片和文字描述生成视频', icon: '📹' },
    { id: 'keyframe_to_video', name: '首尾帧生视频', description: '根据首尾帧图片和文字描述生成视频', icon: '⏩' },
    { id: 'text_to_audio', name: '生音频', description: '根据文字描述生成音频', icon: '🔊' }
];

const TOOL_FIELDS: any = {
    generate_script: [
        { name: 'description', label: '文本描述', type: 'textarea', required: true, placeholder: '描述故事情节、场景、人物对话等...' }
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
const fileLists = reactive<Record<string, UploadUserFile[]>>({});
const extraMaterials = reactive<Record<string, any[]>>({
    shot_prompts_materials: [],
    storyboard_characters: [],
    storyboard_scenes: [],
    storyboard_props: []
});

const isProcessing = ref(false);
const progress = ref(0);
const statusMessage = ref('');
const taskFailed = ref(false);
const result = ref<any>(null);
const showRaw = ref(false);

const historyList = ref<any[]>([]);
const showHistory = ref(false);
let pollTimer: any = null;

// Material Selector
const showMaterialSelector = ref(false);
const selectorTargetField = ref('');
const selectorIsMultiple = ref(false);
const selectorIsList = ref(false);
const selectorType = ref('');

// --- Computed ---
const currentToolName = computed(() => TOOLS.find(t => t.id === currentToolId.value)?.name || '');
const currentToolDesc = computed(() => TOOLS.find(t => t.id === currentToolId.value)?.description || '');
const currentToolFields = computed(() => TOOL_FIELDS[currentToolId.value] || []);

// --- Functions ---
const handleToolSelect = (id: string) => {
    currentToolId.value = id;
    result.value = null; // Clear prev result
    resetForm();
    initFormData();
};

const initFormData = () => {
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.keys(fileLists).forEach(key => delete fileLists[key]);
    
    extraMaterials.shot_prompts_materials = [];
    extraMaterials.storyboard_characters = [];
    extraMaterials.storyboard_scenes = [];
    extraMaterials.storyboard_props = [];

    currentToolFields.value.forEach((field: any) => {
        if (field.default !== undefined) {
            formData[field.name] = field.default;
        } else {
            formData[field.name] = ''; 
        }
        if (field.type === 'file') {
            fileLists[field.name] = [];
            formData[field.name] = null; 
        }
    });

     // Wan video logic (default visiblity check logic handles this partially, but good to ensure inputs are ready)
};

const shouldShowField = (field: any) => {
    if (currentToolId.value === 'wan_image_to_video' && field.name === 'shot_type') {
        return formData.model === 'wan2.6';
    }
    return true;
};

const handleFileChange = (fieldName: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    fileLists[fieldName] = uploadFiles as UploadUserFile[];
    formData[fieldName] = uploadFiles; 
};

const handleFileRemove = (fieldName: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    fileLists[fieldName] = uploadFiles as UploadUserFile[];
    formData[fieldName] = uploadFiles;
};

const toggleHistory = () => {
    showHistory.value = !showHistory.value;
    if (showHistory.value) loadHistory();
};

const openMaterialSelector = (fieldName: string, isMultiple = false) => {
    selectorTargetField.value = fieldName;
    selectorIsMultiple.value = isMultiple;
    selectorIsList.value = false;
    selectorType.value = '';
    showMaterialSelector.value = true;
};

const openMaterialSelectorForList = (listName: string, type: string = '') => {
    selectorTargetField.value = listName;
    selectorIsList.value = true;
    selectorType.value = type;
    showMaterialSelector.value = true;
};

const handleMaterialSelected = async (item: any) => {
    if (selectorIsList.value) {
        const list = extraMaterials[selectorTargetField.value];
        if (!list.find(i => i.id === item.id)) {
            list.push(item);
        }
    } else {
        try {
            const url = getAssetUrl(item.cover_image || item.image_url);
            // Convert to file for FormData
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], item.name + '.jpg', { type: blob.type });
            
            const fieldName = selectorTargetField.value;
            const uid = Date.now();
            
            const fileObj: UploadUserFile = {
                name: item.name,
                url: url,
                status: 'ready',
                uid: uid,
                raw: file
            };

            const isMultiple = selectorIsMultiple.value;
            if (isMultiple) {
                if (!fileLists[fieldName]) fileLists[fieldName] = [];
                fileLists[fieldName].push(fileObj);
            } else {
                fileLists[fieldName] = [fileObj];
            }
            formData[fieldName] = fileLists[fieldName];
            
        } catch (e) {
            console.error(e);
            ElMessage.error("Failed to load material asset");
        }
    }
};

const removeMaterialFromList = (listName: string, id: string | number) => {
    extraMaterials[listName] = extraMaterials[listName].filter(item => item.id !== id);
};

const submitTask = async () => {
    isProcessing.value = true;
    progress.value = 0;
    statusMessage.value = 'Submitting task...';
    taskFailed.value = false;
    result.value = null;

    try {
        const payload = new FormData();
        
        for (const field of currentToolFields.value) {
            if (!shouldShowField(field)) continue;

            const val = formData[field.name];
            
            if (field.type === 'file') {
                const files = fileLists[field.name];
                if (files && files.length > 0) {
                    if (field.multiple) {
                        files.forEach((f: any) => {
                            if (f.raw) payload.append(field.name, f.raw);
                        });
                    } else {
                         if (files[0].raw) payload.append(field.name, files[0].raw as Blob);
                    }
                }
            } else {
                if (val !== null && val !== undefined) {
                    payload.append(field.name, val);
                }
            }
        }

        // --- Corrected Material Payload Logic (Matching Legacy) ---
        if (currentToolId.value === 'generate_shot_prompts') {
             // Legacy sends strictly names if that's what backend does, 
             // but backend parser expects JSON list.
             // We'll send items, but backend might just care about names/descriptions?
             // Legacy: maps to names. Let's do that to be safe.
             const names = extraMaterials.shot_prompts_materials.map(m => m.name);
             payload.append('related_materials', JSON.stringify(names));
        }
        
        if (currentToolId.value === 'generate_single_shot_storyboard') {
             const charNames = extraMaterials.storyboard_characters.map(m => m.name);
             const sceneNames = extraMaterials.storyboard_scenes.map(m => m.name);
             const propNames = extraMaterials.storyboard_props.map(m => m.name);

             // Send as separate fields, JSON stringified arrays of names
             payload.append('character_materials', JSON.stringify(charNames));
             payload.append('scene_materials', JSON.stringify(sceneNames));
             payload.append('prop_materials', JSON.stringify(propNames));
        }

        const res = await API.createToolTask(currentToolId.value, payload);
        startPolling(res.task_id);
    } catch (e: any) {
        ElMessage.error(e.message || 'Task creation failed');
        isProcessing.value = false;
    }
};

const startPolling = (taskId: string) => {
    let pollCount = 0;
    const maxPolls = 300; 

    const poll = async () => {
        if (pollCount > maxPolls) {
            statusMessage.value = 'Timeout';
            taskFailed.value = true;
            isProcessing.value = false;
            return;
        }

        try {
            const status = await API.getTaskStatus(taskId);
            
            if (status.status === 'pending' || status.status === 'processing') {
                progress.value = Math.min(95, progress.value + (100-progress.value)*0.1);
                statusMessage.value = 'Processing...';
                pollTimer = setTimeout(poll, 2000);
            } else if (status.status === 'success') {
                progress.value = 100;
                statusMessage.value = 'Completed';
                const res = await API.getTaskResult(taskId);
                processResult(res, currentToolId.value);
                isProcessing.value = false; 
                loadHistory(); 
            } else {
                statusMessage.value = `Failed: ${status.error || 'Unknown error'}`;
                taskFailed.value = true;
                isProcessing.value = false;
            }
        } catch (e) {
            console.error(e);
            pollTimer = setTimeout(poll, 3000); 
        }
        pollCount++;
    };

    poll();
};

const processResult = (res: any, toolType: string) => {
    const out: any = { raw: res.output, tool_type: toolType };
    if (res.output.text) out.text = res.output.text;
    if (res.output.description) out.text = res.output.description;
    
    // Parse Logic
    if (toolType === 'generate_shot_prompts' && out.text) {
        out.parsedPrompts = parseShotPrompts(out.text);
    } else if (toolType === 'generate_single_shot_storyboard' && out.text) {
        out.parsedStoryboard = parseStoryboard(out.text);
    }

    // Media Logic
    const detect = (url: string) => {
        if (!url) return;
        if (url.match(/\.(jpg|png|jpeg|webp|gif)$/i)) out.image_url = getAssetUrl(url);
        else if (url.match(/\.(mp4|mov|webm)$/i)) out.video_url = getAssetUrl(url);
        else if (url.match(/\.(mp3|wav|ogg)$/i)) out.audio_url = getAssetUrl(url);
        else out.image_url = getAssetUrl(url); 
    }

    if (res.output.url) detect(res.output.url);
    if (res.output.image_path) out.image_url = getAssetUrl(res.output.image_path);
    if (res.output.video_url) out.video_url = getAssetUrl(res.output.video_url);
    if (res.output.video_path) out.video_url = getAssetUrl(res.output.video_path);
    if (res.output.audio_path) out.audio_url = getAssetUrl(res.output.audio_path);

    result.value = out;
};

// --- Parsers (Copied logic from legacy tools.js) ---
const parseShotPrompts = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const result: any = {
        image_prompt: '',
        video_prompt: '',
        reference_video_prompt: '',
        audio_prompt: '',
        dialogue_prompt: ''
    };
    
    for (const line of lines) {
        if (line.startsWith('分镜图片提示词:')) result.image_prompt = line.replace('分镜图片提示词:', '').trim();
        else if (line.startsWith('分镜视频提示词:')) result.video_prompt = line.replace('分镜视频提示词:', '').trim();
        else if (line.startsWith('参考视频提示词:')) result.reference_video_prompt = line.replace('参考视频提示词:', '').trim();
        else if (line.startsWith('音频提示词:')) result.audio_prompt = line.replace('音频提示词:', '').trim();
        else if (line.startsWith('台词提示词:')) result.dialogue_prompt = line.replace('台词提示词:', '').trim();
    }
    return result;
};

const parseStoryboard = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const result: any = { related_materials: [], shots: [] };

    if (lines.length > 0 && lines[0].startsWith('剧本关联素材：')) {
        const materialsStr = lines[0].replace('剧本关联素材：', '').trim();
        result.related_materials = materialsStr.split('，').filter(m => m.trim());
    }

    let i = 1;
    while (i < lines.length) {
        const shotLine = lines[i];
        const match = shotLine.match(/^分镜(\d+):/);
        if (match) {
            const shot: any = {
                number: match[1],
                description: shotLine.replace(/^分镜\d+:/, '').trim(),
                related_materials: [],
                duration: 0
            };
            // Next line: materials
            if (i + 1 < lines.length && lines[i + 1].startsWith('关联素材:')) {
                const materialsStr = lines[i + 1].replace('关联素材:', '').trim();
                shot.related_materials = materialsStr.split('，').filter(m => m.trim());
                i++;
            }
            // Next line: duration
            if (i + 1 < lines.length && lines[i + 1].startsWith('时长:')) {
                const durationStr = lines[i + 1].replace('时长:', '').trim();
                shot.duration = parseInt(durationStr) || 0;
                i++;
            }
            result.shots.push(shot);
        }
        i++;
    }
    return result;
};

// --- Helpers ---
const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('Copied');
    }).catch(() => {
        ElMessage.warning('Failed to copy');
    });
};

const formatPromptLabel = (key: string) => {
    const map: any = {
        image_prompt: 'Image Prompt',
        video_prompt: 'Video Prompt',
        reference_video_prompt: 'Ref Video Prompt',
        audio_prompt: 'Audio Prompt',
        dialogue_prompt: 'Dialogue'
    };
    return map[key] || key;
};

const getAssetUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
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
    processResult({ output: item.output }, item.tool || item.tool_type);
    showHistory.value = false;
};

const getToolName = (id: string) => TOOLS.find(t => t.id === id)?.name || id;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

onMounted(() => {
    // optional: start with first tool
    // handleToolSelect(TOOLS[0].id);
});

onUnmounted(() => {
    if (pollTimer) clearTimeout(pollTimer);
});
</script>

<style scoped>
.tools-page {
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.tools-container {
  display: flex;
  height: 100%;
}

/* Sidebar */
.tools-sidebar {
  width: 260px;
  background: var(--bg-glass);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255,255,255,0.5);
}
.sidebar-header h2 {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.tool-list {
  padding: 10px;
}

.tool-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 6px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tool-item:hover {
  background-color: rgba(0,0,0,0.03);
}

.tool-item.active {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.tool-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  display: flex;
  justify-content: center;
}

.tool-info {
  overflow: hidden;
}

.tool-name {
  display: block;
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: nowrap;
}

.tool-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

/* Workspace */
.tools-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}
.empty-icon {
  color: var(--el-color-primary-light-3);
  margin-bottom: 20px;
}

/* Content Area */
.workspace-content {
  display: flex;
  gap: 20px;
  height: 100%;
}

.config-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 400px;
}

.result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 400px;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255,255,255,0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.header-left {
  display: flex;
  align-items: center;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tool-form {
  max-width: 100%;
}

.custom-form-item {
  margin-bottom: 24px;
}

.full-width {
  width: 100%;
}

/* Upload */
.upload-wrapper {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.upload-area {
  margin-bottom: 10px;
}
.asset-selector-link {
  text-align: right;
}

/* Extra Materials */
.extra-material-section {
  background: var(--bg-secondary);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}
.material-group {
  margin-bottom: 15px;
}
.group-header, .material-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.group-header h4, .material-list-header span {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.material-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 40px;
  background: white;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}
.material-tag-item {
  display: inline-flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding-right: 8px;
  overflow: hidden;
}
.tag-img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}
.tag-name {
  font-size: 12px;
  margin-right: 4px;
}
.remove-icon {
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
}
.remove-icon:hover {
  color: var(--el-color-danger);
}
.empty-tags {
  width: 100%;
  color: #ccc;
  font-size: 12px;
  text-align: center;
  line-height: 32px;
}

/* Output Area */
.output-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.processing-state {
  text-align: center;
  padding: 40px;
}
.loading-animation {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-secondary);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.media-preview {
  margin-bottom: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.preview-header {
  padding: 8px 12px;
  background: rgba(0,0,0,0.02);
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
}
.result-img, .result-video, .result-audio {
  width: 100%;
  display: block;
  max-height: 400px;
  object-fit: contain;
}
.result-audio {
  padding: 20px;
}
.media-actions {
  padding: 10px;
  text-align: right;
  border-top: 1px solid var(--border-color);
}

.text-preview {
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 15px;
}
.text-content {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}

/* Shot Prompts Styling */
.shot-prompts-result .prompt-box {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-bottom: 10px;
  overflow: hidden;
}
.shot-prompts-result .box-header {
  background: var(--bg-secondary);
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shot-prompts-result .label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}
.shot-prompts-result .box-content {
  padding: 10px 12px;
  font-family: monospace;
  font-size: 13px;
  color: var(--text-primary);
}

/* Storyboard Result Styling */
.storyboard-result .sb-section {
  margin-bottom: 15px;
}
.storyboard-result h5 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: var(--text-secondary);
}
.storyboard-result .sb-shots {
  display: grid;
  gap: 15px;
}
.sb-shot-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}
.sb-shot-card .shot-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: bold;
}
.sb-shot-card .shot-desc {
  font-size: 14px;
  margin: 0 0 10px 0;
  line-height: 1.4;
}
.sb-shot-card .label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 5px;
}

/* History Item */
.history-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
}
.history-item:hover {
  background-color: var(--bg-secondary);
}
.history-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.history-tool {
  font-weight: 500;
}
.history-time {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
