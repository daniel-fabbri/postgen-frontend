import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle, Video, FileText, User, Zap, Gift } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';
import { paymentsAPI } from '../api';

const OPS = [
  {
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Post (texto + imagem)',
    credits: 32,
    note: '~1–3 texto + ~30 imagem',
  },
  {
    icon: Video,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    label: 'Vídeo 4 segundos',
    credits: 200,
    note: 'Sora AI · 50 cr/s',
  },
  {
    icon: Video,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    label: 'Vídeo 8 segundos',
    credits: 400,
    note: 'Sora AI · 50 cr/s',
  },
  {
    icon: Video,
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    label: 'Vídeo 12 segundos',
    credits: 600,
    note: 'Sora AI · 50 cr/s',
  },
  {
    icon: User,
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    label: 'Avatar com IA',
    credits: 30,
    note: 'MAI Image 2e',
  },
];

export default function PricingPage() {
  const [creditsPerReal, setCreditsPerReal] = useState(null);
  const [amount, setAmount] = useState(50);

  useEffect(() => {
    paymentsAPI.getRates()
      .then(r => setCreditsPerReal(r.data.credits_per_real))
      .catch(() => setCreditsPerReal(1));
  }, []);

  const fmtCredits = (n) => n.toLocaleString('pt-BR');
  const fmtBRL = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const creditsForAmount = creditsPerReal != null ? Math.round(amount * creditsPerReal) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
      <PublicHeader />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-10 -translate-y-1/2" />
        <div className="absolute top-20 right-1/3 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-10" />
        <div className="relative max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-sm font-medium px-4 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            Simples e transparente
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Pague só pelo que{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">usar</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            Sem mensalidade. Você compra créditos e usa conforme precisar.
            Cada operação consome uma quantidade fixa de créditos.
          </p>
          <div className="inline-flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-5 py-3 rounded-xl">
            <Gift className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">Novo por aqui? Você começa com créditos grátis — sem cartão.</span>
          </div>
        </div>
      </section>

      {/* Rate + calculator */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Cotação atual</p>
            <h2 className="text-3xl font-bold">Quanto custa 1 real?</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            {/* Rate banner */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
              {creditsPerReal != null ? (
                <>
                  <p className="text-purple-200 text-sm mb-2">Taxa atual</p>
                  <p className="text-6xl font-black">{fmtCredits(creditsPerReal)}</p>
                  <p className="text-purple-200 text-lg mt-1">créditos por R$ 1,00</p>
                </>
              ) : (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Calculator */}
            <div className="p-8">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Simulador de compra</p>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Valor em R$</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">R$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(Math.max(10, Number(e.target.value)))}
                      min="10"
                      step="10"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 text-center sm:text-left pb-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">você recebe</p>
                  <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                    {creditsForAmount != null ? fmtCredits(creditsForAmount) : '—'}
                  </p>
                  <p className="text-sm text-gray-500">créditos</p>
                </div>
              </div>

              {/* Quick values */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[10, 20, 50, 100].map(v => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${amount === v ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operation costs */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Tabela de custos</p>
            <h2 className="text-3xl font-bold">Quanto cada operação consome?</h2>
            <p className="text-gray-600 dark:text-gray-400">Valores em créditos. Quanto mais créditos por real, mais barato fica cada operação.</p>
          </div>

          <div className="space-y-3">
            {OPS.map(op => {
              const Icon = op.icon;
              const realCost = creditsPerReal != null && creditsPerReal > 0
                ? op.credits / creditsPerReal
                : null;
              return (
                <div key={op.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${op.bg} flex-shrink-0`}>
                    <div className={`bg-gradient-to-br ${op.color} p-1.5 rounded-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">{op.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{op.note}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">~{fmtCredits(op.credits)} cr</p>
                    {realCost != null && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">≈ {fmtBRL(realCost)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            * Custos de texto (geração de legenda) variam conforme tamanho do prompt e resposta da IA.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Gift, title: 'Trial grátis', desc: 'Créditos de boas-vindas ao criar sua conta. Sem cartão de crédito.', color: 'from-emerald-500 to-teal-500' },
              { icon: Zap, title: 'Sem vencimento', desc: 'Créditos não expiram. Use no seu ritmo, sem pressa.', color: 'from-purple-500 to-blue-500' },
              { icon: CheckCircle, title: 'Sem fidelidade', desc: 'Sem mensalidade, sem contrato. Compre quando precisar.', color: 'from-pink-500 to-rose-500' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-3">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-extrabold">Comece com créditos grátis</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Crie sua conta e experimente o PostGen sem gastar nada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-0.5"
            >
              Criar conta grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/buy-credits"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:-translate-y-0.5"
            >
              Ver planos de compra
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
