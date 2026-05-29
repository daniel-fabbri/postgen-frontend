import React, { useState } from 'react';
import { Info, X, Video, Image, FileText, User, Mic } from 'lucide-react';

const COSTS = [
  {
    category: 'Post',
    icon: FileText,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    items: [
      { label: 'Geração de texto', cost: '~1–3', unit: 'créditos' },
      { label: 'Geração de imagem (MAI)', cost: '~30', unit: 'créditos' },
      { label: 'Post completo (texto + imagem)', cost: '~32–35', unit: 'créditos' },
    ],
  },
  {
    category: 'Vídeo (Sora)',
    icon: Video,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    items: [
      { label: 'Vídeo 4 segundos', cost: '~200', unit: 'créditos' },
      { label: 'Vídeo 8 segundos', cost: '~400', unit: 'créditos' },
      { label: 'Vídeo 12 segundos', cost: '~600', unit: 'créditos' },
    ],
  },
  {
    category: 'Avatar',
    icon: User,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    items: [
      { label: 'Geração de avatar com IA', cost: '~30', unit: 'créditos' },
    ],
  },
  {
    category: 'Áudio (TTS)',
    icon: Mic,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    items: [
      { label: 'Por 1.000 caracteres', cost: '~15', unit: 'créditos' },
    ],
  },
];

export default function CostGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        <Info size={15} />
        Ver custos estimados por operação
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Custos por Operação</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Valores aproximados em créditos</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {COSTS.map(section => {
                const Icon = section.icon;
                return (
                  <div key={section.category} className={`rounded-xl p-4 ${section.bg}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={18} className={section.color} />
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{section.category}</h3>
                    </div>
                    <div className="space-y-2">
                      {section.items.map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums">
                            {item.cost} <span className="font-normal text-gray-500 text-xs">{item.unit}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <p className="text-xs text-gray-400 text-center pt-2">
                * Custos de texto variam conforme tamanho do prompt e resposta.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
