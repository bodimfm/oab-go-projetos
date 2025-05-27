"use client";

import { useRouter } from 'next/navigation';
import SuggestionForm from '../../../components/integracao/SuggestionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';

// Criando uma instância do cliente de consulta
const queryClient = new QueryClient();

function NewSuggestion() {
  const router = useRouter();
  
  const handleSuccess = () => {
    // Redirecionar para a lista após a criação ser bem-sucedida
    router.push('/integracoes');
  };
  
  const handleCancel = () => {
    // Voltar para a lista
    router.push('/integracoes');
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Link 
          href="/integracoes"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para lista
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Nova Sugestão de Integração</h1>
          
          <p className="text-gray-600 mb-8">
            Preencha o formulário abaixo para sugerir uma integração entre projetos ou comissões.
            Os campos marcados com * são obrigatórios.
          </p>
          
          <SuggestionForm 
            onSuccess={handleSuccess} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
}

export default function NewSuggestionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <NewSuggestion />
    </QueryClientProvider>
  );
} 