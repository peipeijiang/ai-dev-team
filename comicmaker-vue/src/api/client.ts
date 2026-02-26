import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API 错误:', error)
    return Promise.reject(error)
  }
)

// 作品相关 API
export const worksApi = {
  // 获取作品列表
  getList: (params?: any) => apiClient.get('/works', { params }),
  // 获取作品详情
  getById: (id: string) => apiClient.get(`/works/${id}`),
  // 创建作品
  create: (data: any) => apiClient.post('/works', data),
  // 更新作品
  update: (id: string, data: any) => apiClient.put(`/works/${id}`, data),
  // 删除作品
  delete: (id: string) => apiClient.delete(`/works/${id}`)
}

// 剧集相关 API
export const episodesApi = {
  // 获取剧集列表
  getList: (workId: string, params?: any) => apiClient.get(`/works/${workId}/episodes`, { params }),
  // 获取剧集详情
  getById: (id: string) => apiClient.get(`/episodes/${id}`),
  // 创建剧集
  create: (workId: string, data: any) => apiClient.post(`/works/${workId}/episodes`, data),
  // 更新剧集
  update: (id: string, data: any) => apiClient.put(`/episodes/${id}`, data),
  // 删除剧集
  delete: (id: string) => apiClient.delete(`/episodes/${id}`)
}

// 素材相关 API
export const materialsApi = {
  // 获取素材列表
  getList: (params?: any) => apiClient.get('/materials', { params }),
  // 获取素材详情
  getById: (id: string) => apiClient.get(`/materials/${id}`),
  // 上传素材
  upload: (formData: FormData) => apiClient.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // 删除素材
  delete: (id: string) => apiClient.delete(`/materials/${id}`)
}

// 风格相关 API
export const stylesApi = {
  // 获取风格列表
  getList: (params?: any) => apiClient.get('/styles', { params }),
  // 获取风格详情
  getById: (id: string) => apiClient.get(`/styles/${id}`),
  // 创建风格
  create: (data: any) => apiClient.post('/styles', data),
  // 更新风格
  update: (id: string, data: any) => apiClient.put(`/styles/${id}`, data),
  // 删除风格
  delete: (id: string) => apiClient.delete(`/styles/${id}`)
}

// 工具相关 API
export const toolsApi = {
  // 获取工具列表
  getList: () => apiClient.get('/tools'),
  // 执行工具
  execute: (toolName: string, params: any) => apiClient.post(`/tools/${toolName}`, params),
  // 获取任务状态
  getTaskStatus: (taskId: string) => apiClient.get(`/tools/tasks/${taskId}`)
}

export default apiClient
