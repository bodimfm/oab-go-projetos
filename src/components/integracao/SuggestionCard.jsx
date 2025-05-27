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