import { useState, useEffect } from 'react';
import api from '../services/api';
import { RefreshCw, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface ExchangeProps {
  onSuccess: () => void;
  balanceBrl: number;
  balanceUsd: number;
  balanceEur: number;
  accountData?: any; // Temporary debug
}

export default function Exchange({ onSuccess, balanceBrl, balanceUsd, balanceEur, accountData }: ExchangeProps) {
  const [rates, setRates] = useState<{ USD: number; EUR: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [buying, setBuying] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/exchange/rates');
      setRates(response.data);
    } catch (error) {
      console.error('Erro ao buscar cotações', error);
      setError('Não foi possível carregar as cotações no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setBuying(true);
    try {
      await api.post('/exchange/buy', {
        amountBrl: Number(amount),
        targetCurrency: currency
      });
      
      alert('Compra realizada com sucesso!');
      setAmount('');
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao realizar compra');
    } finally {
      setBuying(false);
    }
  };

  // DEBUG LOG
  console.log('Exchange Props:', { balanceBrl, balanceUsd, balanceEur, accountData });

  // Fallback check
  const realBalanceUsd = balanceUsd || Number(accountData?.balanceUsd) || Number(accountData?.balance_usd) || 0;
  const realBalanceEur = balanceEur || Number(accountData?.balanceEur) || Number(accountData?.balance_eur) || 0;

  const safeBalanceBrl = isNaN(Number(balanceBrl)) ? 0 : Number(balanceBrl);
  const safeBalanceUsd = isNaN(Number(realBalanceUsd)) ? 0 : Number(realBalanceUsd);
  const safeBalanceEur = isNaN(Number(realBalanceEur)) ? 0 : Number(realBalanceEur);

  const calculatedValue = rates && amount && !isNaN(Number(amount)) && rates[currency] ? (Number(amount) / rates[currency]).toFixed(2) : '0.00';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna Principal: Formulário de Compra */}
        <div className="lg:col-span-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Realizar Aporte</h2>
              <p className="text-lg text-gray-500">Escolha a moeda e o valor para investir no seu futuro.</p>
            </div>
            <div className="text-right">
              <span className="text-lg text-gray-500 block mb-1">Saldo disponível em conta</span>
              <span className="text-3xl font-bold text-gray-800">R$ {safeBalanceBrl.toFixed(2)}</span>
            </div>
          </div>
          
          <form onSubmit={handleBuy} className="space-y-10">
            {/* Seletor de Moeda */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-4">Quero comprar</label>
              <div className="grid grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`relative p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${
                    currency === 'USD' 
                      ? 'border-nubank-purple bg-purple-50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${
                    currency === 'USD' ? 'bg-nubank-purple text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <DollarSign size={28} />
                  </div>
                  <div className="text-left">
                    <span className={`block text-xl font-bold ${currency === 'USD' ? 'text-nubank-purple' : 'text-gray-700'}`}>Dólar</span>
                    <span className="text-sm text-gray-500 font-medium">USD</span>
                  </div>
                  {currency === 'USD' && (
                    <div className="absolute top-4 right-4 w-4 h-4 bg-nubank-purple rounded-full ring-4 ring-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`relative p-6 rounded-2xl border-2 transition-all flex items-center gap-5 ${
                    currency === 'EUR' 
                      ? 'border-nubank-purple bg-purple-50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm ${
                    currency === 'EUR' ? 'bg-nubank-purple text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    <span className="font-serif font-bold text-2xl">€</span>
                  </div>
                  <div className="text-left">
                    <span className={`block text-xl font-bold ${currency === 'EUR' ? 'text-nubank-purple' : 'text-gray-700'}`}>Euro</span>
                    <span className="text-sm text-gray-500 font-medium">EUR</span>
                  </div>
                  {currency === 'EUR' && (
                    <div className="absolute top-4 right-4 w-4 h-4 bg-nubank-purple rounded-full ring-4 ring-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Input de Valor */}
            <div>
              <div className="flex justify-between mb-4">
                <label className="block text-lg font-medium text-gray-700">Valor a investir</label>
              </div>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-2xl transition-colors group-focus-within:text-nubank-purple">R$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-20 pr-6 py-6 text-3xl font-bold rounded-2xl border-2 border-gray-200 focus:border-nubank-purple focus:ring-4 focus:ring-nubank-purple/10 outline-none transition-all placeholder-gray-300"
                  placeholder="0,00"
                  min="1"
                  step="0.01"
                />
              </div>
            </div>

            {/* Resumo da Conversão */}
            <div className="bg-gray-50 p-8 rounded-3xl space-y-4 border border-gray-100">
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Cotação Comercial</span>
                <span className="font-medium text-gray-700 text-lg">1 {currency} = R$ {rates?.[currency].toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-gray-500">IOF (1.1%)</span>
                <span className="font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">Grátis (Promoção)</span>
              </div>
              <div className="h-px bg-gray-200 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold text-lg">Você recebe</span>
                <span className="text-4xl font-bold text-nubank-purple">
                  {currency === 'USD' ? '$' : '€'} {calculatedValue}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={buying || !amount || Number(amount) <= 0 || !rates}
              className="w-full bg-nubank-purple text-white py-5 rounded-2xl font-bold text-xl hover:bg-nubank-purple-dark transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-nubank-purple/20 flex items-center justify-center gap-3"
            >
              {buying ? (
                <>
                  <RefreshCw className="animate-spin" size={24} />
                  Processando...
                </>
              ) : (
                <>
                  Confirmar Investimento
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coluna Lateral: Carteira e Cotações */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Minha Carteira */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-3 text-xl">
              <div className="p-2 bg-purple-100 rounded-lg text-nubank-purple">
                <DollarSign size={24} />
              </div>
              Minha Carteira
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-green-600 font-bold text-xl border border-gray-100">$</div>
                  <span className="text-gray-600 font-bold text-lg">Dólar</span>
                </div>
                <span className="font-bold text-gray-800 text-xl">$ {safeBalanceUsd.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 font-bold text-xl serif border border-gray-100">€</div>
                  <span className="text-gray-600 font-bold text-lg">Euro</span>
                </div>
                <span className="font-bold text-gray-800 text-xl">€ {safeBalanceEur.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cotações */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-800 flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-100 rounded-lg text-nubank-purple">
                  <TrendingUp size={24} />
                </div>
                Mercado
              </h3>
              <button 
                onClick={fetchRates} 
                disabled={loading}
                className={`p-3 rounded-full hover:bg-gray-100 transition-colors ${loading ? 'animate-spin' : ''}`}
                title="Atualizar cotações"
              >
                <RefreshCw size={20} className="text-gray-500" />
              </button>
            </div>
            
            {error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-medium text-gray-600">Dólar Comercial</span>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded w-fit">USD</span>
                  </div>
                  <span className="font-bold text-gray-800 text-xl">R$ {rates?.USD.toFixed(4) || '...'}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-medium text-gray-600">Euro Comercial</span>
                    <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded w-fit">EUR</span>
                  </div>
                  <span className="font-bold text-gray-800 text-xl">R$ {rates?.EUR.toFixed(4) || '...'}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
            <h4 className="text-base font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span> Dica de Investimento
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed opacity-90">
              Diversificar sua carteira com moedas fortes é uma ótima estratégia para proteger seu patrimônio contra a inflação e instabilidades do mercado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
