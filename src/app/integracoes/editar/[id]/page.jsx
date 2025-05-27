"use client";

import { useParams, useRouter } from 'next/navigation';
import { useSuggestionById } from '../../../../hooks/useSuggestions';
import SuggestionForm from '../../../../components/integracao/SuggestionForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';

// Criando uma instância do cliente de consulta
const queryClient = new QueryClient();

function EditSuggestion() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const { 
    data: suggestion, 
    isLoading, 
    isError, 
    error 
  } = useSuggestionById(id);
  
  const handleSuccess = () => {
    // Redirecionar para a página de detalhes após a edição ser bem-sucedida
    router.push(`/integracoes/${id}`);
  };
  
  const handleCancel = () => {
    // Voltar para a página de detalhes
    router.push(`/integracoes/${id}`);
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-10">Carregando dados...</div>;
  }
  
  if (isError) {
    return <div className="text-red-500 p-5">Erro ao carregar dados: {error.message}</div>;
  }
  
  if (!suggestion) {
    return <div className="p-5">Sugestão não encontrada</div>;
  }
  
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Link 
          href={`/integracoes/${id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para detalhes
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Editar Sugestão de Integração</h1>
          
          <p className="text-gray-600 mb-8">
            Atualize as informações da sugestão de integração.
            Os campos marcados com * são obrigatórios.
          </p>
          
          <SuggestionForm 
            suggestion={suggestion}
            onSuccess={handleSuccess} 
            onCancel={handleCancel} 
          />
        </div>
      </div>
    </div>
  );
}

export default function EditSuggestionPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <EditSuggestion />
    </QueryClientProvider>
  );
} 