<template>
  <el-dialog
    v-model="visible"
    title="选择素材"
    width="800px"
    @open="loadMaterials"
    destroy-on-close
  >
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部" name="all"></el-tab-pane>
      <el-tab-pane label="人物" name="characters"></el-tab-pane>
      <el-tab-pane label="场景" name="scenes"></el-tab-pane>
      <el-tab-pane label="道具" name="props"></el-tab-pane>
    </el-tabs>

    <div class="material-grid" v-loading="loading">
      <el-empty v-if="materials.length === 0 && !loading" description="暂无素材" />
      
      <div 
        v-for="item in materials" 
        :key="item.id" 
        class="material-item"
        :class="{ selected: selectedId === item.id }"
        @click="selectMaterial(item)"
      >
        <el-image 
          :src="getAssetUrl(item.cover_image || item.image_url)" 
          fit="cover" 
          class="material-cover"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="material-name">{{ item.name }}</div>
        <div class="material-check" v-if="selectedId === item.id">
          <el-icon><Check /></el-icon>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection" :disabled="!selectedId">
          确认选择
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { API } from '../api/client';
import { Picture, Check } from '@element-plus/icons-vue';

const props = defineProps<{
  modelValue: boolean;
  type?: string; 
}>();

const emit = defineEmits(['update:modelValue', 'select']);

const visible = ref(false);
const activeTab = ref('all');
const materials = ref<any[]>([]);
const loading = ref(false);
const selectedId = ref<string | number | null>(null);
const selectedItem = ref<any>(null);

watch(() => props.modelValue, (val) => {
  visible.value = val;
});

watch(visible, (val) => {
  emit('update:modelValue', val);
});

const handleTabChange = () => {
  loadMaterials();
};

const loadMaterials = async () => {
  loading.value = true;
  selectedId.value = null;
  selectedItem.value = null;
  materials.value = [];

  try {
    const typesToLoad = activeTab.value === 'all' 
      ? ['characters', 'scenes', 'props'] 
      : [activeTab.value];
    
    let allItems: any[] = [];
    
    // Parallel loading
    await Promise.all(typesToLoad.map(async (type) => {
      try {
        const res = await API.listMaterials(type);
        // backend returns { items: [...] } or just array? 
        // Based on client.ts: return this.request(`/materials/${type}`);
        // Let's assume standard response format. Legacy code: response.materials || []
        const list = res.materials || res.items || res || [];
        // Add type info if missing
        list.forEach((item: any) => item._type = type);
        allItems = allItems.concat(list);
      } catch (e) {
        console.error(`Failed to load ${type}`, e);
      }
    }));

    materials.value = allItems;
  } finally {
    loading.value = false;
  }
};

const selectMaterial = (item: any) => {
  selectedId.value = item.id;
  selectedItem.value = item;
};

const confirmSelection = () => {
  if (selectedItem.value) {
    emit('select', selectedItem.value);
    visible.value = false;
  }
};

const getAssetUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
};
</script>

<style scoped>
.material-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.material-item {
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  background-color: var(--bg-glass);
  padding: 4px;
}

.material-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.material-item.selected {
  border-color: var(--accent-color);
  background-color: rgba(56, 189, 248, 0.1);
}

.material-cover {
  width: 100%;
  height: 120px;
  border-radius: 4px;
  background-color: var(--bg-secondary);
  display: block;
}

.material-name {
  margin-top: 5px;
  font-size: 12px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}

.material-check {
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 30px;
}
</style>
