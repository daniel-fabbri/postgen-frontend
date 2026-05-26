import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../api';
import { Save, Loader, Settings as SettingsIcon, Globe } from 'lucide-react';

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    azure_openai_endpoint: '',
    azure_openai_api_key: '',
    azure_openai_deployment_name: 'gpt-4',
    azure_openai_image_deployment: 'dall-e-3',
    azure_openai_image_endpoint: '',
    azure_openai_api_version: '2024-02-01',
    public_base_url: 'http://localhost:8004',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      setFormData(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsAPI.update(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, opts = {}) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={opts.type || 'text'}
        value={formData[key] ?? ''}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none font-mono text-sm"
        placeholder={opts.placeholder || ''}
      />
      {opts.hint && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opts.hint}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure as chaves de API e endpoints
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Azure OpenAI */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <SettingsIcon className="text-primary-600 dark:text-primary-400" size={22} />
            </div>
            <h2 className="text-xl font-semibold">Azure OpenAI</h2>
          </div>

          <div className="space-y-4">
            {field('Endpoint URL *', 'azure_openai_endpoint', {
              placeholder: 'https://your-resource.openai.azure.com/',
            })}

            {field('API Key *', 'azure_openai_api_key', {
              type: 'password',
              placeholder: '(salvo — deixe em branco para não alterar)',
            })}

            {field('Image Generation Endpoint', 'azure_openai_image_endpoint', {
              placeholder: 'https://your-resource.services.ai.azure.com/mai/v1/images/generations',
              hint: 'Para MAI/FLUX: https://your-resource.services.ai.azure.com/mai/v1/images/generations',
            })}

            <div className="grid md:grid-cols-2 gap-4">
              {field('Text Deployment Name', 'azure_openai_deployment_name', { placeholder: 'gpt-4' })}
              {field('Image Deployment Name', 'azure_openai_image_deployment', { placeholder: 'dall-e-3' })}
            </div>

            {field('API Version', 'azure_openai_api_version', { placeholder: '2024-02-01' })}
          </div>
        </div>

        {/* Publicação */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Globe className="text-green-600 dark:text-green-400" size={22} />
            </div>
            <h2 className="text-xl font-semibold">Publicação</h2>
          </div>

          <div className="space-y-4">
            {field('URL Pública do Servidor', 'public_base_url', {
              placeholder: 'http://localhost:8004',
              hint: 'URL acessível pela internet para que o Instagram consiga baixar as imagens dos posts. Em desenvolvimento, use ngrok: ngrok http 8004',
            })}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Como configurar o Instagram por canal</p>
              <p className="text-blue-700 dark:text-blue-300">
                As credenciais do Instagram (User ID e Access Token) são configuradas individualmente em cada canal. Acesse a página do canal → <strong>Edit Channel</strong> → seção <strong>Instagram</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving ? (
              <><Loader className="animate-spin" size={18} /><span>Salvando...</span></>
            ) : saved ? (
              <><span>✓</span><span>Salvo!</span></>
            ) : (
              <><Save size={18} /><span>Salvar</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
