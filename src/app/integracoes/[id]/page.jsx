"use client";

import { useParams, useRouter } from 'next/navigation';
import { useSuggestionById, useDeactivateSuggestion } from '../../../hooks/useSuggestions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

// Criando uma instância do cliente de consulta
const queryClient = new QueryClient();

function SuggestionDetails() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { 
    data: suggestion, 
    isLoading, 
    isError, 
    error 
  } = useSuggestionById(id);

  const deactivateMutation = useDeactivateSuggestion();
  
  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja desativar esta sugestão?')) {
      setIsDeleting(true);
      
      try {
        await deactivateMutation.mutateAsync(id);
        router.push('/integracoes');
      } catch (error) {
        console.error('Erro ao desativar:', error);
        setIsDeleting(false);
      }
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-10">Carregando detalhes...</div>;
  }
  
  if (isError) {
    return <div className="text-red-500 p-5">Erro ao carregar detalhes: {error.message}</div>;
  }
  
  if (!suggestion) {
    return <div className="p-5">Sugestão não encontrada</div>;
  }
  
  const complexityColorMap = {
    baixa: 'bg-green-100 text-green-800',
    media: 'bg-yellow-100 text-yellow-800',
    alta: 'bg-red-100 text-red-800'
  };
  
  const typeColorMap = {
    api: 'bg-blue-100 text-blue-800',
    software: 'bg-purple-100 text-purple-800',
    servico: 'bg-indigo-100 text-indigo-800',
    outra: 'bg-gray-100 text-gray-800'
  };
  
  const complexityLabel = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta'
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
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-md text-sm font-medium ${typeColorMap[suggestion.tipo] || 'bg-gray-100'}`}>
                {suggestion.tipo.charAt(0).toUpperCase() + suggestion.tipo.slice(1)}
              </span>
              
              <span className={`px-3 py-1 rounded-md text-sm font-medium ${complexityColorMap[suggestion.nivel_complexidade] || 'bg-gray-100'}`}>
                Complexidade {complexityLabel[suggestion.nivel_complexidade] || suggestion.nivel_complexidade}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/integracoes/editar/${id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Editar
              </Link>
              
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300"
              >
                {isDeleting ? 'Desativando...' : 'Desativar'}
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{suggestion.nome}</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Descrição</h2>
            <p className="text-gray-700">{suggestion.descricao}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">Área de Aplicação</h2>
              <p className="text-gray-700">{suggestion.area_aplicacao}</p>
            </div>
            
            {suggestion.beneficios && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Benefícios</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {suggestion.beneficios.split(';').map((benefit, index) => (
                    <li key={index}>{benefit.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestion.detalhes_tecnicos && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Detalhes Técnicos</h2>
                <p className="text-gray-700">{suggestion.detalhes_tecnicos}</p>
              </div>
            )}
            
            {suggestion.pre_requisitos && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Pré-requisitos</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {suggestion.pre_requisitos.split(';').map((req, index) => (
                    <li key={index}>{req.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="border-t my-8 pt-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {suggestion.tempo_implementacao && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tempo de Implementação</h3>
                <p className="text-gray-700">{suggestion.tempo_implementacao}</p>
              </div>
            )}
            
            {suggestion.custo_estimado && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Custo Estimado</h3>
                <p className="text-gray-700">{suggestion.custo_estimado}</p>
              </div>
            )}
            
            {suggestion.compativel_com && suggestion.compativel_com.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Compatível com</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestion.compativel_com.map((system) => (
                    <span 
                      key={system} 
                      className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {suggestion.url_documentacao && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Documentação</h3>
                <a 
                  href={suggestion.url_documentacao} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Acessar documentação externa
                </a>
              </div>
            )}
          </div>
          
          {suggestion.tags && suggestion.tags.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {suggestion.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t pt-8 mt-8 flex justify-center">
            <button 
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={() => {
                // Implementar lógica para solicitar integração
                alert('Funcionalidade de solicitação de integração será implementada.');
              }}
            >
              Solicitar esta integração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuggestionDetailsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuggestionDetails />
    </QueryClientProvider>
  );
} 