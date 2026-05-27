import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { channelsAPI } from '../api';
import { Loader, Sparkles, ArrowLeft, Save, Wifi, CheckCircle, XCircle } from 'lucide-react';

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
  const [testingIG, setTestingIG] = useState(false);
  const [igTestResult, setIgTestResult] = useState(null);

  useEffect(() => {
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

  const handleTestIG = async () => {
    setTestingIG(true);
    setIgTestResult(null);
    try {
      const res = await channelsAPI.testInstagram(id, {
        instagram_user_id: formData.instagram_user_id,
        instagram_access_token: formData.instagram_access_token,
      });
      setIgTestResult(res.data);
    } catch (err) {
      setIgTestResult({ success: false, error: err.response?.data?.detail || 'Erro ao testar conexão.' });
    } finally {
      setTestingIG(false);
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Instagram User ID</label>
                <input
                  type="text"
                  value={formData.instagram_user_id}
                  onChange={(e) => setFormData({ ...formData, instagram_user_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
                  placeholder="ex: 17841400008460056"
                  disabled={saving}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID numérico da conta Business/Creator. Meta Business Suite → Configurações → Ativos → Contas do Instagram.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Access Token</label>
                <input
                  type="password"
                  value={formData.instagram_access_token}
                  onChange={(e) => setFormData({ ...formData, instagram_access_token: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono"
                  placeholder={formData.instagram_access_token === '***' ? '(salvo — deixe em branco para não alterar)' : 'EAAxxxxxxxxx...'}
                  disabled={saving}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Token de longa duração da Página do Facebook vinculada. Meta for Developers → Graph API Explorer.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestIG}
                disabled={testingIG || saving || !formData.instagram_user_id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingIG ? (
                  <><Loader className="animate-spin" size={15} /> Testando...</>
                ) : (
                  <><Wifi size={15} /> Testar conexão</>
                )}
              </button>

              {igTestResult && (
                <div className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
                  igTestResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}>
                  {igTestResult.success ? (
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="shrink-0 mt-0.5" />
                  )}
                  <div>
                    {igTestResult.success ? (
                      <>
                        <p className="font-semibold">Conexão bem-sucedida!</p>
                        <p className="mt-0.5 text-green-700 dark:text-green-400">
                          {igTestResult.account?.name && <span>{igTestResult.account.name}</span>}
                          {igTestResult.account?.username && <span> · @{igTestResult.account.username}</span>}
                          {igTestResult.account?.followers_count != null && (
                            <span> · {igTestResult.account.followers_count.toLocaleString('pt-BR')} seguidores</span>
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Falha na conexão</p>
                        <p className="mt-0.5">{igTestResult.error}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
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
