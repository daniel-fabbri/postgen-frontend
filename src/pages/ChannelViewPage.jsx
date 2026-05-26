import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { channelsAPI, postsAPI, avatarsAPI } from '../api';
import { ArrowLeft, Edit2, Sparkles, X, Loader, Edit, Calendar, ChevronLeft, ChevronRight, Share2, Camera, Upload, Wand2, Image as ImageIcon } from 'lucide-react';

const ChannelViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState('gallery'); // 'gallery', 'generate', 'upload'
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editPostImageUrl, setEditPostImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTab, setImagePickerTab] = useState('gallery');
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [generatingPostImage, setGeneratingPostImage] = useState(false);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    text_generation_prompt: '',
    image_generation_prompt: '',
    instagram_user_id: '',
    instagram_access_token: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [channelRes, postsRes] = await Promise.all([
        channelsAPI.get(id),
        postsAPI.getAll()
      ]);
      
      setChannel(channelRes.data);
      setFormData({
        name: channelRes.data.name,
        objective: channelRes.data.objective,
        text_generation_prompt: channelRes.data.text_generation_prompt || '',
        image_generation_prompt: channelRes.data.image_generation_prompt || '',
        instagram_user_id: channelRes.data.instagram_user_id || '',
        instagram_access_token: channelRes.data.instagram_access_token || '',
      });
      
      // Filter posts for this channel
      const channelPosts = postsRes.data.filter(post => post.channel_id === id);
      setPosts(channelPosts);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading channel data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await channelsAPI.update(id, {
        ...channel,
        ...formData
      });
      await loadData();
      setShowEditModal(false);
      alert('Channel updated successfully!');
    } catch (error) {
      console.error('Error updating channel:', error);
      alert('Error updating channel');
    } finally {
      setSaving(false);
    }
  };

  const openAvatarModal = async () => {
    setShowAvatarModal(true);
    try {
      const response = await avatarsAPI.getAll(id);
      setAvailableAvatars(response.data);
    } catch (error) {
      console.error('Error loading avatars:', error);
    }
  };

  const openEditPostModal = (post) => {
    setEditingPost({ ...post });
    setEditPostText(post.text);
    setEditPostImageUrl(`http://localhost:8004/posts/${post.image_path}`);
    setShowImagePicker(false);
    setImagePickerTab('gallery');
    setImageGenPrompt('');
    setShowEditPostModal(true);
  };

  const handleSavePost = async () => {
    try {
      setSavingPost(true);
      await postsAPI.update(editingPost.id, editPostText, editingPost.image_path);
      const postsRes = await postsAPI.getAll();
      const channelPosts = postsRes.data.filter(p => p.channel_id === id);
      setPosts(channelPosts);
      setShowEditPostModal(false);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    } finally {
      setSavingPost(false);
    }
  };

  const handleGeneratePostImage = async () => {
    if (!imageGenPrompt.trim()) return;
    try {
      setGeneratingPostImage(true);
      const response = await postsAPI.generateImage(editingPost.id, imageGenPrompt, id);
      setEditPostImageUrl(response.data.image_url);
      setEditingPost(prev => ({ ...prev, image_path: response.data.image_path }));
      setShowImagePicker(false);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGeneratingPostImage(false);
    }
  };

  const handlePostImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setUploadingPostImage(true);
      const response = await postsAPI.uploadImage(editingPost.id, file);
      setEditPostImageUrl(response.data.image_url);
      setEditingPost(prev => ({ ...prev, image_path: response.data.image_path }));
      setShowImagePicker(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handlePublish = async (post) => {
    try {
      setPublishing(true);
      await postsAPI.publishPost(post.id);
      const postsRes = await postsAPI.getAll();
      const channelPosts = postsRes.data.filter(p => p.channel_id === id);
      setPosts(channelPosts);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message;
      alert('Erro ao publicar: ' + msg);
    } finally {
      setPublishing(false);
    }
  };

  const handleSelectPostImage = (post) => {
    setEditPostImageUrl(`http://localhost:8004/posts/${post.image_path}`);
    setEditingPost(prev => ({ ...prev, image_path: post.image_path }));
    setShowImagePicker(false);
  };

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setAvatarTab('gallery');
    setAiPrompt('');
  };

  const selectAvatar = async (avatarUrl) => {
    try {
      await channelsAPI.updateAvatar(id, avatarUrl);
      await loadData();
      closeAvatarModal();
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      alert('Error updating avatar');
    }
  };

  const generateNewAvatar = async () => {
    if (!aiPrompt.trim()) {
      alert('Please enter a prompt for avatar generation');
      return;
    }

    try {
      setGeneratingAvatar(true);
      const response = await avatarsAPI.generate(aiPrompt, id);
      await loadData();
      closeAvatarModal();
      alert('Avatar generated and updated successfully!');
    } catch (error) {
      console.error('Error generating avatar:', error);
      alert('Error generating avatar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const response = await avatarsAPI.upload(file, id);
      await loadData();
      closeAvatarModal();
      alert('Avatar uploaded and updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openGallery = (index) => {
    setCurrentPostIndex(index);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setShowGallery(false);
  };

  const goToNextPost = () => {
    if (currentPostIndex < posts.length - 1) {
      setCurrentPostIndex(currentPostIndex + 1);
    }
  };

  const goToPreviousPost = () => {
    if (currentPostIndex > 0) {
      setCurrentPostIndex(currentPostIndex - 1);
    }
  };

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    if (!showGallery) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowRight') {
        goToNextPost();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousPost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showGallery, currentPostIndex, posts.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!channel) {
    return <div className="text-center py-12">Channel not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <button
        onClick={() => navigate('/channels')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Channels</span>
      </button>

      {/* Channel Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600">
          {/* Avatar */}
          <div className="absolute -bottom-16 left-8 group">
            <div className="relative">
              {channel.avatar_url ? (
                <img
                  src={channel.avatar_url}
                  alt={channel.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                  <Sparkles size={48} className="text-gray-400" />
                </div>
              )}
              {/* Edit Avatar Button */}
              <button
                onClick={openAvatarModal}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all group-hover:scale-110"
                title="Change avatar"
              >
                <Camera size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-20 pb-6 px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(`/channels/${id}/generate`)}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>Generate New Post</span>
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center space-x-2"
              >
                <Edit2 size={16} />
                <span>Edit Channel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Posts ({posts.length})</h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No posts yet. Generate your first post!
            </p>
            <button
              onClick={() => navigate(`/channels/${id}/generate`)}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Generate Post
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => openGallery(index)}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`http://localhost:8004/posts/${post.image_path}`}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                    {post.text}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    {post.published && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                        Published
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Channel Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-bold">Edit Channel</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium mb-1">Channel Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Channel Objective *</label>
                <textarea
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Como Escrever <span className="text-gray-400 font-normal">(Text Prompt)</span></label>
                <textarea
                  value={formData.text_generation_prompt}
                  onChange={(e) => setFormData({ ...formData, text_generation_prompt: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                  placeholder="Instrução para a IA gerar os textos (opcional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Como Ilustrar <span className="text-gray-400 font-normal">(Image Prompt)</span></label>
                <textarea
                  value={formData.image_generation_prompt}
                  onChange={(e) => setFormData({ ...formData, image_generation_prompt: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                  placeholder="Instrução para a IA gerar as imagens (opcional)"
                />
              </div>

              {/* Instagram Integration */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold" style={{ fontSize: '10px' }}>IG</span>
                  </div>
                  <span className="text-sm font-semibold">Instagram</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Instagram User ID
                    </label>
                    <input
                      type="text"
                      value={formData.instagram_user_id}
                      onChange={(e) => setFormData({ ...formData, instagram_user_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-mono"
                      placeholder="ex: 17841400008460056"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ID numérico da sua conta Business/Creator. Encontre em: Meta Business Suite → Configurações → Ativos → Contas do Instagram.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={formData.instagram_access_token}
                      onChange={(e) => setFormData({ ...formData, instagram_access_token: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-mono"
                      placeholder={formData.instagram_access_token === '***' ? '(salvo — deixe em branco para não alterar)' : 'EAAxxxxxxxxx...'}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Token de longa duração da Página do Facebook vinculada. Gere em: Meta for Developers → Graph API Explorer → Get User Access Token.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !formData.name || !formData.objective}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-5 py-2 text-sm rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader className="animate-spin" size={14} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Change Avatar</h2>
              <button
                onClick={closeAvatarModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={() => setAvatarTab('gallery')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
                  avatarTab === 'gallery'
                    ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <ImageIcon size={20} />
                <span>Gallery</span>
              </button>
              <button
                onClick={() => setAvatarTab('generate')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
                  avatarTab === 'generate'
                    ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Wand2 size={20} />
                <span>Generate with AI</span>
              </button>
              <button
                onClick={() => setAvatarTab('upload')}
                className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
                  avatarTab === 'upload'
                    ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Upload size={20} />
                <span>Upload</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Gallery Tab */}
              {avatarTab === 'gallery' && (
                <div>
                  {availableAvatars.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No avatars available yet</p>
                      <p className="text-sm mt-2">Generate or upload your first avatar</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableAvatars.map((avatar) => (
                        <button
                          key={avatar.filename}
                          onClick={() => selectAvatar(avatar.url)}
                          className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg"
                        >
                          <img
                            src={avatar.url}
                            alt="Avatar option"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          {channel.avatar_url === avatar.url && (
                            <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Current
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Generate Tab */}
              {avatarTab === 'generate' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <div>
                    <label className="block text-sm font-medium mb-2">Avatar Description</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows="6"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the avatar you want to generate... Example: A friendly elderly woman with curly gray hair, wearing an apron, warm smile, in her cozy kitchen"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      💡 Tip: Be specific about appearance, style, and setting. The AI will create a portrait-style image at 768x768px.
                    </p>
                  </div>

                  {channel.image_generation_prompt && (
                    <div className="bg-blue-50 dark:bg-blue-900 bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                        💡 You can use your channel's image prompt:
                      </p>
                      <button
                        onClick={() => setAiPrompt(channel.image_generation_prompt)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Click to use channel prompt
                      </button>
                    </div>
                  )}

                  <button
                    onClick={generateNewAvatar}
                    disabled={generatingAvatar || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {generatingAvatar ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        <span>Generating Avatar...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={20} />
                        <span>Generate Avatar</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Upload Tab */}
              {avatarTab === 'upload' && (
                <div className="max-w-xl mx-auto">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingAvatar ? (
                        <>
                          <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Uploading...</span>
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="text-gray-400 mb-4" size={48} />
                          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, JPEG (recommended: 768x768px or larger)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditPostModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[200]">
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 2rem)' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-bold">Edit Post</h2>
              <button
                onClick={() => setShowEditPostModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
              {/* Left: Image column */}
              <div className="md:w-72 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                {/* Image preview */}
                <div className="aspect-square w-full bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0">
                  <img
                    src={editPostImageUrl}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Toggle image picker */}
                <button
                  onClick={() => setShowImagePicker(prev => !prev)}
                  className="m-3 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  <Camera size={15} />
                  <span>{showImagePicker ? 'Fechar' : 'Trocar imagem'}</span>
                </button>

                {/* Image picker */}
                {showImagePicker && (
                  <div className="flex-1 flex flex-col border-t border-gray-200 dark:border-gray-700 min-h-0">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
                      {[
                        { key: 'gallery', label: 'Galeria' },
                        { key: 'generate', label: 'Gerar IA' },
                        { key: 'upload', label: 'Upload' },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setImagePickerTab(tab.key)}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${
                            imagePickerTab === tab.key
                              ? 'border-b-2 border-blue-600 text-blue-600'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-3 overflow-y-auto flex-1">
                      {/* Gallery tab */}
                      {imagePickerTab === 'gallery' && (
                        <div className="grid grid-cols-2 gap-2">
                          {posts.filter(p => p.image_path && p.image_path.startsWith('images/')).map(p => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectPostImage(p)}
                              className={`aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-blue-500 ${
                                editingPost.image_path === p.image_path
                                  ? 'border-blue-500'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <img
                                src={`http://localhost:8004/posts/${p.image_path}`}
                                alt="Post"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Generate tab */}
                      {imagePickerTab === 'generate' && (
                        <div className="space-y-3">
                          <textarea
                            value={imageGenPrompt}
                            onChange={(e) => setImageGenPrompt(e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Descreva a imagem que deseja gerar..."
                          />
                          <button
                            onClick={handleGeneratePostImage}
                            disabled={generatingPostImage || !imageGenPrompt.trim()}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {generatingPostImage ? (
                              <><Loader className="animate-spin" size={14} /><span>Gerando...</span></>
                            ) : (
                              <><Wand2 size={14} /><span>Gerar Imagem</span></>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Upload tab */}
                      {imagePickerTab === 'upload' && (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {uploadingPostImage ? (
                            <Loader className="animate-spin text-blue-600" size={24} />
                          ) : (
                            <>
                              <Upload className="text-gray-400 mb-2" size={24} />
                              <span className="text-xs text-gray-500 dark:text-gray-400">Clique para fazer upload</span>
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePostImageUpload}
                            disabled={uploadingPostImage}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Text editor */}
              <div className="flex-1 flex flex-col p-5 min-h-0">
                <label className="block text-sm font-medium mb-2 shrink-0">Caption</label>
                <textarea
                  value={editPostText}
                  onChange={(e) => setEditPostText(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <button
                onClick={() => setShowEditPostModal(false)}
                className="px-5 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={savingPost}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePost}
                disabled={savingPost}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-5 py-2 text-sm rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {savingPost ? (
                  <><Loader className="animate-spin" size={14} /><span>Saving...</span></>
                ) : (
                  <><Edit2 size={14} /><span>Save Changes</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && posts.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[100]">
          {/* Close button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all z-10"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          {/* Post counter */}
          <div className="absolute top-4 left-4 px-4 py-2 bg-white bg-opacity-10 rounded-full text-white text-sm z-10">
            {currentPostIndex + 1} / {posts.length}
          </div>

          {/* Previous button */}
          {currentPostIndex > 0 && (
            <button
              onClick={goToPreviousPost}
              className="absolute left-4 p-3 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all z-10"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next button */}
          {currentPostIndex < posts.length - 1 && (
            <button
              onClick={goToNextPost}
              className="absolute right-4 p-3 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all z-10"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Post content */}
          <div className="max-w-6xl w-full mx-4 flex flex-col md:flex-row gap-6 items-center">
            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={`http://localhost:8004/posts/${posts[currentPostIndex].image_path}`}
                alt="Post"
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Post details sidebar */}
            <div className="w-full md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
              {/* Header - fixed */}
              <div className="shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {channel.avatar_url ? (
                    <img
                      src={channel.avatar_url}
                      alt={channel.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {channel.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(posts[currentPostIndex].created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Post text - scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {posts[currentPostIndex].text}
                </p>
              </div>

              {/* Status and actions - fixed footer */}
              <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {posts[currentPostIndex].published ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Published
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Draft
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditPostModal(posts[currentPostIndex]);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  {!posts[currentPostIndex].published && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish(posts[currentPostIndex]);
                      }}
                      disabled={publishing}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                    >
                      {publishing ? (
                        <><Loader className="animate-spin" size={14} /><span>Publicando...</span></>
                      ) : (
                        <><Share2 size={16} /><span>Publish</span></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelViewPage;
