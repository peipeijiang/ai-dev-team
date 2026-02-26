import '@/styles/main.css';
import '@/styles/materials.css';
import { API } from '@/api/client';
import { showAlertDialog, showConfirmDialog } from '@/utils/dialog';
import { initImageUpload, previewImage } from '@/utils/image-upload';

// 类型定义
interface Material {
    id: string | number;
    name: string;
    description?: string;
    main_image?: string;
    aux_images?: string[];
    [key: string]: any;
}

// 全局状态
let currentType = 'characters';
let currentMaterial: Material | null = null;
let imageCacheTimestamp = Date.now();

const typeNames: Record<string, string> = {
    characters: '人物角色',
    scenes: '场景',
    props: '道具',
    others: '其他'
};

document.addEventListener('DOMContentLoaded', () => {
    // 标签切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            if(target.dataset.type) {
                currentType = target.dataset.type;
                const titleEl = document.getElementById('section-title');
                if(titleEl) titleEl.textContent = typeNames[currentType];
                loadMaterials();
            }
        });
    });

    // 创建按钮
    const createBtn = document.getElementById('create-btn');
    if(createBtn) {
        createBtn.addEventListener('click', () => {
            openModal();
        });
    }
    
    // 初始化图片上传组件
    initImageUpload('main-image', 'main-image-preview', {
        onChange: (files: File[]) => {
            if (files.length > 0) {
                // 预览已通过 displayPreview 处理
            }
        }
    });

    initImageUpload('aux1-image', 'aux1-image-preview', {
        onChange: (files: File[]) => {
            if (files.length > 0) {
                // 预览已通过 displayPreview 处理
            }
        }
    });
    
    initImageUpload('aux2-image', 'aux2-image-preview', {
        onChange: (files: File[]) => {
            if (files.length > 0) {
                // 预览已通过 displayPreview 处理
            }
        }
    });

    // 关闭模态框
    const closeModalElements = [
        document.getElementById('close-modal'),
        document.getElementById('cancel-btn')
    ];
    closeModalElements.forEach(el => {
        if(el) el.addEventListener('click', closeModal);
    });

    // 表单提交
    const form = document.getElementById('material-form');
    if(form) {
        form.addEventListener('submit', handleSubmit);
    }

    // 图片预览 (原生 file input change 事件)
    ['main-image', 'aux1-image', 'aux2-image'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                previewImage(target, id + '-preview');
            });
        }
    });

    // 初始加载
    loadMaterials();
});

async function loadMaterials() {
    try {
        imageCacheTimestamp = Date.now();
        const response = await API.listMaterials(currentType);
        const materials = response.materials || [];
        renderMaterials(materials);
    } catch (error: any) {
        console.error('加载素材失败:', error);
        await showAlertDialog('加载素材失败: ' + error.message, '错误');
    }
}

function renderMaterials(materials: Material[]) {
    const listEl = document.getElementById('materials-list');
    if(!listEl) return;
    
    if (materials.length === 0) {
        listEl.innerHTML = '<p style="text-align: center; color: #7f8c8d;">暂无素材，点击"创建新素材"开始创建</p>';
        return;
    }

    listEl.innerHTML = materials.map(material => `
        <div class="material-card">
            <img src="${getImageUrl(material.main_image, currentType, material.id)}" 
                 alt="${material.name}" 
                 class="material-card-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E无图片%3C/text%3E%3C/svg%3E'">
            <div class="material-card-content">
                <div class="material-card-title">${material.name}</div>
                <div class="material-card-description">${material.description || ''}</div>
                <div class="material-card-actions">
                    <button class="btn btn-primary" onclick="window.editMaterial('${material.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="window.deleteMaterial('${material.id}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function getImageUrl(imagePath: string | undefined, type: string, id: string | number) {
    if (!imagePath) return '';
    // 使用相对路径 /api，依赖 Vite 代理
    return `/api/materials/${type}/${id}/image/${imagePath}?t=${imageCacheTimestamp}`;
}

function openModal(material: Material | null = null) {
    currentMaterial = material;
    const modal = document.getElementById('material-modal') as HTMLDialogElement;
    const form = document.getElementById('material-form') as HTMLFormElement;
    
    if(!modal || !form) return;

    (document.getElementById('material-type') as HTMLInputElement).value = currentType;
    (document.getElementById('modal-title') as HTMLElement).textContent = material ? '编辑素材' : '创建新素材';
    
    const idInput = document.getElementById('material-id') as HTMLInputElement;
    const nameInput = document.getElementById('material-name') as HTMLInputElement;
    const descInput = document.getElementById('material-description') as HTMLTextAreaElement;
    const mainImageInput = document.getElementById('main-image') as HTMLInputElement;

    if (material) {
        if(idInput) idInput.value = String(material.id);
        if(nameInput) nameInput.value = material.name || '';
        if(descInput) descInput.value = material.description || '';
        
        // 显示现有图片预览
        const mainPreview = document.getElementById('main-image-preview');
        if (mainPreview && material.main_image) {
            mainPreview.innerHTML = 
                `<img src="${getImageUrl(material.main_image, currentType, material.id)}" alt="主图">`;
            mainPreview.classList.add('show');
        }
        
        const aux1Preview = document.getElementById('aux1-image-preview');
        if (aux1Preview && material.aux_images && material.aux_images[0]) {
            aux1Preview.innerHTML = 
                `<img src="${getImageUrl(material.aux_images[0], currentType, material.id)}" alt="辅助图1">`;
             aux1Preview.classList.add('show');
        }

        const aux2Preview = document.getElementById('aux2-image-preview');
        if (aux2Preview && material.aux_images && material.aux_images[1]) {
            aux2Preview.innerHTML = 
                `<img src="${getImageUrl(material.aux_images[1], currentType, material.id)}" alt="辅助图2">`;
            aux2Preview.classList.add('show');
        }
        
        if(mainImageInput) mainImageInput.required = false;
    } else {
        form.reset();
        ['main-image-preview', 'aux1-image-preview', 'aux2-image-preview'].forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.innerHTML = '';
                el.classList.remove('show');
            }
        });
        if(mainImageInput) mainImageInput.required = true;
        if(idInput) idInput.value = '';
    }
    
    modal.showModal();
}

function closeModal() {
    const modal = document.getElementById('material-modal') as HTMLDialogElement;
    if(modal) modal.close();
    currentMaterial = null;
}

async function handleSubmit(e: Event) {
    e.preventDefault();
    
    const formData = new FormData();
    const nameInput = document.getElementById('material-name') as HTMLInputElement;
    const descInput = document.getElementById('material-description') as HTMLInputElement;
    
    formData.append('name', nameInput.value);
    formData.append('description', descInput.value);
    
    const mainImageInput = document.getElementById('main-image') as HTMLInputElement;
    if (mainImageInput.files && mainImageInput.files[0]) {
        formData.append('main_image', mainImageInput.files[0]);
    }
    
    const aux1ImageInput = document.getElementById('aux1-image') as HTMLInputElement;
    if (aux1ImageInput.files && aux1ImageInput.files[0]) {
        formData.append('aux1_image', aux1ImageInput.files[0]);
    }
    
    const aux2ImageInput = document.getElementById('aux2-image') as HTMLInputElement;
    if (aux2ImageInput.files && aux2ImageInput.files[0]) {
        formData.append('aux2_image', aux2ImageInput.files[0]);
    }
    
    try {
        const materialIdInput = document.getElementById('material-id') as HTMLInputElement;
        const materialId = materialIdInput.value;
        
        if (materialId) {
            await API.updateMaterial(currentType, materialId, formData);
        } else {
            await API.createMaterial(currentType, formData);
        }
        
        closeModal();
        loadMaterials();
        await showAlertDialog('保存成功', '成功');
    } catch (error: any) {
        console.error('保存失败:', error);
        await showAlertDialog('保存失败: ' + error.message, '错误');
    }
}

// 导出全局函数
const editMaterial = async (id: string | number) => {
    try {
        const response = await API.getMaterial(currentType, id);
        // 通常 API 返回 { material: {...} } 或直接返回对象
        // 根据 api.js 的 getMaterial 实现，它调用 request，request 返回 data
        // 假设 api.js 里的 render 是直接用 listMaterials 的 response.materials
        // 那么 getMaterial 可能返回 { material: ... } 或者直接是 material 对象
        // 暂时假设是 response.material，或者 response 本身
        const material = response.material || response;
        openModal(material);
    } catch (error: any) {
        console.error('加载素材失败:', error);
        await showAlertDialog('加载素材失败: ' + error.message, '错误');
    }
};

const deleteMaterial = async (id: string | number) => {
    const confirmed = await showConfirmDialog('确定要删除这个素材吗？', '确认删除', 'danger');
    if (!confirmed) {
        return;
    }
    
    try {
        await API.deleteMaterial(currentType, id);
        loadMaterials();
        await showAlertDialog('删除成功', '成功');
    } catch (error: any) {
        console.error('删除失败:', error);
        await showAlertDialog('删除失败: ' + error.message, '错误');
    }
};

// 挂载到 window
declare global {
    interface Window {
        editMaterial: (id: string | number) => Promise<void>;
        deleteMaterial: (id: string | number) => Promise<void>;
    }
}
window.editMaterial = editMaterial;
window.deleteMaterial = deleteMaterial;
