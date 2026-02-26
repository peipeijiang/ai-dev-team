/**
 * API 客户端 (TypeScript Version)
 */

// 使用相对路径，利用 Vite 的代理功能转发到后端
const API_BASE = '/api';

export class API {
    private static async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${API_BASE}${endpoint}`;
        
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string>),
        };

        const config: RequestInit = {
            ...options,
            headers,
        };
        
        // 如果是 FormData，不要设置 Content-Type，让浏览器自动设置（包含 boundary）
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                // 尝试获取更详细的错误信息
                const errorDetail = data.detail || data.message || JSON.stringify(data);
                console.error('API Error Detail:', errorDetail);
                throw new Error(errorDetail);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // --- 素材管理 API ---
    static async listMaterials(type: string): Promise<any> {
        return this.request(`/materials/${type}`);
    }

    static async getMaterial(type: string, id: string | number): Promise<any> {
        return this.request(`/materials/${type}/${id}`);
    }

    static async createMaterial(type: string, formData: FormData): Promise<any> {
        return this.request(`/materials/${type}`, {
            method: 'POST',
            body: formData
        });
    }

    static async updateMaterial(type: string, id: string | number, formData: FormData): Promise<any> {
        return this.request(`/materials/${type}/${id}`, {
            method: 'PUT',
            body: formData
        });
    }

    static async deleteMaterial(type: string, id: string | number): Promise<any> {
        return this.request(`/materials/${type}/${id}`, {
            method: 'DELETE'
        });
    }

    // --- 风格管理 API ---
    static async getStyles(): Promise<any> {
        return this.request(`/styles`);
    }

    static async getStyle(id: string | number): Promise<any> {
        return this.request(`/styles/${id}`);
    }

    static async createStyle(formData: FormData): Promise<any> {
        return this.request(`/styles`, {
            method: 'POST',
            body: formData
        });
    }

    static async updateStyle(id: string | number, formData: FormData): Promise<any> {
        return this.request(`/styles/${id}`, {
            method: 'PUT',
            body: formData
        });
    }

    static async deleteStyle(id: string | number): Promise<any> {
        return this.request(`/styles/${id}`, {
            method: 'DELETE'
        });
    }

    // --- 作品管理 API ---
    static async listWorks(): Promise<any> {
        return this.request('/works');
    }

    static async getWork(id: string | number): Promise<any> {
        return this.request(`/works/${id}`);
    }

    static async createWork(data: any): Promise<any> {
        // works 接口目前根据后端逻辑，可能接收 JSON 或 FormData
        // 这里假设是 JSON，根据原代码推断。如果原代码没用 FormData，那就是 JSON。
        // 为了保险，我们可以检查 data 类型。但通常创建作品是 JSON。
        return this.request('/works', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    static async updateWork(id: string | number, data: any): Promise<any> {
        return this.request(`/works/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    static async deleteWork(id: string | number): Promise<any> {
        return this.request(`/works/${id}`, {
            method: 'DELETE'
        });
    }

    // --- 剧集管理 API ---
    static async listEpisodes(workId: string | number): Promise<any> {
        return this.request(`/episodes?work_id=${workId}`);
    }

    static async getEpisode(id: string | number): Promise<any> {
        return this.request(`/episodes/${id}`);
    }

    static async createEpisode(data: any): Promise<any> {
        return this.request('/episodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    static async updateEpisode(id: string | number, data: any): Promise<any> {
        return this.request(`/episodes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    static async deleteEpisode(id: string | number): Promise<any> {
        return this.request(`/episodes/${id}`, {
            method: 'DELETE'
        });
    }

    // --- 剧集内容生成API ---
    static async generateScript(episodeId: string | number, prompt: string): Promise<any> {
        return this.request(`/episodes/${episodeId}/generate_script`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt }) // 假设后端期望 { prompt: ... }
        });
    }
    
    // --- 剧本/内容相关 API ---
    static async getScript(workId: string | number, episodeId: string | number): Promise<any> {
        return this.request(`/episodes/${workId}/${episodeId}/script`);
    }

    static async saveScript(workId: string | number, episodeId: string | number, script: string, duration: number, shotDuration: number | null = null): Promise<any> {
        const formData = new FormData();
        formData.append('script', script);
        formData.append('expected_duration', duration.toString());
        if (shotDuration !== null) {
            formData.append('shot_duration', shotDuration.toString());
        }
        return this.request(`/episodes/${workId}/${episodeId}/script`, {
            method: 'PUT',
            body: formData
        });
    }

    static async getStoryboard(workId: string | number, episodeId: string | number, format: string | null = null): Promise<any> {
        const url = `/episodes/${workId}/${episodeId}/storyboard${format ? `?format=${format}` : ''}`;
        return this.request(url);
    }

    static async saveStoryboardText(workId: string | number, episodeId: string | number, text: string): Promise<any> {
        const formData = new FormData();
        formData.append('text', text);
        return this.request(`/episodes/${workId}/${episodeId}/storyboard/text`, {
            method: 'POST',
            body: formData
        });
    }

    static async confirmStoryboard(workId: string | number, episodeId: string | number): Promise<any> {
        return this.request(`/content/${workId}/${episodeId}/confirm-storyboard`, {
            method: 'POST'
        });
    }

    static async updateShot(workId: string | number, episodeId: string | number, shotId: string | number, data: any): Promise<any> {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });
        return this.request(`/content/${workId}/${episodeId}/${shotId}`, {
            method: 'PUT',
            body: formData
        });
    }

    // --- 内容生成 API (复刻 old api.js) ---
    
    // 生成分镜
    static async generateStoryboard(workId: string | number, episodeId: string | number, script: string): Promise<any> {
        const formData = new FormData();
        formData.append('script', script);
        return this.request(`/content/${workId}/${episodeId}/generate-storyboard`, {
            method: 'POST',
            body: formData
        });
    }

    // 生成图片
    static async generateImages(workId: string | number, episodeId: string | number, shotId: string | number, prompt: string): Promise<any> {
        const formData = new FormData();
        formData.append('prompt', prompt);
        return this.request(`/content/${workId}/${episodeId}/${shotId}/generate-images`, {
            method: 'POST',
            body: formData
        });
    }

    // 选择图片
    static async selectImage(workId: string | number, episodeId: string | number, shotId: string | number, imagePath: string): Promise<any> {
        const formData = new FormData();
        formData.append('image_path', imagePath);
        return this.request(`/content/${workId}/${episodeId}/${shotId}/select-image`, {
            method: 'POST',
            body: formData
        });
    }

    // 生成视频
    static async generateVideo(workId: string | number, episodeId: string | number, shotId: string | number, prompt: string): Promise<any> {
        const formData = new FormData();
        formData.append('prompt', prompt);
        return this.request(`/content/${workId}/${episodeId}/${shotId}/generate-video`, {
            method: 'POST',
            body: formData
        });
    }

    // 下载视频到镜头
    static async downloadVideoToShot(workId: string | number, episodeId: string | number, shotId: string | number, videoUrl: string): Promise<any> {
        const formData = new FormData();
        formData.append('video_url', videoUrl);
        return this.request(`/content/${workId}/${episodeId}/${shotId}/download-video`, {
            method: 'POST',
            body: formData
        });
    }

    // 生成音频
    static async generateAudio(workId: string | number, episodeId: string | number, shotId: string | number, prompt: string): Promise<any> {
        const formData = new FormData();
        formData.append('prompt', prompt);
        return this.request(`/content/${workId}/${episodeId}/${shotId}/generate-audio`, {
            method: 'POST',
            body: formData
        });
    }

    // 获取单个镜头详情
    static async getShot(workId: string | number, episodeId: string | number, shotId: string | number): Promise<any> {
        return this.request(`/content/${workId}/${episodeId}/${shotId}`);
    }

    // 更新镜头提示词
    static async updatePrompts(workId: string | number, episodeId: string | number, shotId: string | number, prompts: { image?: string, video?: string, audio?: string }): Promise<any> {
        const formData = new FormData();
        if (prompts.image) formData.append('image_prompt', prompts.image);
        if (prompts.video) formData.append('video_prompt', prompts.video);
        if (prompts.audio) formData.append('audio_prompt', prompts.audio);
        return this.request(`/content/${workId}/${episodeId}/${shotId}/prompts`, {
            method: 'PUT',
            body: formData
        });
    }

    // --- 工具 API ---
    static async createToolTask(toolType: string, formData: FormData): Promise<any> {
        return this.request(`/tools/${toolType}/create`, {
            method: 'POST',
            body: formData
        });
    }

    static async getTaskStatus(taskId: string): Promise<any> {
        return this.request(`/tasks/${taskId}/status`);
    }

    static async getTaskResult(taskId: string): Promise<any> {
        return this.request(`/tasks/${taskId}/result`);
    }

    static async listHistory(toolType: string | null = null, page: number = 1, limit: number = 20): Promise<any> {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (toolType) params.append('tool_type', toolType);
        return this.request(`/tools/history?${params}`);
    }

    static async getHistoryDetail(recordId: string): Promise<any> {
        return this.request(`/tools/history/${recordId}`);
    }
}
