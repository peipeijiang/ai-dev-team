<template>
  <div class="works-container">
    <div class="page-header">
      <h2>作品管理</h2>
      <el-button type="primary" @click="dialogVisible = true">
        <el-icon><Plus /></el-icon>创建新作品
      </el-button>
    </div>

    <div v-loading="loading">
      <el-empty v-if="!loading && works.length === 0" description="暂无作品，点击上方按钮创建" />
      
      <div v-else class="work-grid">
        <el-card v-for="work in works" :key="work.id" class="work-card" :body-style="{ padding: '0px' }">
          <div class="work-cover" @click="goToDetail(work.id)">
            <el-image 
              v-if="work.cover_images && work.cover_images.length"
              :src="getCoverUrl(work)" 
              fit="cover" 
              class="cover-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="no-cover">
              <el-icon><Picture /></el-icon>
              <span>无封面</span>
            </div>
          </div>
          <div class="work-info">
            <h3 class="work-title" :title="work.name" @click="goToDetail(work.id)">{{ work.name }}</h3>
            <p class="work-desc" :title="work.description">{{ work.description || '暂无描述' }}</p>
            <div class="work-actions">
              <el-button link type="primary" @click="goToDetail(work.id)">详情</el-button>
              <el-button link type="danger" @click="handleDelete(work)">删除</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑作品' : '创建新作品'"
      width="500px"
      @closed="resetForm"
    >
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入作品名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入作品描述" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Plus, Picture } from '@element-plus/icons-vue';
import { API, type Work } from '../api/client';

const router = useRouter();
const loading = ref(false);
const works = ref<Work[]>([]);
const dialogVisible = ref(false);
const submitting = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();

const form = reactive({
  id: '',
  name: '',
  description: ''
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入作品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

const loadWorks = async () => {
  loading.value = true;
  try {
    const res = await API.listWorks();
    works.value = res.works || [];
  } catch (error: any) {
    ElMessage.error(error.message || '加载作品列表失败');
  } finally {
    loading.value = false;
  }
};

const getCoverUrl = (work: Work) => {
  if (work.cover_images && work.cover_images.length > 0) {
    // 假设后端返回的是相对路径或文件名
    return `/data/works/${work.id}/${work.cover_images[0]}`; 
    // 注意: 这里并没有 /api/data 这样的通用接口，可能需要直接拼 URL
    // 老代码是: http://localhost:8000/data/works/${work.id}/${work.cover_images[0]}
    // 我们用 Vite 代理，所以如果是本地开发，应该是 /data/works/... ?
    // 但是 server/main.py 必须配置了 StaticFiles 用来挂载 data 目录。
    // 假设 main.py 有 app.mount("/data", StaticFiles(directory="data"), name="data")
  }
  return '';
};

// 检查是否需要 hack 封面图 URL
// 原 works.js: http://localhost:8000/data/works/...
// 在新架构中，我们可能需要通过 vite proxy 访问 /data/ 或者后端提供完整的 URL
// 如果后端没有改动，那么直接访问 /data 可能不行，或者是直接访问 http://localhost:8000/data
// 为了兼容开发和生产，最好让 API 返回完整 URL 或者前端统一处理 BASE_URL
const BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : ''; 
// 但在 template 中调用函数比较频繁，最好是直接计算

const goToDetail = (id: string) => {
  router.push(`/works/${id}`);
};

const handleDelete = (work: Work) => {
  ElMessageBox.confirm(
    '确定要删除这个作品吗？这将删除所有相关的剧集和内容，且不可恢复。',
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await API.deleteWork(work.id);
      ElMessage.success('删除成功');
      loadWorks();
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败');
    }
  });
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);

        if (isEdit.value && form.id) {
          await API.updateWork(form.id, formData);
          ElMessage.success('更新成功');
        } else {
          await API.createWork(formData);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        loadWorks();
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败');
      } finally {
        submitting.value = false;
      }
    }
  });
};

const resetForm = () => {
  form.id = '';
  form.name = '';
  form.description = '';
  isEdit.value = false;
  if(formRef.value) formRef.value.resetFields();
};

onMounted(() => {
  loadWorks();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
    color: var(--text-primary);
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.work-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  /* Background handled by theme.css .el-card */
}

.work-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  border-color: var(--accent-color);
}

.work-cover {
  height: 160px;
  background-color: rgba(30, 41, 59, 0.5); /* Semi-transparent dark bg */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.no-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
}

.work-info {
  padding: 15px;
}

.work-title {
  margin: 0 0 10px;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.work-desc {
  margin: 0 0 15px;
  font-size: 14px;
  color: var(--text-secondary);
  height: 40px;
  line-height: 20px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.work-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}
</style>
