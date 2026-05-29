import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';

export default function NoCreditsAlert({ needed = null }) {
  return (
    <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 mb-3 space-y-2">
      <div className="flex items-start gap-2">
        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-200 leading-snug">
          <strong className="text-amber-400">Créditos insuficientes.</strong>{' '}
          {needed != null ? <>Requer ~<strong>{needed.toLocaleString('pt-BR')}</strong> créditos.</> : 'Saldo insuficiente para esta operação.'}
        </p>
      </div>
      <Link
        to="/buy-credits"
        className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors"
      >
        <CreditCard size={12} />
        Comprar Créditos
      </Link>
    </div>
  );
}
