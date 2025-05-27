import { useState } from 'react';
import { useSuggestions } from '../../hooks/useSuggestions';
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