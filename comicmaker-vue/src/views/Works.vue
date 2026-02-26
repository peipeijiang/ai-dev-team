<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">作品管理</h2>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建作品
        </el-button>
      </div>

      <div class="table-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索作品名称..."
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div v-loading="loading" class="works-grid">
        <div
          v-for="work in worksList"
          :key="work.id"
          class="work-card"
          @click="goToDetail(work.id)"
        >
          <div class="work-cover">
            <img v-if="work.cover" :src="work.cover" alt="封面" />
            <div v-else class="work-cover-placeholder">
              <el-icon :size="48" color="#c0c4cc"><Picture /></el-icon>
            </div>
          </div>
          <div class="work-info">
            <h3 class="work-title">{{ work.name }}</h3>
            <p class="work-desc">{{ work.description || '暂无描述' }}</p>
            <div class="work-meta">
              <span><el-icon><Files /></el-icon> {{ work.episode_count || 0 }} 集</span>
              <span><el-icon><Clock /></el-icon> {{ formatDate(work.created_at) }}</span>
            </div>
          </div>
          <div class="work-actions" @click.stop>
            <el-dropdown trigger="click">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToDetail(work.id)">查看详情</el-dropdown-item>
                  <el-dropdown-item @click="handleEdit(work)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(work)" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div v-if="!loading && !worksList.length" class="empty-state">
        <el-icon :size="48"><FolderOpened /></el-icon>
        <p>暂无作品</p>
        <el-button type="primary" @click="handleCreate">创建第一个作品</el-button>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑作品' : '新建作品'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入作品名称" />
        </el-form-item>
        <el-form-item label="作品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入作品描述"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            v-model:file-list="coverList"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <div class="cover-uploader">
              <img v-if="form.cover" :src="form.cover" class="cover-preview" />
              <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Picture, Files, Clock, MoreFilled, FolderOpened } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const worksList = ref<any[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const coverList = ref<UploadFile[]>([])

const form = reactive({
  id: '',
  name: '',
  description: '',
  cover: ''
})

const rules = {
  name: [{ required: true, message: '请输入作品名称', trigger: 'blur' }]
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadWorks = async () => {
  loading.value = true
  try {
    // 模拟数据
    worksList.value = [
      {
        id: '1',
        name: '我的漫画作品',
        description: '这是一个测试作品',
        cover: '',
        episode_count: 5,
        created_at: new Date().toISOString()
      }
    ]
    total.value = worksList.value.length
  } catch (error) {
    console.error('加载作品失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadWorks()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadWorks()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadWorks()
}

const goToDetail = (id: string) => {
  router.push(`/works/${id}`)
}

const handleCreate = () => {
  isEdit.value = false
  form.id = ''
  form.name = ''
  form.description = ''
  form.cover = ''
  coverList.value = []
  dialogVisible.value = true
}

const handleEdit = (work: any) => {
  isEdit.value = true
  form.id = work.id
  form.name = work.name
  form.description = work.description || ''
  form.cover = work.cover || ''
  dialogVisible.value = true
}

const handleDelete = async (work: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除作品「${work.name}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning' }
    )
    // await worksApi.delete(work.id)
    ElMessage.success('删除成功')
    loadWorks()
  } catch (error) {
    // 用户取消
  }
}

const handleCoverSuccess = (response: any) => {
  form.cover = response.url
}

const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    // await (isEdit.value ? worksApi.update(form.id, form) : worksApi.create(form))
    ElMessage.success(isEdit.value ? '保存成功' : '创建成功')
    dialogVisible.value = false
    loadWorks()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadWorks()
})
</script>

<style scoped>
.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.work-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.work-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.work-cover {
  width: 100%;
  height: 180px;
  background: #f0f2f5;
}

.work-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.work-info {
  padding: 16px;
}

.work-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #c0c4cc;
}

.work-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.work-actions {
  position: absolute;
  top: 8px;
  right: 8px;
}

.cover-uploader {
  width: 120px;
  height: 160px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}

.cover-uploader:hover {
  border-color: #409eff;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
