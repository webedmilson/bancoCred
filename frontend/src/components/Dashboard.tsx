import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Exchange from './Exchange';

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  birthDate?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

interface Account {
  id: number;
  balance: string | number;
  balanceUsd?: string | number;
  balanceEur?: string | number;
  number: string; // Changed from accountNumber to match entity
}

interface Transaction {
  id: number;
  amount: string;
  type: string;
  createdAt: string;
  sourceAccount?: { id: number; user: { name: string } };
  targetAccount?: { id: number; user: { name: string } };
  description?: string;
}

type Tab = 'home' | 'transfer' | 'statement' | 'profile' | 'exchange';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showBalance, setShowBalance] = useState(false);

  // Transfer Form State
  const [transferAmount, setTransferAmount] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        zipCode: user.zipCode || '',
        street: user.street || '',
        number: user.number || '',
        complement: user.complement || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        state: user.state || ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      if (!user) return;
      
      const { email, cpf, ...updateData } = profileForm; 
      
      await api.patch(`/users/${user.id}`, updateData);

      alert('Perfil atualizado com sucesso!!');
      
      // Refresh user data
      const userRes = await api.get('/users/profile');
      setUser(userRes.data);

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('As senhas novas não coincidem!');
      return;
    }

    setPasswordLoading(true);
    
    try {
      if (!user) return;
      
      await api.patch(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      alert('Senha alterada com sucesso!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.createdAt);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    if (filterType !== 'ALL' && t.type !== filterType) return false;

    return true;
  });

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const sortedFilteredTransactions = [...filteredTransactions].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const fetchTransactions = async () => {
    const transRes = await api.get('/transactions');
    setTransactions(transRes.data);
  };

  const fetchAccount = async () => {
    const accountRes = await api.get('/accounts');
    if (accountRes.data.length > 0) {
      console.log('Account Data (Dashboard):', accountRes.data[0]);
      setAccount(accountRes.data[0]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await api.get('/users/profile');
        setUser(userRes.data);

        await fetchAccount();
        await fetchTransactions();

      } catch (error) {
        console.error('Error fetching data:', error);
        localStorage.removeItem('access_token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferLoading(true);
    const token = localStorage.getItem('access_token');
    
    try {
      await api.post('/transactions', {
        amount: parseFloat(transferAmount),
        type: 'TRANSFER',
        sourceAccountId: account?.id,
        targetAccountId: parseInt(targetAccountId),
        description: 'Transferência via App'
      });

      alert('Transferência realizada com sucesso!');
      setTransferAmount('');
      setTargetAccountId('');
      setActiveTab('home');
      // Refresh data
      if (token) {
        await fetchAccount();
        await fetchTransactions();
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Erro ao realizar transferência');
    } finally {
      setTransferLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-nubank-purple">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nubank-purple"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-nubank-purple text-white flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <Logo className="w-8 h-8 text-white" showText={true} textClassName="text-xl text-white" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'home' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Início
          </button>
          <button 
            onClick={() => setActiveTab('transfer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'transfer' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Transferir
          </button>
          <button 
            onClick={() => setActiveTab('exchange')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'exchange' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            Investimentos
          </button>
          <button 
            onClick={() => setActiveTab('statement')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'statement' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            Extrato
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'profile' ? 'bg-white/20 font-semibold shadow-inner' : 'hover:bg-white/10 opacity-80 hover:opacity-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Meu Perfil
          </button>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm z-20 md:hidden flex items-center justify-between p-4">
            <div className="flex items-center gap-2 text-nubank-purple">
                <Logo className="w-6 h-6" showText={false} />
                <span className="font-bold">BancoCred</span>
            </div>
            <button onClick={() => setActiveTab(activeTab === 'home' ? 'transfer' : 'home')} className="text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
        </header>

        {/* Top Bar */}
        <div className="bg-white shadow-sm py-4 px-8 flex justify-between items-center hidden md:flex">
            <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'home' && 'Visão Geral'}
                {activeTab === 'exchange' && 'Investimentos'}
                {activeTab === 'transfer' && 'Área Pix e Transferências'}
                {activeTab === 'statement' && 'Extrato Completo'}
                {activeTab === 'profile' && 'Meus Dados'}
            </h2>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">Conta: <span className="font-mono text-nubank-purple">{account?.id.toString().padStart(5, '0')}</span></p>
                </div>
                <div className="w-10 h-10 bg-nubank-purple/10 rounded-full flex items-center justify-center text-nubank-purple font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                </div>
            </div>
        </div>

        <div className="hidden md:flex items-center justify-between bg-white px-8 py-5 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold tracking-wide text-nubank-purple uppercase">Desenvolvido por</p>
            <p className="text-2xl font-bold text-nubank-purple">Edmilson Rodrigues</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-semibold tracking-wide text-nubank-purple uppercase">Stack principal</span>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Frontend com React">
                <img
                  src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg"
                  alt="React"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">React</span>
              </div>
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Linguagem TypeScript">
                <img
                  src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg"
                  alt="TypeScript"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">TypeScript</span>
              </div>
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Styling com Tailwind CSS">
                <img
                  src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg"
                  alt="Tailwind"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">Tailwind</span>
              </div>
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Build Tool Vite">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/f/f1/Vitejs-logo.svg"
                  alt="Vite"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">Vite</span>
              </div>
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Backend NestJS">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a8/NestJS.svg"
                  alt="NestJS"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">NestJS</span>
              </div>
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Banco de Dados PostgreSQL">
                <img
                  src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg"
                  alt="PostgreSQL"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">PostgreSQL</span>
              </div>
              <div className="flex items-center gap-2.5 hover:scale-110 transition-transform duration-300 cursor-pointer" title="Container Docker">
                <img
                  src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg"
                  alt="Docker"
                  className="w-9 h-9"
                />
                <span className="text-base font-semibold text-gray-800">Docker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          


          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Balance Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-gray-500 font-medium">Saldo disponível</h3>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-nubank-purple hover:bg-nubank-purple/10 p-1 rounded-full transition-colors" title={showBalance ? "Ocultar saldo" : "Mostrar saldo"}>
                        {showBalance ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        )}
                    </button>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                    {showBalance ? (
                        `R$ ${Number(account?.balance ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    ) : (
                        <span className="tracking-widest bg-gray-100 text-gray-400 rounded px-2 select-none">••••••</span>
                    )}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <button onClick={() => setActiveTab('transfer')} className="flex-1 bg-nubank-purple text-white py-3 px-4 rounded-xl font-semibold hover:bg-nubank-purple-dark hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        Transferir
                    </button>
                    <button onClick={() => setActiveTab('exchange')} className="flex-1 bg-nubank-purple/10 text-nubank-purple py-3 px-4 rounded-xl font-semibold hover:bg-nubank-purple/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        Investir
                    </button>
                    <button onClick={() => setActiveTab('statement')} className="flex-1 bg-nubank-purple/10 text-nubank-purple py-3 px-4 rounded-xl font-semibold hover:bg-nubank-purple/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        Ver Extrato
                    </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Últimas movimentações</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Nenhuma movimentação recente.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {sortedTransactions.slice(0, 5).map((t, index) => (
                                <div key={t.id} className={`p-4 flex justify-between items-center hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-purple-50/40' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            t.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 
                                            t.type.includes('EXCHANGE') ? 'bg-blue-100 text-blue-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {t.type === 'DEPOSIT' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                            ) : t.type.includes('EXCHANGE') ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900">
                                                    {t.type === 'DEPOSIT' ? 'Depósito Recebido' : 
                                                     t.type === 'WITHDRAW' ? 'Saque Realizado' : 
                                                     t.type === 'EXCHANGE_BUY' ? 'Compra de Moeda' :
                                                     t.type === 'EXCHANGE_SELL' ? 'Venda de Moeda' :
                                                     t.targetAccount?.id === account?.id ? 'Transferência Recebida' : 'Transferência Enviada'}
                                                </p>
                                                {index === 0 && (
                                                    <span className="bg-nubank-purple text-white text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm animate-pulse">Novo</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString('pt-BR')} • {new Date(t.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === 'DEPOSIT' || t.targetAccount?.id === account?.id ? 'text-green-600' : 'text-gray-900'}`}>
                                        {t.type === 'DEPOSIT' || t.targetAccount?.id === account?.id ? '+ ' : '- '}
                                        R$ {parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* EXCHANGE TAB */}
          {activeTab === 'exchange' && account && (
            <div className="animate-fade-in">
              <Exchange 
                onSuccess={async () => {
                  await fetchAccount();
                  await fetchTransactions();
                }}
                balanceBrl={Number(account.balance ?? 0)}
                balanceUsd={Number(account.balanceUsd ?? 0)}
                balanceEur={Number(account.balanceEur ?? 0)}
                accountData={account}
              />
            </div>
          )}

          {/* TRANSFER TAB */}
          {activeTab === 'transfer' && (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Nova Transferência</h3>
                    <form onSubmit={handleTransfer} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Qual o valor da transferência?</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">R$</span>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    required
                                    className="w-full pl-12 pr-4 py-3 text-2xl font-bold text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none transition-all placeholder-gray-300"
                                    placeholder="0,00"
                                    value={transferAmount}
                                    onChange={e => setTransferAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Para qual conta?</label>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm text-blue-800 font-medium">
                                        Dica para testes:
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Transfira para a conta <span className="font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">00001</span> para simular uma operação.
                                    </p>
                                </div>
                            </div>

                            <input 
                                type="number" 
                                required
                                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none transition-all"
                                placeholder="ID da conta de destino"
                                value={targetAccountId}
                                onChange={e => setTargetAccountId(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">Digite o número da conta de destino (ID).</p>
                        </div>

                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={transferLoading}
                                className="w-full bg-nubank-purple text-white py-4 rounded-full font-bold text-lg hover:bg-nubank-purple-dark transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {transferLoading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        Confirmar Transferência
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>


            </div>
          )}

          {/* STATEMENT TAB */}
          {activeTab === 'statement' && (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Histórico de Transações</h3>
                        <button 
                          onClick={() => setShowFilters(!showFilters)}
                          className="text-nubank-purple text-sm font-semibold hover:underline flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                          {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
                        </button>
                    </div>

                    {/* Filters Section */}
                    {showFilters && (
                      <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Data Inicial</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-nubank-purple focus:border-nubank-purple text-sm"
                            value={filterStartDate}
                            onChange={e => setFilterStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Data Final</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-nubank-purple focus:border-nubank-purple text-sm"
                            value={filterEndDate}
                            onChange={e => setFilterEndDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de Transação</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-nubank-purple focus:border-nubank-purple text-sm"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                          >
                            <option value="ALL">Todas</option>
                            <option value="DEPOSIT">Depósitos</option>
                            <option value="WITHDRAW">Saques</option>
                            <option value="TRANSFER">Transferências</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {filteredTransactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            <p>Nenhuma transação encontrada.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <th className="px-6 py-4 font-semibold">Data</th>
                                    <th className="px-6 py-4 font-semibold">Tipo</th>
                                    <th className="px-6 py-4 font-semibold">Descrição</th>
                                    <th className="px-6 py-4 font-semibold text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sortedFilteredTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                t.type === 'DEPOSIT' ? 'bg-green-100 text-green-800' :
                                                t.type === 'WITHDRAW' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {t.type === 'DEPOSIT' ? 'Depósito' : 
                                                 t.type === 'WITHDRAW' ? 'Saque' : 'Transferência'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {t.description || (
                                                t.type === 'DEPOSIT' ? 'Depósito em conta' : 
                                                t.type === 'WITHDRAW' ? 'Saque em caixa eletrônico' : 
                                                t.targetAccount?.id === account?.id ? `Recebido de ${t.sourceAccount?.user.name}` : `Enviado para ${t.targetAccount?.user.name}`
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right ${
                                            t.type === 'DEPOSIT' || t.targetAccount?.id === account?.id ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                            {t.type === 'DEPOSIT' || t.targetAccount?.id === account?.id ? '+ ' : '- '}
                                            R$ {parseFloat(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Seus Dados Cadastrais</h3>
                        <button 
                            type="submit" 
                            form="profile-form"
                            disabled={profileLoading}
                            className="bg-nubank-purple text-white py-2 px-6 rounded-lg font-semibold hover:bg-nubank-purple-dark transition-colors disabled:opacity-50"
                        >
                            {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                    
                    <form id="profile-form" onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Informações Pessoais</h4>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                            <input 
                                type="text" 
                                value={profileForm.name}
                                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                            <input 
                                type="email" 
                                value={profileForm.email}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                            <input 
                                type="text" 
                                value={profileForm.cpf}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                            <input 
                                type="text" 
                                value={profileForm.phone}
                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                            <input 
                                type="date" 
                                value={profileForm.birthDate}
                                onChange={e => setProfileForm({...profileForm, birthDate: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Address */}
                        <div className="col-span-1 md:col-span-2 mt-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Endereço</h4>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                            <input 
                                type="text" 
                                value={profileForm.zipCode}
                                onChange={e => setProfileForm({...profileForm, zipCode: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                            <input 
                                type="text" 
                                value={profileForm.street}
                                onChange={e => setProfileForm({...profileForm, street: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                            <input 
                                type="text" 
                                value={profileForm.number}
                                onChange={e => setProfileForm({...profileForm, number: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                            <input 
                                type="text" 
                                value={profileForm.complement}
                                onChange={e => setProfileForm({...profileForm, complement: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                            <input 
                                type="text" 
                                value={profileForm.neighborhood}
                                onChange={e => setProfileForm({...profileForm, neighborhood: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                            <input 
                                type="text" 
                                value={profileForm.city}
                                onChange={e => setProfileForm({...profileForm, city: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <input 
                                type="text" 
                                value={profileForm.state}
                                onChange={e => setProfileForm({...profileForm, state: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Segurança</h3>
                        <button 
                            type="submit" 
                            form="password-form"
                            disabled={passwordLoading}
                            className="bg-nubank-purple text-white py-2 px-6 rounded-lg font-semibold hover:bg-nubank-purple-dark transition-colors disabled:opacity-50"
                        >
                            {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </div>
                    
                    <form id="password-form" onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Alterar Senha de Acesso</h4>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                            <input 
                                type="password" 
                                required
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none"
                            />
                        </div>
                    </form>
                </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
