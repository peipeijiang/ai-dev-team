<template>
  <div class="works-container">
    <header class="page-header">
      <div class="header-left">
        <h2 class="page-title">Projects</h2>
        <span class="page-subtitle">Manage and organize your creative works</span>
      </div>
      <el-button type="primary" size="large" round class="create-btn" @click="dialogVisible = true">
        <el-icon class="mr-2"><Plus /></el-icon> New Project
      </el-button>
    </header>

    <div v-loading="loading" class="content-body">
      <el-empty 
        v-if="!loading && works.length === 0" 
        description="No projects yet. Start by creating one!" 
        :image-size="200"
      >
        <el-button type="primary" @click="dialogVisible = true">Create First Project</el-button>
      </el-empty>
      
      <div v-else class="work-grid">
        <div v-for="work in works" :key="work.id" class="project-card" @click="goToDetail(work.id)">
          <div class="card-cover">
            <el-image 
              v-if="work.cover_images && work.cover_images.length"
              :src="getCoverUrl(work)" 
              fit="cover" 
              class="cover-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-placeholder gradient-placeholder">
              <span class="placeholder-text">{{ work.name.charAt(0).toUpperCase() }}</span>
            </div>
            
            <div class="card-overlay">
              <el-button circle class="action-btn" @click.stop="goToDetail(work.id)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button circle type="danger" class="action-btn" @click.stop="handleDelete(work)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="work-title" :title="work.name">{{ work.name }}</h3>
            <p class="work-desc">{{ work.description || 'No description provided' }}</p>
            <div class="work-meta">
              <span class="date">Updated recently</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Edit Project' : 'New Project'"
      width="480px"
      class="custom-dialog"
      @closed="resetForm"
      destroy-on-close
      center
    >
      <el-form :model="form" label-position="top" :rules="rules" ref="formRef" class="modern-form">
        <el-form-item label="Project Name" prop="name">
          <el-input v-model="form.name" placeholder="e.g. The Matrix Reborn" size="large" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="Add a short description..." 
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large" round>Cancel</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting" size="large" round>
            {{ isEdit ? 'Save Changes' : 'Create Project' }}
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
import { Plus, Picture, Edit, Delete } from '@element-plus/icons-vue';
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
    { required: true, message: 'Please enter project name', trigger: 'blur' },
    { min: 1, max: 50, message: 'Length should be 1 to 50', trigger: 'blur' }
  ]
};

const loadWorks = async () => {
  loading.value = true;
  try {
    const res = await API.listWorks();
    works.value = res.works || [];
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to load projects');
  } finally {
    loading.value = false;
  }
};

const getCoverUrl = (work: Work) => {
  if (work.cover_images && work.cover_images.length > 0) {
    return `/data/works/${work.id}/${work.cover_images[0]}`; 
  }
  return '';
};

const goToDetail = (id: string) => {
  router.push(`/works/${id}`);
};

const handleDelete = (work: Work) => {
  ElMessageBox.confirm(
    'Are you sure you want to delete this project? This action cannot be undone.',
    'Warning',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await API.deleteWork(work.id);
      ElMessage.success('Project deleted');
      loadWorks();
    } catch (error: any) {
      ElMessage.error(error.message || 'Delete failed');
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
          ElMessage.success('Updated successfully');
        } else {
          await API.createWork(formData);
          ElMessage.success('Created successfully');
        }
        dialogVisible.value = false;
        loadWorks();
      } catch (error: any) {
        ElMessage.error(error.message || 'Operation failed');
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
.works-container {
  padding: 32px 48px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 28px;
  color: var(--text-primary);
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.create-btn {
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.work-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
}

/* Card Styling */
.project-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-light);
}

.card-cover {
  height: 180px;
  position: relative;
  overflow: hidden;
  background: #f1f5f9;
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.project-card:hover .cover-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 32px;
}

.gradient-placeholder {
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
}

.placeholder-text {
  font-size: 48px;
  font-weight: 800;
  color: var(--accent-light);
  opacity: 0.5;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

.project-card:hover .card-overlay {
  opacity: 1;
}

.action-btn {
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover .action-btn {
  transform: translateY(0);
}

.card-content {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.work-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.work-meta {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .works-container {
    padding: 24px;
  }
  .work-grid {
    grid-template-columns: 1fr;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .create-btn {
    width: 100%;
  }
}
</style>
