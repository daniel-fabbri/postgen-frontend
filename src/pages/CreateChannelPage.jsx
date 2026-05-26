import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelsAPI } from '../api';
import { Loader, Sparkles, ArrowLeft } from 'lucide-react';

const CreateChannelPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    text_generation_prompt: '',
    image_generation_prompt: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.objective.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await channelsAPI.create(formData);
      navigate('/channels');
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Error creating channel. Please check your settings and try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold">Create New Channel</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up a new social media channel
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Instrução personalizada para a IA gerar as imagens dos posts. Se deixar vazio, usará o prompt padrão.
            </p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <p className="text-sm text-primary-900 dark:text-primary-100">
              <strong>✨ AI Magic:</strong> Once created, AI will automatically generate a suggested profile image for your channel!
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Create Channel</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/channels')}
              disabled={loading}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelPage;
