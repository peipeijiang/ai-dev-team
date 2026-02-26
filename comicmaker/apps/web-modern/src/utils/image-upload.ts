/**
 * 图片上传工具函数
 * 支持文件上传、剪贴板粘贴和图片预览
 */

export function initImageUpload(inputId: string, previewId: string, options: any = {}) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) {
        console.warn(`图片上传组件初始化失败: ${inputId} 或 ${previewId} 不存在`);
        return;
    }
    
    const { multiple = false, onChange = null } = options;
    
    // 创建上传容器
    const container = input.parentElement;
    if (!container) return;

    // 防止重复初始化
    if(container.querySelector('.image-upload-buttons')) return;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'image-upload-buttons';
    
    // 上传按钮
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'button';
    uploadBtn.className = 'btn btn-secondary'; // 简化 class
    uploadBtn.textContent = '选择文件';
    // 阻止表单提交
    uploadBtn.onclick = (e) => { e.preventDefault(); input.click(); };
    
    // 粘贴按钮
    const pasteBtn = document.createElement('button');
    pasteBtn.type = 'button';
    pasteBtn.className = 'btn btn-secondary'; // 简化 class
    pasteBtn.textContent = '粘贴图片';
    pasteBtn.onclick = (e) => { e.preventDefault(); handlePasteImage(input, preview, multiple, onChange); };
    
    buttonGroup.appendChild(uploadBtn);
    buttonGroup.appendChild(pasteBtn);
    
    // 将按钮组插入到input之前
    input.style.display = 'none';
    container.insertBefore(buttonGroup, input);
    
    // 文件选择事件
    input.addEventListener('change', (e) => {
        handleFileSelect(e.target as HTMLInputElement, preview, multiple, onChange);
    });
    
    // 粘贴事件（全局监听，但只在相关区域激活）
    // 注意：在 TypeScript 模块中，我们可能不需要全局激活逻辑
    // 为了简化，我们只保留按钮点击触发的粘贴
}

function handleFileSelect(input: HTMLInputElement, preview: HTMLElement, multiple: boolean, onChange: Function) {
    if (!input.files) return;
    const files = Array.from(input.files);
    if (files.length === 0) return;
    
    displayPreview(files, preview, multiple, input);
    
    if (onChange) {
        onChange(files, input);
    }
}

async function handlePasteImage(input: HTMLInputElement, preview: HTMLElement, multiple: boolean, onChange: Function, pasteEvent: ClipboardEvent | null = null) {
    try {
        let items: DataTransferItemList | undefined;
        
        if (pasteEvent && pasteEvent.clipboardData) {
            items = pasteEvent.clipboardData.items;
        } else {
            try {
                // @ts-ignore: Clipboard API
                const clipboardItems = await navigator.clipboard.read();
                // 这里的处理比较复杂，简化为只支持粘贴事件或提示用户Ctrl+V
                if(!pasteEvent) {
                    alert('请直接在页面上按 Ctrl+V (或 Cmd+V) 粘贴图片，或者点击输入框后粘贴。');
                    // 尝试聚焦某个元素以捕获粘贴? 
                    // 现代浏览器处于安全考虑，JS主动读取剪贴板图片需要权限且兼容性不一
                    // 这里我们简单提示
                    return;
                }
            } catch (err) {
                console.error('无法访问剪贴板:', err);
                return;
            }
        }

        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            if (pasteEvent) pasteEvent.preventDefault();
            
            // 更新 input.files
            const dt = new DataTransfer();
            
            if (multiple && input.files) {
                Array.from(input.files).forEach(f => dt.items.add(f));
            }
            
            if (!multiple) {
                // 单选模式，只取第一个
                dt.items.add(files[0]);
            } else {
                files.forEach(f => dt.items.add(f));
            }
            
            input.files = dt.files;
            
            displayPreview(Array.from(dt.files), preview, multiple, input);
            
            if (onChange) {
                onChange(Array.from(input.files), input);
            }
        }
    } catch (e) {
        console.error('粘贴图片失败:', e);
    }
}

function displayPreview(files: File[], preview: HTMLElement, multiple: boolean, input: HTMLInputElement) {
    if (!multiple) {
        preview.innerHTML = '';
    }
    
    // 如果没有预览容器内容，添加网格类
    if (multiple && !preview.classList.contains('image-preview-grid')) {
        preview.classList.add('image-preview-grid');
    }
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!e.target?.result) return;

            const item = document.createElement('div');
            item.className = 'preview-item';
            
            const img = document.createElement('img');
            img.src = e.target.result as string;
            item.appendChild(img);
            
            // 移除按钮
            const removeBtn = document.createElement('button');
            removeBtn.className = 'preview-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.type = 'button'; // 防止表单提交
            removeBtn.onclick = (ev) => {
                ev.stopPropagation();
                ev.preventDefault();
                item.remove();
                
                // 同时从 input.files 中移除
                const dt = new DataTransfer();
                if (input.files) {
                    Array.from(input.files).forEach(f => {
                         // 这里简单的通过文件名和大小判断是否是同一个文件
                        if (f.name !== file.name || f.size !== file.size) {
                            dt.items.add(f);
                        }
                    });
                }
                input.files = dt.files;
            };
            item.appendChild(removeBtn);
            
            preview.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
    
    preview.classList.add('show');
}

export function previewImage(input: HTMLInputElement, previewId: string) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0] && preview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if(e.target?.result) {
                preview.innerHTML = `<img src="${e.target.result}" alt="预览" style="max-width: 100%; max-height: 200px;">`;
                preview.classList.add('show');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}
