import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, TrendingUp, Activity, DollarSign, Calendar, Filter, ShoppingCart, Wallet, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { paymentsAPI } from '../api';
import { useAuth } from '../AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004/api';

const CreditsLogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allChannels, setAllChannels] = useState([]);
  const [allLog, setAllLog] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('postgen_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, logRes, paymentsRes] = await Promise.all([
        axios.get(`${API_BASE}/credits/summary`, { headers }),
        axios.get(`${API_BASE}/credits/log`, { headers }),
        paymentsAPI.listMy(),
      ]);

      setAllChannels(summaryRes.data.by_channel || []);
      setTotalConsumed(summaryRes.data.total_credits || 0);
      setAllLog(logRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error loading credits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLog = () => {
    let filtered = [...allLog];
    if (filterType !== 'all') filtered = filtered.filter(i => i.resource_type === filterType);
    if (selectedChannel !== 'all') filtered = filtered.filter(i => i.channel_id === selectedChannel);
    return filtered;
  };

  const totalPurchased = payments
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + p.credits_amount, 0);

  const balance = user?.credits_balance || 0;

  const formatDate = (d) => d
    ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  const statusBadge = (status) => {
    const map = {
      approved:   { label: 'Aprovado',   icon: CheckCircle, cls: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
      pending:    { label: 'Pendente',   icon: Clock,        cls: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
      cancelled:  { label: 'Cancelado',  icon: XCircle,     cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
      refunded:   { label: 'Estornado',  icon: XCircle,     cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
      rejected:   { label: 'Recusado',   icon: XCircle,     cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
    };
    const cfg = map[status] || { label: status, icon: Clock, cls: 'bg-gray-100 text-gray-600' };
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
        <Icon size={11} /> {cfg.label}
      </span>
    );
  };

  const getOperationLabel = (t) => ({ text_generation: 'Geração de Texto', image_generation: 'Geração de Imagem', video_generation: 'Geração de Vídeo', tts: 'Text-to-Speech' }[t] || t);
  const getResourceLabel  = (t) => ({ post: 'Post', video: 'Vídeo', avatar: 'Avatar', image: 'Imagem' }[t] || t);

  const getUsageDisplay = (item) => {
    if (item.operation_type === 'text_generation' && item.total_tokens > 0) return item.total_tokens.toLocaleString() + ' tokens';
    if (item.operation_type === 'image_generation') return '1 imagem';
    if (item.operation_type === 'video_generation') return `${Math.round(item.credits_consumed / 50)}s vídeo`;
    if (item.operation_type === 'tts') return `${Math.round((item.credits_consumed / 15) * 1000)} chars`;
    return '-';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-purple-600" size={48} /></div>;
  }

  const filteredLog = getFilteredLog();
  const filteredConsumed = filteredLog.reduce((s, i) => s + i.credits_consumed, 0);

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
        <ArrowLeft size={20} /><span>Voltar</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h1 className="text-3xl font-bold mb-6">Créditos</h1>

        {/* Balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow">
            <div className="flex items-center justify-between mb-2">
              <Wallet size={28} />
              <span className="text-purple-200 text-sm">Saldo atual</span>
            </div>
            <p className="text-3xl font-bold">{balance.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
            <p className="text-purple-200 text-xs mt-1">créditos disponíveis</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl shadow">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart size={28} />
              <span className="text-green-200 text-sm">Total comprado</span>
            </div>
            <p className="text-3xl font-bold">{totalPurchased.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
            <p className="text-green-200 text-xs mt-1">créditos adquiridos</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown size={28} />
              <span className="text-blue-200 text-sm">Total gasto</span>
            </div>
            <p className="text-3xl font-bold">{totalConsumed.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
            <p className="text-blue-200 text-xs mt-1">créditos consumidos</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
          {[
            { id: 'overview', label: 'Consumo' },
            { id: 'purchases', label: 'Compras' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONSUMO tab */}
        {activeTab === 'overview' && (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Recurso</label>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                  <option value="all">Todos</option>
                  <option value="post">Posts</option>
                  <option value="video">Vídeos</option>
                  <option value="avatar">Avatares</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Canal</label>
                <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm">
                  <option value="all">Todos os Canais</option>
                  {allChannels.map(ch => <option key={ch.channel_id} value={ch.channel_id}>{ch.channel_name}</option>)}
                </select>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {filteredLog.length} operações — <strong>{filteredConsumed.toFixed(2)} créditos</strong> gastos
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Data', 'Canal', 'Recurso', 'Operação', 'Uso', 'Créditos'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLog.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{item.channel_name || '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {getResourceLabel(item.resource_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{getOperationLabel(item.operation_type)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">{getUsageDisplay(item)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-blue-600 dark:text-blue-400">
                        {item.credits_consumed.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLog.length === 0 && <p className="text-center py-10 text-gray-500">Nenhum registro encontrado</p>}
            </div>
          </>
        )}

        {/* COMPRAS tab */}
        {activeTab === 'purchases' && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Data', 'Valor (R$)', 'Créditos', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">R$ {p.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-purple-600 dark:text-purple-400">
                      {p.credits_amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{statusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && <p className="text-center py-10 text-gray-500">Nenhuma compra encontrada</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsLogPage;
