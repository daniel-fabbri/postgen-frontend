import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';

export default function NoCreditsAlert({ needed = null }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 mb-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Créditos insuficientes.</strong>{' '}
          {needed != null
            ? `Esta operação requer ~${needed.toLocaleString('pt-BR')} créditos.`
            : 'Você precisa de créditos para usar a IA.'}
        </p>
      </div>
      <Link
        to="/buy-credits"
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
      >
        <CreditCard size={14} />
        Comprar
      </Link>
    </div>
  );
}
