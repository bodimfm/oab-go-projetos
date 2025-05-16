import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import Head from 'next/head';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('solicitar'); // 'solicitar' ou 'verificar'
  const { solicitarRecuperacao, verificarToken, loading } = useAuth();
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSolicitarRecuperacao = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    if (!email) {
      setFormError('Digite seu e-mail.');
      return;
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Formato de e-mail inválido.');
      return;
    }

    const result = await solicitarRecuperacao(email);
    
    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess('Um e-mail de recuperação foi enviado. Por favor, verifique sua caixa de entrada e spam.');
      // Em ambiente real, não mostramos o token, mas como isso é um exemplo:
      setToken(result.data.token);
      
      // Mudar para etapa de verificação de token
      setTimeout(() => {
        setStep('verificar');
      }, 3000);
    }
  };

  const handleVerificarToken = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    if (!token) {
      setFormError('Digite o código de recuperação.');
      return;
    }

    const result = await verificarToken(token);
    
    if (result.error) {
      setFormError(result.error);
    } else {
      setSuccess('Token verificado com sucesso!');
      // Redirecionar para página de alteração de senha
      setTimeout(() => {
        window.location.href = `/alterar-senha?token=${token}`;
      }, 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Senha | OAB-GO Projetos</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-8">
            <img 
              src="/images/logo-oabgo.png" 
              alt="OAB-GO" 
              className="h-20 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800">
              Recuperação de Senha
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              {step === 'solicitar' 
                ? 'Digite seu e-mail para receber o código de recuperação'
                : 'Digite o código de recuperação que foi enviado para seu e-mail'
              }
            </p>
          </div>
          
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          {step === 'solicitar' ? (
            <form onSubmit={handleSolicitarRecuperacao}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Código de Recuperação'}
                </button>
                
                <div className="mt-4 text-center">
                  <Link href="/login" className="text-blue-600 hover:text-blue-800">
                    Voltar para o login
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerificarToken}>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="token">
                  Código de Recuperação
                </label>
                <input
                  id="token"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Digite o código recebido"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  disabled={loading}
                >
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>
                
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 mt-2"
                  onClick={() => setStep('solicitar')}
                  disabled={loading}
                >
                  Voltar para o envio de e-mail
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
} 