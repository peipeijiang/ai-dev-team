<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">素材管理</h2>
        <el-button type="primary" @click="handleUpload">
          <el-icon><Upload /></el-icon>
          上传素材
        </el-button>
      </div>

      <div class="table-toolbar">
        <el-radio-group v-model="activeCategory" @change="handleCategoryChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="characters">角色</el-radio-button>
          <el-radio-button label="backgrounds">背景</el-radio-button>
          <el-radio-button label="props">道具</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="searchQuery"
          placeholder="搜索素材..."
          clearable
          style="width: 250px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div v-loading="loading" class="materials-grid">
        <div
          v-for="material in materialsList"
          :key="material.id"
          class="material-card"
          @click="handlePreview(material)"
        >
          <div class="material-cover">
            <img v-if="material.thumbnail" :src="material.thumbnail" alt="素材" />
            <div v-else class="material-cover-placeholder">
              <el-icon :size="32" color="#c0c4cc"><Picture /></el-icon>
            </div>
          </div>
          <div class="material-info">
            <h4 class="material-name">{{ material.name }}</h4>
            <div class="material-meta">
              <el-tag size="small" :type="getCategoryType(material.category)">
                {{ getCategoryName(material.category) }}
              </el-tag>
              <span>{{ formatDate(material.created_at) }}</span>
            </div>
          </div>
          <div class="material-actions" @click.stop>
            <el-dropdown trigger="click">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handlePreview(material)">预览</el-dropdown-item>
                  <el-dropdown-item @click="handleEdit(material)">重命名</el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(material)" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div v-if="!loading && !materialsList.length" class="empty-state">
        <el-icon :size="48"><Picture /></el-icon>
        <p>暂无素材</p>
        <el-button type="primary" @click="handleUpload">上传第一个素材</el-button>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :total="total"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传素材" width="500px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="素材名称">
          <el-input v-model="uploadForm.name" placeholder="请输入素材名称" />
        </el-form-item>
        <el-form-item label="素材分类">
          <el-select v-model="uploadForm.category" placeholder="请选择分类">
            <el-option label="角色" value="characters" />
            <el-option label="背景" value="backgrounds" />
            <el-option label="道具" value="props" />
          </el-select>
        </el-form-item>
        <el-form-item label="素材描述">
          <el-input v-model="uploadForm.description" type="textarea" placeholder="请输入素材描述" :rows="3" />
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            ref="uploadRef"
            v-model:file-list="uploadFileList"
            action="/api/materials/upload"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="10"
            drag
            multiple
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">支持 jpg、png、gif 格式，单个文件不超过 10MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleSubmitUpload">上传</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="素材预览" width="800px">
      <div class="preview-content">
        <img v-if="previewMaterial?.url" :src="previewMaterial.url" class="preview-image" />
        <div class="preview-info">
          <h3>{{ previewMaterial?.name }}</h3>
          <p>分类：{{ getCategoryName(previewMaterial?.category) }}</p>
          <p>上传时间：{{ formatDate(previewMaterial?.created_at) }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Upload, Search, Picture, MoreFilled, UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const materialsList = ref<any[]>([])
const searchQuery = ref('')
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(24)
const total = ref(0)

const uploadDialogVisible = ref(false)
const uploadRef = ref()
const uploading = ref(false)
const uploadFileList = ref<UploadFile[]>([])
const uploadForm = reactive({
  name: '',
  category: 'characters',
  description: ''
})

const previewDialogVisible = ref(false)
const previewMaterial = ref<any>(null)

const categoryMap: Record<string, string> = {
  characters: '角色',
  backgrounds: '背景',
  props: '道具'
}

const getCategoryName = (category: string) => categoryMap[category] || category

const getCategoryType = (category: string) => {
  const types: Record<string, any> = {
    characters: '',
    backgrounds: 'success',
    props: 'warning'
  }
  return types[category] || ''
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadMaterials = async () => {
  loading.value = true
  try {
    // material_type: characters, scenes, props
    const materialTypeMap: Record<string, string> = {
      'all': 'characters',
      'characters': 'characters',
      'backgrounds': 'scenes',
      'props': 'props'
    }
    const materialType = materialTypeMap[activeCategory.value] || 'characters'
    
    const response = await fetch(`/api/materials/${materialType}`)
    const data = await response.json()
    materialsList.value = data.materials || []
    total.value = materialsList.value.length
  } catch (error) {
    console.error('加载失败:', error)
    materialsList.value = []
  } finally {
    loading.value = false
  }
}

const handleCategoryChange = () => {
  currentPage.value = 1
  loadMaterials()
}

const handleSearch = () => {
  currentPage.value = 1
  loadMaterials()
}

const handlePageChange = () => {
  loadMaterials()
}

const handleUpload = () => {
  uploadForm.name = ''
  uploadForm.category = 'characters'
  uploadForm.description = ''
  uploadFileList.value = []
  uploadDialogVisible.value = true
}

const handleFileChange = (file: UploadFile) => {
  if (!uploadForm.name && file.name) {
    uploadForm.name = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleSubmitUpload = async () => {
  if (!uploadFileList.value.length) {
    ElMessage.warning('请选择要上传的文件')
    return
  }
  if (!uploadForm.name) {
    ElMessage.warning('请输入素材名称')
    return
  }
  
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('name', uploadForm.name)
    formData.append('description', uploadForm.description || '')
    formData.append('main_image', uploadFileList.value[0].raw)
    
    const materialTypeMap: Record<string, string> = {
      'characters': 'characters',
      'backgrounds': 'scenes',
      'props': 'props'
    }
    const materialType = materialTypeMap[uploadForm.category] || 'characters'
    
    const baseUrl = window.location.port === '3000' ? 'http://localhost:8000' : '/api'
    await axios.post(`${baseUrl}/api/materials/${materialType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    ElMessage.success('上传成功')
    loadMaterials()
  } catch (error: any) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + (error.response?.data?.detail || error.message))
  } finally {
    uploading.value = false
  }
}

const handlePreview = (material: any) => {
  previewMaterial.value = material
  previewDialogVisible.value = true
}

const handleEdit = (material: any) => {
  ElMessage.info('编辑功能开发中')
}

const handleDelete = async (material: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除素材「${material.name}」吗？`, '删除确认', { type: 'warning' })
    ElMessage.success('删除成功')
    loadMaterials()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.material-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.material-cover {
  width: 100%;
  height: 140px;
  background: #f0f2f5;
}

.material-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.material-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-info {
  padding: 12px;
}

.material-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #c0c4cc;
}

.material-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

.preview-content {
  display: flex;
  gap: 24px;
}

.preview-image {
  max-width: 500px;
  max-height: 500px;
  object-fit: contain;
  background: #f0f2f5;
  border-radius: 8px;
}

.preview-info {
  flex: 1;
}

.preview-info h3 {
  margin-bottom: 16px;
}

.preview-info p {
  color: #606266;
  margin-bottom: 8px;
}
</style>
