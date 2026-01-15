import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from './Logo';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    password: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCepBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (response.data.erro) {
          alert('CEP não encontrado!');
          setFormData(prev => ({ ...prev, street: '', neighborhood: '', city: '', state: '' }));
        } else {
          setFormData(prev => ({
            ...prev,
            street: response.data.logradouro,
            neighborhood: response.data.bairro,
            city: response.data.localidade,
            state: response.data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('Erro ao buscar o CEP.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      alert('Usuário cadastrado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao cadastrar usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-nubank-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Decorativa */}
        <div className="md:w-1/3 bg-nubank-purple p-8 text-white flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <Logo className="w-12 h-12" showText={true} textClassName="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Junte-se a nós</h2>
            <p className="text-white/80">Crie sua conta em minutos e controle sua vida financeira.</p>
          </div>
          <div className="mt-8">
             <p className="text-sm opacity-60">Já tem conta?</p>
             <button 
                onClick={() => navigate('/login')}
                className="mt-2 w-full py-2 px-4 border border-white/30 rounded-full hover:bg-white/10 transition-colors"
             >
               Fazer Login
             </button>
          </div>
        </div>

        {/* Form */}
        <div className="md:w-2/3 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Seus Dados</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Nome Completo</label>
              <input name="name" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="Ex: João Silva" onChange={handleChange} required />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
              <input name="email" type="email" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="seu@email.com" onChange={handleChange} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">CPF</label>
              <input name="cpf" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="000.000.000-00" onChange={handleChange} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Senha</label>
              <input name="password" type="password" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="********" onChange={handleChange} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Telefone</label>
              <input name="phone" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="(00) 00000-0000" onChange={handleChange} required />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Data de Nasc.</label>
              <input name="birthDate" type="date" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" onChange={handleChange} required />
            </div>

            {/* Endereço */}
            <div className="md:col-span-2 mt-4">
              <h4 className="font-bold text-gray-700">Endereço</h4>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">CEP</label>
              <input 
                name="zipCode" 
                className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" 
                onChange={handleChange} 
                onBlur={handleCepBlur}
                value={formData.zipCode}
                required 
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
              <input name="state" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="SP" onChange={handleChange} value={formData.state} required />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Rua</label>
              <input name="street" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" onChange={handleChange} value={formData.street} required />
            </div>

            <div>
               <label className="text-xs font-semibold text-gray-500 uppercase">Número</label>
               <input name="number" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" onChange={handleChange} value={formData.number} required />
            </div>

            <div>
               <label className="text-xs font-semibold text-gray-500 uppercase">Complemento</label>
               <input name="complement" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" placeholder="Apto, Bloco, etc." onChange={handleChange} value={formData.complement} />
            </div>

            <div>
               <label className="text-xs font-semibold text-gray-500 uppercase">Bairro</label>
               <input name="neighborhood" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" onChange={handleChange} value={formData.neighborhood} required />
            </div>

            <div>
               <label className="text-xs font-semibold text-gray-500 uppercase">Cidade</label>
               <input name="city" className="w-full p-2 border-b-2 border-gray-200 focus:border-nubank-purple outline-none transition-colors" onChange={handleChange} value={formData.city} required />
            </div>

            <div className="md:col-span-2 mt-6">
              <button type="submit" className="w-full bg-nubank-purple hover:bg-nubank-dark text-white font-bold py-3 px-4 rounded-full transition-all transform active:scale-95 shadow-lg">
                Finalizar Cadastro
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
