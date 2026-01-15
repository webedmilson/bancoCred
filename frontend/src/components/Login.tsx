import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Logo from './Logo';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('access_token', response.data.access_token);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nubank-purple flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo className="w-16 h-16" showText={true} textClassName="text-3xl text-nubank-text" />
          <h2 className="text-2xl font-bold text-nubank-text mt-4">Olá, bem-vindo de volta!</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              name="password"
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-nubank-purple focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nubank-purple hover:bg-nubank-dark text-white font-bold py-3 px-4 rounded-full transition-colors duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Não tem conta?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-nubank-purple font-bold hover:underline focus:outline-none"
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-white/60 text-sm">
        © 2026 BancoCred. Todos os direitos reservados.
      </p>
    </div>
  );
}
