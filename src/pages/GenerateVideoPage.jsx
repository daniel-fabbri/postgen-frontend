import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { channelsAPI, videosAPI } from '../api';
import { Loader, Sparkles, ArrowLeft, RefreshCw, Video, Play, Download, Clock, Maximize2 } from 'lucide-react';

const DURATIONS = [
  { value: 4, label: '4s', desc: 'Rápido' },
  { value: 8, label: '8s', desc: 'Padrão' },
  { value: 16, label: '16s', desc: 'Longo' },
];

const SIZES = [
  { value: '720x1280', label: '9:16', desc: 'Reels / Stories' },
  { value: '1080x1920', label: '9:16 HD', desc: 'Alta qualidade' },
  { value: '1080x1080', label: '1:1', desc: 'Feed quadrado' },
];

const GenerateVideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [seconds, setSeconds] = useState(4);
  const [size, setSize] = useState('720x1280');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { loadChannel(); }, [id]);

  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const loadChannel = async () => {
    try {
      setLoadingChannel(true);
      const res = await channelsAPI.get(id);
      setChannel(res.data);
    } catch {
      navigate(`/channels/${id}`);
    } finally {
      setLoadingChannel(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setVideo(null);
    try {
      const res = await videosAPI.generate(id, additionalPrompt, seconds, size);
      setVideo(res.data);
    } catch (err) {
      alert('Erro ao gerar vídeo: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!video?.video_path) return;
    const a = document.createElement('a');
    a.href = video.video_path;
    a.download = `postgen-video-${video.id}.mp4`;
    a.target = '_blank';
    a.click();
  };

  if (loadingChannel) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-purple-600" size={40} />
      </div>
    );
  }
  if (!channel) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(`/channels/${id}`)}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Voltar para o canal
      </button>

      {/* Channel header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          {channel.suggested_image_url ? (
            <img src={channel.suggested_image_url} alt={channel.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-lg" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Video size={24} className="text-white/80" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{channel.name}</h1>
            <p className="text-violet-200 text-sm mt-0.5 flex items-center gap-1.5">
              <Sparkles size={13} /> Gerador de vídeo com Sora
            </p>
          </div>
        </div>
      </div>

      {/* Config + prompt */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Clock size={14} /> Duração
            </label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSeconds(d.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    seconds === d.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold">{d.label}</div>
                  <div className="text-xs opacity-70">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Maximize2 size={14} /> Formato
            </label>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSize(s.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    size === s.value
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold">{s.label}</div>
                  <div className="text-xs opacity-70">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Contexto adicional <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              value={additionalPrompt}
              onChange={e => setAdditionalPrompt(e.target.value)}
              placeholder="Ex: Mostrar o produto em close, ambiente minimalista, tons quentes..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm"
              rows={3}
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-violet-900/30 transition-all flex items-center justify-center gap-2"
          >
            <Video size={18} />
            {video ? 'Gerar novo vídeo' : 'Gerar vídeo com Sora'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 mb-6 relative">
            <Video size={36} className="text-violet-600" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Sora está criando seu vídeo...</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
            A geração de vídeo com IA leva entre 30 segundos e 2 minutos. Aguarde.
          </p>
          <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-sm font-medium px-4 py-2 rounded-full">
            <Clock size={14} />
            {elapsed}s
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {video && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Video player */}
            <div className="md:w-1/2 bg-black flex items-center justify-center min-h-[300px]">
              {video.video_path ? (
                <video
                  src={video.video_path}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-500 p-8">
                  <Video size={40} />
                  <p className="text-sm">Vídeo indisponível</p>
                </div>
              )}
            </div>

            {/* Info + actions */}
            <div className="md:w-1/2 flex flex-col p-6 gap-4">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                {channel.suggested_image_url ? (
                  <img src={channel.suggested_image_url} alt={channel.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {channel.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{channel.name}</p>
                  <p className="text-xs text-gray-400">Sora · {video.duration_seconds}s · {video.size}</p>
                </div>
              </div>

              {/* Prompt used */}
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Prompt utilizado</span>
                <div className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{video.prompt}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full font-medium border border-violet-200 dark:border-violet-800">
                  <Clock size={11} /> {video.duration_seconds}s
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full font-medium border border-violet-200 dark:border-violet-800">
                  <Maximize2 size={11} /> {video.size}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Download size={16} />
                  Baixar vídeo
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

export default GenerateVideoPage;
