import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { insightsAPI, postImageUrl } from '../api';
import {
  ArrowLeft, RefreshCw, Loader, Heart, MessageCircle, Eye,
  Bookmark, Share2, Play, TrendingUp, Users, BarChart2,
  Zap, Video, Image as ImageIcon, AlertCircle,
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

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
    <div className={`p-2.5 rounded-lg ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

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

const LeaderboardCard = ({ title, icon: Icon, items, valueKey, valueLabel, formatter = fmt }) => {
  if (!items || items.length === 0) return null;
  const max = Math.max(...items.map(i => i.insights[valueKey] || 0));
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <Icon size={16} className="text-purple-500" />
        {title}
      </h3>
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
    </div>
  );
};

const ChannelDashboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => { loadDashboard(); }, [id]);

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

  const hasData = data && (data.top_by_reach.length > 0 || data.top_by_likes.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate(`/channels/${id}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          <ArrowLeft size={20} /><span>Voltar ao canal</span>
        </button>
        <div className="flex items-center gap-3">
          {data?.last_refreshed && (
            <span className="text-xs text-gray-400">
              Atualizado: {new Date(data.last_refreshed).toLocaleString('pt-BR')}
            </span>
          )}
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data?.channel_name}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Alcance total" value={fmt(data?.total_reach)}
          sub={`${data?.published_count || 0} posts publicados`} color="bg-blue-500" />
        <StatCard icon={Eye} label="Impressões" value={fmt(data?.total_impressions)}
          color="bg-violet-500" />
        <StatCard icon={Zap} label="Interações" value={fmt(data?.total_interactions)}
          sub="curtidas + comentários + saves" color="bg-pink-500" />
        <StatCard
          icon={TrendingUp}
          label={data?.avg_engagement_rate != null ? "Taxa de engajamento" : "Interações totais"}
          value={data?.avg_engagement_rate != null ? fmtRate(data.avg_engagement_rate) : fmt(data?.total_interactions)}
          sub={data?.avg_engagement_rate != null ? "média por post" : "curtidas + comentários + saves"}
          color="bg-emerald-500"
        />
      </div>

      {!hasData ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BarChart2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="font-semibold text-gray-600 dark:text-gray-400 mb-2">Nenhuma métrica disponível ainda</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Publique posts no Instagram e clique em "Atualizar métricas" para carregar os dados.
          </p>
          <button onClick={handleRefreshAll} disabled={refreshing}
            className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 inline-flex items-center gap-2">
            <RefreshCw size={14} /><span>Buscar métricas agora</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <LeaderboardCard
            title="Top por Curtidas"
            icon={Heart}
            items={data.top_by_likes}
            valueKey="like_count"
            valueLabel="curtidas"
          />
          <LeaderboardCard
            title="Top por Comentários"
            icon={MessageCircle}
            items={data.top_by_comments}
            valueKey="comments_count"
            valueLabel="comentários"
          />
          <LeaderboardCard
            title="Top por Alcance"
            icon={Users}
            items={data.top_by_reach}
            valueKey="reach"
            valueLabel="pessoas alcançadas"
          />
        </div>
      )}
    </div>
  );
};

export default ChannelDashboardPage;
