import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { paymentsAPI } from '../api';
import { CreditCard, ArrowLeft, CheckCircle, XCircle, Loader, Copy, QrCode } from 'lucide-react';
import CostGuide from '../components/CostGuide';

export default function BuyCreditsPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState('50.00');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [copied, setCopied] = useState(false);
  const [creditsPerReal, setCreditsPerReal] = useState(1);

  useEffect(() => {
    paymentsAPI.getRates().then(r => setCreditsPerReal(r.data.credits_per_real)).catch(() => {});
  }, []);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!paymentData || paymentStatus !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const response = await paymentsAPI.getStatus(paymentData.payment_id);
        const status = response.data.status;
        
        if (status !== 'pending') {
          setPaymentStatus(status);
          clearInterval(interval);
          
          // Se aprovado, atualizar saldo do usuário
          if (status === 'approved') {
            const newBalance = (user.credits_balance || 0) + paymentData.credits_amount;
            updateUser({ ...user, credits_balance: newBalance });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    }, 3000); // Verifica a cada 3 segundos

    return () => clearInterval(interval);
  }, [paymentData, paymentStatus, user, updateUser]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      alert('O valor mínimo é R$ 10,00');
      return;
    }
    if (numAmount > 1000) {
      alert('O valor máximo é R$ 1.000,00');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsAPI.create(numAmount);
      setPaymentData(response.data);
      setShowPayment(true);
      setPaymentStatus('pending');
    } catch (error) {
      alert('Erro ao criar pagamento. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = () => {
    if (paymentData?.qr_code_data) {
      navigator.clipboard.writeText(paymentData.qr_code_data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShowPayment(false);
    setPaymentData(null);
    setPaymentStatus('pending');
    setAmount('50.00');
  };

  if (showPayment && paymentData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          {/* Status Header */}
          <div className="text-center mb-6">
            {paymentStatus === 'pending' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Aguardando Pagamento
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Escaneie o QR Code ou copie o código PIX
                </p>
              </>
            )}
            {paymentStatus === 'approved' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Pagamento Confirmado! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Seus créditos já estão disponíveis
                </p>
              </>
            )}
            {(paymentStatus === 'rejected' || paymentStatus === 'cancelled') && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  Pagamento {paymentStatus === 'rejected' ? 'Recusado' : 'Cancelado'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Tente novamente com outro método
                </p>
              </>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Valor</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {paymentData.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Créditos</span>
              <span className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                {Number(paymentData.credits_amount).toLocaleString('pt-BR')} créditos
              </span>
            </div>
          </div>

          {paymentStatus === 'pending' && (
            <>
              {/* QR Code */}
              {paymentData.qr_code && (
                <div className="bg-white p-4 rounded-xl mb-4 flex justify-center">
                  <img
                    src={`data:image/png;base64,${paymentData.qr_code}`}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                </div>
              )}

              {/* Código PIX Copia e Cola */}
              {paymentData.qr_code_data && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código PIX (Copia e Cola)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentData.qr_code_data}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyPixCode}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Status Checking */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <Loader className="w-4 h-4 animate-spin" />
                <span>Verificando pagamento automaticamente...</span>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {paymentStatus === 'approved' && (
              <button
                onClick={() => navigate('/channels')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
              >
                Ir para Canais
              </button>
            )}
            {paymentStatus !== 'pending' && (
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Nova Compra
              </button>
            )}
            {paymentStatus === 'pending' && (
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Comprar Créditos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Adicione créditos à sua conta para continuar gerando conteúdo incrível
        </p>
      </div>

      {/* Current Balance */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm mb-1">Saldo Atual</p>
            <p className="text-4xl font-bold">{(user.credits_balance || 0).toFixed(2)}</p>
            <p className="text-purple-100 text-sm mt-1">créditos disponíveis</p>
          </div>
          <CreditCard className="w-16 h-16 text-purple-200" />
        </div>
      </div>

      {/* Payment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quanto você quer comprar?
        </h2>

        <form onSubmit={handleCreatePayment}>
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor em R$ (mínimo R$ 10,00)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xl font-semibold">
                R$
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="10"
                max="1000"
                step="0.01"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl font-bold transition-colors"
                placeholder="50.00"
              />
            </div>
          </div>

          {/* Conversion Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Você receberá:
              </span>
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {(parseFloat(amount || 0) * creditsPerReal).toLocaleString('pt-BR')} créditos
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 R$ 1,00 = {creditsPerReal.toLocaleString('pt-BR')} créditos
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[20, 50, 100, 200].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value.toFixed(2))}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-semibold"
              >
                R$ {value}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Gerando Pagamento...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Gerar PIX
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-blue-900 dark:text-blue-300 mb-3">
            <strong>Como funciona:</strong> Após gerar o PIX, você poderá pagar escaneando o QR Code ou copiando o código. O pagamento é confirmado automaticamente em poucos segundos!
          </p>
          <CostGuide />
        </div>
      </div>
    </div>
  );
}
