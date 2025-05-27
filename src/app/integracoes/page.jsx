"use client";

import SuggestionsList from '../../components/integracao/SuggestionsList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Link from 'next/link';

// Criando uma instância do cliente de consulta
const queryClient = new QueryClient();

export default function IntegracoesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Integrações entre Comissões</h1>
          
          <Link
            href="/integracoes/nova"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Nova Sugestão
          </Link>
        </div>
        
        <p className="text-gray-600 mb-8">
          Aqui você encontra sugestões de integração entre projetos das comissões da OAB-GO. 
          Explore as possibilidades ou sugira uma nova integração.
        </p>
        
        <SuggestionsList />
      </div>
    </QueryClientProvider>
  );
} 