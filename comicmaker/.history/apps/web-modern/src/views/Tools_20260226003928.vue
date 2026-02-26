<template>
  <div class="page-container tools-page">
    <!-- Left Sidebar: Tool Selection -->
    <div class="tools-sidebar glass-panel">
      <div class="sidebar-header">
        <h2>AI Workbench</h2>
      </div>
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
            <!-- <span class="tool-desc">{{ tool.description }}</span> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="tools-workspace">
      <!-- Empty State -->
      <div v-if="!currentToolId" class="workspace-empty">
        <div class="empty-content glass-panel">
          <i class="el-icon-magic-stick" style="font-size: 48px; margin-bottom: 20px;"></i>
          <h3>Select a Tool to Start</h3>
          <p>Choose an AI capability from the sidebar to begin creating.</p>
        </div>
      </div>

      <!-- Tool Interface -->
      <div v-else class="workspace-content">
        <div class="workspace-header glass-panel">
          <div class="header-left">
            <h2 class="section-title">{{ currentToolName }}</h2>
            <p class="section-subtitle">{{ currentToolDesc }}</p>
          </div>
          <div class="header-right">
             <el-button @click="toggleHistory" :type="showHistory ? 'primary' : 'default'" plain>
               <el-icon><Clock /></el-icon> History
             </el-button>
          </div>
        </div>

        <div class="workspace-body">
          <!-- Form Area -->
          <div class="form-panel glass-panel" v-loading="loading || isProcessing">
            <el-form :model="formData" label-position="top" ref="formRef" size="large">
              <template v-for="field in currentToolFields" :key="field.name">
                
                <!-- Textarea -->
                <el-form-item 
                  v-if="field.type === 'textarea' && shouldShowField(field)" 
                  :label="field.label" 
                  :required="field.required"
                >
                  <el-input 
                    v-model="formData[field.name]" 
                    type="textarea" 
                    :rows="4" 
                    :placeholder="field.placeholder || 'Enter details...'" 
                  />
                </el-form-item>

                <!-- Select -->
                <el-form-item 
                  v-else-if="field.type === 'select' && shouldShowField(field)" 
                  :label="field.label" 
                  :required="field.required"
                >
                  <el-select v-model="formData[field.name]" placeholder="Select option" style="width: 100%">
                    <el-option 
                      v-for="opt in field.options" 
                      :key="opt" 
                      :label="opt" 
                      :value="opt" 
                    />
                  </el-select>
                </el-form-item>

                <!-- Number -->
                <el-form-item 
                  v-else-if="field.type === 'number' && shouldShowField(field)" 
                  :label="field.label" 
                  :required="field.required"
                >
                  <el-input-number 
                    v-model="formData[field.name]" 
                    :min="field.min" 
                    :max="field.max"
                    style="width: 100%"
                  />
                </el-form-item>

                <!-- File Upload -->
                <el-form-item 
                  v-else-if="field.type === 'file' && shouldShowField(field)" 
                  :label="field.label" 
                  :required="field.required"
                >
                  <div class="upload-area">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :limit="field.multiple ? (field.maxCount || 10) : 1"
                      :multiple="field.multiple"
                      :on-change="(file, fileList) => handleFileChange(field.name, file, fileList)"
                      :on-remove="(file, fileList) => handleFileRemove(field.name, file, fileList)"
                      list-type="picture-card"
                      :file-list="fileLists[field.name] || []"
                      class="custom-uploader"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-upload>
                    
                    <div class="upload-actions" v-if="field.accept && field.accept.includes('image')">
                       <el-button type="primary" link @click="openMaterialSelector(field.name, field.multiple)">
                         Select from Materials
                       </el-button>
                    </div>
                  </div>
                </el-form-item>

                <!-- Checkbox -->
                <el-form-item 
                  v-else-if="field.type === 'checkbox' && shouldShowField(field)"
                >
                  <el-checkbox v-model="formData[field.name]" border>{{ field.label }}</el-checkbox>
                </el-form-item>

              </template>

              <!-- Extra Materials: Shot Prompts -->
              <div v-if="currentToolId === 'generate_shot_prompts'" class="extra-material-section">
                <div class="section-divider">
                  <span>Reference Materials</span>
                </div>
                <div class="material-picker-area">
                    <div class="picker-header">
                        <span>Selected Assets</span>
                        <el-button size="small" type="primary" plain @click="openMaterialSelectorForList('shot_prompts_materials')">Add</el-button>
                    </div>
                    <div class="material-grid-mini">
                        <el-empty v-if="extraMaterials.shot_prompts_materials.length === 0" description="No materials selected" image-size="40" />
                        <div v-for="mat in extraMaterials.shot_prompts_materials" :key="mat.id" class="mini-card">
                            <el-image :src="getAssetUrl(mat.cover_image || mat.image_url)" class="mini-img" fit="cover" />
                            <div class="mini-overlay" @click="removeMaterialFromList('shot_prompts_materials', mat.id)">
                              <el-icon><Delete /></el-icon>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

               <!-- Extra Materials: Storyboard -->
              <div v-if="currentToolId === 'generate_single_shot_storyboard'" class="extra-material-section">
                <div class="section-divider">
                  <span>Storyboard Assets</span>
                </div>
                 <div class="multi-picker-grid">
                    <div class="picker-column">
                        <div class="picker-header">
                            <span>Characters</span>
                            <el-button size="small" type="primary" link @click="openMaterialSelectorForList('storyboard_characters', 'characters')">Add</el-button>
                        </div>
                        <div class="material-list-compact">
                            <div v-for="mat in extraMaterials.storyboard_characters" :key="mat.id" class="compact-item">
                                <el-image :src="getAssetUrl(mat.cover_image || mat.image_url)" class="compact-img" fit="cover" />
                                <span class="compact-name">{{ mat.name }}</span>
                                <el-icon class="compact-remove" @click="removeMaterialFromList('storyboard_characters', mat.id)"><Close /></el-icon>
                            </div>
                        </div>
                    </div>
                    <div class="picker-column">
                        <div class="picker-header">
                            <span>Scenes</span>
                            <el-button size="small" type="primary" link @click="openMaterialSelectorForList('storyboard_scenes', 'scenes')">Add</el-button>
                        </div>
                        <div class="material-list-compact">
                            <div v-for="mat in extraMaterials.storyboard_scenes" :key="mat.id" class="compact-item">
                                <el-image :src="getAssetUrl(mat.cover_image || mat.image_url)" class="compact-img" fit="cover" />
                                <span class="compact-name">{{ mat.name }}</span>
                                <el-icon class="compact-remove" @click="removeMaterialFromList('storyboard_scenes', mat.id)"><Close /></el-icon>
                            </div>
                        </div>
                    </div>
                    <div class="picker-column">
                        <div class="picker-header">
                            <span>Props</span>
                            <el-button size="small" type="primary" link @click="openMaterialSelectorForList('storyboard_props', 'props')">Add</el-button>
                        </div>
                         <div class="material-list-compact">
                            <div v-for="mat in extraMaterials.storyboard_props" :key="mat.id" class="compact-item">
                                <el-image :src="getAssetUrl(mat.cover_image || mat.image_url)" class="compact-img" fit="cover" />
                                <span class="compact-name">{{ mat.name }}</span>
                                <el-icon class="compact-remove" @click="removeMaterialFromList('storyboard_props', mat.id)"><Close /></el-icon>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>

              <div class="form-actions">
                <el-button type="primary" size="large" @click="submitTask" :loading="isProcessing" class="submit-btn" round>
                  <el-icon class="el-icon--left"><VideoPlay /></el-icon>
                  Generate Content
                </el-button>
              </div>
            </el-form>
          </div>

          <!-- Result Panel (Slide/Fade In) -->
          <transition name="el-fade-in-linear">
            <div v-if="result || isProcessing || statusMessage" class="result-panel glass-panel">
               <div class="result-header">
                 <h3>Output</h3>
                 <div class="result-status" v-if="isProcessing">
                    <el-spinner />
                    <span>{{ statusMessage }}... {{ progress }}%</span>
                 </div>
               </div>

               <div class="result-content" v-if="result">
                  <!-- Text Result -->
                  <div v-if="result.text" class="result-text-box">
                    <pre>{{ result.text }}</pre>
                    <el-button size="small" class="copy-btn" @click="copyText(result.text)">Copy</el-button>
                  </div>

                  <!-- Media Result -->
                  <div v-if="result.image_url" class="result-media-box">
                    <el-image 
                      :src="result.image_url" 
                      fit="contain" 
                      :preview-src-list="[result.image_url]" 
                      class="result-img"
                    />
                  </div>
                  
                  <div v-if="result.video_url" class="result-media-box">
                    <video :src="result.video_url" controls class="result-video"></video>
                  </div>

                  <div v-if="result.audio_url" class="result-media-box">
                    <audio :src="result.audio_url" controls class="result-audio"></audio>
                  </div>
                  
                  <!-- Raw Data Toggle -->
                  <div class="result-footer">
                     <el-button type="info" link size="small" @click="showRaw = !showRaw">
                       {{ showRaw ? 'Hide Debug' : 'Show Debug' }}
                     </el-button>
                     <div v-if="showRaw" class="raw-json">
                       <pre>{{ JSON.stringify(result.raw, null, 2) }}</pre>
                     </div>
                  </div>
               </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Right Drawer: History -->
    <el-drawer
      v-model="showHistory"
      title="Generation History"
      direction="rtl"
      size="320px"
      :modal="false"
      class="history-drawer"
    >
      <div class="history-list">
          <el-empty v-if="historyList.length === 0" description="No history yet" />
          <div 
            v-for="item in historyList" 
            :key="item.record_id" 
            class="history-card glass-panel" 
            @click="viewHistory(item)"
          >
            <div class="history-top">
              <span class="history-type">{{ getToolName(item.tool_type) }}</span>
              <el-tag size="small" :type="item.status === 'success' ? 'success' : 'danger'" effect="dark">{{ item.status }}</el-tag>
            </div>
            
            <div class="history-preview-box">
               <el-image v-if="item.output && (item.output.image_path || item.output.url) && isImage(item.output.url || item.output.image_path)" 
                 :src="getAssetUrl(item.output.url || item.output.image_path)" 
                 fit="cover" 
                 class="h-img" 
               />
               <video v-else-if="item.output && (item.output.video_path || item.output.url) && isVideo(item.output.url || item.output.video_path)"
                 :src="getAssetUrl(item.output.url || item.output.video_path)"
                 class="h-video"
               />
               <div v-else class="h-text">{{ (item.input?.prompt || item.input?.description || 'Text Request').substring(0, 60) }}...</div>
            </div>
            
            <div class="history-meta">
              {{ formatDate(item.created_at) }}
            </div>
          </div>
      </div>
    </el-drawer>

    <!-- Material Selector Dialog -->
    <MaterialSelector 
      v-model="showMaterialSelector" 
      @select="handleMaterialSelected"
      :type="selectorType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { API } from '../api/client';
import { ElMessage, type UploadFile, type UploadFiles, type UploadUserFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import MaterialSelector from '../components/MaterialSelector.vue';

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
const fileLists = reactive<Record<string, UploadUserFile[]>>({});
// 额外素材列表 state
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

const historyList = ref<any[]>([]);
let pollTimer: any = null;

// Material Selector State
const showMaterialSelector = ref(false);
const selectorTargetField = ref(''); // field name OR list name
const selectorIsMultiple = ref(false);
const selectorIsList = ref(false); // true if adding to extraMaterials list
const selectorType = ref(''); // optional filter type

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
    // Reset state
    Object.keys(formData).forEach(key => delete formData[key]);
    Object.keys(fileLists).forEach(key => delete fileLists[key]);
    
    // Clear extra materials
    extraMaterials.shot_prompts_materials = [];
    extraMaterials.storyboard_characters = [];
    extraMaterials.storyboard_scenes = [];
    extraMaterials.storyboard_props = [];

    // Set defaults
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
};

const shouldShowField = (field: any) => {
    // Logic for wan_image_to_video
    if (currentToolId.value === 'wan_image_to_video' && field.name === 'shot_type') {
        return formData.model === 'wan2.6';
    }
    return true;
};

const handleFileChange = (fieldName: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    // Element Plus types matching craziness
    fileLists[fieldName] = uploadFiles as UploadUserFile[];
    formData[fieldName] = uploadFiles; 
};

const handleFileRemove = (fieldName: string, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    fileLists[fieldName] = uploadFiles as UploadUserFile[];
    formData[fieldName] = uploadFiles;
};

// Material Selection Logic
const openMaterialSelector = (fieldName: string, isMultiple = false) => {
    selectorTargetField.value = fieldName;
    selectorIsMultiple.value = isMultiple;
    selectorIsList.value = false;
    selectorType.value = ''; // all types
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
        // Add to extra materials list (checks for duplicates)
        const list = extraMaterials[selectorTargetField.value];
        if (!list.find(i => i.id === item.id)) {
            list.push(item);
        }
    } else {
        // It's a file field input - we need to simulate a file upload or just pass the URL?
        // The legacy code doesn't make it clear BUT usually we pass the image URL or the file itself.
        // If we choose from material library, we have a URL.
        // But the backend expects a FILE object usually for 'file' type fields.
        // Or maybe we should download it and convert to Blob?
        // Let's FETCH the image and convert to File object to be safe and consistent with upload logic.
        try {
            const url = getAssetUrl(item.cover_image || item.image_url);
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], item.name + '.jpg', { type: blob.type });
            
            // Manually update file list
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
            
            // Trigger update
            formData[fieldName] = fileLists[fieldName];
            
        } catch (e) {
            console.error("Failed to convert material to file", e);
            ElMessage.error("素材加载失败，请重试");
        }
    }
};

const removeMaterialFromList = (listName: string, id: string | number) => {
    extraMaterials[listName] = extraMaterials[listName].filter(item => item.id !== id);
};


const submitTask = async () => {
    isProcessing.value = true;
    progress.value = 0;
    statusMessage.value = '提交任务中...';
    taskFailed.value = false;
    result.value = null;

    try {
        const payload = new FormData();
        
        // Append all standard fields
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

        // Append Extra Materials
        if (currentToolId.value === 'generate_shot_prompts') {
             // Backend expects 'materials' as JSON string? Or ??
             // Legacy code: JSON.stringify(window.shotPromptsMaterials) appended to 'materials'
             payload.append('materials', JSON.stringify(extraMaterials.shot_prompts_materials));
        }
        
        if (currentToolId.value === 'generate_single_shot_storyboard') {
             // Legacy code: JSON.stringify(window.storyboardMaterials) appended to 'materials'
             // Structure: { characters: [], scenes: [], props: [] }
             const mats = {
                 characters: extraMaterials.storyboard_characters,
                 scenes: extraMaterials.storyboard_scenes,
                 props: extraMaterials.storyboard_props
             };
             payload.append('materials', JSON.stringify(mats));
        }

        const res = await API.createToolTask(currentToolId.value, payload);
        const taskId = res.task_id;
        
        startPolling(taskId);
    } catch (e: any) {
        ElMessage.error(e.message || '任务创建失败');
        isProcessing.value = false;
    }
};

// ... Rest of the logic (polling, result processing) same as before ... 
// (Copied for completeness)

const startPolling = (taskId: string) => {
    let pollCount = 0;
    const maxPolls = 300; 

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
                isProcessing.value = false; 
                loadHistory(); 
            } else {
                statusMessage.value = `任务失败: ${status.error || '未知错误'}`;
                taskFailed.value = true;
            }
        } catch (e) {
            console.error(e);
            pollTimer = setTimeout(poll, 3000); 
        }
        pollCount++;
    };

    poll();
};

const processResult = (res: any) => {
    const out: any = { raw: res.output };
    
    if (res.output.text) out.text = res.output.text;
    if (res.output.description) out.text = res.output.description;
    
    if (res.output.image_path) out.image_url = getAssetUrl(res.output.image_path);
    if (res.output.url) {
        if (res.output.url.match(/\.(jpg|png|jpeg|webp)$/i)) out.image_url = getAssetUrl(res.output.url);
        else if (res.output.url.match(/\.(mp4|mov)$/i)) out.video_url = getAssetUrl(res.output.url);
        else if (res.output.url.match(/\.(mp3|wav)$/i)) out.audio_url = getAssetUrl(res.output.url);
    }
    
    if (res.output.video_url) out.video_url = getAssetUrl(res.output.video_url);
    if (res.output.video_path) out.video_url = getAssetUrl(res.output.video_path);
    if (res.output.audio_path) out.audio_url = getAssetUrl(res.output.audio_path);

    result.value = out;
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
  height: 100%;
  min-height: 100vh; /* Ensure full viewport height */
  display: flex;
  flex-direction: column;
}

.tools-sidebar, .history-sidebar {
  /* Remove hardcoded background, let theme handle it */
  /* background-color: var(--bg-glass); Moved to theme.css */
  border-right: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color); 
  /* overflow-y: auto; */
  padding-top: 10px;
}
.sidebar-header {
  padding: 15px;
  font-weight: bold;
  font-size: 16px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-menu {
  border-right: none;
  background: transparent;
  padding: 0 10px;
}
.tool-menu-item {
    border-radius: 8px;
    margin-bottom: 5px;
    color: var(--text-secondary);
}
.tool-menu-item.is-active {
    background-color: var(--el-color-primary-light-9);
    color: var(--accent-color);
    font-weight: bold;
}
.tool-menu-item:hover {
    background-color: var(--bg-secondary);
}

.tool-icon {
  margin-right: 10px;
  font-size: 18px;
}

.tools-main {
  /* background-color: #f5f7fa; REMOVED */
  background: transparent;
  padding: 20px;
  overflow-y: auto;
}

.tool-header h3 {
  margin-top: 0;
  color: var(--text-primary);
}
.tool-header p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 20px;
}

.tool-form-card {
  max-width: 800px;
  margin: 0 auto;
  /* background handled by theme.css */
}

/* ... existing styles ... */

.material-category {
    background: var(--bg-secondary);
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    border: 1px solid var(--border-color);
}

.cat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: bold;
    color: var(--text-secondary);
}

.mini-material-card {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
}
/* ... */
.history-item-header {
  color: var(--text-secondary);
}
.history-tool-name {
  color: var(--text-primary);
}
.preview-text {
  color: var(--text-secondary);
}
</style>
