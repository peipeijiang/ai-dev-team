<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">风格管理</h2>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建风格
        </el-button>
      </div>

      <div class="table-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索风格..."
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div v-loading="loading" class="styles-grid">
        <div
          v-for="style in stylesList"
          :key="style.id"
          class="style-card"
        >
          <div class="style-preview">
            <img v-if="style.preview" :src="style.preview" alt="风格预览" />
            <div v-else class="style-preview-placeholder">
              <el-icon :size="32" color="#c0c4cc"><Brush /></el-icon>
            </div>
          </div>
          <div class="style-info">
            <h3 class="style-name">{{ style.name }}</h3>
            <p class="style-desc">{{ style.description || '暂无描述' }}</p>
            <div class="style-tags">
              <el-tag v-for="tag in style.tags" :key="tag" size="small">{{ tag }}</el-tag>
            </div>
          </div>
          <div class="style-actions">
            <el-button text size="small" @click="handleEdit(style)">编辑</el-button>
            <el-button text size="small" type="danger" @click="handleDelete(style)">删除</el-button>
          </div>
        </div>
      </div>

      <div v-if="!loading && !stylesList.length" class="empty-state">
        <el-icon :size="48"><Brush /></el-icon>
        <p>暂无风格</p>
        <el-button type="primary" @click="handleCreate">创建第一个风格</el-button>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑风格' : '新建风格'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="风格名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入风格名称" />
        </el-form-item>
        <el-form-item label="风格描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入风格描述"
          />
        </el-form-item>
        <el-form-item label="风格标签">
          <el-select v-model="form.tags" multiple placeholder="选择或输入标签" allow-create filterable>
            <el-option label="漫画" value="漫画" />
            <el-option label="写实" value="写实" />
            <el-option label="卡通" value="卡通" />
            <el-option label="水彩" value="水彩" />
            <el-option label="油画" value="油画" />
            <el-option label="赛博朋克" value="赛博朋克" />
            <el-option label="古风" value="古风" />
          </el-select>
        </el-form-item>
        <el-form-item label="预览图片">
          <el-upload
            v-model:file-list="previewList"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handlePreviewSuccess"
          >
            <div class="preview-uploader">
              <img v-if="form.preview" :src="form.preview" class="preview-image" />
              <el-icon v-else class="preview-uploader-icon"><Plus /></el-icon>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Brush } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const stylesList = ref<any[]>([])
const searchQuery = ref('')

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const previewList = ref<UploadFile[]>([])

const form = reactive({
  id: '',
  name: '',
  description: '',
  tags: [] as string[],
  preview: ''
})

const rules = {
  name: [{ required: true, message: '请输入风格名称', trigger: 'blur' }]
}

const loadStyles = async () => {
  loading.value = true
  try {
    // 模拟数据
    stylesList.value = [
      {
        id: '1',
        name: '日式漫画',
        description: '经典的日本漫画风格，线条流畅，画面精美',
        tags: ['漫画', '日式'],
        preview: ''
      },
      {
        id: '2',
        name: '水彩风格',
        description: '柔和的水彩画效果，色彩通透',
        tags: ['水彩', '艺术'],
        preview: ''
      }
    ]
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadStyles()
}

const handleCreate = () => {
  isEdit.value = false
  form.id = ''
  form.name = ''
  form.description = ''
  form.tags = []
  form.preview = ''
  previewList.value = []
  dialogVisible.value = true
}

const handleEdit = (style: any) => {
  isEdit.value = true
  form.id = style.id
  form.name = style.name
  form.description = style.description || ''
  form.tags = style.tags || []
  form.preview = style.preview || ''
  dialogVisible.value = true
}

const handleDelete = async (style: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除风格「${style.name}」吗？`, '删除确认', { type: 'warning' })
    ElMessage.success('删除成功')
    loadStyles()
  } catch (error) {
    // 用户取消
  }
}

const handlePreviewSuccess = (response: any) => {
  form.preview = response.url
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    // await (isEdit.value ? stylesApi.update(form.id, form) : stylesApi.create(form))
    ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
    dialogVisible.value = false
    loadStyles()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadStyles()
})
</script>

<style scoped>
.styles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.style-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.style-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.style-preview {
  width: 100%;
  height: 160px;
  background: #f0f2f5;
}

.style-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.style-preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.style-info {
  padding: 16px;
}

.style-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.style-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.style-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.preview-uploader {
  width: 120px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.preview-uploader:hover {
  border-color: #409eff;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
