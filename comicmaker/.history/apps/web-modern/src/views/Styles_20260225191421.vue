<template>
  <div class="styles-container">
    <div class="page-header">
      <h2>风格管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>创建新风格
      </el-button>
    </div>

    <div v-loading="loading" class="styles-list">
      <el-empty v-if="!loading && styles.length === 0" description="暂无风格" />

      <el-row :gutter="20">
        <el-col :span="6" v-for="style in styles" :key="style.id">
          <el-card class="style-card" :body-style="{ padding: '0px' }">
            <div class="image-wrapper">
               <el-image 
                v-if="style.reference_image"
                :src="getImageUrl(style.reference_image)" 
                fit="cover" 
                class="style-image"
               />
               <div v-else class="no-image">无参考图</div>
            </div>
            <div class="style-info">
              <h3>{{ style.name }}</h3>
              <p>{{ style.description }}</p>
              <div class="actions">
                <el-button type="primary" link @click="editStyle(style)">编辑</el-button>
                <el-button type="danger" link @click="deleteStyle(style)">删除</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑风格' : '创建风格'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="参考图">
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            :file-list="fileList"
            list-type="picture"
          >
            <el-button type="primary">选择图片</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { API, type Style } from '../api/client';
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const loading = ref(false);
const styles = ref<Style[]>([]);
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const fileList = ref<UploadFile[]>([]);

const form = reactive({
  id: '',
  name: '',
  description: '',
  file: null as File | null
});

const loadStyles = async () => {
  loading.value = true;
  try {
    const res = await API.getStyles();
    styles.value = res || [];
  } catch (e: any) {
    ElMessage.error(e.message);
  } finally {
    loading.value = false;
  }
};

const getImageUrl = (path: string) => {
  // 假设 path 是类似于 /data/styles/... 或 filename
  // 如果是 filename，则需要拼接
  // 如果是相对路径，则需要 API_BASE
  if (path.startsWith('http')) return path;
  return `/data/styles/${path}`; // 这里的 path 可能不对，需要根据实际后端返回调整
};

const openCreateDialog = () => {
  isEdit.value = false;
  form.id = '';
  form.name = '';
  form.description = '';
  form.file = null;
  fileList.value = [];
  dialogVisible.value = true;
};

const editStyle = (style: Style) => {
  isEdit.value = true;
  form.id = style.id;
  form.name = style.name;
  form.description = style.description || '';
  form.file = null;
  fileList.value = []; // 不显示已有图片在 upload 控件中，简化逻辑
  dialogVisible.value = true;
};

const handleFileChange = (uploadFile: UploadFile) => {
  form.file = uploadFile.raw as File;
};

const submitForm = async () => {
  if (!form.name) return ElMessage.warning('请输入名称');
  
  submitting.value = true;
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  if (form.file) {
    formData.append('reference_image', form.file);
  }

  try {
    if (isEdit.value) {
      await API.updateStyle(form.id, formData);
    } else {
      await API.createStyle(formData);
    }
    ElMessage.success('操作成功');
    dialogVisible.value = false;
    loadStyles();
  } catch (e: any) {
    ElMessage.error(e.message);
  } finally {
    submitting.value = false;
  }
};

const deleteStyle = (style: Style) => {
  ElMessageBox.confirm('确定删除吗？', '提示').then(async () => {
    await API.deleteStyle(style.id);
    loadStyles();
    ElMessage.success('删除成功');
  });
};

onMounted(loadStyles);
</script>

<style scoped>
.styles-container { padding: 20px; }
.page-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.style-card { margin-bottom: 20px; }
.image-wrapper { height: 150px; background: #eee; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.style-image { width: 100%; height: 100%; }
.style-info { padding: 10px; }
.no-image { color: #999; }
</style>
