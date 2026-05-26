import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const channelsAPI = {
  getAll: () => api.get('/channels'),
  get: (id) => api.get(`/channels/${id}`),
  create: (data) => api.post('/channels', data),
  update: (id, data) => api.put(`/channels/${id}`, data),
  delete: (id) => api.delete(`/channels/${id}`),
  updateAvatar: (id, avatarUrl) => api.patch(`/channels/${id}/avatar`, { avatar_url: avatarUrl }),
};

export const avatarsAPI = {
  getAll: (channelId = null) => api.get('/avatars', { params: channelId ? { channel_id: channelId } : {} }),
  generate: (prompt, channelId = null) => api.post('/avatars/generate', { prompt, channel_id: channelId }),
  upload: (file, channelId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (channelId) {
      formData.append('channel_id', channelId);
    }
    return api.post('/avatars/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  get: (id) => api.get(`/posts/${id}`),
  generate: (channelId, additionalPrompt = '') => api.post('/posts/generate', {
    channel_id: channelId,
    additional_prompt: additionalPrompt || null
  }),
  publishPost: (postId) => api.post(`/posts/${postId}/publish`),
  update: (id, text, imagePath) => api.patch(`/posts/${id}`, { text, image_path: imagePath }),
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/posts/${id}/image/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  generateImage: (id, prompt, channelId) =>
    api.post(`/posts/${id}/image/generate`, { prompt, channel_id: channelId }),
};

export default api;
