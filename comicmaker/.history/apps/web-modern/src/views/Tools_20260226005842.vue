<template>
    <div class="tools-page">
        <!-- Sidebar: Tool List -->
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
                        <span class="tool-desc">{{ tool.description }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Workspace -->
        <div class="tools-workspace">
            <div v-if="!currentToolId" class="empty-state glass-panel">
                <div class="empty-content">
                    <el-icon :size="64"><VideoPlay /></el-icon>
                    <h3>Select a tool to start creating</h3>
                    <p>Choose from our suite of AI generation models on the left</p>
                </div>
            </div>

            <div v-else class="workspace-content">
                <!-- Configuration Panel -->
                <div class="config-panel glass-panel">
                    <div class="panel-header">
                        <h3>{{ currentToolName }}</h3>
                        <el-button type="primary" link @click="toggleHistory">
                            <el-icon><Clock /></el-icon> History
                        </el-button>
                    </div>
                    
                    <div class="form-container">
                        <el-form label-position="top" :model="formData">
                            <template v-for="field in currentToolFields" :key="field.name">
                                <el-form-item v-if="shouldShowField(field)" :label="field.label" :required="field.required">
                                    
                                    <!-- Text Input -->
                                    <el-input 
                                        v-if="field.type === 'textarea'"
                                        v-model="formData[field.name]"
                                        type="textarea"
                                        :rows="4"
                                        :placeholder="field.placeholder || 'Enter details...'"
                                    />

                                    <!-- Select -->
                                    <el-select 
                                        v-else-if="field.type === 'select'"
                                        v-model="formData[field.name]"
                                        class="full-width"
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
                                    />

                                    <!-- Checkbox -->
                                    <el-checkbox 
                                        v-else-if="field.type === 'checkbox'"
                                        v-model="formData[field.name]"
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
                                        >
                                            <el-icon class="el-icon--upload"><Plus /></el-icon>
                                            <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                                        </el-upload>
                                        
                                        <div class="asset-selector-link">
                                            <el-button link type="primary" @click="openMaterialSelector(field.name, field.multiple)">
                                                Or select from Materials
                                            </el-button>
                                        </div>
                                    </div>

                                </el-form-item>
                            </template>

                            <!-- Specialized Extra Inputs for specific tools -->
                            
                            <!-- Shot Prompts: Extra Materials -->
                            <div v-if="currentToolId === 'generate_shot_prompts'" class="extra-section">
                                <h4>Reference Materials</h4>
                                <div class="material-list">
                                    <div v-for="item in extraMaterials.shot_prompts_materials" :key="item.id" class="material-tag">
                                        <img :src="getAssetUrl(item.cover_image)" />
                                        <span>{{ item.name }}</span>
                                        <el-icon @click="removeMaterialFromList('shot_prompts_materials', item.id)"><Close /></el-icon>
                                    </div>
                                    <div class="add-btn" @click="openMaterialSelectorForList('shot_prompts_materials')">
                                        <el-icon><Plus /></el-icon> Add
                                    </div>
                                </div>
                            </div>

                            <!-- Single Shot Storyboard: Extra Materials -->
                            <div v-if="currentToolId === 'generate_single_shot_storyboard'" class="extra-section">
                                <h4>Characters</h4>
                                <div class="material-list">
                                    <div v-for="item in extraMaterials.storyboard_characters" :key="item.id" class="material-tag">
                                        <img :src="getAssetUrl(item.cover_image)" />
                                        <span>{{ item.name }}</span>
                                        <el-icon @click="removeMaterialFromList('storyboard_characters', item.id)"><Close /></el-icon>
                                    </div>
                                    <div class="add-btn" @click="openMaterialSelectorForList('storyboard_characters', 'character')">
                                        <el-icon><Plus /></el-icon> Add
                                    </div>
                                </div>
                                
                                <h4>Scenes</h4>
                                <div class="material-list">
                                    <div v-for="item in extraMaterials.storyboard_scenes" :key="item.id" class="material-tag">
                                        <img :src="getAssetUrl(item.cover_image)" />
                                        <span>{{ item.name }}</span>
                                        <el-icon @click="removeMaterialFromList('storyboard_scenes', item.id)"><Close /></el-icon>
                                    </div>
                                    <div class="add-btn" @click="openMaterialSelectorForList('storyboard_scenes', 'scene')">
                                        <el-icon><Plus /></el-icon> Add
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <el-button type="primary" size="large" @click="submitTask" :loading="isProcessing" class="submit-btn">
                                    {{ isProcessing ? 'Generating...' : 'Generate' }}
                                </el-button>
                            </div>
                        </el-form>
                    </div>
                </div>

                <!-- Result Panel -->
                <div class="result-panel glass-panel">
                     <div class="panel-header">
                        <h3>Output</h3>
                        <div class="status-indicator">
                            <el-tag v-if="isProcessing" type="warning" effect="dark">Processing</el-tag>
                            <el-tag v-else-if="result" type="success" effect="dark">Completed</el-tag>
                            <el-progress 
                                v-if="isProcessing" 
                                :percentage="progress" 
                                :status="taskFailed ? 'exception' : ''"
                                :stroke-width="4"
                                style="width: 100px; margin-left: 10px;"
                            />
                        </div>
                    </div>

                    <div class="output-content">
                        <!-- Loading State -->
                        <div v-if="isProcessing && !result" class="processing-state">
                            <div class="loader"></div>
                            <p>{{ statusMessage }}</p>
                        </div>

                        <!-- Empty State -->
                        <div v-else-if="!result && !isProcessing" class="empty-output">
                            <el-empty description="Output will appear here" />
                        </div>

                        <!-- Result Display -->
                        <div v-else-if="result" class="result-display">
                            <!-- Image Result -->
                            <div v-if="result.image_url" class="media-preview">
                                <el-image 
                                    :src="result.image_url" 
                                    :preview-src-list="[result.image_url]"
                                    fit="contain"
                                />
                                <div class="media-actions">
                                    <a :href="result.image_url" download target="_blank">
                                        <el-button size="small">Download Image</el-button>
                                    </a>
                                </div>
                            </div>

                            <!-- Video Result -->
                            <div v-if="result.video_url" class="media-preview">
                                <video controls :src="result.video_url"></video>
                                <div class="media-actions">
                                    <a :href="result.video_url" download target="_blank">
                                        <el-button size="small">Download Video</el-button>
                                    </a>
                                </div>
                            </div>

                            <!-- Audio Result -->
                            <div v-if="result.audio_url" class="media-preview">
                                <audio controls :src="result.audio_url"></audio>
                                <div class="media-actions">
                                    <a :href="result.audio_url" download target="_blank">
                                        <el-button size="small">Download Audio</el-button>
                                    </a>
                                </div>
                            </div>

                            <!-- Text Result -->
                            <div v-if="result.text" class="text-preview">
                                <div class="text-content">{{ result.text }}</div>
                                <el-button size="small" @click="copyText(result.text)">Copy Text</el-button>
                            </div>

                            <!-- Raw JSON Toggle -->
                            <div class="debug-toggle">
                                <el-button link size="small" @click="showRaw = !showRaw">
                                    {{ showRaw ? 'Hide Raw Output' : 'Show Raw Output' }}
                                </el-button>
                                <pre v-if="showRaw" class="raw-json">{{ result.raw }}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- History Drawer -->
        <el-drawer
            v-model="showHistory"
            title="Task History"
            direction="rtl"
            size="350px"
        >
            <div class="history-list">
                <div 
                    v-for="item in historyList" 
                    :key="item.id" 
                    class="history-item"
                    @click="viewHistory(item)"
                >
                    <div class="history-header">
                        <span class="history-tool">{{ getToolName(item.tool) }}</span>
                        <el-tag size="small" :type="item.status === 'success' ? 'success' : 'danger'">
                            {{ item.status }}
                        </el-tag>
                    </div>
                    <div class="history-time">{{ formatDate(item.created_at) }}</div>
                </div>
                <el-empty v-if="historyList.length === 0" description="No history yet" />
            </div>
        </el-drawer>

        <!-- Material Selector Modal -->
        <MaterialSelector
            v-model="showMaterialSelector"
            :filterType="selectorType"
            @select="handleMaterialSelected"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { API } from '../api/client';
import { ElMessage, type UploadFile, type UploadFiles, type UploadUserFile } from 'element-plus';
import { Plus, Clock, Delete, Close, VideoPlay } from '@element-plus/icons-vue';
import MaterialSelector from '../components/MaterialSelector.vue';
import Clipboard from 'clipboard';

// --- Constants (Preserved) ---
const TOOLS = [
    { id: 'generate_script', name: 'Generate Script', description: 'Create detailed scripts from descriptions', icon: '📝' },
    { id: 'generate_single_shot_storyboard', name: 'Storyboard Shot', description: 'Generate storyboard for a single shot', icon: '🎬' },
    { id: 'generate_shot_prompts', name: 'Shot Prompts', description: 'Create prompts for shot generation', icon: '💡' },
    { id: 'image_to_description', name: 'Image to Text', description: 'Analyze image to generate description', icon: '🖼️' },
    { id: 'image_to_style_description', name: 'Style Analyze', description: 'Extract style description from image', icon: '🎨' },
    { id: 'text_to_image', name: 'Text to Image', description: 'Generate images from text prompts', icon: '✨' },
    { id: 'image_to_image', name: 'Image to Image', description: 'Transform existing images', icon: '🔄' },
    { id: 'vidu_ref_image_to_video', name: 'Vidu Video', description: 'Generate video from reference image', icon: '🎞️' },
    { id: 'sora_image_to_video', name: 'Sora Video', description: 'Sora model video generation', icon: '🎥' },
    { id: 'wan_image_to_video', name: 'Wan Video', description: 'Wan model video generation', icon: '📹' },
    { id: 'keyframe_to_video', name: 'Keyframe Video', description: 'Animate between start and end frames', icon: '⏩' },
    { id: 'text_to_audio', name: 'Text to Audio', description: 'Generate sound effects or speech', icon: '🔊' }
];

const TOOL_FIELDS: any = {
    generate_script: [
        { name: 'description', label: 'Story Description', type: 'textarea', required: true, placeholder: 'Describe the scene, characters, and dialogue...' }
    ],
    generate_single_shot_storyboard: [
        { name: 'script', label: 'Script Content', type: 'textarea', required: true },
        { name: 'expected_duration', label: 'Total Duration (s)', type: 'number', min: 1, max: 600, default: 60, required: true },
        { name: 'shot_duration', label: 'Shot Duration', type: 'select', options: ['1', '2', '3', '4', '5', '6'], default: '5', required: true }
    ],
    image_to_description: [
        { name: 'image', label: 'Source Image', type: 'file', accept: 'image/*', required: true },
        { name: 'material_type', label: 'Content Type', type: 'select', options: ['Character', 'Scene', 'Prop', 'Other'], required: true }
    ],
    image_to_style_description: [
        { name: 'image', label: 'Style Reference', type: 'file', accept: 'image/*', required: true },
        { name: 'description', label: 'Additional Context', type: 'textarea', required: false }
    ],
    text_to_image: [
        { name: 'prompt', label: 'Prompt', type: 'textarea', required: true },
        { name: 'material_type', label: 'Type', type: 'select', options: ['Character', 'Scene', 'Prop', 'Other'], required: true },
        { name: 'model', label: 'Model', type: 'select', options: ['seedream4.5', 'wan2.6', 'nanopro'], default: 'seedream4.5', required: true },
        { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '16:9', required: true },
        { name: 'resolution', label: 'Quality', type: 'select', options: ['1k', '2k'], default: '1k', required: true }
    ],
    image_to_image: [
        { name: 'prompt', label: 'Modification Prompt', type: 'textarea', required: true },
        { name: 'images', label: 'Reference Images', type: 'file', accept: 'image/*', multiple: true, required: true },
        { name: 'model', label: 'Model', type: 'select', options: ['seedream4.5', 'wan2.6', 'nanopro'], default: 'seedream4.5', required: true },
        { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '16:9', required: true },
        { name: 'resolution', label: 'Quality', type: 'select', options: ['1k', '2k'], default: '1k', required: true }
    ],
    vidu_ref_image_to_video: [
        { name: 'prompt', label: 'Video Prompt', type: 'textarea', required: true },
        { name: 'images', label: 'Reference Images (Max 7)', type: 'file', accept: 'image/*', multiple: true, required: true },
        { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['1:1', '3:4', '4:3', '16:9', '9:16'], default: '16:9', required: true },
        { name: 'resolution', label: 'Quality', type: 'select', options: ['540p', '720p', '1080p'], default: '720p', required: true },
        { name: 'duration', label: 'Duration (s)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], default: '5', required: true }
    ],
    sora_image_to_video: [
        { name: 'prompt', label: 'Video Prompt', type: 'textarea', required: true },
        { name: 'image', label: 'Start Image', type: 'file', accept: 'image/*', required: true },
        { name: 'duration', label: 'Duration (s)', type: 'select', options: ['4', '8', '12'], default: '4', required: true }
    ],
    wan_image_to_video: [
        { name: 'prompt', label: 'Video Prompt', type: 'textarea', required: true },
        { name: 'image', label: 'Start Image', type: 'file', accept: 'image/*', required: true },
        { name: 'model', label: 'Model Version', type: 'select', options: ['wan2.5', 'wan2.6'], default: 'wan2.6', required: true },
        { name: 'resolution', label: 'Resolution', type: 'select', options: ['480p', '720p', '1080p'], default: '720p', required: true },
        { name: 'duration', label: 'Duration (s)', type: 'select', options: ['3', '4', '5', '6', '7', '8', '9', '10'], default: '5', required: true },
        { name: 'shot_type', label: 'Camera Movement', type: 'select', options: ['single', 'multi'], default: 'single', required: false },
        { name: 'enable_audio', label: 'Generate Audio', type: 'checkbox', default: false }
    ],
    keyframe_to_video: [
        { name: 'start_frame', label: 'Start Frame', type: 'file', accept: 'image/*', required: true },
        { name: 'end_frame', label: 'End Frame', type: 'file', accept: 'image/*', required: true },
        { name: 'prompt', label: 'Transition Prompt', type: 'textarea', required: true },
        { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['9:16', '16:9', '4:3', '3:4'], required: true },
        { name: 'duration', label: 'Duration (s)', type: 'number', min: 1, max: 60, required: true }
    ],
    text_to_audio: [
        { name: 'text', label: 'Audio Description', type: 'textarea', required: true },
        { name: 'duration', label: 'Duration (s)', type: 'number', min: 1, max: 60, required: true }
    ],
    generate_shot_prompts: [
        { name: 'shot_description', label: 'Shot Context', type: 'textarea', required: true },
        { name: 'duration', label: 'Duration (s)', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], default: '5', required: true }
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

        if (currentToolId.value === 'generate_shot_prompts') {
             payload.append('materials', JSON.stringify(extraMaterials.shot_prompts_materials));
        }
        
        if (currentToolId.value === 'generate_single_shot_storyboard') {
             const mats = {
                 characters: extraMaterials.storyboard_characters,
                 scenes: extraMaterials.storyboard_scenes,
                 props: extraMaterials.storyboard_props
             };
             payload.append('materials', JSON.stringify(mats));
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
            return;
        }

        try {
            const status = await API.getTaskStatus(taskId);
            
            if (status.status === 'pending' || status.status === 'processing') {
                progress.value = Math.min(95, progress.value + 5);
                statusMessage.value = 'Processing...';
                pollTimer = setTimeout(poll, 2000);
            } else if (status.status === 'success') {
                progress.value = 100;
                statusMessage.value = 'Completed';
                const res = await API.getTaskResult(taskId);
                processResult(res);
                isProcessing.value = false; 
                loadHistory(); 
            } else {
                statusMessage.value = `Failed: ${status.error || 'Unknown error'}`;
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
    
    // Improve URL detection logic
    const detect = (url: string) => {
        if (!url) return;
        if (url.match(/\.(jpg|png|jpeg|webp|gif)$/i)) out.image_url = getAssetUrl(url);
        else if (url.match(/\.(mp4|mov|webm)$/i)) out.video_url = getAssetUrl(url);
        else if (url.match(/\.(mp3|wav|ogg)$/i)) out.audio_url = getAssetUrl(url);
        else out.image_url = getAssetUrl(url); // Default fallback
    }

    if (res.output.url) detect(res.output.url);
    if (res.output.image_path) out.image_url = getAssetUrl(res.output.image_path);
    if (res.output.video_url) out.video_url = getAssetUrl(res.output.video_url);
    if (res.output.video_path) out.video_url = getAssetUrl(res.output.video_path);
    if (res.output.audio_path) out.audio_url = getAssetUrl(res.output.audio_path);

    result.value = out;
};

const copyText = (text: string) => {
    // navigator.clipboard might require secure context
    navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('Copied to clipboard');
    }).catch(() => {
        ElMessage.warning('Failed to copy');
    });
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

const getToolName = (id: string) => TOOLS.find(t => t.id === id)?.name || id;
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();
const isImage = (url: string) => /\.(jpg|png|jpeg|webp|gif)/i.test(url);
const isVideo = (url: string) => /\.(mp4|mov|webm)/i.test(url);

onMounted(() => {
    // optional: start with first tool
    // handleToolSelect(TOOLS[0].id);
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
