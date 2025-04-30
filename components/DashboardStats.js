import Link from 'next/link';

export default function DashboardStats({ data }) {
  const { totalProjetos, projetosPorStatus, projetosMaisVotados, projetosRecentes } = data;
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total de Projetos</h3>
          <p className="text-3xl font-bold text-blue-600">{totalProjetos}</p>
        </div>
        
        {Object.entries(projetosPorStatus || {}).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Projetos {status}</h3>
            <p className="text-3xl font-bold text-blue-600">{count}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Projetos Mais Votados</h3>
          
          {projetosMaisVotados && projetosMaisVotados.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {projetosMaisVotados.map(projeto => (
                <li key={projeto.id} className="py-3">
                  <Link href={`/projetos/${projeto.id}`}>
                    <a className="flex justify-between items-center hover:text-blue-600">
                      <span className="font-medium truncate">{projeto.titulo}</span>
                      <span className="flex items-center text-blue-600 ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                        </svg>
                        {projeto.votos}
                      </span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum projeto votado ainda.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Projetos Recentes</h3>
          
          {projetosRecentes && projetosRecentes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {projetosRecentes.map(projeto => (
                <li key={projeto.id} className="py-3">
                  <Link href={`/projetos/${projeto.id}`}>
                    <a className="flex justify-between items-center hover:text-blue-600">
                      <span className="font-medium truncate">{projeto.titulo}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(projeto.data_criacao).toLocaleDateString()}
                      </span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum projeto cadastrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}