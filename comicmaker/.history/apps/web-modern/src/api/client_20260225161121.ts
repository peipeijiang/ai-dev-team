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
    
    // 补充完整原 api.js 可能包含的其他方法，这里先基于已知信息
    // 如果有其他 API 方法，可以在后续添加
}
