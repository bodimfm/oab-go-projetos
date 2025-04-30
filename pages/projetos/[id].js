import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function DetalhesProjeto() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [projeto, setProjeto] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    // Carregar dados do projeto quando o ID estiver disponível e o usuário estiver autenticado
    if (id && user && !loading) {
      fetchProjeto();
      fetchComentarios();
    }
  }, [id, user, loading]);

  const fetchProjeto = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/projetos/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjeto(data.data);
        
        // Obter categorias do projeto
        const categoriasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/projetos/${id}/categorias`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (categoriasResponse.ok) {
          const categoriasData = await categoriasResponse.json();
          setCategorias(categoriasData.data || []);
        }
      } else {
        setError('Erro ao carregar projeto');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      setError('Erro ao carregar projeto');
      setIsLoading(false);
    }
  };

  const fetchComentarios = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/comentarios/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setComentarios(data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const handleVotar = async () => {
    if (votando) return;
    
    setVotando(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/votar/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Atualizar o número de votos localmente
        setProjeto(prev => ({
          ...prev,
          votos: data.data.action === 'added' ? (prev.votos + 1) : (prev.votos - 1)
        }));
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    } finally {
      setVotando(false);
    }
  };

  const handleComentarioSubmit = async (e) => {
    e.preventDefault();
    
    if (!novoComentario.trim()) return;
    
    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projetos-api/comentarios/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ conteudo: novoComentario }),
      });
      
      if (response.ok) {
        setNovoComentario('');
        fetchComentarios();
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isLoading) {
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

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/">
          <a className="text-blue-600 hover:underline">Voltar para a página inicial</a>
        </Link>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Projeto não encontrado</h2>
          <Link href="/">
            <a className="text-blue-600 hover:underline">Voltar para a página inicial</a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{projeto.titulo}</h1>
            <div className="text-gray-600 mb-2">
              Proposto por {projeto.autor_nome} • {new Date(projeto.data_criacao).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {projeto.status}
              </span>
              {categorias.map(categoria => (
                <span key={categoria.id} className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ml-2">
                  {categoria.nome}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              onClick={handleVotar}
              disabled={votando}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              <span>{projeto.votos} votos</span>
            </button>
            {(user.id === projeto.autor_id || user.perfil === 'administrador' || user.perfil === 'moderador') && (
              <Link href={`/projetos/editar/${id}`}>
                <a className="ml-4 text-gray-600 hover:text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </a>
              </Link>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Descrição</h2>
            <p className="text-gray-700 whitespace-pre-line">{projeto.descricao || 'Nenhuma descrição fornecida.'}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Objetivo</h2>
            <p className="text-gray-700 whitespace-pre-line">{projeto.objetivo || 'Nenhum objetivo fornecido.'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Público-alvo</h2>
            <p className="text-gray-700">{projeto.publico_alvo || 'Não especificado.'}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Recursos Necessários</h2>
            <p className="text-gray-700 whitespace-pre-line">{projeto.recursos_necessarios || 'Não especificado.'}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Prazo Estimado</h2>
            <p className="text-gray-700">{projeto.prazo_estimado || 'Não especificado.'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Benefícios</h2>
          <p className="text-gray-700 whitespace-pre-line">{projeto.beneficios || 'Nenhum benefício especificado.'}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold mb-4">Comentários ({comentarios.length})</h2>
        
        <form onSubmit={handleComentarioSubmit} className="mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comentario">
              Adicionar comentário
            </label>
            <textarea
              id="comentario"
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              required
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar Comentário'}
          </button>
        </form>
        
        {comentarios.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        ) : (
          <div className="space-y-4">
            {comentarios.map(comentario => (
              <div key={comentario.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{comentario.autor_nome}</div>
                  <div className="text-sm text-gray-500">{new Date(comentario.data_criacao).toLocaleString()}</div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{comentario.conteudo}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}