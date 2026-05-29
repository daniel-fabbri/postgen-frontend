import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { channelsAPI, postsAPI } from '../api';
import { Loader, Sparkles, Send, ArrowLeft, RefreshCw, Copy, CheckCheck, ImageIcon } from 'lucide-react';
import { useAuth } from '../AuthContext';
import NoCreditsAlert from '../components/NoCreditsAlert';

const GeneratePostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const balance = user?.credits_balance || 0;
  const POST_MIN_CREDITS = 32; // texto (~2) + imagem MAI (~30)
  const hasCredits = balance >= POST_MIN_CREDITS;
  const [channel, setChannel] = useState(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);

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
      navigate(`/channels/${id}`);
    } finally {
      setLoadingChannel(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setPost(null);
      setPublished(false);
      const response = await postsAPI.generate(id, additionalPrompt);
      setPost(response.data);
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Erro ao gerar post. Verifique as configurações do Azure OpenAI.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!post?.id) return;
    if (!confirm('Publicar este post no Instagram?')) return;
    try {
      setPublishing(true);
      await postsAPI.publishPost(post.id);
      setPublished(true);
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Erro ao publicar: ' + (error.response?.data?.detail || error.message));
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyCaption = () => {
    if (!post?.text) return;
    navigator.clipboard.writeText(post.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingChannel) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }

  if (!channel) return null;

  const imageUrl = post?.image_url || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(`/channels/${id}`)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Voltar para o canal
      </button>

      {/* Channel header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          {channel.suggested_image_url ? (
            <img
              src={channel.suggested_image_url}
              alt={channel.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <ImageIcon size={24} className="text-white/80" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{channel.name}</h1>
            <p className="text-purple-200 text-sm mt-0.5">Gerador de conteúdo com IA</p>
          </div>
        </div>
      </div>

      {/* Prompt input — always visible */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {!hasCredits && <NoCreditsAlert needed={POST_MIN_CREDITS} />}
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Contexto adicional <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            placeholder="Ex: Falar sobre o lançamento do produto X, usar tom descontraído, mencionar promoção de fim de semana..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm"
            rows={3}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !hasCredits}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Sparkles size={18} />
            {post ? 'Gerar novo post' : 'Gerar post com IA'}
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 mb-6">
            <Loader className="animate-spin text-purple-600" size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Criando seu post...</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
            A IA está gerando o texto e a imagem. Isso pode levar alguns instantes.
          </p>
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generated post — two-column layout */}
      {post && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: Image */}
            <div className="md:w-1/2 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 min-h-[300px]">
              {imageUrl ? (
                <div className="w-full aspect-square rounded-xl overflow-hidden shadow-md">
                  <img
                    src={imageUrl}
                    alt="Post gerado"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Right: Caption + Actions */}
            <div className="md:w-1/2 flex flex-col p-6 gap-4">
              {/* Instagram-style header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                {channel.suggested_image_url ? (
                  <img
                    src={channel.suggested_image_url}
                    alt={channel.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {channel.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{channel.name}</p>
                  <p className="text-xs text-gray-400">Instagram</p>
                </div>
              </div>

              {/* Caption */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Legenda</span>
                  <button
                    onClick={handleCopyCaption}
                    className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
                  >
                    {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-56 overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {post.text}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-2">
                {published ? (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-green-800">
                    <CheckCheck size={16} />
                    Post publicado com sucesso!
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {publishing ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Publicar no Instagram
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={publishing}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={15} />
                  Gerar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratePostPage;
