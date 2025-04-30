import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um token salvo no localStorage
    const token = localStorage.getItem('authToken');
    
    if (token) {
      verificarToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verificarToken = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth-api/verificar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser({
          ...data.data.perfil,
          token,
        });
      } else {
        // Token inválido, remover do localStorage
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth-api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao fazer login');
      }
      
      const data = await response.json();
      const token = data.data.session.access_token;
      
      // Salvar token no localStorage
      localStorage.setItem('authToken', token);
      
      // Obter dados do perfil
      await verificarToken(token);
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const { nome, email, senha, numero_oab, cargo, area_atuacao } = formData;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth-api/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          numero_oab,
          cargo,
          area_atuacao
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao registrar');
      }
      
      const data = await response.json();
      const token = data.data.session?.access_token;
      
      if (token) {
        // Salvar token no localStorage
        localStorage.setItem('authToken', token);
        
        // Obter dados do perfil
        await verificarToken(token);
        
        return true;
      } else {
        throw new Error('Registro confirmado! Por favor, verifique seu email para confirmar a conta.');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth-api/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Remover token do localStorage
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}