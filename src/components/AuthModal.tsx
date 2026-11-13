import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Check, ExternalLink, ShieldCheck, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    error,
    errorCode,
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
  const [showFirebaseInfo, setShowFirebaseInfo] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain =
    errorCode === 'auth/unauthorized-domain' ||
    (error?.includes('auth/unauthorized-domain') ?? false);

  const handleCopyDomain = async () => {
    if (!currentHostname) return;
    try {
      await navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

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
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-snug">{error}</span>
              </div>

              {isUnauthorizedDomain && currentHostname && (
                <div className="pl-6 space-y-2 text-[11px] text-rose-800/90">
                  <p className="leading-relaxed">
                    Para liberar o Login com Google neste endereço, adicione o domínio abaixo no Console do Firebase:
                  </p>

                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-rose-200">
                    <code className="font-mono text-[11px] font-semibold text-[#423533] truncate">
                      {currentHostname}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[10px] shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedDomain ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                    <li>Abra as configurações de Autenticação do Firebase.</li>
                    <li>Vá na aba <strong>Domínios autorizados</strong> e clique em <strong>Adicionar domínio</strong>.</li>
                    <li>Cole <strong>{currentHostname}</strong> e salve.</li>
                  </ol>

                  <a
                    href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#9E4B52] hover:underline pt-0.5"
                  >
                    <span>Abrir Domínios Autorizados no Firebase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Google Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-[#FAF6F4] text-[#423533] text-sm font-semibold rounded-xl border border-[#E4D7D2] transition-colors shadow-2xs disabled:opacity-60 relative group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              <span className="hidden sm:inline-block ml-1 px-2 py-0.5 text-[10px] font-medium bg-[#F5D8DB] text-[#9E4B52] rounded-full">
                1 clique
              </span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#EFE5E0]" />
            <span className="absolute px-3 bg-white text-[11px] font-medium text-[#A3928B] uppercase">
              ou com e-mail e senha
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

          {/* Cloud Sync info helper */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => setShowFirebaseInfo(!showFirebaseInfo)}
              className="text-[11px] text-[#9B8983] hover:text-[#9E4B52] transition-colors inline-flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deseja sincronizar na nuvem do Firebase?</span>
            </button>

            {showFirebaseInfo && (
              <div className="mt-2.5 p-3 text-left bg-[#FAF4F2] border border-[#EFE5E0] rounded-xl text-xs text-[#544643] space-y-1.5 animate-in fade-in">
                <p className="font-semibold text-[#9E4B52]">
                  Como ativar E-mail/Senha na Nuvem (10 segundos):
                </p>
                <p className="text-[11px] text-[#7E6963]">
                  1. Acesse os Provedores no Console do Firebase.
                </p>
                <p className="text-[11px] text-[#7E6963]">
                  2. Ative a chave <b>E-mail/senha</b> e clique em <b>Salvar</b>.
                </p>
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0225730544/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#9E4B52] hover:underline mt-1 text-[11px]"
                >
                  <span>Abrir Provedores no Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Guest / Explore Mode */}
          <div className="pt-1 text-center">
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
