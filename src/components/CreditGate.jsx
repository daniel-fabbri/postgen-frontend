import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';

/**
 * Wraps a button/element and shows a rich tooltip when credits are insufficient.
 * Uses a div wrapper to capture hover even when the child is disabled.
 */
export default function CreditGate({ blocked, needed, children, className = '' }) {
  const [visible, setVisible] = useState(false);

  if (!blocked) return <>{children}</>;

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {/* Render child with pointer-events disabled so hover still fires on wrapper */}
      <div className="pointer-events-none opacity-50 select-none">
        {children}
      </div>

      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64">
          <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-xl p-3 border border-gray-700">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-snug">
                <span className="font-semibold text-amber-400">Créditos insuficientes.</span>{' '}
                {needed != null
                  ? <>Esta operação requer <strong>~{needed.toLocaleString('pt-BR')} créditos</strong>.</>
                  : 'Você não tem créditos suficientes para esta operação.'}
              </p>
            </div>
            <Link
              to="/buy-credits"
              className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors pointer-events-auto"
            >
              <CreditCard size={12} />
              Comprar Créditos
            </Link>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
