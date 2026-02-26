<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">AI 工具</h2>
      </div>

      <div class="tools-grid">
        <div
          v-for="tool in tools"
          :key="tool.id"
          class="tool-card"
          @click="handleUseTool(tool)"
        >
          <div class="tool-icon" :style="{ background: tool.color }">
            <el-icon :size="28" color="#fff"><component :is="tool.icon" /></el-icon>
          </div>
          <div class="tool-info">
            <h3 class="tool-name">{{ tool.name }}</h3>
            <p class="tool-desc">{{ tool.description }}</p>
          </div>
          <div class="tool-status">
            <el-tag :type="tool.available ? 'success' : 'info'" size="small">
              {{ tool.available ? '可用' : '即将上线' }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="tasks-section">
        <h3 class="section-title">任务历史</h3>
        <el-table :data="tasks" style="width: 100%">
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="tool" label="使用工具" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button text size="small" @click="handleViewTask(row)">查看</el-button>
              <el-button text size="small" type="danger" @click="handleDeleteTask(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 工具使用对话框 -->
    <el-dialog v-model="toolDialogVisible" :title="currentTool?.name" width="700px">
      <div class="tool-dialog-content">
        <p class="tool-dialog-desc">{{ currentTool?.description }}</p>
        
        <el-form v-if="currentTool?.id === 'text2image'" :model="toolForm" label-width="100px">
          <el-form-item label="提示词">
            <el-input
              v-model="toolForm.prompt"
              type="textarea"
              :rows="4"
              placeholder="请描述您想要的图片内容..."
            />
          </el-form-item>
          <el-form-item label="风格">
            <el-select v-model="toolForm.style" placeholder="选择风格">
              <el-option label="漫画" value="comic" />
              <el-option label="写实" value="realistic" />
              <el-option label="水彩" value="watercolor" />
              <el-option label="油画" value="oil" />
            </el-select>
          </el-form-item>
          <el-form-item label="负面提示">
            <el-input
              v-model="toolForm.negative_prompt"
              type="textarea"
              :rows="2"
              placeholder="不想出现的内容..."
            />
          </el-form-item>
        </el-form>

        <el-form v-else-if="currentTool?.id === 'image2image'" :model="toolForm" label-width="100px">
          <el-form-item label="参考图片">
            <el-upload
              v-model:file-list="toolFileList"
              action="/api/upload"
              :show-file-list="false"
              :on-change="handleToolFileChange"
            >
              <div class="tool-uploader">
                <img v-if="toolForm.image" :src="toolForm.image" class="tool-uploader-image" />
                <el-icon v-else><Plus /></el-icon>
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="修改描述">
            <el-input
              v-model="toolForm.prompt"
              type="textarea"
              :rows="4"
              placeholder="请描述您想要的修改..."
            />
          </el-form-item>
        </el-form>

        <el-form v-else-if="currentTool?.id === 'script'" :model="toolForm" label-width="100px">
          <el-form-item label="作品名称">
            <el-input v-model="toolForm.work_name" placeholder="请输入作品名称" />
          </el-form-item>
          <el-form-item label="作品类型">
            <el-select v-model="toolForm.genre" placeholder="选择类型">
              <el-option label="热血" value="action" />
              <el-option label="冒险" value="adventure" />
              <el-option label="科幻" value="sci-fi" />
              <el-option label="爱情" value="romance" />
              <el-option label="悬疑" value="mystery" />
            </el-select>
          </el-form-item>
          <el-form-item label="剧情概要">
            <el-input
              v-model="toolForm.summary"
              type="textarea"
              :rows="4"
              placeholder="请简要描述故事主线..."
            />
          </el-form-item>
          <el-form-item label="集数">
            <el-input-number v-model="toolForm.episodes" :min="1" :max="100" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="toolDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="toolRunning" @click="handleRunTool">
          {{ toolRunning ? '运行中...' : '开始生成' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 任务结果对话框 -->
    <el-dialog v-model="resultDialogVisible" title="生成结果" width="800px">
      <div v-if="currentTask" class="result-content">
        <div v-if="currentTask.status === 'success'" class="result-success">
          <h3>生成成功！</h3>
          <div v-if="currentTask.result?.images?.length" class="result-images">
            <img
              v-for="(img, index) in currentTask.result.images"
              :key="index"
              :src="img"
              class="result-image"
            />
          </div>
          <div v-if="currentTask.result?.script" class="result-script">
            <h4>生成的脚本：</h4>
            <pre>{{ currentTask.result.script }}</pre>
          </div>
        </div>
        <div v-else-if="currentTask.status === 'running'" class="result-running">
          <el-icon class="is-loading" :size="32"><Loading /></el-icon>
          <p>正在生成中，请稍候...</p>
        </div>
        <div v-else class="result-error">
          <p>生成失败，请重试</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading, Picture, Edit, Document, VideoCamera, MagicStick } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

const tools = ref([
  {
    id: 'text2image',
    name: '文生图',
    description: '根据文字描述生成图片，支持多种风格',
    icon: 'Picture',
    color: '#409eff',
    available: true
  },
  {
    id: 'image2image',
    name: '图生图',
    description: '参考已有图片生成新的图片',
    icon: 'Edit',
    color: '#67c23a',
    available: true
  },
  {
    id: 'script',
    name: '脚本生成',
    description: 'AI 自动生成漫画剧本和分镜脚本',
    icon: 'Document',
    color: '#e6a23c',
    available: true
  },
  {
    id: 'image2video',
    name: '图生视频',
    description: '将静态图片转换为动态视频',
    icon: 'VideoCamera',
    color: '#f56c6c',
    available: false
  },
  {
    id: 'style_transfer',
    name: '风格迁移',
    description: '将图片转换为指定艺术风格',
    icon: 'MagicStick',
    color: '#909399',
    available: false
  }
])

const tasks = ref<any[]>([])
const toolDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const currentTool = ref<any>(null)
const toolRunning = ref(false)
const toolFileList = ref<UploadFile[]>([])
const currentTask = ref<any>(null)

const toolForm = reactive({
  prompt: '',
  style: 'comic',
  negative_prompt: '',
  image: '',
  work_name: '',
  genre: 'action',
  summary: '',
  episodes: 12
})

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    success: 'success',
    running: 'warning',
    failed: 'danger',
    pending: 'info'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    success: '成功',
    running: '运行中',
    failed: '失败',
    pending: '等待中'
  }
  return texts[status] || status
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const loadTasks = async () => {
  // 模拟数据
  tasks.value = [
    {
      id: '1',
      name: '生成风景图',
      tool: '文生图',
      status: 'success',
      created_at: new Date().toISOString(),
      result: { images: [] }
    }
  ]
}

const handleUseTool = (tool: any) => {
  if (!tool.available) {
    ElMessage.warning('该功能即将上线，敬请期待')
    return
  }
  currentTool.value = tool
  // 重置表单
  Object.assign(toolForm, {
    prompt: '',
    style: 'comic',
    negative_prompt: '',
    image: '',
    work_name: '',
    genre: 'action',
    summary: '',
    episodes: 12
  })
  toolFileList.value = []
  toolDialogVisible.value = true
}

const handleToolFileChange = (file: UploadFile) => {
  // 处理文件选择
}

const handleRunTool = async () => {
  if (!toolForm.prompt && !toolForm.summary) {
    ElMessage.warning('请输入生成内容')
    return
  }
  toolRunning.value = true
  try {
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('任务已提交，请稍候查看结果')
    toolDialogVisible.value = false
    loadTasks()
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    toolRunning.value = false
  }
}

const handleViewTask = (task: any) => {
  currentTask.value = task
  resultDialogVisible.value = true
}

const handleDeleteTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '删除确认', { type: 'warning' })
    ElMessage.success('删除成功')
    loadTasks()
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-card:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.tool-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.tool-desc {
  font-size: 13px;
  color: #909399;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.tool-dialog-desc {
  color: #606266;
  margin-bottom: 20px;
}

.tool-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tool-uploader:hover {
  border-color: #409eff;
}

.tool-uploader-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-success h3 {
  color: #67c23a;
  margin-bottom: 16px;
}

.result-images {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.result-image {
  width: 100%;
  border-radius: 8px;
}

.result-script pre {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  font-size: 14px;
}

.result-running {
  text-align: center;
  padding: 40px;
}

.result-running p {
  margin-top: 16px;
  color: #909399;
}
</style>
