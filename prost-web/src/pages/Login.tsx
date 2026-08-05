import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo, { ProstMark } from '@/components/brand/Logo';

const FEATURES = [
  'Gestão completa de clientes e veículos',
  'Diagnósticos e histórico de serviços',
  'Ordens de serviço em tempo real',
  'Dashboard com visão geral do negócio',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
      navigate('/');
    } catch {
      setError('Email ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Já autenticado? Vai direto para o app.
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex bg-base overflow-hidden">
      {/* ── Painel esquerdo — formulário ── */}
      <div className="w-full lg:w-[440px] lg:min-w-[440px] bg-surface lg:border-r border-white/[.05] flex flex-col justify-center px-6 sm:px-[52px] py-14 relative z-10">
        {/* linha de acento no topo */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg,#7c6cff,transparent)' }}
        />

        <div className="mb-9">
          <Logo tagline="Manager" markSize={42} wordmarkClassName="text-[19px]" />
        </div>

        <h2 className="text-[22px] font-extrabold text-t1 tracking-tight">Bem-vindo de volta</h2>
        <p className="text-[13px] text-t3 mt-1 mb-7">Insira suas credenciais para continuar</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 text-[12.5px] text-[#f87171] bg-destructive/[.12] border border-destructive/30 rounded-sm px-[14px] py-2.5 animate-rise"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>

      {/* ── Painel direito — atmosférico (oculto no mobile) ── */}
      <div className="login-panel flex-1 relative hidden lg:flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center px-10 py-10 animate-rise">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <ProstMark size={80} className="drop-shadow-[0_0_28px_rgba(124,108,255,.4)]" />
          </div>
          <div className="text-[32px] font-black text-t1 tracking-[-1px] mb-2">
            <span className="text-brand" style={{ textShadow: '0 0 20px rgba(124,108,255,.45)' }}>
              PROST
            </span>{' '}
            Manager
          </div>
          <p className="text-sm text-t3 max-w-[300px] mx-auto mb-10 leading-7">
            Plataforma de gestão automotiva para oficinas de alta performance.
          </p>
          <div className="flex flex-col gap-3 text-left max-w-[280px] mx-auto">
            {FEATURES.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[13px] text-t2">
                <span className="w-4 h-4 rounded-full bg-brand/15 border border-brand/40 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-brand" strokeWidth={3} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
