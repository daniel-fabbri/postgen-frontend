import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            PostGen
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2 hidden sm:block"
          >
            Preços
          </Link>
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
  );
}
