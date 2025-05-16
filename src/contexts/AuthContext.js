'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se há uma sessão salva no localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('oabgo_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (e) {
          localStorage.removeItem('oabgo_user');
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.login(username, password);
      
      if (response.data.require_password_change) {
        // Redirecionar para a página de alteração de senha
        setUser(response.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('oabgo_user', JSON.stringify(response.data));
        }
        router.push('/alterar-senha');
      } else {
        // Login normal
        setUser(response.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('oabgo_user', JSON.stringify(response.data));
        }
        router.push('/');
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao realizar login');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oabgo_user');
    }
    router.push('/login');
  };

  const alterarSenha = async (novaSenha) => {
    if (!user) {
      setError('Usuário não autenticado');
      return { error: 'Usuário não autenticado' };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.alterarSenha(user.id, novaSenha);
      
      // Atualizar o usuário no contexto e localStorage
      const updatedUser = { ...user, ...response.data, require_password_change: false };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('oabgo_user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao alterar senha');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const solicitarRecuperacao = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.solicitarRecuperacao(email);
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao solicitar recuperação');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verificarToken = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.verificarToken(token);
      
      // Armazenar usuário temporariamente para troca de senha
      setUser(response.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('oabgo_user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Token inválido ou expirado');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const cadastrarUsuario = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.cadastrarUsuario(userData);
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao cadastrar usuário');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        error,
        login,
        logout,
        alterarSenha,
        solicitarRecuperacao,
        verificarToken,
        cadastrarUsuario
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Fallback para quando o contexto não está disponível (SSR)
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
      login: () => {},
      logout: () => {},
      alterarSenha: () => {},
      solicitarRecuperacao: () => {},
      verificarToken: () => {},
      cadastrarUsuario: () => {}
    };
  }
  return context;
}; 