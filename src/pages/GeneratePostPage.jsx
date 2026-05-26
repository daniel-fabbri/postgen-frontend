import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { channelsAPI, postsAPI } from '../api';
import { Loader, Sparkles, Send, ArrowLeft, RefreshCw } from 'lucide-react';

const GeneratePostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  useEffect(() => {
    loadChannel();
  }, [id]);

  const loadChannel = async () => {
    try {
      setLoadingChannel(true);
      const response = await channelsAPI.get(id);
      setChannel(response.data);
    } catch (error) {
      console.error('Error loading channel:', error);
      alert('Channel not found');
      navigate(`/channels/${id}`);
    } finally {
      setLoadingChannel(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setPost(null);
      const response = await postsAPI.generate(id, additionalPrompt);
      setPost(response.data);
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Error generating post. Please check your Azure OpenAI settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!post) return;

    if (!confirm('Publish this post to Instagram?')) return;

    try {
      setPublishing(true);
      await postsAPI.publish(id, post.text, post.image_url);
      alert('Post published successfully! (Demo mode - check console for details)');
      setPost(null);
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Error publishing post. Please check your Instagram settings.');
    } finally {
      setPublishing(false);
    }
  };

  if (loadingChannel) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!channel) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/channels/${id}`)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft size={20} />
        <span>Back to Channel</span>
      </button>

      {/* Channel Info */}
      <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-start space-x-4">
          {channel.suggested_image_url && (
            <img 
              src={channel.suggested_image_url} 
              alt={channel.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{channel.name}</h1>
            <p className="text-primary-100">Pronto para criar conteúdo incrível com IA</p>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      {!post && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full">
              <Sparkles size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Generate AI Post</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            A IA criará um post completo com texto e imagem para você
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contexto Adicional (Opcional)
            </label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              placeholder="Adicione informações específicas para esta geração... (ex: 'Falar sobre o Fusca 1975', 'Mencionar a cor azul', etc.)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows="4"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Use este campo para orientar a IA com instruções específicas para este post
            </p>
          </div>
          
          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles size={20} />
            <span>Generate Post</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Loader className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-semibold mb-2">Generating Your Post...</h3>
          <p className="text-gray-600 dark:text-gray-400">
            AI is creating amazing content for you. This may take a moment.
          </p>
        </div>
      )}

      {/* Generated Post */}
      {post && !loading && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Generated post"
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-3">Post Caption</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.text}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {publishing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Publish to Instagram</span>
                </>
              )}
            </button>
            <button
              onClick={handleGenerate}
              disabled={publishing}
              className="px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw size={20} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePostPage;
