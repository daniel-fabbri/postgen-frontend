import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  ArrowLeft, Shield, Users, Mail, Calendar, Loader, AlertCircle,
  Percent, Save, CheckCircle,
} from 'lucide-react';
import { usersAPI, adminAPI } from '../api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004/api';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  if (user?.email !== 'daniel.fabbri@avanade.com') {
    navigate('/channels');
    return null;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/channels')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Painel de Administração</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gerenciamento de usuários e sistema</p>
          </div>
        </div>

        <div className="flex min-h-[500px]">
          {/* Sidebar */}
          <nav className="w-48 border-r border-gray-200 dark:border-gray-700 p-4 space-y-1 flex-shrink-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <Users size={18} />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'rates'
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              <Percent size={18} />
              Taxas
            </button>
          </nav>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'rates' && <RatesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    usersAPI.getAll()
      .then(r => setUsers(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => d
    ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

  if (loading) {
    return <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-purple-600" size={36} /></div>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total de Usuários</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Usuários Ativos</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Novos (30 dias)</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
            {users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 86400000)).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                {['ID', 'Nome', 'Email', 'Data de Cadastro'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail size={14} />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !error && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RatesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creditsPerReal, setCreditsPerReal] = useState('1');
  const [initialCredits, setInitialCredits] = useState('0');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getRates()
      .then(r => {
        setCreditsPerReal(String(r.data.credits_per_real));
        setInitialCredits(String(r.data.initial_credits));
      })
      .catch(() => setError('Erro ao carregar taxas'))
      .finally(() => setLoading(false));
  }, []);

  const cpr = parseFloat(creditsPerReal) || 0;
  const realPerCredit = cpr > 0 ? 1 / cpr : 0;

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await adminAPI.updateRates(cpr, parseFloat(initialCredits) || 0);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.response?.data?.detail || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-48"><Loader className="animate-spin text-purple-600" size={36} /></div>;
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Configuração de Taxas</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Controla a conversão de R$ em créditos e os créditos dados a novos usuários.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Créditos por R$ 1,00
          </label>
          <input
            type="number"
            value={creditsPerReal}
            onChange={e => setCreditsPerReal(e.target.value)}
            min="0.0001"
            step="1"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold transition-colors"
            placeholder="500"
          />
          <p className="text-xs text-gray-400 mt-1">Ex: 500 → R$ 1,00 dá 500 créditos</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Créditos iniciais (novos usuários)
          </label>
          <input
            type="number"
            value={initialCredits}
            onChange={e => setInitialCredits(e.target.value)}
            min="0"
            step="1"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold transition-colors"
            placeholder="100"
          />
          <p className="text-xs text-gray-400 mt-1">Créditos de boas-vindas no cadastro</p>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-5 mb-6">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Preview da conversão</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 dark:text-gray-400 text-sm">R$ 1,00 rende</span>
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {cpr.toLocaleString('pt-BR')} créditos
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600 dark:text-gray-400 text-sm">1 crédito custa</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            R$ {realPerCredit.toFixed(6)}
          </span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-1">
          {[10, 50, 100, 200].map(v => (
            <div key={v} className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">R$ {v},00</span>
              <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
                → {(v * cpr).toLocaleString('pt-BR')} créditos
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50"
      >
        {saving ? <Loader size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Taxas'}
      </button>
    </div>
  );
}
