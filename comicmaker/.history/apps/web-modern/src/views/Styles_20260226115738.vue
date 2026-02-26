<template>
  <div class="styles-page common-layout">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Style Library</h1>
        <p class="page-subtitle">Manage reference styles for your comic generation.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="create-btn" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          Add New Style
        </el-button>
      </div>
    </div>

    <div class="content-body" v-loading="loading">
      <div v-if="!loading && styles.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Picture /></el-icon>
        <h3>No styles yet</h3>
        <p>Upload style reference images to guide generation.</p>
        <el-button type="primary" @click="openCreateDialog">Add First Style</el-button>
      </div>

      <div v-else class="style-grid">
        <div v-for="style in styles" :key="style.id" class="style-card">
          <div class="card-visual">
            <div class="image-wrapper" v-if="style.reference_image">
              <el-image 
                :src="getImageUrl(style.reference_image)" 
                fit="cover" 
                class="style-image"
                loading="lazy"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="card-overlay">
                <el-button circle class="action-btn" @click.stop="editStyle(style)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button circle class="action-btn delete" @click.stop="deleteStyle(style)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="no-image" v-else>
              <el-icon><Picture /></el-icon>
              <span>No Reference</span>
            </div>
          </div>
          <div class="card-content">
            <h3 class="style-name">{{ style.name }}</h3>
            <p class="style-description">{{ style.description || 'No description provided.' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Style' : 'New Style'"
      width="500px"
      class="modern-dialog"
      destroy-on-close
    >
      <el-form :model="form" label-position="top" class="modern-form">
        <el-form-item label="Style Name" required>
          <el-input v-model="form.name" placeholder="e.g., Cyberpunk City" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="Describe the visual style..."
          />
        </el-form-item>
        <el-form-item label="Reference Image">
          <el-upload
            class="style-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            :on-change="handleFileChange"
            :file-list="fileList"
            list-type="picture"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" :loading="submitting" @click="submitForm">
            {{ isEdit ? 'Save Changes' : 'Create Style' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Plus, Delete, Edit, Picture, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus';
import { API } from '@/api/client';

// Define interface locally if not available from API
interface Style {
  id: string;
  name: string;
  description?: string;
  reference_image?: string;
  created_at?: string;
}

const styles = ref<Style[]>([]);
const loading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const fileList = ref<UploadFile[]>([]);

const form = reactive({
  id: '',
  name: '',
  description: '',
  file: null as File | null
});

const loadStyles = async () => {
  loading.value = true;
  try {
    const res = await API.getStyles();
    // Handle both array direct return or { data: [] } format
    styles.value = Array.isArray(res) ? res : (res.data || []);
  } catch (error) {
    console.error('Failed to load styles', error);
    ElMessage.error('Failed to load styles');
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Use window.API_BASE if set, otherwise assume proxy or relative path
  const baseUrl = (window as any).API_BASE || '';
  return `${baseUrl}/data/styles/${path}`;
};

const openCreateDialog = () => {
  isEdit.value = false;
  form.id = '';
  form.name = '';
  form.description = '';
  form.file = null;
  fileList.value = [];
  dialogVisible.value = true;
};

const editStyle = (style: Style) => {
  isEdit.value = true;
  form.id = style.id;
  form.name = style.name;
  form.description = style.description || '';
  form.file = null;
  fileList.value = [];
  dialogVisible.value = true;
};

const handleFileChange = (uploadFile: UploadFile) => {
  form.file = uploadFile.raw as File;
};

const submitForm = async () => {
  if (!form.name) return ElMessage.warning('Style name is required');
  
  submitting.value = true;
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  if (form.file) {
    formData.append('reference_image', form.file);
  }

  try {
    if (isEdit.value) {
      await API.updateStyle(form.id, formData);
    } else {
      await API.createStyle(formData);
    }
    ElMessage.success(isEdit.value ? 'Style updated successfully' : 'Style created successfully');
    dialogVisible.value = false;
    loadStyles();
  } catch (e: any) {
    ElMessage.error(e.message || 'Operation failed');
  } finally {
    submitting.value = false;
  }
};

const deleteStyle = (style: Style) => {
  ElMessageBox.confirm(
    'Are you sure you want to delete this style reference? This cannot be undone.',
    'Delete Style',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await API.deleteStyle(style.id);
      loadStyles();
      ElMessage.success('Style deleted successfully');
    } catch (e: any) {
      ElMessage.error('Delete failed');
    }
  });
};

onMounted(loadStyles);
</script>

<style scoped>
.styles-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  padding: 32px 40px;
  background: var(--bg-primary);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  margin: 0;
}

.create-btn {
  height: 48px;
  padding: 0 24px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.4);
}

.content-body {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
}

/* Grid Layout */
.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 32px;
  padding-bottom: 40px;
}

/* Card Styling */
.style-card {
  background: var(--bg-secondary);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 340px;
}

.style-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color-alpha);
}

.card-visual {
  height: 200px;
  position: relative;
  background: var(--bg-tertiary);
  overflow: hidden;
}

.image-wrapper {
  width: 100%;
  height: 100%;
}

.style-image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.style-card:hover .style-image {
  transform: scale(1.05);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-size: 32px;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: all 0.3s ease;
}

.style-card:hover .card-overlay {
  opacity: 1;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 44px;
  height: 44px;
  font-size: 18px;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  background: white;
  color: var(--primary-color);
}

.action-btn.delete:hover {
  color: #ff4d4f;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.no-image .el-icon {
  font-size: 48px;
  opacity: 0.5;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.style-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.style-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
  padding-bottom: 10%; 
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 32px 0;
  max-width: 400px;
  text-align: center;
}

/* Modern Form & Dialog */
.modern-dialog :deep(.el-dialog__body) {
  padding: 24px 32px;
}

.style-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.style-uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--primary-color);
  background: var(--bg-secondary);
}

.style-uploader :deep(.el-icon--upload) {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
}

.style-uploader :deep(.el-upload__text) {
  color: var(--text-secondary);
}

.style-uploader :deep(.el-upload-list__item) {
  margin-top: 16px; 
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
}
</style>
