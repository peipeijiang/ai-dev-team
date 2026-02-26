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

    <!-- 这里可以添加新增/编辑弹窗 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Picture } from '@element-plus/icons-vue'
import { API } from '../api/client'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('characters')
const loading = ref(false)
const materials = ref<any[]>([])
const dialogVisible = ref(false)

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
  ElMessage.info('编辑功能开发中')
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
</style>
