import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insightsAPI, postImageUrl } from '../api';
import {
  ArrowLeft, RefreshCw, Loader, Heart, MessageCircle, Eye,
  Play, Image as ImageIcon, AlertCircle, Info, Users, TrendingUp,
  Bookmark, Share2, Zap,
} from 'lucide-react';

const fmt = (n) => {
  if (n == null) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const fmtRate = (r) => (r == null ? '—' : `${r.toFixed(2)}%`);

const Bar = ({ value, max }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const Tooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        tabIndex={0}
      >
        <Info size={10} className="text-gray-500 dark:text-gray-300" />
      </button>
      {show && (
        <div className="absolute left-5 top-0 z-50 w-56 p-2.5 bg-gray-900 text-gray-100 text-xs rounded-lg shadow-xl leading-relaxed pointer-events-none">
          {text}
        </div>
      )}
    </div>
  );
};

const TOOLTIPS = {
  likes: 'Número de curtidas que o post recebeu no Instagram.',
  comments: 'Número de comentários deixados no post.',
  reach: 'Contas únicas que viram o post pelo menos uma vez. Requer reconexão do Instagram com a permissão instagram_business_manage_insights.',
  impressions: 'Total de visualizações, incluindo múltiplas do mesmo usuário. Requer a mesma reconexão do Instagram.',
  saved: 'Número de vezes que usuários salvaram este post.',
  shares: 'Número de vezes que o post foi compartilhado (enviado via DM ou story).',
  interactions: 'Soma de curtidas + comentários + salvamentos.',
};

const MediaThumb = ({ item }) => {
  if (item.media_type === 'video') {
    return (
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-900 to-purple-900 flex items-center justify-center shrink-0 overflow-hidden relative">
        <video src={item.preview_url} muted playsInline preload="none"
          className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <Play size={14} className="text-white relative z-10" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
      {item.preview_url ? (
        <img src={postImageUrl(item.preview_url)} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={20} className="text-gray-400" />
        </div>
      )}
    </div>
  );
};

const LeaderboardCard = ({ title, icon: Icon, items, valueKey, valueLabel, total, tooltipKey, formatter = fmt, emptyNote }) => {
  if (!items || items.length === 0) return null;
  const max = Math.max(...items.map(i => i.insights[valueKey] || 0));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-1.5 text-gray-800 dark:text-gray-100">
          <Icon size={16} className="text-purple-500 shrink-0" />
          {title}
          {tooltipKey && <Tooltip text={TOOLTIPS[tooltipKey]} />}
        </h3>
        {total != null && (
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {formatter(total)}
            <span className="text-xs font-normal text-gray-400 ml-1">total</span>
          </span>
        )}
      </div>

      {emptyNote && max === 0 ? (
        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>{emptyNote}</span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.media_id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-4 shrink-0">#{idx + 1}</span>
              <MediaThumb item={item} />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.text_preview || '—'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{formatter(item.insights[valueKey])}</span>
                  <span className="text-xs text-gray-400">{valueLabel}</span>
                  <Bar value={item.insights[valueKey] || 0} max={max} />
                </div>
              </div>
              <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                item.media_type === 'video'
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
              }`}>
                {item.media_type === 'video' ? 'Vídeo' : 'Post'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4`}>
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ChannelDashboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshing, setAutoRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await insightsAPI.getChannelDashboard(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      setRefreshing(true);
      await insightsAPI.refreshChannel(id);
      await loadDashboard();
    } catch (err) {
      alert('Erro ao atualizar métricas: ' + (err.response?.data?.detail || err.message));
    } finally {
      setRefreshing(false);
    }
  };

  // Load cached data immediately, then auto-refresh in background
  useEffect(() => {
    const init = async () => {
      await loadDashboard();
      // Auto-refresh silently after showing cached data
      try {
        setAutoRefreshing(true);
        await insightsAPI.refreshChannel(id);
        const res = await insightsAPI.getChannelDashboard(id);
        setData(res.data);
      } catch {
        // silent — cached data stays visible
      } finally {
        setAutoRefreshing(false);
      }
    };
    init();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(`/channels/${id}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors">
          <ArrowLeft size={20} /><span>Voltar ao canal</span>
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const hasData = data && (data.top_by_likes.length > 0 || data.top_by_comments.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate(`/channels/${id}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          <ArrowLeft size={20} /><span>Voltar ao canal</span>
        </button>
        <div className="flex items-center gap-3">
          {autoRefreshing && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader className="animate-spin" size={12} />
              Atualizando dados...
            </span>
          )}
          {data?.last_refreshed && !autoRefreshing && (
            <span className="text-xs text-gray-400">
              Atualizado: {new Date(data.last_refreshed).toLocaleString('pt-BR')}
            </span>
          )}
          <button
            onClick={handleRefreshAll}
            disabled={refreshing || autoRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {refreshing
              ? <><Loader className="animate-spin" size={14} /><span>Atualizando...</span></>
              : <><RefreshCw size={14} /><span>Atualizar métricas</span></>}
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Dashboard de Engajamento</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {data?.channel_name} · {data?.published_count || 0} post{data?.published_count !== 1 ? 's' : ''} publicado{data?.published_count !== 1 ? 's' : ''}
        </p>
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Nenhuma métrica disponível ainda</p>
          <p className="text-sm text-gray-500 mb-4">Publique posts no Instagram e clique em "Atualizar métricas".</p>
          <button onClick={handleRefreshAll} disabled={refreshing || autoRefreshing}
            className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2">
            <RefreshCw size={14} /><span>Buscar métricas agora</span>
          </button>
        </div>
      ) : (
        <>
          {/* Stats summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatBadge icon={Heart}        label="Curtidas"        value={fmt(data.total_likes)}        color="bg-pink-500" />
            <StatBadge icon={MessageCircle} label="Comentários"     value={fmt(data.total_comments)}     color="bg-blue-500" />
            <StatBadge icon={Bookmark}     label="Salvamentos"     value={fmt(data.total_saved)}        color="bg-emerald-500" />
            <StatBadge icon={Share2}       label="Compartilhamentos" value={fmt(data.total_shares)}     color="bg-orange-500" />
            <StatBadge icon={Users}        label="Alcance"         value={fmt(data.total_reach || null)}  color="bg-purple-500" />
            <StatBadge icon={Eye}          label="Impressões"      value={fmt(data.total_impressions || null)} color="bg-indigo-500" />
          </div>

          {data.avg_engagement_rate != null && (
            <div className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 dark:from-violet-900/30 dark:to-purple-900/30 border border-violet-200 dark:border-violet-800 rounded-xl p-4 flex items-center gap-3">
              <TrendingUp size={20} className="text-violet-600 dark:text-violet-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">
                  Taxa de engajamento média: <strong>{fmtRate(data.avg_engagement_rate)}</strong>
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400">(curtidas + comentários + salvamentos) / alcance × 100</p>
              </div>
            </div>
          )}

          {/* Leaderboards */}
          <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6">
            <LeaderboardCard
              title="Top por Curtidas"
              icon={Heart}
              items={data.top_by_likes}
              valueKey="like_count"
              valueLabel="curtidas"
              total={data.total_likes}
              tooltipKey="likes"
            />
            <LeaderboardCard
              title="Top por Comentários"
              icon={MessageCircle}
              items={data.top_by_comments}
              valueKey="comments_count"
              valueLabel="comentários"
              total={data.total_comments}
              tooltipKey="comments"
            />
            <LeaderboardCard
              title="Top por Salvamentos"
              icon={Bookmark}
              items={data.top_by_saved}
              valueKey="saved"
              valueLabel="salvamentos"
              total={data.total_saved || null}
              tooltipKey="saved"
              emptyNote="Dados de salvamentos não disponíveis. Reconecte seu Instagram em Editar Canal para ativar."
            />
            <LeaderboardCard
              title="Top por Compartilhamentos"
              icon={Share2}
              items={data.top_by_shares}
              valueKey="shares"
              valueLabel="compartilhamentos"
              total={data.total_shares || null}
              tooltipKey="shares"
              emptyNote="Dados de compartilhamentos não disponíveis. Reconecte seu Instagram em Editar Canal para ativar."
            />
            <LeaderboardCard
              title="Top por Alcance"
              icon={Users}
              items={data.top_by_reach}
              valueKey="reach"
              valueLabel="contas únicas"
              total={data.total_reach || null}
              tooltipKey="reach"
              emptyNote="Alcance requer reconexão do Instagram em Editar Canal (permissão instagram_business_manage_insights)."
            />
            <LeaderboardCard
              title="Top por Impressões"
              icon={Eye}
              items={data.top_by_reach}
              valueKey="impressions"
              valueLabel="visualizações"
              total={data.total_impressions || null}
              tooltipKey="impressions"
              emptyNote="Impressões requerem a mesma reconexão do Instagram."
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChannelDashboardPage;
