<template>
  <div class="page-container">
    <div class="card">
      <div class="card-header">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="card-title">{{ isNew ? '新建剧集' : '编辑剧集' }}</h2>
      </div>

      <div v-loading="loading" class="episode-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="剧集名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入剧集名称" />
          </el-form-item>

          <el-form-item label="剧集描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              placeholder="请输入剧集描述"
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

          <el-divider />

          <div class="form-section">
            <div class="form-section-header">
              <h3 class="form-section-title">分镜管理</h3>
              <el-button size="small" @click="handleAddScene">
                <el-icon><Plus /></el-icon>
                添加分镜
              </el-button>
            </div>

            <div v-if="form.scenes.length" class="scenes-editor">
              <div v-for="(scene, index) in form.scenes" :key="index" class="scene-item">
                <div class="scene-header">
                  <span class="scene-number">分镜 {{ index + 1 }}</span>
                  <el-button text type="danger" size="small" @click="handleRemoveScene(index)">
                    删除
                  </el-button>
                </div>
                <el-form-item label="画面描述">
                  <el-input v-model="scene.description" type="textarea" :rows="2" placeholder="请描述这个分镜的画面内容" />
                </el-form-item>
                <el-form-item label="对话/文案">
                  <el-input v-model="scene.dialogue" type="textarea" :rows="2" placeholder="请输入对话或文案" />
                </el-form-item>
                <el-form-item label="分镜图片">
                  <el-upload
                    v-model:file-list="scene.imageList"
                    action="/api/upload"
                    :show-file-list="false"
                    :on-success="(res: any) => handleSceneImageSuccess(res, scene)"
                  >
                    <div class="scene-image-uploader">
                      <img v-if="scene.image" :src="scene.image" class="scene-image-preview" />
                      <el-icon v-else><Plus /></el-icon>
                    </div>
                  </el-upload>
                </el-form-item>
              </div>
            </div>
            <div v-else class="empty-scenes">
              <p>暂无分镜，点击上方按钮添加</p>
            </div>
          </div>
        </el-form>

        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isNew ? '创建' : '保存' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)
const coverList = ref<UploadFile[]>([])

const isNew = computed(() => route.params.id === 'new')

const form = reactive({
  id: '',
  name: '',
  description: '',
  cover: '',
  scenes: [] as any[]
})

const rules = {
  name: [{ required: true, message: '请输入剧集名称', trigger: 'blur' }]
}

const loadEpisode = async () => {
  if (isNew.value) return
  loading.value = true
  try {
    const episodeId = route.params.id as string
    // 模拟数据
    form.id = episodeId
    form.name = '第一集 开始的相遇'
    form.description = '主角与反派的第一次相遇，故事由此展开...'
    form.cover = ''
    form.scenes = [
      {
        description: '城市街道夜景，灯光闪烁',
        dialogue: '（内心独白）这就是我生活的城市...',
        image: '',
        imageList: []
      }
    ]
  } catch (error) {
    console.error('加载失败:', error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
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

const handleAddScene = () => {
  form.scenes.push({
    description: '',
    dialogue: '',
    image: '',
    imageList: []
  })
}

const handleRemoveScene = (index: number) => {
  form.scenes.splice(index, 1)
}

const handleSceneImageSuccess = (response: any, scene: any) => {
  scene.image = response.url
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    // await (isNew.value ? episodesApi.create(workId, form) : episodesApi.update(form.id, form))
    ElMessage.success(isNew.value ? '创建成功' : '保存成功')
    router.back()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadEpisode()
})
</script>

<style scoped>
.episode-form {
  max-width: 800px;
}

.cover-uploader {
  width: 160px;
  height: 100px;
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

.form-section {
  margin-top: 24px;
}

.form-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.scenes-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scene-item {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.scene-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.scene-number {
  font-weight: 500;
  color: #303133;
}

.scene-image-uploader {
  width: 120px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.scene-image-uploader:hover {
  border-color: #409eff;
}

.scene-image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-scenes {
  text-align: center;
  padding: 32px;
  color: #909399;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
