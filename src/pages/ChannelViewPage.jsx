import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { channelsAPI, postsAPI, avatarsAPI, videosAPI, videoProjectsAPI, insightsAPI, referencesAPI, postImageUrl } from '../api';
import { useAuth } from '../AuthContext';
import NoCreditsAlert from '../components/NoCreditsAlert';
import {
  ArrowLeft, Edit2, Sparkles, X, Loader, Edit, Calendar,
  ChevronLeft, ChevronRight, Share2, Camera, Upload, Wand2,
  Image as ImageIcon, Video, Download, Play, CheckCircle, Copy, Instagram, Unlink, XCircle, Info, Plus,
  Heart, MessageCircle, Eye, BarChart2, RefreshCw, Trash2, MoreVertical, ChevronDown,
} from 'lucide-react';

const ChannelViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const balance = user?.credits_balance || 0;
  const canPost    = balance >= 32;  // texto ~2 + imagem ~30
  const canVideo   = balance >= 200; // mínimo 4s × 50cr
  const canAvatar  = balance >= 30;  // 1 imagem MAI
  const canImage   = balance >= 30;  // 1 imagem MAI
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarTab, setAvatarTab] = useState('gallery');
  const [availableAvatars, setAvailableAvatars] = useState([]);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editPostImageUrl, setEditPostImageUrl] = useState('');
  const [postImageHistory, setPostImageHistory] = useState([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTab, setImagePickerTab] = useState('gallery');
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [generatingPostImage, setGeneratingPostImage] = useState(false);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishingVideo, setPublishingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState(false);
  const [showPromptFor, setShowPromptFor] = useState(null);
  const [draggingVideoId, setDraggingVideoId] = useState(null);
  const [dragOverVideoId, setDragOverVideoId] = useState(null);
  const [connectingIG, setConnectingIG] = useState(false);
  const [igMessage, setIgMessage] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [galleryCopied, setGalleryCopied] = useState(false);
  const [references, setReferences] = useState([]);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [describingRefId, setDescribingRefId] = useState(null);
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);
  const channelDropdownRef = useRef(null);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    text_generation_prompt: '',
    image_generation_prompt: '',
    instagram_user_id: '',
    instagram_access_token: '',
    image_model: 'mai',
  });

  // Unified sorted feed: newest first
  const items = [...posts.map(p => ({ ...p, _type: 'post' })),
                  ...videos.map(v => ({ ...v, _type: 'video' }))]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  useEffect(() => { loadData(); }, [id]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (channelDropdownRef.current && !channelDropdownRef.current.contains(event.target)) {
        setChannelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [channelRes, postsRes, videosRes] = await Promise.all([
        channelsAPI.get(id),
        postsAPI.getAll(),
        videosAPI.getAll(id),
      ]);
      setChannel(channelRes.data);
      setFormData({
        name: channelRes.data.name,
        objective: channelRes.data.objective,
        text_generation_prompt: channelRes.data.text_generation_prompt || '',
        image_generation_prompt: channelRes.data.image_generation_prompt || '',
        instagram_user_id: channelRes.data.instagram_user_id || '',
        instagram_access_token: channelRes.data.instagram_access_token || '',
        image_model: channelRes.data.image_model || 'mai',
      });
      setPosts(postsRes.data.filter(p => p.channel_id === id));
      setVideos(videosRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectIG = async () => {
    setConnectingIG(true);
    setIgMessage(null);
    try {
      const res = await channelsAPI.getInstagramOAuthUrl(id);
      window.location.href = res.data.url;
    } catch (err) {
      setIgMessage({ type: 'error', text: err.response?.data?.detail || 'Erro ao iniciar conexão com Instagram.' });
      setConnectingIG(false);
    }
  };

  const handleDisconnectIG = async () => {
    if (!confirm('Desconectar o Instagram deste canal?')) return;
    try {
      await channelsAPI.disconnectInstagram(id);
      setFormData(f => ({ ...f, instagram_user_id: '', instagram_access_token: '' }));
      setIgMessage({ type: 'success', text: 'Instagram desconectado.' });
    } catch (err) {
      setIgMessage({ type: 'error', text: 'Erro ao desconectar.' });
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await channelsAPI.update(id, { ...channel, ...formData });
      await loadData();
      setShowEditModal(false);
    } catch (error) {
      alert('Erro ao salvar canal');
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
    setEditPostImageUrl(postImageUrl(post.image_path));
    setPostImageHistory(post.image_path ? [post.image_path] : []);
    setShowImagePicker(false);
    setImagePickerTab('gallery');
    setImageGenPrompt('');
    setShowEditPostModal(true);
  };

  const handleSavePost = async () => {
    if (!localStorage.getItem('postgen_token')) {
      window.location.href = '/login';
      return;
    }
    try {
      setSavingPost(true);
      await postsAPI.update(editingPost.id, editPostText, editingPost.image_path);
      const postsRes = await postsAPI.getAll();
      setPosts(postsRes.data.filter(p => p.channel_id === id));
      setShowEditPostModal(false);
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 403) return; // interceptor handles redirect to login
      alert('Erro ao salvar post: ' + (error.response?.data?.detail || error.message || 'erro desconhecido'));
    } finally {
      setSavingPost(false);
    }
  };

  const handleGeneratePostImage = async () => {
    try {
      setGeneratingPostImage(true);
      const response = await postsAPI.generateImage(editingPost.id, imageGenPrompt, id);
      const newPath = response.data.image_path;
      setEditPostImageUrl(response.data.image_url);
      setEditingPost(prev => ({ ...prev, image_path: newPath }));
      setPostImageHistory(prev => [newPath, ...prev.filter(p => p !== newPath)]);
      setShowImagePicker(false);
    } catch (error) {
      alert('Erro ao gerar imagem: ' + (error.response?.data?.detail || error.message));
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
      const newPath = response.data.image_path;
      setEditPostImageUrl(response.data.image_url);
      setEditingPost(prev => ({ ...prev, image_path: newPath }));
      setPostImageHistory(prev => [newPath, ...prev.filter(p => p !== newPath)]);
      setShowImagePicker(false);
    } catch (error) {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handlePublish = async (post) => {
    try {
      setPublishing(true);
      await postsAPI.publishPost(post.id);
      const postsRes = await postsAPI.getAll();
      setPosts(postsRes.data.filter(p => p.channel_id === id));
    } catch (error) {
      alert('Erro ao publicar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishVideo = async (video) => {
    try {
      setPublishingVideo(true);
      const res = await videosAPI.publish(video.id);
      setVideos(prev => prev.map(v => v.id === video.id ? res.data : v));
    } catch (error) {
      alert('Erro ao publicar vídeo: ' + (error.response?.data?.detail || error.message));
    } finally {
      setPublishingVideo(false);
    }
  };

  const handleEditVideo = async (video) => {
    try {
      setEditingVideo(true);
      if (video.video_project_id) {
        navigate(`/video-editor/${video.video_project_id}`);
        return;
      }
      const res = await videoProjectsAPI.create(id, video.id);
      navigate(`/video-editor/${res.data.id}`);
    } catch (err) {
      alert('Erro ao abrir editor: ' + (err.response?.data?.detail || err.message));
      setEditingVideo(false);
    }
  };

  const handleVideoDragStart = (e, item) => {
    setDraggingVideoId(item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleVideoDragEnd = () => {
    setDraggingVideoId(null);
    setDragOverVideoId(null);
  };

  const handleVideoDragOver = (e, item) => {
    if (!draggingVideoId || draggingVideoId === item.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverVideoId(item.id);
  };

  const handleVideoDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverVideoId(null);
    }
  };

  const handleVideoDrop = async (e, targetItem) => {
    e.preventDefault();
    const draggedId = draggingVideoId;
    setDraggingVideoId(null);
    setDragOverVideoId(null);
    if (!draggedId || draggedId === targetItem.id) return;

    try {
      setEditingVideo(true);
      let projectId;
      if (targetItem.video_project_id) {
        const res = await videoProjectsAPI.addVideo(targetItem.video_project_id, draggedId);
        projectId = res.data.id;
      } else {
        const createRes = await videoProjectsAPI.create(id, targetItem.id);
        projectId = createRes.data.id;
        await videoProjectsAPI.addVideo(projectId, draggedId);
      }
      navigate(`/video-editor/${projectId}`);
    } catch (err) {
      alert('Erro ao combinar vídeos: ' + (err.response?.data?.detail || err.message));
      setEditingVideo(false);
    }
  };

  const handleSelectHistoryImage = (imagePath) => {
    setEditPostImageUrl(postImageUrl(imagePath));
    setEditingPost(prev => ({ ...prev, image_path: imagePath }));
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
    } catch (error) {
      const detail = error.response?.data?.detail || error.message || 'Erro desconhecido';
      alert('Erro ao atualizar avatar: ' + detail);
    }
  };

  const generateNewAvatar = async () => {
    if (!aiPrompt.trim()) return;
    try {
      setGeneratingAvatar(true);
      await avatarsAPI.generate(aiPrompt, id);
      await loadData();
      closeAvatarModal();
    } catch (error) {
      alert('Erro ao gerar avatar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      await avatarsAPI.upload(file, id);
      await loadData();
      closeAvatarModal();
    } catch (error) {
      alert('Erro ao fazer upload do avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const openGallery = (index) => {
    setCurrentItemIndex(index);
    setGalleryCopied(false);
    setShowGallery(true);
  };

  const closeGallery = () => setShowGallery(false);

  const goNext = () => { if (currentItemIndex < items.length - 1) setCurrentItemIndex(i => i + 1); };
  const goPrev = () => { if (currentItemIndex > 0) setCurrentItemIndex(i => i - 1); };

  useEffect(() => {
    if (!showGallery) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') closeGallery();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [showGallery, currentItemIndex, items.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!channel) return <div className="text-center py-12">Canal não encontrado</div>;

  const currentItem = items[currentItemIndex];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/channels')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Voltar aos canais</span>
      </button>

      {/* Channel Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 relative overflow-visible">
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl">
          <div className="absolute -bottom-16 left-8 group z-30">
            <div className="relative">
              {channel.avatar_url ? (
                <img src={channel.avatar_url} alt={channel.name}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                  <Sparkles size={48} className="text-gray-400" />
                </div>
              )}
              <button onClick={openAvatarModal}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all group-hover:scale-110"
                title="Trocar avatar">
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
                onClick={() => canVideo && navigate(`/channels/${id}/generate-video`)}
                disabled={!canVideo}
                title={!canVideo ? `Requer ~200 créditos (vídeo 4s mínimo). Saldo: ${Math.round(balance)}` : undefined}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none">
                <Video size={16} />
                <span>Gerar Vídeo</span>
              </button>
              <button
                onClick={() => canPost && navigate(`/channels/${id}/generate`)}
                disabled={!canPost}
                title={!canPost ? `Requer ~32 créditos. Saldo: ${Math.round(balance)}` : undefined}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none">
                <Sparkles size={16} />
                <span>Gerar Post</span>
              </button>
              
              {/* Dropdown do Canal */}
              <div className="relative" ref={channelDropdownRef}>
                <button
                  onClick={() => setChannelDropdownOpen(!channelDropdownOpen)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <MoreVertical size={16} />
                  <ChevronDown className={`transition-transform ${channelDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                </button>

                {channelDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={async () => {
                        setChannelDropdownOpen(false);
                        setShowEditModal(true);
                        try {
                          const res = await referencesAPI.getAll(id);
                          setReferences(res.data);
                        } catch {}
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit2 size={16} />
                      <span>Editar Canal</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setChannelDropdownOpen(false);
                        setShowConnectionsModal(true);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Instagram size={16} />
                      <span>Conexões</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setChannelDropdownOpen(false);
                        navigate(`/channels/${id}/dashboard`);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <BarChart2 size={16} />
                      <span>Dashboard</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Feed <span className="text-gray-400 text-lg font-normal">({items.length})</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nenhum conteúdo ainda. Gere seu primeiro post ou vídeo!
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => navigate(`/channels/${id}/generate`)}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                Gerar Post
              </button>
              <button onClick={() => navigate(`/channels/${id}/generate-video`)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
                Gerar Vídeo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openGallery(index)}
                draggable={item._type === 'video' && !item.video_project_id}
                onDragStart={item._type === 'video' ? (e) => handleVideoDragStart(e, item) : undefined}
                onDragEnd={item._type === 'video' ? handleVideoDragEnd : undefined}
                onDragOver={item._type === 'video' ? (e) => handleVideoDragOver(e, item) : undefined}
                onDragLeave={item._type === 'video' ? handleVideoDragLeave : undefined}
                onDrop={item._type === 'video' ? (e) => handleVideoDrop(e, item) : undefined}
                className={`relative bg-gray-50 dark:bg-gray-900 rounded-lg border overflow-hidden hover:shadow-lg transition-all cursor-pointer hover:scale-105 ${
                  draggingVideoId === item.id
                    ? 'opacity-40 scale-95 border-gray-200 dark:border-gray-700'
                    : dragOverVideoId === item.id
                    ? 'border-purple-500 ring-2 ring-purple-500 ring-offset-2 scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {item._type === 'post' ? (
                  <div className="aspect-square overflow-hidden relative">
                    {postImageUrl(item.image_path) ? (
                      <img src={postImageUrl(item.image_path)} alt="Post"
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <ImageIcon size={40} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    {item.prompt && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowPromptFor(showPromptFor === item.id ? null : item.id); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                        title="Ver prompt"
                      >
                        <Info size={13} className="text-white" />
                      </button>
                    )}
                    {showPromptFor === item.id && (
                      <div className="absolute inset-0 bg-black/80 z-20 p-3 overflow-y-auto flex flex-col">
                        <p className="text-purple-300 text-xs font-semibold uppercase mb-2">Prompt</p>
                        <p className="text-white text-xs leading-relaxed whitespace-pre-wrap flex-1">{item.prompt}</p>
                        <button onClick={(e) => { e.stopPropagation(); setShowPromptFor(null); }}
                          className="mt-2 self-end text-gray-400 hover:text-white transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-violet-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
                    <video src={item.video_path} muted playsInline preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                      <span className="text-white text-xs font-medium bg-black/40 px-2 py-0.5 rounded-full">
                        {item.duration_seconds}s · {item.size}
                      </span>
                    </div>
                    {item.prompt && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowPromptFor(showPromptFor === item.id ? null : item.id); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                        title="Ver prompt"
                      >
                        <Info size={13} className="text-white" />
                      </button>
                    )}
                    {showPromptFor === item.id && (
                      <div className="absolute inset-0 bg-black/80 z-20 p-3 overflow-y-auto flex flex-col">
                        <p className="text-purple-300 text-xs font-semibold uppercase mb-2">Prompt</p>
                        <p className="text-white text-xs leading-relaxed whitespace-pre-wrap flex-1">{item.prompt}</p>
                        <button onClick={(e) => { e.stopPropagation(); setShowPromptFor(null); }}
                          className="mt-2 self-end text-gray-400 hover:text-white transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    {dragOverVideoId === item.id && draggingVideoId && draggingVideoId !== item.id && (
                      <div className="absolute inset-0 bg-purple-600/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-none rounded-lg">
                        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center mb-2">
                          <Plus size={24} className="text-white" />
                        </div>
                        <p className="text-white font-semibold text-sm">Soltar para combinar</p>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                    {item._type === 'post' ? item.text : (item.caption || item.prompt)}
                  </p>
                  {item.published && item.insights && (
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="flex items-center gap-1"><Heart size={11} className="text-pink-400" />{item.insights.like_count}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={11} className="text-blue-400" />{item.insights.comments_count}</span>
                      {item.insights.reach != null && <span className="flex items-center gap-1"><Eye size={11} className="text-violet-400" />{item.insights.reach >= 1000 ? `${(item.insights.reach/1000).toFixed(1)}k` : item.insights.reach}</span>}
                      {item.insights.engagement_rate != null && <span className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">{item.insights.engagement_rate.toFixed(1)}%</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item._type === 'video' && (
                        <span className="bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                          <Video size={10} /> Vídeo
                        </span>
                      )}
                      {item.published && (
                        <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                          Publicado
                        </span>
                      )}
                    </div>
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
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-bold">Editar Canal</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Canal *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Objetivo *</label>
                <textarea value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Como Escrever <span className="text-gray-400 font-normal">(Text Prompt)</span></label>
                <textarea value={formData.text_generation_prompt}
                  onChange={(e) => setFormData({ ...formData, text_generation_prompt: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                  placeholder="Instrução para a IA gerar os textos (opcional)" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Como Ilustrar <span className="text-gray-400 font-normal">(Image Prompt)</span></label>
                <textarea value={formData.image_generation_prompt}
                  onChange={(e) => setFormData({ ...formData, image_generation_prompt: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                  placeholder="Instrução para a IA gerar as imagens (opcional)" />
              </div>

              {/* Image model selector */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium mb-2">Modelo de geração de imagem</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'mai', label: 'MAI-Image-2e', desc: 'Rápido, sem limite de requests. Indicado para volume.', badge: 'Padrão' },
                      { value: 'gpt-image-2', label: 'gpt-image-2', desc: 'Alta qualidade. Usa a foto de referência diretamente (image-to-image).', badge: '2 req/min' },
                    ].map(({ value, label, desc, badge }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, image_model: value }))}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          formData.image_model === value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            value === 'mai' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                          }`}>{badge}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* References section */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">Referências visuais</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Fotos de referência do personagem/pessoa — a IA usa como base para gerar imagens consistentes.
                      </p>
                    </div>
                    <label className={`shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      uploadingRef
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/60'
                    }`}>
                      {uploadingRef ? <Loader className="animate-spin" size={12} /> : <Upload size={12} />}
                      <span>{uploadingRef ? 'Enviando...' : 'Adicionar'}</span>
                      <input type="file" className="hidden" accept="image/*" disabled={uploadingRef}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            setUploadingRef(true);
                            const res = await referencesAPI.upload(id, file);
                            const uploaded = res.data;
                            setReferences(prev => [uploaded, ...prev]);
                            // Poll once after 8s if description is still null (vision model may be slow)
                            if (!uploaded.description) {
                              setDescribingRefId(uploaded.id);
                              setTimeout(async () => {
                                try {
                                  const fresh = await referencesAPI.getAll(id);
                                  setReferences(fresh.data);
                                } catch {}
                                setDescribingRefId(null);
                              }, 8000);
                            }
                          } catch (err) {
                            alert('Erro ao enviar: ' + (err.response?.data?.detail || err.message));
                          } finally {
                            setUploadingRef(false);
                            e.target.value = '';
                          }
                        }} />
                    </label>
                  </div>
                  {references.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">Nenhuma referência adicionada ainda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {references.map((ref) => (
                        <div key={ref.id} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                          <img src={ref.blob_url} alt="Referência" className="w-full h-full object-cover" />
                          {ref.description && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <p className="text-white text-[8px] leading-tight p-1 text-center line-clamp-4">{ref.description.slice(0, 80)}</p>
                            </div>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                await referencesAPI.delete(id, ref.id);
                                setReferences(prev => prev.filter(r => r.id !== ref.id));
                              } catch {}
                            }}
                            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={10} className="text-white" />
                          </button>
                          {!ref.description && (
                            <div className={`absolute bottom-0 left-0 right-0 text-white text-[8px] text-center py-0.5 ${
                              describingRefId === ref.id ? 'bg-amber-500/80' : 'bg-gray-500/70'
                            }`}>
                              {describingRefId === ref.id ? 'Descrevendo...' : 'Sem descrição'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <button onClick={() => setShowEditModal(false)} disabled={saving}
                className="px-5 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving || !formData.name || !formData.objective}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-5 py-2 text-sm rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2">
                {saving ? <><Loader className="animate-spin" size={14} /><span>Salvando...</span></> : <><Edit2 size={14} /><span>Salvar</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connections Modal */}
      {showConnectionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Conexões</h2>
              <button onClick={() => {
                setShowConnectionsModal(false);
                setIgMessage(null);
              }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Instagram Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold" style={{ fontSize: '11px' }}>IG</span>
                  </div>
                  <span className="text-base font-semibold">Instagram</span>
                </div>

                {igMessage && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm border mb-3 ${
                    igMessage.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }`}>
                    {igMessage.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>{igMessage.text}</span>
                  </div>
                )}

                {formData.instagram_user_id && formData.instagram_access_token ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle className="text-green-600 dark:text-green-400 shrink-0" size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-300">Conectado</p>
                      <p className="text-sm text-green-700 dark:text-green-400 font-mono truncate">ID: {formData.instagram_user_id}</p>
                    </div>
                    <button type="button" onClick={handleDisconnectIG}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-700 font-medium">
                      <Unlink size={14} /> Desconectar
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={handleConnectIG} disabled={connectingIG}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-base font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                    {connectingIG ? <><Loader className="animate-spin" size={16} /> Redirecionando...</> : <><Instagram size={16} /> Conectar com Instagram</>}
                  </button>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Conecte sua conta do Instagram para publicar posts automaticamente.
                </p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => {
                setShowConnectionsModal(false);
                setIgMessage(null);
              }}
                className="px-5 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Trocar Avatar</h2>
              <button onClick={closeAvatarModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><X size={24} /></button>
            </div>
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              {[
                { key: 'gallery', icon: ImageIcon, label: 'Galeria' },
                { key: 'generate', icon: Wand2, label: 'Gerar com IA' },
                { key: 'upload', icon: Upload, label: 'Upload' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setAvatarTab(key)}
                  className={`flex-1 px-6 py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
                    avatarTab === key
                      ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  <Icon size={20} /><span>{label}</span>
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {avatarTab === 'gallery' && (
                availableAvatars.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhum avatar disponível ainda</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableAvatars.map((avatar) => (
                      <button key={avatar.filename} onClick={() => selectAvatar(avatar.url)}
                        className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all hover:shadow-lg">
                        <img src={avatar.url} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        {channel.avatar_url === avatar.url && (
                          <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">Atual</div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
              {avatarTab === 'generate' && (
                <div className="space-y-4 max-w-2xl mx-auto">
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows="6"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalhe adicional (o prompt do canal já é aplicado automaticamente)..." />
                  {!canAvatar && <NoCreditsAlert needed={30} />}
                  <button onClick={generateNewAvatar} disabled={generatingAvatar || !canAvatar}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                    {generatingAvatar ? <><Loader className="animate-spin" size={20} /><span>Gerando...</span></> : <><Wand2 size={20} /><span>Gerar Avatar</span></>}
                  </button>
                </div>
              )}
              {avatarTab === 'upload' && (
                <div className="max-w-xl mx-auto">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {uploadingAvatar ? (
                      <Loader className="animate-spin text-blue-600 mb-4" size={48} />
                    ) : (
                      <><Upload className="text-gray-400 mb-4" size={48} /><p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">Clique para fazer upload</span></p></>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-xl font-bold">Editar Post</h2>
              <button onClick={() => setShowEditPostModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
              <div className="md:w-72 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="aspect-square w-full bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0">
                  <img src={editPostImageUrl} alt="Post" className="w-full h-full object-cover" />
                </div>
                <button onClick={() => setShowImagePicker(prev => !prev)}
                  className="m-3 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 shrink-0">
                  <Camera size={15} /><span>{showImagePicker ? 'Fechar' : 'Trocar imagem'}</span>
                </button>
                {showImagePicker && (
                  <div className="flex-1 flex flex-col border-t border-gray-200 dark:border-gray-700 min-h-0">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
                      {[{ key: 'gallery', label: 'Galeria' }, { key: 'generate', label: 'Gerar IA' }, { key: 'upload', label: 'Upload' }].map(tab => (
                        <button key={tab.key} onClick={() => setImagePickerTab(tab.key)}
                          className={`flex-1 py-2 text-xs font-medium transition-colors ${imagePickerTab === tab.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 overflow-y-auto flex-1">
                      {imagePickerTab === 'gallery' && (
                        postImageHistory.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-4">Nenhuma imagem ainda.<br/>Gere ou faça upload de uma imagem.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {postImageHistory.map((imgPath, i) => (
                              <button key={imgPath} onClick={() => handleSelectHistoryImage(imgPath)}
                                className={`aspect-square overflow-hidden rounded-lg border-2 transition-all hover:border-blue-500 ${editingPost.image_path === imgPath ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
                                <img src={postImageUrl(imgPath)} alt={`Versão ${postImageHistory.length - i}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )
                      )}
                      {imagePickerTab === 'generate' && (
                        <div className="space-y-3">
                          <textarea value={imageGenPrompt} onChange={(e) => setImageGenPrompt(e.target.value)} rows="4"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Detalhe adicional (o prompt do canal já é aplicado automaticamente)..." />
                          {!canImage && <NoCreditsAlert needed={30} />}
                          <button onClick={handleGeneratePostImage} disabled={generatingPostImage || !canImage}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                            {generatingPostImage ? <><Loader className="animate-spin" size={14} /><span>Gerando...</span></> : <><Wand2 size={14} /><span>Gerar</span></>}
                          </button>
                        </div>
                      )}
                      {imagePickerTab === 'upload' && (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          {uploadingPostImage ? <Loader className="animate-spin text-blue-600" size={24} /> : <><Upload className="text-gray-400 mb-2" size={24} /><span className="text-xs text-gray-500">Upload</span></>}
                          <input type="file" className="hidden" accept="image/*" onChange={handlePostImageUpload} disabled={uploadingPostImage} />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col p-5 min-h-0">
                <label className="block text-sm font-medium mb-2 shrink-0">Legenda</label>
                <textarea value={editPostText} onChange={(e) => setEditPostText(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
              <button onClick={() => setShowEditPostModal(false)} disabled={savingPost}
                className="px-5 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSavePost} disabled={savingPost}
                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-5 py-2 text-sm rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2">
                {savingPost ? <><Loader className="animate-spin" size={14} /><span>Salvando...</span></> : <><Edit2 size={14} /><span>Salvar</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && items.length > 0 && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[100]">
          <button onClick={closeGallery} className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all z-10">
            <X className="w-8 h-8 text-white" />
          </button>
          <div className="absolute top-4 left-4 px-4 py-2 bg-white bg-opacity-10 rounded-full text-white text-sm z-10 flex items-center gap-2">
            {currentItem._type === 'video' && <Video size={14} />}
            {currentItemIndex + 1} / {items.length}
          </div>
          {currentItemIndex > 0 && (
            <button onClick={goPrev} className="absolute left-4 p-3 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all z-10">
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}
          {currentItemIndex < items.length - 1 && (
            <button onClick={goNext} className="absolute right-4 p-3 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all z-10">
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}

          <div className="max-w-6xl w-full mx-4 flex flex-col md:flex-row gap-6 items-center">
            {/* Media */}
            <div className="flex-1 flex items-center justify-center">
              {currentItem._type === 'post' ? (
                <img src={postImageUrl(currentItem.image_path)} alt="Post"
                  className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" />
              ) : (
                <video src={currentItem.video_path} controls autoPlay loop playsInline
                  className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" />
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }}>
              {/* Header */}
              <div className="shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {channel.avatar_url ? (
                    <img src={channel.avatar_url} alt={channel.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{channel.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentItem._type === 'video'
                        ? `Sora · ${currentItem.duration_seconds}s · ${currentItem.size}`
                        : formatDate(currentItem.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {currentItem._type === 'post' ? currentItem.text : (currentItem.caption || currentItem.prompt)}
                </p>
                {currentItem.prompt && (
                  <details className="group">
                    <summary className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors select-none list-none flex items-center gap-1">
                      <Info size={12} />
                      <span>Ver prompt</span>
                    </summary>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 font-mono whitespace-pre-wrap leading-relaxed">
                      {currentItem.prompt}
                    </p>
                  </details>
                )}
              </div>

              {/* Insights panel */}
              {currentItem.published && currentItem.insights && (
                <div className="shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <BarChart2 size={12} /> Engajamento
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-base font-bold text-pink-500">{currentItem.insights.like_count}</p>
                      <p className="text-xs text-gray-400">Curtidas</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-blue-500">{currentItem.insights.comments_count}</p>
                      <p className="text-xs text-gray-400">Comentários</p>
                    </div>
                    {currentItem.insights.reach != null ? (
                      <div>
                        <p className="text-base font-bold text-violet-500">
                          {currentItem.insights.reach >= 1000 ? `${(currentItem.insights.reach/1000).toFixed(1)}k` : currentItem.insights.reach}
                        </p>
                        <p className="text-xs text-gray-400">Alcance</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-base font-bold text-emerald-500">
                          {currentItem.insights.engagement_rate != null ? `${currentItem.insights.engagement_rate.toFixed(1)}%` : '—'}
                        </p>
                        <p className="text-xs text-gray-400">Engajamento</p>
                      </div>
                    )}
                  </div>
                  {(currentItem.insights.impressions != null || currentItem.insights.saved != null) && (
                    <div className="grid grid-cols-3 gap-2 text-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {currentItem.insights.impressions != null && (
                        <div>
                          <p className="text-sm font-semibold">{currentItem.insights.impressions >= 1000 ? `${(currentItem.insights.impressions/1000).toFixed(1)}k` : currentItem.insights.impressions}</p>
                          <p className="text-xs text-gray-400">Impressões</p>
                        </div>
                      )}
                      {currentItem.insights.saved != null && (
                        <div>
                          <p className="text-sm font-semibold">{currentItem.insights.saved}</p>
                          <p className="text-xs text-gray-400">Salvos</p>
                        </div>
                      )}
                      {currentItem.insights.video_views != null && (
                        <div>
                          <p className="text-sm font-semibold">{currentItem.insights.video_views >= 1000 ? `${(currentItem.insights.video_views/1000).toFixed(1)}k` : currentItem.insights.video_views}</p>
                          <p className="text-xs text-gray-400">Views</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer actions */}
              <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {currentItem.published ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">Publicado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Rascunho</span>
                  </div>
                )}

                {currentItem._type === 'post' ? (
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openEditPostModal(currentItem); }}
                      className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <Edit size={16} /> Editar
                    </button>
                    {!currentItem.published && (
                      <button onClick={(e) => { e.stopPropagation(); handlePublish(currentItem); }} disabled={publishing}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
                        {publishing ? <><Loader className="animate-spin" size={14} /><span>Publicando...</span></> : <><Share2 size={16} /><span>Publicar</span></>}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {!currentItem.published && (
                      <button onClick={(e) => { e.stopPropagation(); handlePublishVideo(currentItem); }} disabled={publishingVideo}
                        className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
                        {publishingVideo ? <><Loader className="animate-spin" size={14} /><span>Publicando...</span></> : <><Share2 size={16} /><span>Publicar Reel</span></>}
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleEditVideo(currentItem); }} disabled={editingVideo}
                      className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
                      {editingVideo ? <><Loader className="animate-spin" size={14} /><span>Abrindo...</span></> : <><Edit size={16} /><span>Editar</span></>}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = currentItem.video_path; a.download = `${currentItem.id}.mp4`; a.target = '_blank'; a.click(); }}
                      className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <Download size={16} /> Baixar vídeo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelViewPage;
