import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Zap, Image, Share2, Layers, Shield,
  ArrowRight, CheckCircle, Instagram, Bot, Wand2, Eye
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    color: 'from-purple-500 to-indigo-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    title: 'Geração com IA',
    desc: 'Textos criativos e imagens deslumbrantes criados em segundos pela Azure OpenAI, com o tom de voz do seu canal.',
  },
  {
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    title: 'Imagens únicas',
    desc: 'Visuais gerados especificamente para cada post, alinhados à identidade visual do seu canal.',
  },
  {
    icon: Instagram,
    color: 'from-orange-500 to-pink-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    title: 'Publicação direta',
    desc: 'Conecte seu Instagram e publique com um clique — sem sair da plataforma, sem copiar e colar.',
  },
  {
    icon: Layers,
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Múltiplos canais',
    desc: 'Gerencie diferentes marcas, personas e produtos em um único lugar, cada um com sua identidade.',
  },
  {
    icon: Wand2,
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    title: 'Prompts customizados',
    desc: 'Configure como a IA deve se comportar para cada canal: tom, estilo, objetivos e restrições.',
  },
  {
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Dados seguros',
    desc: 'Seus dados ficam na sua infraestrutura. Sem compartilhamento com terceiros além das APIs que você escolhe.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Crie um canal',
    desc: 'Configure o nome, objetivo e os prompts que definem a voz e o estilo visual da sua marca.',
    color: 'from-purple-600 to-blue-600',
  },
  {
    n: '02',
    title: 'Gere com um clique',
    desc: 'A IA cria texto e imagem juntos, contextualizados para o post — sem copiar, sem editar no Canva.',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    n: '03',
    title: 'Revise e publique',
    desc: 'Edite o que quiser, troque a imagem se precisar, e publique direto no Instagram.',
    color: 'from-pink-600 to-rose-500',
  },
];

const benefits = [
  'Sem mensalidade por post gerado',
  'Sem limite de canais',
  'Controle total sobre o conteúdo',
  'Integração direta com Instagram',
  'Imagens e textos no mesmo fluxo',
  'Configuração única, uso contínuo',
];

function MockPost() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-20 scale-105" />

      {/* Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Image area */}
        <div className="relative h-56 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-end p-4">
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Gerado por IA
          </div>
          {/* Mock food image using abstract shapes */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-6 left-8 w-24 h-24 rounded-full bg-white/40" />
            <div className="absolute top-10 right-12 w-16 h-16 rounded-full bg-yellow-300/60" />
            <div className="absolute bottom-8 left-1/2 w-20 h-20 rounded-full bg-pink-200/50" />
          </div>
          {/* Channel avatar */}
          <div className="relative flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white shadow flex items-center justify-center">
              <span className="text-white text-xs font-bold">DM</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Dona Maria Doces</p>
              <p className="text-white/70 text-xs mt-0.5">@donamaria.doces</p>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
            🍮 Pudim de leite condensado feito com amor e a receita da vovó! Cremoso por dentro, dourado por fora.
            Encomende pelo link na bio. 🤍 <span className="text-blue-500">#pudim #docescaseiros #donamaria</span>
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" /> Pronto
              </span>
            </div>
            <button className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              <Share2 className="w-3 h-3" />
              Publicar
            </button>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2">
        <Zap className="w-4 h-4 text-yellow-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Gerado em 8s</span>
      </div>
      <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 flex items-center gap-2">
        <Instagram className="w-4 h-4 text-pink-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Publicado ✓</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PostGen
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 dark:bg-purple-600 rounded-full blur-3xl opacity-10 -translate-y-1/2" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-400 dark:bg-blue-600 rounded-full blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full blur-3xl opacity-10" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-sm font-medium px-4 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by Azure OpenAI
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Crie posts para o{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                  Instagram
                </span>{' '}
                com IA em segundos
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                PostGen gera texto e imagem juntos, no estilo da sua marca, e publica direto no Instagram —
                tudo com um único clique.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-7 py-4 rounded-xl text-base shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5"
                >
                  Começar agora — é grátis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-7 py-4 rounded-xl text-base transition-all hover:-translate-y-0.5"
                >
                  Já tenho conta
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Sem cartão de crédito', 'Configuração em minutos', 'Cancele quando quiser'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right – mock post */}
            <div className="flex justify-center lg:justify-end py-8">
              <MockPost />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Funcionalidades</p>
            <h2 className="text-4xl font-bold">Tudo que você precisa para criar conteúdo de forma inteligente</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Do prompt à publicação, sem abrir outras ferramentas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl ${bg} mb-4`}>
                  <div className={`bg-gradient-to-br ${color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Como funciona</p>
            <h2 className="text-4xl font-bold">Três passos. Um post perfeito.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 to-pink-200 dark:from-purple-800 dark:via-blue-800 dark:to-pink-800" />

            {steps.map(({ n, title, desc, color }) => (
              <div key={n} className="relative text-center space-y-4">
                <div className="flex justify-center">
                  <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <span className="text-4xl font-black text-white/30 absolute">{n}</span>
                    <span className="text-2xl font-black text-white relative z-10">{n.replace('0', '')}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Por que PostGen</p>
              <h2 className="text-4xl font-bold leading-tight">
                Feito para quem produz conteúdo, não para quem programa
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Você configura uma vez, e a partir daí o PostGen trabalha por você —
                mantendo o estilo, o tom e a qualidade que você definiu.
              </p>
              <ul className="space-y-3">
                {benefits.map(b => (
                  <li key={b} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats / visual */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '< 10s', label: 'para gerar um post completo', color: 'from-purple-600 to-blue-600' },
                { value: '1 clique', label: 'para publicar no Instagram', color: 'from-pink-600 to-rose-500' },
                { value: '∞', label: 'posts e canais sem limite', color: 'from-blue-600 to-cyan-500' },
                { value: '100%', label: 'do conteúdo revisado por você', color: 'from-emerald-500 to-teal-500' },
              ].map(({ value, label, color }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-2">
                  <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                    {value}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl shadow-purple-500/25 mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Pronto para transformar sua presença no Instagram?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Crie sua conta agora e gere seu primeiro post em menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-0.5"
            >
              Criar minha conta grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">PostGen</span>
            <span>· © {new Date().getFullYear()} Todos os direitos reservados.</span>
          </div>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Termos de Uso</Link>
            <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacidade</Link>
            <Link to="/login" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
