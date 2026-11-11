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

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
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
        case 'auth/operation-not-allowed':
          return 'O login por e-mail/senha ainda não foi ativado no console do Firebase. Você pode entrar pelo Google ou usar o modo demonstração!';
        default:
          return (err as { message?: string }).message || 'Ocorreu um erro na autenticação.';
      }
    }
    return 'Erro inesperado ao autenticar.';
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      setError(translateAuthError(err));
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
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
    } catch (err: unknown) {
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
      setIsGuest(false);
    } catch (err: unknown) {
      console.error('Logout error:', err);
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
