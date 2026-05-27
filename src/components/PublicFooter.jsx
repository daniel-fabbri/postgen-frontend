import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicFooter() {
  return (
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
  );
}
