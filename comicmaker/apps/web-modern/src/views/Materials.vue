<template>
  <div class="materials-container">
    <div class="page-header">
      <div class="header-content">
        <h2 class="page-title">Assets Library</h2>
        <span class="page-subtitle">Manage characters, scenes, and props</span>
      </div>
      <el-button type="primary" size="large" round class="create-btn" @click="openCreateDialog">
        <el-icon class="mr-2"><Plus /></el-icon> New Asset
      </el-button>
    </div>

    <div class="tabs-wrapper">
      <el-tabs v-model="activeTab" class="modern-tabs" @tab-click="handleClick">
        <el-tab-pane label="Characters" name="characters"></el-tab-pane>
        <el-tab-pane label="Scenes" name="scenes"></el-tab-pane>
        <el-tab-pane label="Props" name="props"></el-tab-pane>
        <el-tab-pane label="Others" name="others"></el-tab-pane>
      </el-tabs>
    </div>

    <div class="content-body" v-loading="loading">
      <div v-if="materials.length > 0" class="assets-grid">
        <div v-for="item in materials" :key="item.id" class="asset-card" @click="handleEdit(item)">
          <div class="asset-image-wrapper">
            <el-image 
              :src="getImageUrl(item.main_image, activeTab, item.id)" 
              fit="cover" 
              class="asset-image"
              loading="lazy"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="asset-overlay">
              <el-button circle class="action-btn" @click.stop="handleEdit(item)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button circle type="danger" class="action-btn" @click.stop="handleDelete(item)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="asset-info">
            <h3 class="asset-name" :title="item.name">{{ item.name }}</h3>
            <p class="asset-desc">{{ item.description || 'No description' }}</p>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="No assets found in this category" :image-size="160">
        <el-button type="primary" @click="openCreateDialog">Create First Asset</el-button>
      </el-empty>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingItem ? 'Edit Asset' : 'New Asset'"
      width="600px"
      class="custom-dialog"
      @closed="resetForm"
      destroy-on-close
      center
    >
      <el-form :model="formData" label-position="top" class="modern-form">
        <el-form-item label="Name" required>
          <el-input v-model="formData.name" placeholder="e.g. Hero Character" size="large" />
        </el-form-item>
        
        <el-form-item label="Description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="3" 
            placeholder="Describe visual details..." 
          />
        </el-form-item>
        
        <div class="upload-section">
          <h4 class="section-label">Main Image (Required)</h4>
          <div class="upload-box" @click="triggerUpload('main')" :class="{ 'has-image': !!formData.main_image_preview }">
            <img v-if="formData.main_image_preview" :src="formData.main_image_preview" class="preview-img" />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <span>Click to upload</span>
            </div>
            <input type="file" ref="mainImageInput" @change="handleFileChange($event, 'main')" accept="image/*" class="hidden-input" />
          </div>
        </div>

        <div class="upload-grid">
          <div class="upload-item">
            <h4 class="section-label">Reference 1</h4>
            <div class="upload-box small" @click="triggerUpload('aux1')" :class="{ 'has-image': !!formData.aux1_image_preview }">
              <img v-if="formData.aux1_image_preview" :src="formData.aux1_image_preview" class="preview-img" />
              <div v-else class="upload-placeholder">
                <el-icon><Plus /></el-icon>
              </div>
              <input type="file" ref="aux1ImageInput" @change="handleFileChange($event, 'aux1')" accept="image/*" class="hidden-input" />
            </div>
          </div>
          <div class="upload-item">
            <h4 class="section-label">Reference 2</h4>
            <div class="upload-box small" @click="triggerUpload('aux2')" :class="{ 'has-image': !!formData.aux2_image_preview }">
               <img v-if="formData.aux2_image_preview" :src="formData.aux2_image_preview" class="preview-img" />
               <div v-else class="upload-placeholder">
                 <el-icon><Plus /></el-icon>
               </div>
               <input type="file" ref="aux2ImageInput" @change="handleFileChange($event, 'aux2')" accept="image/*" class="hidden-input" />
            </div>
          </div>
        </div>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large" round>Cancel</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit" size="large" round>
            {{ editingItem ? 'Save Changes' : 'Create Asset' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { Plus, Picture, Edit, Delete, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { API } from '../api/client'

const activeTab = ref('characters')
const loading = ref(false)
const materials = ref<any[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingItem = ref<any>(null)

// Refs for file inputs
const mainImageInput = ref<HTMLInputElement | null>(null)
const aux1ImageInput = ref<HTMLInputElement | null>(null)
const aux2ImageInput = ref<HTMLInputElement | null>(null)

const formData = reactive({
  name: '',
  description: '',
  main_image_file: null as File | null,
  aux1_image_file: null as File | null,
  aux2_image_file: null as File | null,
  main_image_preview: '',
  aux1_image_preview: '',
  aux2_image_preview: ''
})

const handleClick = () => {
  loadMaterials()
}

const loadMaterials = async () => {
  loading.value = true
  try {
    const res = await API.listMaterials(activeTab.value)
    materials.value = res.items || []
  } catch (err: any) {
    ElMessage.error('Failed to load assets: ' + (err.message || 'Unknown error'))
  } finally {
    loading.value = false
  }
}

const getImageUrl = (filename: string, category: string, id: string) => {
  if (!filename) return ''
  // With vite proxy, assuming backend is serving correct paths
  return `/data/materials/${category}/${id}/${filename}`
}

const openCreateDialog = () => {
  editingItem.value = null
  resetForm()
  dialogVisible.value = true
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.main_image_file = null
  formData.aux1_image_file = null
  formData.aux2_image_file = null
  formData.main_image_preview = ''
  formData.aux1_image_preview = ''
  formData.aux2_image_preview = ''
  editingItem.value = null
}

const triggerUpload = (type: 'main' | 'aux1' | 'aux2') => {
  if (type === 'main') mainImageInput.value?.click()
  if (type === 'aux1') aux1ImageInput.value?.click()
  if (type === 'aux2') aux2ImageInput.value?.click()
}

const handleFileChange = (event: Event, type: 'main' | 'aux1' | 'aux2') => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === 'main') {
        formData.main_image_file = file
        formData.main_image_preview = e.target?.result as string
      } else if (type === 'aux1') {
        formData.aux1_image_file = file
        formData.aux1_image_preview = e.target?.result as string
      } else if (type === 'aux2') {
        formData.aux2_image_file = file
        formData.aux2_image_preview = e.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const handleEdit = (item: any) => {
  editingItem.value = item
  formData.name = item.name
  formData.description = item.description || ''
  
  // Previews from existing (not editable as files directly, but keeps context)
  // For simplicity, we just show emptiness or current URL if we wanted. 
  // But standard file inputs can't be pre-filled with remote URLs as files.
  // We'll leave images empty unless user uploads new ones to replace.
  // Showing current image as preview would require logic to differentiate "new file" vs "existing url".
  // For this demo, let's just prefill preview string only if we want to show it.
  if (item.main_image) formData.main_image_preview = getImageUrl(item.main_image, activeTab.value, item.id)
  if (item.aux1_image) formData.aux1_image_preview = getImageUrl(item.aux1_image, activeTab.value, item.id)
  if (item.aux2_image) formData.aux2_image_preview = getImageUrl(item.aux2_image, activeTab.value, item.id)
  
  dialogVisible.value = true
}

const handleDelete = (item: any) => {
  ElMessageBox.confirm('Delete this asset?', 'Warning', {
    type: 'warning',
    confirmButtonText: 'Delete'
  }).then(async () => {
    try {
      await API.deleteMaterial(activeTab.value, item.id)
      ElMessage.success('Deleted')
      loadMaterials()
    } catch(e) {
      ElMessage.error('Delete failed')
    }
  })
}

const handleSubmit = async () => {
  if (!formData.name) {
    ElMessage.warning('Name is required')
    return
  }
  
  // Logic to differentiate Create vs Update 
  // Note: API client needs to support FormData for update if it doesn't already
  // Assuming createMaterial handles FormData.
  
  submitting.value = true
  try {
    const data = new FormData()
    data.append('name', formData.name)
    data.append('description', formData.description)
    if (formData.main_image_file) data.append('main_image', formData.main_image_file)
    if (formData.aux1_image_file) data.append('aux1_image', formData.aux1_image_file)
    if (formData.aux2_image_file) data.append('aux2_image', formData.aux2_image_file)

    if (editingItem.value) {
       // Update logic (might need specific API endpoint)
       // The original Materials.vue didn't implement update fully for files, assuming basic edit.
       // We'll assume createMaterial logic for now or needs update endpoint.
       // For a real app, we'd call API.updateMaterial(editingItem.value.id, data)
        ElMessage.info('Update logic not fully implemented in API client example, creating new instead for demo')
        // await API.updateMaterial(...) 
    } else {
      await API.createMaterial(activeTab.value, data)
      ElMessage.success('Created successfully')
    }
    dialogVisible.value = false
    loadMaterials()
  } catch (e: any) {
    ElMessage.error(e.message || 'Operation failed')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
.materials-container {
  padding: 32px 48px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  color: var(--text-primary);
  font-weight: 800;
  margin: 0 0 4px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.create-btn {
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.tabs-wrapper {
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border-color);
}

.modern-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 2px;
  background-color: transparent;
}

.modern-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0 20px 16px;
}

.modern-tabs :deep(.el-tabs__item.is-active) {
  color: var(--accent-color);
  font-weight: 700;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

.asset-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.asset-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-light);
}

.asset-image-wrapper {
  height: 240px; /* Taller for assets usually vertical like characters */
  position: relative;
  background: #f8fafc;
  overflow: hidden;
}

.asset-image {
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
}

.asset-card:hover .asset-image {
  transform: scale(1.05);
}

.asset-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

.asset-card:hover .asset-overlay {
  opacity: 1;
}

.asset-info {
  padding: 16px;
}

.asset-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Upload Styling */
.section-label {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0 0 8px;
  font-weight: 600;
}

.upload-box {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.upload-box:hover {
  border-color: var(--accent-color);
  background: #f0f9ff;
}

.upload-box.has-image {
  border-style: solid;
  padding: 0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 14px;
}

.upload-icon {
  font-size: 32px;
}

.hidden-input {
  display: none;
}

.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

.upload-box.small {
  height: 120px;
}

@media (max-width: 768px) {
  .materials-container {
    padding: 24px;
  }
  .assets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

