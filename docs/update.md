Orientação para Implementação no Cursor
Visão Geral do Projeto
Este guia orienta a implementação de um sistema de sugestões de integração para escritórios de advocacia especializados em direito digital, proteção de dados e inteligência artificial. O backend utiliza o Supabase (PostgreSQL) e o frontend será implementado com React/Next.js.
Estrutura do Banco de Dados
Tabela Principal: sugestoes_integracao
sqlCREATE TABLE public.sugestoes_integracao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo = ANY (ARRAY['api', 'software', 'servico', 'outra'])),
    area_aplicacao TEXT NOT NULL,
    detalhes_tecnicos TEXT,
    url_documentacao TEXT,
    beneficios TEXT,
    nivel_complexidade TEXT CHECK (nivel_complexidade = ANY (ARRAY['baixa', 'media', 'alta'])),
    custo_estimado TEXT,
    tempo_implementacao TEXT,
    pre_requisitos TEXT,
    compativel_com TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
Tabelas Relacionadas (Existentes)

comissoes - Comissões da OAB
projetos - Projetos gerenciados pelas comissões
membros_comissoes - Membros das comissões
usuarios - Usuários do sistema

Configuração Inicial

Instale as bibliotecas necessárias:

bashnpm install @supabase/supabase-js react-hook-form @tanstack/react-query

Configure a conexão com o Supabase:

javascript// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
Componentes e Funções Principais
1. Serviço de API para Sugestões de Integração
javascript// services/integrationSuggestions.js
import { supabase } from '../lib/supabaseClient';

export const integrationSuggestionsService = {
  /**
   * Busca todas as sugestões de integração ativas
   * @param {Object} options - Opções de filtragem
   * @returns {Promise<Array>} - Lista de sugestões
   */
  async getAllSuggestions(options = {}) {
    let query = supabase
      .from('sugestoes_integracao')
      .select('*')
      .eq('ativa', true);
    
    // Aplicar filtros se fornecidos
    if (options.tipo) {
      query = query.eq('tipo', options.tipo);
    }
    
    if (options.nivel_complexidade) {
      query = query.eq('nivel_complexidade', options.nivel_complexidade);
    }
    
    if (options.area_aplicacao) {
      query = query.ilike('area_aplicacao', `%${options.area_aplicacao}%`);
    }
    
    if (options.search) {
      query = query.or(`nome.ilike.%${options.search}%,descricao.ilike.%${options.search}%`);
    }
    
    // Ordenação
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar sugestões:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Busca sugestões de integração por compatibilidade
   * @param {Array<string>} sistemas - Sistemas compatíveis
   * @returns {Promise<Array>} - Lista de sugestões compatíveis
   */
  async getSuggestionsByCompatibility(sistemas = []) {
    if (!sistemas.length) return [];
    
    // Preparar condições para cada sistema
    const conditions = sistemas.map(sistema => 
      `compativel_com.cs.{${sistema}}`
    ).join(',');
    
    const { data, error } = await supabase
      .from('sugestoes_integracao')
      .select('*')
      .eq('ativa', true)
      .or(conditions);
    
    if (error) {
      console.error('Erro ao buscar por compatibilidade:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Busca sugestões de integração por tags
   * @param {Array<string>} tags - Tags para busca
   * @returns {Promise<Array>} - Lista de sugestões com as tags
   */
  async getSuggestionsByTags(tags = []) {
    if (!tags.length) return [];
    
    // Preparar condições para cada tag
    const conditions = tags.map(tag => 
      `tags.cs.{${tag}}`
    ).join(',');
    
    const { data, error } = await supabase
      .from('sugestoes_integracao')
      .select('*')
      .eq('ativa', true)
      .or(conditions);
    
    if (error) {
      console.error('Erro ao buscar por tags:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Busca uma sugestão de integração específica
   * @param {string} id - ID da sugestão
   * @returns {Promise<Object>} - Sugestão de integração
   */
  async getSuggestionById(id) {
    const { data, error } = await supabase
      .from('sugestoes_integracao')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erro ao buscar sugestão:', error);
      throw error;
    }
    
    return data;
  },
  
  /**
   * Cria uma nova sugestão de integração
   * @param {Object} suggestion - Dados da sugestão
   * @returns {Promise<Object>} - Sugestão criada
   */
  async createSuggestion(suggestion) {
    const { data, error } = await supabase
      .from('sugestoes_integracao')
      .insert([suggestion])
      .select();
    
    if (error) {
      console.error('Erro ao criar sugestão:', error);
      throw error;
    }
    
    return data[0];
  },
  
  /**
   * Atualiza uma sugestão existente
   * @param {string} id - ID da sugestão
   * @param {Object} updates - Campos a atualizar
   * @returns {Promise<Object>} - Sugestão atualizada
   */
  async updateSuggestion(id, updates) {
    const { data, error } = await supabase
      .from('sugestoes_integracao')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Erro ao atualizar sugestão:', error);
      throw error;
    }
    
    return data[0];
  },
  
  /**
   * Desativa uma sugestão (sem excluir)
   * @param {string} id - ID da sugestão
   * @returns {Promise<Object>} - Resultado da operação
   */
  async deactivateSuggestion(id) {
    const { data, error } = await supabase
      .from('sugestoes_integracao')
      .update({ ativa: false })
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Erro ao desativar sugestão:', error);
      throw error;
    }
    
    return data[0];
  },
  
  /**
   * Busca estatísticas das sugestões
   * @returns {Promise<Object>} - Estatísticas
   */
  async getSuggestionStats() {
    // Busca contagem por tipo
    const { data: typeStats, error: typeError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT tipo, COUNT(*) as total 
          FROM public.sugestoes_integracao 
          WHERE ativa = true 
          GROUP BY tipo
        `
      });
    
    // Busca contagem por nível de complexidade
    const { data: complexityStats, error: complexityError } = await supabase
      .rpc('execute_sql', {
        query: `
          SELECT nivel_complexidade, COUNT(*) as total 
          FROM public.sugestoes_integracao 
          WHERE ativa = true 
          GROUP BY nivel_complexidade 
          ORDER BY 
            CASE 
              WHEN nivel_complexidade = 'baixa' THEN 1 
              WHEN nivel_complexidade = 'media' THEN 2 
              WHEN nivel_complexidade = 'alta' THEN 3 
            END
        `
      });
    
    if (typeError || complexityError) {
      console.error('Erro ao buscar estatísticas:', typeError || complexityError);
      throw typeError || complexityError;
    }
    
    return {
      byType: typeStats,
      byComplexity: complexityStats
    };
  }
};
2. Hook de Consulta React Query
javascript// hooks/useSuggestions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationSuggestionsService } from '../services/integrationSuggestions';

export function useSuggestions(filters = {}) {
  return useQuery({
    queryKey: ['suggestions', filters],
    queryFn: () => integrationSuggestionsService.getAllSuggestions(filters),
  });
}

export function useSuggestionById(id) {
  return useQuery({
    queryKey: ['suggestion', id],
    queryFn: () => integrationSuggestionsService.getSuggestionById(id),
    enabled: !!id,
  });
}

export function useSuggestionsByCompatibility(systems = []) {
  return useQuery({
    queryKey: ['suggestionsByCompatibility', systems],
    queryFn: () => integrationSuggestionsService.getSuggestionsByCompatibility(systems),
    enabled: systems.length > 0,
  });
}

export function useSuggestionsByTags(tags = []) {
  return useQuery({
    queryKey: ['suggestionsByTags', tags],
    queryFn: () => integrationSuggestionsService.getSuggestionsByTags(tags),
    enabled: tags.length > 0,
  });
}

export function useSuggestionStats() {
  return useQuery({
    queryKey: ['suggestionStats'],
    queryFn: () => integrationSuggestionsService.getSuggestionStats(),
  });
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (suggestion) => integrationSuggestionsService.createSuggestion(suggestion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => integrationSuggestionsService.updateSuggestion(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['suggestion', data.id] });
    },
  });
}

export function useDeactivateSuggestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => integrationSuggestionsService.deactivateSuggestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
  });
}
3. Componente de Lista de Sugestões
jsx// components/SuggestionsList.jsx
import { useState, useEffect } from 'react';
import { useSuggestions } from '../hooks/useSuggestions';
import SuggestionCard from './SuggestionCard';
import FilterSidebar from './FilterSidebar';

export default function SuggestionsList() {
  const [filters, setFilters] = useState({
    tipo: null,
    nivel_complexidade: null,
    area_aplicacao: null,
    search: '',
    orderBy: 'created_at',
    ascending: false,
  });
  
  const { 
    data: suggestions, 
    isLoading, 
    isError, 
    error 
  } = useSuggestions(filters);
  
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };
  
  const handleSort = (field, direction) => {
    setFilters(prev => ({
      ...prev,
      orderBy: field,
      ascending: direction === 'asc'
    }));
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-10">Carregando sugestões...</div>;
  }
  
  if (isError) {
    return <div className="text-red-500 p-5">Erro ao carregar sugestões: {error.message}</div>;
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <div className="w-full md:w-1/4 lg:w-1/5">
        <FilterSidebar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>
      
      <div className="w-full md:w-3/4 lg:w-4/5">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">Sugestões de Integração</h1>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pesquisar sugestões..."
                className="px-3 py-2 border rounded-md"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              
              <select 
                className="px-3 py-2 border rounded-md"
                value={`${filters.orderBy}_${filters.ascending ? 'asc' : 'desc'}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('_');
                  handleSort(field, direction);
                }}
              >
                <option value="created_at_desc">Mais recentes</option>
                <option value="created_at_asc">Mais antigas</option>
                <option value="nome_asc">Nome A-Z</option>
                <option value="nome_desc">Nome Z-A</option>
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-gray-600">
            {suggestions?.length || 0} sugestões encontradas
          </div>
        </div>
        
        {suggestions?.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-lg text-gray-600">
              Nenhuma sugestão encontrada com os filtros atuais.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => setFilters({
                tipo: null,
                nivel_complexidade: null,
                area_aplicacao: null,
                search: '',
                orderBy: 'created_at',
                ascending: false,
              })}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions?.map(suggestion => (
              <SuggestionCard 
                key={suggestion.id} 
                suggestion={suggestion} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
4. Componente de Card de Sugestão
jsx// components/SuggestionCard.jsx
import Link from 'next/link';

export default function SuggestionCard({ suggestion }) {
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
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeColorMap[suggestion.tipo] || 'bg-gray-100'}`}>
            {suggestion.tipo.charAt(0).toUpperCase() + suggestion.tipo.slice(1)}
          </span>
          
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${complexityColorMap[suggestion.nivel_complexidade] || 'bg-gray-100'}`}>
            Complexidade {complexityLabel[suggestion.nivel_complexidade] || suggestion.nivel_complexidade}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{suggestion.nome}</h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {suggestion.descricao}
        </p>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Área de Aplicação</h4>
          <p className="text-sm text-gray-600">{suggestion.area_aplicacao}</p>
        </div>
        
        {suggestion.tags && suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {suggestion.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                {tag}
              </span>
            ))}
            {suggestion.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs">
                +{suggestion.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        <Link 
          href={`/integracoes/${suggestion.id}`}
          className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
5. Página de Detalhes da Sugestão
jsx// pages/integracoes/[id].jsx
import { useRouter } from 'next/router';
import { useSuggestionById } from '../../hooks/useSuggestions';
import Link from 'next/link';

export default function SuggestionDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { 
    data: suggestion, 
    isLoading, 
    isError, 
    error 
  } = useSuggestionById(id);
  
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
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${typeColorMap[suggestion.tipo] || 'bg-gray-100'}`}>
              {suggestion.tipo.charAt(0).toUpperCase() + suggestion.tipo.slice(1)}
            </span>
            
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${complexityColorMap[suggestion.nivel_complexidade] || 'bg-gray-100'}`}>
              Complexidade {complexityLabel[suggestion.nivel_complexidade] || suggestion.nivel_complexidade}
            </span>
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
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
6. Componente de Filtros
jsx// components/FilterSidebar.jsx
import { useState, useEffect } from 'react';

export default function FilterSidebar({ filters, onFilterChange }) {
  // Valores estáticos para os filtros
  const tiposIntegracao = [
    { value: 'api', label: 'API' },
    { value: 'software', label: 'Software' },
    { value: 'servico', label: 'Serviço' },
    { value: 'outra', label: 'Outra' }
  ];
  
  const niveisComplexidade = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' }
  ];
  
  // Áreas de aplicação (dinâmico, mas para simplicidade usando estático aqui)
  const areasAplicacao = [
    { value: 'Gestão de Processos Judiciais', label: 'Gestão de Processos Judiciais' },
    { value: 'Produtividade e Documentação', label: 'Produtividade e Documentação' },
    { value: 'Business Intelligence Jurídico', label: 'Business Intelligence Jurídico' },
    { value: 'Gestão de Documentos', label: 'Gestão de Documentos' },
    { value: 'Atendimento ao Cliente', label: 'Atendimento ao Cliente' }
  ];
  
  const handleTipoChange = (tipo) => {
    onFilterChange({
      tipo: filters.tipo === tipo ? null : tipo
    });
  };
  
  const handleComplexidadeChange = (nivel) => {
    onFilterChange({
      nivel_complexidade: filters.nivel_complexidade === nivel ? null : nivel
    });
  };
  
  const handleAreaChange = (area) => {
    onFilterChange({
      area_aplicacao: filters.area_aplicacao === area ? null : area
    });
  };
  
  const clearFilters = () => {
    onFilterChange({
      tipo: null,
      nivel_complexidade: null,
      area_aplicacao: null
    });
  };
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        
        <button
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={clearFilters}
        >
          Limpar
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Tipo de Integração</h3>
          <div className="space-y-2">
            {tiposIntegracao.map(tipo => (
              <label key={tipo.value} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={filters.tipo === tipo.value}
                  onChange={() => handleTipoChange(tipo.value)}
                />
                <span className="ml-2 text-gray-700">{tipo.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Nível de Complexidade</h3>
          <div className="space-y-2">
            {niveisComplexidade.map(nivel => (
              <label key={nivel.value} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={filters.nivel_complexidade === nivel.value}
                  onChange={() => handleComplexidadeChange(nivel.value)}
                />
                <span className="ml-2 text-gray-700">{nivel.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Área de Aplicação</h3>
          <div className="space-y-2">
            {areasAplicacao.map(area => (
              <label key={area.value} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={filters.area_aplicacao === area.value}
                  onChange={() => handleAreaChange(area.value)}
                />
                <span className="ml-2 text-gray-700">{area.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
7. Dashboard de Estatísticas (Admin)
jsx// components/SuggestionStats.jsx
import { useSuggestionStats } from '../hooks/useSuggestions';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function SuggestionStats() {
  const { data: stats, isLoading, isError } = useSuggestionStats();
  
  if (isLoading) {
    return <div className="flex justify-center p-10">Carregando estatísticas...</div>;
  }
  
  if (isError) {
    return <div className="text-red-500 p-5">Erro ao carregar estatísticas</div>;
  }
  
  if (!stats) {
    return <div className="p-5">Nenhuma estatística disponível</div>;
  }
  
  // Preparar dados para o gráfico por tipo
  const typeLabels = stats.byType.map(item => item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1));
  const typeValues = stats.byType.map(item => item.total);
  const typeColors = [
    'rgba(54, 162, 235, 0.8)',  // API - Azul
    'rgba(153, 102, 255, 0.8)', // Software - Roxo
    'rgba(75, 192, 192, 0.8)',  // Serviço - Verde
    'rgba(201, 203, 207, 0.8)'  // Outra - Cinza
  ];
  
  const typeData = {
    labels: typeLabels,
    datasets: [
      {
        label: 'Integrações por Tipo',
        data: typeValues,
        backgroundColor: typeColors.slice(0, typeLabels.length),
        borderColor: typeColors.slice(0, typeLabels.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };
  
  // Preparar dados para o gráfico por complexidade
  const complexityLabels = stats.byComplexity.map(item => {
    const nivel = item.nivel_complexidade;
    return nivel === 'baixa' ? 'Baixa' :
           nivel === 'media' ? 'Média' : 'Alta';
  });
  
  const complexityValues = stats.byComplexity.map(item => item.total);
  const complexityColors = [
    'rgba(75, 192, 192, 0.8)',   // Baixa - Verde
    'rgba(255, 206, 86, 0.8)',   // Média - Amarelo
    'rgba(255, 99, 132, 0.8)',   // Alta - Vermelho
  ];
  
  const complexityData = {
    labels: complexityLabels,
    datasets: [
      {
        label: 'Integrações por Complexidade',
        data: complexityValues,
        backgroundColor: complexityColors.slice(0, complexityLabels.length),
        borderColor: complexityColors.slice(0, complexityLabels.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Estatísticas de Integrações</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Por Tipo</h3>
          <div className="h-72">
            <Pie 
              data={typeData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} 
            />
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            {stats.byType.map((item, index) => (
              <div key={item.tipo} className="flex items-center">
                <div 
                  className="h-4 w-4 rounded-full mr-2" 
                  style={{ backgroundColor: typeColors[index] }}
                ></div>
                <span className="text-sm">
                  {item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1)}: {item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Por Complexidade</h3>
          <div className="h-72">
            <Bar 
              data={complexityData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            {stats.byComplexity.map((item, index) => (
              <div key={item.nivel_complexidade} className="flex items-center">
                <div 
                  className="h-4 w-4 rounded-full mr-2" 
                  style={{ backgroundColor: complexityColors[index] }}
                ></div>
                <span className="text-sm">
                  {complexityLabels[index]}: {item.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
8. Formulário de Criação/Edição de Sugestão (Admin)
jsx// components/SuggestionForm.jsx
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useCreateSuggestion, useUpdateSuggestion } from '../hooks/useSuggestions';

export default function SuggestionForm({ suggestion, onSuccess, onCancel }) {
  const isEditing = !!suggestion;
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: isEditing ? {
      ...suggestion,
      compativel_com: suggestion.compativel_com?.join(', ') || '',
      tags: suggestion.tags?.join(', ') || '',
    } : {
      nome: '',
      descricao: '',
      tipo: 'api',
      area_aplicacao: '',
      detalhes_tecnicos: '',
      url_documentacao: '',
      beneficios: '',
      nivel_complexidade: 'media',
      custo_estimado: '',
      tempo_implementacao: '',
      pre_requisitos: '',
      compativel_com: '',
      tags: '',
      ativa: true
    }
  });
  
  const createMutation = useCreateSuggestion();
  const updateMutation = useUpdateSuggestion();
  
  const onSubmit = (data) => {
    // Converter strings separadas por vírgula em arrays
    const processedData = {
      ...data,
      compativel_com: data.compativel_com ? 
        data.compativel_com.split(',').map(item => item.trim()) : [],
      tags: data.tags ? 
        data.tags.split(',').map(item => item.trim()) : []
    };
    
    if (isEditing) {
      updateMutation.mutate(
        { id: suggestion.id, updates: processedData },
        {
          onSuccess: () => {
            onSuccess?.();
          }
        }
      );
    } else {
      createMutation.mutate(
        processedData,
        {
          onSuccess: () => {
            reset();
            onSuccess?.();
          }
        }
      );
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Integração*
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-md ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
              {...register('nome', { required: 'Nome é obrigatório' })}
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Integração*
            </label>
            <select
              className={`w-full px-4 py-2 border rounded-md ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
              {...register('tipo', { required: 'Tipo é obrigatório' })}
            >
              <option value="api">API</option>
              <option value="software">Software</option>
              <option value="servico">Serviço</option>
              <option value="outra">Outra</option>
            </select>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área de Aplicação*
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-md ${errors.area_aplicacao ? 'border-red-500' : 'border-gray-300'}`}
              {...register('area_aplicacao', { required: 'Área de aplicação é obrigatória' })}
            />
            {errors.area_aplicacao && (
              <p className="mt-1 text-sm text-red-600">{errors.area_aplicacao.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nível de Complexidade*
            </label>
            <select
              className={`w-full px-4 py-2 border rounded-md ${errors.nivel_complexidade ? 'border-red-500' : 'border-gray-300'}`}
              {...register('nivel_complexidade', { required: 'Nível de complexidade é obrigatório' })}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
            {errors.nivel_complexidade && (
              <p className="mt-1 text-sm text-red-600">{errors.nivel_complexidade.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Documentação
            </label>
            <input
              type="url"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              {...register('url_documentacao')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compatível com (separar por vírgulas)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Microsoft Office, Google Docs, SAP"
              {...register('compativel_com')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separar por vírgulas)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: automação, documentos, IA"
              {...register('tags')}
            />
          </div>
          
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="ativa"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('ativa')}
            />
            <label htmlFor="ativa" className="ml-2 block text-sm text-gray-700">
              Ativa (visível para usuários)
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição*
            </label>
            <textarea
              rows={4}
              className={`w-full px-4 py-2 border rounded-md ${errors.descricao ? 'border-red-500' : 'border-gray-300'}`}
              {...register('descricao', { required: 'Descrição é obrigatória' })}
            ></textarea>
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefícios (separar por ponto e vírgula)
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Redução de tempo; Maior precisão; Melhor experiência"
              {...register('beneficios')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalhes Técnicos
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              {...register('detalhes_tecnicos')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pré-requisitos (separar por ponto e vírgula)
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: Certificado digital; Acesso admin ao sistema"
              {...register('pre_requisitos')}
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custo Estimado
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: R$ 3.000 a R$ 5.000 + mensalidade"
              {...register('custo_estimado')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo de Implementação
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Ex: 15 a 30 dias"
              {...register('tempo_implementacao')}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending ? (
            'Salvando...'
          ) : isEditing ? (
            'Atualizar Sugestão'
          ) : (
            'Criar Sugestão'
          )}
        </button>
      </div>
    </form>
  );
}
Estrutura de Arquivos
/
├── lib/
│   └── supabaseClient.js        # Cliente Supabase
├── services/
│   └── integrationSuggestions.js # Serviço de API
├── hooks/
│   └── useSuggestions.js        # Hooks React Query
├── components/
│   ├── SuggestionsList.jsx      # Listagem de sugestões
│   ├── SuggestionCard.jsx       # Card individual de sugestão
│   ├── FilterSidebar.jsx        # Barra de filtros
│   ├── SuggestionStats.jsx      # Estatísticas (admin)
│   └── SuggestionForm.jsx       # Formulário (admin)
├── pages/
│   ├── integracoes/
│   │   ├── index.jsx            # Página de listagem
│   │   ├── [id].jsx             # Página de detalhes
│   │   ├── nova.jsx             # Página de criação (admin)
│   │   └── editar/[id].jsx      # Página de edição (admin)
│   ├── admin/
│   │   └── integracoes/         # Painel admin
│   └── _app.jsx                 # Configuração global
├── styles/
│   └── globals.css              # Estilos globais (Tailwind)
└── next.config.js               # Configuração Next.js
Passos de Implementação

Configuração do Ambiente:

Configurar Next.js com Tailwind CSS
Configurar cliente Supabase
Configurar React Query


Implementação dos Serviços e Hooks:

Implementar o serviço de API para comunicação com o Supabase
Criar hooks React Query para gerenciar estado e cache


Implementação da UI:

Criar componentes de listagem, filtro e detalhes
Implementar páginas Next.js correspondentes
Adicionar estilos Tailwind


Implementação do Painel Admin:

Criar formulário de criação/edição
Implementar painel de estatísticas
Adicionar funcionalidades de gestão


Autenticação e Permissões:

Integrar com sistema de autenticação do Supabase
Configurar permissões para acesso ao painel admin


Testes e Otimizações:

Testar toda a aplicação
Otimizar queries para melhor performance



Consultas SQL Úteis
Além das consultas incluídas no serviço, você pode usar estas para análises avançadas:
sql-- Sugestões por compatibilidade com sistema específico
SELECT * FROM public.sugestoes_integracao 
WHERE 'Microsoft Office' = ANY(compativel_com) 
AND ativa = true;

-- Sugestões por múltiplas tags
SELECT * FROM public.sugestoes_integracao 
WHERE 'automação' = ANY(tags) AND 'documentos' = ANY(tags) 
AND ativa = true;

-- Estatísticas de tags mais usadas
SELECT 
  tag, 
  COUNT(*) as quantidade 
FROM 
  public.sugestoes_integracao, 
  unnest(tags) as tag 
WHERE ativa = true 
GROUP BY tag 
ORDER BY quantidade DESC 
LIMIT 10;

-- Sugestões por faixa de custo (para análise)
SELECT 
  id, 
  nome, 
  custo_estimado,
  CASE 
    WHEN custo_estimado ILIKE '%até R$ 1.000%' OR custo_estimado ILIKE '%R$ 800%' THEN 'baixo'
    WHEN custo_estimado ILIKE '%R$ 8.000%' OR custo_estimado ILIKE '%R$ 10.000%' THEN 'alto'
    ELSE 'médio'
  END as faixa_custo
FROM public.sugestoes_integracao
WHERE ativa = true;
Considerações Finais
Esta implementação oferece uma solução completa para gerenciar e exibir sugestões de integração para escritórios de advocacia. Como advogado atuando em tecnologia, você terá um sistema robusto que permitirá:

Apresentar opções de automação e integração contextualizadas para o setor jurídico
Filtrar e pesquisar de forma eficiente
Gerenciar o catálogo de sugestões pelo painel administrativo
Analisar estatísticas de utilização e interesse

O sistema é facilmente expansível para adicionar novas funcionalidades, como:

Histórico de solicitações de integrações
Avaliações e comentários dos usuários
Integração com sistemas de orçamento
Recomendações inteligentes baseadas no perfil do cliente

Com esta implementação, você terá uma alternativa eficiente e confiável à solução baseada em IA, mantendo controle total sobre o conteúdo e reduzindo custos operacionais.