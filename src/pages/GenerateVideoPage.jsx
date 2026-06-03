import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { channelsAPI, videosAPI } from '../api';
import {
  Loader, Sparkles, ArrowLeft, RefreshCw, Video, Download,
  Clock, Maximize2, Share2, CheckCircle, Copy, User,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import CreditGate from '../components/CreditGate';

const DURATIONS = [
  { value: 4, label: '4s', desc: 'Rápido' },
  { value: 8, label: '8s', desc: 'Padrão' },
  { value: 12, label: '12s', desc: 'Longo' },
];

const SIZES = [
  { value: '720x1280', label: '9:16', desc: 'Reels / Stories' },
  { value: '1080x1920', label: '9:16 HD', desc: 'Alta qualidade' },
  { value: '1080x1080', label: '1:1', desc: 'Feed quadrado' },
];

const CHARACTER_VIDEO_COST = 350;

function Step({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-violet-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-xs font-semibold ${
        done ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400'
      }`}>{label}</span>
    </div>
  );
}

function Connector({ done }) {
  return <div className={`h-px w-6 ${done ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}`} />;
}

const GenerateVideoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, isAdmin } = useAuth();
  const balance = user?.credits_balance || 0;
  const [channel, setChannel] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [seconds, setSeconds] = useState(4);
  const [size, setSize] = useState('720x1280');
  const [mode, setMode] = useState('sora'); // 'sora' | 'character'
  const costForVideo = seconds * 50;
  const hasCredits = isAdmin || balance >= costForVideo;
  const hasCreditsForCharacter = isAdmin || balance >= CHARACTER_VIDEO_COST;
  const [elapsed, setElapsed] = useState(0);
  const [loadingStep, setLoadingStep] = useState('');
  const [caption, setCaption] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingCaption, setSavingCaption] = useState(false);

  useEffect(() => { loadChannel(); }, [id]);

  useEffect(() => {
    if (!loading) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(e => {
      // Avança os steps visuais do modo personagem com base no tempo estimado de cada etapa
      if (loadingStep === 'scene' && e === 14) setLoadingStep('inpaint');   // GPT-Image-2 ~15s
      if (loadingStep === 'inpaint' && e === 59) setLoadingStep('animate'); // LoRA inpaint ~45s
      return e + 1;
    }), 1000);
    return () => clearInterval(t);
  }, [loading, loadingStep]);

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
    setLoadingStep('sora');
    setVideo(null);
    setCaption('');
    setPublished(false);
    try {
      const res = await videosAPI.generate(id, additionalPrompt, seconds, size);
      setVideo(res.data);
      setCaption(res.data.caption || '');
      await refreshUser();
    } catch (err) {
      alert('Erro ao gerar vídeo: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleGenerateWithCharacter = async () => {
    setLoading(true);
    setLoadingStep('scene');
    setVideo(null);
    setCaption('');
    setPublished(false);
    try {
      const res = await videosAPI.generateWithCharacter(id, additionalPrompt);
      setVideo(res.data);
      setCaption(res.data.caption || '');
      await refreshUser();
    } catch (err) {
      alert('Erro ao gerar vídeo com personagem: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
      setLoadingStep('');
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

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCaptionBlur = async () => {
    if (!video || caption === video.caption) return;
    try {
      setSavingCaption(true);
      await videosAPI.updateCaption(video.id, caption);
    } catch (e) {
      console.error('Caption save error', e);
    } finally {
      setSavingCaption(false);
    }
  };

  const handlePublish = async () => {
    if (!video) return;
    try {
      setPublishing(true);
      // Save caption before publishing
      if (caption !== video.caption) {
        await videosAPI.updateCaption(video.id, caption);
      }
      await videosAPI.publish(video.id);
      setPublished(true);
    } catch (err) {
      alert('Erro ao publicar: ' + (err.response?.data?.detail || err.message));
    } finally {
      setPublishing(false);
    }
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
        <div className="flex items-center justify-between gap-4">
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
                <Sparkles size={13} /> Gerador de vídeo com IA
              </p>
            </div>
          </div>
          {video && !loading && (
            <button
              onClick={() => { setVideo(null); setCaption(''); setPublished(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all"
            >
              <Video size={15} />
              Gerar novo vídeo
            </button>
          )}
        </div>

        {/* Mode selector — só aparece se o canal tem LoRA treinado */}
        {channel.lora_status === 'succeeded' && !video && !loading && (
          <div className="mt-4 flex gap-2 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setMode('sora')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                mode === 'sora'
                  ? 'bg-white text-violet-700 shadow'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Sparkles size={14} />
              Sora
            </button>
            <button
              onClick={() => setMode('character')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                mode === 'character'
                  ? 'bg-white text-violet-700 shadow'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <User size={14} />
              Com personagem
            </button>
          </div>
        )}
      </div>

      {/* Config panel — hidden once video is ready */}
      {!loading && !video && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">

          {mode === 'character' ? (
            /* ── Modo personagem ── */
            <>
              <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <User size={18} className="text-violet-600 dark:text-violet-400 mt-0.5 shrink-0" />
                <div className="text-sm text-violet-800 dark:text-violet-300">
                  <p className="font-semibold mb-0.5">Vídeo com seu personagem</p>
                  <p className="text-violet-600 dark:text-violet-400 leading-relaxed">
                    Gera um frame portrait do seu personagem via LoRA e anima com MiniMax Video-01.
                    Resultado: ~6s em 9:16, consistência facial garantida.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Contexto adicional <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={additionalPrompt}
                  onChange={e => setAdditionalPrompt(e.target.value)}
                  placeholder="Ex: Personagem sorrindo com produto na mão, luz natural, fundo neutro..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none text-sm"
                  rows={3}
                />
              </div>

              <CreditGate blocked={!hasCreditsForCharacter} needed={CHARACTER_VIDEO_COST} className="w-full">
                <button
                  onClick={handleGenerateWithCharacter}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-violet-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <User size={18} />
                  Gerar vídeo com personagem
                </button>
              </CreditGate>
            </>
          ) : (
            /* ── Modo Sora ── */
            <>
              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Clock size={14} /> Duração
                </label>
                <div className="flex gap-2">
                  {DURATIONS.map(d => (
                    <button key={d.value} type="button" onClick={() => setSeconds(d.value)}
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
                    <button key={s.value} type="button" onClick={() => setSize(s.value)}
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

              <CreditGate blocked={!hasCredits} needed={costForVideo} className="w-full">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-200 dark:hover:shadow-violet-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <Video size={18} />
                  Gerar vídeo com Sora
                </button>
              </CreditGate>
            </>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 mb-6 relative">
            {loadingStep === 'inpaint' ? <User size={36} className="text-violet-600" /> : <Video size={36} className="text-violet-600" />}
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 animate-spin" />
          </div>

          {loadingStep === 'scene' ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Gerando cena com GPT-Image-2...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
                Criando a composição, iluminação e background da cena.
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Step active label="Cena" n="1" />
                <Connector />
                <Step label="Personagem" n="2" />
                <Connector />
                <Step label="Vídeo" n="3" />
              </div>
            </>
          ) : loadingStep === 'inpaint' ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Aplicando personagem com LoRA...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
                Detectando rosto na cena e substituindo pelo seu personagem.
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Step done label="Cena" n="1" />
                <Connector done />
                <Step active label="Personagem" n="2" />
                <Connector />
                <Step label="Vídeo" n="3" />
              </div>
            </>
          ) : loadingStep === 'animate' ? (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Animando com MiniMax...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
                Transformando a cena em vídeo. Pode levar até 5 minutos.
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Step done label="Cena" n="1" />
                <Connector done />
                <Step done label="Personagem" n="2" />
                <Connector done />
                <Step active label="Vídeo" n="3" />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Sora está criando seu vídeo...</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-4">
                A geração de vídeo com IA leva entre 30 segundos e 2 minutos. Aguarde.
              </p>
            </>
          )}

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

      {/* Result — two-column layout like GeneratePostPage */}
      {video && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: Video player */}
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

            {/* Right: Caption + actions */}
            <div className="md:w-1/2 flex flex-col p-6 gap-4">
              {/* Channel header */}
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                {channel.avatar_url ? (
                  <img src={channel.avatar_url} alt={channel.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {channel.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{channel.name}</p>
                  <p className="text-xs text-gray-400">
                    {mode === 'character' ? 'LoRA + MiniMax' : 'Sora'} · {video.duration_seconds}s · {video.size}
                  </p>
                </div>
              </div>

              {/* Caption editable */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Legenda do post
                  </span>
                  <button
                    onClick={handleCopyCaption}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-600 transition-colors"
                  >
                    {copied ? <CheckCircle size={13} className="text-green-500" /> : <Copy size={13} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  onBlur={handleCaptionBlur}
                  className="flex-1 min-h-[180px] px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none leading-relaxed"
                  placeholder="Legenda gerada aparecerá aqui..."
                />
                {savingCaption && (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Loader size={11} className="animate-spin" /> Salvando...
                  </p>
                )}
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

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-2">
                {published ? (
                  <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-semibold border border-green-200 dark:border-green-800">
                    <CheckCircle size={16} />
                    Publicado no Instagram!
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60"
                  >
                    {publishing ? (
                      <><Loader size={15} className="animate-spin" /> Publicando...</>
                    ) : (
                      <><Share2 size={15} /> Publicar no Instagram</>
                    )}
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download size={15} />
                    Baixar
                  </button>
                  <button
                    onClick={mode === 'character' ? handleGenerateWithCharacter : handleGenerate}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RefreshCw size={15} />
                    Gerar novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateVideoPage;
