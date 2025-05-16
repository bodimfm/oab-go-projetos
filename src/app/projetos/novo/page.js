'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import ComissaoAutocomplete from '@/components/ComissaoAutocomplete';

export default function NovoProjeto() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    objetivos: '',
    resultados_esperados: '',
    publico_alvo: '',
    data_inicio: '',
    data_fim_prevista: '',
    status: 'planejamento',
    comissoes: [],
    tags: ''
  });
  
  const [comissoes, setComissoes] = useState([]);
  const [comissoesSelecionadas, setComissoesSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingComissoes, setLoadingComissoes] = useState(true);
  const [erro, setErro] = useState(null);
  
  useEffect(() => {
    const carregarComissoes = async () => {
      try {
        setLoadingComissoes(true);
        const { data } = await api.getComissoes();
        setComissoes(data);
      } catch (error) {
        console.error('Erro ao carregar comissões:', error);
        setErro('Não foi possível carregar as comissões. Tente novamente mais tarde.');
      } finally {
        setLoadingComissoes(false);
      }
    };
    
    carregarComissoes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleComissaoSelect = (comissaoSelecionada) => {
    if (!comissaoSelecionada || !comissaoSelecionada.id || !comissaoSelecionada.nome) {
      console.error('Comissão selecionada inválida:', comissaoSelecionada);
      return;
    }
    
    // Verificar se a comissão já está selecionada
    if (comissoesSelecionadas && Array.isArray(comissoesSelecionadas) && 
        comissoesSelecionadas.some(c => c.comissao_id === comissaoSelecionada.id)) {
      alert('Esta comissão já foi adicionada ao projeto.');
      return;
    }
    
    // Inicializar o array se não existir
    const comissoesAtualizadas = Array.isArray(comissoesSelecionadas) 
      ? [...comissoesSelecionadas] 
      : [];
    
    comissoesAtualizadas.push({
      comissao_id: comissaoSelecionada.id,
      nome: comissaoSelecionada.nome,
      papel_comissao: 'participante'
    });
    
    setComissoesSelecionadas(comissoesAtualizadas);
  };
  
  const handlePapelChange = (comissaoId, papel) => {
    if (!comissoesSelecionadas || !Array.isArray(comissoesSelecionadas)) {
      console.error('Lista de comissões selecionadas não disponível');
      return;
    }
    
    setComissoesSelecionadas(comissoesSelecionadas.map(c => 
      c.comissao_id === comissaoId ? { ...c, papel_comissao: papel } : c
    ));
  };
  
  const removerComissao = (comissaoId) => {
    if (!comissoesSelecionadas || !Array.isArray(comissoesSelecionadas)) {
      console.error('Lista de comissões selecionadas não disponível');
      return;
    }
    
    setComissoesSelecionadas(comissoesSelecionadas.filter(c => c.comissao_id !== comissaoId));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }
    
    if (!comissoesSelecionadas || !Array.isArray(comissoesSelecionadas) || comissoesSelecionadas.length === 0) {
      alert('Selecione pelo menos uma comissão para o projeto.');
      return;
    }
    
    // Verificar formato das comissões
    const comissoesValidas = comissoesSelecionadas.filter(c => 
      c && c.comissao_id && typeof c.comissao_id === 'string' && c.papel_comissao
    );
    
    if (comissoesValidas.length === 0) {
      alert('Nenhuma comissão válida selecionada. Adicione pelo menos uma comissão.');
      return;
    }
    
    // Adicionar logs para depuração
    console.log('Comissões selecionadas:', comissoesSelecionadas);
    console.log('Comissões válidas:', comissoesValidas);
    
    // Processar tags
    const tags = formData.tags
      ? formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '')
      : [];
    
    try {
      setLoading(true);
      setErro(null);
      
      // Criar objeto de dados com formato adequado para a API
      const projetoData = {
        ...formData,
        comissoes: comissoesValidas.map(c => ({
          comissao_id: c.comissao_id,
          papel_comissao: c.papel_comissao
        })),
        tags
      };
      
      console.log('Enviando dados do projeto:', projetoData);
      
      const response = await api.criarProjeto(projetoData);
      
      console.log('Resposta da API:', response);
      
      alert('Projeto criado com sucesso!');
      router.push('/projetos');
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setErro(error.message || 'Ocorreu um erro ao criar o projeto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/projetos"
          className="flex items-center text-oab-red hover:text-oab-burgundy mb-2 inline-block"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Projetos
        </Link>
        <h1 className="text-3xl font-bold text-oab-gray-800 mb-2">Novo Projeto</h1>
        <p className="text-oab-gray-600 mt-1">
          Preencha o formulário abaixo para criar um novo projeto
        </p>
      </div>
      
      {erro && (
        <div className="bg-red-50 border-l-4 border-oab-red text-red-700 p-4 mb-6" role="alert">
          <p>{erro}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="nome" className="form-label">
              Nome do Projeto *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="descricao" className="form-label">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows="3"
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="objetivos" className="form-label">
              Objetivos
            </label>
            <textarea
              id="objetivos"
              name="objetivos"
              value={formData.objetivos}
              onChange={handleChange}
              rows="3"
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="resultados_esperados" className="form-label">
              Resultados Esperados
            </label>
            <textarea
              id="resultados_esperados"
              name="resultados_esperados"
              value={formData.resultados_esperados}
              onChange={handleChange}
              rows="3"
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="publico_alvo" className="form-label">
              Público Alvo
            </label>
            <input
              type="text"
              id="publico_alvo"
              name="publico_alvo"
              value={formData.publico_alvo}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="form-label">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="planejamento">Planejamento</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="data_inicio" className="form-label">
              Data de Início
            </label>
            <input
              type="date"
              id="data_inicio"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="data_fim_prevista" className="form-label">
              Data de Conclusão Prevista
            </label>
            <input
              type="date"
              id="data_fim_prevista"
              name="data_fim_prevista"
              value={formData.data_fim_prevista}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label htmlFor="tags" className="form-label">
              Tags (separadas por vírgula)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ex: direito digital, educação, evento"
              className="form-input"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-oab-gray-800 mb-4 border-b border-gray-200 pb-2">Comissões Participantes *</h2>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <ComissaoAutocomplete
                comissoes={comissoes}
                onComissaoSelect={handleComissaoSelect}
                disabled={loadingComissoes}
                placeholder="Digite para buscar uma comissão..."
              />
              {loadingComissoes && (
                <p className="text-sm text-oab-gray-500 mt-1">Carregando comissões...</p>
              )}
            </div>
          </div>
          
          {comissoesSelecionadas.length > 0 ? (
            <div className="mt-4">
              <ul className="border rounded-md divide-y">
                {comissoesSelecionadas && comissoesSelecionadas.map((comissao) => (
                  <li key={comissao.comissao_id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-oab-gray-50">
                    <div className="font-medium text-oab-gray-800">{comissao.nome}</div>
                    <div className="flex items-center space-x-4 mt-2 md:mt-0">
                      <div>
                        <select
                          value={comissao.papel_comissao}
                          onChange={(e) => handlePapelChange(comissao.comissao_id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-oab-red"
                        >
                          <option value="lider">Líder</option>
                          <option value="participante">Participante</option>
                          <option value="consultivo">Consultivo</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerComissao(comissao.comissao_id)}
                        className="text-oab-red hover:text-oab-burgundy"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-oab-gray-500 mt-4 bg-oab-gray-50 p-4 border rounded-md">Nenhuma comissão selecionada</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6 mt-6">
          <Link
            href="/projetos"
            className="btn-secondary"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form>
    </div>
  );
}