import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function NovoProjeto() {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    objetivo: '',
    publico_alvo: '',
    beneficios: '',
    recursos_necessarios: '',
    prazo_estimado: '',
  });
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionadas, setCategoriaSelecionadas] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Carregar categorias quando o usuário estiver autenticado
    if (user && !loading) {
      const fetchCategorias = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/categorias`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setCategorias(data.data || []);
          }
          
          setLoadingCategorias(false);
        } catch (error) {
          console.error('Erro ao carregar categorias:', error);
          setLoadingCategorias(false);
        }
      };
      
      fetchCategorias();
    }
  }, [user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoriaChange = (e) => {
    const categoriaId = e.target.value;
    if (e.target.checked) {
      setCategoriaSelecionadas(prev => [...prev, categoriaId]);
    } else {
      setCategoriaSelecionadas(prev => prev.filter(id => id !== categoriaId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.titulo.trim()) {
      setError('O título do projeto é obrigatório');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Criar projeto
      const projetoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/projetos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!projetoResponse.ok) {
        throw new Error('Erro ao criar projeto');
      }
      
      const projetoData = await projetoResponse.json();
      const projetoId = projetoData.data.id;
      
      // Associar categorias ao projeto
      if (categoriaSelecionadas.length > 0) {
        const promessas = categoriaSelecionadas.map(categoriaId => 
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/projetos-categorias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              projeto_id: projetoId,
              categoria_id: categoriaId
            }),
          })
        );
        
        await Promise.all(promessas);
      }
      
      // Redirecionar para a página do projeto
      router.push(`/projetos/${projetoId}`);
    } catch (err) {
      setError(err.message || 'Erro ao criar projeto. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (loading || loadingCategorias) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Novo Projeto</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
              Título *
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="descricao">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.descricao}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="objetivo">
              Objetivo
            </label>
            <textarea
              id="objetivo"
              name="objetivo"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.objetivo}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="publico_alvo">
              Público-alvo
            </label>
            <input
              id="publico_alvo"
              name="publico_alvo"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.publico_alvo}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="beneficios">
              Benefícios
            </label>
            <textarea
              id="beneficios"
              name="beneficios"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.beneficios}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recursos_necessarios">
              Recursos Necessários
            </label>
            <textarea
              id="recursos_necessarios"
              name="recursos_necessarios"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.recursos_necessarios}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prazo_estimado">
              Prazo Estimado
            </label>
            <input
              id="prazo_estimado"
              name="prazo_estimado"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.prazo_estimado}
              onChange={handleChange}
              placeholder="Ex: 3 meses, 1 ano, etc."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Categorias
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categorias.map(categoria => (
                <div key={categoria.id} className="flex items-center">
                  <input
                    id={`categoria-${categoria.id}`}
                    type="checkbox"
                    value={categoria.id}
                    onChange={handleCategoriaChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor={`categoria-${categoria.id}`} className="ml-2 text-sm text-gray-700">
                    {categoria.nome}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Link href="/">
              <a className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Cancelar
              </a>
            </Link>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}