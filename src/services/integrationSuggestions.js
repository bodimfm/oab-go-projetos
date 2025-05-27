import { supabase } from './supabaseClient';

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
      .rpc('get_suggestion_stats_by_type');
    
    // Busca contagem por nível de complexidade
    const { data: complexityStats, error: complexityError } = await supabase
      .rpc('get_suggestion_stats_by_complexity');
    
    if (typeError || complexityError) {
      console.error('Erro ao buscar estatísticas:', typeError || complexityError);
      throw typeError || complexityError;
    }
    
    return {
      byType: typeStats || [],
      byComplexity: complexityStats || []
    };
  }
}; 