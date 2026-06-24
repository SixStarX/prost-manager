import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token);
      navigate('/');
    } catch {
      setError('Email ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-base overflow-hidden">

      {/* ── Left panel — form ── */}
      <div className="w-[440px] min-w-[440px] bg-surface border-r border-white/[.05] flex flex-col
                      justify-center px-[52px] py-14 relative z-10">
        {/* red top line */}
        <div className="absolute top-0 left-0 right-0 h-[3px]"
             style={{ background: 'linear-gradient(90deg,#e63946,transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-9">
          <div className="w-[42px] h-[42px] bg-brand rounded-sm flex items-center justify-center text-xl
                          shadow-[0_0_24px_rgba(230,57,70,.25)] shrink-0">
            🔧
          </div>
          <div>
            <div className="text-lg font-black text-t1 tracking-tight uppercase">Prost Manager</div>
            <div className="text-[10px] font-medium text-t3 tracking-[.1em] uppercase mt-px">Sistema de Gestão</div>
          </div>
        </div>

        <h2 className="text-[22px] font-extrabold text-t1 tracking-tight">Bem-vindo de volta</h2>
        <p className="text-[13px] text-t3 mt-1 mb-7">Insira suas credenciais para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" type="email" placeholder="seu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-[12.5px] text-[#f87171] bg-brand/[.15]
                            border border-brand/25 rounded-sm px-[14px] py-2.5">
              ⚠ {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? <><Loader2 className="animate-spin" />Entrando...</> : 'Entrar'}
          </Button>
        </form>
      </div>

      {/* ── Right panel — atmospheric ── */}
      <div className="login-panel flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-10 py-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface border border-white/[.08] rounded-xl flex items-center
                          justify-center text-[36px] shadow-[0_0_24px_rgba(230,57,70,.25),0_0_60px_rgba(230,57,70,.08)]">
            🔧
          </div>
          <div className="text-[32px] font-black text-t1 tracking-[-1px] mb-2">
            <span className="text-brand" style={{ textShadow: '0 0 20px rgba(230,57,70,.4)' }}>Prost</span> Manager
          </div>
          <p className="text-sm text-t3 max-w-[300px] mx-auto mb-10 leading-7">
            Plataforma de gestão automotiva para oficinas de alta performance.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-[280px] mx-auto">
            {[
              'Gestão completa de clientes e veículos',
              'Diagnósticos e histórico de serviços',
              'Ordens de serviço em tempo real',
              'Dashboard com visão geral do negócio',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[13px] text-t2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0"
                      style={{ boxShadow: '0 0 6px rgba(230,57,70,.5)' }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
