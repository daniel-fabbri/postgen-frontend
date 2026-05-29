import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8004/api';

export const postImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL.replace('/api', '')}/posts/${imagePath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('postgen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 or 403 (unauthenticated)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('postgen_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  me: () => api.get('/auth/me'),
};

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
  updateAvatar: (id, avatarUrl) => api.post(`/channels/${id}/avatar`, { avatar_url: avatarUrl }),
  testInstagram: (id, data) => api.post(`/channels/${id}/test-instagram`, data),
  getInstagramOAuthUrl: (channelId) => api.get('/auth/instagram/authorize', { params: { channel_id: channelId } }),
  disconnectInstagram: (id) => api.delete(`/channels/${id}/instagram`),
};

export const avatarsAPI = {
  getAll: (channelId = null) => api.get('/avatars', { params: channelId ? { channel_id: channelId } : {} }),
  generate: (prompt, channelId = null) => api.post('/avatars/generate', { prompt, channel_id: channelId }),
  upload: (file, channelId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (channelId) formData.append('channel_id', channelId);
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
    additional_prompt: additionalPrompt || null,
  }),
  publishPost: (postId) => api.post(`/posts/${postId}/publish`),
  update: (id, text, imagePath) => api.post(`/posts/${id}/save`, { text, image_path: imagePath }),
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

export const videosAPI = {
  getAll: (channelId = null) => api.get('/videos', { params: channelId ? { channel_id: channelId } : {} }),
  generate: (channelId, additionalPrompt, seconds, size) =>
    api.post('/videos/generate', {
      channel_id: channelId,
      additional_prompt: additionalPrompt || null,
      seconds,
      size,
    }),
  updateCaption: (id, caption) => api.patch(`/videos/${id}/caption`, { caption }),
  publish: (id) => api.post(`/videos/${id}/publish`),
  delete: (id) => api.delete(`/videos/${id}`),
};

export const videoProjectsAPI = {
  create: (channelId, videoId) => api.post('/video-projects', { channel_id: channelId, video_id: videoId }),
  get: (id) => api.get(`/video-projects/${id}`),
  updateClips: (id, clipIds) => api.put(`/video-projects/${id}/clips`, { clip_ids: clipIds }),
  addVideo: (id, videoId) => api.post(`/video-projects/${id}/add-video`, { video_id: videoId }),
  generateClip: (id, data) => api.post(`/video-projects/${id}/generate`, data),
  save: (id) => api.post(`/video-projects/${id}/save`),
  export: (id) => api.post(`/video-projects/${id}/export`),
};

export const referencesAPI = {
  getAll: (channelId) => api.get(`/channels/${channelId}/references`),
  upload: (channelId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/channels/${channelId}/references/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (channelId, refId) => api.delete(`/channels/${channelId}/references/${refId}`),
};

export const insightsAPI = {
  getPost: (postId) => api.get(`/posts/${postId}/insights`),
  refreshPost: (postId) => api.post(`/posts/${postId}/insights/refresh`),
  getVideo: (videoId) => api.get(`/videos/${videoId}/insights`),
  refreshVideo: (videoId) => api.post(`/videos/${videoId}/insights/refresh`),
  getChannelDashboard: (channelId) => api.get(`/channels/${channelId}/dashboard`),
  refreshChannel: (channelId) => api.post(`/channels/${channelId}/insights/refresh`),
};

export default api;
