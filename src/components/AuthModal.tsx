import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    error,
    clearError,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    continueAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch {
      // Error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch {
      // Handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#EFE5E0] overflow-hidden">
        {/* Header with soft pastel gradient */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-b from-[#FDF4F2] to-white border-b border-[#F4EBE6]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F5D8DB] text-[#9E4B52]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#9E4B52] tracking-wider uppercase">
              Acesso ao Sistema
            </span>
          </div>

          <h3 className="text-xl font-bold text-[#423533]">
            {mode === 'login' ? 'Bem-vinda de volta' : 'Criar conta no Lume'}
          </h3>
          <p className="text-xs text-[#8C7B76] mt-1">
            {mode === 'login'
              ? 'Acesse os dados e agendamentos do seu estúdio facial.'
              : 'Cadastre sua clínica para gerenciar clientes e procedimentos.'}
          </p>

          {/* Tab Selector */}
          <div className="flex p-1 mt-4 rounded-xl bg-[#F6EDE9] border border-[#EFE5E0]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#423533] shadow-xs'
                  : 'text-[#8C7B76] hover:text-[#423533]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearError();
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#423533] shadow-xs'
                  : 'text-[#8C7B76] hover:text-[#423533]'
              }`}
            >
              Criar Conta
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-[#FAF6F4] text-[#423533] text-sm font-semibold rounded-xl border border-[#E4D7D2] transition-colors shadow-2xs disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#EFE5E0]" />
            <span className="absolute px-3 bg-white text-[11px] font-medium text-[#A3928B] uppercase">
              ou com e-mail
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#544643] mb-1">
                  Seu Nome ou Nome do Estúdio
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Dra. Juliana Santos"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] placeholder:text-stone-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#544643] mb-1">
                E-mail Profissional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="estudio@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] placeholder:text-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#544643] mb-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E4D7D2] focus:border-[#9E4B52] focus:ring-1 focus:ring-[#9E4B52] outline-hidden text-[#423533] placeholder:text-stone-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#9E4B52] hover:bg-[#883B41] text-white text-sm font-semibold rounded-xl transition-all shadow-xs disabled:opacity-60 mt-2"
            >
              <span>{mode === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Guest / Explore Mode */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleGuest}
              className="text-xs text-[#9B8983] hover:text-[#423533] underline transition-colors"
            >
              Continuar explorando no modo demonstração
            </button>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 bg-[#FAF5F2] border-t border-[#F4EBE6] text-center">
          <p className="text-[11px] text-[#8C7B76]">
            Seus dados e agendamentos protegidos com criptografia e backup seguro.
          </p>
        </div>
      </div>
    </div>
  );
};
