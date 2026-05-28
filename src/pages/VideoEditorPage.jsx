import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoProjectsAPI } from '../api';
import {
  ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight,
  Loader, Wand2, Download, Play, Video, X,
} from 'lucide-react';

const DURATIONS = [
  { value: 4, label: '4s', desc: 'Rápido' },
  { value: 8, label: '8s', desc: 'Padrão' },
  { value: 12, label: '12s', desc: 'Longo' },
];

const SIZES = [
  { value: '720x1280', label: 'Vertical', desc: '9:16' },
  { value: '1080x1920', label: 'Vertical HD', desc: '9:16' },
  { value: '1080x1080', label: 'Quadrado', desc: '1:1' },
];

const VideoEditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState(null);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(4);
  const [selectedSize, setSelectedSize] = useState('720x1280');
  const [previewClip, setPreviewClip] = useState(null);

  useEffect(() => { loadProject(); }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await videoProjectsAPI.get(projectId);
      setProject(res.data);
      if (res.data.exported_path) setExportedUrl(res.data.exported_path);
    } catch (err) {
      alert('Erro ao carregar projeto: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleMoveClip = async (index, direction) => {
    const clips = [...project.clips];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= clips.length) return;
    [clips[index], clips[newIndex]] = [clips[newIndex], clips[index]];
    try {
      const res = await videoProjectsAPI.updateClips(projectId, clips.map(c => c.id));
      setProject(res.data);
    } catch (err) {
      alert('Erro ao reordenar: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRemoveClip = async (clipId) => {
    if (!confirm('Remover este clipe do projeto?')) return;
    const newIds = project.clips.filter(c => c.id !== clipId).map(c => c.id);
    try {
      const res = await videoProjectsAPI.updateClips(projectId, newIds);
      setProject(res.data);
      if (previewClip?.id === clipId) setPreviewClip(null);
      setExportedUrl(null);
    } catch (err) {
      alert('Erro ao remover clipe: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleGenerateClip = async () => {
    try {
      setGenerating(true);
      const res = await videoProjectsAPI.generateClip(projectId, {
        additional_prompt: additionalPrompt || null,
        seconds: selectedDuration,
        size: selectedSize,
      });
      setProject(res.data);
      setAdditionalPrompt('');
      setExportedUrl(null);
    } catch (err) {
      alert('Erro ao gerar clipe: ' + (err.response?.data?.detail || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await videoProjectsAPI.export(projectId);
      setExportedUrl(res.data.exported_url);
    } catch (err) {
      alert('Erro ao exportar: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExporting(false);
    }
  };

  const totalDuration = project?.clips.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (!project) return <div className="text-center py-12">Projeto não encontrado</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate(`/channels/${project.channel_id}`)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar ao canal</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {project.clips.length} clipe{project.clips.length !== 1 ? 's' : ''} · {totalDuration}s total
          </span>
          <button
            onClick={handleExport}
            disabled={exporting || project.clips.length === 0}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {exporting
              ? <><Loader className="animate-spin" size={14} /><span>Exportando...</span></>
              : <><Download size={14} /><span>Exportar Vídeo</span></>}
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">Editor de Vídeo</h1>

      {/* Exported result */}
      {exportedUrl && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-green-800 dark:text-green-300">Vídeo exportado!</p>
            <a
              href={exportedUrl}
              download="video_final.mp4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Download size={14} /> Baixar
            </a>
          </div>
          <video src={exportedUrl} controls className="w-full max-h-64 rounded-lg" />
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold mb-4">Timeline</h2>
        {project.clips.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Video size={48} className="mx-auto mb-3 opacity-50" />
            <p>Nenhum clipe ainda. Gere o primeiro abaixo.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {project.clips.map((clip, index) => (
              <div
                key={clip.id}
                className="flex-none w-44 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div
                  className="relative bg-gradient-to-br from-violet-900 to-purple-900 cursor-pointer"
                  style={{ aspectRatio: '9/16' }}
                  onClick={() => setPreviewClip(previewClip?.id === clip.id ? null : clip)}
                >
                  <video
                    src={clip.video_path}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play size={18} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                    <span className="text-white text-xs bg-black/50 rounded px-1.5 py-0.5 font-medium">
                      #{index + 1}
                    </span>
                    <span className="text-white text-xs bg-black/50 rounded px-1.5 py-0.5">
                      {clip.duration_seconds}s
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2" title={clip.caption || clip.prompt}>
                    {clip.caption || clip.prompt || '—'}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveClip(index, -1)}
                      disabled={index === 0}
                      title="Mover para esquerda"
                      className="p-1 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveClip(index, 1)}
                      disabled={index === project.clips.length - 1}
                      title="Mover para direita"
                      className="p-1 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleRemoveClip(clip.id)}
                      title="Remover clipe"
                      className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview panel */}
      {previewClip && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Preview — Clipe #{project.clips.findIndex(c => c.id === previewClip.id) + 1}</h2>
            <button onClick={() => setPreviewClip(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex gap-6 items-start flex-wrap">
            <video src={previewClip.video_path} controls autoPlay className="max-h-80 rounded-lg" />
            <div className="flex-1 min-w-48">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Legenda</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {previewClip.caption || previewClip.prompt || '—'}
              </p>
              <p className="text-xs text-gray-400 mt-4">{previewClip.duration_seconds}s · {previewClip.size}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate new clip */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus size={20} className="text-purple-600" />
          Adicionar Clipe
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Prompt adicional <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              rows="3"
              disabled={generating}
              placeholder="Descreva o que deve aparecer neste clipe... (o prompt do canal é aplicado automaticamente)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-50"
            />
          </div>
          <div className="flex gap-8 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-2">Duração</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setSelectedDuration(d.value)}
                    disabled={generating}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedDuration === d.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                    } disabled:opacity-50`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato</label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSize(s.value)}
                    disabled={generating}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      selectedSize === s.value
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-400'
                    } disabled:opacity-50`}
                  >
                    {s.label}
                    <span className="ml-1 text-xs opacity-60">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerateClip}
            disabled={generating}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating
              ? <><Loader className="animate-spin" size={18} /><span>Gerando com Sora... (alguns minutos)</span></>
              : <><Wand2 size={18} /><span>Gerar Clipe com Sora</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoEditorPage;
