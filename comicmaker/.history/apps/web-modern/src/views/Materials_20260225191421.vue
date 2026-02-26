<template>
  <div class="materials">
    <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="人物角色" name="characters"></el-tab-pane>
      <el-tab-pane label="场景" name="scenes"></el-tab-pane>
      <el-tab-pane label="道具" name="props"></el-tab-pane>
      <el-tab-pane label="其他" name="others"></el-tab-pane>
    </el-tabs>

    <div class="toolbar">
      <el-button type="primary" :icon="Plus" @click="dialogVisible = true">创建新素材</el-button>
    </div>

    <!-- 骨架屏加载状态 -->
    <el-skeleton :loading="loading" animated :count="3">
      <template #template>
        <el-card class="material-card mb-20">
          <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
          <div style="padding: 14px">
            <el-skeleton-item variant="h3" style="width: 50%" />
            <el-skeleton-item variant="text" style="width: 80%" />
          </div>
        </el-card>
      </template>

      <template #default>
        <div class="grid-container" v-if="materials.length > 0">
          <el-card v-for="item in materials" :key="item.id" :body-style="{ padding: '0px' }" class="material-card">
            <el-image 
              :src="getImageUrl(item.main_image, activeTab, item.id)" 
              fit="cover" 
              class="image"
              lazy
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div style="padding: 14px">
              <span class="card-title">{{ item.name }}</span>
              <div class="bottom">
                <p class="description">{{ item.description }}</p>
                <div class="actions">
                  <el-button text type="primary" @click="handleEdit(item)">编辑</el-button>
                  <el-button text type="danger" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无素材" />
      </template>
    </el-skeleton>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingItem ? '编辑素材' : '创建新素材'"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input v-model="formData.description" type="textarea" />
        </el-form-item>
        <el-form-item label="主图" required>
          <input type="file" ref="mainImageInput" @change="handleFileChange($event, 'main')" accept="image/*" />
          <div v-if="formData.main_image_preview" class="image-preview">
            <img :src="formData.main_image_preview" />
          </div>
        </el-form-item>
         <el-form-item label="辅助图1">
           <input type="file" ref="aux1ImageInput" @change="handleFileChange($event, 'aux1')" accept="image/*" />
           <div v-if="formData.aux1_image_preview" class="image-preview">
             <img :src="formData.aux1_image_preview" />
           </div>
        </el-form-item>
        <el-form-item label="辅助图2">
          <input type="file" ref="aux2ImageInput" @change="handleFileChange($event, 'aux2')" accept="image/*" />
          <div v-if="formData.aux2_image_preview" class="image-preview">
            <img :src="formData.aux2_image_preview" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Picture } from '@element-plus/icons-vue'
import { API } from '../api/client'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('characters')
const loading = ref(false)
const materials = ref<any[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const editingItem = ref<any>(null)

const formData = reactive({
  name: '',
  description: '',
  main_image: null as File | null,
  aux1_image: null as File | null,
  aux2_image: null as File | null,
  main_image_preview: '',
  aux1_image_preview: '',
  aux2_image_preview: ''
})

const mainImageInput = ref<HTMLInputElement | null>(null)
const aux1ImageInput = ref<HTMLInputElement | null>(null)
const aux2ImageInput = ref<HTMLInputElement | null>(null)

const resetForm = () => {
  editingItem.value = null
  formData.name = ''
  formData.description = ''
  formData.main_image = null
  formData.aux1_image = null
  formData.aux2_image = null
  formData.main_image_preview = ''
  formData.aux1_image_preview = ''
  formData.aux2_image_preview = ''
  if(mainImageInput.value) mainImageInput.value.value = ''
  if(aux1ImageInput.value) aux1ImageInput.value.value = ''
  if(aux2ImageInput.value) aux2ImageInput.value.value = ''
}

const handleFileChange = (event: Event, type: 'main' | 'aux1' | 'aux2') => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (type === 'main') {
      formData.main_image = file
      formData.main_image_preview = URL.createObjectURL(file)
    } else if (type === 'aux1') {
      formData.aux1_image = file
      formData.aux1_image_preview = URL.createObjectURL(file)
    } else if (type === 'aux2') {
      formData.aux2_image = file
      formData.aux2_image_preview = URL.createObjectURL(file)
    }
  }
}

const loadMaterials = async () => {
  loading.value = true
  try {
    const res = await API.listMaterials(activeTab.value)
    materials.value = res.materials || []
  } catch (error: any) {
    ElMessage.error('加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handleClick = () => {
  loadMaterials()
}

const getImageUrl = (path: string, type: string, id: string | number) => {
  if (!path) return ''
  return `/api/materials/${type}/${id}/image/${path}`
}

const handleEdit = (item: any) => {
  editingItem.value = item
  formData.name = item.name
  formData.description = item.description || ''
  
  // Set previews for existing images
  if (item.main_image) formData.main_image_preview = getImageUrl(item.main_image, activeTab.value, item.id)
  if (item.aux_images?.[0]) formData.aux1_image_preview = getImageUrl(item.aux_images[0], activeTab.value, item.id)
  if (item.aux_images?.[1]) formData.aux2_image_preview = getImageUrl(item.aux_images[1], activeTab.value, item.id)
  
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.name || !formData.description) {
    ElMessage.warning('请填写名称和描述')
    return
  }
  
  if (!editingItem.value && !formData.main_image) {
    ElMessage.warning('请上传主图')
    return
  }

  submitting.value = true
  
  const data = new FormData()
  data.append('name', formData.name)
  data.append('description', formData.description)
  if (formData.main_image) data.append('main_image', formData.main_image)
  if (formData.aux1_image) data.append('aux1_image', formData.aux1_image)
  if (formData.aux2_image) data.append('aux2_image', formData.aux2_image)

  try {
    if (editingItem.value) {
      await API.updateMaterial(activeTab.value, editingItem.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await API.createMaterial(activeTab.value, data)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadMaterials()
  } catch (error: any) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    submitting.value = false
  }
}

const handleDelete = (item: any) => {
  ElMessageBox.confirm('确定要删除这个素材吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await API.deleteMaterial(activeTab.value, item.id)
      ElMessage.success('删除成功')
      loadMaterials()
    } catch (e: any) {
      ElMessage.error('删除失败: ' + e.message)
    }
  })
}

onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.material-card {
  transition: transform 0.3s;
}
.material-card:hover {
  transform: translateY(-5px);
}
.image {
  width: 100%;
  height: 200px;
  display: block;
}
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}
.card-title {
  font-weight: bold;
  font-size: 16px;
}
.description {
  color: #999;
  font-size: 13px;
  margin: 10px 0;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: var(--text-secondary);
}
.bottom {
  margin-top: 13px;
  line-height: 12px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.mb-20 {
  margin-bottom: 20px;
}
.image-preview {
  margin-top: 10px;
  border: 1px dashed var(--border-color);
  padding: 5px;
  border-radius: 4px;
  background-color: var(--bg-secondary);
}
.image-preview img {
  max-width: 100%;
  max-height: 200px;
  display: block;
}
</style>
