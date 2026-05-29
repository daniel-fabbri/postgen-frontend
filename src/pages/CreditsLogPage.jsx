import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, TrendingUp, Activity, DollarSign, Calendar, Filter } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004/api';

const CreditsLogPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');

  useEffect(() => {
    loadData();
  }, [filterType, selectedChannel]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('postgen_token');
      
      // Load summary
      const summaryResponse = await axios.get(`${API_BASE}/credits/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSummary(summaryResponse.data);
      
      // Load log with filters
      const params = {};
      if (filterType !== 'all') params.resource_type = filterType;
      if (selectedChannel !== 'all') params.channel_id = selectedChannel;
      
      const logResponse = await axios.get(`${API_BASE}/credits/log`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setLog(logResponse.data);
    } catch (error) {
      console.error('Error loading credits data:', error);
      alert('Erro ao carregar dados de créditos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOperationLabel = (type) => {
    const labels = {
      'text_generation': 'Geração de Texto',
      'image_generation': 'Geração de Imagem',
      'video_generation': 'Geração de Vídeo',
      'tts': 'Text-to-Speech'
    };
    return labels[type] || type;
  };

  const getResourceLabel = (type) => {
    const labels = {
      'post': 'Post',
      'video': 'Vídeo',
      'avatar': 'Avatar',
      'image': 'Imagem'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-3xl font-bold mb-6">Consumo de Créditos</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={32} />
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Total de Créditos</h3>
            <p className="text-3xl font-bold">{summary?.total_credits?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity size={32} />
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Operações</h3>
            <p className="text-3xl font-bold">{log?.length || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity size={32} />
              <Filter size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Canais Ativos</h3>
            <p className="text-3xl font-bold">{summary?.by_channel?.length || 0}</p>
          </div>
        </div>

        {/* Charts */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* By Operation Type */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Por Tipo de Operação</h3>
              <div className="space-y-3">
                {summary.by_operation?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{getOperationLabel(item.operation_type)}</span>
                    <span className="font-semibold">{item.credits.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Resource Type */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Por Tipo de Recurso</h3>
              <div className="space-y-3">
                {summary.by_resource?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm">{getResourceLabel(item.resource_type)}</span>
                    <span className="font-semibold">{item.credits.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* By Channel */}
        {summary?.by_channel && summary.by_channel.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl mb-8">
            <h3 className="text-lg font-semibold mb-4">Consumo por Canal</h3>
            <div className="space-y-3">
              {summary.by_channel.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.channel_name}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{item.credits.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold">Filtros</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Recurso</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="all">Todos</option>
              <option value="post">Posts</option>
              <option value="video">Vídeos</option>
              <option value="avatar">Avatares</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Canal</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            >
              <option value="all">Todos os Canais</option>
              {summary?.by_channel?.map((ch) => (
                <option key={ch.channel_id} value={ch.channel_id}>
                  {ch.channel_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Histórico Detalhado</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Canal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Operação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Modelo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Créditos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {log.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.channel_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      {getResourceLabel(item.resource_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getOperationLabel(item.operation_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                    {item.model_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                    {item.total_tokens > 0 ? item.total_tokens.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                    {item.credits_consumed.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {log.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsLogPage;
