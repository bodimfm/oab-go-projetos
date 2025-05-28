const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1` 
  : 'https://qnsbjljmnflihwcovuwz.supabase.co/rest/v1';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuc2JqbGptbmZsaWh3Y292dXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjcyNjQsImV4cCI6MjA2MjU0MzI2NH0.UWGXOyL8J7e11W_CE3zIo5bn-5LwKQ1YtAS1V72DTtk';

// Headers padrão para todas as requisições
const defaultHeaders = {
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY,
  'Content-Type': 'application/json'
};

export const api = {
  // Listar comissões
  getComissoes: async () => {
    const response = await fetch(`${API_URL}/comissoes?select=*&order=nome`, {
      headers: defaultHeaders
    });
    if (!response.ok) throw new Error('Erro ao carregar comissões');
    const data = await response.json();
    return { data };
  },

  // Listar projetos
  getProjetos: async () => {
    const response = await fetch(`${API_URL}/view_projetos_comissoes?select=*`, {
      headers: defaultHeaders
    });
    if (!response.ok) throw new Error('Erro ao carregar projetos');
    
    // Processar os dados da mesma forma que a função edge fazia
    const data = await response.json();
    
    // Agrupar resultados por projeto
    const projetos = {};
    data.forEach(item => {
      if (!projetos[item.projeto_id]) {
        projetos[item.projeto_id] = {
          id: item.projeto_id,
          nome: item.projeto_nome,
          descricao: item.projeto_descricao,
          status: item.projeto_status,
          objetivos: item.objetivos,
          publico_alvo: item.publico_alvo,
          data_inicio: item.data_inicio,
          data_fim_prevista: item.data_fim_prevista,
          comissoes: []
        };
      }
      
      // Só adicionar comissão se ela existir
      if (item.comissao_id) {
        projetos[item.projeto_id].comissoes.push({
          id: item.comissao_id,
          nome: item.comissao_nome,
          descricao: item.comissao_descricao,
          papel: item.papel_comissao
        });
      }
    });
    
    return { data: Object.values(projetos) };
  },

  // Obter projeto por ID
  getProjeto: async (id) => {
    // Buscar dados do projeto
    const responseProjeto = await fetch(`${API_URL}/projetos?id=eq.${id}&select=*`, {
      headers: defaultHeaders
    });
    if (!responseProjeto.ok) throw new Error('Erro ao carregar detalhes do projeto');
    const projetoData = await responseProjeto.json();
    
    if (projetoData.length === 0) {
      throw new Error('Projeto não encontrado');
    }
    
    // Buscar comissões relacionadas
    const responseComissoes = await fetch(
      `${API_URL}/projetos_comissoes?projeto_id=eq.${id}&select=papel_comissao,comissoes:comissoes(id,nome,descricao,area_atuacao)`, {
      headers: defaultHeaders
    });
    if (!responseComissoes.ok) throw new Error('Erro ao carregar comissões do projeto');
    const comissoesData = await responseComissoes.json();
    
    // Buscar tags do projeto
    const responseTags = await fetch(`${API_URL}/tags_projetos?projeto_id=eq.${id}&select=tag`, {
      headers: defaultHeaders
    });
    if (!responseTags.ok) throw new Error('Erro ao carregar tags do projeto');
    const tagsData = await responseTags.json();
    
    // Formatar resposta
    const projeto = {
      ...projetoData[0],
      comissoes: comissoesData.map(item => ({
        papel: item.papel_comissao,
        ...item.comissoes
      })),
      tags: tagsData.map(item => item.tag)
    };
    
    return { data: projeto };
  },

  // Sugerir integrações de projetos
  getSugestoesIntegracao: async (projetoId) => {
    const response = await fetch(`${API_URL}/rpc/sugerir_integracao_projetos`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ projeto_id: projetoId })
    });
    if (!response.ok) throw new Error('Erro ao carregar sugestões de integração');
    const data = await response.json();
    return { data };
  },

  // Listar membros de comissões
  getMembros: async (comissaoId = null) => {
    let url = `${API_URL}/view_membros_comissoes?select=*`;
    if (comissaoId) {
      url += `&comissao_id=eq.${comissaoId}`;
    }
    url += '&order=comissao_nome,membro_nome';
    
    const response = await fetch(url, {
      headers: defaultHeaders
    });
    if (!response.ok) throw new Error('Erro ao carregar membros');
    const data = await response.json();
    return { data };
  },

  // Buscar projetos e comissões
  buscar: async (termo) => {
    const response = await fetch(`${API_URL}/rpc/buscar_projetos_e_comissoes`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ termo })
    });
    if (!response.ok) throw new Error('Erro ao realizar busca');
    const data = await response.json();
    return { data };
  },

  // Gerar sugestão de projeto usando modelo generativo
  gerarSugestaoProjeto: async (ideia) => {
    const response = await fetch('/api/ideia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideia })
    });
    if (!response.ok) throw new Error('Erro ao gerar sugestão');
    const data = await response.json();
    return { data: data.data };
  },

  // Criar novo projeto
  criarProjeto: async (projeto) => {
    // Extrair dados do projeto e comissões relacionadas
    const { nome, descricao, objetivos, resultados_esperados, publico_alvo, 
           data_inicio, data_fim_prevista, status, comissoes, tags } = projeto;
    
    console.log('Dados para criar projeto:', { 
      nome, status, 
      comissoes: comissoes ? JSON.stringify(comissoes) : 'undefined',
      comissoesCount: comissoes ? comissoes.length : 0
    });
    
    // Validar campos obrigatórios
    if (!nome || !status || !comissoes || comissoes.length === 0) {
      throw new Error('Campos obrigatórios: nome, status e pelo menos uma comissão');
    }
    
    // Criar projeto
    const responseProjeto = await fetch(`${API_URL}/projetos`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nome,
        descricao,
        objetivos,
        resultados_esperados,
        publico_alvo,
        data_inicio,
        data_fim_prevista,
        status
      })
    });
    
    if (!responseProjeto.ok) {
      const errorData = await responseProjeto.json();
      throw new Error(errorData.message || 'Erro ao criar projeto');
    }
    
    const projetoData = await responseProjeto.json();
    const projeto_id = projetoData[0].id;
    
    console.log('Projeto criado com ID:', projeto_id);
    
    // Relacionar com comissões
    const projetoComissoes = comissoes.map(c => ({
      projeto_id,
      comissao_id: c.comissao_id,
      papel_comissao: c.papel_comissao || 'participante'
    }));
    
    console.log('Comissões para vincular:', JSON.stringify(projetoComissoes));
    
    let comissoesVinculadas = 0;
    // Modificado: enviar dados da relação projeto-comissão um por um com melhor tratamento de erros
    for (const comissaoRelacao of projetoComissoes) {
      try {
        // Verificar se o ID da comissão está no formato correto (UUID)
        if (!comissaoRelacao.comissao_id || typeof comissaoRelacao.comissao_id !== 'string' || 
            !comissaoRelacao.comissao_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          console.error(`ID de comissão inválido: ${comissaoRelacao.comissao_id}`);
          continue; // Pula esta comissão em vez de falhar todo o processo
        }
        
        console.log(`Tentando vincular comissão: ${comissaoRelacao.comissao_id}`);
        
        const responseComissao = await fetch(`${API_URL}/projetos_comissoes`, {
          method: 'POST',
          headers: {
            ...defaultHeaders,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            projeto_id: projeto_id,
            comissao_id: comissaoRelacao.comissao_id,
            papel_comissao: comissaoRelacao.papel_comissao || 'participante'
          })
        });
        
        if (!responseComissao.ok) {
          const errorResponse = await responseComissao.text();
          console.error(`Erro ao vincular comissão (${comissaoRelacao.comissao_id}): `, errorResponse);
          
          // Tentar recuperar detalhes do erro para melhor diagnóstico
          try {
            const errorJson = JSON.parse(errorResponse);
            console.error('Detalhes do erro:', errorJson);
          } catch (e) {
            // Ignorar erro de parsing
          }
          
          // Continuar com as outras comissões em vez de interromper o processo
          continue;
        }
        
        const comissaoData = await responseComissao.json();
        console.log(`Comissão vinculada com sucesso: ${comissaoRelacao.comissao_id}`, comissaoData);
        comissoesVinculadas++;
      } catch (error) {
        console.error(`Erro ao processar comissão (${comissaoRelacao.comissao_id}): `, error);
        // Continuar com as outras comissões
        continue;
      }
    }
    
    console.log(`Processo concluído: ${comissoesVinculadas} de ${projetoComissoes.length} comissões vinculadas`);
    
    // Adicionar tags, se houver
    if (tags && tags.length > 0) {
      // Modificado: enviar tags uma a uma para evitar erros de inserção em lote
      for (const tag of tags) {
        try {
          if (!tag || typeof tag !== 'string') {
            console.error(`Tag inválida: ${tag}`);
            continue;
          }
          
          const responseTag = await fetch(`${API_URL}/tags_projetos`, {
            method: 'POST',
            headers: {
              ...defaultHeaders,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              projeto_id,
              tag
            })
          });
          
          if (!responseTag.ok) {
            const errorResponse = await responseTag.text();
            console.error(`Erro ao adicionar tag (${tag}): `, errorResponse);
            continue;
          }
        } catch (error) {
          console.error(`Erro ao processar tag (${tag}): `, error);
          continue;
        }
      }
    }
    
    // Realizar uma verificação final para garantir que pelo menos uma comissão foi vinculada
    if (comissoesVinculadas === 0 && projetoComissoes.length > 0) {
      console.warn(`Atenção: Projeto ${projeto_id} criado sem nenhuma comissão vinculada`);
    }
    
    return { data: projetoData[0] };
  },

  // Adicionar novo membro
  adicionarMembro: async (membro) => {
    const { comissao_id, nome, cargo, email, telefone, inscricao_oab } = membro;
    
    // Validar campos obrigatórios
    if (!comissao_id || !nome) {
      throw new Error('Campos obrigatórios: comissao_id e nome');
    }
    
    const response = await fetch(`${API_URL}/membros_comissoes`, {
      method: 'POST',
      headers: {
        ...defaultHeaders,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        comissao_id,
        nome,
        cargo,
        email,
        telefone,
        inscricao_oab
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao adicionar membro');
    }
    
    const data = await response.json();
    return { data: data[0] };
  },

  // Funções de autenticação
  auth: {
    // Login com nome da comissão e senha
    login: async (username, password) => {
      const response = await fetch(`${API_URL}/usuarios?nome_usuario=eq.${encodeURIComponent(username)}`, {
        headers: defaultHeaders
      });
      
      if (!response.ok) throw new Error('Erro ao verificar credenciais');
      
      const users = await response.json();
      if (users.length === 0) throw new Error('Usuário não encontrado');
      
      const user = users[0];
      
      // Senha padrão para primeiro login
      if (user.primeiro_acesso && password === 'OABGONEXT') {
        return { 
          data: { 
            ...user,
            require_password_change: true 
          }
        };
      }
      
      // Senha já foi alterada, verificar
      if (!user.primeiro_acesso) {
        // Aqui em um sistema real fariamos hash da senha, mas para simplificar
        // estamos comparando diretamente neste exemplo
        if (user.senha !== password) throw new Error('Senha incorreta');
        
        return { data: user };
      }
      
      throw new Error('Credenciais inválidas');
    },
    
    // Alterar senha (primeiro acesso ou recuperação)
    alterarSenha: async (usuarioId, novaSenha) => {
      const response = await fetch(`${API_URL}/usuarios?id=eq.${usuarioId}`, {
        method: 'PATCH',
        headers: {
          ...defaultHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          senha: novaSenha,
          primeiro_acesso: false,
          updated_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Erro ao alterar senha');
      
      const data = await response.json();
      return { data: data[0] };
    },
    
    // Solicitar recuperação de senha
    solicitarRecuperacao: async (email) => {
      // Verificar se o email existe
      const response = await fetch(`${API_URL}/usuarios?email=eq.${encodeURIComponent(email)}`, {
        headers: defaultHeaders
      });
      
      if (!response.ok) throw new Error('Erro ao verificar email');
      
      const users = await response.json();
      if (users.length === 0) throw new Error('Email não encontrado');
      
      // Gerar token de recuperação e atualizar usuário
      const recuperacaoToken = Math.random().toString(36).substring(2, 15);
      const tokenExpira = new Date();
      tokenExpira.setHours(tokenExpira.getHours() + 24); // Token válido por 24h
      
      const updateResponse = await fetch(`${API_URL}/usuarios?id=eq.${users[0].id}`, {
        method: 'PATCH',
        headers: {
          ...defaultHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          token_recuperacao: recuperacaoToken,
          token_expira: tokenExpira.toISOString(),
          primeiro_acesso: true
        })
      });
      
      if (!updateResponse.ok) throw new Error('Erro ao gerar token de recuperação');
      
      // Em um sistema real, enviaríamos um email com o link de recuperação
      // Aqui apenas retornamos o token para fins de demonstração
      return { 
        data: { 
          token: recuperacaoToken,
          message: 'Um link de recuperação foi enviado para seu email' 
        } 
      };
    },
    
    // Verificar token de recuperação
    verificarToken: async (token) => {
      const response = await fetch(`${API_URL}/usuarios?token_recuperacao=eq.${token}`, {
        headers: defaultHeaders
      });
      
      if (!response.ok) throw new Error('Erro ao verificar token');
      
      const users = await response.json();
      if (users.length === 0) throw new Error('Token inválido');
      
      const user = users[0];
      
      // Verificar se o token não expirou
      if (new Date(user.token_expira) < new Date()) {
        throw new Error('Token expirado');
      }
      
      return { data: user };
    },
    
    // Cadastrar novo usuário (vínculo com comissão)
    cadastrarUsuario: async (userData) => {
      // Verificar se já existe um usuário para esta comissão
      const checkResponse = await fetch(`${API_URL}/usuarios?comissao_id=eq.${userData.comissao_id}`, {
        headers: defaultHeaders
      });
      
      if (!checkResponse.ok) throw new Error('Erro ao verificar comissão');
      
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) throw new Error('Esta comissão já possui um usuário vinculado');
      
      // Obter o nome da comissão para usar como nome de usuário
      const comissaoResponse = await fetch(`${API_URL}/comissoes?id=eq.${userData.comissao_id}&select=nome`, {
        headers: defaultHeaders
      });
      
      if (!comissaoResponse.ok) throw new Error('Erro ao obter dados da comissão');
      
      const comissoes = await comissaoResponse.json();
      if (comissoes.length === 0) throw new Error('Comissão não encontrada');
      
      // Transformar nome da comissão em um nome de usuário (sem espaços, acentos, etc)
      const nomeUsuario = comissoes[0].nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '')
        .toLowerCase();
      
      // Criar o usuário
      const createResponse = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nome_usuario: nomeUsuario,
          nome_completo: userData.nome_completo,
          email: userData.email,
          comissao_id: userData.comissao_id,
          senha: 'OABGONEXT', // Senha padrão
          primeiro_acesso: true,
          created_at: new Date().toISOString()
        })
      });
      
      if (!createResponse.ok) throw new Error('Erro ao cadastrar usuário');
      
      const data = await createResponse.json();
      return { 
        data: data[0],
        message: `Usuário criado com sucesso! Nome de usuário: ${nomeUsuario}` 
      };
    }
  }
};