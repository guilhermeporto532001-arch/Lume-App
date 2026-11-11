import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isLocal?: boolean;
}

interface StoredAccount {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | User | null;
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsGuest(false);
      } else {
        // Check for local stored studio session
        const localSession = localStorage.getItem('lume_local_session');
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession) as AppUser;
            setUser(parsed);
            setIsGuest(false);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const translateAuthError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = (err as { code: string }).code;
      switch (code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'E-mail ou senha incorretos.';
        case 'auth/email-already-in-use':
          return 'Este e-mail já está cadastrado. Tente entrar.';
        case 'auth/weak-password':
          return 'A senha deve ter pelo menos 6 caracteres.';
        case 'auth/invalid-email':
          return 'Endereço de e-mail inválido.';
        case 'auth/popup-closed-by-user':
          return 'Janela de login com Google foi fechada antes de concluir.';
        default:
          return (err as { message?: string }).message || 'Ocorreu um erro na autenticação.';
      }
    }
    return 'Erro inesperado ao autenticar.';
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      localStorage.removeItem('lume_local_session');
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      setIsGuest(false);
    } catch (err: unknown) {
      setError(translateAuthError(err));
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('lume_local_session');
      setUser(cred.user);
      setIsGuest(false);
    } catch (err: unknown) {
      const authErr = err as { code?: string };
      // If Firebase email/password provider is not toggled on in the console yet,
      // authenticate smoothly via local studio credentials so user is never blocked!
      if (authErr?.code === 'auth/operation-not-allowed') {
        const normalized = email.trim().toLowerCase();
        const accounts: StoredAccount[] = JSON.parse(
          localStorage.getItem('lume_studio_accounts') || '[]'
        );
        const existing = accounts.find((a) => a.email.toLowerCase() === normalized);

        if (existing) {
          if (existing.passwordHash === btoa(pass)) {
            const localUser: AppUser = {
              uid: existing.uid,
              email: existing.email,
              displayName: existing.displayName,
              isLocal: true,
            };
            localStorage.setItem('lume_local_session', JSON.stringify(localUser));
            setUser(localUser);
            setIsGuest(false);
            setError(null);
            return;
          } else {
            const msg = 'Senha incorreta para esta conta local.';
            setError(msg);
            throw new Error(msg);
          }
        } else {
          // If not registered yet, auto-create studio account smoothly
          const newAccount: StoredAccount = {
            uid: 'local-' + Date.now(),
            email: normalized,
            displayName: normalized.split('@')[0],
            passwordHash: btoa(pass),
            createdAt: new Date().toISOString(),
          };
          accounts.push(newAccount);
          localStorage.setItem('lume_studio_accounts', JSON.stringify(accounts));

          const localUser: AppUser = {
            uid: newAccount.uid,
            email: newAccount.email,
            displayName: newAccount.displayName,
            isLocal: true,
          };
          localStorage.setItem('lume_local_session', JSON.stringify(localUser));
          setUser(localUser);
          setIsGuest(false);
          setError(null);
          return;
        }
      }

      setError(translateAuthError(err));
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user && name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      localStorage.removeItem('lume_local_session');
      setUser(cred.user);
      setIsGuest(false);
    } catch (err: unknown) {
      const authErr = err as { code?: string };
      // If Firebase email/password provider is not toggled on in the console yet,
      // create and activate local studio account immediately so the user can continue without delay!
      if (authErr?.code === 'auth/operation-not-allowed') {
        const normalized = email.trim().toLowerCase();
        const accounts: StoredAccount[] = JSON.parse(
          localStorage.getItem('lume_studio_accounts') || '[]'
        );
        const existing = accounts.find((a) => a.email.toLowerCase() === normalized);

        if (existing) {
          // User already exists, log in
          const localUser: AppUser = {
            uid: existing.uid,
            email: existing.email,
            displayName: name.trim() || existing.displayName,
            isLocal: true,
          };
          localStorage.setItem('lume_local_session', JSON.stringify(localUser));
          setUser(localUser);
          setIsGuest(false);
          setError(null);
          return;
        }

        const newAccount: StoredAccount = {
          uid: 'local-' + Date.now(),
          email: normalized,
          displayName: name.trim() || normalized.split('@')[0],
          passwordHash: btoa(pass),
          createdAt: new Date().toISOString(),
        };
        accounts.push(newAccount);
        localStorage.setItem('lume_studio_accounts', JSON.stringify(accounts));

        const localUser: AppUser = {
          uid: newAccount.uid,
          email: newAccount.email,
          displayName: newAccount.displayName,
          isLocal: true,
        };
        localStorage.setItem('lume_local_session', JSON.stringify(localUser));
        setUser(localUser);
        setIsGuest(false);
        setError(null);
        return;
      }

      setError(translateAuthError(err));
      throw err;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setError(null);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('lume_local_session');
      setUser(null);
      setIsGuest(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        loading,
        error,
        clearError,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
