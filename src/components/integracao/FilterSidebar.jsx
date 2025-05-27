import { useState } from 'react';

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
  
  // Áreas de aplicação (exemplo)
  const areasAplicacao = [
    { value: 'Direito Digital', label: 'Direito Digital' },
    { value: 'Proteção de Dados', label: 'Proteção de Dados' },
    { value: 'Propriedade Intelectual', label: 'Propriedade Intelectual' },
    { value: 'Inteligência Artificial', label: 'Inteligência Artificial' },
    { value: 'Tecnologia', label: 'Tecnologia' }
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