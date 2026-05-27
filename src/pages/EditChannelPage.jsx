import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { channelsAPI } from '../api';
import { Loader, Sparkles, ArrowLeft, Save, Wifi, CheckCircle, XCircle, Instagram, Unlink } from 'lucide-react';

const EditChannelPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    text_generation_prompt: '',
    image_generation_prompt: '',
    suggested_image_url: '',
    instagram_user_id: '',
    instagram_access_token: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingIG, setConnectingIG] = useState(false);
  const [igMessage, setIgMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const igSuccess = params.get('ig_success');
    const igError = params.get('ig_error');
    if (igSuccess) {
      setIgMessage({ type: 'success', text: `Instagram @${igSuccess} conectado com sucesso!` });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (igError) {
      setIgMessage({ type: 'error', text: `Erro ao conectar Instagram: ${igError}` });
      window.history.replaceState({}, '', window.location.pathname);
    }
    loadChannel();
  }, [id]);

  const loadChannel = async () => {
    try {
      setLoading(true);
      const response = await channelsAPI.get(id);
      setFormData({
        name: response.data.name || '',
        objective: response.data.objective || '',
        text_generation_prompt: response.data.text_generation_prompt || '',
        image_generation_prompt: response.data.image_generation_prompt || '',
        suggested_image_url: response.data.suggested_image_url || '',
        instagram_user_id: response.data.instagram_user_id || '',
        instagram_access_token: response.data.instagram_access_token || '',
      });
    } catch (error) {
      console.error('Error loading channel:', error);
      alert('Error loading channel');
      navigate('/channels');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.objective.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);
      await channelsAPI.update(id, formData);
      navigate('/channels');
    } catch (error) {
      console.error('Error updating channel:', error);
      alert('Error updating channel. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/channels')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft size={20} />
        <span>Back to Channels</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Edit Channel</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update your channel information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Channel Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., Tech News Daily"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Channel Objective *
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe the purpose and target audience of this channel..."
              disabled={saving}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This will help AI generate better content for your channel
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Como Escrever (Text Prompt)
            </label>
            <textarea
              value={formData.text_generation_prompt}
              onChange={(e) => setFormData({ ...formData, text_generation_prompt: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Custom prompt for text generation... (optional)"
              disabled={saving}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Instrução personalizada para a IA gerar os textos dos posts. Se deixar vazio, usará o prompt padrão.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Como Ilustrar (Image Prompt)
            </label>
            <textarea
              value={formData.image_generation_prompt}
              onChange={(e) => setFormData({ ...formData, image_generation_prompt: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Custom prompt for image generation... (optional)"
              disabled={saving}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Instrução personalizada para a IA gerar as imagens dos posts. Se deixar vazio, usará o prompt padrão.
            </p>
          </div>

          {/* Instagram Integration */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">IG</span>
              </div>
              <span className="font-semibold">Instagram</span>
            </div>

            {igMessage && (
              <div className={`flex items-start gap-3 p-4 rounded-xl text-sm border mb-4 ${
                igMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
              }`}>
                {igMessage.type === 'success' ? <CheckCircle size={16} className="shrink-0 mt-0.5" /> : <XCircle size={16} className="shrink-0 mt-0.5" />}
                <span>{igMessage.text}</span>
              </div>
            )}

            {formData.instagram_user_id && formData.instagram_access_token && formData.instagram_access_token !== '' ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="text-green-600 dark:text-green-400 shrink-0" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-300">Instagram conectado</p>
                  <p className="text-sm text-green-700 dark:text-green-400 font-mono">ID: {formData.instagram_user_id}</p>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnectIG}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-700 transition-colors"
                >
                  <Unlink size={14} /> Desconectar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Conecte uma conta Instagram Professional (Criador ou Empresa) para publicar posts e reels diretamente.
                </p>
                <button
                  type="button"
                  onClick={handleConnectIG}
                  disabled={connectingIG || saving}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connectingIG ? (
                    <><Loader className="animate-spin" size={16} /> Redirecionando...</>
                  ) : (
                    <><Instagram size={16} /> Conectar com Instagram</>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/channels')}
              disabled={saving}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChannelPage;
